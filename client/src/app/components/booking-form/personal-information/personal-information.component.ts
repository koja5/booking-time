import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CallApiService } from 'src/app/services/call-api.service';
import { HelpService } from 'src/app/services/help.service';
import { ToastrCustomComponent } from '../../common/toastr-custom/toastr-custom.component';
import { StaticApiService } from 'src/app/services/static-api.service';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss'],
})
export class PersonalInformationComponent {
  @Output() public changeStep = new EventEmitter();
  public data!: FormGroup;
  public checkmark = false;
  public submit = false;
  public language: any;
  public loader = false;

  constructor(
    private fb: FormBuilder,
    private service: CallApiService,
    private helpService: HelpService,
    private toastr: ToastrCustomComponent,
    private staticApi: StaticApiService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.initializeForm();
    this.checkPersonalInformation();
  }

  goPrevious() {
    this.changeStep.emit(
      Number(this.helpService.getSessionStorage('step')) - 1
    );
  }

  goNext() {
    this.submit = true;
    if (this.data.valid) {
      this.helpService.setSessionStorage(
        'personal',
        this.helpService.encrypt(this.data.value)
      );
      this.staticApi.checkTermineStillAvailable().subscribe((data: any) => {
        if (data.length) {
          this.helpService.appointmentIsNotStillAvailable(
            this.toastr,
            this.language
          );
        } else {
          this.changeStep.emit(
            Number(this.helpService.getSessionStorage('step')) + 1
          );
        }
      });
    } else {
      this.toastr.showErrorCustom(
        this.language.personalNeedToFillAllRequiredFieldsPopup
      );
    }
  }

  initializeForm() {
    this.data = this.fb.group({
      id: [null],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      firstname: [''],
      lastname: [''],
      birthday: [''],
      pay_in_clinic: [0],
      force_pay_in_clinic: [0],
    });
  }

  checkPersonalInformation() {
    let storage = this.helpService.getSessionStorage('personal');
    if (storage) {
      storage = JSON.parse(this.helpService.decrypt(storage));
      this.data = this.fb.group({
        id: [storage.id],
        email: [storage.email, [Validators.required, Validators.email]],
        phone: [storage.phone, Validators.required],
        firstname: [storage.firstname],
        lastname: [storage.lastname],
        birthday: [storage.birthday],
        pay_in_clinic: [storage.pay_in_clinic],
        force_pay_in_clinic: [storage.force_pay_in_clinic],
      });
    }
  }

  checkUser() {
    this.loader = true;
    let inputData = null;
    if (this.dataControl.email.value) {
      inputData = this.dataControl.email.value;
    }
    if (this.dataControl.phone.value && !this.dataControl.email.value) {
      inputData = this.dataControl.phone.value;
    }
    this.service.callGetMethod('/api/checkUser', inputData).subscribe(
      (data: any) => {
        if (data && data.length > 0) {
          if (!this.data.controls.id) {
            this.data.addControl('id', new FormControl(data[0].id));
          } else {
            this.data.controls.id.setValue(data[0].id);
          }
          this.data.controls.email.setValue(data[0].email);
          this.data.controls.phone.setValue(data[0].mobile);
          this.data.controls.firstname.setValue(data[0].firstname);
          this.data.controls.lastname.setValue(data[0].lastname);
          this.data.controls.birthday.setValue(data[0].birthday);
          this.data.controls.pay_in_clinic.setValue(data[0].pay_in_clinic);
          this.data.controls.force_pay_in_clinic.setValue(
            data[0].force_pay_in_clinic
          );
          this.checkmark = true;
          this.toastr.showSuccessCustom(
            this.language.personalSuccessedFilledAllFields
          );
        } else {
          this.data.controls.pay_in_clinic.setValue(0);
          this.data.controls.force_pay_in_clinic.setValue(0);
          delete this.data.controls.id;
        }
        this.helpService.setSessionStorage(
          'personal',
          this.helpService.encrypt(this.data.value)
        );
        this.loader = false;
      },
      (error) => {
        this.loader = false;
      }
    );
  }

  get dataControl() {
    return this.data.controls;
  }
}
