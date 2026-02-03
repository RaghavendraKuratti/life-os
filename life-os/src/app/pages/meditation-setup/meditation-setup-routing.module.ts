import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeditationSetupPage } from './meditation-setup.page';

const routes: Routes = [
  {
    path: '',
    component: MeditationSetupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeditationSetupPageRoutingModule {}
