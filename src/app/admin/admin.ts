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
import { GithubService } from '../github.service';
import { ConfigService, UserMapping } from '../config.service';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import * as bcrypt from 'bcryptjs';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Input() passedContributors: any[] = [];
  @Input() failedContributors: any[] = [];
  @Input() userMappings: { [nickname: string]: string } = {};
  @ViewChild('reportContent') reportContent!: ElementRef;

  isAuthenticated = signal(false);
  password = signal('');
  mappings = signal<UserMapping[]>([]);
  contributors = signal<any[]>([]);
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

  ngOnInit() {
    this.loadMappings();
    this.loadHidden();
    this.calculateWeekRange();
  }

  calculateWeekRange() {
    const now = new Date();
    const start = new Date(now);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Lunes
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Domingo
    end.setHours(23, 59, 59, 999);

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    this.weekRange = `${start.toLocaleDateString('es-ES', options)} - ${end.toLocaleDateString('es-ES', options)}`;
  }

  login() {
    if (bcrypt.compareSync(this.password(), environment.adminPasswordHash)) {
      this.isAuthenticated.set(true);
      this.loadContributors();
      this.toastr.success('Sesión iniciada correctamente');
    } else {
      this.toastr.error('Contraseña incorrecta');
    }
  }

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
      next: (data) => {
        // Filtrar aquellos que tengan permisos de push y no sean bots ni usuarios excluidos
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

  loadMappings() {
    this.configService.getMappings().subscribe({
      next: (data) => this.mappings.set(data),
      error: (err) => console.error('Error al cargar mapeos:', err),
    });
  }

  loadHidden() {
    this.configService.getHidden().subscribe({
      next: (data) => this.hiddenContributors.set(data.map((h) => h.githubNickname)),
      error: (err) => console.error('Error al cargar colaboradores ocultos:', err),
    });
  }

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

  isHidden(login: string): boolean {
    return this.hiddenContributors().includes(login);
  }

  addMapping() {
    if (this.newNickname.trim() && this.newRealName.trim()) {
      const current = this.mappings();
      const exists = current.find(
        (m) => m.githubNickname.toLowerCase() === this.newNickname.toLowerCase(),
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

  removeMapping(nickname: string) {
    this.configService.deleteMapping(nickname).subscribe({
      next: () => {
        this.mappings.set(this.mappings().filter((m) => m.githubNickname !== nickname));
        this.toastr.info('Mapeo eliminado');
      },
      error: (err) => {
        console.error('Error al eliminar mapeo:', err);
        this.toastr.error('Error al eliminar mapeo');
      },
    });
  }

  fillMapping(nickname: string) {
    this.newNickname = nickname;
    this.newRealName = '';
    // Enfocar el input de nombre real si fuera posible, pero aquí solo seteamos el valor
  }

  isMapped(nickname: string): boolean {
    return this.mappings().some((m) => m.githubNickname.toLowerCase() === nickname.toLowerCase());
  }

  getRealName(nickname: string): string {
    const m = this.mappings().find(
      (m) => m.githubNickname.toLowerCase() === nickname.toLowerCase(),
    );
    return m ? m.realName : '';
  }

  goToProfile(nickname: string) {
    window.open(`https://github.com/${nickname}`, '_blank');
  }

  getVisibleContributors() {
    return this.contributors().filter((c) => !this.isHidden(c.login));
  }

  getHiddenContributors() {
    return this.contributors().filter((c) => this.isHidden(c.login));
  }

  onClose() {
    this.close.emit();
  }

  getDisplayName(login: string): string {
    return this.userMappings[login.toLowerCase()] || login;
  }

  downloadReport() {
    if (!this.reportContent) {
      this.toastr.error('No se pudo encontrar el contenido del reporte');
      return;
    }

    const element = this.reportContent.nativeElement;
    // Asegurarse de que el elemento sea visible temporalmente para html2canvas si fuera necesario,
    // pero con el enfoque de dejarlo fuera de la pantalla (top: -9999px) debería funcionar.

    this.toastr.info('Generando imagen...');

    html2canvas(element, {
      backgroundColor: '#1e1e1e', // Fondo oscuro para que coincida con el tema
      scale: 2, // Mejor calidad
      useCORS: true, // Para las imágenes de avatar de GitHub
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
}
