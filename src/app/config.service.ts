import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface AppConfig {
  configKey: string;
  configValue: string;
}

export interface UserMapping {
  folderName: string;
  githubNickname: string;
  realName: string;
}

export interface HiddenContributor {
  entityId: string;
  entityType: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getConfigs(): Observable<AppConfig[]> {
    console.log('Fetching configs from:', `${this.apiUrl}/config`);
    return this.http.get<AppConfig[]>(`${this.apiUrl}/config`);
  }

  getConfig(key: string): Observable<AppConfig> {
    return this.http.get<AppConfig>(`${this.apiUrl}/config/${key}`);
  }

  saveConfig(config: AppConfig): Observable<AppConfig> {
    console.log('Guardando configuración:', config);
    return this.http.post<AppConfig>(`${this.apiUrl}/config`, config);
  }

  getMappings(): Observable<UserMapping[]> {
    return this.http.get<UserMapping[]>(`${this.apiUrl}/mappings`);
  }

  saveMapping(mapping: UserMapping): Observable<UserMapping> {
    return this.http.post<UserMapping>(`${this.apiUrl}/mappings`, mapping);
  }

  deleteMapping(folderName: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mappings/${folderName}`);
  }

  getHidden(): Observable<HiddenContributor[]> {
    return this.http.get<HiddenContributor[]>(`${this.apiUrl}/hidden`);
  }

  saveHidden(contributor: HiddenContributor): Observable<HiddenContributor> {
    return this.http.post<HiddenContributor>(`${this.apiUrl}/hidden`, contributor);
  }

  deleteHidden(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/hidden/${id}`);
  }
}
