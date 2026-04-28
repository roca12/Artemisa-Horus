import { Component, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { GithubService } from '../github.service';
import { ConfigService, UserMapping } from '../config.service';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  @Output() close = new EventEmitter<void>();

  isAuthenticated = signal(false);
  password = signal('');
  mappings = signal<UserMapping[]>([]);
  contributors = signal<any[]>([]);
  hiddenContributors = signal<string[]>([]);

  newNickname = '';
  newRealName = '';

  constructor(
    private githubService: GithubService,
    private configService: ConfigService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.loadMappings();
    this.loadHidden();
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
}
