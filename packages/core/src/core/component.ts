import type { ComponentInternals } from './types';
import { isStream } from './stream';

let nextId = 0;

export abstract class Component {
  public abstract title: string;

  id = `component-${String(nextId++).padStart(3, '0')}`;

  $$: ComponentInternals = {
    streams: [],
    app: undefined,
  };

  abstract mount(target?: HTMLElement): void;

  destroy(): void {
    this.$$.app?.$destroy();
    this.$$.app = undefined;
  }

  start(): void {
    this.$$.streams = Object.entries(this)
      .filter(([x, s]) => x[0] === '$' && isStream(s))
      .map(([, stream]) => {
        stream.start();
        return stream;
      });
  }

  stop(): void {
    for (const s of this.$$.streams) {
      s.stop();
    }
  }

  dispose(): void {
    this.destroy();
    this.stop();
  }
}
