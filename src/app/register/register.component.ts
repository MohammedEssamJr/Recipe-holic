import { Component, OnInit } from '@angular/core';
import { Validators, ValidatorFn, ValidationErrors, AbstractControl, NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import {switchMap } from 'rxjs';
import { AuthenticationService } from '../authentication.service';
import { HotToastService } from '@ngneat/hot-toast';
import {UsersService} from '../users.service';


export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsDontMatch: true };
    } else {
      return null;
    }
  };
}


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {

  signUpForm = this.fb.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator() }
  );

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private toast: HotToastService,
    private usersService: UsersService,
    private fb: NonNullableFormBuilder
  ) {}

  ngOnInit(): void {}

  get email() {
    return this.signUpForm.get('email');
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get confirmPassword() {
    return this.signUpForm.get('confirmPassword');
  }

  get name() {
    return this.signUpForm.get('name');
  }

  submit() {
    const { name, email, password } = this.signUpForm.value;

    if (!this.signUpForm.valid || !name || !password || !email) {
      return;
    }

    this.authService.signUp(email, password)
      .pipe(
        switchMap(({ user: { uid } }) =>
          this.usersService.addUser({ uid, email, displayName: name })
        ),
        this.toast.observe({
          loading: 'Signing up...',
          error: ({ message }) => `${message}`,
        })
      )
      .subscribe(() => {
        this.router.navigate(['/home']);
      });
  }
}
