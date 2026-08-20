import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AccountInfo {
  AccountID?: number;
  AccountCode: string;
  AccountName: string;
  GroupID: number;
  Address?: string;
  City?: string;
  State?: string;
  Pincode?: string;
  Phone?: string;
  Mobile?: string;
  Email?: string;
  GSTIN?: string;
  PAN?: string;
  OpeningBalance?: number;
  BalanceType?: string;
  IsActive?: boolean;
  CreatedDate?: Date;
  ModifiedDate?: Date;
  CreatedBy?: string;
  Remarks?: string;
  GroupName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountInfoService {
  private apiUrl = '/api/accounts';

  constructor(private http: HttpClient) { }

  getAccounts(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getAccount(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createAccount(account: AccountInfo): Observable<any> {
    return this.http.post<any>(this.apiUrl, account);
  }

  updateAccount(id: number, account: AccountInfo): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, account);
  }

  deleteAccount(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  confirmAccount(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/confirm`, {});
  }
}