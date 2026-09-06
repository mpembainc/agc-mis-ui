import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  AttorneyAvailabilityInfo,
  AttorneyScheduleResponse,
  RosterAvailabilityResponse,
  WorkSchedule,
} from '../models/state-attorney.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class WorkSchedulesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/state-attorneys`;
  private readonly rosterUrl = `${environment.apiUrl}/state-attorneys-availability/roster`;

  /**
   * Get weekly schedule for a specific attorney and week.
   */
  getSchedule(attorneyId: string, weekStartDate?: string): Observable<ApiResponse<AttorneyScheduleResponse>> {
    let params = new HttpParams();
    if (weekStartDate) {
      params = params.set('week_start_date', weekStartDate);
    }
    return this.http.get<ApiResponse<AttorneyScheduleResponse>>(
      `${this.baseUrl}/${attorneyId}/schedules`,
      { params }
    );
  }

  /**
   * Save or submit weekly work schedule.
   */
  saveSchedule(attorneyId: string, payload: {
    week_start_date: string;
    schedule_data: any;
    is_submitted?: boolean;
    notes?: string;
  }): Observable<ApiResponse<WorkSchedule>> {
    return this.http.post<ApiResponse<WorkSchedule>>(
      `${this.baseUrl}/${attorneyId}/schedules`,
      payload
    );
  }

  /**
   * Duplicate previous week's schedule into the target week.
   */
  copyPreviousWeek(attorneyId: string, targetWeekStartDate: string): Observable<ApiResponse<WorkSchedule>> {
    return this.http.post<ApiResponse<WorkSchedule>>(
      `${this.baseUrl}/${attorneyId}/schedules/copy-previous`,
      { target_week_start_date: targetWeekStartDate }
    );
  }

  /**
   * Delete or clear a weekly schedule.
   */
  deleteSchedule(attorneyId: string, scheduleId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${attorneyId}/schedules/${scheduleId}`
    );
  }

  /**
   * Get real-time availability status for a single attorney.
   */
  getAttorneyAvailability(attorneyId: string): Observable<ApiResponse<AttorneyAvailabilityInfo>> {
    return this.http.get<ApiResponse<AttorneyAvailabilityInfo>>(
      `${this.baseUrl}/${attorneyId}/availability`
    );
  }

  /**
   * Get team-wide weekly availability roster for all active attorneys.
   */
  getRosterAvailability(
    weekStartDate?: string,
    departmentId?: string,
    search?: string
  ): Observable<ApiResponse<RosterAvailabilityResponse>> {
    let params = new HttpParams();
    if (weekStartDate) {
      params = params.set('week_start_date', weekStartDate);
    }
    if (departmentId) {
      params = params.set('department_id', departmentId);
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<ApiResponse<RosterAvailabilityResponse>>(this.rosterUrl, { params });
  }

  /**
   * Helper: Calculate the Monday date string (YYYY-MM-DD) for any given Date or today.
   */
  getMondayDateString(date: Date = new Date()): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    return this.formatToDateString(d);
  }

  /**
   * Helper: Format Date to YYYY-MM-DD
   */
  formatToDateString(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper: Add or subtract weeks from a Monday YYYY-MM-DD string.
   */
  offsetWeek(mondayDateStr: string, weekOffset: number): string {
    const d = new Date(mondayDateStr + 'T00:00:00');
    d.setDate(d.getDate() + weekOffset * 7);
    return this.formatToDateString(d);
  }

  /**
   * Helper: Format human-readable week range: "Mon 08 Sep – Fri 12 Sep 2026"
   */
  formatWeekRangeLabel(mondayDateStr: string): string {
    if (!mondayDateStr) return '';
    const mon = new Date(mondayDateStr + 'T00:00:00');
    const fri = new Date(mondayDateStr + 'T00:00:00');
    fri.setDate(fri.getDate() + 4);

    const monMonth = mon.toLocaleString('default', { month: 'short' });
    const friMonth = fri.toLocaleString('default', { month: 'short' });
    const year = fri.getFullYear();

    if (monMonth === friMonth) {
      return `Mon ${mon.getDate()} – Fri ${fri.getDate()} ${monMonth}, ${year}`;
    }
    return `Mon ${mon.getDate()} ${monMonth} – Fri ${fri.getDate()} ${friMonth}, ${year}`;
  }
}
