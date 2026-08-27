import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OpeningBalanceRecord {
  OpeningBalanceID?: number;
  AccountID: number;
  AccountCode: string;
  AccountName: string;
  GroupName?: string;
  OpeningBalance: number;
  BalanceType: 'Dr' | 'Cr';
  FinancialYear: string;
  IsPosted: boolean;
  PostedDate?: Date;
  CreatedDate?: Date;
  ModifiedDate?: Date;
}

export interface OpeningBalancePost {
  AccountID: number;
  OpeningBalance: number;
  BalanceType: string;
  FinancialYear: string;
}

@Injectable({
  providedIn: 'root'
})
export class OpeningBalanceService {
  private apiUrl = '/api/opening-balance';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  create(record: OpeningBalancePost): Observable<any> {
    return this.http.post<any>(this.apiUrl, record);
  }

  update(id: number, record: OpeningBalancePost): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, record);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getByAccount(accountId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/account/${accountId}`);
  }

  postRecord(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/post`, {});
  }
}
