import { Component, Input, OnChanges, OnInit, SimpleChanges, ElementRef, Renderer2 } from '@angular/core';
import { IonicModule, ViewWillEnter } from "@ionic/angular";
import { BrowserModule } from "@angular/platform-browser";
import { CommonModule } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'firebase/auth';
import { MeditationIconComponent } from "../meditation-icon/meditation-icon.component";
import { IconType } from 'src/app/enum/icon-type';
import { Enemies } from 'src/app/enum/enemies';

interface Enemy {
  name: string; 
  key: string, 
  progress: number, 
  icon: string
}

@Component({
  selector: 'app-progress-circle',
  templateUrl: './progress-circle.component.html',
  styleUrls: ['./progress-circle.component.scss'],
  imports: [CommonModule, IonicModule, MeditationIconComponent],
})
export class ProgressCircleComponent  implements OnInit, OnChanges {
@Input() enemy!:Enemy;
@Input() stroke:number = 5;
@Input() size:number = 100;
@Input() showTitle:boolean = true;
@Input() update:boolean = false;
@Input() alwaysShowPercentage:boolean = false;

  fontsize!: string;
  iconsize!: string;
  radius!: number;
  user!: User;
  IconType = IconType;
  EnemyType = Enemies;
  constructor(
    private dataService: DataService,
    private auth: AuthService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    auth.currentUser.subscribe(ud => {
      if (ud) {
        this.user = ud;
      }
    })
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.fetchProgress();
  }

  ngOnInit() {
    this.calculateSize();
    this.fetchProgress();
  }

  fetchProgress() {
    if (!this.user?.uid || !this.enemy?.key) {
      console.warn('Cannot fetch progress: missing user or enemy data');
      return;
    }

    // progressReq: 1 = last 7 days (weekly average)
    this.dataService.progress(this.user.uid, this.enemy.key, 1)
    .subscribe({
      next: (res: any) => {
        console.log("Progress", res);
        
        // res.data.average is the average intensity (1-5 scale) from check-ins
        // Scale: 1 = Very Mild, 2 = Mild, 3 = Moderate, 4 = Strong, 5 = Overwhelming
        this.enemy.progress = res.data.average || 0;
      },
      error: (error) => {
        console.error(`Error fetching progress for ${this.enemy.key}:`, error);
        this.enemy.progress = 0;
      }
    })
  }

  get circumference(): string {
    return `${2 * Math.PI * this.radius}`;
  }
  dashOffset(parcent: number): number {
    const c = 2 * Math.PI * this.radius;
    return c - parcent * c;
  }

  calculateSize() {
    this.radius =( this.size - this.stroke) / 2;
    this.fontsize = (this.size * 0.2)+"px";
    this.iconsize = (this.size * 0.4)+"px";
    
    // Set CSS variable for dynamic sizing
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      '--circle-size',
      `${this.size}px`
    );
  }

  shouldShowPercentage(): boolean {
    // Intensity scale is 1-5, so divide by 5 for percentage
    // This represents how much the enemy affected you (higher = worse)
    const percentage = ((this.enemy.progress / 5) * 100);
    
    // Don't show if NaN or invalid
    if (isNaN(percentage) || !isFinite(percentage)) {
      return false;
    }
    
    // If alwaysShowPercentage is true, show it (unless NaN)
    if (this.alwaysShowPercentage) {
      return true;
    }
    
    // Otherwise, only show percentage if progress > 0
    return percentage > 0 && this.enemy.progress > 0;
  }

  getProgressDisplay(): string {
    // Intensity scale is 1-5, so divide by 5 for percentage
    // Higher percentage = enemy had more impact (worse)
    const percentage = ((this.enemy.progress / 5) * 100);
    
    // Handle NaN case
    if (isNaN(percentage) || !isFinite(percentage)) {
      return '0%';
    }
    
    // Cap at 100% to handle any edge cases
    const cappedPercentage = Math.min(percentage, 100);
    
    return `${cappedPercentage.toFixed(0)}%`;
  }

  getFirstLine(): string {
    // Split enemy name into two lines
    // Format: "Matsarya (Envy)" -> "Matsarya"
    const name = this.enemy.name;
    const openParen = name.indexOf('(');
    if (openParen > 0) {
      return name.substring(0, openParen).trim();
    }
    return name;
  }

  getSecondLine(): string {
    // Get the part in parentheses
    // Format: "Matsarya (Envy)" -> "(Envy)"
    const name = this.enemy.name;
    const openParen = name.indexOf('(');
    if (openParen > 0) {
      return name.substring(openParen).trim();
    }
    return '';
  }

}
