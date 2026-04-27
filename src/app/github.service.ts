import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

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

  constructor(private http: HttpClient) {}

  getCommits(): Observable<GithubCommit[]> {
    return this.http.get<GithubCommit[]>(`${this.baseUrl}/${this.owner}/${this.repo}/commits?per_page=100`);
  }

  getFolderContents(path: string): Observable<GithubContent[]> {
    return this.http.get<GithubContent[]>(`${this.baseUrl}/${this.owner}/${this.repo}/contents/${path}`);
  }

  getCommitsByPath(path: string): Observable<GithubCommit[]> {
     return this.http.get<GithubCommit[]>(`${this.baseUrl}/${this.owner}/${this.repo}/commits?path=${path}&per_page=100`);
  }
}
