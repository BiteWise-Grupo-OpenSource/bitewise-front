import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import type { User, HealthProfile, Goal, ActivityLevel, Allergy } from '../../../domain/entities';
import {
  UserRepositoryPort, HealthProfileRepositoryPort,
  GoalRepositoryPort, ActivityLevelRepositoryPort, AllergyRepositoryPort
} from '../../../domain/ports';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [
    TranslateModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatDividerModule, MatSnackBarModule, DatePipe
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ 'USERS.DETAIL' | translate }}</h1>
        <div class="page-header__actions">
          <button mat-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon> {{ 'COMMON.BACK' | translate }}
          </button>
          @if (user) {
            <button mat-flat-button (click)="onEdit()">
              <mat-icon>edit</mat-icon> {{ 'COMMON.EDIT' | translate }}
            </button>
          }
        </div>
      </div>

      @if (user) {
        <div class="detail-grid">
          <mat-card class="detail-card detail-card--user">
            <mat-card-content>
              <div class="detail-card__avatar-section">
                <img [src]="user.avatarUrl" [alt]="user.firstName" class="detail-card__avatar" />
                <h2>{{ user.firstName }} {{ user.lastName }}</h2>
                <p class="text-muted">{{ user.email }}</p>
                <mat-chip-set>
                  <mat-chip class="detail-card__role-chip">{{ user.role }}</mat-chip>
                </mat-chip-set>
              </div>
              <mat-divider />
              <div class="detail-card__meta">
                <div class="detail-card__meta-item">
                  <mat-icon>calendar_today</mat-icon>
                  <span>Joined {{ user.createdAt | date:'mediumDate' }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          @if (profile) {
            <mat-card class="detail-card">
              <mat-card-header><mat-card-title>{{ 'PROFILE.TITLE' | translate }}</mat-card-title></mat-card-header>
              <mat-card-content>
                <div class="detail-card__stats">
                  <div class="stat-item">
                    <span class="stat-item__value">{{ profile.weight }} kg</span>
                    <span class="stat-item__label">{{ 'PROFILE.WEIGHT' | translate }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-item__value">{{ profile.height }} cm</span>
                    <span class="stat-item__label">{{ 'PROFILE.HEIGHT' | translate }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-item__value">{{ profile.age }}</span>
                    <span class="stat-item__label">{{ 'PROFILE.AGE' | translate }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-item__value">{{ profile.gender }}</span>
                    <span class="stat-item__label">{{ 'PROFILE.GENDER' | translate }}</span>
                  </div>
                </div>
                <mat-divider />
                <div class="detail-card__info-rows">
                  <div class="info-row">
                    <mat-icon>flag</mat-icon>
                    <div>
                      <span class="info-row__label">{{ 'PROFILE.GOAL' | translate }}</span>
                      <span class="info-row__value">{{ goalName }}</span>
                    </div>
                  </div>
                  <div class="info-row">
                    <mat-icon>directions_run</mat-icon>
                    <div>
                      <span class="info-row__label">{{ 'PROFILE.ACTIVITY_LEVEL' | translate }}</span>
                      <span class="info-row__value">{{ activityName }}</span>
                    </div>
                  </div>
                </div>
                @if (userAllergies.length > 0) {
                  <mat-divider />
                  <div class="detail-card__allergies">
                    <span class="info-row__label">{{ 'PROFILE.ALLERGIES' | translate }}</span>
                    <mat-chip-set>
                      @for (a of userAllergies; track a.id) {
                        <mat-chip>{{ a.name }}</mat-chip>
                      }
                    </mat-chip-set>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header__actions { display: flex; gap: var(--space-sm); }
    .page-header__actions button[mat-flat-button] { background: var(--bw-copper) !important; color: #fff !important; }
    .detail-grid { display: grid; grid-template-columns: 340px 1fr; gap: var(--space-lg); }
    .detail-card { padding: var(--space-lg); }
    .detail-card--user { text-align: center; }
    .detail-card__avatar-section { padding: var(--space-lg) 0; }
    .detail-card__avatar { width: 80px; height: 80px; border-radius: var(--radius-full); background: var(--bw-mint); margin-bottom: var(--space-md); }
    .detail-card__avatar-section h2 { margin-bottom: var(--space-xs); }
    .detail-card__role-chip { text-transform: capitalize; margin-top: var(--space-sm); }
    .detail-card__meta { padding: var(--space-md) 0; }
    .detail-card__meta-item { display: flex; align-items: center; gap: var(--space-sm); color: var(--bw-stone); font-size: 0.875rem; }
    .detail-card__stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); padding: var(--space-md) 0; }
    .stat-item { text-align: center; padding: var(--space-md); background: var(--bw-mint); border-radius: var(--radius-md); }
    .stat-item__value { display: block; font-size: 1.25rem; font-weight: 700; color: var(--bw-copper); }
    .stat-item__label { display: block; font-size: 0.75rem; color: var(--bw-stone); margin-top: var(--space-xs); }
    .detail-card__info-rows { padding: var(--space-md) 0; display: flex; flex-direction: column; gap: var(--space-md); }
    .info-row { display: flex; align-items: flex-start; gap: var(--space-md); }
    .info-row mat-icon { color: var(--bw-copper); margin-top: 2px; }
    .info-row__label { display: block; font-size: 0.75rem; color: var(--bw-stone); }
    .info-row__value { display: block; font-weight: 500; }
    .detail-card__allergies { padding: var(--space-md) 0; }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class UserDetailPageComponent implements OnInit {
  user: User | null = null;
  profile: HealthProfile | null = null;
  goalName = '';
  activityName = '';
  userAllergies: Allergy[] = [];

  constructor(
    private route: ActivatedRoute, private router: Router,
    private userRepo: UserRepositoryPort, private profileRepo: HealthProfileRepositoryPort,
    private goalRepo: GoalRepositoryPort, private activityRepo: ActivityLevelRepositoryPort,
    private allergyRepo: AllergyRepositoryPort, private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      user: this.userRepo.getById(id),
      profile: this.profileRepo.getByUserId(id),
      goals: this.goalRepo.getAll(),
      activities: this.activityRepo.getAll(),
      allergies: this.allergyRepo.getAll()
    }).subscribe(({ user, profile, goals, activities, allergies }) => {
      this.user = user;
      if (profile) {
        this.profile = profile;
        this.goalName = goals.find(g => g.id === profile.goalId)?.name || '—';
        this.activityName = activities.find(a => a.id === profile.activityLevelId)?.name || '—';
        this.userAllergies = allergies.filter(a => profile.allergyIds?.includes(a.id));
      }
    });
  }

  onEdit(): void { this.router.navigate(['/app/usuarios/edit', this.user!.id]); }
  goBack(): void { this.router.navigate(['/app/usuarios']); }
}
