import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AccountGroup {
  GroupID?: number;
  GroupCode: string;
  GroupName: string;
  ParentGroupID?: number | null;
  GroupType: string;
  NatureOfAccount: string;
  OpeningBalance?: number;
  IsActive?: boolean;
  CreatedDate?: Date;
  ModifiedDate?: Date;
  CreatedBy?: string;
  Remarks?: string;
  ParentGroupName?: string;
  AccountCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountGroupService {
  private apiUrl = '/api/groups';

  constructor(private http: HttpClient) { }

  getGroups(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getGroup(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createGroup(group: AccountGroup): Observable<any> {
    return this.http.post<any>(this.apiUrl, group);
  }

  updateGroup(id: number, group: AccountGroup): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, group);
  }

  deleteGroup(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  confirmGroup(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/confirm`, {});
  }
}