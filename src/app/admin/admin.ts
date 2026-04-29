import {
  Component,
  OnInit,
  signal,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { GithubService, GithubCollaborator } from '../github.service';
import { ConfigService, UserMapping } from '../config.service';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { compareSync } from 'bcryptjs';
import { ContributorInfo } from '../app';
import html2canvas from 'html2canvas';

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

  /** List of contributors who have met their goals. */
  @Input() passedContributors: ContributorInfo[] = [];

  /** List of contributors who have not met their goals. */
  @Input() failedContributors: ContributorInfo[] = [];

  /** Mapping of GitHub nicknames to real names. */
  @Input() userMappings: { [nickname: string]: string } = {};

  /** Reference to the report content element for image generation. */
  @ViewChild('reportContent') reportContent!: ElementRef;

  isAuthenticated = signal(false);
  password = signal('');
  mappings = signal<UserMapping[]>([]);
  contributors = signal<GithubCollaborator[]>([]);
  hiddenContributors = signal<string[]>([]);

  newNickname = '';
  newRealName = '';
  today = new Date();
  weekRange = '';

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
          (c) =>
            c.permissions?.push &&
            !excludedLogins.includes(c.login) &&
            !(c.login && c.login.toLowerCase().includes('copilot')),
        );
        this.contributors.set(filtered);
      },
      error: (err) => console.error('Error al cargar colaboradores:', err),
    });
  }

  /**
   * Loads user mappings from the configuration service.
   */
  loadMappings() {
    this.configService.getMappings().subscribe({
      next: (data) => this.mappings.set(data),
      error: (err) => console.error('Error al cargar mapeos:', err),
    });
  }

  /**
   * Loads hidden contributors from the configuration service.
   */
  loadHidden() {
    this.configService.getHidden().subscribe({
      next: (data) => this.hiddenContributors.set(data.map((h) => h.githubNickname)),
      error: (err) => console.error('Error al cargar colaboradores ocultos:', err),
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
   * Adds a new user mapping between a GitHub nickname and a real name.
   */
  addMapping() {
    if (this.newNickname.trim() && this.newRealName.trim()) {
      const current = this.mappings();
      const exists = current.find(
        (mapping) => mapping.githubNickname.toLowerCase() === this.newNickname.toLowerCase(),
      );

      if (exists) {
        this.toastr.warning('Este nickname ya está registrado');
        return;
      }

      const newMapping: UserMapping = {
        githubNickname: this.newNickname.trim(),
        realName: this.newRealName.trim(),
      };

      this.configService.saveMapping(newMapping).subscribe({
        next: (saved) => {
          this.mappings.set([...current, saved]);
          this.newNickname = '';
          this.newRealName = '';
          this.toastr.success('Mapeo guardado correctamente');
        },
        error: (err) => {
          console.error('Error al guardar mapeo:', err);
          this.toastr.error('Error al guardar mapeo');
        },
      });
    }
  }

  /**
   * Removes an existing user mapping.
   * @param nickname The GitHub nickname to remove the mapping for.
   */
  removeMapping(nickname: string) {
    this.configService.deleteMapping(nickname).subscribe({
      next: () => {
        this.mappings.set(this.mappings().filter((mapping) => mapping.githubNickname !== nickname));
        this.toastr.info('Mapeo eliminado');
      },
      error: (err) => {
        console.error('Error al eliminar mapeo:', err);
        this.toastr.error('Error al eliminar mapeo');
      },
    });
  }

  /**
   * Fills the mapping form with the selected nickname.
   * @param nickname The GitHub nickname to fill.
   */
  fillMapping(nickname: string) {
    this.newNickname = nickname;
    this.newRealName = '';
    // Focus real name input if possible, but here we just set the value
  }

  /**
   * Checks if a nickname already has a mapping.
   * @param nickname The GitHub nickname to check.
   * @returns True if mapped, false otherwise.
   */
  isMapped(nickname: string): boolean {
    return this.mappings().some(
      (mapping) => mapping.githubNickname.toLowerCase() === nickname.toLowerCase(),
    );
  }

  /**
   * Gets the real name associated with a GitHub nickname.
   * @param nickname The GitHub nickname.
   * @returns The real name or an empty string if not found.
   */
  getRealName(nickname: string): string {
    const mapping = this.mappings().find(
      (m) => m.githubNickname.toLowerCase() === nickname.toLowerCase(),
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
   * Emits the close panel event.
   */
  onClose() {
    this.closePanel.emit();
  }

  /**
   * Gets the display name (real name or login) for a contributor.
   * @param login The GitHub login.
   * @returns The display name.
   */
  getDisplayName(login: string): string {
    return this.userMappings[login.toLowerCase()] || login;
  }

  /**
   * Generates and downloads a report image of the weekly status.
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
