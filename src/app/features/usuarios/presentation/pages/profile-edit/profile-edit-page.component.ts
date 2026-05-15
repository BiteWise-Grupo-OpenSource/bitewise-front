import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import type { Goal, ActivityLevel, Allergy, HealthProfile } from '../../../domain/entities';
import {
  HealthProfileRepositoryPort, GoalRepositoryPort,
  ActivityLevelRepositoryPort, AllergyRepositoryPort
} from '../../../domain/ports';

@Component({
  selector: 'app-profile-edit-page',
  standalone: true,
  imports: [
    ReactiveFormsModule, TranslateModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatCheckboxModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ 'DASHBOARD.EDIT_PROFILE' | translate }}</h1>
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          {{ 'COMMON.BACK' | translate }}
        </button>
      </div>

      @if (profileForm) {
        <div class="profile-edit-grid">
          <!-- Body Metrics -->
          <mat-card class="profile-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>monitor_weight</mat-icon>
                {{ 'ONBOARDING.STEP_BODY' | translate }}
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="profileForm" class="profile-form">
                <div class="profile-row">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'PROFILE.WEIGHT' | translate }} (kg)</mat-label>
                    <input matInput formControlName="weight" type="number" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'PROFILE.HEIGHT' | translate }} (cm)</mat-label>
                    <input matInput formControlName="height" type="number" />
                  </mat-form-field>
                </div>
                <div class="profile-row">
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'PROFILE.AGE' | translate }}</mat-label>
                    <input matInput formControlName="age" type="number" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'PROFILE.GENDER' | translate }}</mat-label>
                    <mat-select formControlName="gender">
                      <mat-option value="male">{{ 'PROFILE.MALE' | translate }}</mat-option>
                      <mat-option value="female">{{ 'PROFILE.FEMALE' | translate }}</mat-option>
                      <mat-option value="other">{{ 'PROFILE.OTHER' | translate }}</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Goal & Activity -->
          <mat-card class="profile-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>flag</mat-icon>
                {{ 'PROFILE.GOAL' | translate }} & {{ 'PROFILE.ACTIVITY_LEVEL' | translate }}
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="profileForm" class="profile-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'PROFILE.GOAL' | translate }}</mat-label>
                  <mat-select formControlName="goalId">
                    @for (goal of goals; track goal.id) {
                      <mat-option [value]="goal.id">
                        {{ goal.name }} — {{ goal.description }}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'PROFILE.ACTIVITY_LEVEL' | translate }}</mat-label>
                  <mat-select formControlName="activityLevelId">
                    @for (level of activityLevels; track level.id) {
                      <mat-option [value]="level.id">
                        {{ level.name }} (x{{ level.multiplier }})
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Allergies -->
          <mat-card class="profile-card profile-card--full">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>no_food</mat-icon>
                {{ 'PROFILE.ALLERGIES' | translate }}
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="allergy-grid">
                @for (allergy of allergies; track allergy.id) {
                  <mat-checkbox
                    [checked]="selectedAllergyIds.includes(allergy.id)"
                    (change)="toggleAllergy(allergy.id)">
                    {{ allergy.name }}
                  </mat-checkbox>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="profile-actions">
          <button mat-button (click)="goBack()">{{ 'COMMON.CANCEL' | translate }}</button>
          <button mat-flat-button (click)="onSave()" [disabled]="profileForm.invalid || saving" class="profile-save-btn">
            <mat-icon>check</mat-icon>
            {{ 'PROFILE.SAVE' | translate }}
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
    .profile-card mat-card-title { display: flex; align-items: center; gap: var(--space-sm); font-size: 1rem; }
    .profile-card mat-card-title mat-icon { color: var(--bw-copper); }
    .profile-card--full { grid-column: 1 / -1; }
    .profile-form { display: flex; flex-direction: column; gap: var(--space-xs); padding-top: var(--space-md); }
    .profile-row { display: flex; gap: var(--space-md); }
    .profile-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
    .allergy-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); padding-top: var(--space-md); }
    .profile-actions { display: flex; justify-content: flex-end; gap: var(--space-md); margin-top: var(--space-xl); }
    .profile-save-btn { background: var(--bw-copper) !important; color: #fff !important; }
    @media (max-width: 768px) { .profile-edit-grid { grid-template-columns: 1fr; } .profile-row { flex-direction: column; } .allergy-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class ProfileEditPageComponent implements OnInit {
  profileForm!: FormGroup;
  profileId: number | null = null;
  goals: Goal[] = [];
  activityLevels: ActivityLevel[] = [];
  allergies: Allergy[] = [];
  selectedAllergyIds: number[] = [];
  saving = false;

  constructor(
    private fb: FormBuilder, private router: Router,
    private profileRepo: HealthProfileRepositoryPort,
    private goalRepo: GoalRepositoryPort,
    private activityRepo: ActivityLevelRepositoryPort,
    private allergyRepo: AllergyRepositoryPort,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('bw_current_user') || '{}');
    if (!currentUser.id) { this.router.navigate(['/login']); return; }

    this.profileForm = this.fb.group({
      weight: [null, [Validators.required, Validators.min(30)]],
      height: [null, [Validators.required, Validators.min(100)]],
      age: [null, [Validators.required, Validators.min(13)]],
      gender: ['', Validators.required],
      goalId: [null, Validators.required],
      activityLevelId: [null, Validators.required]
    });

    forkJoin({
      profile: this.profileRepo.getByUserId(currentUser.id),
      goals: this.goalRepo.getAll(),
      activities: this.activityRepo.getAll(),
      allergies: this.allergyRepo.getAll()
    }).subscribe(({ profile, goals, activities, allergies }) => {
      this.goals = goals;
      this.activityLevels = activities;
      this.allergies = allergies;
      if (profile) {
        this.profileId = profile.id;
        this.profileForm.patchValue(profile);
        this.selectedAllergyIds = profile.allergyIds || [];
      }
    });
  }

  toggleAllergy(id: number): void {
    const idx = this.selectedAllergyIds.indexOf(id);
    if (idx >= 0) this.selectedAllergyIds.splice(idx, 1);
    else this.selectedAllergyIds.push(id);
  }

  onSave(): void {
    if (!this.profileId || this.profileForm.invalid) return;
    this.saving = true;
    const data = { ...this.profileForm.value, allergyIds: this.selectedAllergyIds };
    this.profileRepo.update(this.profileId, data).subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('PROFILE.UPDATED'), 'OK', { duration: 2000 });
        this.router.navigate(['/app/usuarios/dashboard']);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Error updating profile', 'Close', { duration: 3000 });
      }
    });
  }

  goBack(): void { this.router.navigate(['/app/usuarios/dashboard']); }
}
