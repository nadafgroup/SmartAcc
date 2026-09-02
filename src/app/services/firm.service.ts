import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Firm {
  FirmID?: number;
  Code: string;
  TradeName: string;
  LegalName?: string;
  Alias?: string;
  PanNo?: string;
  CINNo?: string;
  MSMEId?: string;
  Jurisdiction?: string;
  LandlineNo?: string;
  MobileNo?: string;
  EmailId?: string;
  WebAddress?: string;
  Address1?: string;
  Address2?: string;
  Place?: string;
  State?: string;
  Pincode?: string;
  IsActive?: boolean;
  CreatedDate?: Date;
  ModifiedDate?: Date;
  CreatedBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirmService {
  private apiUrl = '/api/firms';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getFirms(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getFirm(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createFirm(firm: Firm): Observable<any> {
    return this.http.post<any>(this.apiUrl, firm);
  }

  updateFirm(id: number, firm: Firm): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, firm);
  }

  deleteFirm(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  confirmFirm(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/confirm`, {});
  }
}