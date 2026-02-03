import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  tabSelected: string = 'home';

  constructor(private navCtrl: NavController) {}
  
  onSelected(tab: string) {
   this.tabSelected = tab;
  }

  openJournal() {
    this.navCtrl.navigateForward('/journal');
  }
}
