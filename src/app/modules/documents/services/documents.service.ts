import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { Document, DocumentAccessLog } from '../models/document.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/documents`;

  // Signals for state management
  readonly documents = signal<Document[]>([]);
  readonly loading = signal<boolean>(false);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly perPage = signal<number>(15);

  /**
   * Fetch paginated list of documents
   */
  loadDocuments(params?: {
    page?: number;
    per_page?: number;
    entity_type?: string;
    entity_id?: string;
    search?: string;
  }): Observable<ApiResponse<any>> {
    this.loading.set(true);
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) {
        httpParams = httpParams.set('page', params.page.toString());
        this.page.set(params.page);
      }
      if (params.per_page) {
        httpParams = httpParams.set('per_page', params.per_page.toString());
        this.perPage.set(params.per_page);
      }
      if (params.entity_type) {
        httpParams = httpParams.set('entity_type', params.entity_type);
      }
      if (params.entity_id) {
        httpParams = httpParams.set('entity_id', params.entity_id);
      }
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
    }

    return this.http
      .get<ApiResponse<any>>(this.baseUrl, { params: httpParams })
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.documents.set(res.data.data || []);
            this.total.set(res.data.total || 0);
          }
          this.loading.set(false);
        }),
        catchError((err) => {
          this.loading.set(false);
          return throwError(() => err);
        })
      );
  }

  /**
   * Upload a new document file using FormData
   */
  uploadDocument(
    file: File,
    metadata?: {
      entity_type?: string;
      entity_id?: string;
      document_type_id?: string;
    }
  ): Observable<ApiResponse<Document>> {
    this.loading.set(true);
    const formData = new FormData();
    formData.append('file', file);

    if (metadata) {
      if (metadata.entity_type) {
        formData.append('entity_type', metadata.entity_type);
      }
      if (metadata.entity_id) {
        formData.append('entity_id', metadata.entity_id);
      }
      if (metadata.document_type_id) {
        formData.append('document_type_id', metadata.document_type_id);
      }
    }

    return this.http.post<ApiResponse<Document>>(this.baseUrl, formData).pipe(
      tap((res) => {
        if (res.success && res.data) {
          // Prepend new document to local state signal
          this.documents.update((list) => [res.data, ...list]);
          this.total.update((t) => t + 1);
        }
        this.loading.set(false);
      }),
      catchError((err) => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Upload a new version for an existing document
   */
  uploadVersion(id: string, file: File): Observable<ApiResponse<Document>> {
    this.loading.set(true);
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<ApiResponse<Document>>(`${this.baseUrl}/${id}/versions`, formData)
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            // Update local state signal item
            this.documents.update((list) =>
              list.map((d) => (d.id === id ? res.data : d))
            );
          }
          this.loading.set(false);
        }),
        catchError((err) => {
          this.loading.set(false);
          return throwError(() => err);
        })
      );
  }

  /**
   * Update document metadata
   */
  updateMetadata(
    id: string,
    data: {
      entity_type?: string | null;
      entity_id?: string | null;
      document_type_id?: string | null;
      is_active?: boolean;
    }
  ): Observable<ApiResponse<Document>> {
    this.loading.set(true);
    return this.http
      .put<ApiResponse<Document>>(`${this.baseUrl}/${id}`, data)
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.documents.update((list) =>
              list.map((d) => (d.id === id ? res.data : d))
            );
          }
          this.loading.set(false);
        }),
        catchError((err) => {
          this.loading.set(false);
          return throwError(() => err);
        })
      );
  }

  /**
   * Soft-delete a document
   */
  deleteDocument(id: string): Observable<ApiResponse<any>> {
    this.loading.set(true);
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`).pipe(
      tap((res) => {
        if (res.success) {
          this.documents.update((list) => list.filter((d) => d.id !== id));
          this.total.update((t) => Math.max(0, t - 1));
        }
        this.loading.set(false);
      }),
      catchError((err) => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Fetch access log history for a document
   */
  getAccessLogs(id: string): Observable<ApiResponse<DocumentAccessLog[]>> {
    return this.http.get<ApiResponse<DocumentAccessLog[]>>(`${this.baseUrl}/${id}/access-logs`);
  }

  /**
   * Fetch document as a blob (resolves authorization internally)
   */
  fetchBlob(id: string, action: 'download' | 'view'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/${action}`, { responseType: 'blob' });
  }

  /**
   * Downloads a document
   */
  downloadFile(id: string, originalName: string): void {
    this.fetchBlob(id, 'download').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    });
  }

  /**
   * Opens the document in a new tab for inline viewing
   */
  viewFileInline(id: string): void {
    this.fetchBlob(id, 'view').subscribe({
      next: (blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      }
    });
  }
}
