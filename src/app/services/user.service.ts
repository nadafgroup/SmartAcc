import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  UserID?: number;
  UserCode: string;
  Username: string;
  Password?: string;
  FullName: string;
  Email?: string;
  Phone?: string;
  Mobile?: string;
  Role: string;
  Department?: string;
  Designation?: string;
  Address?: string;
  City?: string;
  State?: string;
  Pincode?: string;
  IsActive?: boolean;
  IsLocked?: boolean;
  IsConfirmed?: boolean;
  LastLoginDate?: Date;
  CreatedDate?: Date;
  ModifiedDate?: Date;
  CreatedBy?: string;
  Remarks?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getUser(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createUser(user: User): Observable<any> {
    return this.http.post<any>(this.apiUrl, user);
  }

  updateUser(id: number, user: User): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  confirmUser(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/confirm`, {});
  }

  toggleLock(id: number, isLocked: boolean): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/lock`, { isLocked });
  }
}