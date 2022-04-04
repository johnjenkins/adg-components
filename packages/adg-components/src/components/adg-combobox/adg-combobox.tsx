import {
  Component,
  getAssetPath,
  h,
  Prop,
  State,
  Element,
  Watch,
} from '@stencil/core';

const textInputRegexp = /^(([a-zA-Z])|(Backspace)|(Delete))$/;

interface OptionModel {
  value: string;
  label: string;
  checked: boolean;
  hidden: boolean;
}

@Component({
  tag: 'adg-combobox',
  styleUrl: 'adg-combobox.css',
  shadow: true,
  assetsDirs: ['assets'],
})
export class AdgComboboxComponent {
  connectedCallback() {
    this.setupLiveRegion();

    document.addEventListener('click', this.handleDocumentClick.bind(this));
    document.addEventListener('keyup', this.handleDocumentKeyUp.bind(this));
    this.watchOptionsHandler(this.options);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
    document.removeEventListener('keyup', this.handleDocumentKeyUp.bind(this));
  }

  @Element() el: HTMLElement;

  @Prop() filterLabel = '';
  @Prop() options: string[] = [];

  @Watch('options')
  watchOptionsHandler(newValue: string[]) {
    this.numberOfShownOptions = newValue.length;
    this.optionModels = newValue.map((option) => ({
      value: option.toLowerCase(),
      label: option,
      checked: false,
      hidden: false,
    }));
  }

  @State() optionModels: OptionModel[] = [];
  @Watch('optionModels')
  watchOptionModelsHandler() {
    this.selectedOptionModels = this.optionModels.filter(
      (optionModel) => optionModel.checked
    );
  }

  selectedOptionModels: OptionModel[] = [];

  @State() filterTermText: string = 'empty filter';
  @State() numberOfShownOptions = 0;
  @State() filterTermTextStartingWith: string = '';

  @State() isOptionsContainerOpen: boolean = false;

  @Prop() showInstructions = false;

  @Prop() ariaLiveAssertive = false;
  @Prop() roleAlert = false;

  filterInputElementRef: HTMLInputElement;
  unselectAllButtonElementRef: HTMLButtonElement;
  filterAndOptionsContainerElementRef: HTMLSpanElement;

  lastArrowSelectedElem = 0;
  availableOptionsListItems: HTMLLIElement[] = [];
  optionSelectedButtons: HTMLButtonElement[] = [];

  setupLiveRegion() {
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      this.roleAlert = true;
    } else {
      this.ariaLiveAssertive = true;
    }
  }

  handleDocumentClick(event: MouseEvent) {
    if (
      !event.composedPath().includes(this.filterAndOptionsContainerElementRef)
    ) {
      this.closeOptionsContainer();
    }
  }

  handleDocumentKeyUp(event: KeyboardEvent) {
    if (
      event.key === 'Tab' &&
      !event.composedPath().includes(this.filterAndOptionsContainerElementRef)
    ) {
      this.closeOptionsContainer();
    }
  }

  handleFilterInputClick() {
    this.openOptionsContainer();
  }

  handleToggleOptionsButtonClicked() {
    this.isOptionsContainerOpen
      ? this.closeOptionsContainer()
      : this.openOptionsContainer();
    this.filterInputElementRef.select();
  }

  handleFilterInputKeyup(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeOptionsContainer();
      if (this.el.shadowRoot.activeElement === this.filterInputElementRef) {
        this.unselectAllButtonElementRef.focus();
      } else {
        this.filterInputElementRef.focus();
      }
    }
  }

  handleUnselectAllButtonClick() {
    this.optionModels = this.optionModels.map((optionModel) => ({
      ...optionModel,
      checked: false,
    }));
    this.filterInputElementRef.focus();
  }

  handleUnselectAllButtonKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeOptionsContainer();
      this.filterInputElementRef.focus();
    }
  }

  handleFilterInputChange(event: Event) {
    const targetElement = event.target as HTMLInputElement;
    const filterTerm = targetElement.value.toLowerCase();
    this.filterTermText =
      filterTerm.trim() === '' ? 'empty filter' : `filter "${filterTerm}"`;

    this.optionModels = this.optionModels.map((optionModel) => ({
      ...optionModel,
      hidden: !optionModel.label.toLowerCase().includes(filterTerm),
    }));
    const shownOptions = this.optionModels.filter((option) => !option.hidden);
    this.numberOfShownOptions = shownOptions.length;
    this.filterTermTextStartingWith = shownOptions.length
      ? shownOptions[0].label
      : '';

    this.openOptionsContainer();
  }

  handleKeyUpForPageUpAndPageDown(event: KeyboardEvent) {
    if (event.key === 'PageDown' || event.key === 'PageUp') {
      const shownElems = this.availableOptionsListItems.filter(
        (elem) => !elem.hidden
      );
      const elemToFocus = shownElems
        .at(event.key === 'PageDown' ? -1 : 0)
        .querySelector('input');
      elemToFocus.focus();
    }
  }

  handleOptionInputFocus(i: number) {
    this.lastArrowSelectedElem = i + 1;
  }

  handleOptionInputKeyUp(event: KeyboardEvent, optionIndex: number) {
    if (event.key === 'Enter') {
      this.optionModels = this.optionModels.map((optionModel, i) =>
        i === optionIndex
          ? { ...optionModel, checked: !optionModel.checked }
          : optionModel
      );
    }
    if (event.key === 'Escape') {
      this.filterInputElementRef.focus();
      this.closeOptionsContainer();
    }
  }

  handleOptionInputChange(value: string) {
    this.optionModels = this.optionModels.map((optionModel) =>
      optionModel.value === value
        ? { ...optionModel, checked: !optionModel.checked }
        : optionModel
    );
  }

  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (this.isOptionsContainerOpen) {
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const arrowSelectableElems = [
          this.filterInputElementRef,
          ...this.availableOptionsListItems,
        ];
        for (let i = 0; i < arrowSelectableElems.length; i++) {
          let numberOfArrowSelectableElems = arrowSelectableElems.length;
          let j = modulo(
            direction * (i + 1) + this.lastArrowSelectedElem,
            numberOfArrowSelectableElems
          );
          let currentElem = arrowSelectableElems[j];
          if (!currentElem.hidden) {
            if (currentElem === this.filterInputElementRef) {
              currentElem.select();
            } else {
              currentElem.querySelector('input').focus();
            }
            break;
          }
        }
      } else {
        this.openOptionsContainer();
      }
    }

    if (event.key === '?') console.log('Help not yet implemented!');

    const { target } = event;
    if (event.key.match(textInputRegexp)) {
      if (target !== this.filterInputElementRef) {
        if (event.key.match(/^Backspace$/)) {
          this.filterInputElementRef.value =
            this.filterInputElementRef.value.slice(0, -1);
        } else if (event.key.match(/^Delete$/)) {
          this.filterInputElementRef.value = '';
        } else {
          this.filterInputElementRef.value += event.key;
        }
        this.filterInputElementRef.focus();
        this.filterInputElementRef.dispatchEvent(new Event('input'));
      }
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

  openOptionsContainer() {
    if (!this.isOptionsContainerOpen) {
      this.isOptionsContainerOpen = true;
      // Some screen readers do not announce the changed `aria-expanded`
      // attribute. So we give them some additional fodder to announce,
      // namely the instructions. We append them with a little delay so each
      // and every screen reader realises that the live region was changed and
      // hence needs to be announced.
      setTimeout(() => {
        this.showInstructions = true;
      }, 200);
    }
  }

  closeOptionsContainer() {
    if (this.isOptionsContainerOpen) {
      this.isOptionsContainerOpen = false;
      this.showInstructions = false;
    }
  }

  componentWillRender() {
    this.availableOptionsListItems = [];
    this.optionSelectedButtons = [];
  }

  render() {
    return (
      <div
        class="adg-combobox--container"
        onKeyUp={(ev) => this.handleKeyUp(ev)}
      >
        <label
          htmlFor="hobbies"
          class="adg-combobox--filter-label"
          data-inline-block
        >
          {this.filterLabel}
        </label>
        <span
          class={{
            'adg-combobox--filter-and-options-container': true,
            'adg-combobox--open': this.isOptionsContainerOpen,
          }}
          ref={(el) => (this.filterAndOptionsContainerElementRef = el)}
          data-inline-block
        >
          <span
            class="adg-combobox--filter-container"
            data-inline-block
            onKeyUp={(ev) => this.handleKeyUpForPageUpAndPageDown(ev)}
          >
            <input
              class="adg-combobox--filter-input"
              id="hobbies"
              type="text"
              role="combobox"
              aria-expanded={this.isOptionsContainerOpen ? 'true' : 'false'}
              autocomplete="off"
              placeholder="Enter filter term"
              aria-describedby="hobbies-x-options-selected"
              onInput={(ev) => this.handleFilterInputChange(ev)}
              onKeyUp={(ev) => this.handleFilterInputKeyup(ev)}
              onClick={() => this.handleFilterInputClick()}
              ref={(el) => (this.filterInputElementRef = el)}
            />
          </span>
          <button
            class="adg-combobox--unselect-all-button"
            type="button"
            ref={(el) => (this.unselectAllButtonElementRef = el)}
            onClick={() => this.handleUnselectAllButtonClick()}
            onKeyUp={(ev) => this.handleUnselectAllButtonKeyUp(ev)}
            hidden={this.selectedOptionModels.length === 0}
          >
            <span id="hobbies-x-options-selected">
              <span class="adg-combobox--x-selected-count">
                {this.selectedOptionModels.length}
              </span>
              <span data-visually-hidden>
                {this.filterLabel} selected:
                <span class="adg-combobox--x-selected-labels">
                  {this.selectedOptionModels.map((a) => a.label).join(',')}
                </span>
                ,
              </span>
            </span>
            <img src={getAssetPath(`./assets/clear.svg`)} alt="unselect all" />
          </button>
          <button
            class="adg-combobox--toggle-options-button"
            type="button"
            onClick={() => this.handleToggleOptionsButtonClicked()}
          >
            <img
              src={getAssetPath(`./assets/close.svg`)}
              class="adg-combobox--toggle-options-button-icon"
              alt={
                (this.openOptionsContainer ? 'Close' : 'Open') +
                ' ' +
                this.filterLabel +
                ' options'
              }
            />
          </button>
          <fieldset
            class="adg-combobox--available-options-container"
            hidden={!this.isOptionsContainerOpen}
            onKeyUp={(ev) => this.handleKeyUpForPageUpAndPageDown(ev)}
          >
            <legend class="adg-combobox--available-options-legend">
              <span data-visually-hidden>Available Hobbies:</span>
              <span
                class="adg-combobox--x-of-y-for-filter-text"
                data-live-region
                aria-live={this.ariaLiveAssertive ? 'assertive' : null}
                role={this.roleAlert ? 'alert' : null}
              >
                {this.numberOfShownOptions} of {this.options.length} options for{' '}
                {this.filterTermText}
                {!!this.filterTermTextStartingWith ? (
                  <span data-visually-hidden>
                    , starting with {this.filterTermTextStartingWith}
                  </span>
                ) : null}
                {this.showInstructions ? (
                  <span class="adg-combobox--instructions" data-visually-hidden>
                    (enter question mark for help)
                  </span>
                ) : null}
              </span>
            </legend>
            <ol class="adg-combobox--available-options-list">
              {this.optionModels.map((option, i) => (
                <li
                  key={option.value}
                  class="adg-combobox--available-options-list-item"
                  hidden={option.hidden}
                  ref={(el) => this.availableOptionsListItems.push(el)}
                >
                  <label data-inline-block>
                    <input
                      type="checkbox"
                      name="option"
                      value={option.value}
                      checked={option.checked}
                      onFocus={() => this.handleOptionInputFocus(i)}
                      onKeyUp={(ev) => this.handleOptionInputKeyUp(ev, i)}
                      onChange={() =>
                        this.handleOptionInputChange(option.value)
                      }
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

        <fieldset class="adg-combobox--selected-options-container">
          <legend data-visually-hidden>Selected {this.filterLabel}</legend>

          <ol class="adg-combobox--selected-options-list">
            {this.selectedOptionModels.map((option, i) => (
              <li>
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
      </div>
    );
  }
}

function modulo(a: number, n: number) {
  return ((a % n) + n) % n;
}
