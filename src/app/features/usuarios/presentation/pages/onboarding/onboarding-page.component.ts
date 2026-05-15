import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import type { Goal, ActivityLevel, Allergy } from '../../../domain/entities';
import {
  HealthProfileRepositoryPort,
  GoalRepositoryPort,
  ActivityLevelRepositoryPort,
  AllergyRepositoryPort
} from '../../../domain/ports';

@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [
    ReactiveFormsModule, TranslateModule,
    MatStepperModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatCardModule, MatCheckboxModule, MatSnackBarModule
  ],
  template: `
    <div class="onboarding">
      <div class="onboarding__header">
        <span class="onboarding__emoji">🥗</span>
        <h1>{{ 'ONBOARDING.TITLE' | translate }}</h1>
        <p class="onboarding__subtitle">{{ 'ONBOARDING.SUBTITLE' | translate }}</p>
      </div>

      <mat-stepper linear #stepper class="onboarding__stepper">
        <!-- Step 1: Body Metrics -->
        <mat-step [stepControl]="bodyForm" label="{{ 'ONBOARDING.STEP_BODY' | translate }}">
          <div class="onboarding__step-content">
            <div class="onboarding__step-icon">
              <mat-icon class="onboarding__big-icon">monitor_weight</mat-icon>
              <h2>{{ 'ONBOARDING.BODY_TITLE' | translate }}</h2>
              <p class="text-muted">{{ 'ONBOARDING.BODY_DESC' | translate }}</p>
            </div>

            <form [formGroup]="bodyForm" class="onboarding__form">
              <div class="onboarding__row">
                <mat-form-field appearance="outline" class="onboarding__field">
                  <mat-label>{{ 'PROFILE.WEIGHT' | translate }} (kg)</mat-label>
                  <input matInput formControlName="weight" type="number" min="30" max="300" />
                  <mat-icon matSuffix>fitness_center</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="onboarding__field">
                  <mat-label>{{ 'PROFILE.HEIGHT' | translate }} (cm)</mat-label>
                  <input matInput formControlName="height" type="number" min="100" max="250" />
                  <mat-icon matSuffix>height</mat-icon>
                </mat-form-field>
              </div>

              <div class="onboarding__row">
                <mat-form-field appearance="outline" class="onboarding__field">
                  <mat-label>{{ 'PROFILE.AGE' | translate }}</mat-label>
                  <input matInput formControlName="age" type="number" min="13" max="120" />
                  <mat-icon matSuffix>cake</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="onboarding__field">
                  <mat-label>{{ 'PROFILE.GENDER' | translate }}</mat-label>
                  <mat-select formControlName="gender">
                    <mat-option value="male">{{ 'PROFILE.MALE' | translate }}</mat-option>
                    <mat-option value="female">{{ 'PROFILE.FEMALE' | translate }}</mat-option>
                    <mat-option value="other">{{ 'PROFILE.OTHER' | translate }}</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              @if (bodyForm.valid) {
                <div class="onboarding__bmi-preview">
                  <div class="bmi-card">
                    <span class="bmi-card__label">{{ 'ONBOARDING.YOUR_BMI' | translate }}</span>
                    <span class="bmi-card__value" [class]="'bmi-card__value--' + bmiCategory">{{ bmiValue }}</span>
                    <span class="bmi-card__category" [class]="'bmi-card__category--' + bmiCategory">{{ bmiCategoryLabel }}</span>
                  </div>
                </div>
              }
            </form>

            <div class="onboarding__actions">
              <div></div>
              <button mat-flat-button matStepperNext [disabled]="bodyForm.invalid" class="onboarding__next-btn">
                {{ 'COMMON.NEXT' | translate }}
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </mat-step>

        <!-- Step 2: Goal -->
        <mat-step [stepControl]="goalForm" label="{{ 'ONBOARDING.STEP_GOAL' | translate }}">
          <div class="onboarding__step-content">
            <div class="onboarding__step-icon">
              <mat-icon class="onboarding__big-icon">flag</mat-icon>
              <h2>{{ 'ONBOARDING.GOAL_TITLE' | translate }}</h2>
              <p class="text-muted">{{ 'ONBOARDING.GOAL_DESC' | translate }}</p>
            </div>

            <form [formGroup]="goalForm">
              <div class="onboarding__goal-grid">
                @for (goal of goals; track goal.id) {
                  <div
                    class="goal-card"
                    [class.goal-card--selected]="goalForm.get('goalId')?.value === goal.id"
                    (click)="selectGoal(goal.id)">
                    <mat-icon class="goal-card__icon">{{ goal.icon }}</mat-icon>
                    <h3 class="goal-card__name">{{ getTransKey(goal.name) | translate }}</h3>
                    <p class="goal-card__desc">{{ goal.description }}</p>
                  </div>
                }
              </div>
            </form>

            <div class="onboarding__actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                {{ 'COMMON.BACK' | translate }}
              </button>
              <button mat-flat-button matStepperNext [disabled]="goalForm.invalid" class="onboarding__next-btn">
                {{ 'COMMON.NEXT' | translate }}
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </mat-step>

        <!-- Step 3: Activity Level -->
        <mat-step [stepControl]="activityForm" label="{{ 'ONBOARDING.STEP_ACTIVITY' | translate }}">
          <div class="onboarding__step-content">
            <div class="onboarding__step-icon">
              <mat-icon class="onboarding__big-icon">directions_run</mat-icon>
              <h2>{{ 'ONBOARDING.ACTIVITY_TITLE' | translate }}</h2>
              <p class="text-muted">{{ 'ONBOARDING.ACTIVITY_DESC' | translate }}</p>
            </div>

            <form [formGroup]="activityForm">
              <div class="onboarding__activity-list">
                @for (level of activityLevels; track level.id) {
                  <div
                    class="activity-card"
                    [class.activity-card--selected]="activityForm.get('activityLevelId')?.value === level.id"
                    (click)="selectActivity(level.id)">
                    <div class="activity-card__info">
                      <h3 class="activity-card__name">{{ getTransKey(level.name) | translate }}</h3>
                      <p class="activity-card__desc">{{ level.description }}</p>
                    </div>
                    <div class="activity-card__multiplier">x{{ level.multiplier }}</div>
                  </div>
                }
              </div>
            </form>

            <div class="onboarding__actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                {{ 'COMMON.BACK' | translate }}
              </button>
              <button mat-flat-button matStepperNext [disabled]="activityForm.invalid" class="onboarding__next-btn">
                {{ 'COMMON.NEXT' | translate }}
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </mat-step>

        <!-- Step 4: Allergies & Submit -->
        <mat-step label="{{ 'ONBOARDING.STEP_ALLERGIES' | translate }}">
          <div class="onboarding__step-content">
            <div class="onboarding__step-icon">
              <mat-icon class="onboarding__big-icon">no_food</mat-icon>
              <h2>{{ 'ONBOARDING.ALLERGY_TITLE' | translate }}</h2>
              <p class="text-muted">{{ 'ONBOARDING.ALLERGY_DESC' | translate }}</p>
            </div>

            <div class="onboarding__allergy-grid">
              @for (allergy of allergies; track allergy.id) {
                <div
                  class="allergy-chip"
                  [class.allergy-chip--selected]="selectedAllergyIds.includes(allergy.id)"
                  (click)="toggleAllergy(allergy.id)">
                  <mat-icon>{{ selectedAllergyIds.includes(allergy.id) ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                  <span>{{ getTransKey(allergy.name) | translate }}</span>
                </div>
              }
            </div>

            <p class="onboarding__skip-note text-muted">{{ 'ONBOARDING.ALLERGY_SKIP' | translate }}</p>

            <div class="onboarding__actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                {{ 'COMMON.BACK' | translate }}
              </button>
              <button mat-flat-button (click)="onFinish()" class="onboarding__finish-btn" [disabled]="saving">
                <mat-icon>check</mat-icon>
                {{ 'ONBOARDING.FINISH' | translate }}
              </button>
            </div>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .onboarding {
      min-height: 100vh;
      background: var(--bw-cream);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-xl) var(--space-md);
    }

    .onboarding__header {
      text-align: center;
      margin-bottom: var(--space-xl);
    }

    .onboarding__emoji {
      font-size: 3rem;
      display: block;
      margin-bottom: var(--space-sm);
    }

    .onboarding__header h1 {
      font-size: 2rem;
      color: var(--bw-charcoal);
    }

    .onboarding__subtitle {
      color: var(--bw-stone);
      font-size: 1rem;
      margin-top: var(--space-xs);
    }

    .onboarding__stepper {
      width: 100%;
      max-width: 720px;
      background: transparent;
    }

    .onboarding__step-content {
      padding: var(--space-lg) 0;
    }

    .onboarding__step-icon {
      text-align: center;
      margin-bottom: var(--space-xl);
    }

    .onboarding__big-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: var(--bw-copper);
      margin-bottom: var(--space-sm);
    }

    .onboarding__step-icon h2 {
      font-size: 1.5rem;
      margin-bottom: var(--space-xs);
    }

    .onboarding__form {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .onboarding__row {
      display: flex;
      gap: var(--space-md);
    }

    .onboarding__field {
      flex: 1;
    }

    .onboarding__bmi-preview {
      display: flex;
      justify-content: center;
      margin-top: var(--space-md);
    }

    .bmi-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-lg) var(--space-2xl);
      background: #ffffff;
      border-radius: var(--radius-lg);
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }

    .bmi-card__label {
      font-size: 0.8rem;
      color: var(--bw-stone);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .bmi-card__value {
      font-size: 2.5rem;
      font-weight: 700;
      margin: var(--space-xs) 0;
    }

    .bmi-card__value--normal { color: var(--bw-success); }
    .bmi-card__value--underweight { color: var(--bw-warning); }
    .bmi-card__value--overweight { color: var(--bw-warning); }
    .bmi-card__value--obese { color: var(--bw-danger); }

    .bmi-card__category {
      font-size: 0.875rem;
      font-weight: 500;
      padding: 4px 12px;
      border-radius: var(--radius-full);
    }

    .bmi-card__category--normal { background: rgba(76,175,80,0.12); color: var(--bw-success); }
    .bmi-card__category--underweight { background: rgba(255,152,0,0.12); color: var(--bw-warning); }
    .bmi-card__category--overweight { background: rgba(255,152,0,0.12); color: var(--bw-warning); }
    .bmi-card__category--obese { background: rgba(244,67,54,0.12); color: var(--bw-danger); }

    /* Goal cards */
    .onboarding__goal-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-md);
    }

    .goal-card {
      padding: var(--space-lg);
      background: #ffffff;
      border: 2px solid transparent;
      border-radius: var(--radius-lg);
      cursor: pointer;
      text-align: center;
      transition: all 0.25s ease;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }

    .goal-card:hover {
      border-color: rgba(200,107,58,0.3);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }

    .goal-card--selected {
      border-color: var(--bw-copper) !important;
      background: rgba(200,107,58,0.04);
    }

    .goal-card__icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: var(--bw-copper);
      margin-bottom: var(--space-sm);
    }

    .goal-card__name {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: var(--space-xs);
    }

    .goal-card__desc {
      font-size: 0.8rem;
      color: var(--bw-stone);
      line-height: 1.4;
    }

    /* Activity cards */
    .onboarding__activity-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .activity-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-md) var(--space-lg);
      background: #ffffff;
      border: 2px solid transparent;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .activity-card:hover {
      border-color: rgba(200,107,58,0.3);
    }

    .activity-card--selected {
      border-color: var(--bw-copper) !important;
      background: rgba(200,107,58,0.04);
    }

    .activity-card__name {
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 2px;
    }

    .activity-card__desc {
      font-size: 0.8rem;
      color: var(--bw-stone);
    }

    .activity-card__multiplier {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--bw-copper);
      min-width: 50px;
      text-align: right;
    }

    /* Allergy chips */
    .onboarding__allergy-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
      justify-content: center;
    }

    .allergy-chip {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      background: #ffffff;
      border: 2px solid rgba(122,116,104,0.15);
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;
    }

    .allergy-chip:hover {
      border-color: var(--bw-copper);
    }

    .allergy-chip--selected {
      border-color: var(--bw-copper);
      background: rgba(200,107,58,0.06);
      color: var(--bw-copper);
    }

    .allergy-chip mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .onboarding__skip-note {
      text-align: center;
      margin-top: var(--space-md);
      font-size: 0.8rem;
    }

    /* Actions */
    .onboarding__actions {
      display: flex;
      justify-content: space-between;
      margin-top: var(--space-xl);
    }

    .onboarding__next-btn, .onboarding__finish-btn {
      background: var(--bw-copper) !important;
      color: #ffffff !important;
      border-radius: var(--radius-md) !important;
      padding: 0 var(--space-lg) !important;
      height: 44px;
    }

    .onboarding__finish-btn {
      background: var(--bw-success) !important;
    }

    @media (max-width: 600px) {
      .onboarding__row { flex-direction: column; }
      .onboarding__goal-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class OnboardingPageComponent implements OnInit {
  bodyForm!: FormGroup;
  goalForm!: FormGroup;
  activityForm!: FormGroup;
  goals: Goal[] = [];
  activityLevels: ActivityLevel[] = [];
  allergies: Allergy[] = [];
  selectedAllergyIds: number[] = [];
  saving = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private profileRepo: HealthProfileRepositoryPort,
    private goalRepo: GoalRepositoryPort,
    private activityRepo: ActivityLevelRepositoryPort,
    private allergyRepo: AllergyRepositoryPort,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('bw_current_user') || '{}');
    if (!currentUser.id) {
      this.router.navigate(['/login']);
      return;
    }

    this.profileRepo.getByUserId(currentUser.id).subscribe(profile => {
      if (profile) {
        this.snackBar.open('You already have a profile. Use "My Profile" to edit it.', 'OK', { duration: 3000 });
        this.router.navigate(['/app/usuarios/dashboard']);
      }
    });

    this.bodyForm = this.fb.group({
      weight: [null, [Validators.required, Validators.min(30), Validators.max(300)]],
      height: [null, [Validators.required, Validators.min(100), Validators.max(250)]],
      age: [null, [Validators.required, Validators.min(13), Validators.max(120)]],
      gender: ['', Validators.required]
    });

    this.goalForm = this.fb.group({
      goalId: [null, Validators.required]
    });

    this.activityForm = this.fb.group({
      activityLevelId: [null, Validators.required]
    });

    forkJoin({
      goals: this.goalRepo.getAll(),
      activities: this.activityRepo.getAll(),
      allergies: this.allergyRepo.getAll()
    }).subscribe(({ goals, activities, allergies }) => {
      this.goals = goals;
      this.activityLevels = activities;
      this.allergies = allergies;
    });
  }

  get bmiValue(): string {
    const w = this.bodyForm.get('weight')?.value;
    const h = this.bodyForm.get('height')?.value;
    if (!w || !h) return '—';
    const bmi = w / Math.pow(h / 100, 2);
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
    const labels: Record<string, string> = {
      underweight: 'Underweight',
      normal: 'Normal',
      overweight: 'Overweight',
      obese: 'Obese'
    };
    return labels[this.bmiCategory] || '';
  }

  selectGoal(id: number): void {
    this.goalForm.patchValue({ goalId: id });
  }

  selectActivity(id: number): void {
    this.activityForm.patchValue({ activityLevelId: id });
  }

  toggleAllergy(id: number): void {
    const idx = this.selectedAllergyIds.indexOf(id);
    if (idx >= 0) {
      this.selectedAllergyIds.splice(idx, 1);
    } else {
      this.selectedAllergyIds.push(id);
    }
  }

  onFinish(): void {
    this.saving = true;
    const currentUser = JSON.parse(localStorage.getItem('bw_current_user') || '{}');
    const profileData = {
      userId: currentUser.id,
      ...this.bodyForm.value,
      ...this.goalForm.value,
      ...this.activityForm.value,
      allergyIds: this.selectedAllergyIds
    };

    this.profileRepo.create(profileData).subscribe({
      next: () => {
        this.snackBar.open(
          this.translate.instant('ONBOARDING.SUCCESS'),
          'OK',
          { duration: 3000 }
        );
        this.router.navigate(['/app/usuarios/dashboard']);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Error saving profile', 'Close', { duration: 3000 });
      }
    });
  }

  getTransKey(name: string): string {
    return 'DB.' + name.toUpperCase().replace(/ /g, '_');
  }
}
