import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-journal-analytics',
  templateUrl: './journal-analytics.page.html',
  styleUrls: ['./journal-analytics.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class JournalAnalyticsPage implements OnInit {
  user!: User;
  analytics: any = null;
  entries: any[] = [];
  loading: boolean = true;
  selectedDays: number = 30;
  
  // Chart data
  enemyChartData: any[] = [];
  moodChartData: any = { before: [], after: [] };
  frequencyData: any[] = [];

  constructor(
    private dataService: DataService,
    private auth: AuthService
  ) {
    this.auth.currentUser.subscribe((userDetails) => {
      if (userDetails) {
        this.user = userDetails;
        this.loadAnalytics();
      }
    });
  }

  ngOnInit() {}

  loadAnalytics() {
    this.loading = true;
    
    // Load analytics
    this.dataService.getJournalAnalytics(this.user.uid, this.selectedDays).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.analytics = res.data;
          this.prepareChartData();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading analytics:', err);
        this.loading = false;
      }
    });

    // Load recent entries
    this.dataService.getJournalEntries(this.user.uid, { limit: 10 }).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.entries = res.data;
        }
      },
      error: (err) => {
        console.error('Error loading entries:', err);
      }
    });
  }

  prepareChartData() {
    if (!this.analytics) return;

    // Enemy distribution chart
    this.enemyChartData = Object.entries(this.analytics.enemyDistribution || {})
      .map(([enemy, count]: [string, any]) => ({
        enemy,
        count,
        percentage: this.analytics.totalEntries > 0 
          ? Math.round((count / this.analytics.totalEntries) * 100) 
          : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Mood chart data
    this.moodChartData = {
      before: Object.entries(this.analytics.moodTrends?.before || {})
        .map(([mood, count]: [string, any]) => ({ mood, count })),
      after: Object.entries(this.analytics.moodTrends?.after || {})
        .map(([mood, count]: [string, any]) => ({ mood, count }))
    };

    // Frequency data (last 7 days)
    const freqData = this.analytics.writingFrequency || {};
    const last7Days = this.getLast7Days();
    this.frequencyData = last7Days.map(date => ({
      date,
      count: freqData[date] || 0,
      label: this.formatDateLabel(date)
    }));
  }

  getLast7Days(): string[] {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }

  formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  onDaysChange(event: any) {
    this.selectedDays = parseInt(event.detail.value);
    this.loadAnalytics();
  }

  getMoodEmoji(mood: string): string {
    const emojis: any = {
      'sad': '😢',
      'neutral': '😐',
      'happy': '😊'
    };
    return emojis[mood] || '😐';
  }

  getEnemyName(key: string): string {
    const names: any = {
      'KAMA': 'Desire',
      'KRODHA': 'Anger',
      'LOBHA': 'Greed',
      'MOHA': 'Attachment',
      'MADA': 'Pride',
      'MATSARYA': 'Jealousy'
    };
    return names[key] || key;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMaxCount(data: any[]): number {
    return Math.max(...data.map(d => d.count), 1);
  }
}