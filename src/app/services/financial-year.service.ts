import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FinancialYear {
  FinancialYearID?: number;
  FirmID: number;
  FirmName?: string;
  YearCode: string;
  YearName: string;
  StartDate: string;
  EndDate: string;
  IsCurrent: boolean;
  IsActive: boolean;
  Remarks?: string;
  CreatedBy?: string;
  CreatedDate?: string;
  ModifiedDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinancialYearService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/financial-years';

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getByFirmId(firmId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/firm/${firmId}`);
  }

  getCurrentByFirmId(firmId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/current/${firmId}`);
  }

  getFirmsDropdown(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/firms/dropdown`);
  }

  create(data: FinancialYear): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: FinancialYear): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
