import { Component, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { GithubService, GithubCommit } from './github.service';
import { forkJoin, Subscription, interval } from 'rxjs';
import { map } from 'rxjs/operators';

interface WeekStats {
  weekStart: Date;
  commitsCount: number;
  authors: { [login: string]: number };
}

interface ContributorWeekStats {
  weekStart: Date;
  count: number;
  diff: number;
  messages: string[];
  files: string[];
}

interface ContributorInfo {
  login: string;
  totalFiles: number;
  weeklyStats: ContributorWeekStats[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('GPC - Horus');

  commitsByWeek: WeekStats[] = [];
  selectedWeek: string | null = null;
  contributorsInFolder: ContributorInfo[] = [];
  selectedContributor: string | null = null;
  isDarkMode = signal(false);
  loading = true;
  loadingProgress = 0;
  error: string | null = null;

  // Modal para ver código
  showModal = false;
  fileCode = '';
  selectedFileName = '';
  loadingCode = false;

  private refreshSubscription?: Subscription;

  constructor(private githubService: GithubService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.initTheme();
    this.loadData();
    // Configurar recarga automática cada 5 minutos
    this.refreshSubscription = interval(5 * 60 * 1000).subscribe(() => {
      console.log('Recargando datos automáticamente...');
      this.loadData();
    });
  }

  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.setDarkMode(true);
    } else {
      this.setDarkMode(false);
    }
  }

  toggleTheme() {
    this.setDarkMode(!this.isDarkMode());
  }

  private setDarkMode(isDark: boolean) {
    this.isDarkMode.set(isDark);
    if (isDark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadData() {
    console.log('Iniciando carga de datos...');
    this.loading = true;
    this.loadingProgress = 0;
    this.error = null;
    const folderPath = 'Resueltos por competidor';

    forkJoin({
      generalCommits: this.githubService.getCommits(),
      folderCommits: this.githubService.getCommitsByPath(folderPath)
    }).subscribe({
      next: (data) => {
        console.log('Datos recibidos correctamente:', data);
        this.loadingProgress = 20; // 20% tras la primera carga

        // Filtrar commits de 2026 para reducir las peticiones de detalle
        const recentFolderCommits = data.folderCommits.filter(c => new Date(c.commit.author.date).getFullYear() >= 2026);

        if (recentFolderCommits.length > 0) {
          const totalDetails = recentFolderCommits.length;
          let completedDetails = 0;

          // Obtener detalles de cada commit para saber qué archivos se modificaron
          const detailRequests = recentFolderCommits.map(c =>
            this.githubService.getCommitDetail(c.sha).pipe(
              map(detail => {
                completedDetails++;
                // El progreso de detalles va del 20% al 90%
                this.loadingProgress = 20 + Math.round((completedDetails / totalDetails) * 70);
                return detail;
              })
            )
          );

          forkJoin(detailRequests).subscribe({
            next: (detailedCommits) => {
              this.processCommits(data.generalCommits);
              this.processFolderContributors(detailedCommits);

              if (this.commitsByWeek.length > 0) {
                this.selectedWeek = this.commitsByWeek[0].weekStart.toISOString().split('T')[0];
              }

              if (this.contributorsInFolder.length > 0) {
                this.selectedContributor = this.contributorsInFolder[0].login;
              }
              this.loadingProgress = 100;
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: (err) => this.handleError(err)
          });
        } else {
          this.processCommits(data.generalCommits);
          this.processFolderContributors([]);

          if (this.commitsByWeek.length > 0) {
            this.selectedWeek = this.commitsByWeek[0].weekStart.toISOString().split('T')[0];
          }

          this.loadingProgress = 100;
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => this.handleError(err),
      complete: () => {
        console.log('Suscripción a forkJoin inicial completada.');
      }
    });
  }

  private handleError(err: any) {
    console.error('Error detectado:', err);
    if (err.status === 401) {
      this.error = 'Error de autenticación: El Token de GitHub es inválido o ha expirado.';
    } else if (err.status === 403) {
      this.error = 'Límite de la API de GitHub alcanzado o acceso prohibido.';
    } else if (err.status === 404) {
      this.error = 'No se encontró el repositorio o la carpeta especificada.';
    } else {
      this.error = `Error al cargar los datos: ${err.message || 'Error desconocido'}`;
    }
    this.loading = false;
  }

  private processCommits(commits: GithubCommit[]) {
    const weeks: { [key: string]: WeekStats } = {};

    commits.forEach(c => {
      const date = new Date(c.commit.author.date);

      // Solo incluir commits de 2026 en adelante
      if (date.getFullYear() < 2026) {
        return;
      }

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

  private processFolderContributors(commits: GithubCommit[]) {
    const contributorsData: { [login: string]: { [weekKey: string]: { messages: string[], files: string[] } } } = {};

    commits.forEach(commit => {
      const date = new Date(commit.commit.author.date);

      // Solo incluir commits de 2026 en adelante
      if (date.getFullYear() < 2026) {
        return;
      }

      // Filtrar archivos java, cpp, python y excluir eliminaciones
      const relevantFiles = (commit.files || [])
        .filter(f => f.status !== 'removed')
        .map(f => f.filename)
        .filter(name => {
          const lower = name.toLowerCase();
          return lower.endsWith('.java') || lower.endsWith('.cpp') || lower.endsWith('.py');
        });

      // Si el commit no tiene archivos relevantes en los lenguajes solicitados, podemos elegir ignorarlo
      // o simplemente registrar el commit con lista de archivos vacía. El usuario dijo "solo tener en cuenta los archivos java, cpp y python"
      if (relevantFiles.length === 0) return;

      const author = commit.author?.login || commit.commit.author.name;
      const weekStart = this.getStartOfWeek(date);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!contributorsData[author]) {
        contributorsData[author] = {};
      }
      if (!contributorsData[author][weekKey]) {
        contributorsData[author][weekKey] = { messages: [], files: [] };
      }

      contributorsData[author][weekKey].messages.push(commit.commit.message);
      relevantFiles.forEach(file => {
        if (!contributorsData[author][weekKey].files.includes(file)) {
          contributorsData[author][weekKey].files.push(file);
        }
      });
    });

    this.contributorsInFolder = Object.entries(contributorsData).map(([login, weeksData]) => {
      const weeklyStats: ContributorWeekStats[] = Object.entries(weeksData).map(([weekKey, data]) => ({
        weekStart: new Date(weekKey),
        count: data.files.length, // Usamos la cantidad de archivos únicos como "aportes"
        diff: 0,
        messages: data.messages,
        files: data.files
      })).sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

      // Calcular diferencias
      for (let i = 0; i < weeklyStats.length - 1; i++) {
        weeklyStats[i].diff = weeklyStats[i].count - weeklyStats[i + 1].count;
      }
      if (weeklyStats.length > 0) {
        weeklyStats[weeklyStats.length - 1].diff = weeklyStats[weeklyStats.length - 1].count;
      }

      return {
        login,
        totalFiles: weeklyStats.reduce((sum, week) => sum + week.count, 0),
        weeklyStats
      };
    }).sort((a, b) => b.totalFiles - a.totalFiles);
  }

  selectContributor(login: string) {
    this.selectedContributor = login;
  }

  selectWeek(weekKey: string) {
    this.selectedWeek = weekKey;
  }

  getSelectedWeekStats(): WeekStats | undefined {
    if (!this.selectedWeek) return undefined;
    return this.commitsByWeek.find(w => w.weekStart.toISOString().split('T')[0] === this.selectedWeek);
  }

  getSelectedContributorStats(): ContributorInfo | undefined {
    return this.contributorsInFolder.find(c => c.login === this.selectedContributor);
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

  viewFileCode(path: string) {
    this.selectedFileName = path.split('/').pop() || path;
    this.showModal = true;
    this.loadingCode = true;
    this.fileCode = '';

    this.githubService.getFileContent(path).subscribe({
      next: (data: any) => {
        try {
          // GitHub devuelve el contenido en base64
          // Usar decodificación compatible con UTF-8
          const binaryString = atob(data.content.replace(/\s/g, ''));
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          this.fileCode = new TextDecoder('utf-8').decode(bytes);
          this.loadingCode = false;
          this.cdr.detectChanges();
        } catch (e) {
          this.fileCode = 'Error al decodificar el contenido del archivo.';
          this.loadingCode = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.fileCode = 'Error al cargar el archivo: ' + (err.message || 'Desconocido');
        this.loadingCode = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.fileCode = '';
  }
}
