import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { MeditationIconComponent } from '../meditation-icon/meditation-icon.component';
import { IconType } from '../../enum/icon-type';

export interface WeeklyInsights {
  weekStart: string;
  weekEnd: string;
  topEnemy: string | null;
  topEnemyCount: number;
  bestDay: { date: string; score: number } | null;
  worstDay: { date: string; score: number } | null;
  meditationConsistency: number;
  meditationDays: number;
  totalMeditationMinutes: number;
  checkInDays: number;
  enemyReduction: number;
  reflection: string;
  enemyBreakdown: { [key: string]: number };
}

@Component({
  selector: 'app-weekly-insights',
  templateUrl: './weekly-insights.component.html',
  styleUrls: ['./weekly-insights.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, MeditationIconComponent]
})
export class WeeklyInsightsComponent implements OnInit {
  @Input() insights: WeeklyInsights | null = null;
  @Input() loading: boolean = false;
  @Output() meditationClick = new EventEmitter<void>();
  
  IconType = IconType;

  enemyNames: { [key: string]: string } = {
    'KAMA': 'Desire',
    'KRODHA': 'Anger',
    'LOBHA': 'Greed',
    'MOHA': 'Delusion',
    'MADA': 'Pride',
    'MATSARYA': 'Jealousy'
  };

  enemyIcons: { [key: string]: string } = {
    'KAMA': '❤️',
    'KRODHA': '😤',
    'LOBHA': '💰',
    'MOHA': '🌫️',
    'MADA': '👑',
    'MATSARYA': '😒'
  };

  constructor(private router: Router) {}

  ngOnInit() {}

  onMeditationClick() {
    this.router.navigate(['/meditation']);
  }

  getEnemyName(enemy: string): string {
    return this.enemyNames[enemy] || enemy;
  }

  getEnemyIcon(enemy: string): string {
    return this.enemyIcons[enemy] || '⚔️';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getConsistencyColor(): string {
    if (!this.insights) return 'medium';
    if (this.insights.meditationConsistency >= 70) return 'success';
    if (this.insights.meditationConsistency >= 40) return 'warning';
    return 'danger';
  }

  getReductionColor(): string {
    if (!this.insights) return 'medium';
    if (this.insights.enemyReduction >= 30) return 'success';
    if (this.insights.enemyReduction >= 15) return 'warning';
    return 'medium';
  }
}