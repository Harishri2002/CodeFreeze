/**
 * notification.ts - Custom notification for read-only status
 */
import * as vscode from 'vscode';

export class NotificationManager {
    private static readonly NOTIFICATION_TIMEOUT = 5000; // 5 seconds
    private static currentNotification: vscode.StatusBarItem | undefined;
    
    /**
     * Shows a prominent notification about the read-only status
     * @param isReadOnly Whether the file is now read-only
     * @param fileName The name of the file
     */
    public static showReadOnlyNotification(isReadOnly: boolean, fileName: string): void {
        // Clear existing notification if any
        this.hideNotification();
        
        // Create a new status bar item that looks like a notification
        const notification = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            1000 // Very high priority to be on the far right
        );
        
        if (isReadOnly) {
            notification.text = `$(lock) ${fileName} is now READ-ONLY`;
            notification.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        } else {
            notification.text = `$(unlock) ${fileName} is now EDITABLE`;
            notification.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        }
        
        notification.show();
        this.currentNotification = notification;
        
        // Automatically hide after timeout
        setTimeout(() => {
            this.hideNotification();
        }, this.NOTIFICATION_TIMEOUT);
    }
    
    /**
     * Hides the current notification if it exists
     */
    private static hideNotification(): void {
        if (this.currentNotification) {
            this.currentNotification.dispose();
            this.currentNotification = undefined;
        }
    }
}