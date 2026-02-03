import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { BrowserModule } from "@angular/platform-browser";
import { IonicModule } from "@ionic/angular";
import { Enemies } from 'src/app/enum/enemies';
import { IconType } from 'src/app/enum/icon-type';

@Component({
  selector: 'app-meditation-icon',
  templateUrl: './meditation-icon.component.html',
  styleUrls: ['./meditation-icon.component.scss'],
  imports: [CommonModule, IonicModule],
})
export class MeditationIconComponent  implements OnInit {
  @Input() icon: IconType | string = IconType.MEDITATION;
  @Input() active: boolean = false;
  IconType = IconType;
  EnemyType = Enemies;
  constructor() {}
  ngOnInit() {}

}
