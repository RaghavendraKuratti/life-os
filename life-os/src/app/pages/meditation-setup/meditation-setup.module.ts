import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeditationSetupPageRoutingModule } from './meditation-setup-routing.module';

import { MeditationSetupPage } from './meditation-setup.page';
import { ShlokaCardComponent } from "src/app/common-comps/shloka-card/shloka-card.component";
import { MeditationIconComponent } from "src/app/common-comps/meditation-icon/meditation-icon.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeditationSetupPageRoutingModule,
    ShlokaCardComponent,
    MeditationIconComponent
],
  declarations: [MeditationSetupPage]
})
export class MeditationSetupPageModule {}
