import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StateAttorneysService } from '../services/state-attorneys.service';
import { StateAttorney, Mda, Grade } from '../models/state-attorney.model';
import { SwalService } from '@shared/services/swal.service';

@Component({
  selector: 'app-attorney-view',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './attorney-view.component.html',
  styleUrls: ['./attorney-view.component.scss'],
})
export class AttorneyViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(StateAttorneysService);
  private swalService = inject(SwalService);

  attorney: StateAttorney | null = null;
  loading = false;
  activeTab = 'profile';

  mdas: Mda[] = [];
  grades: Grade[] = [];

  ngOnInit(): void {
    this.loadLookups();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAttorneyDetails(id);
    } else {
      this.router.navigate(['/state-attorneys']);
    }
  }

  loadLookups(): void {
    this.service.getMdas().subscribe({
      next: (res) => (this.mdas = res.data),
    });

    this.service.getGrades().subscribe({
      next: (res) => (this.grades = res.data),
    });
  }

  loadAttorneyDetails(id: string): void {
    this.loading = true;
    this.service.getAttorney(id).subscribe({
      next: (res) => {
        this.attorney = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.swalService.error('Failed to load State Attorney details.');
        this.router.navigate(['/state-attorneys']);
      },
    });
  }

  getMdaName(id?: string): string {
    if (!id) return '-';
    const mda = this.mdas.find((m) => m.id === id);
    return mda ? `${mda.code} - ${mda.name}` : '-';
  }

  getGradeName(id?: string): string {
    if (!id) return '-';
    const grade = this.grades.find((g) => g.id === id);
    return grade ? grade.grade_name : '-';
  }

  getFormattedDob(dob?: string): string {
    if (!dob) return '-';
    try {
      const date = new Date(dob);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dob;
    }
  }
}
