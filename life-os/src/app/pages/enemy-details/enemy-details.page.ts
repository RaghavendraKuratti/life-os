import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-enemy-details',
  templateUrl: './enemy-details.page.html',
  styleUrls: ['./enemy-details.page.scss'],
  standalone: false
})
export class EnemyDetailsPage implements OnInit, OnDestroy {
enemy: any = null;
varse: any;
dailyJournal: string = "";
user!: User;
enemyKey: any;
updateScreen: boolean = false;

// Enhanced tracking fields
intensity: number = 3; // 1-5 scale, default to middle
selectedTriggers: string[] = [];
availableTriggers: string[] = [];
loadingTriggers: boolean = false;

// Intensity labels
intensityLabels = ['', 'Very Mild', 'Mild', 'Moderate', 'Strong', 'Overwhelming'];
  constructor(private fs: DataService, private auth: AuthService, private activatedRoute: ActivatedRoute, private router: Router) { 
    this.auth.currentUser.subscribe(user => {
      if (user) {
        this.user = user;
      }
    })
    this.activatedRoute.queryParams.subscribe(params => {
      this.clearFields();
      this.enemyKey = params['enemyKey'];
      this.fetchEnemyDetails();
    });
  }
  ngOnDestroy(): void {
    console.log("ngOnDestroy");
  }

  ngOnInit() {
    console.log("ngOnInit");
    this.getVerse();
  }

  fetchEnemyDetails() {
    this.fs.enemyDetails(this.enemyKey).subscribe({
      next: (res) => {
        console.log("fetchEnemyDetails", res);
        this.enemy = res;
        // Fetch triggers for this enemy
        this.fetchTriggers();
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  fetchTriggers() {
    if (!this.enemy?.key) return;
    
    this.loadingTriggers = true;
    this.fs.getTriggers(this.enemy.key).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.availableTriggers = res.data.triggers || [];
        }
        this.loadingTriggers = false;
      },
      error: (err) => {
        console.error('Error fetching triggers:', err);
        this.loadingTriggers = false;
      }
    });
  }

  toggleTrigger(trigger: string) {
    const index = this.selectedTriggers.indexOf(trigger);
    if (index > -1) {
      this.selectedTriggers.splice(index, 1);
    } else {
      this.selectedTriggers.push(trigger);
    }
  }

  isTriggerSelected(trigger: string): boolean {
    return this.selectedTriggers.includes(trigger);
  }

  getIntensityLabel(): string {
    return this.intensityLabels[this.intensity] || '';
  }

  getVerse() {
    this.fs.getTodayVerse().subscribe({
     next: (res) => {
       this.varse = res;
     }
    })
   }
   saveCheckIn(finish: boolean = false) {
      // Map intensity (1-5) to old enemyLevel (0-2) for backward compatibility
      // 1-2 = 0 (Not at all), 3 = 1 (A little), 4-5 = 2 (A lot)
      const enemyLevel = this.intensity <= 2 ? 0 : this.intensity === 3 ? 1 : 2;

      // Prepare enhanced check-in data
      const enhancedData = {
        intensity: this.intensity,
        triggers: this.selectedTriggers,
        notes: this.dailyJournal
      };

      console.log('Saving enhanced check-in:', {
        enemy: this.enemy.key,
        rating: enemyLevel,
        ...enhancedData
      });

      this.fs.saveCheckins(this.user.uid, this.enemy.key, enemyLevel, enhancedData)
      .subscribe({
        next: (res: any) => {
          const remainingEnemy: string[] = res.remaining;
          this.updateScreen = !this.updateScreen;
          if (finish) {
            this.moveToHome()
          } else {
            this.moveToNext(remainingEnemy);
          }
        },
        error: (err) => {
          console.error(err);
        }
      })
   }

  moveToNext(remainingEnemy: string[]) {
    setTimeout(() => {
      if (remainingEnemy.length == 0) {
        this.router.navigate(["/home"])
      } else {
        this.router.navigate(["/enemy-details"], {
          queryParams: {
            enemyKey: remainingEnemy[0]
          }
        });
      }
    }, 1000);
  }
  clearFields() {
    this.dailyJournal = '';
    this.intensity = 3;
    this.selectedTriggers = [];
  }
  moveToHome() {
    this.router.navigate(["/home"]);
  }
}
