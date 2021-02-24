import { DashboardPage } from './dashboard_page';
import DashboardComponent from './Dashboard.svelte';
import { Stream } from '../core';
import { DashboardSettings } from './dashboard_settings';

export interface DashboardOptions {
  title: string;
  author: string;
  closable?: boolean;
}

export class Dashboard {
  panels: Record<string, DashboardPage> = {};
  app?: DashboardComponent;
  settings = new DashboardSettings();

  $active = new Stream(false as boolean, true);
  $page = new Stream('', true);

  title: string;
  author: string;
  closable: boolean;

  constructor({
    title = 'Hello, Marcelle!',
    author = 'author',
    closable = false,
  }: DashboardOptions) {
    this.title = title;
    this.author = author;
    this.closable = closable;
  }

  page(name: string): DashboardPage {
    if (!Object.keys(this.panels).includes(name)) {
      this.panels[name] = new DashboardPage(name);
    }
    return this.panels[name];
  }

  start(): void {
    this.app = new DashboardComponent({
      target: document.body,
      props: {
        title: this.title,
        author: this.author,
        dashboards: this.panels,
        settings: this.settings,
        page: this.$page,
        closable: this.closable,
      },
    });
    this.$active.set(true);
    this.app.$on('quit', () => {
      this.$active.set(false);
      this.app?.$destroy();
      Object.values(this.panels).forEach((panel) => {
        panel.destroy();
      });
      this.app = undefined;
    });
  }

  destroy(): void {
    this.app?.quit();
  }
}

export function dashboard(options: DashboardOptions): Dashboard {
  return new Dashboard(options);
}
