import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface UserMapping {
  githubNickname: string;
  realName: string;
}

export interface HiddenContributor {
  githubNickname: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMappings(): Observable<UserMapping[]> {
    return this.http.get<UserMapping[]>(`${this.apiUrl}/mappings`);
  }

  saveMapping(mapping: UserMapping): Observable<UserMapping> {
    return this.http.post<UserMapping>(`${this.apiUrl}/mappings`, mapping);
  }

  deleteMapping(nickname: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mappings/${nickname}`);
  }

  getHidden(): Observable<HiddenContributor[]> {
    return this.http.get<HiddenContributor[]>(`${this.apiUrl}/hidden`);
  }

  saveHidden(contributor: HiddenContributor): Observable<HiddenContributor> {
    return this.http.post<HiddenContributor>(`${this.apiUrl}/hidden`, contributor);
  }

  deleteHidden(nickname: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/hidden/${nickname}`);
  }
}
