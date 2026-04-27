import { Component, OnInit, signal } from '@angular/core';
import { GithubService, GithubCommit } from './github.service';

interface WeekStats {
  weekStart: Date;
  commitsCount: number;
  authors: { [login: string]: number };
}

interface ContributorInfo {
  login: string;
  filesCount: number;
  files: string[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Analizador de GPC-UEB-Repo');

  commitsByWeek: WeekStats[] = [];
  contributorsInFolder: ContributorInfo[] = [];
  loading = true;
  error: string | null = null;

  constructor(private githubService: GithubService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.githubService.getCommits().subscribe({
      next: (commits) => {
        this.processCommits(commits);
        this.loadFolderContributors();
      },
      error: (err) => {
        this.error = 'Error al cargar los commits';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private processCommits(commits: GithubCommit[]) {
    const weeks: { [key: string]: WeekStats } = {};

    commits.forEach(c => {
      const date = new Date(c.commit.author.date);
      const weekStart = this.getStartOfWeek(date);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          weekStart: weekStart,
          commitsCount: 0,
          authors: {}
        };
      }

      weeks[weekKey].commitsCount++;
      const author = c.author?.login || c.commit.author.name;
      weeks[weekKey].authors[author] = (weeks[weekKey].authors[author] || 0) + 1;
    });

    this.commitsByWeek = Object.values(weeks).sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
  }

  private loadFolderContributors() {
    const folderPath = 'Resueltos por competidor';
    this.githubService.getFolderContents(folderPath).subscribe({
      next: (contents) => {
        // Para cada archivo en la carpeta, necesitamos saber quién lo agregó
        // La API de contents no lo dice directamente, pero podemos ver los commits para esa ruta
        const contributorsMap: { [login: string]: Set<string> } = {};

        // Esta es una aproximación. Para ser precisos tendríamos que pedir los commits por cada archivo
        // Pero eso son muchas peticiones. Vamos a pedir los commits de la carpeta.
        this.githubService.getCommitsByPath(folderPath).subscribe({
          next: (commits) => {
             commits.forEach(commit => {
               const author = commit.author?.login || commit.commit.author.name;
               if (!contributorsMap[author]) {
                 contributorsMap[author] = new Set<string>();
               }
               // El mensaje del commit suele decir qué se agregó
               contributorsMap[author].add(commit.commit.message);
             });

             this.contributorsInFolder = Object.entries(contributorsMap).map(([login, files]) => ({
               login,
               filesCount: files.size,
               files: Array.from(files)
             })).sort((a, b) => b.filesCount - a.filesCount);

             this.loading = false;
          },
          error: (err) => {
            console.error('Error al obtener commits de la carpeta', err);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener contenido de la carpeta', err);
        this.loading = false;
      }
    });
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes como inicio
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  getAuthorKeys(authors: { [key: string]: number }): string[] {
    return Object.keys(authors);
  }
}
