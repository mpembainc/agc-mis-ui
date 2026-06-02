import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SwalService } from '@shared/services/swal.service';
import { AuthService } from '../services/auth.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink],
})
export class LoginComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private swalService = inject(SwalService);

  form: FormGroup = new FormGroup({});
  loading: boolean = false;
  showPassword: boolean = false;
  currentYear = new Date().getFullYear();

  slides = [
    {
      title: 'Fighting Financial Crime',
      image: '/images/ML.jpg',
      subtitle: 'Tanzania\'s primary authority for combating Money Laundering, Terrorist Financing, and Proliferation Financing.',
    },
    {
      title: 'Intelligence-Led Enforcement',
      image: '/images/FIU-1.jpg',
      subtitle: 'A centralized platform for collecting, analyzing, and reporting financial intelligence across Tanzania.',
    },
    {
      title: 'Securing the Financial System',
      image: '/images/FIU-2.jpg',
      subtitle: 'Protecting the integrity of Tanzania\'s financial sector through transparency, accountability, and data-driven action.',
    },
  ];

  currentSlideIndex = 0;
  private slideInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.form = new FormGroup({
      username: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    this.startSlideshow();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  private startSlideshow(): void {
    this.slideInterval = setInterval(() => {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
    }, 5000);
  }

  onLogin(): void {
    if (this.form.valid) {
      this.loading = true;
      const formData = new FormData();
      formData.append('username', this.form.value.username);
      formData.append('password', this.form.value.password);

      this.authService.login();
    }
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
