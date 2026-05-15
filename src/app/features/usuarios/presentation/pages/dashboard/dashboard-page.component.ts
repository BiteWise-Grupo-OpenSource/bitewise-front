import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import type { User, HealthProfile, Goal, ActivityLevel, Allergy } from '../../../domain/entities';
import {
  UserRepositoryPort, HealthProfileRepositoryPort,
  GoalRepositoryPort, ActivityLevelRepositoryPort, AllergyRepositoryPort
} from '../../../domain/ports';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    TranslateModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatDividerModule, MatProgressBarModule
  ],
  template: `
    <div class="page-container">
      @if (user) {
        <!-- Welcome header -->
        <div class="dash-header">
          <div class="dash-header__info">
            <img [src]="user.avatarUrl" [alt]="user.firstName" class="dash-header__avatar" />
            <div>
              <h1>{{ 'DASHBOARD.WELCOME' | translate }} {{ user.firstName }}!</h1>
              <p class="text-muted">{{ user.email }}</p>
            </div>
          </div>
          <button mat-flat-button (click)="onEditProfile()" class="dash-header__edit-btn">
            <mat-icon>edit</mat-icon>
            {{ 'DASHBOARD.EDIT_PROFILE' | translate }}
          </button>
        </div>

        @if (profile) {
          <!-- Stats cards -->
          <div class="dash-stats">
            <!-- BMI Card -->
            <mat-card class="dash-stat-card dash-stat-card--bmi">
              <mat-card-content>
                <div class="dash-stat-card__icon-wrap dash-stat-card__icon-wrap--bmi">
                  <mat-icon>monitor_weight</mat-icon>
                </div>
                <span class="dash-stat-card__value" [class]="'dash-stat-card__value--' + bmiCategory">{{ bmiValue }}</span>
                <span class="dash-stat-card__label">{{ 'DASHBOARD.BMI' | translate }}</span>
                <span class="dash-stat-card__badge" [class]="'dash-stat-card__badge--' + bmiCategory">{{ bmiCategoryLabel }}</span>
              </mat-card-content>
            </mat-card>

            <!-- Daily Calories Card -->
            <mat-card class="dash-stat-card">
              <mat-card-content>
                <div class="dash-stat-card__icon-wrap dash-stat-card__icon-wrap--cal">
                  <mat-icon>local_fire_department</mat-icon>
                </div>
                <span class="dash-stat-card__value dash-stat-card__value--cal">{{ dailyCalories }}</span>
                <span class="dash-stat-card__label">{{ 'DASHBOARD.DAILY_CALORIES' | translate }}</span>
                <span class="dash-stat-card__sub">kcal / day</span>
              </mat-card-content>
            </mat-card>

            <!-- Goal Card -->
            <mat-card class="dash-stat-card">
              <mat-card-content>
                <div class="dash-stat-card__icon-wrap dash-stat-card__icon-wrap--goal">
                  <mat-icon>{{ goalData?.icon || 'flag' }}</mat-icon>
                </div>
                <span class="dash-stat-card__value dash-stat-card__value--goal">{{ goalData?.name || '—' }}</span>
                <span class="dash-stat-card__label">{{ 'DASHBOARD.GOAL' | translate }}</span>
              </mat-card-content>
            </mat-card>

            <!-- Activity Card -->
            <mat-card class="dash-stat-card">
              <mat-card-content>
                <div class="dash-stat-card__icon-wrap dash-stat-card__icon-wrap--act">
                  <mat-icon>directions_run</mat-icon>
                </div>
                <span class="dash-stat-card__value dash-stat-card__value--act">{{ activityData?.name || '—' }}</span>
                <span class="dash-stat-card__label">{{ 'DASHBOARD.ACTIVITY' | translate }}</span>
                <span class="dash-stat-card__sub">x{{ activityData?.multiplier || 0 }}</span>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Body details -->
          <div class="dash-details">
            <mat-card class="dash-body-card">
              <mat-card-header>
                <mat-card-title>{{ 'DASHBOARD.YOUR_PROFILE' | translate }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="body-grid">
                  <div class="body-item">
                    <mat-icon>fitness_center</mat-icon>
                    <div class="body-item__data">
                      <span class="body-item__value">{{ profile.weight }} kg</span>
                      <span class="body-item__label">{{ 'PROFILE.WEIGHT' | translate }}</span>
                    </div>
                  </div>
                  <div class="body-item">
                    <mat-icon>height</mat-icon>
                    <div class="body-item__data">
                      <span class="body-item__value">{{ profile.height }} cm</span>
                      <span class="body-item__label">{{ 'PROFILE.HEIGHT' | translate }}</span>
                    </div>
                  </div>
                  <div class="body-item">
                    <mat-icon>cake</mat-icon>
                    <div class="body-item__data">
                      <span class="body-item__value">{{ profile.age }} years</span>
                      <span class="body-item__label">{{ 'PROFILE.AGE' | translate }}</span>
                    </div>
                  </div>
                  <div class="body-item">
                    <mat-icon>person</mat-icon>
                    <div class="body-item__data">
                      <span class="body-item__value body-item__value--cap">{{ profile.gender }}</span>
                      <span class="body-item__label">{{ 'PROFILE.GENDER' | translate }}</span>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="dash-body-card">
              <mat-card-header>
                <mat-card-title>{{ 'DASHBOARD.CALORIC_BREAKDOWN' | translate }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="macro-list">
                  <div class="macro-item">
                    <div class="macro-item__header">
                      <span class="macro-item__name">Protein</span>
                      <span class="macro-item__grams">{{ macros.protein }}g</span>
                    </div>
                    <mat-progress-bar mode="determinate" [value]="macros.proteinPct" color="primary" />
                  </div>
                  <div class="macro-item">
                    <div class="macro-item__header">
                      <span class="macro-item__name">Carbohydrates</span>
                      <span class="macro-item__grams">{{ macros.carbs }}g</span>
                    </div>
                    <mat-progress-bar mode="determinate" [value]="macros.carbsPct" color="accent" />
                  </div>
                  <div class="macro-item">
                    <div class="macro-item__header">
                      <span class="macro-item__name">Fats</span>
                      <span class="macro-item__grams">{{ macros.fats }}g</span>
                    </div>
                    <mat-progress-bar mode="determinate" [value]="macros.fatsPct" color="warn" />
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Allergies -->
          @if (userAllergies.length > 0) {
            <mat-card class="dash-allergies-card">
              <mat-card-header>
                <mat-card-title>{{ 'DASHBOARD.ALLERGIES' | translate }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-chip-set>
                  @for (a of userAllergies; track a.id) {
                    <mat-chip class="dash-allergy-chip">
                      <mat-icon matChipAvatar>no_food</mat-icon>
                      {{ a.name }}
                    </mat-chip>
                  }
                </mat-chip-set>
              </mat-card-content>
            </mat-card>
          }
        } @else {
          <!-- No profile -> redirect to onboarding -->
          <mat-card class="dash-empty">
            <mat-card-content>
              <mat-icon class="dash-empty__icon">person_add</mat-icon>
              <h2>Complete your profile</h2>
              <p class="text-muted">Set up your body metrics and goals to get personalized nutrition plans.</p>
              <button mat-flat-button (click)="goToOnboarding()" class="dash-empty__btn">
                <mat-icon>arrow_forward</mat-icon>
                Start Setup
              </button>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl); }
    .dash-header__info { display: flex; align-items: center; gap: var(--space-md); }
    .dash-header__avatar { width: 56px; height: 56px; border-radius: var(--radius-full); background: var(--bw-mint); }
    .dash-header__info h1 { font-size: 1.5rem; margin-bottom: 2px; }
    .dash-header__edit-btn { background: var(--bw-copper) !important; color: #fff !important; }

    /* Stats grid */
    .dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); margin-bottom: var(--space-xl); }

    .dash-stat-card {
      text-align: center;
      padding: var(--space-lg);
      border-radius: var(--radius-lg) !important;
      transition: transform 0.2s ease;
    }
    .dash-stat-card:hover { transform: translateY(-2px); }

    .dash-stat-card__icon-wrap {
      width: 48px; height: 48px; border-radius: var(--radius-md);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: var(--space-sm);
    }
    .dash-stat-card__icon-wrap--bmi { background: rgba(200,107,58,0.1); color: var(--bw-copper); }
    .dash-stat-card__icon-wrap--cal { background: rgba(244,67,54,0.1); color: #f44336; }
    .dash-stat-card__icon-wrap--goal { background: rgba(76,175,80,0.1); color: #4caf50; }
    .dash-stat-card__icon-wrap--act { background: rgba(33,150,243,0.1); color: #2196f3; }

    .dash-stat-card__value { display: block; font-size: 1.75rem; font-weight: 700; }
    .dash-stat-card__value--normal { color: var(--bw-success); }
    .dash-stat-card__value--underweight, .dash-stat-card__value--overweight { color: var(--bw-warning); }
    .dash-stat-card__value--obese { color: var(--bw-danger); }
    .dash-stat-card__value--cal { color: #f44336; }
    .dash-stat-card__value--goal { color: #4caf50; font-size: 1.1rem; }
    .dash-stat-card__value--act { color: #2196f3; font-size: 1.1rem; }

    .dash-stat-card__label { display: block; font-size: 0.75rem; color: var(--bw-stone); margin-top: var(--space-xs); }
    .dash-stat-card__sub { display: block; font-size: 0.7rem; color: var(--bw-stone); margin-top: 2px; }

    .dash-stat-card__badge {
      display: inline-block; font-size: 0.7rem; font-weight: 600;
      padding: 2px 10px; border-radius: var(--radius-full); margin-top: var(--space-xs);
    }
    .dash-stat-card__badge--normal { background: rgba(76,175,80,0.12); color: var(--bw-success); }
    .dash-stat-card__badge--underweight, .dash-stat-card__badge--overweight { background: rgba(255,152,0,0.12); color: var(--bw-warning); }
    .dash-stat-card__badge--obese { background: rgba(244,67,54,0.12); color: var(--bw-danger); }

    /* Details grid */
    .dash-details { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); margin-bottom: var(--space-xl); }

    .body-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); padding-top: var(--space-md); }
    .body-item { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-sm); }
    .body-item mat-icon { color: var(--bw-copper); font-size: 1.5rem; width: 1.5rem; height: 1.5rem; }
    .body-item__value { display: block; font-weight: 600; font-size: 1.1rem; }
    .body-item__value--cap { text-transform: capitalize; }
    .body-item__label { display: block; font-size: 0.75rem; color: var(--bw-stone); }

    /* Macros */
    .macro-list { display: flex; flex-direction: column; gap: var(--space-md); padding-top: var(--space-md); }
    .macro-item__header { display: flex; justify-content: space-between; margin-bottom: var(--space-xs); }
    .macro-item__name { font-weight: 500; font-size: 0.9rem; }
    .macro-item__grams { font-size: 0.8rem; color: var(--bw-stone); }

    /* Allergies */
    .dash-allergies-card mat-card-content { padding-top: var(--space-md); }
    .dash-allergy-chip { font-size: 0.85rem; }

    /* Empty state */
    .dash-empty { text-align: center; padding: var(--space-3xl); }
    .dash-empty__icon { font-size: 4rem; width: 4rem; height: 4rem; color: var(--bw-stone); margin-bottom: var(--space-md); }
    .dash-empty__btn { background: var(--bw-copper) !important; color: #fff !important; margin-top: var(--space-lg); }

    @media (max-width: 900px) { .dash-stats { grid-template-columns: repeat(2, 1fr); } .dash-details { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .dash-stats { grid-template-columns: 1fr; } .dash-header { flex-direction: column; gap: var(--space-md); } }
  `]
})
export class DashboardPageComponent implements OnInit {
  user: User | null = null;
  profile: HealthProfile | null = null;
  goalData: Goal | null = null;
  activityData: ActivityLevel | null = null;
  userAllergies: Allergy[] = [];
  dailyCalories = 0;
  macros = { protein: 0, carbs: 0, fats: 0, proteinPct: 0, carbsPct: 0, fatsPct: 0 };

  constructor(
    private router: Router,
    private userRepo: UserRepositoryPort,
    private profileRepo: HealthProfileRepositoryPort,
    private goalRepo: GoalRepositoryPort,
    private activityRepo: ActivityLevelRepositoryPort,
    private allergyRepo: AllergyRepositoryPort
  ) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('bw_current_user');
    if (!stored) { this.router.navigate(['/login']); return; }
    this.user = JSON.parse(stored);

    forkJoin({
      profile: this.profileRepo.getByUserId(this.user!.id),
      goals: this.goalRepo.getAll(),
      activities: this.activityRepo.getAll(),
      allergies: this.allergyRepo.getAll()
    }).subscribe(({ profile, goals, activities, allergies }) => {
      if (profile) {
        this.profile = profile;
        this.goalData = goals.find(g => g.id === profile.goalId) || null;
        this.activityData = activities.find(a => a.id === profile.activityLevelId) || null;
        this.userAllergies = allergies.filter(a => profile.allergyIds?.includes(a.id));
        this.calculateCalories();
      }
    });
  }

  get bmiValue(): string {
    if (!this.profile) return '—';
    const bmi = this.profile.weight / Math.pow(this.profile.height / 100, 2);
    return bmi.toFixed(1);
  }

  get bmiCategory(): string {
    const bmi = parseFloat(this.bmiValue);
    if (isNaN(bmi)) return '';
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  get bmiCategoryLabel(): string {
    const labels: Record<string, string> = { underweight: 'Underweight', normal: 'Normal', overweight: 'Overweight', obese: 'Obese' };
    return labels[this.bmiCategory] || '';
  }

  private calculateCalories(): void {
    if (!this.profile || !this.activityData) return;
    const { weight, height, age, gender } = this.profile;
    // Mifflin-St Jeor equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    this.dailyCalories = Math.round(bmr * this.activityData.multiplier);
    // Macro split: 30% protein, 45% carbs, 25% fats
    const proteinCal = this.dailyCalories * 0.30;
    const carbsCal = this.dailyCalories * 0.45;
    const fatsCal = this.dailyCalories * 0.25;
    this.macros = {
      protein: Math.round(proteinCal / 4),
      carbs: Math.round(carbsCal / 4),
      fats: Math.round(fatsCal / 9),
      proteinPct: 30, carbsPct: 45, fatsPct: 25
    };
  }

  onEditProfile(): void { this.router.navigate(['/app/usuarios/profile']); }
  goToOnboarding(): void { this.router.navigate(['/app/usuarios/onboarding']); }
}
