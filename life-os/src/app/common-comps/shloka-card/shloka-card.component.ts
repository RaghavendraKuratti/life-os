import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'firebase/auth';

interface Verse {
  chapter: string;
  date: string;
  shloka: string;
  text: string;
  translation: string;
}

@Component({
  selector: 'app-shloka-card',
  templateUrl: './shloka-card.component.html',
  styleUrls: ['./shloka-card.component.scss'],
  imports: [IonicModule],
})
export class ShlokaCardComponent implements OnInit, OnChanges {
  @Input() verse!: Verse;
  @Input() isRead: boolean = false;
  @Input() autoLoad: boolean = true; // Auto-load read status from backend
  @Output() markAsRead = new EventEmitter<void>();
  @Output() readStatusChanged = new EventEmitter<boolean>();

  private user: User | null = null;
  loading: boolean = false;

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    });
  }

  ngOnInit() {
    if (this.autoLoad && this.verse && this.user) {
      this.loadReadStatus();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // When verse changes, reload read status
    if (changes['verse'] && !changes['verse'].firstChange && this.autoLoad && this.user) {
      this.loadReadStatus();
    }
  }

  loadReadStatus() {
    if (!this.user || !this.verse?.date) return;

    this.dataService.checkShlokaReadStatus(this.user.uid, this.verse.date).subscribe({
      next: (response: any) => {
        this.isRead = response.isRead || false;
        this.readStatusChanged.emit(this.isRead);
      },
      error: (error) => {
        console.error('Error loading shloka read status:', error);
        this.isRead = false;
      }
    });
  }

  onMarkAsRead() {
    if (this.isRead || this.loading || !this.user || !this.verse) return;

    this.loading = true;

    this.dataService.markShlokaAsRead(this.user.uid, this.verse.date).subscribe({
      next: (response) => {
        console.log('Shloka marked as read successfully:', response);
        this.isRead = true;
        this.loading = false;
        this.markAsRead.emit();
        this.readStatusChanged.emit(true);
      },
      error: (error) => {
        console.error('Error marking shloka as read:', error);
        this.loading = false;
        alert('Failed to mark shloka as read. Please try again.');
      }
    });
  }

}
