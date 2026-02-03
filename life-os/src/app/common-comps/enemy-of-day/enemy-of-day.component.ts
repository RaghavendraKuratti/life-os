import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

export interface EnemyOfDay {
  enemy: string;
  practice: string;
  duration: string;
  day: number;
  date: string;
}

@Component({
  selector: 'app-enemy-of-day',
  templateUrl: './enemy-of-day.component.html',
  styleUrls: ['./enemy-of-day.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class EnemyOfDayComponent implements OnInit {
  @Input() enemyOfDay: EnemyOfDay | null = null;
  @Input() loading: boolean = false;

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

  enemyColors: { [key: string]: string } = {
    'KAMA': 'danger',
    'KRODHA': 'warning',
    'LOBHA': 'success',
    'MOHA': 'medium',
    'MADA': 'tertiary',
    'MATSARYA': 'secondary'
  };

  constructor(private router: Router) {}

  ngOnInit() {}

  getEnemyName(enemy: string): string {
    return this.enemyNames[enemy] || enemy;
  }

  getEnemyIcon(enemy: string): string {
    return this.enemyIcons[enemy] || '⚔️';
  }

  getEnemyColor(enemy: string): string {
    return this.enemyColors[enemy] || 'primary';
  }

  onStartPractice() {
    // Navigate to meditation setup with the enemy pre-selected
    if (this.enemyOfDay) {
      this.router.navigate(['/meditation-setup'], {
        queryParams: {
          enemy: this.enemyOfDay.enemy
        }
      });
    }
  }

  onLearnMoreClick() {
    if (this.enemyOfDay) {
      this.router.navigate(['/enemy-details'], {
        queryParams: {
          enemyKey: this.enemyOfDay.enemy
        }
      });
    }
  }
}