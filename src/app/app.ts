import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { GithubService, GithubTree, GithubTreeItem, GithubCommit } from './github.service';
import { ConfigService, UserMapping, HiddenContributor, ContributorInfo } from './config.service';
import { forkJoin, Subscription, interval, of } from 'rxjs';
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

declare const CodeMirror: {
  fromTextArea: (
    element: HTMLTextAreaElement,
    options: object,
  ) => {
    setValue: (value: string) => void;
    setOption: (option: string, value: string | number | boolean | object) => void;
    focus: () => void;
    refresh: () => void;
    toTextArea: () => void;
  };
};

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
  ],
  AUTO_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutos
};

export interface ExerciseInfo {
  name: string;
  date: string;
}

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
  weeklyExercises: { [week: number]: ExerciseInfo[] };
  isExpanded?: boolean;
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

  /** Start date for counting exercises. */
  weekStartDate = new Date(2026, 3, 20); // Default fallback: April 20, 2026

  /** List of contributors in the analyzed folder (kept for admin compatibility). */
  contributorsInFolder: ContributorInfo[] = [];

  /** Table filter text. */
  filterText = '';

  /** Current page (1-based). */
  currentPage = 1;

  /** Page size options. */
  readonly pageSizeOptions = [10, 20, 50];

  /** Selected page size. */
  pageSize = 10;

  /** Column currently used for sorting. */
  sortColumn: keyof FolderFileCount | '' = 'missingExercises';

  /** Sort direction. */
  sortDirection: 'asc' | 'desc' = 'asc';

  /** Code Viewer State */
  selectedExerciseCode: string | null = null;
  selectedExerciseName: string | null = null;
  loadingCode = false;
  showCodeModal = false;

  /**
   * Getter for codeEditor.
   */
  get codeEditor(): ElementRef {
    return this.codeEditorElement;
  }

  @ViewChild('codeEditor') set codeEditor(element: ElementRef) {
    if (element) {
      this.codeEditorElement = element;
      console.log('codeEditorElement capturado vía setter');
      // Usamos un pequeño delay para asegurar que el DOM esté listo y Angular haya procesado el valor
      setTimeout(() => {
        this.initCodeMirror();
        // Forzar un evento de resize global para ayudar a CodeMirror a recalcular
        window.dispatchEvent(new Event('resize'));

        // Segundo intento de resize para asegurar que el modal se haya estabilizado
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 300);
      }, 50);
    }
  }
  codeEditorElement!: ElementRef;
  private codeMirrorInstance: ReturnType<typeof CodeMirror.fromTextArea> | undefined | null;

  private refreshSubscription?: Subscription;
  private codeSubscription?: Subscription;

  /**
   * Returns the filtered, sorted and paginated folder file counts for the table.
   */
  get filteredFolderFileCounts(): FolderFileCount[] {
    let data = this.folderFileCounts.filter((f) => !this.isFolderHidden(f.folderName));

    // Filter
    if (this.filterText.trim()) {
      const term = this.filterText.trim().toLowerCase();
      data = data.filter(
        (f) =>
          f.displayName.toLowerCase().includes(term) ||
          f.folderName.toLowerCase().includes(term) ||
          (f.githubUsername && f.githubUsername.toLowerCase().includes(term)),
      );
    }

    // Sort
    const col = this.sortColumn || 'missingExercises';
    const dir = this.sortDirection === 'asc' ? 1 : -1;

    data = [...data].sort((a, b) => {
      // Regla: Los que cumplieron meta (isGoalMet) siempre al principio
      if (a.isGoalMet !== b.isGoalMet) {
        return a.isGoalMet ? -1 : 1;
      }

      // Dentro de cada grupo (cumplieron meta vs no), aplicar el criterio de ordenamiento seleccionado
      const aVal = a[col];
      const bVal = b[col];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const res = aVal.localeCompare(bVal);
        if (res !== 0) return res * dir;
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        if (aVal !== bVal) return (aVal - bVal) * dir;
      } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        if (aVal !== bVal) return (aVal === bVal ? 0 : aVal ? 1 : -1) * dir;
      }

      // Criterio de desempate por defecto si la columna no es fileCount
      return b.fileCount - a.fileCount;
    });

    return data;
  }

  /**
   * Toggles the expanded state of a folder row to show/hide weekly details.
   * @param folder The folder to toggle.
   */
  toggleRow(folder: FolderFileCount) {
    console.debug('Toggling folder expansion for:', this.title(), folder.folderName);
    folder.isExpanded = !folder.isExpanded;
  }

  /**
   * Returns an array of week numbers present in the folder's weekly exercises.
   */
  getWeeksForFolder(folder: FolderFileCount): number[] {
    if (this.loading) {
      console.debug('Fetching weeks for folder:', folder.folderName);
    }
    return Object.keys(folder.weeklyExercises)
      .map(Number)
      .sort((a, b) => b - a);
  }

  /**
   * Returns a range of dates for a given week number.
   */
  getWeekRange(weekNum: number): string {
    const start = new Date(this.weekStartDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    if (weekNum < 0) {
      console.warn('Negative week number requested for', this.title());
    }

    /**
     * Formatea una fecha a string corto.
     * @param d Fecha a formatear.
     */
    const formatDate = (d: Date) =>
      d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    return `${formatDate(start)} - ${formatDate(end)}`;
  }

  /**
   * Returns the formatted start date for display.
   */
  get formattedStartDate(): string {
    return this.weekStartDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /** Returns the total number of visible folders (not hidden). */
  get totalVisibleFolders(): number {
    return this.folderFileCounts.filter((f) => !this.isFolderHidden(f.folderName)).length;
  }

  /** Total pages based on filtered data. */
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredFolderFileCounts.length / this.pageSize));
  }

  /** Paginated slice of filtered data. */
  get paginatedFolderFileCounts(): FolderFileCount[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredFolderFileCounts.slice(start, start + this.pageSize);
  }

  /** Index offset for row numbering. */
  get pageOffset(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  /**
   * Toggles sorting by the given column.
   */
  sortBy(column: keyof FolderFileCount): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  /**
   * Returns the sort icon class for a column header.
   */
  getSortIcon(column: keyof FolderFileCount): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  /**
   * Handles page size change.
   */
  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  /**
   * Handles filter text change.
   */
  onFilterChange(): void {
    this.currentPage = 1;
  }

  /**
   * Navigates to a specific page.
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

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
   * Fallback for broken avatar images.
   * @param event The error event.
   */
  handleImageError(event: Event) {
    console.debug('Error loading avatar, using default for', this.title());
    (event.target as HTMLImageElement).src = '/gpc_logo.png';
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
   * Opens the code viewer for a specific exercise.
   */
  viewCode(folderName: string, fileName: string) {
    console.log(`[ViewCode] Cargando: ${folderName}/${fileName}`);
    this.selectedExerciseName = fileName;
    this.selectedExerciseCode = null;
    this.loadingCode = true;
    this.showCodeModal = true;

    // Aseguramos que el textarea se limpie antes de cargar el nuevo contenido
    try {
      if (this.codeMirrorInstance) {
        if (typeof this.codeMirrorInstance.toTextArea === 'function') {
          this.codeMirrorInstance.toTextArea();
        }
        this.codeMirrorInstance = null;
      }
    } catch (e) {
      console.warn('[ViewCode] Error al limpiar CodeMirror:', e);
      this.codeMirrorInstance = null;
    }

    const fullPath = `Resueltos_por_competidor/${folderName}/${fileName}`;
    console.log(`[ViewCode] Ruta completa: ${fullPath}`);

    if (this.codeSubscription) {
      this.codeSubscription.unsubscribe();
    }

    this.codeSubscription = this.githubService
      .getFileContent(fullPath)
      .pipe(
        finalize(() => {
          this.loadingCode = false;
          console.log('[ViewCode] Carga finalizada (loadingCode = false)');
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (content) => {
          console.log('[ViewCode] Respuesta recibida de GitHub');
          if (content?.content) {
            try {
              // GitHub content is usually base64 encoded
              // Eliminamos TODOS los caracteres no válidos para Base64 antes de decodificar
              const base64Data = content.content.replace(/\s/g, '');
              const decoded = atob(base64Data);
              const bytes = new Uint8Array(decoded.length);
              for (let i = 0; i < decoded.length; i++) {
                bytes[i] = decoded.charCodeAt(i);
              }
              this.selectedExerciseCode = new TextDecoder('utf-8').decode(bytes);
              console.log(
                '[ViewCode] Código decodificado correctamente, longitud:',
                this.selectedExerciseCode.length,
              );
            } catch (e) {
              console.error('[ViewCode] Error al decodificar contenido:', e);
              this.selectedExerciseCode = 'Error al decodificar el contenido del archivo.';
            }
          } else if (content?.notFound) {
            console.log('[ViewCode] Archivo no encontrado');
            this.selectedExerciseCode = '// El archivo no fue encontrado en GitHub.';
          } else {
            console.log('[ViewCode] Contenido vacío o formato inesperado');
            this.selectedExerciseCode =
              '// No se pudo obtener el contenido del archivo o está vacío.';
          }
        },
        error: (err) => {
          console.error('[ViewCode] Error en suscripción:', err);
          this.selectedExerciseCode = '// Error al conectar con GitHub para obtener el código.';
          this.toastr.error('Error al cargar el código del ejercicio');
        },
      });
  }

  /**
   * Initializes or updates the CodeMirror instance.
   */
  private initCodeMirror() {
    console.log('Iniciando CodeMirror...');
    if (!this.codeEditorElement) {
      console.warn('codeEditorElement no disponible para initCodeMirror');
      return;
    }

    const extension = this.selectedExerciseName?.split('.').pop()?.toLowerCase();
    let mode = 'clike'; // Default for C/C++/Java
    if (extension === 'py') mode = 'python';
    else if (extension === 'js') mode = 'javascript';
    else if (extension === 'java') mode = 'text/x-java';
    else if (extension === 'cpp' || extension === 'cc' || extension === 'c') mode = 'text/x-c++src';

    console.log(`Modo detectado: ${mode} para extensión: ${extension}`);

    try {
      const textarea = this.codeEditorElement.nativeElement;
      if (!textarea) {
        console.error('Textarea para CodeMirror no encontrado en nativeElement');
        return;
      }

      if (this.codeMirrorInstance) {
        console.log('Actualizando instancia existente de CodeMirror');
        this.codeMirrorInstance.setValue(this.selectedExerciseCode || '');
        this.codeMirrorInstance.setOption('mode', mode);
        this.codeMirrorInstance.setOption('theme', this.isDarkMode() ? 'monokai' : 'default');
      } else {
        console.log('Creando nueva instancia de CodeMirror');
        this.codeMirrorInstance = CodeMirror.fromTextArea(textarea, {
          lineNumbers: true,
          mode,
          theme: this.isDarkMode() ? 'monokai' : 'default',
          readOnly: true,
          lineWrapping: true,
          viewportMargin: Infinity,
        });

        // Forzamos el valor directamente en la instancia
        if (this.selectedExerciseCode) {
          console.log('Estableciendo valor en CodeMirror...');
          this.codeMirrorInstance.setValue(this.selectedExerciseCode);
        }
      }

      // Enfocar automáticamente el editor para forzar el renderizado de la línea actual
      this.codeMirrorInstance.focus();

      // Forzar múltiples refrescos para asegurar la visibilidad
      // El primer refresco es inmediato
      this.codeMirrorInstance.refresh();

      // Refrescos subsiguientes para manejar animaciones o delays de renderizado
      setTimeout(() => {
        if (this.codeMirrorInstance) {
          console.log('Refrescando CodeMirror (100ms)');
          this.codeMirrorInstance.refresh();
        }
      }, 100);

      setTimeout(() => {
        if (this.codeMirrorInstance) {
          console.log('Refrescando CodeMirror (500ms)');
          this.codeMirrorInstance.refresh();
        }
      }, 500);
    } catch (err) {
      console.error('Error al gestionar instancia de CodeMirror:', err);
    }
  }

  /**
   * Closes the code viewer modal and resets its state.
   */
  closeCodeModal() {
    if (this.codeSubscription) {
      this.codeSubscription.unsubscribe();
    }
    this.showCodeModal = false;
    this.selectedExerciseCode = null;
    this.selectedExerciseName = null;
    try {
      if (this.codeMirrorInstance) {
        if (typeof this.codeMirrorInstance.toTextArea === 'function') {
          this.codeMirrorInstance.toTextArea();
        }
        this.codeMirrorInstance = null;
      }
    } catch (e) {
      console.warn('[CloseCodeModal] Error al limpiar CodeMirror:', e);
      this.codeMirrorInstance = null;
    }
  }

  /**
   * Lifecycle hook that cleans up subscriptions when the component is destroyed.
   */
  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.codeSubscription) {
      this.codeSubscription.unsubscribe();
    }
  }

  /**
   * Loads data from the configuration service and then fetches GitHub tree data.
   */
  loadData() {
    this.loading = true;
    this.error = null;

    forkJoin({
      mappings: this.configService.getMappings(),
      hidden: this.configService.getHidden(),
      configs: this.configService.getConfigs(),
    }).subscribe({
      next: (config) => {
        // Cargar fecha de inicio
        const startConfig = config.configs.find((c) => c.configKey === 'WEEK_START_DATE');
        if (startConfig) {
          // Asumimos formato YYYY-MM-DD del backend
          const [year, month, day] = startConfig.configValue.split('-').map(Number);
          this.weekStartDate = new Date(year, month - 1, day);
          this.calculateWeekNumber();
        }

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

        this.hiddenContributors = config.hidden.map((h: HiddenContributor) =>
          `${h.entityType}:${h.entityId}`.toUpperCase(),
        );
        APP_CONFIG.EXCLUDED_LOGINS.forEach((login) => {
          const userPrefixId = `USER:${login}`.toUpperCase();
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
   * Also fetches commits to determine weekly file additions for the cap logic.
   */
  private fetchTreeData() {
    this.githubService
      .getRepoTree()
      .pipe(
        switchMap((tree: GithubTree) => {
          // Obtener commits que afectan la carpeta Resueltos_por_competidor
          return forkJoin({
            tree: of(tree),
            commits: this.githubService
              .getCommitsByPath('Resueltos_por_competidor')
              .pipe(catchError(() => of([] as GithubCommit[]))),
          });
        }),
        switchMap(({ tree, commits }) => {
          // Para cada commit, obtener el detalle con archivos
          if (commits.length === 0) {
            return of({ tree, commitDetails: [] as GithubCommit[] });
          }
          const detailRequests = commits.map((c) =>
            this.githubService
              .getCommitDetail(c.sha)
              .pipe(catchError(() => of(null as unknown as GithubCommit))),
          );
          return forkJoin(detailRequests).pipe(
            switchMap((details) =>
              of({
                tree,
                commitDetails: details.filter((d): d is GithubCommit => d !== null),
              }),
            ),
          );
        }),
      )
      .subscribe({
        next: ({ tree, commitDetails }) => {
          this.processTree(tree, commitDetails);
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
    const start = new Date(this.weekStartDate);
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
   * Calculates the week number for a given date relative to WEEK_START_DATE.
   * Returns 0 if the date is before the start date.
   */
  private getWeekNumberForDate(date: Date): number {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const startDate = new Date(this.weekStartDate);
    startDate.setHours(0, 0, 0, 0);
    if (targetDate < startDate) return 0;
    const diffMs = targetDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
  }

  /**
   * Only counts files under "Resueltos_por_competidor/".
   */
  private buildWeeklyFileCounts(commitDetails: GithubCommit[]): {
    [folder: string]: { [week: number]: Map<string, string> };
  } {
    const prefix = 'Resueltos_por_competidor/';
    const weeklyMap: { [folder: string]: { [week: number]: Map<string, string> } } = {};
    const seenExercises: { [folder: string]: Set<string> } = {};

    // Ordenar commits del más antiguo al más reciente para que la primera aparición sea la primera cronológicamente
    const sortedCommits = [...commitDetails].sort(
      (a, b) => new Date(a.commit.author.date).getTime() - new Date(b.commit.author.date).getTime(),
    );

    for (const commit of sortedCommits) {
      if (!commit.files || !commit.commit?.author?.date) continue;
      const dateStr = commit.commit.author.date;
      const commitDate = new Date(dateStr);
      const weekNum = this.getWeekNumberForDate(commitDate);
      if (weekNum === 0) continue;

      for (const file of commit.files) {
        if (file.status !== 'added' && file.status !== 'renamed') continue;
        if (!file.filename.startsWith(prefix)) continue;

        const relativePath = file.filename.substring(prefix.length);
        const slashIndex = relativePath.indexOf('/');
        if (slashIndex === -1) continue;

        const folderName = relativePath.substring(0, slashIndex);
        const fileName = relativePath.substring(slashIndex + 1);
        if (!fileName || fileName.includes('/')) continue; // Solo archivos directos en la carpeta del competidor

        if (!weeklyMap[folderName]) weeklyMap[folderName] = {};
        if (!seenExercises[folderName]) seenExercises[folderName] = new Set();

        // Solo agregar si no ha sido visto antes en ninguna semana
        if (!seenExercises[folderName].has(fileName)) {
          if (!weeklyMap[folderName][weekNum]) weeklyMap[folderName][weekNum] = new Map();
          weeklyMap[folderName][weekNum].set(fileName, dateStr);
          seenExercises[folderName].add(fileName);
        }
      }
    }

    return weeklyMap;
  }

  /**
   * Calculates the effective exercise count for a folder.
   * Each week, a minimum of 3 exercises must be done.
   * Extra exercises in a week DO NOT count toward future weeks.
   * However, they are still reflected in the total file count.
   */
  private calculateEffectiveCount(weeklyFiles: { [week: number]: Map<string, string> }): number {
    let effective = 0;
    // Iterate from week 1 up to the current week
    for (let w = 1; w <= this.currentWeekNumber; w++) {
      const exercisesInWeek = weeklyFiles[w]?.size || 0;
      // Cap the contribution of each week to EXERCISES_PER_WEEK (3)
      effective += Math.min(exercisesInWeek, this.EXERCISES_PER_WEEK);
    }
    return effective;
  }

  /**
   * Checks if a folder or its associated user is hidden.
   * @param folderName The name of the folder.
   * @returns True if hidden, false otherwise.
   */
  private isFolderHidden(folderName: string): boolean {
    const githubNickname = this.folderToGithub[folderName.toLowerCase()] || folderName;
    return (
      this.hiddenContributors.includes(`USER:${githubNickname}`.toUpperCase()) ||
      this.hiddenContributors.includes(`FOLDER:${folderName}`.toUpperCase())
    );
  }

  /**
   * Processes the repository tree to count files per folder under "Resueltos_por_competidor".
   * Subfolders are counted as part of their parent folder.
   * Calculates weekly debt per folder, applying the weekly cap restriction.
   * @param tree The GitHub tree response.
   * @param commitDetails The detailed commits with file information.
   */
  private processTree(tree: GithubTree, commitDetails: GithubCommit[] = []) {
    this.calculateWeekNumber();

    const prefix = 'Resueltos_por_competidor/';
    const folderFiles: { [folder: string]: Set<string> } = {};

    tree.tree.forEach((item: GithubTreeItem) => {
      if (item.type !== 'blob') return;
      if (!item.path.startsWith(prefix)) return;

      const relativePath = item.path.substring(prefix.length);
      const slashIndex = relativePath.indexOf('/');
      if (slashIndex === -1) return; // Archivo suelto en la raíz, no en subcarpeta

      const folderName = relativePath.substring(0, slashIndex);
      const fileName = relativePath.substring(slashIndex + 1);
      if (!fileName || fileName.includes('/')) return; // Solo archivos directos en la carpeta del competidor

      if (!folderFiles[folderName]) folderFiles[folderName] = new Set();
      folderFiles[folderName].add(fileName);
    });

    // Construir mapa de archivos por semana usando los commits
    const weeklyMap = this.buildWeeklyFileCounts(commitDetails);

    this.folderFileCounts = Object.entries(folderFiles)
      .map(([folderName, filesSet]) => {
        const fileCount = filesSet.size;
        const folderWeekly = weeklyMap[folderName] || {};
        let effectiveCount: number;
        if (Object.keys(folderWeekly).length > 0) {
          effectiveCount = this.calculateEffectiveCount(folderWeekly);
        } else {
          // Si no hay datos de commits, asumimos 0 efectivos ya que no podemos validar semanas
          effectiveCount = 0;
        }

        // Convertir folderWeekly de Map a ExerciseInfo[] para el objeto final
        const weeklyExercises: { [week: number]: ExerciseInfo[] } = {};
        Object.entries(folderWeekly).forEach(([weekKey, filesMap]) => {
          const weekNum = Number(weekKey);
          weeklyExercises[weekNum] = Array.from((filesMap as Map<string, string>).entries()).map(
            ([name, date]) => ({
              name,
              date,
            }),
          );
        });

        const missing = Math.max(0, this.totalRequiredExercises - effectiveCount);
        const isMapped = Boolean(this.folderToRealName[folderName.toLowerCase()]);
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
          weeklyExercises,
        };
      })
      .sort((a, b) => {
        if (a.isGoalMet !== b.isGoalMet) {
          return a.isGoalMet ? -1 : 1;
        }
        if (a.missingExercises !== b.missingExercises) {
          return a.missingExercises - b.missingExercises;
        }
        return b.fileCount - a.fileCount;
      });

    this.totalFiles = this.folderFileCounts
      .filter((f) => !this.isFolderHidden(f.folderName))
      .reduce((sum, f) => sum + f.fileCount, 0);

    // Generar contributorsInFolder para compatibilidad con el admin panel
    this.contributorsInFolder = this.folderFileCounts.map((f) => {
      const isMapped = Boolean(this.folderToRealName[f.folderName.toLowerCase()]);
      const githubNickname = isMapped ? this.folderToGithub[f.folderName.toLowerCase()] : null;

      return {
        login: f.folderName,
        avatarUrl: githubNickname ? `https://github.com/${githubNickname}.png` : '/gpc_logo.png',
        totalFiles: f.fileCount,
        weeklyStats: [],
        totalDebt: f.missingExercises,
        isCurrentGoalMet: f.isGoalMet,
        totalDocumented: 0,
        totalUndocumented: 0,
      };
    });
  }
}
