import type { SvelteComponent } from 'svelte';
import Notification from '../ui/components/Notification.svelte';

let notificationContainer: HTMLDivElement | undefined;
let app: SvelteComponent | undefined;

export function notification({
  title,
  message,
  duration = 3000,
  type = 'default',
}: {
  title: string;
  message: string;
  duration?: number;
  type?: string;
}): void {
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    document.body.appendChild(notificationContainer);
    app = new Notification({
      target: notificationContainer,
    });
  }
  app?.add({ title, message, duration, type });
}
