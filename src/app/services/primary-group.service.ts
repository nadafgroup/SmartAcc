import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PrimaryGroup {
  PrimaryGroupID?: number;
  PrimaryGroupCode: string;
  PrimaryGroupName: string;
  GroupID: number | null;
  AccountGroupName?: string;
  AccountInfoID: number | null;
  AccountInfoName?: string;
  GroupType: string | null;
  NatureOfAccount: string | null;
  OpeningBalance: number;
  IsConfirmed: boolean;
  ConfirmedDate?: string;
  IsActive: boolean;
  Remarks: string;
  CreatedBy?: string;
  CreatedDate?: string;
  ModifiedDate?: string;
}

export interface DropdownItem {
  ID: number;
  Name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrimaryGroupService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/primary-groups';

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: PrimaryGroup): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: PrimaryGroup): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  confirm(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/confirm`, {});
  }

  getAccountGroups(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/account-groups/dropdown`);
  }

  getAccountInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/account-info/dropdown`);
  }
}
