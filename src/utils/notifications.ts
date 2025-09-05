import { toast } from 'sonner@2.0.3';

export class NotificationManager {
  // Show success notification
  success(message: string) {
    toast.success(message);
  }

  // Show error notification
  error(message: string) {
    toast.error(message);
  }

  // Show info notification
  info(message: string) {
    toast.info(message);
  }

  // Show warning notification
  warning(message: string) {
    toast.warning(message);
  }

  // Show custom notification
  custom(message: string, options?: any) {
    toast(message, options);
  }

  // Show connection-related notifications
  connectionEstablished(mentorName: string) {
    this.success(`Connected with ${mentorName}! You can now start messaging.`);
  }

  connectionRequestSent(mentorName: string) {
    this.success(`Connection request sent to ${mentorName}`);
  }

  messageReceived(senderName: string) {
    this.info(`New message from ${senderName}`);
  }

  fileUploaded(fileName: string) {
    this.success(`${fileName} uploaded successfully`);
  }

  profileUpdated() {
    this.success('Profile updated successfully');
  }

  // Handle offline/online status
  showOfflineWarning() {
    this.warning('You appear to be offline. Some features may not work properly.');
  }

  showOnlineStatus() {
    this.success('You are back online');
  }
}

export const notifications = new NotificationManager();