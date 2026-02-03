import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private baseUrl = environment.backendUrl;
  currentEnemy: any;
  constructor(private fs: Firestore, private http: HttpClient){}

  getTodayVerse(): Observable<any> {
    // const headers = { 
    //   'Cache-Control': 'no-cache', 
    //   'Pragma': 'no-cache',
    //   'Expires': '0',
    //   'Surrogate-Control': 'no-cache'
    // }
    return this.http.get(`${this.baseUrl}/verse/today?ts=${Date.now()}`);
  }

  getUser(uid: string): Observable<any> {
    const userRef = doc(this.fs, `users/${uid}`);
    return docData(userRef, { idField: 'id' });
  }

  updateStreak(uid: string) {
    return this.http.get(`${this.baseUrl}/user/streak/${uid}`);
  }

  updateUserInfo(uid: string, profileSettings: any) {
    return this.http.put(`${this.baseUrl}/user/info/${uid}`, profileSettings);
  }
  createUserInfo(profileDetails: any) {
    return this.http.post(`${this.baseUrl}/user/info`, profileDetails);
  }
  fetchUserInfo(uid: string) {
    return this.http.get(`${this.baseUrl}/user/info/${uid}`);
  }

  saveCheckins(uid: any, enemy: string, rating: number, enhancedData?: any) {
    const payload = enhancedData ? {
      enemy,
      rating,
      ...enhancedData
    } : { enemy, rating };
    
    return this.http.post(`${this.baseUrl}/checkin/${uid}`, payload);
  }

  getTriggers(enemy: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/checkin/triggers/${enemy}`);
  }

  // weeklyStats(uid: any) {
  //   return this.http.get(`${this.baseUrl}/checkin/weekly/${uid}`);
  // }

  enemyList() {
    return this.http.get(`${this.baseUrl}/enemy/`);
  }
  enemyDetails(enemyId: any) {
    return this.http.get(`${this.baseUrl}/enemy/${enemyId}`);
  }

  saveJournel(userId: any, tags: string[], note: string, moodBefore?: string, moodAfter?: string) {
    return this.http.post(`${this.baseUrl}/checkin/journel/${userId}`, {
      tags,
      note,
      moodBefore,
      moodAfter
    });
  }

  getJournalPrompts(enemy: string, count: number = 3) {
    return this.http.get(`${this.baseUrl}/checkin/prompts/${enemy}?count=${count}`);
  }

  getJournalEntries(userId: string, options: any = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.enemy) params.append('enemy', options.enemy);
    
    const queryString = params.toString();
    const url = `${this.baseUrl}/checkin/journel/entries/${userId}${queryString ? '?' + queryString : ''}`;
    return this.http.get(url);
  }

  getJournalAnalytics(userId: string, days: number = 30) {
    return this.http.get(`${this.baseUrl}/checkin/journel/analytics/${userId}?days=${days}`);
  }

  progress(userId: any, key: string, progressReq: number) {
    return this.http.post(`${this.baseUrl}/user/progress/${userId}`, { key, progressReq });
  }

  fetchMeditationHistory(userId: any, enemy: string, length: number = 1) {
    return this.http.get(`${this.baseUrl}/meditation/${userId}`, {
      params: {
        enemy,
        pageSize: length
      }
    });
  }

  saveMeditationHistory(userId: any, enemy: string, mantra: string, duration: number) {
    return this.http.post(`${this.baseUrl}/meditation/`, {userId, enemy, mantra, duration} );
  }

  getWeeklyInsights(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/insights/weekly/${userId}`);
  }

  getEnemyOfDay(): Observable<any> {
    return this.http.get(`${this.baseUrl}/enemy-of-day/today`);
  }

  markShlokaAsRead(userId: string, date: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verse/mark-read`, { userId, date });
  }

  checkShlokaReadStatus(userId: string, date: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/verse/read-status/${userId}/${date}`);
  }

  // Analytics Methods
  
  /**
   * Get summary statistics
   * @param userId - User ID
   * @param days - Number of days to analyze (default: 7)
   */
  getAnalyticsSummary(userId: string, days: number = 7): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/summary/${userId}`, {
      params: { days: days.toString() }
    });
  }

  /**
   * Get intensity trend over time
   * @param userId - User ID
   * @param days - Number of days to analyze (default: 7)
   * @param enemy - Optional enemy filter
   */
  getIntensityTrend(userId: string, days: number = 7, enemy?: string): Observable<any> {
    const params: any = { days: days.toString() };
    if (enemy) {
      params.enemy = enemy;
    }
    return this.http.get(`${this.baseUrl}/analytics/intensity-trend/${userId}`, { params });
  }

  /**
   * Get trigger frequency analysis
   * @param userId - User ID
   * @param days - Number of days to analyze (default: 30)
   * @param enemy - Optional enemy filter
   */
  getTriggerAnalysis(userId: string, days: number = 30, enemy?: string): Observable<any> {
    const params: any = { days: days.toString() };
    if (enemy) {
      params.enemy = enemy;
    }
    return this.http.get(`${this.baseUrl}/analytics/triggers/${userId}`, { params });
  }

  /**
   * Get time-of-day patterns
   * @param userId - User ID
   * @param days - Number of days to analyze (default: 30)
   */
  getTimePatterns(userId: string, days: number = 30): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/time-patterns/${userId}`, {
      params: { days: days.toString() }
    });
  }

  /**
   * Get comprehensive analytics (all data in one call)
   * @param userId - User ID
   * @param options - Query options
   */
  getComprehensiveAnalytics(userId: string, options?: {
    summaryDays?: number;
    trendDays?: number;
    triggerDays?: number;
    timeDays?: number;
    enemy?: string;
  }): Observable<any> {
    const params: any = {};
    if (options?.summaryDays) params.summaryDays = options.summaryDays.toString();
    if (options?.trendDays) params.trendDays = options.trendDays.toString();
    if (options?.triggerDays) params.triggerDays = options.triggerDays.toString();
    if (options?.timeDays) params.timeDays = options.timeDays.toString();
    if (options?.enemy) params.enemy = options.enemy;
    
    return this.http.get(`${this.baseUrl}/analytics/comprehensive/${userId}`, { params });
  }

  /**
   * Get enemy analytics for karma page
   * @param userId - User ID
   * @param days - Number of days to analyze (default: 30)
   */
  getEnemyAnalytics(userId: string, days: number = 30): Observable<any> {
    return this.http.get(`${this.baseUrl}/enemy-analytics/${userId}`, {
      params: { days: days.toString() }
    });
  }
}
