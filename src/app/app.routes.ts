import { Routes } from '@angular/router';
import {HomeComponent} from './features/home/pages/home/home.component';
import {isConnectedGuard} from './features/auth/guards/is-connected.guard';
import {StageCreateComponent} from './features/stage/pages/stage-create/stage-create.component';
import {StageAllComponent} from './features/stage/pages/stage-all/stage-all.component';

export const routes: Routes = [
  {
    path:'',
    loadComponent:()=>
      import('./features/home/pages/home/home.component').then
      ((c) => c.HomeComponent,
        ),
  },
  {
    path: 'stages-infos',
    loadComponent:()=>
    import('./features/stage/pages/infos-stages/infos-stage.component').then
((c) => c.InfosStageComponent,
),
  },
  /*
  {
    path:'b2b',
  },

  {
    path: 'qui-sommes-nous ?',

  },
  {
    path: 'statistiques-et-législation',

  },

   */
  {
    path: 'users/register',
    loadComponent: () =>
      import('./features/auth/pages/register/register.component').then(
        (c) => c.RegisterComponent,
      ),
  },
  {
    path: 'company/register',
    loadComponent: () =>
      import('./features/auth/pages/company-register/company-register.component').then(
        (c) => c.CompanyRegisterComponent,
      ),
  },
  {
    path: 'auth/me',
    canActivate: [isConnectedGuard],
    loadComponent: () =>
      import('./features/auth/pages/me-detail/me-detail.component').then(
        (c) => c.MeDetailComponent,
      ),
  },
  {
    path: 'auth/:id',
    canActivate: [isConnectedGuard],
    loadComponent: () =>
      import('./features/auth/pages/user-detail/user-detail.component').then(
        (c) => c.UserDetailComponent,
      ),
  },
  {
    path: 'users/login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(
        (c) => c.LoginComponent,
      ),
  },

  /*{
    path: 'company/login',
    loadComponent: () =>
      import('./features/auth/pages/company-login/company-login.component').then(
        (c) => c.CompanyLoginComponent,
      ),
  },*/
  {
    path: 'stages/all',
    loadComponent: () =>
      import('./features/stage/pages/stage-all/stage-all.component').then(
        (c) => c.StageAllComponent,
      ),
  },
  {
    path: 'stages/create',
    loadComponent: () =>
      import('./features/stage/pages/stage-create/stage-create.component').then(
        (c) => c.StageCreateComponent,
      ),
  },
  {
    path: 'stages/update/:id',
    loadComponent: () =>
      import('./features/stage/pages/stage-update/stage-update.component').then(
        (c) => c.StageUpdateComponent,
      ),
  },

  {
    path: 'inscriptions/create/:id',
    loadComponent: () =>
      import('./features/inscription/pages/inscription-create/inscription-create.component').then(
        (c) => c.InscriptionCreateComponent,
      ),
  },
  {
    path: 'code-promos/create',
    loadComponent: () =>
      import('./features/code-promo/pages/code-promo-create/code-promo-create.component').then(
        (c) => c.CodePromoCreateComponent,
      ),
  },
  {
    path: 'dashboard-client',
    loadComponent:()=>import('./dashboards/client-dashboard/client-dashboard.component').then(
      (c)=>c.ClientDashboardComponent,
    )
  },
  {
    path: 'dashboard-admin',
    loadComponent:()=>import('./dashboards/admin-dashboard/admin-dashboard.component').then(
      (c)=>c.AdminDashboardComponent,
    )
  },
  {
    path: 'dashboard-company',
    loadComponent:()=>import('./dashboards/company-dashboard/company-dashboard.component').then(
      (c)=>c.CompanyDashboardComponent,
    )
  }
];
