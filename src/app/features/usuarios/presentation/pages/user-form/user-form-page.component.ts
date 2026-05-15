import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
import type { Goal, ActivityLevel, Allergy } from '../../../domain/entities';
import {
  UserRepositoryPort, GoalRepositoryPort,
  ActivityLevelRepositoryPort, AllergyRepositoryPort,
  HealthProfileRepositoryPort
} from '../../../domain/ports';

@Component({
  selector: 'app-user-form-page',
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
        <h1>{{ isEditMode ? ('USERS.EDIT' | translate) : ('USERS.NEW' | translate) }}</h1>
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon> {{ 'COMMON.BACK' | translate }}
        </button>
      </div>

      <div class="form-grid">
        <mat-card class="form-card">
          <mat-card-header><mat-card-title>Personal Info</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="userForm" class="form-fields">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'AUTH.FIRST_NAME' | translate }}</mat-label>
                  <input matInput formControlName="firstName" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'AUTH.LAST_NAME' | translate }}</mat-label>
                  <input matInput formControlName="lastName" />
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'AUTH.EMAIL' | translate }}</mat-label>
                <input matInput formControlName="email" type="email" />
              </mat-form-field>
              @if (!isEditMode) {
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>{{ 'AUTH.PASSWORD' | translate }}</mat-label>
                  <input matInput formControlName="password" type="password" />
                </mat-form-field>
              }
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card class="form-card">
          <mat-card-header><mat-card-title>{{ 'PROFILE.TITLE' | translate }}</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="profileForm" class="form-fields">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'PROFILE.WEIGHT' | translate }}</mat-label>
                  <input matInput formControlName="weight" type="number" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'PROFILE.HEIGHT' | translate }}</mat-label>
                  <input matInput formControlName="height" type="number" />
                </mat-form-field>
              </div>
              <div class="form-row">
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
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'PROFILE.GOAL' | translate }}</mat-label>
                <mat-select formControlName="goalId">
                  @for (goal of goals; track goal.id) {
                    <mat-option [value]="goal.id">{{ goal.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'PROFILE.ACTIVITY_LEVEL' | translate }}</mat-label>
                <mat-select formControlName="activityLevelId">
                  @for (level of activityLevels; track level.id) {
                    <mat-option [value]="level.id">{{ level.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <div class="allergy-section">
                <label class="allergy-label">{{ 'PROFILE.ALLERGIES' | translate }}</label>
                <div class="allergy-grid">
                  @for (allergy of allergies; track allergy.id) {
                    <mat-checkbox
                      [checked]="selectedAllergyIds.includes(allergy.id)"
                      (change)="toggleAllergy(allergy.id)">
                      {{ allergy.name }}
                    </mat-checkbox>
                  }
                </div>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="form-actions">
        <button mat-button (click)="goBack()">{{ 'COMMON.CANCEL' | translate }}</button>
        <button mat-flat-button (click)="onSave()" [disabled]="userForm.invalid">
          {{ 'COMMON.SAVE' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
    .form-card mat-card-content { padding-top: var(--space-md); }
    .form-fields { display: flex; flex-direction: column; gap: var(--space-xs); }
    .form-row { display: flex; gap: var(--space-md); }
    .form-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
    .allergy-section { margin-top: var(--space-sm); }
    .allergy-label { font-weight: 500; color: var(--bw-stone); font-size: 0.875rem; display: block; margin-bottom: var(--space-sm); }
    .allergy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xs); }
    .form-actions { display: flex; justify-content: flex-end; gap: var(--space-md); margin-top: var(--space-xl); }
    .form-actions button[mat-flat-button] { background: var(--bw-copper) !important; color: #fff !important; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class UserFormPageComponent implements OnInit {
  userForm!: FormGroup;
  profileForm!: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  profileId: number | null = null;
  goals: Goal[] = [];
  activityLevels: ActivityLevel[] = [];
  allergies: Allergy[] = [];
  selectedAllergyIds: number[] = [];

  constructor(
    private fb: FormBuilder, private router: Router, private route: ActivatedRoute,
    private userRepo: UserRepositoryPort, private profileRepo: HealthProfileRepositoryPort,
    private goalRepo: GoalRepositoryPort, private activityRepo: ActivityLevelRepositoryPort,
    private allergyRepo: AllergyRepositoryPort, private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required], lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], password: ['', Validators.minLength(6)]
    });
    this.profileForm = this.fb.group({
      weight: [70, Validators.required], height: [170, Validators.required],
      age: [25, Validators.required], gender: ['male', Validators.required],
      goalId: [1, Validators.required], activityLevelId: [1, Validators.required]
    });

    forkJoin({
      goals: this.goalRepo.getAll(), activities: this.activityRepo.getAll(), allergies: this.allergyRepo.getAll()
    }).subscribe(({ goals, activities, allergies }) => {
      this.goals = goals; this.activityLevels = activities; this.allergies = allergies;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true; this.userId = +id;
      this.userRepo.getById(this.userId).subscribe(user => {
        this.userForm.patchValue(user);
      });
      this.profileRepo.getByUserId(this.userId).subscribe(profile => {
        if (profile) { this.profileId = profile.id; this.profileForm.patchValue(profile); this.selectedAllergyIds = profile.allergyIds || []; }
      });
    }
  }

  toggleAllergy(id: number): void {
    const idx = this.selectedAllergyIds.indexOf(id);
    if (idx >= 0) this.selectedAllergyIds.splice(idx, 1); else this.selectedAllergyIds.push(id);
  }

  onSave(): void {
    if (this.isEditMode && this.userId) {
      this.userRepo.update(this.userId, this.userForm.value).subscribe(() => {
        const profileData = { ...this.profileForm.value, allergyIds: this.selectedAllergyIds };
        if (this.profileId) {
          this.profileRepo.update(this.profileId, profileData).subscribe(() => this.onSuccess('USERS.UPDATED'));
        } else {
          this.profileRepo.create({ ...profileData, userId: this.userId! }).subscribe(() => this.onSuccess('USERS.UPDATED'));
        }
      });
    } else {
      const userData = { ...this.userForm.value, role: 'user' as const };
      this.userRepo.create(userData).subscribe(user => {
        const profileData = { ...this.profileForm.value, userId: user.id, allergyIds: this.selectedAllergyIds };
        this.profileRepo.create(profileData).subscribe(() => this.onSuccess('USERS.CREATED'));
      });
    }
  }

  private onSuccess(key: string): void {
    this.snackBar.open(this.translate.instant(key), 'OK', { duration: 2000 });
    this.router.navigate(['/app/usuarios']);
  }

  goBack(): void { this.router.navigate(['/app/usuarios']); }
}
