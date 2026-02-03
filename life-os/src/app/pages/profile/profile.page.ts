import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewWillLeave } from '@ionic/angular';
import { User } from 'firebase/auth';
import { Enemies } from 'src/app/enum/enemies';
import { IconType } from 'src/app/enum/icon-type';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit, OnDestroy, ViewWillLeave {
  IconType = IconType;
  user!: User;
  reminderTime!: Date;
  enemies = Object.keys(Enemies);
  profileSettings = {
    firstName: "Raghavendra",
    lastName: "Kuratti",
    contact: "7411055238",
    profilePic: "",
    dailyReminder: false,
    reminderTime: "",
    jounralingReminder: false,
    defaultEnemy: 'auto',
    darkMode: false,
    notifications: false,
    meditationSound: 'neural',
    email: ""
  }

  // Meditation Statistics
  meditationStats = {
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    loading: true
  };

  // Notification status
  notificationPermissionStatus: string = 'unknown';
  notificationMessage: string = '';

profileSettingsForm!: FormGroup;

  
  constructor(private fs: DataService, private auth: AuthService, 
    private activatedRoute: ActivatedRoute, private router: Router,
    private _fb: FormBuilder, private userService: UserService,
    private _ns: NotificationService) {
      console.log("Theme", document.body.getAttribute("prefers-color-scheme"));
    }
  ionViewWillLeave() {
    console.log("ionViewWillLeave", this.profileSettingsForm.pristine);
    if (!this.profileSettingsForm.pristine) {
      this.saveUserInfo();
    }
  }
  ngOnDestroy(): void {
  }

  ngOnInit() {
    this.createForm();
    this.loadData();
    this.loadMeditationStats();
    this.checkNotificationPermission();
  }
  
  checkNotificationPermission() {
    this._ns.permissionStatus.subscribe(status => {
      if (status) {
        this.notificationPermissionStatus = status.display;
      }
    });
  }
  
  loadMeditationStats() {
    this.auth.currentUser.subscribe(user => {
      if (user) {
        // Get streak info from user profile first
        this.userService.userInfo.subscribe(userInfo => {
          if (userInfo && userInfo.meditationStreaks) {
            this.meditationStats.currentStreak = userInfo.meditationStreaks.checkinDays || 0;
            this.meditationStats.longestStreak = userInfo.meditationStreaks.highestScore || 0;
          }
          
          // Fetch all meditation sessions to calculate total sessions and minutes
          // Note: Backend should support fetching all sessions without enemy filter
          this.fs.fetchMeditationHistory(user.uid, '', 1000).subscribe({
            next: (history: any) => {
              this.calculateMeditationStats(history);
            },
            error: (err: any) => {
              console.error('Error loading meditation stats:', err);
              this.meditationStats.loading = false;
            }
          });
        });
      }
    });
  }
  
  calculateMeditationStats(history: any) {
    if (!history || !history.data || !Array.isArray(history.data)) {
      this.meditationStats.loading = false;
      return;
    }
    
    const sessions = history.data;
    this.meditationStats.totalSessions = sessions.length;
    
    // Calculate total minutes (duration is in minutes)
    this.meditationStats.totalMinutes = sessions.reduce((total: number, session: any) => {
      return total + (session.duration || 0);
    }, 0);
    
    this.meditationStats.loading = false;
  }
  async changePic() {
    console.log("changePic")
    const url = await this.userService.changeProfilePic(this.user.uid);
    this.profileSettings.profilePic = url;
    this.profileSettingsForm.patchValue({
      profilePic: url
    });
    this.profileSettingsForm.markAsDirty();
    console.log("changePic", url)
  }

  loadData() {
    this.auth.currentUser.subscribe(user => {
      if (user) {
        this.user = user;
      }
    })
    this.userService.userInfo.subscribe(res => {
      if (res) {
        this.profileSettings = res;
        console.log("User Info", res);
        this.profileSettingsForm.patchValue(this.profileSettings);
      }
    })
  }
  setTheme() {
    console.log("Theme", this.profileSettings.darkMode);
    
    if (this.profileSettings.darkMode) {
      document.body.setAttribute("prefers-color-scheme", "dark");
    } else {
      document.body.setAttribute("prefers-color-scheme", "light");
    }
  }

  createForm() {
    this.profileSettingsForm = this._fb.group({
      firstName: [],
      lastName: [],
      contact: [],
      profilePic: [],
      dailyReminder: [false],
      reminderTime: [""],
      jounralingReminder: [false],
      defaultEnemy: ['auto'],
      darkMode: [false],
      notifications: [false],
      meditationSound: [''],
      email: [""]
    })
    // this.setupConditionalValidation();
  }

  setupConditionalValidation() {
    const isdailyReminderControl  = this.profileSettingsForm.get('dailyReminder');
    const reminderTimeControl  = this.profileSettingsForm.get('reminderTime');

    isdailyReminderControl?.valueChanges.subscribe(value => {
      if (value) {
        reminderTimeControl?.setValidators(Validators.required);
      } else {
        reminderTimeControl?.clearValidators();
      }
      reminderTimeControl?.updateValueAndValidity(); // Recalculate validation status
    });
  }
  getInfoFormData(prop: string) {
    return this.profileSettingsForm.get(prop)?.value;
  }

  async onReminderToggle() {
    console.log("dailyReminder", this.getInfoFormData("dailyReminder"), this.getInfoFormData("reminderTime"));
    
    if(this.getInfoFormData("dailyReminder")) {
      const result = await this._ns.scheduleMeditationReminder(this.getInfoFormData("reminderTime"));
      
      if (result.success) {
        this.notificationMessage = result.message;
        console.log(`✅ ${result.message}`);
      } else {
        this.notificationMessage = result.message;
        console.warn(`⚠️ ${result.message}`);
        alert(result.message);
        // Revert toggle if failed
        this.profileSettingsForm.patchValue({ dailyReminder: false });
      }
    } else {
      const result = await this._ns.cancelReminders();
      this.notificationMessage = result.message;
      console.log(`✅ ${result.message}`);
    }
  }

  saveUserInfo(){
    // console.log("saveUserInfo", this.profileSettingsForm.value);
    
    this.fs.updateUserInfo(this.user.uid, this.profileSettingsForm.value) 
    .subscribe({
      next:(res) => {
        console.log("saveUserInfo", res);
      }
    })
  }
  async changePassword() {
    const alert = await this.createPasswordAlert();
    await alert.present();
  }

  async createPasswordAlert() {
    const { AlertController } = await import('@ionic/angular');
    const alertController = new AlertController();
    
    return await alertController.create({
      header: 'Change Password',
      message: 'Enter your new password',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Current Password',
          attributes: {
            minlength: 6
          }
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'New Password',
          attributes: {
            minlength: 6
          }
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirm New Password',
          attributes: {
            minlength: 6
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Change',
          handler: async (data) => {
            if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
              this.showAlert('Error', 'All fields are required');
              return false;
            }
            
            if (data.newPassword !== data.confirmPassword) {
              this.showAlert('Error', 'New passwords do not match');
              return false;
            }
            
            if (data.newPassword.length < 6) {
              this.showAlert('Error', 'Password must be at least 6 characters');
              return false;
            }
            
            try {
              await this.auth.changePassword(data.currentPassword, data.newPassword);
              this.showAlert('Success', 'Password changed successfully');
              return true;
            } catch (error: any) {
              this.showAlert('Error', error.message || 'Failed to change password');
              return false;
            }
          }
        }
      ]
    });
  }

  async showAlert(header: string, message: string) {
    const { AlertController } = await import('@ionic/angular');
    const alertController = new AlertController();
    const alert = await alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
