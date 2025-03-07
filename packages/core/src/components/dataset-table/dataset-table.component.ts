import { Component, Dataset, Instance, Stream } from '../../core';
import View from './dataset-table.view.svelte';

export class DatasetTable<T extends Instance> extends Component {
  title = 'dataset table';

  #dataset: Dataset<T>;
  $columns: Stream<string[]>;
  $selection: Stream<T[]> = new Stream([], true);

  singleSelection = false;

  constructor(dataset: Dataset<T>, columns?: string[], singleSelection = false) {
    super();
    this.#dataset = dataset;
    this.singleSelection = singleSelection;
    this.$columns = new Stream(columns || ['x', 'y', 'thumbnail', 'updatedAt'], true);
    if (!columns) {
      this.#dataset.ready
        .then(() => this.#dataset.items().take(1).toArray())
        .then((res) => {
          if (res.length > 0) {
            const cols = Object.keys(res[0]);
            this.$columns.set(cols);
          }
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log('An error occured while fetching the first instance.', error);
        });
    }
    this.start();
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        dataset: this.#dataset,
        colNames: this.$columns,
        singleSelection: this.singleSelection,
        selection: this.$selection,
      },
    });
  }
}
