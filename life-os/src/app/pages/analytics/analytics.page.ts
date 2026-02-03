import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { User } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
  standalone: false
})
export class AnalyticsPage implements OnInit {
  user!: User;
  loading: boolean = true;
  
  // Summary data
  summary: any = null;
  
  // Intensity trend data
  intensityTrend: any[] = [];
  selectedTrendDays: number = 7;
  
  // Trigger analysis data
  triggers: any[] = [];
  selectedTriggerDays: number = 30;
  
  // Time patterns data
  timePatterns: any = null;
  
  // Filter options
  selectedEnemy: string | null = null;
  enemies = ['KRODHA', 'KAMA', 'LOBHA', 'MOHA', 'MADA', 'MATSARYA'];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.user = user;
        this.loadAnalytics();
      }
    });
  }

  ngOnInit() {
    console.log('Analytics page initialized');
  }

  /**
   * Load all analytics data
   */
  loadAnalytics() {
    this.loading = true;
    
    console.log('Loading analytics for user:', this.user.uid);
    console.log('Filter:', this.selectedEnemy || 'All enemies');
    
    // Use comprehensive analytics endpoint for efficiency
    this.dataService.getComprehensiveAnalytics(this.user.uid, {
      summaryDays: 7,
      trendDays: this.selectedTrendDays,
      triggerDays: this.selectedTriggerDays,
      timeDays: 30,
      enemy: this.selectedEnemy || undefined
    }).subscribe({
      next: (response) => {
        console.log('Analytics response:', response);
        if (response.success) {
          const data = response.data;
          this.summary = data.summary;
          this.intensityTrend = data.intensityTrend;
          this.triggers = data.triggers;
          this.timePatterns = data.timePatterns;
          console.log('Analytics loaded successfully');
          console.log('Summary:', this.summary);
          console.log('Triggers:', this.triggers);
          
          // Force change detection
          this.cdr.detectChanges();
        } else {
          console.error('Analytics request failed:', response);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        console.error('Error details:', error.error);
        console.error('Status:', error.status);
        console.error('User ID:', this.user.uid);
        this.loading = false;
      }
    });
  }

  /**
   * Refresh analytics data
   */
  refreshAnalytics(event?: any) {
    this.loadAnalytics();
    if (event) {
      setTimeout(() => {
        event.target.complete();
      }, 1000);
    }
  }

  /**
   * Change trend period
   */
  onTrendDaysChange(days: number) {
    this.selectedTrendDays = days;
    this.loadIntensityTrend();
  }

  /**
   * Change trigger analysis period
   */
  onTriggerDaysChange(days: number) {
    this.selectedTriggerDays = days;
    this.loadTriggers();
  }

  /**
   * Filter by enemy
   */
  onEnemyFilterChange(event: any) {
    this.selectedEnemy = event.detail.value;
    console.log('Enemy filter changed to:', this.selectedEnemy);
    this.loadAnalytics();
  }

  /**
   * Load intensity trend separately
   */
  private loadIntensityTrend() {
    this.dataService.getIntensityTrend(
      this.user.uid,
      this.selectedTrendDays,
      this.selectedEnemy || undefined
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.intensityTrend = response.data.trend;
        }
      },
      error: (error) => {
        console.error('Error loading intensity trend:', error);
      }
    });
  }

  /**
   * Load triggers separately
   */
  private loadTriggers() {
    this.dataService.getTriggerAnalysis(
      this.user.uid,
      this.selectedTriggerDays,
      this.selectedEnemy || undefined
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.triggers = response.data.triggers;
        }
      },
      error: (error) => {
        console.error('Error loading triggers:', error);
      }
    });
  }

  /**
   * Get intensity color based on value
   */
  getIntensityColor(intensity: number): string {
    if (intensity <= 2) return 'success';
    if (intensity === 3) return 'warning';
    return 'danger';
  }

  /**
   * Get time of day icon
   */
  getTimeIcon(time: string): string {
    const icons: any = {
      morning: 'sunny-outline',
      afternoon: 'partly-sunny-outline',
      evening: 'moon-outline',
      night: 'moon'
    };
    return icons[time] || 'time-outline';
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(0)}%`;
  }
}