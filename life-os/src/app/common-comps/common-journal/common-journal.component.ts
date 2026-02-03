import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MeditationIconComponent } from "../meditation-icon/meditation-icon.component";

@Component({
  selector: 'app-common-journal',
  templateUrl: './common-journal.component.html',
  styleUrls: ['./common-journal.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule, MeditationIconComponent],
})
export class CommonJournalComponent  implements OnInit {
  helperText: string = "";
  sixEnemies: any[] = [];
  dailyJournal: string = "";
  user!: User;
  selectedTags: string[] = [];
  
  // New properties for enhancements
  currentPrompts: string[] = [];
  showPrompts: boolean = false;
  moodBefore: string = '';
  moodAfter: string = '';
  showMoodTracking: boolean = true;
  
  moods = [
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'happy', emoji: '😊', label: 'Happy' }
  ];
  
  constructor(private dataService: DataService, private auth: AuthService) {
    auth.currentUser.subscribe((userDetails) => {
      if (userDetails) {
        this.user = userDetails;
      }
    })
  }

  ngOnInit() {
    this.fetchEnemyDetails();
  }

  fetchEnemyDetails() {
    this.dataService.enemyList().subscribe({
      next: (res: any) => {
        this.sixEnemies = res;
        this.sixEnemies.forEach(enemy => {
          enemy.selected = false;
        })
      }
    })
  }

  selectEnemy(index: number) {
    this.sixEnemies[index].selected = !this.sixEnemies[index].selected;
    this.helperText = this.sixEnemies[index].name;
    this.selectedTags = this.sixEnemies.filter(enemy => enemy.selected).map(enemy => enemy.key);
    
    if (this.selectedTags.length == 0) {
      this.helperText = "";
      this.currentPrompts = [];
      this.showPrompts = false;
    } else {
      // Load prompts for the first selected enemy
      this.loadPrompts(this.selectedTags[0]);
    }
  }
  
  loadPrompts(enemy: string) {
    this.dataService.getJournalPrompts(enemy, 3).subscribe({
      next: (res: any) => {
        if (res.success && res.data && res.data.prompts) {
          this.currentPrompts = res.data.prompts;
          this.showPrompts = true;
        }
      },
      error: (err) => {
        console.error('Error loading prompts:', err);
      }
    });
  }
  
  usePrompt(prompt: string) {
    if (this.dailyJournal) {
      this.dailyJournal += '\n\n' + prompt + ' ';
    } else {
      this.dailyJournal = prompt + ' ';
    }
  }
  
  selectMood(type: 'before' | 'after', mood: string) {
    if (type === 'before') {
      this.moodBefore = this.moodBefore === mood ? '' : mood;
    } else {
      this.moodAfter = this.moodAfter === mood ? '' : mood;
    }
  }
  saveDailyJournel() {
    this.dataService.saveJournel(
      this.user.uid,
      this.selectedTags,
      this.dailyJournal,
      this.moodBefore || undefined,
      this.moodAfter || undefined
    ).subscribe(res => {
      this.helperText = "Successfully saved your reflection! 🎉"
      this.clearForm();
      setTimeout(() => {
        this.helperText = ""
      }, 5000);
    })
  }
  clearForm() {
    this.selectedTags = [];
    this.dailyJournal = "";
    this.moodBefore = '';
    this.moodAfter = '';
    this.currentPrompts = [];
    this.showPrompts = false;
    this.sixEnemies.forEach(enemy => {
      enemy.selected = false;
    })
  }


}
