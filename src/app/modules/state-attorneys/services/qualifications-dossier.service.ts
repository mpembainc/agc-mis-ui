import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  AttorneyEducation,
  AttorneyCertification,
  DossierDocument,
  DocumentTypeLookup,
  QualificationsData,
  DossierData,
} from '../models/state-attorney.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class QualificationsDossierService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/state-attorneys`;
  private readonly documentsUrl = `${environment.apiUrl}/documents`;

  // ── Qualifications (Education & Certifications) ──

  getQualifications(attorneyId: string): Observable<ApiResponse<QualificationsData>> {
    return this.http.get<ApiResponse<QualificationsData>>(
      `${this.baseUrl}/${attorneyId}/qualifications`
    );
  }

  addEducation(attorneyId: string, payload: FormData | any): Observable<ApiResponse<AttorneyEducation>> {
    return this.http.post<ApiResponse<AttorneyEducation>>(
      `${this.baseUrl}/${attorneyId}/education`,
      payload
    );
  }

  updateEducation(attorneyId: string, eduId: string, payload: FormData | any): Observable<ApiResponse<AttorneyEducation>> {
    return this.http.put<ApiResponse<AttorneyEducation>>(
      `${this.baseUrl}/${attorneyId}/education/${eduId}`,
      payload
    );
  }

  deleteEducation(attorneyId: string, eduId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${attorneyId}/education/${eduId}`
    );
  }

  verifyEducation(attorneyId: string, eduId: string, isVerified?: boolean): Observable<ApiResponse<AttorneyEducation>> {
    const body = isVerified !== undefined ? { is_verified: isVerified } : {};
    return this.http.patch<ApiResponse<AttorneyEducation>>(
      `${this.baseUrl}/${attorneyId}/education/${eduId}/verify`,
      body
    );
  }

  addCertification(attorneyId: string, payload: FormData | any): Observable<ApiResponse<AttorneyCertification>> {
    return this.http.post<ApiResponse<AttorneyCertification>>(
      `${this.baseUrl}/${attorneyId}/certifications`,
      payload
    );
  }

  updateCertification(attorneyId: string, certId: string, payload: FormData | any): Observable<ApiResponse<AttorneyCertification>> {
    return this.http.put<ApiResponse<AttorneyCertification>>(
      `${this.baseUrl}/${attorneyId}/certifications/${certId}`,
      payload
    );
  }

  deleteCertification(attorneyId: string, certId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${attorneyId}/certifications/${certId}`
    );
  }

  // ── Digital Dossier ──

  getDossier(attorneyId: string): Observable<ApiResponse<DossierData>> {
    return this.http.get<ApiResponse<DossierData>>(
      `${this.baseUrl}/${attorneyId}/dossier`
    );
  }

  uploadDossierDocument(attorneyId: string, payload: FormData): Observable<ApiResponse<DossierDocument>> {
    return this.http.post<ApiResponse<DossierDocument>>(
      `${this.baseUrl}/${attorneyId}/dossier`,
      payload
    );
  }

  deleteDossierDocument(attorneyId: string, docId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${attorneyId}/dossier/${docId}`
    );
  }

  getDocumentTypes(): Observable<ApiResponse<DocumentTypeLookup[]>> {
    return this.http.get<ApiResponse<DocumentTypeLookup[]>>(
      `${this.baseUrl}/document-types`
    );
  }

  downloadDocument(docId: string): Observable<Blob> {
    return this.http.get(`${this.documentsUrl}/${docId}/download`, {
      responseType: 'blob',
    });
  }

  getDocumentViewUrl(docId: string): string {
    return `${this.documentsUrl}/${docId}/view`;
  }
}
