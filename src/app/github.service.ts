import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface GithubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  };
  files?: {
    filename: string;
    status: string;
  }[];
}

export interface GithubContent {
  name: string;
  path: string;
  type: string;
  url: string;
  content?: string;
  encoding?: string;
}

export interface GithubCollaborator {
  login: string;
  avatar_url: string;
  permissions?: {
    pull: boolean;
    triage: boolean;
    push: boolean;
    maintain: boolean;
    admin: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private readonly owner = 'roca12';
  private readonly repo = 'GPC-UEB-Repo';
  private readonly baseUrl = 'https://api.github.com/repos';
  private token: string | null = null;

  constructor(private http: HttpClient) {
    this.token = environment.githubToken;
  }

  private getHeaders() {
    const headers: Record<string, string> = {};
    if (this.token && this.token.trim() !== '') {
      // Usar el prefijo 'Bearer' que es el estándar actual para GitHub
      headers['Authorization'] = `Bearer ${this.token.trim()}`;
    }
    return { headers };
  }

  getCommits(): Observable<GithubCommit[]> {
    return this.http.get<GithubCommit[]>(
      `${this.baseUrl}/${this.owner}/${this.repo}/commits?per_page=100`,
      this.getHeaders(),
    );
  }

  getFolderContents(path: string): Observable<GithubContent[]> {
    const encodedPath = path
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    return this.http.get<GithubContent[]>(
      `${this.baseUrl}/${this.owner}/${this.repo}/contents/${encodedPath}`,
      this.getHeaders(),
    );
  }

  getCommitsByPath(path: string): Observable<GithubCommit[]> {
    return this.http.get<GithubCommit[]>(
      `${this.baseUrl}/${this.owner}/${this.repo}/commits?path=${encodeURIComponent(
        path,
      )}&per_page=100`,
      this.getHeaders(),
    );
  }

  getCommitDetail(sha: string): Observable<GithubCommit> {
    return this.http.get<GithubCommit>(
      `${this.baseUrl}/${this.owner}/${this.repo}/commits/${sha}`,
      this.getHeaders(),
    );
  }

  getFileContent(path: string): Observable<GithubContent & { notFound?: boolean }> {
    // Codificar cada segmento del path para manejar espacios y caracteres especiales,
    // pero manteniendo los separadores '/' para que la API de GitHub lo reconozca
    const encodedPath = path
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    return this.http
      .get<GithubContent>(
        `${this.baseUrl}/${this.owner}/${this.repo}/contents/${encodedPath}`,
        this.getHeaders(),
      )
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            return of({
              name: path.split('/').pop() || '',
              path: path,
              type: 'file',
              url: '',
              content: '',
              notFound: true,
            } as GithubContent & { notFound: boolean });
          }
          console.warn(`Error al cargar: ${path} (status: ${error.status})`, error);
          return of({
            name: path.split('/').pop() || '',
            path: path,
            type: 'file',
            url: '',
            content: '',
            notFound: true, // Si hay cualquier error al obtenerlo, lo tratamos como no encontrado para evitar que aparezca si no es accesible
          } as GithubContent & { notFound: boolean });
        }),
      );
  }

  getContributors(): Observable<GithubCollaborator[]> {
    return this.http.get<GithubCollaborator[]>(
      `${this.baseUrl}/${this.owner}/${this.repo}/contributors`,
      this.getHeaders(),
    );
  }

  getCollaborators(): Observable<GithubCollaborator[]> {
    return this.http.get<GithubCollaborator[]>(
      `${this.baseUrl}/${this.owner}/${this.repo}/collaborators`,
      this.getHeaders(),
    );
  }
}
