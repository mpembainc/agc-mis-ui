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
      title: "Attorney-General's Chambers",
      image: "images/slide-1.jpg",
      subtitle: "Advocating for justice, legal integrity, and the rule of law in Zanzibar.",
    },
    {
      title: "Legal Advisory & Drafting",
      image: "images/slide-2.jpg",
      subtitle: "Providing high-quality legislative drafting and legal counsel to government institutions.",
    },
    {
      title: "Securing Zanzibar's Legal Framework",
      image: "images/slide-3.jpg",
      subtitle: "Upholding constitutional values and protecting public interests through litigation and advocacy.",
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
  }

  ngOnDestroy(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  private startSlideshow(): void {
    // Auto slideshow disabled by request
  }

  onLogin(): void {
    if (this.form.valid) {
      this.loading = true;
      const credentials = {
        email: this.form.value.username,
        password: this.form.value.password,
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          this.loading = false;
        },
        error: (err: any) => {
          this.loading = false;

          const status = err?.status;
          const message = err?.error?.message || err?.message || 'Incorrect Credentials ⚠️';

          if (status === 423) {
            this.swalService.error(`🔒 ${message}`).then();
          } else if (status === 403) {
            this.swalService.error(`🚫 ${message}`).then();
          } else if (status === 401) {
            this.swalService.error('Incorrect Credentials ⚠️').then();
          } else {
            this.swalService.error(message).then();
          }
        },
      });
    }
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
