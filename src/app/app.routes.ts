import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then(
            (s) => s.DashboardComponent
          ),
      },
      {
        path: 'groups',
        loadComponent: () =>
          import('./components/account-group/account-group.component').then(
            (s) => s.AccountGroupComponent
          ),
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import('./components/account-info/account-info.component').then(
            (s) => s.AccountInfoComponent
          ),
      },
      {
        path: 'firms',
        loadComponent: () =>
          import('./components/firm/firm.component').then(
            (s) => s.FirmComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./components/users/users.component').then(
            (s) => s.UsersComponent
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./components/products/products.component').then(
            (s) => s.ProductsComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '/login' }
];