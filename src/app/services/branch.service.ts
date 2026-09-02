import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Branch {
  BranchID?: number;
  FirmID: number;
  Code: string;
  Name: string;
  Address1?: string;
  Address2?: string;
  Place?: string;
  State?: string;
  Pincode?: string;
  Phone?: string;
  Mobile?: string;
  Email?: string;
  ContactPerson?: string;
  IsActive?: boolean;
  CreatedBy?: string;
  CreatedDate?: string;
  ModifiedDate?: string;
  FirmName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private apiUrl = 'http://localhost:3000/api/branches';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getByFirmId(firmId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/firm/${firmId}`);
  }

  getFirmsDropdown(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/firms/dropdown`);
  }

  create(branch: Branch): Observable<any> {
    return this.http.post<any>(this.apiUrl, branch);
  }

  update(id: number, branch: Branch): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, branch);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
