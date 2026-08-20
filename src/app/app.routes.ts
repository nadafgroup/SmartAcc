import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
 

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    // canActivate: [AuthGuard], // Temporarily disabled for testing
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../app/components/dashboard/dashboard.component').then(
            (s) => s.DashboardComponent,
          ),
      },
      { path: 'groups',
         loadComponent: () =>
          import('../app/components/account-group/account-group.component').then(
            (s) => s.AccountGroupComponent,
          ),
       },
      { path: 'accounts', 
         loadComponent: () =>
          import('../app/components/account-info/account-info.component').then(
            (s) => s.AccountInfoComponent,
          ),
      },
      { path: 'firms',  
         loadComponent: () =>
          import('../app/components/firm/firm.component').then(
            (s) => s.FirmComponent,
          ),
       },
    ],
  },
   
];
