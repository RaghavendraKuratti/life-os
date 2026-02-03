import { NgModule } from '@angular/core';
import { ExtraOptions, PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: '',
    component: TabsPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'karma',
        loadChildren: () => import('./pages/karma/karma.module').then(m => m.KarmaPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'meditation',
        loadChildren: () => import('./pages/meditation/meditation.module').then( m => m.MeditationPageModule)
      },
      {
        path: 'analytics',
        loadChildren: () => import('./pages/analytics/analytics.module').then( m => m.AnalyticsPageModule)
      }
    ]
  },
  {
    path: 'enemy-details',
    loadChildren: () => import('./pages/enemy-details/enemy-details.module').then( m => m.EnemyDetailsPageModule)
  },
  {
    path: 'meditation-setup',
    loadChildren: () => import('./pages/meditation-setup/meditation-setup.module').then( m => m.MeditationSetupPageModule)
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./pages/onboarding/onboarding.module').then( m => m.OnboardingPageModule)
  },
  {
    path: 'journal',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/journal/journal.page').then( m => m.JournalPage)
  },
  {
    path: 'journal-analytics',
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/journal-analytics/journal-analytics.page').then( m => m.JournalAnalyticsPage)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
// export routes;

