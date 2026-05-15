import { Routes } from '@angular/router';
import { UserListPageComponent } from './presentation/pages/user-list/user-list-page.component';
import { UserFormPageComponent } from './presentation/pages/user-form/user-form-page.component';
import { UserDetailPageComponent } from './presentation/pages/user-detail/user-detail-page.component';

export const USUARIOS_ROUTES: Routes = [
  { path: '', component: UserListPageComponent },
  { path: 'new', component: UserFormPageComponent },
  { path: 'edit/:id', component: UserFormPageComponent },
  { path: ':id', component: UserDetailPageComponent }
];
