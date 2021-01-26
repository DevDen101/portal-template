import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  AuthenticationService,
  AuthHolderService,
  LoginRequest,
  LoginResponse,
  NativeLoginService,
  SellerSignin,
} from 'oc-ng-common-service';
import {Router} from '@angular/router';
import {filter, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {OAuthService} from 'angular-oauth2-oidc';
import {JwksValidationHandler} from 'angular-oauth2-oidc-jwks';
import {ToastrService} from 'ngx-toastr';
import {LoadingBarState} from '@ngx-loading-bar/core/loading-bar.state';
import {LoadingBarService} from '@ngx-loading-bar/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {

  companyLogoUrl = './assets/img/logo-company.png';
  signupUrl = '/signup';
  forgotPwdUrl = '/forgot-password';
  signIn = new SellerSignin();
  inProcess = false;
  isLoading = false;

  loginType: string;

  private destroy$: Subject<void> = new Subject();
  private loader: LoadingBarState;

  constructor(public loadingBar: LoadingBarService,
              private router: Router,
              private authHolderService: AuthHolderService,
              private oauthService: OAuthService,
              private openIdAuthService: AuthenticationService,
              private nativeLoginService: NativeLoginService,
              private toastService: ToastrService) {
  }

    ngOnInit(): void {
      this.loader = this.loadingBar.useRef();
      if (this.authHolderService.isLoggedInUser()) {
            this.router.navigate(['app/manage']);
      }

      if (this.oauthService.hasValidIdToken()) {
        this.oauthService.logOut();
      }

      this.loader.start();

      this.openIdAuthService.getAuthConfig()
        .pipe(
          takeUntil(this.destroy$),
          filter(value => value))
        .subscribe((authConfig) => {
            this.loginType = authConfig.type;

            this.oauthService.configure({
                  ...authConfig,
                  redirectUri: authConfig.redirectUri || window.location.href,
              });

            this.oauthService.tokenValidationHandler = new JwksValidationHandler();
            this.oauthService.loadDiscoveryDocumentAndLogin({
                  onTokenReceived: receivedTokens => {
                      this.loader.start();
                      this.openIdAuthService.login(new LoginRequest(receivedTokens.idToken, receivedTokens.accessToken))
                        .pipe(takeUntil(this.destroy$))
                        .subscribe((response: LoginResponse) => {
                            this.processLoginResponse(response);
                            this.loader.complete();
                        });
                  },
              }).then(() => {
              this.loader.complete();
              });
          }, err => {},
          () => this.loader.complete());
    }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login(event) {
    if (event === true) {
      this.inProcess = true;
      this.nativeLoginService.signIn(this.signIn)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: LoginResponse) => {
            this.processLoginResponse(response);
            this.inProcess = false;
          },
          () => this.inProcess = false);
    }
  }

    private processLoginResponse(response: LoginResponse) {
        this.authHolderService.persist(response.accessToken, response.refreshToken);
        this.router.navigate(['app/manage']);
    }

    sendActivationEmail(email: string) {
        this.nativeLoginService.sendActivationCode(email)
          .pipe(takeUntil(this.destroy$))
          .subscribe(value => {
              this.toastService.success('Activation email was sent to your inbox!');
          });
    }
}