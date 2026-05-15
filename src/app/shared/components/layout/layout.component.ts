import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, MatSidenavModule, ToolbarComponent, SidebarComponent],
  template: `
    <div class="layout">
      <app-toolbar
        (menuToggle)="sidenav.toggle()"
        (logoutClick)="onLogout()"
      />

      <mat-sidenav-container class="layout__container">
        <mat-sidenav
          #sidenav
          mode="side"
          [opened]="true"
          class="layout__sidenav"
        >
          <app-sidebar />
        </mat-sidenav>

        <mat-sidenav-content class="layout__content">
          <main class="layout__main">
            <router-outlet />
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .layout__container {
      flex: 1;
      overflow: hidden;
    }

    .layout__sidenav {
      width: 260px;
    }

    .layout__content {
      background: var(--bw-cream);
    }

    .layout__main {
      padding: var(--space-xl);
      min-height: calc(100vh - 64px);
    }
  `]
})
export class LayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(private router: Router) {}

  onLogout(): void {
    this.router.navigate(['/login']);
  }
}
