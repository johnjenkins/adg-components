import {
  Component,
  getAssetPath,
  Event,
  Host,
  h,
  Listen,
  Prop,
  State,
  Element,
  Watch,
  EventEmitter,
} from '@stencil/core';

import { Translator } from '../../utils/locale';

const textInputRegexp = /^(([a-zA-Z])|(Backspace)|(Delete))$/;

let nextUniqueId = 0;

@Component({
  tag: 'adg-combobox',
  styleUrl: 'adg-combobox.scss',
  shadow: false,
  assetsDirs: ['assets'],
})
export class AdgComboboxComponent {
  private $t: Function;

  private _inputId: string;
  private _optionsSelectedId: string;
  // private _componentWillLoadComplete = false;

  selectedOptionModels: OptionModel[] = [];
  lastArrowSelectedElem = 0;

  filterInputElementRef: HTMLInputElement;
  selectionClearedButtonElementRef: HTMLButtonElement;
  fieldsetElementRef: HTMLFieldSetElement;
  filterAndOptionsContainerElementRef: HTMLSpanElement;

  availableOptionsListItems: HTMLLIElement[] = [];
  optionSelectedButtons: HTMLButtonElement[] = [];
  currentlyFocusedOption?: HTMLInputElement;

  applyFilterOnTermChange: boolean = true;

  @Element() el: HTMLElement;

  @Prop() label: string = null;
  @Prop() optionslabel: string = this.label || 'Options';

  @Prop() options: Option[] = [];
  @Prop() selected?: string[] | string;
  @Prop() name: string = this.optionslabel.replace(/\W+/g, '-');
  @Prop() multi: boolean = false;
  @Prop() roleAlert: boolean = false;

  @State() ariaLiveAssertive: boolean = false;
  @State() filterTerm: string = '';
  @State() numberOfShownOptions: number = 0;
  @State() filteredOptionsStartingWith: string = '';
  @State() isOptionsContainerOpen: boolean = false;

  connectedCallback() {
    const internalId = this.el.id || `adg-combobox-${nextUniqueId++}`;
    this._inputId = `${internalId}--filter`;
    this._optionsSelectedId = `${internalId}--options-selected`;

    this.setupLiveRegion();
    this.watchOptionsHandler(this.options);
    if (!this.label) {
      if (
        !document.querySelector('label[for=' + this._inputId + ']') &&
        !this.el.closest('label')
      ) {
        console.warn(
          "Every form control needs an associated label, see https://a11y-dev.guide/examples/forms/good-example/. If you set option label='My cool combobox', we will create one for you."
        );
      }
    }
  }

  @Event() optionChanged: EventEmitter<AdgComboboxOptionChange>;
  @Event() selectionCleared: EventEmitter<never>;
  @Event() filterTermChanged: EventEmitter<AdgComboboxFilterTermChange>;
  @Event() optionsDropdownOpened: EventEmitter<never>;
  @Event() optionsDropdownClosed: EventEmitter<never>;

  @Watch('options')
  watchOptionsHandler(newValue: Option[]) {
    this.numberOfShownOptions = newValue.length;
    this.optionModels = newValue.map((option: Option) => ({
      value: typeof option === 'string' ? option.toLowerCase() : option.value,
      label: typeof option === 'string' ? option : option.label,
      checked: false,
      hidden: false,
    }));
    this.filteredOptionsStartingWith = this.optionModels[0].label;
  }

  @State() optionModels: OptionModel[] = [];
  @Watch('optionModels')
  watchOptionModelsHandler() {
    this.selectedOptionModels = this.optionModels.filter(
      (optionModel) => optionModel.checked
    );
  }

  async componentWillLoad(): Promise<void> {
    this.$t = await Translator(this.el);
    this.optionModels = this.optionModels.map((optionModel) => {
      let checked = false;
      if (this.multi && Array.isArray(this.selected)) {
        checked = this.selected.includes(optionModel.value);
      } else if (!this.multi && typeof this.selected === 'string') {
        checked = this.selected === optionModel.value;
        if (checked) this.filterTerm = optionModel.label;
      }
      return { ...optionModel, checked };
    });
    // this._componentWillLoadComplete = true;
  }

  setupLiveRegion() {
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ||
        navigator.platform.toLowerCase() === 'iphone' ||
        navigator.platform.toLowerCase() === 'ipad') {
      this.ariaLiveAssertive = true;
    } else {
      this.roleAlert = true;
    }
  }

  @Listen('click', { target: 'document' })
  @Listen('focusin', { target: 'document' })
  handleDocumentClick(event: CustomEvent) {
    if (
      !event.composedPath().includes(this.filterAndOptionsContainerElementRef)
    ) {
      this.closeOptionsContainer(false);
    }
  }

  handleFilterInputClick() {
    this.openOptionsContainer(false);
  }

  handleToggleAvailableOptionsButtonClicked() {
    this.isOptionsContainerOpen
      ? this.closeOptionsContainer()
      : this.openOptionsContainer();
  }

  handleFilterInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      
      this.closeOptionsContainer();
    }

    this.applyFilterOnTermChange = true;
  }

  setInputValue(val: string, focus: boolean = true) {
    if (focus) {
      this.filterInputElementRef.focus();
    }
    this.filterInputElementRef.value = val;
    this.filterInputElementRef.dispatchEvent(
      new window.Event('input', { bubbles: true })
    );
  }

  handleSelectionClearedButtonClick() {
    const selectedOptionValues = this.selectedOptionModels.map(
      ({ value }) => value
    );
    this.optionModels = this.optionModels.map((optionModel) => ({
      ...optionModel,
      checked: false,
    }));
    selectedOptionValues.forEach((value) =>
      this.optionChanged.emit({ value, selected: false })
    );
    this.selectionCleared.emit();
    this.setInputValue('');
  }

  handleFilterInputChange(event: Event) {
    if(!this.applyFilterOnTermChange) {
      return;
    }

    const targetElement = event.target as HTMLInputElement;
    const filterTerm = targetElement.value.toLowerCase().trim();

    const previousFilterTerm = this.filterTerm;
    this.filterTerm = filterTerm;

    let optionModels = this.optionModels.map((optionModel) => ({
      ...optionModel,
      hidden: !optionModel.label.toLowerCase().includes(filterTerm),
    }));

    this.optionModels = optionModels;
    const shownOptions = this.optionModels.filter((option) => !option.hidden);
    this.numberOfShownOptions = shownOptions.length;
    this.filteredOptionsStartingWith = shownOptions.length
      ? shownOptions[0].label
      : '';

    this.filterTermChanged.emit({ previousFilterTerm, filterTerm });

    if(filterTerm !== '') {
      this.openOptionsContainer(false);
    }
  }

  handleKeyUpForPageUpAndPageDown(event: KeyboardEvent) {
    if (event.key === 'PageDown' || event.key === 'PageUp') {
      this.openOptionsContainer(false);

      const shownElems = this.availableOptionsListItems.filter(
        (elem) => !elem.hidden
      );
      const elemToFocus = shownElems
        .at(event.key === 'PageDown' ? -1 : 0)
        .querySelector('input');

      setTimeout(() => {
        elemToFocus.focus();
      }, 0);
    }
  }

  handleOptionInputKeyDown(event: KeyboardEvent, value: string) {
    // here we must override the default behavior of the browser, as otherwise the form will be submitted
    if (event.key === 'Enter') {
      this.handleOptionInputChange(value);
      if (!this.multi) {
        this.closeOptionsContainer();
      }
      event.preventDefault();
    }
    if (event.key === 'Escape') {
      this.closeOptionsContainer();
    }
  }

  handleOptionInputClick(event: MouseEvent) {
    if (event.x && event.y) {
      // todo: check if it is click
      if (!this.multi) {
        this.closeOptionsContainer();
      }
    }
  }

  handleOptionInputChange(value: string) {
    if (this.multi) {
      this.optionModels = this.optionModels.map((optionModel) =>
        optionModel.value === value
          ? { ...optionModel, checked: !optionModel.checked }
          : optionModel
      );
    } else {
      this.applyFilterOnTermChange = false;
      this.optionModels = this.optionModels.map((optionModel) => ({
        ...optionModel,
        checked: optionModel.value === value ? !optionModel.checked : false,
      }));
    }

    const option = this.optionModels.find(
      (optionModel) => optionModel.value === value
    );
    if (option) {
      this.optionChanged.emit({ value, selected: option.checked });
    }

    this.displaySelectedItems();
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();

      if (!this.isOptionsContainerOpen) {
        this.openOptionsContainer(false);
        return;
      }

      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const shownElems = this.availableOptionsListItems.filter(
        (elem) => !elem.hidden
      );

      const arrowSelectableElems = [this.filterInputElementRef, ...shownElems];

      const index = modulo(
        direction + this.lastArrowSelectedElem,
        arrowSelectableElems.length
      );

      const currentElem = arrowSelectableElems[index];

      if (currentElem === this.filterInputElementRef) {
        currentElem.select();
      } else {
        setTimeout(() => {
          currentElem.querySelector('input').focus();
        }, 0);
      }

      this.lastArrowSelectedElem = index;
    }

    if (event.key === '?') console.log('Help not yet implemented!');

    if (
      event.key.match(textInputRegexp) &&
      document.activeElement !== this.filterInputElementRef
    ) {
      this.filterInputElementRef.focus();
      this.lastArrowSelectedElem = 0;
    }
  }

  handleOptionSelectedButtonClick(value: string, clickedIndex: number) {
    this.handleOptionInputChange(value);
    setTimeout(() => {
      const nextIndex =
        this.optionSelectedButtons.length === 1
          ? -1
          : clickedIndex < this.optionSelectedButtons.length - 1
          ? clickedIndex
          : clickedIndex - 1;
      if (nextIndex >= 0) {
        this.optionSelectedButtons[nextIndex].focus();
      } else {
        this.filterInputElementRef.select();
      }
    });
  }

  displaySelectedItems() {
    if (!this.multi && this.filterInputElementRef) {
      const selectedOption = this.selectedOptionModels.find((a) => a.checked);
      this.setInputValue(selectedOption?.label || '', false);
    }
  }

  openOptionsContainer(selectInput = true) {
    if (this.isOptionsContainerOpen) {
      return;
    }

    this.isOptionsContainerOpen = true;
    this.lastArrowSelectedElem = 0;

    selectInput && this.filterInputElementRef.select();

    this.optionsDropdownOpened.emit();
  }

  closeOptionsContainer(selectInput = true) {
    if (!this.isOptionsContainerOpen) {
      return;
    }

    this.isOptionsContainerOpen = false;

    selectInput && this.filterInputElementRef.select();

    this.optionsDropdownClosed.emit();
  }

  componentWillRender() {
    this.availableOptionsListItems = [];
    this.optionSelectedButtons = [];
  }

  render() {
    return (
      <Host onKeyDown={(ev) => this.handleKeyDown(ev)} class={`adg-combobox adg-combobox--${this.multi ? 'multi' : 'single'}`}>
        {this.label ? (
          <label
            htmlFor={this._inputId}
            class="adg-combobox--filter-label"
          >
            {this.label}:&nbsp;
          </label>
        ) : null}
        <span
          class={{
            'adg-combobox--filter-and-options-container': true,
            'adg-combobox--open': this.isOptionsContainerOpen,
            'adg-combobox--closed': !this.isOptionsContainerOpen,
          }}
          ref={(el) => (this.filterAndOptionsContainerElementRef = el)}
        >
          <span
            class="adg-combobox--filter-container"
            onKeyUp={(ev) => this.handleKeyUpForPageUpAndPageDown(ev)}
          >
            <input
              class="adg-combobox--filter-input"
              id={this._inputId}
              type="text"
              role="combobox"
              aria-expanded={this.isOptionsContainerOpen ? 'true' : 'false'}
              aria-multiselectable={this.multi.toString()}
              autocomplete="off"
              placeholder={this.$t('input_placeholder')}
              aria-describedby={this._optionsSelectedId}
              onInput={(ev) => this.handleFilterInputChange(ev)}
              onKeyDown={(ev) => this.handleFilterInputKeyDown(ev)}
              onClick={() => this.handleFilterInputClick()}
              ref={(el) => (this.filterInputElementRef = el)}
              value={this.filterTerm}
            />
          </span>
          <button
            class="adg-combobox--clear-selection-button"
            type="button"
            ref={(el) => (this.selectionClearedButtonElementRef = el)}
            onClick={() => this.handleSelectionClearedButtonClick()}
            hidden={this.selectedOptionModels.length === 0}
          >
            <span id={this._optionsSelectedId}>
              {this.multi ? (
                <span class="adg-combobox--x-selected-count">
                  {this.selectedOptionModels.length}&nbsp;
                </span>
              ) : null}
              <span class="adg--visually-hidden">
                {this.$t('results_selected', {
                  optionslabel: this.optionslabel,
                })}
                <span class="adg-combobox--x-selected-labels">
                  {this.selectedOptionModels.map((a) => a.label).join(', ')}
                </span>
                ,
              </span>
            </span>
            <img src={getAssetPath(`./assets/clear.svg`)} alt={this.$t('clear_selection')} />
          </button>
          <button
            class="adg-combobox--toggle-available-options-button"
            type="button"
            tabindex="-1"
            onClick={() => this.handleToggleAvailableOptionsButtonClicked()}
          >
            <img
              src={getAssetPath(`./assets/close.svg`)}
              class="adg-combobox--toggle-available-options-button-icon"
              alt={this.$t(this.isOptionsContainerOpen ? 'close' : 'open', {
                optionslabel: this.optionslabel,
              })}
            />
          </button>
          <fieldset
            ref={(el) => (this.fieldsetElementRef = el)}
            class="adg-combobox--available-options-container"
            hidden={!this.isOptionsContainerOpen}
            onKeyUp={(ev) => this.handleKeyUpForPageUpAndPageDown(ev)}
          >
            <legend class="adg-combobox--available-options-legend">
              <span class="adg--visually-hidden">
                {this.$t('results_title', {
                  optionslabel: this.optionslabel,
                })}
                :&nbsp;
              </span>
              <span
                class="adg-combobox--x-of-y-for-filter-text"
                data-live-region
                aria-live={this.ariaLiveAssertive ? 'polite' : null}
                role={this.roleAlert ? 'alert' : null}
              >
                {this.$t(this.filterTerm ? 'results_filtered' : 'results', {
                  optionslabel: this.optionslabel,
                  optionsShown: this.numberOfShownOptions,
                  optionsTotal: this.options.length,
                  filterTerm: this.filterTerm,
                })}

                {!!this.filteredOptionsStartingWith ? (
                  <span class="adg--visually-hidden">
                    ,{' '}
                    {this.$t('results_first', {
                      first: this.filteredOptionsStartingWith,
                    })}
                  </span>
                ) : null}
              </span>
            </legend>
            <ol class="adg-combobox--available-options-list">
              {this.optionModels.map((option) => (
                <li
                  key={option.value}
                  class="adg-combobox--available-options-list-item"
                  hidden={option.hidden}
                  ref={(el) => this.availableOptionsListItems.push(el)}
                >
                  <label>
                    <input
                      type={this.multi ? 'checkbox' : 'radio'}
                      name={`${this.name}${this.multi ? '[]' : ''}`}
                      value={option.value}
                      checked={option.checked}
                      onKeyDown={(ev) =>
                        this.handleOptionInputKeyDown(ev, option.value)
                      }
                      onClick={(ev) => this.handleOptionInputClick(ev)}
                      onInput={() => this.handleOptionInputChange(option.value)}
                    />
                    <span>
                      {option.label}
                      <span class="check"></span>
                    </span>
                  </label>
                </li>
              ))}
            </ol>
          </fieldset>
        </span>

        {this.multi ? (
          <fieldset
            class="adg-combobox--selected-options-container"
            hidden={this.selectedOptionModels.length == 0}
          >
            <legend class="adg--visually-hidden">
              {this.$t('results_selected', {
                optionslabel: this.optionslabel,
              })}
            </legend>

            <ol class="adg-combobox--selected-options-list">
              {this.selectedOptionModels.map((option, i) => (
                <li key={option.value}>
                  <button
                    class="adg-combobox--selected-options-button"
                    type="button"
                    ref={(el) => this.optionSelectedButtons.push(el)}
                    onClick={() =>
                      this.handleOptionSelectedButtonClick(option.value, i)
                    }
                  >
                    {option.label}
                    <img
                      src={getAssetPath(`./assets/clear.svg`)}
                      alt="unselect"
                    />
                  </button>
                </li>
              ))}
            </ol>
          </fieldset>
        ) : null}
      </Host>
    );
  }
}

function modulo(a: number, n: number) {
  return ((a % n) + n) % n;
}

type OptionBase = { label: string; value: string };

export type Option = OptionBase | string;

interface OptionModel extends OptionBase {
  checked: boolean;
  hidden: boolean;
}

class AdgComboboxOptionChange {
  constructor(public value: string, public selected: boolean) {}
}

class AdgComboboxFilterTermChange {
  constructor(public previousFilterTerm: string, public filterTerm: string) {}
}
