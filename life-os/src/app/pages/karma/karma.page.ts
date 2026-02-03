import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';

interface EnemyProgress {
  enemy: string;
  displayName: string;
  icon: string;
  totalCheckins: number;
  averageRating: number;
  lastCheckin?: Date;
  trend?: 'improving' | 'stable' | 'declining';
}

@Component({
  selector: 'app-karma',
  templateUrl: './karma.page.html',
  styleUrls: ['./karma.page.scss'],
  standalone: false,
})
export class KarmaPage implements OnInit {
  user: User | null = null;
  enemyProgress: EnemyProgress[] = [];
  loading: boolean = true;
  hasData: boolean = false;
  
  enemyConfig = {
    kama: { displayName: 'Kama', subtitle: '(Desire)', icon: '❤️' },
    krodha: { displayName: 'Krodha', subtitle: '(Anger)', icon: '🔥' },
    lobha: { displayName: 'Lobha', subtitle: '(Greed)', icon: '💰' },
    moha: { displayName: 'Moha', subtitle: '(Delusion)', icon: '🔗' },
    mada: { displayName: 'Mada', subtitle: '(Pride)', icon: '👑' },
    matsarya: { displayName: 'Matsarya', subtitle: '(Envy)', icon: '💔' }
  };

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Subscribe to auth state changes
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.user = user;
        this.loadEnemyProgress();
      } else {
        this.user = null;
        this.hasData = false;
        this.initializeEmptyProgress();
      }
    });
  }

  loadEnemyProgress() {
    if (!this.user?.uid) {
      console.warn('Cannot load enemy progress: user not authenticated');
      this.hasData = false;
      this.initializeEmptyProgress();
      this.loading = false;
      return;
    }

    this.loading = true;
    
    // Fetch enemy analytics for the user
    this.dataService.getComprehensiveAnalytics(this.user.uid, {
      summaryDays: 30,
      trendDays: 7
    }).subscribe({
      next: (data: any) => {
        console.log('Enemy analytics:', data);
        
        if (data.summary && data.summary.enemyBreakdown) {
          this.hasData = data.summary.totalCheckins > 0;
          this.enemyProgress = this.processEnemyData(data.summary.enemyBreakdown);
        } else {
          this.hasData = false;
          this.initializeEmptyProgress();
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading enemy progress:', error);
        this.hasData = false;
        this.initializeEmptyProgress();
        this.loading = false;
      }
    });
  }

  processEnemyData(enemyBreakdown: any[]): EnemyProgress[] {
    const enemies = ['kama', 'krodha', 'lobha', 'moha', 'mada', 'matsarya'];
    
    return enemies.map(enemy => {
      const data = enemyBreakdown.find((e: any) => e.enemy === enemy);
      const config = this.enemyConfig[enemy as keyof typeof this.enemyConfig];
      
      return {
        enemy,
        displayName: config.displayName,
        icon: config.icon,
        totalCheckins: data?.count || 0,
        averageRating: data?.averageRating || 0,
        lastCheckin: data?.lastCheckin ? new Date(data.lastCheckin) : undefined,
        trend: this.calculateTrend(data?.averageRating || 0)
      };
    });
  }

  initializeEmptyProgress() {
    const enemies = ['kama', 'krodha', 'lobha', 'moha', 'mada', 'matsarya'];
    
    this.enemyProgress = enemies.map(enemy => {
      const config = this.enemyConfig[enemy as keyof typeof this.enemyConfig];
      
      return {
        enemy,
        displayName: config.displayName,
        icon: config.icon,
        totalCheckins: 0,
        averageRating: 0
      };
    });
  }

  calculateTrend(averageRating: number): 'improving' | 'stable' | 'declining' {
    if (averageRating <= 3) return 'improving';
    if (averageRating <= 6) return 'stable';
    return 'declining';
  }

  getProgressPercentage(enemy: EnemyProgress): number {
    // Calculate progress based on check-ins and ratings
    // Lower average rating = better progress
    if (enemy.totalCheckins === 0) return 0;
    
    // Invert the rating (10 - rating) so lower ratings show higher progress
    const invertedRating = 10 - enemy.averageRating;
    const checkInBonus = Math.min(enemy.totalCheckins * 2, 30); // Max 30% bonus for check-ins
    
    return Math.min(Math.round((invertedRating * 7) + checkInBonus), 100);
  }

  getEnemyConfig(enemyKey: string) {
    return this.enemyConfig[enemyKey as keyof typeof this.enemyConfig];
  }

  navigateToEnemy(enemyKey: string) {
    // Navigate to enemy details page
    this.router.navigate(['/enemy-details'], {
      queryParams: { enemyKey }
    });
  }

  ionViewWillEnter() {
    // Refresh data when page becomes active
    if (this.user?.uid) {
      this.loadEnemyProgress();
    }
  }

  handleRefresh(event: any) {
    console.log('Refreshing karma page...');
    this.loadEnemyProgress();
    
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
