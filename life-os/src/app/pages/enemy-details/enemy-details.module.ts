import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EnemyDetailsPageRoutingModule } from './enemy-details-routing.module';

import { EnemyDetailsPage } from './enemy-details.page';
import { ShlokaCardComponent } from "src/app/common-comps/shloka-card/shloka-card.component";
import { ProgressCircleComponent } from "src/app/common-comps/progress-circle/progress-circle.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EnemyDetailsPageRoutingModule,
    ShlokaCardComponent,
    ProgressCircleComponent
],
  declarations: [EnemyDetailsPage]
})
export class EnemyDetailsPageModule {}
