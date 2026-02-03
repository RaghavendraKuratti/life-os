import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { MeditationIconComponent } from "../meditation-icon/meditation-icon.component";

@Component({
  selector: 'app-meditation-history-card',
  templateUrl: './meditation-history-card.component.html',
  styleUrls: ['./meditation-history-card.component.scss'],
  imports: [CommonModule, IonicModule, MeditationIconComponent]
})
export class MeditationHistoryCardComponent  implements OnInit {
  @Input() data!: any;
  constructor() { }

  ngOnInit() {}

}
