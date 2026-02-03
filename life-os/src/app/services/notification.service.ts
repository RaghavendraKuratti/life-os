import { Injectable } from "@angular/core";
import { LocalNotifications, PermissionStatus } from "@capacitor/local-notifications";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private meditationNotificationId = 1;
    private permissionStatus$ = new BehaviorSubject<PermissionStatus | null>(null);
    
    constructor() {
        this.checkPermissionStatus();
    }

    get permissionStatus() {
        return this.permissionStatus$.asObservable();
    }

    async checkPermissionStatus(): Promise<PermissionStatus> {
        try {
            const status = await LocalNotifications.checkPermissions();
            this.permissionStatus$.next(status);
            return status;
        } catch (error) {
            console.error('Error checking notification permissions:', error);
            return { display: 'prompt' };
        }
    }

    async requestPermissions(): Promise<PermissionStatus> {
        try {
            const status = await LocalNotifications.requestPermissions();
            this.permissionStatus$.next(status);
            return status;
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            return { display: 'denied' };
        }
    }

    async scheduleMeditationReminder(time: string): Promise<{ success: boolean; message: string }> {
        try {
            // Check and request permissions if needed
            const permStatus = await this.checkPermissionStatus();
            
            if (permStatus.display !== 'granted') {
                const newStatus = await this.requestPermissions();
                if (newStatus.display !== 'granted') {
                    return {
                        success: false,
                        message: 'Notification permission denied. Please enable notifications in your device settings.'
                    };
                }
            }

            const [hours, minutes] = time.split(":").map(Number);
            const now = new Date();
            const scheduleTime = new Date();
            scheduleTime.setHours(hours, minutes, 0, 0);
            
            if (scheduleTime < now) {
                scheduleTime.setDate(scheduleTime.getDate() + 1);
            }
            
            console.log("Scheduling meditation reminder for:", scheduleTime);
            
            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: this.meditationNotificationId,
                        title: "🧘 Time to Meditate",
                        body: "Calm your mind and defeat your inner enemies",
                        schedule: {
                            at: scheduleTime,
                            repeats: true,
                            every: 'day'
                        },
                        sound: undefined,
                        attachments: undefined,
                        actionTypeId: "",
                        extra: null
                    }
                ]
            });

            return {
                success: true,
                message: `Daily reminder set for ${time}`
            };
        } catch (error: any) {
            console.error('Error scheduling notification:', error);
            return {
                success: false,
                message: `Failed to schedule reminder: ${error.message || 'Unknown error'}`
            };
        }
    }

    async cancelReminders(): Promise<{ success: boolean; message: string }> {
        try {
            await LocalNotifications.cancel({
                notifications: [
                    {
                        id: this.meditationNotificationId,
                    }
                ]
            });
            
            return {
                success: true,
                message: 'Reminder cancelled successfully'
            };
        } catch (error: any) {
            console.error('Error cancelling notification:', error);
            return {
                success: false,
                message: `Failed to cancel reminder: ${error.message || 'Unknown error'}`
            };
        }
    }

}