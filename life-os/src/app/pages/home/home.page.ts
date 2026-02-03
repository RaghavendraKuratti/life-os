import { Component, OnDestroy, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { NavigationEnd, Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { onAuthStateChanged, User } from 'firebase/auth';
import { filter, Observable } from 'rxjs';
import { Enemies } from 'src/app/enum/enemies';
import { IconType } from 'src/app/enum/icon-type';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';
import { WeeklyInsights } from 'src/app/common-comps/weekly-insights/weekly-insights.component';
import { EnemyOfDay } from 'src/app/common-comps/enemy-of-day/enemy-of-day.component';

type Weekly = {[k: string]: {current: number, previous: number, change: number}}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  user!: User | null;
  varse: any = null;
  isShlokaRead: boolean = false;
  collapseReadShloka: boolean = false;
  streak!: any;
  enemies: string [] = Object.keys(Enemies);
  // responses: any = {};
  weekly: Weekly | null = null;
  weeklyInsights: WeeklyInsights | null = null;
  insightsLoading: boolean = false;
  insightsError: string | null = null;
  enemyOfDay: EnemyOfDay | null = null;
  enemyOfDayLoading: boolean = false;

  options: string[] = [
    "Not at all",
    "A little",
    "A lot"
  ]
sixEnemies: any[] = []
size = 50;
stroke= this.size / 15;
IconType = IconType;
  constructor(private fs: DataService, private auth: AuthService,
    private router: Router, private userService: UserService) {
    router.events
    .pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe(nav => {
      if (this.user) {
        this.fetchEnemyDetails();
      }
    })
    
    // Wait for user to be authenticated before loading data
    this.auth.currentUser.subscribe(user => {
      if (user) {
        this.user = user;
        // Load user-specific data only after user is confirmed
        this.loadUserInfo();
        this.loadWeeklyInsights();
        this.loadEnemyOfDay();
        this.fetchEnemyDetails();
      }
    })
  }
  
  ngOnInit() {
    // Load non-user-specific data
    this.getVerse();
  }

  onMarkShlokaAsRead() {
    if (!this.user || !this.varse) {
      console.error('User or verse not available');
      return;
    }

    console.log('Marking shloka as read:', this.varse.date);
    
    // Update local state immediately for better UX
    this.isShlokaRead = true;

    // Call backend API to persist the read status
    this.fs.markShlokaAsRead(this.user.uid, this.varse.date).subscribe({
      next: (response) => {
        console.log('Shloka marked as read successfully:', response);
      },
      error: (error) => {
        console.error('Error marking shloka as read:', error);
        // Revert local state if API call fails
        this.isShlokaRead = false;
        alert('Failed to mark shloka as read. Please try again.');
      }
    });
  }

  loadUserInfo() {
    this.userService.userInfo.subscribe(res => {
      if (res) {
        this.streak = res.streaks;
        this.streak.header = "Daily Check In Streaks";
      }
    })
  }

  getVerse() {
   this.fs.getTodayVerse().subscribe({
    next: (res) => {
      console.log("getVerse", res);
      this.varse = res;
      
      // Check if user has already read today's shloka
      if (this.user && res.date) {
        this.checkShlokaReadStatus(res.date);
      }
    }
   })
  }

  checkShlokaReadStatus(date: string) {
    if (!this.user) return;
    
    this.fs.checkShlokaReadStatus(this.user.uid, date).subscribe({
      next: (response: any) => {
        this.isShlokaRead = response.isRead || false;
        console.log('Shloka read status:', this.isShlokaRead);
      },
      error: (error) => {
        console.error('Error checking shloka read status:', error);
        this.isShlokaRead = false;
      }
    });
  }
  logOut() {
    this.auth.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
  moveToDetails(enemy: any) {
    console.log("moveToDetails", enemy);
    this.fs.currentEnemy = enemy;
    this.router.navigate(["/enemy-details"], {
      queryParams: {
        enemyKey: enemy.key
      }
    });
  }

  fetchEnemyDetails() {
    if (!this.user?.uid) {
      console.warn('Cannot fetch enemy details: user not authenticated');
      return;
    }

    this.fs.enemyList().subscribe({
      next: (res: any) => {
        // Initialize enemies with 0 progress
        this.sixEnemies = res.map((data: any) => {
          data.progress = 0;
          return data;
        });
        
        // Fetch progress for all enemies to determine if user has any data
        this.checkUserProgress();
      }
    })
  }

  checkUserProgress() {
    if (!this.user?.uid || this.sixEnemies.length === 0) {
      return;
    }

    // Fetch progress for each enemy
    const progressChecks = this.sixEnemies.map(enemy =>
      this.fs.progress(this.user!.uid, enemy.key, 1)
    );

    // Wait for all progress checks to complete
    Promise.all(progressChecks.map(obs =>
      obs.toPromise().catch(() => ({ data: { average: 0, count: 0 } }))
    )).then(results => {
      // Update enemy progress values
      results.forEach((res: any, index) => {
        if (res && res.data) {
          this.sixEnemies[index].progress = res.data.average || 0;
          // Store count to check if user has any check-ins
          this.sixEnemies[index].checkInCount = res.data.count || 0;
        }
      });
    });
  }

  loadWeeklyInsights() {
    if (!this.user?.uid) {
      console.warn('Cannot load weekly insights: user not authenticated');
      return;
    }
    
    this.insightsLoading = true;
    this.insightsError = null;
    
    this.fs.getWeeklyInsights(this.user.uid).subscribe({
      next: (response: any) => {
        console.log('Weekly insights for user:', this.user?.uid, response);
        if (response.success && response.data) {
          this.weeklyInsights = response.data;
          // Show user message if AI had issues but still got fallback
          if (response.userMessage) {
            console.info('AI Insights:', response.userMessage);
          }
        } else if (response.message) {
          // No data case
          this.weeklyInsights = null;
        }
        this.insightsLoading = false;
      },
      error: (error) => {
        console.error('Error loading weekly insights:', error);
        this.insightsError = error.error?.userMessage || 'Unable to load insights. Please try again later.';
        this.insightsLoading = false;
      }
    });
  }

  loadEnemyOfDay() {
    // Enemy of day is global, not user-specific
    this.enemyOfDayLoading = true;
    this.fs.getEnemyOfDay().subscribe({
      next: (response: any) => {
        console.log('Enemy of the day:', response);
        if (response.success && response.data) {
          this.enemyOfDay = response.data;
        }
        this.enemyOfDayLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading enemy of the day:', error);
        this.enemyOfDayLoading = false;
      }
    });
  }

  handleRefresh(event: any) {
    console.log('Refreshing home page...');
    
    // Reload all data
    this.getVerse();
    this.loadWeeklyInsights();
    this.loadEnemyOfDay();
    this.fetchEnemyDetails();
    
    // Complete the refresher after a short delay
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  navigateToKarma() {
    this.router.navigate(['/karma']);
  }

  navigateToEnemyDetails(enemy: any) {
    if (enemy) {
      this.fs.currentEnemy = enemy;
      this.router.navigate(["/enemy-details"], {
        queryParams: {
          enemyKey: enemy.key || enemy.id
        }
      });
    }
  }

  onEnemyOfDayClick() {
    if (this.enemyOfDay) {
      // Enemy of day has different structure, need to find the matching enemy
      const enemyKey = this.enemyOfDay.enemy;
      
      // Find the enemy in sixEnemies array
      const matchingEnemy = this.sixEnemies.find(e =>
        e.key === enemyKey || e.name === enemyKey
      );
      
      if (matchingEnemy) {
        this.navigateToEnemyDetails(matchingEnemy);
      } else {
        // If not found in sixEnemies, create a basic enemy object
        this.fs.currentEnemy = { key: enemyKey, name: enemyKey };
        this.router.navigate(["/enemy-details"], {
          queryParams: {
            enemyKey: enemyKey
          }
        });
      }
    }
  }

  hasAnyProgress(): boolean {
    // Check if any enemy has check-ins (count > 0)
    // This is more reliable than checking progress value
    // because progress could be 0 even with check-ins if user selected "Not at all"
    return this.sixEnemies.some(enemy =>
      (enemy.checkInCount && enemy.checkInCount > 0) ||
      (enemy.progress && enemy.progress > 0)
    );
  }

  ionViewWillEnter() {
    // Refresh data when page becomes visible (e.g., after returning from enemy details)
    console.log('Home page entering, refreshing data...');
    if (this.user) {
      this.fetchEnemyDetails();
      this.loadWeeklyInsights();
    }
  }
}
