import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export const ALL_OPTIONS = [
  'Soccer',
  'Badminton',
  'Movies',
  'Gardening',
  'Kickboxing',
  'Hiking',
  'Dancing',
  'Painting',
  'Cooking',
  'Reading',
  'Sleeping',
  'Programming',
];

interface MultiStateOptions {
  filterFocused?: boolean;
  optionsExpanded?: boolean;
  visibleOptions?: string[];
  focusedOption?: string;
  selectedOptions?: string[];
  unselectAllButtonFocused?: boolean;
}

// These should reflect the component's initial state without any interaction happened
const defaultOptions: MultiStateOptions = {
  optionsExpanded: false,
  visibleOptions: ALL_OPTIONS,
  filterFocused: false,
  focusedOption: null,
  selectedOptions: [],
  unselectAllButtonFocused: false,
};

export const checkMultiState = async (
  page: Page,
  options: MultiStateOptions
) => {
  const mergedOptions = Object.assign({}, defaultOptions, options);
  const {
    optionsExpanded,
    visibleOptions,
    filterFocused,
    focusedOption,
    selectedOptions,
    unselectAllButtonFocused,
  } = mergedOptions;

  // As soon as we need to also check single select, we need to make this method more configurable. For the moment let's have fixed values.
  const options2 = {
    id: 'hobbiesCombobox',
    internalId:
      'adg-combobox-0' /* Gets created automatically. Maybe we should just use the ID specified by the user? */,
    label: 'Hobbies',
  };

  const filterInputId = `${options2.internalId}--input`;
  const xOptionsSelectedId = `${options2.internalId}--options-selected`;

  const adgCombobox = page.locator(`adg-combobox#${options2.id}`);
  await expect(adgCombobox).toHaveClass('hydrated'); // TODO: Where does this come from an what's it for actually?

  const widgetContainer = page.locator('.adg-combobox--container');
  await expect(widgetContainer).toHaveCSS('display', 'block');

  const filterLabel = widgetContainer.locator(
    'label.adg-combobox--filter-label'
  );
  await expect(filterLabel).toHaveText(options2.label);
  await expect(filterLabel).toHaveAttribute('for', filterInputId);
  await expect(filterLabel).toHaveCSS('display', 'inline-block'); // So label and filter input are read "in one go" in most screen readers => TODO: factor out into custom matcher, ie. `toNotIntroduceSemanticLineBreak`!

  const filterAndOptionsContainer = widgetContainer.locator(
    '.adg-combobox--filter-and-options-container'
  );
  await expect(filterAndOptionsContainer).toHaveCSS('display', 'inline-block');

  const filterContainer = filterAndOptionsContainer.locator(
    'span.adg-combobox--filter-container'
  );
  await expect(filterContainer).toHaveCSS('display', 'inline-block');

  const filterInput = filterContainer.locator(
    'input.adg-combobox--filter-input'
  );
  await expect(filterInput).toHaveId(filterInputId);
  await expect(filterInput).toHaveAttribute('type', 'text');
  await expect(filterInput).toHaveAttribute('role', 'combobox'); // Needed for a) that certain screen readers and browsers announce aria-expanded change (ie. Chrome on Desktop), and to let certain screen readers give some more details about the element's purpose (ie. VoiceOver/iOS would say "combobox")
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
  await expect(filterInput).toHaveAttribute('placeholder', 'Enter filter term');
  await expect(filterInput).toHaveAttribute(
    'aria-describedby',
    xOptionsSelectedId
  );

  const unselectAllButton = filterAndOptionsContainer.locator(
    'button.adg-combobox--unselect-all-button'
  );
  await expect(unselectAllButton).toHaveAttribute('type', 'button');
  await expect(unselectAllButton).toHaveAttribute('hidden', '');

  if (unselectAllButtonFocused) {
    await expect(unselectAllButton).toBeFocused();
  } else {
    await expect(unselectAllButton).not.toBeFocused();
  }

  // TODO: When there is no option selected, then there should be no colon and no comma!
  await expect(unselectAllButton).toHaveText(
    `${selectedOptions.length} Hobbies selected: ${selectedOptions.join(', ')},`
  );

  const xOptionsSelected = unselectAllButton.locator(`#${xOptionsSelectedId}`);
  const xSelectedCount = xOptionsSelected.locator(
    '.adg-combobox--x-selected-count'
  );
  await expect(xSelectedCount).toHaveText(selectedOptions.length.toString());

  const xOptionSelectedVisuallyHidden = xOptionsSelected.locator(
    'span[data-visually-hidden]'
  );

  await expect(xOptionSelectedVisuallyHidden).toHaveText(
    `Hobbies selected: ${selectedOptions.join(', ')},`
  );
  // TODO: No colon, no comma!

  const xSelectedLabels = xOptionSelectedVisuallyHidden.locator(
    '.adg-combobox--x-selected-labels'
  );

  if (selectedOptions.length == 0) {
    await expect(xSelectedLabels).toBeEmpty();
  } else {
    await expect(xSelectedLabels).toHaveText(selectedOptions.join(', '));
  }

  const unselectAllButtonImage = unselectAllButton.locator(
    'img[src$="clear.svg"]'
  );
  await expect(unselectAllButtonImage).toHaveAttribute('alt', 'unselect all');

  const toggleOptionsButton = filterAndOptionsContainer.locator(
    'button.adg-combobox--toggle-options-button'
  );
  await expect(toggleOptionsButton).toHaveAttribute('type', 'button');

  const toggleOptionsButtonImage = toggleOptionsButton.locator(
    'img[src$="close.svg"]'
  );

  if (optionsExpanded) {
    await expect(toggleOptionsButtonImage).toHaveAttribute(
      'alt',
      'Close Hobbies Options'
    );
  } else {
    await expect(toggleOptionsButtonImage).toHaveAttribute(
      'alt',
      'Open Hobbies Options'
    );
  }

  const availableOptionsContainer = filterAndOptionsContainer.locator(
    'fieldset.adg-combobox--available-options-container'
  );
  await expect(availableOptionsContainer).toHaveAttribute('hidden', '');

  const availableOptionsContainerLegend =
    availableOptionsContainer.locator('legend');

  if (optionsExpanded)
    await expect(availableOptionsContainerLegend).toHaveText(
      'Available Hobbies: 12 options (empty filter) (enter question mark for help)'
    );
  else
    await expect(availableOptionsContainerLegend).toHaveText(
      'Available Hobbies: 12 options (empty filter)'
    );

  const availableOptionsContainerLegendVisuallyHidden =
    availableOptionsContainerLegend.locator('> span[data-visually-hidden]');
  await expect(availableOptionsContainerLegendVisuallyHidden).toHaveText(
    'Available Hobbies:'
  );

  const xOfYForFilterText = availableOptionsContainerLegend.locator(
    '.adg-combobox--x-of-y-for-filter-text'
  );
  await expect(xOfYForFilterText).toHaveAttribute('data-live-region', '');
  await expect(xOfYForFilterText).toHaveAttribute('aria-live', 'assertive'); // TODO: Change to role="alert" for browsers other than FF!

  if (optionsExpanded) {
    await expect(xOfYForFilterText).toHaveText(
      '12 options (empty filter) (enter question mark for help)'
    );
  } else {
    await expect(xOfYForFilterText).toHaveText('12 options (empty filter)');
  }

  // TODO: The whole live region thing is tricky and not final yet. Let's test it when it's done!
  // const instructions = xOfYForFilterText.locator('.adg-combobox--instructions');
  // await expect(instructions).toHaveText('(enter question mark for help)');

  const availableOptionsList = availableOptionsContainer.locator(
    '> ol.adg-combobox--available-options-list'
  );

  const allOptions = [
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

  await Promise.all(
    allOptions.map(async (item, i) => {
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
        optionChecked
      );
    })
  );
};

export const assertAvailableOption = async (
  availableOptionsList: Locator,
  nthChild: number,
  label: string,
  value: string,
  visible: boolean,
  focused: boolean,
  checked: boolean
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
  await expect(optionInput).toHaveId(value); // TODO: Create a more generic ID!
  await expect(optionInput).toHaveAttribute('type', 'checkbox');
  await expect(optionInput).toHaveAttribute('name', 'option'); // TODO: Create a more generic name!

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

  // TODO: Put <input> outside of <label>, so devs can use input:checked + label!
  // Also, I'm unsure whether we need the span.check!
};

export const tabIntoFilter = async (page: Page) => {
  // todo: this is what right now needs to be pressed to get from page load to the filter, but it's easily breakable, if someone changes the example
  for (let i = 0; i < 3; i++) {
    // press tab 4 times
    await page.keyboard.press('Tab');
  }
  // todo: this would be better, but it doesn't 'tab into' the filter input
  // await filter.focus();
};

export const clickIntoFilter = async (page: Page) => {
  // TODO: We should refactor this into a separate method
  const filterInput = page.locator('input.adg-combobox--filter-input');
  await filterInput.click();
};

export const clickOutsideFilter = async (page: Page) => {
  const buttonAfter = page.locator('button#buttonAfter');
  await buttonAfter.click();
};

export const clickOpenCloseButton = async (page: Page) => {
  const buttonAfter = page.locator('.adg-combobox--toggle-options-button');
  await buttonAfter.click();
};

export const clickOption = async (page: Page, label) => {
  const buttonAfter = page.locator(
    `.adg-combobox--available-options-list-item:has-text("${label}")`
  );
  await buttonAfter.click();
};
