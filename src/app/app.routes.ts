import { Routes } from '@angular/router';
import {isConnectedGuard} from './features/auth/guards/is-connected.guard';
import {ForgotPasswordComponent} from './features/auth/pages/forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './features/auth/pages/reset-password/reset-password.component';

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
((c) => c.InfosStageComponent),
  },
  {
    path: 'qui-sommes-nous ?',
    loadComponent:()=>
      import('./features/home/pages/qui-sommes-nous/aboutACMF.component').then
      ((c) => c.AboutACMFComponent),
  },
  {
    path: 'statistiques-et-législation',
    loadComponent:()=>
      import('./features/home/pages/statistiques-and-legisation/statistiques-and-legisation.component').then
      ((c) => c.StatistiquesAndLegisationComponent),
  },
  {
    path: 'conditions-generales-vente',
    loadComponent:()=>
      import('./features/home/pages/conditions-générales-vente/conditionsgeneralesdevente.component').then
      ((c) => c.ConditionsGeneralesDeVenteComponent),
  },
 /* {
    path: 'particulier/register',
    loadComponent: () =>
      import('./features/auth/pages/register/register.component').then(
        (c) => c.RegisterComponent,
      ),
  },*/
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
    path: 'users/login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(
        (c) => c.LoginComponent,
      ),
  },
  {
    path: 'stages/all',
    loadComponent: () =>
      import('./features/stage/pages/stage-all/stage-all.component').then(
        (c) => c.StageAllComponent,
      ),
  },
  {
    path: 'admin-stages/all',
    loadComponent: () =>
      import('./features/stage/pages/admin-stage-all/admin-stage-all.component').then(
        (c) => c.AdminStageAllComponent,
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
    path: 'stages/all',
    loadComponent: () =>
      import('./features/stage/pages/stage-all/stage-all.component').then(
        (c) => c.StageAllComponent,
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
  },
  {
    path: 'dashboard-company',
    loadComponent:()=>import('./dashboards/company-dashboard/company-dashboard.component').then(
      (c)=>c.CompanyDashboardComponent,
    )
  },
  {
    path: 'private-links/create',
    canActivate: [isConnectedGuard], // Peut être protégé par le rôle admin si nécessaire
    loadComponent: () =>
      import('./features/private-link/pages/private-link-create/private-link-create.component').then(
        (c) => c.PrivateLinkCreateComponent
      ),
  },
  {
    path: 'private-links/validate/:token',
    canActivate: [isConnectedGuard], // Peut être protégé par le rôle admin si nécessaire
    loadComponent: () =>
      import('./features/private-link/pages/private-link-validate/private-link-validate.component').then(
        (c) => c.PrivateLinkValidateComponent
      ),
  },

  {
    path: 'private-links/list',
    canActivate: [isConnectedGuard], // Peut être protégé par le rôle admin si nécessaire
    loadComponent: () =>
      import('./features/private-link/pages/private-link-list/private-link-list.component').then(
        (c) => c.PrivateLinkListComponent
      ),
  },
  {
    path: ':entreprise/inscription/employee/:token',
    loadComponent: () =>
      import('./features/private-link/pages/private-link-form/private-link-form.component').then(
        (c) => c.PrivateLinkFormComponent
      ),
  },
  {
    path: 'documents/utilisateur/${userId}',
    loadComponent: () =>
      import('./features/document/pages/document-utilisateur/document-utilisateur.component').then(
        (c) => c.DocumentUtilisateurComponent
      ),
  },
  {
    path: 'documents/admin-upload',
    loadComponent: () =>
      import('./features/document/pages/admin-upload/admin-upload.component').then(
        (c) => c.AdminUploadComponent
      ),
  },
  {
    path: 'devis/create',
    loadComponent: () =>
      import('./features/devis/pages/creation-devis/creation-devis.component').then(
        (c) => c.CreationDevisComponent
      ),
  },

  {
    path: 'forgot-password',
    loadComponent:()=>import('./features/auth/pages/forgot-password/forgot-password.component').then
((c) => c.ForgotPasswordComponent),
},


{
  path: 'reset-password',
    loadComponent:()=>import
  ('./features/auth/pages/reset-password/reset-password.component').then
    ((c) => c.ResetPasswordComponent),
},

];
