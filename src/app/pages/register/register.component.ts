import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm = new FormGroup({
    first_name: new FormControl('', Validators.required),
    last_name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    gender: new FormControl('', Validators.required),
  });
  loading = false;

  constructor(private readonly restService: RestService) { }

  ngOnInit() {
  }

  register() {
    this.loading = true;
    this.restService.signup(this.registerForm.value).subscribe(() => {
      this.loading = false;
      alert('Please check your email to confirm your email id');
    }, (error) => {
      this.loading = false;
      alert(error);
    })
  }

}
