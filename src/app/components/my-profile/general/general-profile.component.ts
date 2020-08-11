import { Component, OnInit, Input } from '@angular/core';
import { SellerMyProfile, SellerService, CommonService } from 'oc-ng-common-service'
import { NotificationService } from 'src/app/shared/custom-components/notification/notification.service';

@Component({
  selector: 'app-general-profile',
  templateUrl: './general-profile.component.html',
  styleUrls: ['./general-profile.component.scss']
})
export class GeneralProfileComponent implements OnInit {

  @Input() myProfile : SellerMyProfile = new SellerMyProfile();
  developerDetails;
  @Input() isProcessing = true;
  isSaveInProcess=false;
  constructor(private sellerService: SellerService,
    private commonService: CommonService,
    private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.getMyProfileDetails();
  }
  
  getMyProfileDetails(){
    this.sellerService.getUserProfileDetails('true').subscribe((res)=>{
      this.myProfile=res;
      this.developerDetails= this.myProfile?.developerAccount;
    },(err)=>{
      this.isProcessing=false;
    },()=>{
      this.isProcessing=false;
    })
  }


  saveGeneralProfile(myProfileform){
    if (!myProfileform.valid) {
      myProfileform.control.markAllAsTouched();
      try {
        this.commonService.scrollToFormInvalidField({ form: myProfileform, adjustSize: 60 });
      } catch (error) {
        this.notificationService.showError([{ "message": "Please fill all required fields." }]);
      }
      return;
    }
    this.isSaveInProcess=true;
    this.sellerService.updateProfileDetails(this.myProfile).subscribe((res)=>{

    },(err)=>{
      this.isSaveInProcess=false;
    },()=>{
      this.isSaveInProcess=false;
    });
  }
}
