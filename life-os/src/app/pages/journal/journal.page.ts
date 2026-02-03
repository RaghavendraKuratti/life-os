import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { User } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MeditationIconComponent } from 'src/app/common-comps/meditation-icon/meditation-icon.component';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.page.html',
  styleUrls: ['./journal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, MeditationIconComponent]
})
export class JournalPage implements OnInit {
  user!: User;
  sixEnemies: any[] = [];
  dailyJournal: string = "";
  selectedTags: string[] = [];
  
  // Smart prompts
  currentPrompts: string[] = [];
  showPrompts: boolean = false;
  
  // Mood tracking
  moodBefore: string = '';
  moodAfter: string = '';
  
  moods = [
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'happy', emoji: '😊', label: 'Happy' }
  ];
  
  saving: boolean = false;

  constructor(
    private dataService: DataService,
    private auth: AuthService,
    private navCtrl: NavController
  ) {
    this.auth.currentUser.subscribe((userDetails) => {
      if (userDetails) {
        this.user = userDetails;
      }
    });
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
        });
      }
    });
  }

  selectEnemy(index: number) {
    this.sixEnemies[index].selected = !this.sixEnemies[index].selected;
    this.selectedTags = this.sixEnemies.filter(enemy => enemy.selected).map(enemy => enemy.key);
    
    if (this.selectedTags.length == 0) {
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

  async saveDailyJournal() {
    if (!this.user || !this.user.uid) {
      console.error('User not logged in');
      return;
    }
    
    this.saving = true;
    console.log('Saving journal...', {
      userId: this.user.uid,
      tags: this.selectedTags,
      noteLength: this.dailyJournal.length
    });
    
    this.dataService.saveJournel(
      this.user.uid,
      this.selectedTags,
      this.dailyJournal,
      this.moodBefore || undefined,
      this.moodAfter || undefined
    ).subscribe({
      next: (res) => {
        console.log('Journal saved successfully', res);
        this.saving = false;
        // Show success and navigate back
        this.showSuccessToast();
        this.clearForm();
        // Navigate to home after short delay
        setTimeout(() => {
          this.navCtrl.navigateBack('/home');
        }, 1500);
      },
      error: (err) => {
        this.saving = false;
        console.error('Error saving journal:', err);
        alert('Error saving journal: ' + err.message);
      }
    });
  }

  async showSuccessToast() {
    const toast = document.createElement('ion-toast');
    toast.message = '🎉 Journal saved successfully!';
    toast.duration = 2000;
    toast.position = 'top';
    toast.color = 'success';
    document.body.appendChild(toast);
    await toast.present();
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
    });
  }

  cancel() {
    console.log('Cancel clicked, navigating back');
    this.navCtrl.navigateBack('/home');
  }

  get canSave(): boolean {
    return this.selectedTags.length > 0 &&
           !!this.dailyJournal &&
           this.dailyJournal.length >= 20 &&
           !this.saving;
  }
}