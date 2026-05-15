import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { UserRepositoryPort } from '../../../domain/ports';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterModule, TranslateModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="auth-page">
      <div class="auth-page__card-wrapper">
        <mat-card class="auth-card">
          <mat-card-content>
            <div class="auth-card__header">
              <span class="auth-card__logo">🥗</span>
              <h1>{{ 'AUTH.WELCOME' | translate }}</h1>
              <p class="text-muted">{{ 'AUTH.WELCOME_SUB' | translate }}</p>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-card__form">
              <mat-form-field appearance="outline" class="auth-card__field">
                <mat-label>{{ 'AUTH.EMAIL' | translate }}</mat-label>
                <input matInput formControlName="email" type="email" />
                <mat-icon matSuffix>mail</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="auth-card__field">
                <mat-label>{{ 'AUTH.PASSWORD' | translate }}</mat-label>
                <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" />
                <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              <button mat-flat-button class="auth-card__submit" type="submit" [disabled]="loginForm.invalid">
                {{ 'AUTH.LOGIN' | translate }}
              </button>
            </form>

            <p class="auth-card__switch">
              {{ 'AUTH.NO_ACCOUNT' | translate }}
              <a routerLink="/register">{{ 'AUTH.REGISTER' | translate }}</a>
            </p>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="auth-page__hero">
        <div class="auth-page__hero-content">
          <h2>BiteWise</h2>
          <p>Personalized nutrition plans based on your body, goals, and medical conditions.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      min-height: 100vh;
    }

    .auth-page__card-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xl);
      background: #ffffff;
    }

    .auth-page__hero {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--bw-copper) 0%, var(--bw-copper-dark) 100%);
      color: #ffffff;
      padding: var(--space-3xl);
    }

    .auth-page__hero-content h2 {
      font-size: 3rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: var(--space-md);
    }

    .auth-page__hero-content p {
      font-size: 1.15rem;
      opacity: 0.9;
      max-width: 400px;
      line-height: 1.7;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      border: none !important;
      box-shadow: none !important;
    }

    .auth-card__header {
      text-align: center;
      margin-bottom: var(--space-xl);
    }

    .auth-card__logo {
      font-size: 3rem;
      display: block;
      margin-bottom: var(--space-md);
    }

    .auth-card__header h1 {
      font-size: 1.5rem;
      margin-bottom: var(--space-xs);
    }

    .auth-card__form {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .auth-card__field {
      width: 100%;
    }

    .auth-card__submit {
      width: 100%;
      height: 48px;
      font-size: 1rem;
      margin-top: var(--space-sm);
      background: var(--bw-copper) !important;
      color: #ffffff !important;
      border-radius: var(--radius-md) !important;
    }

    .auth-card__switch {
      text-align: center;
      margin-top: var(--space-lg);
      color: var(--bw-stone);
      font-size: 0.875rem;
    }

    .auth-card__switch a {
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .auth-page__hero {
        display: none;
      }
    }
  `]
})
export class LoginPageComponent {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userRepo: UserRepositoryPort,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.userRepo.getByEmail(email).subscribe({
      next: (users) => {
        const user = users.find(u => u.password === password);
        if (user) {
          localStorage.setItem('bw_current_user', JSON.stringify(user));
          this.router.navigate(['/app']);
        } else {
          this.snackBar.open('Invalid email or password', 'Close', { duration: 3000 });
        }
      },
      error: () => {
        this.snackBar.open('Connection error. Is the server running?', 'Close', { duration: 4000 });
      }
    });
  }
}
