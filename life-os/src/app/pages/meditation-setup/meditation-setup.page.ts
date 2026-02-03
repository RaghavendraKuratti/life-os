import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-meditation-setup',
  templateUrl: './meditation-setup.page.html',
  styleUrls: ['./meditation-setup.page.scss'],
  standalone: false
})
export class MeditationSetupPage implements OnInit, OnDestroy {
  selectedEnemy: any = null;
  user!: User;
  enemyKey: any;
  varse: any;
  seconds: number = 60;
  timer: number = 5; // 5 minutes * 60 sec
  strokeOffset: number = 180;
  private audio: HTMLAudioElement | null = null;
  durations = [
    {time: "05:00", dur: 5, selected: true},
    {time: "10:00", dur: 10, selected: false},
    {time: "15:00", dur: 15, selected: false},
  ]
  timeDisplay: string = this.durations[0].time;
  selectedSound: string = "neural";
  
  soundOptions = [
    {
      id: 'neural',
      name: 'Neural Beat',
      description: 'Binaural frequencies for deep focus',
      icon: 'pulse-outline'
    },
    {
      id: 'om',
      name: 'Om Chant',
      description: 'Sacred mantra for spiritual connection',
      icon: 'radio-outline'
    },
    {
      id: 'silence',
      name: 'Silence',
      description: 'Pure meditation without sound',
      icon: 'volume-mute-outline'
    }
  ];


  constructor(private fs: DataService, private auth: AuthService, private activatedRoute: ActivatedRoute, private router: Router) { 
    this.auth.currentUser.subscribe(user => {
      if (user) {
        this.user = user;
      }
    })
    this.activatedRoute.queryParams.subscribe(params => {
      this.enemyKey = params['enemyKey'];
      this.fetchEnemyDetails();
    });
  }

  calculateDuration() {
    return Math.ceil(((this.timer*this.seconds)-this.totalSec)/this.seconds);
  }
  
  saveMeditation() {
    let time = this.calculateDuration();
    this.stopMeditation();
    this.fs.saveMeditationHistory(this.user.uid, this.selectedEnemy.key, 
      this.varse.text, time)
    .subscribe({
      next: (res: any) => {
        console.log("saveMeditation", res);
      },
      error: (err) => {
        console.error("saveMeditation",err);
        
      }
    })
  }

  ngOnInit() {
    this.getVerse();
  }

  fetchMeditationHistory() {
    this.fs.fetchMeditationHistory(this.user.uid, this.selectedEnemy.key, 1)
    .subscribe({
      next: (res: any) => {
        console.log("fetchMeditationHistory", res);
      }
    })
  }

  getVerse() {
    this.fs.getTodayVerse().subscribe({
     next: (res) => {
       this.varse = res;
     }
    })
   }
  fetchEnemyDetails() {
    this.fs.enemyDetails(this.enemyKey ? this.enemyKey : 'KRODHA').subscribe({
      next: (res) => {
        console.log("fetchEnemyDetails", res);
        this.selectedEnemy = res;
        // this.fetchMeditationHistory();
      },
      error: (err) => {
        console.error(err);
      }
    })
  }
  moveToMeditation() {
    this.router.navigate(['/meditation']);
  }
  interval: any;
  meditationStarted = false;

  totalSec = this.timer * this.seconds;
formatTime(totalSec: number) {
    // let totalSec = this.timer * this.seconds;
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
selectDuration(index: number) {
  this.durations.forEach(dur => dur.selected = false);
  this.durations[index].selected = true;
  this.timer = this.durations[index].dur;
  this.timeDisplay = this.formatTime(this.timer*this.seconds);
  this.totalSec = this.timer * this.seconds;
}

selectSound(soundId: string) {
  this.selectedSound = soundId;
  console.log('Selected sound:', soundId);
  
  // Stop any currently playing audio
  this.stopAudio();
  
  // Don't auto-play when selecting - only play when meditation starts
  // This prevents audio reference issues
}

private playAudio(soundId: string) {
  // Audio file URLs - using free meditation audio from online sources
  const audioFiles: { [key: string]: string } = {
    'neural': 'assets/music/Binaural_Beats.mp4',
    'om': 'assets/music/Om_Chanting.mp4'
  };
  
  // For now, using placeholder URLs. You should replace these with actual audio files
  // stored in assets/audio/ folder
  const audioUrl = audioFiles[soundId];
  
  if (audioUrl) {
    this.audio = new Audio(audioUrl);
    this.audio.loop = true; // Loop the audio
    this.audio.volume = 0.5; // Set volume to 50%
    
    // Play audio
    this.audio.play().catch(error => {
      console.error('Error playing audio:', error);
      // Fallback: Show message to user
      alert(`Audio playback failed. Please ensure you have an internet connection or audio files are available.`);
    });
  }
}

private stopAudio() {
  if (this.audio) {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio = null;
  }
}

private pauseAudio() {
  if (this.audio) {
    this.audio.pause();
  }
}

private resumeAudio() {
  if (this.audio && this.selectedSound !== 'silence') {
    this.audio.play().catch(error => {
      console.error('Error resuming audio:', error);
    });
  }
}

startMeditation() {
  this.meditationStarted = true;
  
  // Stop any existing audio first to ensure clean state
  this.stopAudio();
  
  // Play selected audio when meditation starts
  if (this.selectedSound !== 'silence') {
    this.playAudio(this.selectedSound);
  }
  
  let steps = this.strokeOffset/this.totalSec;
  this.interval = setInterval(() => {
    this.strokeOffset -= steps;
    this.totalSec--;
    this.timeDisplay = this.formatTime(this.totalSec);
    
    if (this.strokeOffset <= 0) {
      this.saveMeditation();
    }
  }, 1000);
}

stopMeditation() {
  clearInterval(this.interval);
  this.meditationStarted = false;
  this.pauseAudio(); // Pause audio (don't stop) when meditation pauses
}

ngOnDestroy(): void {
  this.stopAudio(); // Stop audio when leaving page
  
  if(this.meditationStarted) {
    this.saveMeditation()
  };
  this.selectedEnemy = null;
  this.enemyKey = null;
  this.varse = null;
  this.seconds = 60;
  this.timer = 5;
  this.timeDisplay = this.durations[0].time;
  this.selectedSound = "neural";
}

}
