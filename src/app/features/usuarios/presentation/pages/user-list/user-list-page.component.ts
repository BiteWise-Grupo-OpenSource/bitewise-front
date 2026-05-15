import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import type { User, Goal, ActivityLevel } from '../../../domain/entities';
import { UserRepositoryPort, GoalRepositoryPort, ActivityLevelRepositoryPort } from '../../../domain/ports';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [
    TranslateModule, MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatChipsModule,
    MatSnackBarModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>{{ 'USERS.TITLE' | translate }}</h1>
          <p class="text-muted">{{ users.length }} users registered</p>
        </div>
        <button mat-flat-button (click)="onCreate()">
          <mat-icon>add</mat-icon>
          {{ 'USERS.NEW' | translate }}
        </button>
      </div>

      <mat-card class="user-list__card">
        <div class="user-list__search">
          <mat-form-field appearance="outline" class="user-list__search-field">
            <mat-label>{{ 'USERS.SEARCH' | translate }}</mat-label>
            <input matInput (input)="onSearch($event)" />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>

        <table mat-table [dataSource]="filteredUsers" class="user-list__table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>{{ 'USERS.NAME' | translate }}</th>
            <td mat-cell *matCellDef="let user">
              <div class="user-list__user-cell">
                <img [src]="user.avatarUrl" [alt]="user.firstName" class="user-list__avatar" />
                <div>
                  <span class="user-list__name">{{ user.firstName }} {{ user.lastName }}</span>
                  <span class="user-list__role">{{ user.role }}</span>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>{{ 'USERS.EMAIL' | translate }}</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <ng-container matColumnDef="goal">
            <th mat-header-cell *matHeaderCellDef>{{ 'USERS.GOAL' | translate }}</th>
            <td mat-cell *matCellDef="let user">
              <mat-chip-set>
                <mat-chip>{{ getGoalName(user.id) }}</mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="activity">
            <th mat-header-cell *matHeaderCellDef>{{ 'USERS.ACTIVITY' | translate }}</th>
            <td mat-cell *matCellDef="let user">{{ getActivityName(user.id) }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>{{ 'USERS.ACTIONS' | translate }}</th>
            <td mat-cell *matCellDef="let user">
              <button mat-icon-button [matTooltip]="'COMMON.EDIT' | translate" (click)="onEdit(user)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button [matTooltip]="'COMMON.DELETE' | translate" (click)="onDelete(user)" class="user-list__delete-btn">
                <mat-icon>delete</mat-icon>
              </button>
              <button mat-icon-button matTooltip="View" (click)="onView(user)">
                <mat-icon>visibility</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card>
    </div>
  `,
  styles: [`
    .user-list__card { padding: 0; overflow: hidden; }
    .user-list__search { padding: var(--space-md) var(--space-lg); border-bottom: 1px solid rgba(122,116,104,0.08); }
    .user-list__search-field { width: 100%; max-width: 400px; }
    .user-list__table { width: 100%; }
    .user-list__user-cell { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-sm) 0; }
    .user-list__avatar { width: 40px; height: 40px; border-radius: var(--radius-full); background: var(--bw-mint); }
    .user-list__name { display: block; font-weight: 500; }
    .user-list__role { display: block; font-size: 0.75rem; color: var(--bw-stone); text-transform: capitalize; }
    .user-list__delete-btn { color: var(--bw-danger); }
    .page-header button { background: var(--bw-copper) !important; color: #fff !important; }
  `]
})
export class UserListPageComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  goals: Goal[] = [];
  activityLevels: ActivityLevel[] = [];
  displayedColumns = ['name', 'email', 'goal', 'activity', 'actions'];

  constructor(
    private router: Router,
    private userRepo: UserRepositoryPort,
    private goalRepo: GoalRepositoryPort,
    private activityRepo: ActivityLevelRepositoryPort,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    forkJoin({
      users: this.userRepo.getAll(),
      goals: this.goalRepo.getAll(),
      activities: this.activityRepo.getAll()
    }).subscribe(({ users, goals, activities }) => {
      this.users = users;
      this.filteredUsers = users;
      this.goals = goals;
      this.activityLevels = activities;
    });
  }

  onSearch(event: Event): void {
    const q = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)
    );
  }

  getGoalName(userId: number): string { return this.goals[0]?.name || '—'; }
  getActivityName(userId: number): string { return this.activityLevels[0]?.name || '—'; }

  onCreate(): void { this.router.navigate(['/app/usuarios/new']); }
  onEdit(user: User): void { this.router.navigate(['/app/usuarios/edit', user.id]); }
  onView(user: User): void { this.router.navigate(['/app/usuarios', user.id]); }

  onDelete(user: User): void {
    if (confirm(this.translate.instant('USERS.DELETE_CONFIRM'))) {
      this.userRepo.delete(user.id).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('USERS.DELETED'), 'OK', { duration: 2000 });
          this.loadData();
        }
      });
    }
  }
}
