import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
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

/**
 * Interface representing general information about a contributor (kept for admin compatibility).
 */
export interface ContributorInfo {
  login: string;
  avatarUrl?: string;
  totalFiles: number;
  weeklyStats: never[];
  totalDebt: number;
  isCurrentGoalMet: boolean;
  totalDocumented: number;
  totalUndocumented: number;
}

/**
 * Servicio para gestionar la configuración de la aplicación.
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la configuración de la aplicación.
   * @returns Observable con la lista de configuraciones.
   */
  getConfigs(): Observable<AppConfig[]> {
    return this.http.get<AppConfig[]>(`${this.apiUrl}/config`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching configs:', error);
        return of([]);
      }),
    );
  }

  /**
   * Guarda una configuración de la aplicación.
   * @param config Objeto de configuración a guardar.
   * @returns Observable con la configuración guardada.
   */
  saveConfig(config: AppConfig): Observable<AppConfig> {
    return this.http.post<AppConfig>(`${this.apiUrl}/config`, config);
  }

  /**
   * Obtiene los mapeos de usuario.
   * @returns Observable con la lista de mapeos.
   */
  getMappings(): Observable<UserMapping[]> {
    return this.http.get<UserMapping[]>(`${this.apiUrl}/mappings`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching mappings:', error);
        return of([]);
      }),
    );
  }

  /**
   * Guarda un mapeo de usuario.
   * @param mapping Objeto de mapeo a guardar.
   * @returns Observable con el mapeo guardado.
   */
  saveMapping(mapping: UserMapping): Observable<UserMapping> {
    return this.http.post<UserMapping>(`${this.apiUrl}/mappings`, mapping);
  }

  /**
   * Elimina un mapeo de usuario.
   * @param folderName Nombre de la carpeta del mapeo a eliminar.
   * @returns Observable de la operación.
   */
  deleteMapping(folderName: string): Observable<object> {
    return this.http.delete<object>(`${this.apiUrl}/mappings/${folderName}`);
  }

  /**
   * Obtiene la lista de colaboradores ocultos.
   * @returns Observable con la lista de colaboradores ocultos.
   */
  getHidden(): Observable<HiddenContributor[]> {
    return this.http.get<HiddenContributor[]>(`${this.apiUrl}/hidden`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching hidden:', error);
        return of([]);
      }),
    );
  }

  /**
   * Guarda un colaborador como oculto.
   * @param contributor Objeto del colaborador oculto a guardar.
   * @returns Observable con el colaborador guardado.
   */
  saveHidden(contributor: HiddenContributor): Observable<HiddenContributor> {
    return this.http.post<HiddenContributor>(`${this.apiUrl}/hidden`, contributor);
  }

  /**
   * Elimina un colaborador de la lista de ocultos.
   * @param id ID del colaborador a eliminar.
   * @returns Observable de la operación.
   */
  deleteHidden(id: string): Observable<object> {
    return this.http.delete<object>(`${this.apiUrl}/hidden/${id}`);
  }
}
