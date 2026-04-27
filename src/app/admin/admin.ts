import { Component, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { GithubService } from '../github.service';
import { environment } from '../../environments/environment';
import * as bcrypt from 'bcryptjs';

interface UserMapping {
  githubNickname: string;
  realName: string;
}

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

  private readonly STORAGE_KEY = 'github_user_mappings';
  private readonly HIDDEN_KEY = 'github_hidden_contributors';

  constructor(private githubService: GithubService) {}

  ngOnInit() {
    this.loadMappings();
    this.loadHidden();
  }

  login() {
    if (bcrypt.compareSync(this.password(), environment.adminPasswordHash)) {
      this.isAuthenticated.set(true);
      this.loadContributors();
    } else {
      alert('Contraseña incorrecta');
    }
  }

  loadContributors() {
    this.githubService.getContributors().subscribe({
      next: (data) => {
        this.contributors.set(data);
      },
      error: (err) => console.error('Error al cargar contribuidores:', err)
    });
  }

  loadMappings() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      this.mappings.set(JSON.parse(saved));
    }
  }

  loadHidden() {
    const saved = localStorage.getItem(this.HIDDEN_KEY);
    if (saved) {
      this.hiddenContributors.set(JSON.parse(saved));
    }
  }

  saveMappings() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.mappings()));
  }

  saveHidden() {
    localStorage.setItem(this.HIDDEN_KEY, JSON.stringify(this.hiddenContributors()));
  }

  toggleHideContributor(login: string) {
    const current = this.hiddenContributors();
    if (current.includes(login)) {
      this.hiddenContributors.set(current.filter(l => l !== login));
    } else {
      this.hiddenContributors.set([...current, login]);
    }
    this.saveHidden();
  }

  isHidden(login: string): boolean {
    return this.hiddenContributors().includes(login);
  }

  addMapping() {
    if (this.newNickname.trim() && this.newRealName.trim()) {
      const current = this.mappings();
      const exists = current.find(m => m.githubNickname.toLowerCase() === this.newNickname.toLowerCase());

      if (exists) {
        alert('Este nickname ya está registrado');
        return;
      }

      this.mappings.set([...current, {
        githubNickname: this.newNickname.trim(),
        realName: this.newRealName.trim()
      }]);

      this.newNickname = '';
      this.newRealName = '';
      this.saveMappings();
    }
  }

  removeMapping(nickname: string) {
    this.mappings.set(this.mappings().filter(m => m.githubNickname !== nickname));
    this.saveMappings();
  }

  fillMapping(nickname: string) {
    this.newNickname = nickname;
    this.newRealName = '';
    // Enfocar el input de nombre real si fuera posible, pero aquí solo seteamos el valor
  }

  isMapped(nickname: string): boolean {
    return this.mappings().some(m => m.githubNickname.toLowerCase() === nickname.toLowerCase());
  }

  getRealName(nickname: string): string {
    const m = this.mappings().find(m => m.githubNickname.toLowerCase() === nickname.toLowerCase());
    return m ? m.realName : '';
  }

  goToProfile(nickname: string) {
    window.open(`https://github.com/${nickname}`, '_blank');
  }

  onClose() {
    this.close.emit();
  }
}
