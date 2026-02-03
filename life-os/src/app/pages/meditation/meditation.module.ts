import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeditationPageRoutingModule } from './meditation-routing.module';

import { MeditationPage } from './meditation.page';
import { MeditationIconComponent } from "src/app/common-comps/meditation-icon/meditation-icon.component";
import { MeditationHistoryCardComponent } from "src/app/common-comps/meditation-history-card/meditation-history-card.component";
import { StreakCardComponent } from "src/app/common-comps/streak-card/streak-card.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeditationPageRoutingModule,
    MeditationIconComponent,
    MeditationHistoryCardComponent,
    StreakCardComponent
],
  declarations: [MeditationPage]
})
export class MeditationPageModule {}
