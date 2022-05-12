import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ALL } from 'dns';

export const ALL_MULTI_OPTIONS = [
  { label: 'Soccer', value: 'soccer' },
  { label: 'Badminton', value: 'badminton' },
  { label: 'Movies', value: 'movies' },
  { label: 'Gardening', value: 'gardening' },
  { label: 'Kickboxing', value: 'kickboxing' },
  { label: 'Hiking', value: 'hiking' },
  { label: 'Dancing', value: 'dancing' },
  { label: 'Painting', value: 'painting' },
  { label: 'Cooking', value: 'cooking' },
  { label: 'Reading', value: 'reading' },
  { label: 'Sleeping', value: 'sleeping' },
  { label: 'Programming', value: 'programming' },
];

export const ALL_SINGLE_OPTIONS = [
  { label: 'Black', value: '000000' },
  { label: 'Blue', value: '0000FF' },
  { label: 'Brown', value: 'A52A2A' },
  { label: 'Green', value: '008000' },
  { label: 'Grey', value: '808080' },
  { label: 'Orange', value: 'FFA500' },
  { label: 'Pink', value: 'FFC0CB' },
  { label: 'Red', value: 'FF0000' },
  { label: 'White', value: 'FFFFFF' },
  { label: 'Yellow', value: 'FFFF00' },
];

interface ComboboxExpectations {
  filterFocused?: boolean;
  filterValue?: string;
  filterTerm?: string; // For multi-selects, this always equals filterValue. For single-selects, this may be different: when I select an option, the filter is set to the option's label, but this does NOT represent the filter term!
  optionsExpanded?: boolean;
  visibleOptions?: string[];
  focusedOption?: string;
  selectedOptions?: string[];
  selectionClearedButtonFocused?: boolean;
}

export const expectSingleCombobox = async (
  page: Page,
  expectations: ComboboxExpectations
) => {
  const adgCombobox = page.locator(`adg-combobox#colours`);

  if (expectations.filterValue || expectations.filterTerm) {
    if (
      expectations.filterValue === undefined ||
      expectations.filterTerm === undefined
    )
      throw new Error(
        `If you pass a "filterValue", it must always be accompanied by a "filterTerm" in single-selects!`
      );
  }
  const mergedExpectations = Object.assign(
    {},
    {
      filterFocused: false,
      filterValue: '',
      filterTerm: '',
      optionsExpanded: false,
      visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
      focusedOption: null,
      selectedOptions: [],
      selectionClearedButtonFocused: false,
    },
    expectations
  );

  await expectCombobox(adgCombobox, mergedExpectations, {
    internalId: 'colours',
    label: 'Farben wählen',
    filterlabel: 'Farben',
    multi: false,
    lang: 'de',
  });
};

// RAMON: Nearly identical copy of expectSingleSelect
export const expectMultiCombobox = async (
  page: Page,
  expectations: ComboboxExpectations
) => {
  const adgCombobox = page.locator(`adg-combobox#hobbies`);

  if (expectations.filterTerm) {
    throw new Error(
      `You don't need to pass an expectation for "filterTerm", as it always is the same like "filterValue" in multi-selects!`
    );
  }
  const mergedExpectations = Object.assign(
    {},
    {
      filterFocused: false,
      filterValue: '',
      filterTerm: expectations.filterValue, // In multi-select, the filterValue always corresponds to the filterTerm!
      optionsExpanded: false,
      visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
      focusedOption: null,
      selectedOptions: [],
      selectionClearedButtonFocused: false,
    },
    expectations
  );

  await expectCombobox(adgCombobox, mergedExpectations, {
    internalId: 'hobbies',
    label: null,
    filterlabel: 'Hobbies',
    multi: true,
    lang: 'en',
  });
};

export const expectCombobox = async (
  combobox: Locator,
  expectations: ComboboxExpectations,
  options: {
    internalId: string;
    label: string;
    filterlabel: string;
    multi: boolean;
    lang: string;
  }
) => {
  const {
    filterFocused,
    filterValue,
    filterTerm,
    optionsExpanded,
    visibleOptions,
    focusedOption,
    selectedOptions,
    selectionClearedButtonFocused,
  } = expectations;

  const filterInputId = `${options.internalId}--filter`;
  const xOptionsSelectedId = `${options.internalId}--options-selected`;

  await expect(combobox).toHaveClass(/hydrated/); // TODO: Where does this come from an what's it for actually?
  await expect(combobox).toHaveCSS('display', 'inline-block');

  const filterlabel = combobox.locator('label.adg-combobox--filter-label');
  if (options.label) {
    await expect(filterlabel).toHaveText(`${options.label}:`);
    await expect(filterlabel).toHaveAttribute('for', filterInputId);
    await expect(filterlabel).toHaveCSS('display', 'inline-block'); // So label and filter input are read "in one go" in most screen readers => TODO: factor out into custom matcher, ie. `toNotIntroduceSemanticLineBreak`!
  }

  const filterAndOptionsContainer = combobox.locator(
    '.adg-combobox--filter-and-options-container'
  );
  await expect(filterAndOptionsContainer).toHaveCSS('display', 'inline-block');

  const searchContainer = filterAndOptionsContainer.locator(
    '.adg-combobox--search'
  );
  await expect(searchContainer).toHaveCSS('display', 'inline-block');

  const filterInput = searchContainer.locator(
    'input.adg-combobox--search-input'
  );
  options.label && (await expect(filterInput).toHaveId(filterInputId));
  await expect(filterInput).toHaveAttribute('type', 'text');
  await expect(filterInput).toHaveAttribute('role', 'combobox'); // Needed for a) that certain screen readers and browsers announce aria-expanded change (ie. Chrome on Desktop), and to let certain screen readers give some more details about the element's purpose (ie. VoiceOver/iOS would say "combobox")
  if (options.multi) {
    await expect(filterInput).toHaveValue(filterValue);
  } else {
  }
  await expect(filterInput).toHaveAttribute(
    'aria-expanded',
    optionsExpanded.toString()
  );

  if (filterFocused) {
    await expect(filterInput).toBeFocused();
  } else {
    await expect(filterInput).not.toBeFocused();
  }

  await expect(filterInput).toHaveAttribute('autocomplete', 'off'); // Default browser autocompletion should not be confused (or interfere) with our filter feature!
  await expect(filterInput).toHaveAttribute(
    'placeholder',
    options.lang == 'en' ? 'Enter filter term' : 'Suchbegriff eingeben'
  );
  await expect(filterInput).toHaveAttribute(
    'aria-describedby',
    xOptionsSelectedId
  );

  const selectionClearedButton = searchContainer.locator(
    'button.adg-combobox--clear-selection-button'
  );
  await expect(selectionClearedButton).toHaveAttribute('type', 'button');
  await expect(selectionClearedButton).toHaveAttribute('hidden', '');

  if (selectionClearedButtonFocused) {
    await expect(selectionClearedButton).toBeFocused();
  } else {
    await expect(selectionClearedButton).not.toBeFocused();
  }

  if (options.multi) {
    // TODO: When there is no option selected, then there should be no colon and no comma!
    await expect(selectionClearedButton).toHaveText(
      `${selectedOptions.length} Selected ${
        options.filterlabel
      }: ${selectedOptions.join(', ')},`
    );
  } else {
    await expect(selectionClearedButton).toHaveText(
      `${options.multi ? 'Selected' : 'Gewählte'} ${
        options.filterlabel
      }: ${selectedOptions.join(', ')},`
    );
  }

  const xOptionsSelected = selectionClearedButton.locator(
    `#${xOptionsSelectedId}`
  );
  const xSelectedCount = xOptionsSelected.locator(
    '.adg-combobox--x-selected-count'
  );
  if (options.multi) {
    await expect(xSelectedCount).toHaveText(selectedOptions.length.toString());
  } else {
    // TODO: Not yet implemented, ie. does not make much sense for single select!
  }

  const xOptionSelectedVisuallyHidden = xOptionsSelected.locator(
    'span.adg--visually-hidden'
  );

  await expect(xOptionSelectedVisuallyHidden).toHaveText(
    `${options.multi ? 'Selected' : 'Gewählte'} ${
      options.filterlabel
    }: ${selectedOptions.join(', ')},`
  );
  // TODO: No colon, no comma! Although: the button is hidden anyway when there is no option selected...

  const xSelectedLabels = xOptionSelectedVisuallyHidden.locator(
    '.adg-combobox--x-selected-labels'
  );

  if (selectedOptions.length == 0) {
    await expect(xSelectedLabels).toBeEmpty();
  } else {
    await expect(xSelectedLabels).toHaveText(selectedOptions.join(', '));
  }

  const selectionClearedButtonImage = selectionClearedButton.locator(
    'img[src$="clear.svg"]'
  );
  await expect(selectionClearedButtonImage).toHaveAttribute(
    'alt',
    options.multi ? 'clear selection' : 'Auswahl löschen'
  );

  const toggleAvailableOptionsButton = searchContainer.locator(
    'button.adg-combobox--toggle-available-options-button'
  );
  await expect(toggleAvailableOptionsButton).toHaveAttribute('type', 'button');

  const toggleAvailableOptionsButtonImage =
    toggleAvailableOptionsButton.locator('img[src$="close.svg"]');

  if (optionsExpanded) {
    await expect(toggleAvailableOptionsButtonImage).toHaveAttribute(
      'alt',
      options.multi ? 'Close Hobbies Options' : 'Farben Auswahl schliessen'
    );
  } else {
    await expect(toggleAvailableOptionsButtonImage).toHaveAttribute(
      'alt',
      options.multi ? 'Open Hobbies Options' : 'Farben Auswahl öffnen'
    );
  }

  const availableOptionsContainer = filterAndOptionsContainer.locator(
    'fieldset.adg-combobox--available-options-container'
  );
  await expect(availableOptionsContainer).toHaveAttribute('hidden', '');

  const availableOptionsContainerLegend =
    availableOptionsContainer.locator('legend');

  let expectedXOfYForFilterTextValue = '';
  let allOptions = [];
  if (options.multi) {
    allOptions = ALL_MULTI_OPTIONS;
  } else {
    allOptions = ALL_SINGLE_OPTIONS;
  }
  if (visibleOptions.length < allOptions.length) {
    expectedXOfYForFilterTextValue += ` ${visibleOptions.length} ${
      options.multi ? 'of' : 'von'
    }`;
  }
  expectedXOfYForFilterTextValue += ` ${allOptions.length} ${
    options.multi ? 'Hobbies' : 'Farben'
  }`;
  if (filterValue == '') {
    // expectedXOfYForFilterTextValue += ' (empty filter)'; // TODO: don't know whether this is really helpful to (or even necessary for) screen readers.
  }
  if (filterTerm) {
    expectedXOfYForFilterTextValue += ` ${
      options.multi ? 'for filter' : 'für Filter'
    } "${filterTerm}"`;
  }

  if (visibleOptions.length > 0) {
    expectedXOfYForFilterTextValue += `, ${
      options.multi ? 'starting with' : 'beginnend mit'
    } "${visibleOptions[0]}"`;
  }
  if (optionsExpanded) {
    // expectedXOfYForFilterTextValue += ' (enter question mark for help)';
  }
  if (options.multi) {
    await expect(availableOptionsContainerLegend).toHaveText(
      `Available Hobbies: ${expectedXOfYForFilterTextValue}`
    );
  } else {
    await expect(availableOptionsContainerLegend).toHaveText(
      `Verfügbare ${options.filterlabel}: ${expectedXOfYForFilterTextValue}`
    );
  }

  const availableOptionsContainerLegendVisuallyHidden =
    availableOptionsContainerLegend.locator('> span.adg--visually-hidden');
  await expect(availableOptionsContainerLegendVisuallyHidden).toHaveText(
    `${options.multi ? 'Available' : 'Verfügbare'} ${options.filterlabel}:`
  );

  const xOfYForFilterText = availableOptionsContainerLegend.locator(
    '.adg-combobox--x-of-y-for-filter-text'
  );
  await expect(xOfYForFilterText).toHaveAttribute('data-live-region', '');
  await expect(xOfYForFilterText).toHaveAttribute('role', 'alert'); // TODO: Change to aria-live="polite" for FF (desktop) and Safari (mobile)!

  // UNCOMMENT
  // await expect(xOfYForFilterText).toHaveText(expectedXOfYForFilterTextValue);

  // TODO: The whole live region thing is tricky and not final yet. Let's test it when it's done! See https://github.com/NothingAG/adg-components/issues/42
  // const instructions = xOfYForFilterText.locator('.adg-combobox--instructions');
  // await expect(instructions).toHaveText('(enter question mark for help)');

  const availableOptionsList = availableOptionsContainer.locator(
    '> ol.adg-combobox--available-options-list'
  );

  await Promise.all(
    (options.multi ? ALL_MULTI_OPTIONS : ALL_SINGLE_OPTIONS).map(
      async (item, i) => {
        const optionVisible = visibleOptions.includes(item.label);
        const optionFocused = item.label == focusedOption;
        const optionChecked = selectedOptions.includes(item.label);

        await assertAvailableOption(
          availableOptionsList,
          i + 1,
          item.label,
          item.value,
          optionVisible,
          optionFocused,
          optionChecked,
          options.multi
        );
      }
    )
  );
};

export const assertAvailableOption = async (
  availableOptionsList: Locator,
  nthChild: number,
  label: string,
  value: string,
  visible: boolean,
  focused: boolean,
  checked: boolean,
  multi: boolean
) => {
  const optionListItemSelector = `> li.adg-combobox--available-options-list-item:nth-child(${nthChild})`;
  const optionListItem = availableOptionsList.locator(optionListItemSelector);
  await expect(optionListItem).toHaveText(label);

  // Would rather do `await expect(optionListItem).not.toHaveAttribute('hidden')`, but does not work, see https://stackoverflow.com/questions/72028707/
  if (visible) {
    await expect(
      availableOptionsList.locator(`${optionListItemSelector}:not([hidden])`)
    ).toHaveCount(1);
  } else {
    await expect(
      availableOptionsList.locator(`${optionListItemSelector}[hidden]`)
    ).toHaveCount(1);
  }

  const optionLabel = optionListItem.locator('> label');
  await expect(optionLabel).toHaveCSS('display', 'inline-block');

  const optionInput = optionLabel.locator('> input');
  // await expect(optionInput).toHaveId(value); // TODO: At the time being, no ID is needed, see https://github.com/NothingAG/adg-components/issues/49.
  await expect(optionInput).toHaveAttribute(
    'type',
    multi ? 'checkbox' : 'radio'
  );
  // await expect(optionInput).toHaveAttribute('name', 'hobbies'); // UNCOMMENT

  if (focused) {
    await expect(optionInput).toBeFocused();
  } else {
    await expect(optionInput).not.toBeFocused();
  }

  if (checked) {
    await expect(optionInput).toBeChecked();
  } else {
    await expect(optionInput).not.toBeChecked();
  }

  // TODO: Put <input> outside of <label>, so devs can use input:checked + label! => No, we decided against this for the time being, see https://github.com/NothingAG/adg-components/issues/49.
};

export const tabIntoFilter = async (page: Page, id: string) => {
  // todo: this is what right now needs to be pressed to get from page load to the filter, but it's easily breakable, if someone changes the example
  const tabIndex = id == 'hobbies' ? 2 : 3;
  for (let i = 0; i < tabIndex; i++) {
    // press tab 4 times
    await page.keyboard.press('Tab');
  }
  // todo: this would be better, but it doesn't 'tab into' the filter input
  // await filter.focus();
};

export const clickIntoFilter = async (page: Page, id: string) => {
  const filterInput = page.locator(
    `adg-combobox#${id} input.adg-combobox--search-input`
  );
  await filterInput.click();
};

export const clickOutsideFilter = async (page: Page) => {
  const buttonAfter = page.locator('button#buttonAfter');
  await buttonAfter.click();
};

export const clickOpenCloseButton = async (page: Page, id: string) => {
  const buttonAfter = page.locator(
    `adg-combobox#${id} .adg-combobox--toggle-available-options-button`
  );
  await buttonAfter.click();
};

export const clickOption = async (page: Page, label: string, id: string) => {
  const option = page.locator(
    `adg-combobox#${id} .adg-combobox--available-options-list-item:has-text("${label}")`
  );
  await option.click();
};
