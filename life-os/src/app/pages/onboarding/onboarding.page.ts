import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Enemies } from 'src/app/enum/enemies';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { NotificationService } from 'src/app/services/notification.service';
import { User } from 'firebase/auth';

interface OnboardingData {
  intent: string;
  primaryEnemies: string[]; // Changed to array for multi-select
  reminderTime: string;
  enableReminders: boolean;
}

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: false
})
export class OnboardingPage implements OnInit {
  currentStep = 1;
  totalSteps = 4;
  user: User | null = null;
  loading = false;

  // Onboarding data
  onboardingData: OnboardingData = {
    intent: '',
    primaryEnemies: [], // Initialize as empty array
    reminderTime: '09:00',
    enableReminders: true
  };

  // Intent options
  intents = [
    { value: 'calm', label: 'Find Calm', icon: '🧘', description: 'Reduce stress and anxiety' },
    { value: 'discipline', label: 'Build Discipline', icon: '💪', description: 'Strengthen self-control' },
    { value: 'clarity', label: 'Gain Clarity', icon: '🔍', description: 'Clear mental fog' },
    { value: 'awareness', label: 'Self-Awareness', icon: '🪞', description: 'Understand yourself better' }
  ];

  // Enemy options
  enemies = [
    { value: Enemies.KAMA, label: 'Craving', icon: '🔥', description: 'Desire and attachment' },
    { value: Enemies.KRODHA, label: 'Anger', icon: '😤', description: 'Rage and frustration' },
    { value: Enemies.LOBHA, label: 'Greed', icon: '💰', description: 'Excessive want' },
    { value: Enemies.MOHA, label: 'Attachment', icon: '🔗', description: 'Emotional dependency' },
    { value: Enemies.MADA, label: 'Ego', icon: '👑', description: 'Pride and arrogance' },
    { value: Enemies.MATSARYA, label: 'Jealousy', icon: '👁️', description: 'Envy of others' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dataService: DataService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      console.log("User Onboarding", user);
      
      this.user = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  selectIntent(intent: string) {
    this.onboardingData.intent = intent;
  }

  selectEnemy(enemy: string) {
    const index = this.onboardingData.primaryEnemies.indexOf(enemy);
    if (index > -1) {
      // Enemy already selected, remove it
      this.onboardingData.primaryEnemies.splice(index, 1);
    } else {
      // Add enemy to selection (max 3)
      if (this.onboardingData.primaryEnemies.length < 3) {
        this.onboardingData.primaryEnemies.push(enemy);
      }
    }
  }
  
  isEnemySelected(enemy: string): boolean {
    return this.onboardingData.primaryEnemies.includes(enemy);
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return true; // Welcome screen
      case 2:
        return !!this.onboardingData.intent;
      case 3:
        return this.onboardingData.primaryEnemies.length > 0; // At least one enemy selected
      case 4:
        return true; // Reminder setup is optional
      default:
        return false;
    }
  }

  completeOnboarding() {
    if (!this.user) {
      console.error('No user found');
      alert('Authentication error. Please log in again.');
      return;
    }

    console.log('Starting onboarding completion...');
    console.log('User:', this.user.uid);
    console.log('Onboarding data:', this.onboardingData);

    this.loading = true;

    // Save user preferences - use updateUserInfo instead of createUserInfo
    const userInfo = {
      intent: this.onboardingData.intent,
      defaultEnemy: this.onboardingData.primaryEnemies[0] || '', // Use first enemy as default
      primaryEnemies: this.onboardingData.primaryEnemies, // Store all selected enemies
      dailyReminder: this.onboardingData.enableReminders,
      reminderTime: this.onboardingData.reminderTime,
      onboardingCompleted: true,
      onboardingDate: new Date().toISOString()
    };

    console.log('Updating user info with onboarding data:', userInfo);

    // Update user profile in backend (user already exists from login/registration)
    this.dataService.updateUserInfo(this.user.uid, userInfo).subscribe({
      next: (response) => {
        console.log('✅ User profile updated successfully:', response);
        
        // Schedule notifications if enabled
        if (this.onboardingData.enableReminders) {
          try {
            this.notificationService.scheduleMeditationReminder(
              this.onboardingData.reminderTime
            );
            console.log('✅ Notification scheduled');
          } catch (err) {
            console.error('⚠️ Failed to schedule notification:', err);
          }
        }

        // Navigate to home
        this.loading = false;
        console.log('✅ Navigating to home...');
        this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: (error) => {
        console.error('❌ Error completing onboarding:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          error: error.error
        });
        this.loading = false;
        
        // More detailed error message
        let errorMsg = 'Failed to complete setup. ';
        if (error.status === 0) {
          errorMsg += 'Cannot connect to server. Please check if the backend is running.';
        } else if (error.status === 404) {
          errorMsg += 'Server endpoint not found.';
        } else if (error.status >= 500) {
          errorMsg += 'Server error. Please try again.';
        } else {
          errorMsg += error.message || 'Please try again.';
        }
        
        alert(errorMsg);
      }
    });
  }

  skip() {
    // Skip onboarding and go to home with default settings
    if (this.user) {
      const userInfo = {
        onboardingCompleted: false
      };

      this.dataService.updateUserInfo(this.user.uid, userInfo).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error skipping onboarding:', error);
          this.router.navigate(['/home']);
        }
      });
    }
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}
