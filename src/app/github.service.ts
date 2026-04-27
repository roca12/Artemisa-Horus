import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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
}

@Injectable({
  providedIn: 'root'
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
    const headers: any = {};
    if (this.token && this.token.trim() !== '') {
      // Usar el prefijo 'Bearer' que es el estándar actual para GitHub
      headers['Authorization'] = `Bearer ${this.token.trim()}`;
    }
    return { headers };
  }

  getCommits(): Observable<GithubCommit[]> {
    return this.http.get<GithubCommit[]>(`${this.baseUrl}/${this.owner}/${this.repo}/commits?per_page=100`, this.getHeaders());
  }

  getFolderContents(path: string): Observable<GithubContent[]> {
    return this.http.get<GithubContent[]>(`${this.baseUrl}/${this.owner}/${this.repo}/contents/${path}`, this.getHeaders());
  }

  getCommitsByPath(path: string): Observable<GithubCommit[]> {
     return this.http.get<GithubCommit[]>(`${this.baseUrl}/${this.owner}/${this.repo}/commits?path=${path}&per_page=100`, this.getHeaders());
  }

  getCommitDetail(sha: string): Observable<GithubCommit> {
    return this.http.get<GithubCommit>(`${this.baseUrl}/${this.owner}/${this.repo}/commits/${sha}`, this.getHeaders());
  }
}
