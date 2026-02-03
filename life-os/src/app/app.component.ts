import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { DataService } from './services/data.service';
import { UserService } from './services/user.service';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router,
    private _us: UserService
  ) {
    // Only fetch user info when authenticated, don't handle navigation here
    // Navigation is handled by login.page.ts to avoid conflicts
    this.auth.currentUser.subscribe(user => {
      if (user) {
        this._us.fetchUserInfo(user.uid);
      }
    });
  }
  async ngOnInit(): Promise<void> {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') {
      console.warn("Notification Permission not granted.");
      
    }
  }
}
