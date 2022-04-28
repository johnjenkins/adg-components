import {
  Component,
  getAssetPath,
  h,
  Listen,
  Prop,
  State,
  Element,
  Watch,
} from '@stencil/core';

import { Translator } from '../../utils/locale';


interface OptionModel {
  value: string;
  label: string;
  checked: boolean;
  hidden: boolean;
}

let nextUniqueId = 0;

@Component({
  tag: 'adg-combobox',
  styleUrl: 'adg-combobox.css',
  shadow: false,
  assetsDirs: ['assets'],
})
export class AdgComboboxComponent {
  private $t: Function;

  private _id = `adg-combobox-${nextUniqueId++}`;
  private _inputId = `${this._id}--input`;
  private _optionsSelectedId = `${this._id}--options-selected`;

  selectedOptionModels: OptionModel[] = [];
  lastArrowSelectedElem = -1;

  filterInputElementRef: HTMLInputElement;
  unselectAllButtonElementRef: HTMLButtonElement;
  fieldsetElementRef: HTMLFieldSetElement;
  filterAndOptionsContainerElementRef: HTMLSpanElement;

  availableOptionsListItems: HTMLLIElement[] = [];
  optionSelectedButtons: HTMLButtonElement[] = [];
  currentlyFocusedOption?: HTMLInputElement;

  @Element() el: HTMLElement;

  @Prop() label = '';
  @Prop() filterLabel = this.label;
  @Prop() options: string[] = [];
  @Prop() name = this._id;
  @Prop() multi = false;
  @Prop() showInstructions = false;
  @Prop() ariaLiveAssertive = false;
  @Prop() roleAlert = false;

  @State() filterTermText: string = '';
  @State() numberOfShownOptions = 0;
  @State() filteredOptionsStartingWith: string = '';
  @State() isOptionsContainerOpen: boolean = false;

  connectedCallback() {
    this.setupLiveRegion();
    this.watchOptionsHandler(this.options);
  }

  @Watch('options')
  watchOptionsHandler(newValue: string[]) {
    this.numberOfShownOptions = newValue.length;
    this.optionModels = newValue.map((option: any) => ({
      value: option.value || option.toLowerCase(),
      label: option.label || option,
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

    this.displaySelectedItems();
  }

  async componentWillLoad(): Promise<void> {
    this.$t = await Translator(this.el);
  }

  setupLiveRegion() {
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      this.roleAlert = true;
    } else {
      this.ariaLiveAssertive = true;
    }
  }

  @Listen('click', { target: 'document' })
  handleDocumentClick(event: MouseEvent) {
    if (
      !event.composedPath().includes(this.filterAndOptionsContainerElementRef)
    ) {
      this.closeOptionsContainer();
    }
  }

  @Listen('keyup', { target: 'document' })
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
      if (document.activeElement === this.filterInputElementRef) {
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
    const filterTerm = targetElement.value.toLowerCase().trim();
    this.filterTermText = filterTerm;

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
    this.currentlyFocusedOption =
      this.availableOptionsListItems[i].querySelector('input');
  }

  handleOptionInputKeyDown(event: KeyboardEvent, value: string) {
    // here we must override the default behavior of the browser, as otherwise the form will be submitted
    if (event.key === 'Enter') {
      this.handleOptionInputChange(value);
      if (!this.multi) {
        this.filterInputElementRef.focus();
        this.closeOptionsContainer();
      }
      event.preventDefault();
    }
    if (event.key === 'Escape') {
      this.filterInputElementRef.focus();
      this.closeOptionsContainer();
    }
  }

  handleOptionInputClick(event: MouseEvent) {
    if (event.x && event.y) { // todo: check if it is click
      if (!this.multi) {
        this.filterInputElementRef.focus();
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
      this.optionModels = this.optionModels.map((optionModel) => ({
        ...optionModel,
        checked: optionModel.value === value,
      }));
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (this.isOptionsContainerOpen) {
        if (this.multi) {
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
                this.lastArrowSelectedElem = 0;
                currentElem.select();
              } else {
                currentElem.querySelector('input').focus();
              }
              break;
            }
          }
        } else {
          if (this.lastArrowSelectedElem === 0) {
            const [checkedOption] = this.availableOptionsListItems
              .map((elem) => elem.querySelector('input'))
              .filter((input) => input.checked);
            const optionToFocus =
              checkedOption ||
              (this.availableOptionsListItems[0] &&
                this.availableOptionsListItems[0].querySelector('input'));
            if (optionToFocus) {
              optionToFocus.checked = true;
              optionToFocus.focus();
            }
          }
        }
      } else {
        this.openOptionsContainer();
      }
    }

    if (event.key === '?') console.log('Help not yet implemented!');
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
      this.filterInputElementRef.value = selectedOption?.label || '';
    }
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

  componentDidUpdate() {
    if (
      this.isOptionsContainerOpen &&
      !this.fieldsetElementRef.hidden &&
      this.currentlyFocusedOption
    ) {
      this.currentlyFocusedOption.focus();
    }
  }

  render() {
    return (
      <div
        class="adg-combobox--container"
        onKeyUp={(ev) => this.handleKeyUp(ev)}
      >
        <label
          htmlFor={this._inputId}
          class="adg-combobox--filter-label"
          data-inline-block
        >
          {this.label}
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
              id={this._inputId}
              name={this.name}
              type="text"
              role="combobox"
              aria-expanded={this.isOptionsContainerOpen ? 'true' : 'false'}
              autocomplete="off"
              placeholder={this.$t('input_placeholder')}
              aria-describedby={this._optionsSelectedId}
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
            <span id={this._optionsSelectedId}>
              {this.multi ? (
                <span class="adg-combobox--x-selected-count">
                  {this.selectedOptionModels.length}
                </span>
              ) : null}
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
            tabindex="-1"
            onClick={() => this.handleToggleOptionsButtonClicked()}
          >
            <img
              src={getAssetPath(`./assets/close.svg`)}
              class="adg-combobox--toggle-options-button-icon"
              alt={this.$t(this.openOptionsContainer ? 'close' : 'open', {
                filterLabel: this.filterLabel,
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
              <span data-visually-hidden>
                {this.$t('results_title', {
                  filterLabel: this.filterLabel,
                })}
                :
              </span>
              <span
                class="adg-combobox--x-of-y-for-filter-text"
                data-live-region
                aria-live={this.ariaLiveAssertive ? 'assertive' : null}
                role={this.roleAlert ? 'alert' : null}
              >
                {this.$t(this.filterTermText ? 'results_filtered' : 'results', {
                  filterLabel: this.filterLabel,
                  optionsShown: this.numberOfShownOptions,
                  optionsTotal: this.options.length,
                  filterTerm: this.filterTermText,
                })}

                {!!this.filteredOptionsStartingWith ? (
                  <span data-visually-hidden>
                    ,{' '}
                    {this.$t('results_first', {
                      first: this.filteredOptionsStartingWith,
                    })}
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
                      id={option.value}
                      type={this.multi ? 'checkbox' : 'radio'}
                      name={this.name}
                      value={option.value}
                      checked={option.checked}
                      onFocus={() => this.handleOptionInputFocus(i)}
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
          <fieldset class="adg-combobox--selected-options-container">
            <legend data-visually-hidden>Selected {this.filterLabel}</legend>

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
      </div>
    );
  }
}

function modulo(a: number, n: number) {
  return ((a % n) + n) % n;
}
