import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  link: string | null;
  notification_type: string | null; // e.g., 'info', 'success', 'warning', 'error', 'workflow'
  channel: string; // e.g., 'in_app', 'email'
  status: string; // e.g., 'pending', 'sent', 'failed'
  is_read: boolean;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notifications`;

  // Signals for state management
  readonly notifications = signal<Notification[]>([]);
  readonly loading = signal<boolean>(false);
  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.is_read).length);

  /**
   * Load notifications for the authenticated user
   * Defaults to in_app channel and latest 50 items
   */
  loadNotifications(): Observable<ApiResponse<any>> {
    this.loading.set(true);
    return this.http
      .get<ApiResponse<any>>(this.baseUrl, {
        params: {
          channel: 'in_app',
          per_page: '50',
        },
      })
      .pipe(
        tap((res) => {
          const list = res.data?.data || [];
          this.notifications.set(list);
          this.loading.set(false);
        }),
        catchError((err) => {
          this.loading.set(false);
          return throwError(() => err);
        })
      );
  }

  /**
   * Mark a single notification as read
   */
  markAsRead(id: string): Observable<ApiResponse<Notification>> {
    return this.http
      .put<ApiResponse<Notification>>(`${this.baseUrl}/${id}`, {
        is_read: true,
      })
      .pipe(
        tap((res) => {
          if (res.success) {
            // Update local state signal
            this.notifications.update((list) =>
              list.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
          }
        })
      );
  }

  /**
   * Mark all unread notifications as read
   */
  markAllAsRead(): Observable<any> {
    const unreadNotifications = this.notifications().filter((n) => !n.is_read);
    if (unreadNotifications.length === 0) {
      // Return empty observable
      return new Observable((subscriber) => {
        subscriber.next({ success: true, message: 'No unread notifications.' });
        subscriber.complete();
      });
    }

    // Call update API for all unread in parallel
    const requests = unreadNotifications.map((n) =>
      this.http.put(`${this.baseUrl}/${n.id}`, { is_read: true })
    );

    // Run requests and update state
    this.loading.set(true);
    // ForkJoin or simple subscription. To keep it simple, we do local state update first or subscribe to all.
    // Let's implement local update and fire HTTP calls.
    this.notifications.update((list) =>
      list.map((n) => ({ ...n, is_read: true }))
    );

    // We send PUT request for each
    return new Observable((subscriber) => {
      let completed = 0;
      if (requests.length === 0) {
        this.loading.set(false);
        subscriber.next({ success: true });
        subscriber.complete();
        return;
      }
      requests.forEach((req) => {
        req.subscribe({
          next: () => {
            completed++;
            if (completed === requests.length) {
              this.loading.set(false);
              subscriber.next({ success: true });
              subscriber.complete();
            }
          },
          error: () => {
            completed++;
            if (completed === requests.length) {
              this.loading.set(false);
              subscriber.next({ success: true });
              subscriber.complete();
            }
          }
        });
      });
    });
  }

  /**
   * Delete a single notification
   */
  deleteNotification(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`).pipe(
      tap((res) => {
        if (res.success) {
          // Remove from local signal list
          this.notifications.update((list) => list.filter((n) => n.id !== id));
        }
      })
    );
  }

  /**
   * Delete all notifications for the current user
   */
  deleteAllNotifications(): Observable<any> {
    const allIds = this.notifications().map((n) => n.id);
    if (allIds.length === 0) {
      return new Observable((subscriber) => {
        subscriber.next({ success: true });
        subscriber.complete();
      });
    }

    // Locally clear
    const original = [...this.notifications()];
    this.notifications.set([]);

    // Call delete API for each
    const requests = allIds.map((id) => this.http.delete(`${this.baseUrl}/${id}`));
    this.loading.set(true);

    return new Observable((subscriber) => {
      let completed = 0;
      requests.forEach((req) => {
        req.subscribe({
          next: () => {
            completed++;
            if (completed === requests.length) {
              this.loading.set(false);
              subscriber.next({ success: true });
              subscriber.complete();
            }
          },
          error: (err) => {
            completed++;
            // Revert state if error
            if (completed === requests.length) {
              this.notifications.set(original);
              this.loading.set(false);
              subscriber.error(err);
            }
          }
        });
      });
    });
  }

  createNotification(data: {
    title: string;
    body?: string;
    link?: string;
    notification_type?: string;
    user_id: string | number;
  }): Observable<ApiResponse<Notification>> {
    return this.http.post<ApiResponse<Notification>>(this.baseUrl, {
      ...data,
      user_id: data.user_id.toString(),
      channel: 'in_app',
      status: 'sent',
      is_read: false,
    }).pipe(
      tap((res) => {
        if (res.success && res.data) {
          // Add to start of local signal list
          this.notifications.update((list) => [res.data, ...list]);
        }
      })
    );
  }
}
