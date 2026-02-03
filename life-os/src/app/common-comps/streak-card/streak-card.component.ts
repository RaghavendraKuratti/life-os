import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { MeditationIconComponent } from "../meditation-icon/meditation-icon.component";
import { IconType } from 'src/app/enum/icon-type';

@Component({
  selector: 'app-streak-card',
  templateUrl: './streak-card.component.html',
  styleUrls: ['./streak-card.component.scss'],
  imports: [CommonModule, IonicModule, MeditationIconComponent]
})
export class StreakCardComponent  implements OnInit {
@Input() streakData!: {
  header: string, 
  checkinDays: number,
  highestScore: number,
  lastCheckin: any
};
IconType = IconType;

  constructor() { }

  ngOnInit() {}

}
