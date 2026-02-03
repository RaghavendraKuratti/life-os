import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { IconType } from 'src/app/enum/icon-type';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-meditation',
  templateUrl: './meditation.page.html',
  styleUrls: ['./meditation.page.scss'],
  standalone: false
})
export class MeditationPage implements OnInit {
  sixEnemies: any[] = []
  timerValue: string|number = 200;
  IconType = IconType;
  user!: User;
  loading: boolean = false;
  totalMinutes: number = 0;

  constructor(private fs: DataService, private router: Router,
    private auth: AuthService, private userService: UserService
  ) {

    this.auth.currentUser.subscribe(user => {
      if (user) {
        this.user = user;
      }
    })
  }

  ngOnInit() {
    this.loading = true;
    this.fetchEnemyDetails();
    this.fetchMeditationHistory();
    this.loadUserInfo();
  }

  loadUserInfo() {
    this.userService.userInfo.subscribe(res => {
      this.medStreak = res.meditationStreaks;
      this.medStreak.header = "Meditation Streaks";
    })
  }

  lastMeditation!: any;
  medStreak!: any;
  fetchMeditationHistory() {
    this.fs.fetchMeditationHistory(this.user.uid, '', 1)
    .subscribe({
      next: (res: any) => {
        console.log("fetchMeditationHistory", res);
        this.lastMeditation = res.data?.length > 0 ? res.data[0] : null;
        this.calculateTotalMinutes();
      }
    })
  }

  calculateTotalMinutes() {
    // Calculate total meditation minutes from streak data
    if (this.medStreak?.checkinDays) {
      this.totalMinutes = this.medStreak.checkinDays * 15; // Assuming avg 15 min per session
    }
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // moveToMeditationSetup() {
  //   this.router.navigate(['/meditation-setup']);
  // }
  moveToMeditationSetup(enemy: any) {
    this.router.navigate(["/meditation-setup"], {
      queryParams: {
        enemyKey: enemy.key
      }
    });
  }


  fetchEnemyDetails() {
    this.fs.enemyList().subscribe({
      next: (res: any) => {
        this.sixEnemies = res;
        // Get smart recommendation based on user's recent check-ins
        this.getSmartRecommendation();
      },
      error: (error) => {
        console.error('Error fetching enemies:', error);
        this.loading = false;
      }
    })
  }

  getSmartRecommendation() {
    if (!this.user?.uid) {
      this.setDefaultRecommendation();
      return;
    }

    // Get user's analytics for last 7 days to find top enemy
    this.fs.getAnalyticsSummary(this.user.uid, 7).subscribe({
      next: (analytics: any) => {
        if (analytics.success && analytics.data && analytics.data.topTrigger) {
          const topTrigger = analytics.data.topTrigger;
          
          // Try to match top trigger to an enemy
          const recommendedEnemy = this.sixEnemies.find((e: any) =>
            e.key === topTrigger || e.name.toUpperCase().includes(topTrigger.toUpperCase())
          );
          
          if (recommendedEnemy) {
            recommendedEnemy.isRecommended = true;
            this.loading = false;
            return;
          }
        }
        
        // No analytics data or no match, use intelligent fallback
        this.setDefaultRecommendation();
      },
      error: (error) => {
        console.error('Error getting recommendation:', error);
        this.setDefaultRecommendation();
      }
    });
  }

  setDefaultRecommendation() {
    // Try to use Enemy of the Day
    this.fs.getEnemyOfDay().subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.enemy) {
          const enemyOfDay = this.sixEnemies.find((e: any) =>
            e.key === response.data.enemy || e.name === response.data.enemy
          );
          
          if (enemyOfDay) {
            enemyOfDay.isRecommended = true;
            this.loading = false;
            return;
          }
        }
        
        // Fallback to user's default enemy from profile
        this.useProfileDefault();
      },
      error: () => {
        this.useProfileDefault();
      }
    });
  }

  useProfileDefault() {
    this.userService.userInfo.subscribe(userInfo => {
      if (userInfo && userInfo.defaultEnemy && userInfo.defaultEnemy !== 'auto') {
        const defaultEnemy = this.sixEnemies.find((e: any) =>
          e.key === userInfo.defaultEnemy
        );
        
        if (defaultEnemy) {
          defaultEnemy.isRecommended = true;
          this.loading = false;
          return;
        }
      }
      
      // Final fallback: first enemy
      if (this.sixEnemies.length > 0) {
        this.sixEnemies[0].isRecommended = true;
      }
      this.loading = false;
    });
  }

  startSmartMeditation() {
    // Find recommended enemy or use first one
    const recommendedEnemy = this.sixEnemies.find(e => e.isRecommended) || this.sixEnemies[0];
    if (recommendedEnemy) {
      this.moveToMeditationSetup(recommendedEnemy);
    }
  }
  onEnemySelection(enemy: any) {
    enemy.selected = !enemy.selected;
  }

  onTimerChange(event: any) {
    this.timerValue = event.detail.value;
  }

  getFirstLine(name: string): string {
    // Split enemy name into two lines
    // Format: "Matsarya (Envy)" -> "Matsarya"
    const openParen = name.indexOf('(');
    if (openParen > 0) {
      return name.substring(0, openParen).trim();
    }
    return name;
  }

  getSecondLine(name: string): string {
    // Get the part in parentheses
    // Format: "Matsarya (Envy)" -> "(Envy)"
    const openParen = name.indexOf('(');
    if (openParen > 0) {
      return name.substring(openParen).trim();
    }
    return '';
  }
}
