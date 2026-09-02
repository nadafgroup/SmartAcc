import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Taluka {
  TalukaID?: number;
  TalukaCode: string;
  TalukaName: string;
  DistrictID?: number | null;
  DistrictName?: string;
  DistrictCode?: string;
  OpeningBalance?: number;
  IsActive?: boolean;
  IsConfirmed?: boolean;
  Remarks?: string;
  CreatedDate?: Date;
  ModifiedDate?: Date;
  PlaceCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TalukaService {
  private apiUrl = '/api/talukas';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: Taluka): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: Taluka): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  confirm(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/confirm`, {});
  }
}
