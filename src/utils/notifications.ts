type NotificationType = 'success' | 'error' | 'info';

class NotificationManager {
  private container: HTMLDivElement | null = null;

  private createContainer() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(this.container);
  }

  show(message: string, type: NotificationType = 'info') {
    this.createContainer();

    const notification = document.createElement('div');
    notification.className = `
      p-4 rounded-lg shadow-lg transform translate-x-0 transition-all duration-300
      ${type === 'success' ? 'bg-green-500' : ''}
      ${type === 'error' ? 'bg-red-500' : ''}
      ${type === 'info' ? 'bg-blue-500' : ''}
      text-white
    `;
    notification.textContent = message;

    this.container?.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
        if (this.container?.childNodes.length === 0) {
          this.container.remove();
          this.container = null;
        }
      }, 300);
    }, 3000);
  }
}

export const notifications = new NotificationManager();