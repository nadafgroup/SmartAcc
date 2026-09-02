import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface State {
  StateID?: number;
  StateCode: string;
  StateName: string;
  IsActive?: boolean;
  IsConfirmed?: boolean;
  OpeningBalance?: number;
  Remarks?: string;
  CreatedDate?: Date;
  ModifiedDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private apiUrl = '/api/states';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: State): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: State): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  confirm(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/confirm`, {});
  }
}
