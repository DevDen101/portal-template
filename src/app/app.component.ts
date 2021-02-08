import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {first, takeUntil} from 'rxjs/operators';
import {AuthenticationService, TitleService} from 'oc-ng-common-service';
import {Subject} from 'rxjs';
import {LoadingBarState} from '@ngx-loading-bar/core/loading-bar.state';
import {LoadingBarService} from '@ngx-loading-bar/core';
import { siteConfig } from '../assets/data/siteConfig';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private destroy$: Subject<void> = new Subject();
  private loader: LoadingBarState;

  constructor(private router: Router,
              private authApiService: AuthenticationService,
              private titleService: TitleService,
              public loadingBar: LoadingBarService) {

    this.loader = this.loadingBar.useRef();
  }

  ngOnInit() {
    this.titleService.siteConfig = siteConfig;
    // refresh JWT token if exists
    this.loader.start();
    this.authApiService.tryLoginByRefreshToken()
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.loader.stop(), () => this.loader.stop());

    // init csrf
    this.authApiService.initCsrf()
    .pipe(takeUntil(this.destroy$), first())
    .subscribe(() => {
    });
  }
}
