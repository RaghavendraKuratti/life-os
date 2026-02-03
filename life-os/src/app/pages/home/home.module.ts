import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { ShlokaCardComponent } from "src/app/common-comps/shloka-card/shloka-card.component";
import { ProgressCircleComponent } from "src/app/common-comps/progress-circle/progress-circle.component";
import { CommonJournalComponent } from "src/app/common-comps/common-journal/common-journal.component";
import { MeditationIconComponent } from "src/app/common-comps/meditation-icon/meditation-icon.component";
import { StreakCardComponent } from "src/app/common-comps/streak-card/streak-card.component";
import { WeeklyInsightsComponent } from "src/app/common-comps/weekly-insights/weekly-insights.component";
import { EnemyOfDayComponent } from "src/app/common-comps/enemy-of-day/enemy-of-day.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    ShlokaCardComponent,
    ProgressCircleComponent,
    CommonJournalComponent,
    MeditationIconComponent,
    StreakCardComponent,
    WeeklyInsightsComponent,
    EnemyOfDayComponent
],
  declarations: [HomePage]
})
export class HomePageModule {}
