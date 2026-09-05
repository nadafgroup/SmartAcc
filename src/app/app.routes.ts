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
      {
        path: 'primary-groups',
        loadComponent: () =>
          import('./components/primary-group/primary-group.component').then(
            (s) => s.PrimaryGroupComponent
          ),
      },
      {
        path: 'opening-balance',
        loadComponent: () =>
          import('./components/opening-balance').then(
            (s) => s.OpeningBalanceComponent
          ),
      },
      {
        path: 'branches',
        loadComponent: () =>
          import('./components/branches/branches.component').then(
            (s) => s.BranchesComponent
          ),
      },
      {
        path: 'financial-year',
        loadComponent: () =>
          import('./components/financial-year/financial-year.component').then(
            (s) => s.FinancialYearComponent
          ),
      },
      {
        path: 'districts',
        loadComponent: () =>
          import('./components/district/district.component').then(
            (s) => s.DistrictComponent
          ),
      },
      {
        path: 'talukas',
        loadComponent: () =>
          import('./components/taluka/taluka.component').then(
            (s) => s.TalukaComponent
          ),
      },
      {
        path: 'places',
        loadComponent: () =>
          import('./components/place/place.component').then(
            (s) => s.PlaceComponent
          ),
      },
      {
        path: 'states',
        loadComponent: () =>
          import('./components/state/state.component').then(
            (s) => s.StateComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '/login' }
];