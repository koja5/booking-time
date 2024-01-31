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
import { ActivatedRoute } from '@angular/router';

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
  public isNew = false;
  public checkField: any;
  public requiredEmptyField = '';

  constructor(
    private fb: FormBuilder,
    private service: CallApiService,
    private helpService: HelpService,
    private toastr: ToastrCustomComponent,
    private staticApi: StaticApiService,
    private router: ActivatedRoute
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
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      birthday: ['', Validators.required],
      pay_in_clinic: [],
      force_pay_in_clinic: [],
    });
  }

  checkPersonalInformation() {
    let storage = this.helpService.getSessionStorage('personal');
    if (this.helpService.getSessionStorage('form-value')) {
      let formValue = JSON.parse(
        this.helpService.getSessionStorage('form-value')
      );
      this.checkField = formValue.check_field;
      this.isNew = formValue.is_new;
      this.requiredEmptyField = formValue.required_empty_field;
    }
    if (storage) {
      storage = JSON.parse(this.helpService.decrypt(storage));
      this.data = this.fb.group({
        id: [storage.id],
        email: [storage.email, [Validators.required, Validators.email]],
        phone: [storage.phone, Validators.required],
        firstname: [storage.firstname, Validators.required],
        lastname: [storage.lastname, Validators.required],
        birthday: [storage.birthday, Validators.required],
        pay_in_clinic: [storage.pay_in_clinic],
        force_pay_in_clinic: [storage.force_pay_in_clinic],
      });
    }
  }

  checkIfFieldEmailOrMobile(data: any) {
    this.requiredEmptyField = '';
    if (this.checkField) {
      if (this.checkField.indexOf('@') != -1) {
        this.data.controls.email.setValue(this.checkField);
        if (!data || !data.mobile) {
          this.requiredEmptyField = 'mobile';
        }
      } else {
        this.data.controls.phone.setValue(this.checkField);
        if (!data || !data.email) {
          this.requiredEmptyField = 'email';
        }
      }
    }
  }

  checkUser() {
    this.loader = true;
    this.isNew = false;
    this.service
      .callGetMethod(
        '/api/checkUser',
        this.checkField + '/' + this.router.snapshot.params.id
      )
      .subscribe(
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
            this.isNew = false;
            this.helpService.setSessionStorage(
              'personal',
              this.helpService.encrypt(this.data.value)
            );

            this.checkIfFieldEmailOrMobile(data[0]);

            if (data[0].email && data[0].mobile) {
              this.goNext();
            }
          } else {
            this.isNew = true;
            this.initializeForm();
            this.checkIfFieldEmailOrMobile(null);
            this.helpService.setSessionStorage(
              'personal',
              this.helpService.encrypt(this.data.value)
            );
          }

          this.loader = false;
          this.helpService.setSessionStorage('form-value', {
            is_new: this.isNew,
            check_field: this.checkField,
            required_empty_field: this.requiredEmptyField,
          });
        },
        (error) => {
          this.loader = false;
        }
      );
  }

  get dataControl() {
    return this.data.controls;
  }

  saveInLocalStorage() {
    this.helpService.setSessionStorage(
      'personal',
      this.helpService.encrypt(this.data.value)
    );
  }
}
