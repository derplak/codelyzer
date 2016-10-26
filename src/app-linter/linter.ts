import {Formatter} from './formatter-interface';
import {RichEditor} from './rich-editor-interface';

export interface LinterConfig {
  formatter: Formatter;
  textEditor: RichEditor;
  errorsContainer: HTMLElement;
  errorLabelContainer: HTMLElement;
  workerBundle: string;
}

export class Linter {

  private worker: Worker;
  private widgets: any[] = [];

  constructor(private config: LinterConfig) {}

  init() {
    this.worker = new Worker(this.config.workerBundle);
    this.worker.addEventListener('message', (res: any) => {
      try {
        console.log(res.data);
        const errors = JSON.parse(res.data);
        this.renderErrors(errors);
        this.config.textEditor.showErrors(errors);
      } catch (e) {
        console.error(e);
      }
    });
    this.config.textEditor.on('change', () =>
      this.lint(this.config.textEditor.getValue()));
    this.lint(this.config.textEditor.getValue());
  }

  lint(program: string) {
    this.worker.postMessage(JSON.stringify({ program }));
  }

  renderErrors(errors: any[]) {
    if (!errors || !errors.length) {
      this.config.errorLabelContainer.innerHTML = 'Good job! No warnings in your code!';
      this.config.errorsContainer.innerHTML = '';
    } else {
      this.config.errorLabelContainer.innerHTML = 'Warnings';
      this.config.errorsContainer.innerHTML = this.config.formatter.formatErrors(errors);
    }
  }
}
