import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

interface NavItem {
  icon: string;
  labelKey: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, MatListModule, MatIconModule, TranslateModule],
  template: `
    <div class="sidebar">
      <nav>
        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a mat-list-item
               [routerLink]="item.route"
               routerLinkActive="sidebar__item--active"
               class="sidebar__item">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.labelKey | translate }}</span>
            </a>
          }
        </mat-nav-list>
      </nav>

      <div class="sidebar__footer">
        <div class="sidebar__brand-badge">
          <span class="sidebar__badge-dot"></span>
          <span class="sidebar__badge-text">BiteWise v1.0</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding-top: var(--space-md);
      background: #ffffff;
    }

    .sidebar__item {
      margin: 2px var(--space-sm);
      border-radius: var(--radius-md) !important;
      color: var(--bw-stone);
      transition: all 0.2s ease;
    }

    .sidebar__item:hover {
      background-color: var(--bw-mint) !important;
      color: var(--bw-charcoal);
    }

    .sidebar__item--active {
      background-color: rgba(200, 107, 58, 0.08) !important;
      color: var(--bw-copper) !important;
    }

    .sidebar__item--active mat-icon {
      color: var(--bw-copper) !important;
    }

    .sidebar__footer {
      margin-top: auto;
      padding: var(--space-md);
      border-top: 1px solid rgba(122, 116, 104, 0.1);
    }

    .sidebar__brand-badge {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm);
    }

    .sidebar__badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--bw-success);
    }

    .sidebar__badge-text {
      font-size: 0.75rem;
      color: var(--bw-stone);
    }
  `]
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/app' },
    { icon: 'people', labelKey: 'NAV.USERS', route: '/app/usuarios' },
    { icon: 'flag', labelKey: 'NAV.GOALS', route: '/app/usuarios/goals' },
    { icon: 'tune', labelKey: 'NAV.PREFERENCES', route: '/app/usuarios/preferences' }
  ];
}
