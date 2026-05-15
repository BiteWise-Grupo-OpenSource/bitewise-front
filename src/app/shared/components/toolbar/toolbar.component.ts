import { Component, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, TranslateModule],
  template: `
    <mat-toolbar class="toolbar">
      <button mat-icon-button (click)="menuToggle.emit()" class="toolbar__menu-btn">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="toolbar__brand">
        <img src="favicon.ico" alt="BiteWise" class="toolbar__logo" />
        <span class="toolbar__name">BiteWise</span>
      </span>

      <span class="toolbar__spacer"></span>

      <!-- Language switcher -->
      <button mat-icon-button [matMenuTriggerFor]="langMenu" class="toolbar__action">
        <mat-icon>language</mat-icon>
      </button>
      <mat-menu #langMenu="matMenu">
        <button mat-menu-item (click)="switchLang('en')">
          <span>🇺🇸 English</span>
        </button>
        <button mat-menu-item (click)="switchLang('es')">
          <span>🇵🇪 Español</span>
        </button>
      </mat-menu>

      <!-- User menu -->
      <button mat-icon-button [matMenuTriggerFor]="userMenu" class="toolbar__action">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #userMenu="matMenu">
        <button mat-menu-item>
          <mat-icon>person</mat-icon>
          <span>{{ 'NAV.PROFILE' | translate }}</span>
        </button>
        <button mat-menu-item (click)="logoutClick.emit()">
          <mat-icon>logout</mat-icon>
          <span>{{ 'NAV.LOGOUT' | translate }}</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #ffffff;
      height: 64px;
      padding: 0 var(--space-md);
    }

    .toolbar__brand {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin-left: var(--space-sm);
    }

    .toolbar__logo {
      width: 28px;
      height: 28px;
    }

    .toolbar__name {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--bw-copper);
    }

    .toolbar__spacer {
      flex: 1 1 auto;
    }

    .toolbar__action {
      color: var(--bw-stone);
    }

    .toolbar__menu-btn {
      color: var(--bw-charcoal);
    }
  `]
})
export class ToolbarComponent {
  menuToggle = output<void>();
  logoutClick = output<void>();

  constructor(private translate: TranslateService) {}

  switchLang(lang: string): void {
    this.translate.use(lang);
  }
}
