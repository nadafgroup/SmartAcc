import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface District {
  DistrictID?: number;
  DistrictCode: string;
  DistrictName: string;
  StateID?: number;
  StateName?: string;
  OpeningBalance?: number;
  IsActive?: boolean;
  IsConfirmed?: boolean;
  Remarks?: string;
  CreatedDate?: Date;
  ModifiedDate?: Date;
  TalukaCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DistrictService {
  private apiUrl = '/api/districts';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: District): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: District): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  confirm(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/confirm`, {});
  }
}
