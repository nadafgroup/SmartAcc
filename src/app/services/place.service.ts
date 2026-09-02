import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Place {
  PlaceID?: number;
  PlaceCode: string;
  PlaceName: string;
  TalukaID?: number | null;
  TalukaName?: string;
  TalukaCode?: string;
  DistrictID?: number | null;
  DistrictName?: string;
  DistrictCode?: string;
  Pincode?: string;
  OpeningBalance?: number;
  IsActive?: boolean;
  IsConfirmed?: boolean;
  Remarks?: string;
  CreatedDate?: Date;
  ModifiedDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  private apiUrl = '/api/places';

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: Place): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: Place): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  confirm(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/confirm`, {});
  }
}
