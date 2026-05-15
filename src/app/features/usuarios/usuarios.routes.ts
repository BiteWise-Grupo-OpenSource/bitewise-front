import { Routes } from '@angular/router';
import { DashboardPageComponent } from './presentation/pages/dashboard/dashboard-page.component';
import { OnboardingPageComponent } from './presentation/pages/onboarding/onboarding-page.component';
import { ProfileEditPageComponent } from './presentation/pages/profile-edit/profile-edit-page.component';

export const USUARIOS_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'onboarding', component: OnboardingPageComponent },
  { path: 'profile', component: ProfileEditPageComponent }
];
