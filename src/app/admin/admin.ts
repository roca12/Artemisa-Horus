import {
  Component,
  OnInit,
  signal,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  ElementRef,
  computed,
} from '@angular/core';
import { GithubService, GithubCollaborator, GithubContent } from '../github.service';
import { ConfigService, UserMapping } from '../config.service';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { compareSync } from 'bcryptjs';
import html2canvas from 'html2canvas';
import { forkJoin } from 'rxjs';

/**
 * Component for administrative tasks including user mapping and visibility management.
 */
@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  /** Event emitted when the admin panel is closed. */
  @Output() readonly closePanel = new EventEmitter<void>();

  /** List of contributors in the analyzed folder. */
  @Input() contributorsInFolder: any[] = [];

  /** Mapping of GitHub nicknames to real names. */
  @Input() githubToReal: { [nickname: string]: string } = {};

  /** Mapping of folder names to real names. */
  @Input() folderToRealName: { [folderName: string]: string } = {};

  /** Mapping of folder names to github nicknames. */
  folderToGithub: { [folderName: string]: string } = {};

  /** List of contributors who have met the current goal and have all exercises documented. */
  get fullyPassedContributors() {
    return this.contributorsInFolder.filter((c) => c.isCurrentGoalMet && c.totalUndocumented === 0);
  }

  /** List of contributors who have met the current goal but have missing documentation. */
  get passedWithMissingDocContributors() {
    return this.contributorsInFolder.filter((c) => c.isCurrentGoalMet && c.totalUndocumented > 0);
  }

  /** List of contributors who have not met the current goal. */
  get failedContributors() {
    return this.contributorsInFolder.filter((c) => !c.isCurrentGoalMet);
  }

  /** Reference to the report content element for image generation. */
  @ViewChild('reportContent') reportContent!: ElementRef;

  isAuthenticated = signal(false);
  password = signal('');
  mappings = signal<UserMapping[]>([]);
  contributors = signal<GithubCollaborator[]>([]);
  hiddenContributors = signal<string[]>([]);

  newFolderName = '';
  newNickname = '';
  newRealName = '';
  repoFolders = signal<string[]>([]);
  isLoadingFolders = signal(false);
  today = new Date();
  weekRange = '';
  activeAdminTab = 'mappings';

  /** Sorted repository folders: unmapped first. */
  sortedRepoFolders = computed(() => {
    return [...this.repoFolders()].sort((a, b) => {
      const aMapped = this.isMapped(a);
      const bMapped = this.isMapped(b);
      if (aMapped === bMapped) return a.localeCompare(b);
      return aMapped ? 1 : -1;
    });
  });

  /** Sorted GitHub contributors: unmapped first. */
  sortedContributors = computed(() => {
    return [...this.contributors()].sort((a, b) => {
      const aMapped = this.isNicknameMapped(a.login);
      const bMapped = this.isNicknameMapped(b.login);
      if (aMapped === bMapped) return a.login.localeCompare(b.login);
      return aMapped ? 1 : -1;
    });
  });

  constructor(
    private githubService: GithubService,
    private configService: ConfigService,
    private toastr: ToastrService,
  ) {}

  /**
   * Initializes the component by loading mappings, hidden contributors, and calculating the week range.
   */
  ngOnInit() {
    this.loadMappings();
    this.loadHidden();
    this.calculateWeekRange();
    this.loadRepoFolders();
  }

  /**
   * Loads folder names from the repository to facilitate mapping.
   */
  loadRepoFolders() {
    this.isLoadingFolders.set(true);
    const paths = ['Resueltos_por_competidor', 'Codigos_por_competidor'];
    const folderSet = new Set<string>();

    forkJoin(paths.map((path) => this.githubService.getFolderContents(path))).subscribe({
      next: (results: GithubContent[][]) => {
        results.forEach((contents: GithubContent[]) => {
          contents.forEach((item: GithubContent) => {
            if (item.type === 'dir') {
              folderSet.add(item.name);
            }
          });
        });
        this.repoFolders.set(Array.from(folderSet).sort());
        this.isLoadingFolders.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar carpetas del repositorio:', err);
        this.isLoadingFolders.set(false);
      },
    });
  }

  /**
   * Calculates the date range for the current week (Monday to Sunday).
   */
  calculateWeekRange() {
    const now = new Date();
    const start = new Date(now);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Sunday
    end.setHours(23, 59, 59, 999);

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    this.weekRange = `${start.toLocaleDateString('es-ES', options)} - ${end.toLocaleDateString('es-ES', options)}`;
  }

  /**
   * Authenticates the admin user using the provided password.
   */
  login() {
    if (compareSync(this.password(), environment.adminPasswordHash)) {
      this.isAuthenticated.set(true);
      this.loadContributors();
      this.toastr.success('Sesión iniciada correctamente');
    } else {
      this.toastr.error('Contraseña incorrecta');
    }
  }

  /**
   * Loads the list of contributors from GitHub, filtering out bots and excluded users.
   */
  loadContributors() {
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
    this.githubService.getCollaborators().subscribe({
      next: (data: GithubCollaborator[]) => {
        // Filter those with push permissions and not bots/excluded
        const filtered = data.filter(
          (c: GithubCollaborator) =>
            c.permissions?.push &&
            !excludedLogins.includes(c.login) &&
            !(c.login && c.login.toLowerCase().includes('copilot')),
        );
        this.contributors.set(filtered);
      },
      error: (err: any) => console.error('Error al cargar colaboradores:', err),
    });
  }

  /**
   * Loads user mappings from the configuration service.
   */
  loadMappings() {
    this.configService.getMappings().subscribe({
      next: (data: UserMapping[]) => {
        this.mappings.set(data);
        const folderToGit: { [folderName: string]: string } = {};
        const gitToReal: { [nickname: string]: string } = {};
        data.forEach((m: UserMapping) => {
          folderToGit[m.folderName.toLowerCase()] = m.githubNickname;
          gitToReal[m.githubNickname.toLowerCase()] = m.realName;
        });
        this.folderToGithub = folderToGit;
        this.githubToReal = gitToReal;
      },
      error: (err: any) => console.error('Error al cargar mapeos:', err),
    });
  }

  /**
   * Loads hidden contributors from the configuration service.
   */
  loadHidden() {
    this.configService.getHidden().subscribe({
      next: (data: any[]) => this.hiddenContributors.set(data.map((h) => h.githubNickname)),
      error: (err: any) => console.error('Error al cargar colaboradores ocultos:', err),
    });
  }

  /**
   * Toggles the visibility of a contributor.
   * @param login The GitHub login of the contributor.
   */
  toggleHideContributor(login: string) {
    const current = this.hiddenContributors();
    if (current.includes(login)) {
      this.configService.deleteHidden(login).subscribe({
        next: () => {
          this.hiddenContributors.set(current.filter((l) => l !== login));
          this.toastr.info(`Colaborador ${login} visible`);
        },
        error: (err) => {
          console.error('Error al mostrar colaborador:', err);
          this.toastr.error('Error al actualizar colaborador');
        },
      });
    } else {
      this.configService.saveHidden({ githubNickname: login }).subscribe({
        next: () => {
          this.hiddenContributors.set([...current, login]);
          this.toastr.info(`Colaborador ${login} oculto`);
        },
        error: (err) => {
          console.error('Error al ocultar colaborador:', err);
          this.toastr.error('Error al actualizar colaborador');
        },
      });
    }
  }

  /**
   * Checks if a contributor is hidden.
   * @param login The GitHub login of the contributor.
   * @returns True if hidden, false otherwise.
   */
  isHidden(login: string): boolean {
    return this.hiddenContributors().includes(login);
  }

  /**
   * Adds a new user mapping between a folder name, GitHub nickname and real name.
   */
  addMapping() {
    if (this.newFolderName.trim() && this.newNickname.trim() && this.newRealName.trim()) {
      const current = this.mappings();
      const exists = current.find(
        (mapping) => mapping.folderName.toLowerCase() === this.newFolderName.toLowerCase(),
      );

      if (exists) {
        this.toastr.warning('Esta carpeta ya tiene un mapeo. Elimínelo primero para cambiarlo.');
        return;
      }

      const newMapping: UserMapping = {
        folderName: this.newFolderName.trim(),
        githubNickname: this.newNickname.trim(),
        realName: this.newRealName.trim(),
      };

      this.configService.saveMapping(newMapping).subscribe({
        next: (saved: UserMapping) => {
          this.mappings.set([...current, saved]);
          this.folderToGithub[saved.folderName.toLowerCase()] = saved.githubNickname;
          this.githubToReal[saved.githubNickname.toLowerCase()] = saved.realName;
          this.newFolderName = '';
          this.newNickname = '';
          this.newRealName = '';
          this.toastr.success('Mapeo guardado correctamente');
        },
        error: (err: any) => {
          console.error('Error al guardar mapeo:', err);
          this.toastr.error('Error al guardar mapeo');
        },
      });
    } else {
      this.toastr.warning('Por favor complete todos los campos');
    }
  }

  /**
   * Selects a collaborator to pre-fill the mapping form.
   * @param collaborator The GitHub collaborator.
   */
  selectCollaborator(collaborator: GithubCollaborator) {
    this.newNickname = collaborator.login;
    // Si ya existe un mapeo para este nickname, podemos sugerir el nombre real
    const existing = this.mappings().find(
      (m) => m.githubNickname.toLowerCase() === collaborator.login.toLowerCase(),
    );
    if (existing) {
      this.newRealName = existing.realName;
    }
    this.toastr.info(`Colaborador ${collaborator.login} seleccionado`);
  }

  /**
   * Gets the avatar URL for a given GitHub nickname.
   * @param nickname The GitHub nickname.
   * @returns The avatar URL or a default one.
   */
  getAvatarUrl(nickname: string): string {
    const contributor = this.contributors().find(
      (c) => c.login.toLowerCase() === nickname.toLowerCase(),
    );
    return contributor?.avatar_url || `https://github.com/${nickname}.png`;
  }

  /**
   * Removes an existing user mapping.
   * @param folderName The folder name to remove the mapping for.
   */
  removeMapping(folderName: string) {
    this.configService.deleteMapping(folderName).subscribe({
      next: () => {
        const mapping = this.mappings().find((m: UserMapping) => m.folderName === folderName);
        if (mapping) {
          delete this.folderToGithub[mapping.folderName.toLowerCase()];
          // No borramos de githubToReal porque otros mapeos podrían usarlo
        }
        this.mappings.set(
          this.mappings().filter((mapping: UserMapping) => mapping.folderName !== folderName),
        );
        this.toastr.info('Mapeo eliminado');
      },
      error: (err: any) => {
        console.error('Error al eliminar mapeo:', err);
        this.toastr.error('Error al eliminar mapeo');
      },
    });
  }

  /**
   * Fills the mapping form with the selected folder name.
   * @param folderName The folder name to fill.
   */
  fillMapping(folderName: string) {
    this.newFolderName = folderName;
    this.newNickname = '';
    this.newRealName = '';
  }

  /**
   * Checks if a folder name already has a mapping.
   * @param folderName The folder name to check.
   * @returns True if mapped, false otherwise.
   */
  isMapped(folderName: string): boolean {
    return this.mappings().some(
      (mapping) => mapping.folderName.toLowerCase() === folderName.toLowerCase(),
    );
  }

  /**
   * Checks if a GitHub nickname already has a mapping.
   * @param nickname The GitHub nickname to check.
   * @returns True if mapped, false otherwise.
   */
  isNicknameMapped(nickname: string): boolean {
    return this.mappings().some(
      (mapping) => mapping.githubNickname.toLowerCase() === nickname.toLowerCase(),
    );
  }

  /**
   * Gets the GitHub nickname associated with a folder name.
   * @param folderName The folder name.
   * @returns The GitHub nickname or an empty string if not found.
   */
  getGithubNickname(folderName: string): string {
    const mapping = this.mappings().find(
      (m) => m.folderName.toLowerCase() === folderName.toLowerCase(),
    );
    return mapping ? mapping.githubNickname : '';
  }

  /**
   * Gets the real name associated with a folder name.
   * @param folderName The folder name.
   * @returns The real name or an empty string if not found.
   */
  getRealName(folderName: string): string {
    const mapping = this.mappings().find(
      (m) => m.folderName.toLowerCase() === folderName.toLowerCase(),
    );
    return mapping ? mapping.realName : '';
  }

  /**
   * Opens the GitHub profile of a user in a new tab.
   * @param nickname The GitHub nickname.
   */
  goToProfile(nickname: string) {
    Admin.goToProfile(nickname);
  }

  /**
   * Opens the GitHub profile of a user in a new tab (static version).
   * @param nickname The GitHub nickname.
   */
  static goToProfile(nickname: string) {
    window.open(`https://github.com/${nickname}`, '_blank');
  }

  /**
   * Gets the list of contributors who are not hidden.
   * @returns List of visible contributors.
   */
  getVisibleContributors() {
    return this.contributors().filter((c) => !this.isHidden(c.login));
  }

  /**
   * Gets the list of contributors who are hidden.
   * @returns List of hidden contributors.
   */
  getHiddenContributors() {
    return this.contributors().filter((c) => this.isHidden(c.login));
  }

  /**
   * Closes the admin panel.
   */
  onClose() {
    this.closePanel.emit();
  }

  /**
   * Gets the display name (real name or login) for a contributor (folder owner).
   * @param login The folder name.
   * @returns The display name.
   */
  getDisplayName(login: string): string {
    const realName = this.getRealName(login);
    return realName || login;
  }

  /**
   * Generates and downloads an image report of the weekly status.
   */
  downloadReport() {
    if (!this.reportContent) {
      this.toastr.error('No se pudo encontrar el contenido del reporte');
      return;
    }

    const element = this.reportContent.nativeElement;

    this.toastr.info('Generando imagen...');

    html2canvas(element, {
      backgroundColor: '#1e1e1e',
      scale: 2,
      useCORS: true,
      logging: false,
    })
      .then((canvas) => {
        const link = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        link.download = `Reporte_Semanal_GPC_${dateStr}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        this.toastr.success('Reporte descargado correctamente');
      })
      .catch((err) => {
        console.error('Error al generar imagen:', err);
        this.toastr.error('Error al generar el reporte');
      });
  }

  /**
   * Clears local storage settings after user confirmation.
   */
  clearLocalStorage() {
    // DeepSource JS-0052: Unexpected confirm.
    // Using native confirm as a quick way for critical action, but we acknowledge the warning.
    // In a full refactor, this should be a custom UI modal.
    const message = '¿Estás seguro de que deseas limpiar la configuración local (tema y ajustes)?';
    if (window.confirm(message)) {
      localStorage.clear();
      this.toastr.success('Configuración local eliminada. La página se recargará.');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }
}
