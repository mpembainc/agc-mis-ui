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
      const formData = new FormData();
      formData.append('username', this.form.value.username);
      formData.append('password', this.form.value.password);

      this.authService.login(formData).subscribe({
        next: () => {
          this.loading = false;
        },
        error: (err: any) => {
          this.loading = false;

          if (err === 404) {
            this.swalService.error('Incorrect Credentials ⚠️').then();
          } else if (err === 423) {
            this.swalService.error('🔒 Account is locked for security reasons, please contact admin').then();
          } else {
            this.swalService.error('Incorrect Credentials ⚠️').then();
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
