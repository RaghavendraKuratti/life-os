import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IconType } from 'src/app/enum/icon-type';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  isRegister = false;
  IconType =  IconType;

  constructor(private auth: AuthService, private router: Router,
    private dataService: DataService
  ) { 
  }
  ngOnInit(): void {
    this.auth.currentUser.subscribe(user => {
      if (user) {
        this.router.navigate(['/home']);
      }
    });
  }
  async googleSignin() {
    try {
      const user = await this.auth.googleSignin();
      
      // Create user profile (will only create if doesn't exist)
      this.dataService.createUserInfo(user).subscribe({
        next: (res) => {
          console.log("User profile ensured:", res);
          
          // Now check onboarding status
          this.checkOnboardingAndNavigate(user.uid);
        },
        error: (err) => {
          console.error("Error with user profile:", err);
          alert(`Something went wrong: ${err.message}`);
        }
      });
    } catch (error: any) {
      console.error('Google sign-in failed:', error);
      alert(`Sign-in failed: ${error.message}`);
    }
  }

  private checkOnboardingAndNavigate(userId: string) {
    this.dataService.fetchUserInfo(userId).subscribe({
      next: (userInfo: any) => {
        console.log("User onboarding status:", userInfo?.onboardingCompleted);
        
        // Check if onboarding is completed
        if (userInfo && userInfo.onboardingCompleted === true) {
          // User has completed onboarding, go to home
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
        } else {
          // User hasn't completed onboarding, go to onboarding
          this.router.navigate(['/onboarding'], { replaceUrl: true });
        }
      },
      error: (err) => {
        console.error("Error fetching user info:", err);
        // If error, go to onboarding to be safe
        this.router.navigate(['/onboarding'], { replaceUrl: true });
      }
    });
  }

  async onSubmit() {
    try {
      if (this.isRegister) {
        // Registration - new user
        const userCredential = await this.auth.register(this.email, this.password);
        
        // Create user profile for new registration
        if (userCredential.user) {
          this.dataService.createUserInfo(userCredential.user).subscribe({
            next: () => {
              // New registration always goes to onboarding
              this.router.navigate(['/onboarding'], { replaceUrl: true });
            },
            error: (err) => {
              console.error("Error creating user:", err);
              // Still proceed to onboarding even if backend fails
              this.router.navigate(['/onboarding'], { replaceUrl: true });
            }
          });
        }
      } else {
        // Login - existing user
        const userCredential = await this.auth.login(this.email, this.password);
        
        // Check onboarding status
        if (userCredential.user) {
          this.checkOnboardingAndNavigate(userCredential.user.uid);
        }
      }
    } catch(err: any) {
      console.error('Auth Error:', err);
      alert('Auth Error: '+ err.message);
    }
  }
  toggleMode() {
    this.isRegister = !this.isRegister;
  }
}
