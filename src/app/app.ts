import { Component, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { GithubService, GithubTree, GithubTreeItem } from './github.service';
import { ConfigService, UserMapping, HiddenContributor } from './config.service';
import { forkJoin, Subscription, interval } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

/**
 * Constantes globales de configuración de la aplicación.
 */
const APP_CONFIG = {
  EXCLUDED_LOGINS: [
    'github-copilot[bot]',
    'copilot',
    'github-copilot',
    'azure-pipelines-bot',
    'github-actions[bot]',
    'roca12',
    'anfeespi',
    'exiic',
    'DiegoF1311',
  ],
  AUTO_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutos
};

/**
 * Interface representing file count data for a competitor folder.
 */
export interface FolderFileCount {
  folderName: string;
  fileCount: number;
  displayName: string;
  requiredExercises: number;
  missingExercises: number;
  isGoalMet: boolean;
  isMapped: boolean;
  githubUsername: string;
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

  /** Signal indicating if dark mode is enabled. */
  isDarkMode = signal(false);

  /** Indicates if data is currently loading. */
  loading = true;

  /** Error message if data loading fails. */
  error: string | null = null;

  /** Indicates if the admin panel is shown. */
  showAdmin = false;

  /** Mapping of folder names to real names. */
  folderToRealName: { [folderName: string]: string } = {};

  /** Mapping of folder names to github nicknames. */
  folderToGithub: { [folderName: string]: string } = {};

  /** Mapping of GitHub nicknames to real names. */
  githubToReal: { [nickname: string]: string } = {};

  /** Mapping of GitHub nicknames to real names (backend format). */
  userMappings: { [nickname: string]: string } = {};

  /** List of hidden contributor logins. */
  hiddenContributors: string[] = [];

  /** File counts per folder. */
  folderFileCounts: FolderFileCount[] = [];

  /** Total file count across all folders. */
  totalFiles = 0;

  /** Current week number (starting from week 1 = April 20, 2026). */
  currentWeekNumber = 0;

  /** Total exercises required up to the current week. */
  totalRequiredExercises = 0;

  /** Exercises required per week. */
  readonly EXERCISES_PER_WEEK = 3;

  /** Start date: Monday April 20, 2026. */
  readonly WEEK_START_DATE = new Date(2026, 3, 20); // Month is 0-indexed: 3 = April

  /** List of contributors in the analyzed folder (kept for admin compatibility). */
  contributorsInFolder: ContributorInfo[] = [];

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
    this.loadData();
    this.refreshSubscription = interval(APP_CONFIG.AUTO_REFRESH_INTERVAL).subscribe(() => {
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
      this.loadData();
    }
  }

  /**
   * Gets the display name for a contributor (folder owner).
   * @param login The folder name.
   * @returns The display name (real name or folder name).
   */
  getDisplayName(login: string): string {
    return this.folderToRealName[login.toLowerCase()] || login.replace(/_/g, ' ');
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
   * Loads data from the configuration service and then fetches GitHub tree data.
   */
  loadData() {
    console.log('Iniciando carga de datos...');
    this.loading = true;
    this.error = null;

    forkJoin({
      mappings: this.configService.getMappings(),
      hidden: this.configService.getHidden(),
    }).subscribe({
      next: (config) => {
        const realNames: { [folder: string]: string } = {};
        const githubNicknames: { [folder: string]: string } = {};
        const gitToReal: { [nickname: string]: string } = {};
        const mappingsObj: { [nickname: string]: string } = {};

        config.mappings.forEach((mapping: UserMapping) => {
          const folderLower = mapping.folderName.toLowerCase();
          const gitLower = mapping.githubNickname.toLowerCase();
          realNames[folderLower] = mapping.realName;
          githubNicknames[folderLower] = mapping.githubNickname;
          gitToReal[gitLower] = mapping.realName;
          mappingsObj[gitLower] = mapping.realName;
        });

        this.folderToRealName = realNames;
        this.folderToGithub = githubNicknames;
        this.githubToReal = gitToReal;
        this.userMappings = mappingsObj;

        this.hiddenContributors = config.hidden.map(
          (h: HiddenContributor) => `${h.entityType}:${h.entityId}`,
        );
        APP_CONFIG.EXCLUDED_LOGINS.forEach((login) => {
          const userPrefixId = `USER:${login}`;
          if (!this.hiddenContributors.includes(userPrefixId)) {
            this.hiddenContributors.push(userPrefixId);
          }
        });

        this.fetchTreeData();
      },
      error: (err) => {
        console.error('Error al cargar configuraciones iniciales:', err);
        this.fetchTreeData();
      },
    });
  }

  /**
   * Fetches the repository tree from GitHub and counts files per folder.
   */
  private fetchTreeData() {
    this.githubService.getRepoTree().subscribe({
      next: (tree: GithubTree) => {
        this.processTree(tree);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener el árbol del repositorio:', err);
        this.error = 'Error al cargar datos del repositorio. Intente nuevamente.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Calculates the current week number based on the start date (Monday April 20, 2026).
   * Weeks start on Mondays.
   */
  private calculateWeekNumber(): void {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(this.WEEK_START_DATE);
    start.setHours(0, 0, 0, 0);

    if (now < start) {
      this.currentWeekNumber = 0;
      this.totalRequiredExercises = 0;
      return;
    }

    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    this.currentWeekNumber = Math.floor(diffDays / 7) + 1;
    this.totalRequiredExercises = this.currentWeekNumber * this.EXERCISES_PER_WEEK;
  }

  /**
   * Processes the repository tree to count files per folder under "Resueltos_por_competidor".
   * Subfolders are counted as part of their parent folder.
   * Calculates weekly debt per folder.
   * @param tree The GitHub tree response.
   */
  private processTree(tree: GithubTree) {
    this.calculateWeekNumber();

    const prefix = 'Resueltos_por_competidor/';
    const folderCounts: { [folder: string]: number } = {};

    tree.tree.forEach((item: GithubTreeItem) => {
      if (item.type !== 'blob') return;
      if (!item.path.startsWith(prefix)) return;

      const relativePath = item.path.substring(prefix.length);
      const slashIndex = relativePath.indexOf('/');
      if (slashIndex === -1) return; // Archivo suelto en la raíz, no en subcarpeta

      const folderName = relativePath.substring(0, slashIndex);

      // Verificar si la carpeta o su dueño están ocultos
      const githubNickname = this.folderToGithub[folderName.toLowerCase()] || folderName;
      if (
        this.hiddenContributors.includes(`USER:${githubNickname}`) ||
        this.hiddenContributors.includes(`FOLDER:${folderName}`)
      ) {
        return;
      }

      folderCounts[folderName] = (folderCounts[folderName] || 0) + 1;
    });

    this.folderFileCounts = Object.entries(folderCounts)
      .map(([folderName, fileCount]) => {
        const missing = Math.max(0, this.totalRequiredExercises - fileCount);
        const isMapped = !!this.folderToRealName[folderName.toLowerCase()];
        const githubUsername = isMapped ? this.folderToGithub[folderName.toLowerCase()] || '' : '';
        return {
          folderName,
          fileCount,
          displayName: this.getDisplayName(folderName),
          requiredExercises: this.totalRequiredExercises,
          missingExercises: missing,
          isGoalMet: missing === 0,
          isMapped,
          githubUsername,
        };
      })
      .sort((a, b) => b.fileCount - a.fileCount);

    this.totalFiles = this.folderFileCounts.reduce((sum, f) => sum + f.fileCount, 0);

    // Generar contributorsInFolder para compatibilidad con el admin panel
    this.contributorsInFolder = this.folderFileCounts.map((f) => ({
      login: f.folderName,
      totalFiles: f.fileCount,
      weeklyStats: [],
      totalDebt: f.missingExercises,
      isCurrentGoalMet: f.isGoalMet,
      totalDocumented: 0,
      totalUndocumented: 0,
    }));
  }
}
