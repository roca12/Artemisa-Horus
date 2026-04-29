import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { GithubService, GithubCommit, GithubCollaborator, GithubContent } from './github.service';
import { ConfigService } from './config.service';
import { forkJoin, Subscription, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

/**
 * Interface representing code mirror editor instance.
 */
interface CodeMirrorEditor {
  setValue(value: string): void;
  setOption(option: string, value: unknown): void;
  getWrapperElement(): HTMLElement;
}

declare const CodeMirror: {
  (element: HTMLElement, options?: Record<string, unknown>): CodeMirrorEditor;
};

/**
 * Interface representing weekly statistics for the general chart.
 */
interface WeekStats {
  weekStart: Date;
  commitsCount: number;
  authors: { [login: string]: number };
}

/**
 * Interface representing weekly statistics for a specific contributor.
 */
interface ContributorWeekStats {
  weekStart: Date;
  count: number;
  diff: number;
  messages: string[];
  files: string[];
  isGoalMet: boolean;
  debt: number;
}

/**
 * Interface representing general information about a contributor.
 */
export interface ContributorInfo {
  login: string;
  avatarUrl?: string;
  totalFiles: number;
  weeklyStats: ContributorWeekStats[];
  totalDebt: number;
  isCurrentGoalMet: boolean;
}

/**
 * Main application component.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
})
export class App implements OnInit, OnDestroy {
  /** Title of the application. */
  protected readonly title = signal('GPC - Horus');

  /** List of statistics by week. */
  commitsByWeek: WeekStats[] = [];

  /** Currently selected week key. */
  selectedWeek: string | null = null;

  /** List of contributors in the analyzed folder. */
  contributorsInFolder: ContributorInfo[] = [];

  /** Currently selected contributor login. */
  selectedContributor: string | null = null;

  /** Search term for filtering contributors. */
  searchTerm = '';

  /** Filter for contributor status. */
  statusFilter = 'all'; // 'all', 'met', 'failed'

  /** Signal indicating if dark mode is enabled. */
  isDarkMode = signal(false);

  /** Indicates if data is currently loading. */
  loading = true;

  /** Current loading progress percentage. */
  loadingProgress = 0;

  /** Error message if data loading fails. */
  error: string | null = null;

  /** Container for the CodeMirror editor. */
  @ViewChild('editorContainer') editorContainer?: ElementRef;

  /** Indicates if the code viewer modal is shown. */
  showModal = false;

  /** Content of the file being viewed. */
  fileCode = '';

  /** Name of the file being viewed. */
  selectedFileName = '';

  /** Indicates if the code is currently loading. */
  loadingCode = false;

  /** CodeMirror editor instance. */
  codeMirrorEditor?: CodeMirrorEditor;

  /** Indicates if the admin panel is shown. */
  showAdmin = false;

  /** Mapping of GitHub nicknames to real names. */
  userMappings: { [nickname: string]: string } = {};

  /** List of hidden contributor logins. */
  hiddenContributors: string[] = [];

  private refreshSubscription?: Subscription;

  constructor(
    private githubService: GithubService,
    private configService: ConfigService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Initializes the component, loading theme, settings, and data.
   */
  ngOnInit() {
    this.initTheme();
    this.loadSettings();
    this.loadData();
    // Configurar recarga automática cada 5 minutos
    this.refreshSubscription = interval(5 * 60 * 1000).subscribe(() => {
      console.log('Recargando datos automáticamente...');
      this.loadData();
    });
  }

  /**
   * Initializes the application theme based on saved settings or system preference.
   */
  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.setDarkMode(true);
    } else {
      this.setDarkMode(false);
    }
  }

  /**
   * Toggles between light and dark themes.
   */
  toggleTheme() {
    this.setDarkMode(!this.isDarkMode());
  }

  /**
   * Toggles the visibility of the admin panel.
   */
  toggleAdmin() {
    this.showAdmin = !this.showAdmin;
    if (!this.showAdmin) {
      this.loadSettings(); // Recargar mapeos y configuraciones al cerrar el admin
    }
  }

  /**
   * Loads settings from the backend, including user mappings and hidden contributors.
   */
  private loadSettings() {
    // Cargar mapeos desde backend
    this.configService.getMappings().subscribe({
      next: (mappings) => {
        const mappingsObj: { [nickname: string]: string } = {};
        mappings.forEach((mapping) => {
          mappingsObj[mapping.githubNickname.toLowerCase()] = mapping.realName;
        });
        this.userMappings = mappingsObj;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar mapeos desde backend:', err),
    });

    // Cargar contribuidores ocultos desde backend
    this.configService.getHidden().subscribe({
      next: (hidden) => {
        const excludedLogins = [
          'github-copilot[bot]',
          'copilot',
          'github-copilot',
          'azure-pipelines-bot',
          'github-actions[bot]',
          'roca12',
          'anfeespi',
          'exiic',
          'DiegoF1311',
        ];

        this.hiddenContributors = hidden.map((h) => h.githubNickname);

        // Asegurarse de que los excluidos estén siempre ocultos
        excludedLogins.forEach((login) => {
          if (!this.hiddenContributors.includes(login)) {
            this.hiddenContributors.push(login);
          }
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar colaboradores ocultos desde backend:', err),
    });
  }

  /**
   * Gets the display name for a contributor.
   * @param login The GitHub login.
   * @returns The display name (real name or login).
   */
  getDisplayName(login: string): string {
    return this.userMappings[login.toLowerCase()] || login;
  }

  /**
   * Sets the dark mode status and updates the document theme.
   * @param isDark True for dark mode, false for light mode.
   */
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

  /**
   * Lifecycle hook that cleans up subscriptions when the component is destroyed.
   */
  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  /**
   * Loads data from the configuration service and then fetches GitHub data.
   */
  loadData() {
    console.log('Iniciando carga de datos...');
    this.loading = true;
    this.loadingProgress = 0;
    this.error = null;
    const folderPath = 'Resueltos_por_competidor';
    const excludedLogins = [
      'github-copilot[bot]',
      'copilot',
      'github-copilot',
      'azure-pipelines-bot',
      'github-actions[bot]',
      'roca12',
      'anfeespi',
      'exiic',
      'DiegoF1311',
    ];

    // Asegurarse de tener las configuraciones antes de cargar datos de GitHub
    forkJoin({
      mappings: this.configService.getMappings(),
      hidden: this.configService.getHidden(),
    }).subscribe({
      next: (config) => {
        // Actualizar mapeos
        const mappingsObj: { [nickname: string]: string } = {};
        config.mappings.forEach((mapping) => {
          mappingsObj[mapping.githubNickname.toLowerCase()] = mapping.realName;
        });
        this.userMappings = mappingsObj;

        // Actualizar ocultos
        this.hiddenContributors = config.hidden.map((h) => h.githubNickname);
        excludedLogins.forEach((login) => {
          if (!this.hiddenContributors.includes(login)) {
            this.hiddenContributors.push(login);
          }
        });

        // Ahora cargar datos de GitHub
        this.fetchGitHubData(folderPath, excludedLogins);
      },
      error: (err) => {
        console.error('Error al cargar configuraciones iniciales:', err);
        // Intentar cargar GitHub data de todos modos o manejar error
        this.fetchGitHubData(folderPath, excludedLogins);
      },
    });
  }

  /**
   * Fetches data from GitHub, including commits and contributors.
   * @param folderPath The current path to the folder in the repository.
   * @param excludedLogins List of logins to exclude from the results.
   */
  private fetchGitHubData(folderPath: string, excludedLogins: string[]) {
    forkJoin({
      generalCommits: this.githubService.getCommits(),
      folderCommits: this.githubService.getCommitsByPath(folderPath),
      allContributors: this.githubService
        .getCollaborators()
        .pipe(
          map((collaborators: GithubCollaborator[]) =>
            collaborators.filter(
              (c: GithubCollaborator) =>
                c.permissions?.push &&
                !excludedLogins.includes(c.login) &&
                !(c.login && c.login.toLowerCase().includes('copilot')),
            ),
          ),
        ),
    }).subscribe({
      next: (data: {
        generalCommits: GithubCommit[];
        folderCommits: GithubCommit[];
        allContributors: GithubCollaborator[];
      }) => {
        console.log('Datos recibidos correctamente:', data);
        this.loadingProgress = 20; // 20% tras la primera carga

        // Filtrar commits desde el 20/04/2026 para reducir las peticiones de detalle
        const startDate = new Date(2026, 3, 20); // 20 de Abril de 2026
        const recentFolderCommits = data.folderCommits.filter(
          (c) => new Date(c.commit.author.date) >= startDate,
        );

        if (recentFolderCommits.length > 0) {
          const totalDetails = recentFolderCommits.length;
          let completedDetails = 0;

          const detailRequests = recentFolderCommits.map((c) =>
            this.githubService.getCommitDetail(c.sha).pipe(
              map((detail: GithubCommit) => {
                completedDetails++;
                this.loadingProgress = 20 + Math.round((completedDetails / totalDetails) * 70);
                return detail;
              }),
            ),
          );

          forkJoin(detailRequests).subscribe({
            next: (detailedCommits: GithubCommit[]) => {
              this.processCommits(data.generalCommits);
              this.processFolderContributors(detailedCommits, data.allContributors);

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
            error: (err) => this.handleError(err),
          });
        } else {
          this.processCommits(data.generalCommits);
          this.processFolderContributors([], data.allContributors);

          if (this.commitsByWeek.length > 0) {
            this.selectedWeek = this.commitsByWeek[0].weekStart.toISOString().split('T')[0];
          }

          if (this.contributorsInFolder.length > 0) {
            this.selectedContributor = this.contributorsInFolder[0].login;
          }

          this.loadingProgress = 100;
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => this.handleError(err),
      complete: () => {
        console.log('Suscripción a forkJoin inicial completada.');
      },
    });
  }

  /**
   * Handles errors occurring during data loading.
   * @param err The error object.
   */
  private handleError(err: { status?: number; message?: string }) {
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

  /**
   * Processes GitHub commits to group them by week and calculate general statistics.
   * @param commits List of GitHub commits.
   */
  private processCommits(commits: GithubCommit[]) {
    const weeks: { [key: string]: WeekStats } = {};
    const excludedLogins = [
      'github-copilot[bot]',
      'copilot',
      'github-copilot',
      'azure-pipelines-bot',
      'github-actions[bot]',
      'roca12',
      'anfeespi',
      'exiic',
      'DiegoF1311',
    ];

    const startDate = new Date(2026, 3, 20);
    commits.forEach((c) => {
      const date = new Date(c.commit.author.date);

      // Solo incluir commits desde el 20/04/2026 en adelante
      if (date < startDate) {
        return;
      }

      const weekStart = App.getStartOfWeek(date);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          weekStart,
          commitsCount: 0,
          authors: {},
        };
      }

      const author = c.author?.login || c.commit.author.name;

      // Omitir excluidos, copilot y otros bots
      if (excludedLogins.includes(author) || (author && author.toLowerCase().includes('copilot')))
        return;

      weeks[weekKey].commitsCount++;
      weeks[weekKey].authors[author] = (weeks[weekKey].authors[author] || 0) + 1;
    });

    this.commitsByWeek = Object.values(weeks).sort(
      (a, b) => b.weekStart.getTime() - a.weekStart.getTime(),
    );
  }

  /**
   * Processes folder-specific commits and contributor list to calculate individual statistics and debts.
   * @param commits Detailed list of commits affecting the folder.
   * @param allGitHubContributors List of all repository contributors.
   */
  private processFolderContributors(
    commits: GithubCommit[],
    allGitHubContributors: GithubCollaborator[] = [],
  ) {
    const contributorsData: {
      [login: string]: { [weekKey: string]: { messages: string[]; files: string[] } };
    } = {};

    // Inicializar datos para TODOS los colaboradores de GitHub (si no están ocultos)
    allGitHubContributors.forEach((c) => {
      const login = c.login;
      if (login && !this.hiddenContributors.includes(login)) {
        contributorsData[login] = {};
      }
    });

    // Determinar la semana actual y la primera semana de interés
    const now = new Date();
    const excludedLogins = [
      'github-copilot[bot]',
      'copilot',
      'github-copilot',
      'azure-pipelines-bot',
      'github-actions[bot]',
      'roca12',
      'anfeespi',
      'exiic',
      'DiegoF1311',
    ];
    const currentWeekStart = App.getStartOfWeek(now);
    const startDate = new Date(2026, 3, 20);
    const firstWeekStart = App.getStartOfWeek(startDate);

    // Generar todas las semanas desde la primera hasta la actual
    const allWeeks: string[] = [];
    for (
      let tempWeek = new Date(firstWeekStart);
      tempWeek <= currentWeekStart;
      tempWeek.setDate(tempWeek.getDate() + 7)
    ) {
      allWeeks.push(new Date(tempWeek).toISOString().split('T')[0]);
    }
    allWeeks.reverse(); // De más reciente a más antigua
    const reversedWeeks = [...allWeeks].reverse(); // De más antigua a más reciente para cálculo de deuda

    commits.forEach((commit) => {
      const date = new Date(commit.commit.author.date);

      // Solo incluir commits desde el 20/04/2026 en adelante
      if (date < startDate) {
        return;
      }

      // Filtrar archivos java, cpp, python y excluir eliminaciones
      const relevantFiles = (commit.files || [])
        .filter((f) => f.status !== 'removed')
        .map((f) => f.filename)
        .filter((name) => {
          const lower = name.toLowerCase();
          return lower.endsWith('.java') || lower.endsWith('.cpp') || lower.endsWith('.py');
        });

      if (relevantFiles.length === 0) return;

      const author = commit.author?.login || commit.commit.author.name;

      // Si el autor está oculto o es copilot (o bot), ignorar
      if (
        this.hiddenContributors.includes(author) ||
        excludedLogins.includes(author) ||
        (author && author.toLowerCase().includes('copilot'))
      )
        return;

      if (!contributorsData[author]) {
        contributorsData[author] = {};
      }
      const weekStart = App.getStartOfWeek(date);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!contributorsData[author][weekKey]) {
        contributorsData[author][weekKey] = { messages: [], files: [] };
      }

      contributorsData[author][weekKey].messages.push(commit.commit.message);
      relevantFiles.forEach((file) => {
        if (!contributorsData[author][weekKey].files.includes(file)) {
          contributorsData[author][weekKey].files.push(file);
        }
      });
    });

    this.contributorsInFolder = Object.entries(contributorsData)
      .map(([login, weeksData]) => {
        let totalDelivered = 0;
        const goalPerWeek = 3;
        let accumulatedDebt = 0;

        // Procesar semanas de antigua a reciente para calcular deuda acumulada correctamente
        const weeklyStatsChronological: ContributorWeekStats[] = reversedWeeks.map((weekKey) => {
          const data = weeksData[weekKey] || { messages: [], files: [] };
          const count = data.files.length; // Ejercicios únicos de esta semana
          totalDelivered += count;

          // Lógica de deuda:
          // 1. Añadimos la meta de la semana actual a la deuda acumulada
          accumulatedDebt += goalPerWeek;

          // 2. Restamos los ejercicios entregados esta semana de la deuda acumulada
          // (Si entrega más de la deuda, la deuda queda en 0, pero no negativa para la próxima semana)
          accumulatedDebt = Math.max(0, accumulatedDebt - count);

          // Se cumple la meta si al finalizar la semana la deuda es 0
          const isGoalMet = accumulatedDebt === 0;

          return {
            weekStart: new Date(weekKey),
            count,
            diff: 0,
            messages: data.messages,
            files: data.files,
            isGoalMet,
            debt: accumulatedDebt,
          };
        });

        const weeklyStats = [...weeklyStatsChronological].reverse();

        // Calcular diferencias de aportes entre semanas consecutivas (visual)
        for (let i = 0; i < weeklyStats.length - 1; i++) {
          weeklyStats[i].diff = weeklyStats[i].count - weeklyStats[i + 1].count;
        }
        if (weeklyStats.length > 0) {
          weeklyStats[weeklyStats.length - 1].diff = weeklyStats[weeklyStats.length - 1].count;
        }

        // Buscar avatar en los commits o en la lista de contribuidores
        const contributorCommit = commits.find(
          (c) => (c.author?.login || c.commit.author.name) === login,
        );
        let avatarUrl = contributorCommit?.author?.avatar_url;

        if (!avatarUrl) {
          const gitHubUser = allGitHubContributors.find((u) => u.login === login);
          avatarUrl = gitHubUser?.avatar_url;
        }

        const finalDebt = accumulatedDebt;

        return {
          login,
          avatarUrl,
          totalFiles: totalDelivered,
          weeklyStats,
          totalDebt: finalDebt,
          isCurrentGoalMet: finalDebt === 0,
        };
      })
      .sort((a, b) => b.totalFiles - a.totalFiles);
  }

  /**
   * Obtiene la clase de color según la deuda de ejercicios.
   * @param debt Cantidad de ejercicios adeudados.
   * @returns Clase CSS correspondiente.
   */
  getDebtClass(debt: number): string {
    if (debt <= 0) return '';
    if (debt === 1) return 'debt-yellow';
    if (debt === 2) return 'debt-orange';
    return 'debt-red';
  }

  /**
   * Selects a contributor to view their detailed statistics.
   * @param login The GitHub login of the contributor.
   */
  selectContributor(login: string) {
    this.selectedContributor = login;
    this.searchTerm = '';
    this.statusFilter = 'all';
  }

  /**
   * Selects a week to view its general statistics.
   * @param weekKey The ISO date string of the week start.
   */
  selectWeek(weekKey: string) {
    this.selectedWeek = weekKey;
  }

  /**
   * Gets the statistics for the currently selected week.
   * @returns Week statistics or undefined.
   */
  getSelectedWeekStats(): WeekStats | undefined {
    if (!this.selectedWeek) return undefined;
    return this.commitsByWeek.find(
      (w) => w.weekStart.toISOString().split('T')[0] === this.selectedWeek,
    );
  }

  /**
   * Gets the general information for the currently selected contributor.
   * @returns Contributor info or undefined.
   */
  getSelectedContributorStats(): ContributorInfo | undefined {
    return this.contributorsInFolder.find((c) => c.login === this.selectedContributor);
  }

  /**
   * Gets filtered weekly statistics for the selected contributor based on search and status filters.
   * @returns List of filtered contributor weekly statistics.
   */
  getFilteredWeeklyStats(): ContributorWeekStats[] {
    const contributor = this.getSelectedContributorStats();
    if (!contributor) return [];

    return contributor.weeklyStats.filter((week) => {
      // Filtro por estado
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'met' && week.isGoalMet) ||
        (this.statusFilter === 'failed' && !week.isGoalMet);

      // Filtro por búsqueda (en mensajes de commits o nombres de archivos)
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch =
        !this.searchTerm ||
        week.messages.some((msg) => msg.toLowerCase().includes(searchLower)) ||
        week.files.some((f) => f.toLowerCase().includes(searchLower)) ||
        week.weekStart.toLocaleDateString().includes(this.searchTerm);

      return matchesStatus && matchesSearch;
    });
  }

  /**
   * Gets the list of contributors who have met the current goal.
   * @returns List of successful contributors.
   */
  getPassedContributors(): ContributorInfo[] {
    return this.contributorsInFolder.filter((c) => c.isCurrentGoalMet);
  }

  /**
   * Gets the list of contributors who have not met the current goal.
   * @returns List of contributors with debt.
   */
  getFailedContributors(): ContributorInfo[] {
    return this.contributorsInFolder.filter((c) => !c.isCurrentGoalMet);
  }

  /**
   * Calculates the start of the week (Monday) for a given date.
   * @param date The date to calculate from.
   * @returns A new Date object set to the start of the week.
   */
  private static getStartOfWeek(date: Date): Date {
    const weekDate = new Date(date);
    weekDate.setHours(0, 0, 0, 0); // Resetear horas primero
    const day = weekDate.getDay();
    const diff = weekDate.getDate() - day + (day === 0 ? -6 : 1); // Lunes como inicio
    weekDate.setDate(diff);
    return weekDate;
  }

  /**
   * Gets the keys (logins) of the authors who contributed in a given week.
   * @param authors Object with logins as keys and commit counts as values.
   * @returns Array of logins.
   */
  getAuthorKeys(authors: { [key: string]: number }): string[] {
    return Object.keys(authors);
  }

  /**
   * Fetches and displays the content of a file in a modal.
   * @param path The path to the file in the repository.
   */
  viewFileCode(path: string) {
    this.selectedFileName = path.split('/').pop() || path;
    this.showModal = true;
    this.loadingCode = true;
    this.fileCode = '';

    this.githubService.getFileContent(path).subscribe({
      next: (data: GithubContent) => {
        try {
          // GitHub devuelve el contenido en base64
          // Decodificar Base64 manejando correctamente UTF-8
          const base64 = (data.content || '').replace(/\s/g, '');
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          this.fileCode = new TextDecoder('utf-8').decode(bytes);
          this.loadingCode = false;
          this.cdr.detectChanges();

          // Inicializar o actualizar el editor después de un breve delay para asegurar que el DOM esté listo
          setTimeout(() => this.initializeEditor(), 0);
        } catch (e) {
          console.error('Error decodificando contenido:', e);
          this.fileCode = 'Error al decodificar el contenido del archivo.';
          this.loadingCode = false;
          this.cdr.detectChanges();
        }
      },
      error: (err: { message?: string }) => {
        this.fileCode = `Error al cargar el archivo: ${err.message || 'Desconocido'}`;
        this.loadingCode = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Initializes or updates the CodeMirror editor with the current file content.
   */
  private initializeEditor() {
    if (this.editorContainer && !this.codeMirrorEditor) {
      const mode = App.getMode(this.selectedFileName);
      this.codeMirrorEditor = CodeMirror(this.editorContainer.nativeElement, {
        value: this.fileCode,
        mode,
        theme: this.isDarkMode() ? 'monokai' : 'default',
        lineNumbers: true,
        readOnly: true,
        lineWrapping: true,
        viewportMargin: Infinity,
      });
    } else if (this.codeMirrorEditor) {
      this.codeMirrorEditor.setValue(this.fileCode);
      this.codeMirrorEditor.setOption('mode', App.getMode(this.selectedFileName));
      this.codeMirrorEditor.setOption('theme', this.isDarkMode() ? 'monokai' : 'default');
    }
  }

  /**
   * Determines the CodeMirror mode based on the file extension.
   * @param fileName The name of the file.
   * @returns The CodeMirror mode string.
   */
  private static getMode(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'java':
        return 'text/x-java';
      case 'cpp':
      case 'c':
      case 'h':
      case 'hpp':
        return 'text/x-c++src';
      case 'py':
        return 'text/x-python';
      case 'js':
      case 'ts':
        return 'text/javascript';
      case 'html':
        return 'text/html';
      case 'xml':
        return 'application/xml';
      case 'md':
        return 'text/x-markdown';
      default:
        return 'text/plain';
    }
  }

  /**
   * Downloads the current file content as a text file.
   */
  downloadFile() {
    if (this.fileCode && this.fileCode !== 'Error al decodificar el contenido del archivo.') {
      const blob = new Blob([this.fileCode], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.selectedFileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } else {
      this.toastr.error('No se puede descargar un archivo con errores de contenido.');
    }
  }

  /**
   * Closes the code viewer modal and clears the editor content.
   */
  closeModal() {
    this.showModal = false;
    this.fileCode = '';
    if (this.codeMirrorEditor) {
      // Limpiar el contenedor para evitar duplicados si se recrea
      if (this.editorContainer) {
        this.editorContainer.nativeElement.innerHTML = '';
      }
      this.codeMirrorEditor = undefined;
    }
  }
}
