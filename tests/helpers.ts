import type {Page} from '@playwright/test';
import {expect} from '@playwright/test';

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
]

// todo: maybe there is a more elegant way not to always use `page` as an argument, but this way it's more functional i suppose?
export const getFilter = async (page: Page) => {
  return page.locator('.adg-combobox--filter-input').first();
}

export const focusFilter = async (page: Page) => {
  const filter = await getFilter(page);
  await filter.focus();
};

export const pressTab = async (page: Page) => {
  await page.keyboard.press('Tab');
}
export const pressDown = async (page: Page) => {
  await page.keyboard.press('ArrowDown');
}
export const pressUp = async (page: Page) => {
  await page.keyboard.press('ArrowUp');
}

export const pressSpace = async (page: Page) => {
  await page.keyboard.press('Space');
}

export const pressEsc = async (page: Page) => {
  await page.keyboard.press('Escape');
}

export const pressEnter = async (page: Page) => {
  await page.keyboard.press('Enter');
}

interface MultiStateOptions {
  filterFocused: boolean;
  optionsExpanded?: boolean;
  visibleOptions?: string[];
  focusedOption?: string;
  selectedOptions?: string[];
}

const defaultOptions: MultiStateOptions = {
  optionsExpanded: false,
  visibleOptions: [],
  filterFocused: false,
  focusedOption: null,
  selectedOptions: []
}

export const expectOptionsExpanded = async (page, visible = true) => {
  const list = page.locator('.adg-combobox--available-options-list').first();
  if (visible) {
    return await expect(list).toBeVisible()
  } else {
    return await expect(list).not.toBeVisible()
  }
}

export const checkMultiState = async (page, options: MultiStateOptions) => {
  const mergedOptions = Object.assign({}, defaultOptions, options);
  const {
    optionsExpanded,
    visibleOptions,
    filterFocused,
    focusedOption,
    selectedOptions
  } = mergedOptions;
  await expectOptionsExpanded(page, optionsExpanded);

  const results = page.locator('.adg-combobox--available-options-list-item:visible');
  const count = await results.count();
  expect(count).toEqual(visibleOptions.length);

  for (let option of visibleOptions) {
    const item = await page.locator(`input[value="${option.toLowerCase()}"]`);
    await expect(item).toBeVisible();
  }

  if (filterFocused) {
    const filter = await page.locator('input[name="hobbies"]');
    await expect(filter).toBeFocused();
  }

  if (focusedOption) {
    const focused = await page.locator(`input[value="${focusedOption.toLowerCase()}"]`);
    await expect(focused).toBeFocused();
  }

  for (let selectedOption of selectedOptions) {
    const selected = await page.locator(`input[value="${selectedOption.toLowerCase()}"]`);
    await expect(selected).toBeChecked();
  }
};

export const expectFocusedOption = async (page: Page, option, options = ALL_OPTIONS) => {
  await checkMultiState(page, {
    filterFocused: false,
    optionsExpanded: true,
    visibleOptions: options,
    focusedOption: option
  });
};

export const assertions = async (page: Page) => {
  const widgetContainer = page.locator('.adg-combobox--container').first();
// Label of filter input

  const filterLabel = widgetContainer.locator('label.adg-combobox--filter-label');
  await expect(filterLabel).toHaveText('Hobbies');
  // await expect(filterLabel).toHaveAttribute('for', 'hobbies');
  await expect(filterLabel).toHaveCSS('display', 'inline-block');
// So label and filter input are read "in one go" in most screen readers => TODO: factor out into custom matcher!
// const filterLabelMarker = page.locator('.adg-combobox--container label.adg-combobox--filter-label::after');
// await expect(filterLabelMarker).toHaveCSS('content', ':')

  const filterAndOptionsContainer = widgetContainer.locator('.adg-combobox--filter-and-options-container');
  await expect(filterAndOptionsContainer).toHaveCSS('display', 'inline-block');

  const filterContainer = filterAndOptionsContainer.locator('span.adg-combobox--filter-container');
  await expect(filterContainer).toHaveCSS('display', 'inline-block');

  const filterInput = filterContainer.locator('input.adg-combobox--filter-input');
  await expect(filterInput).toHaveId('hobbies');
  await expect(filterInput).toHaveAttribute('type', 'text');
  await expect(filterInput).toHaveAttribute('role', 'combobox');
// Needed for a) that certain screen readers and browsers announce aria-expanded change (ie. Chrome on Desktop), and to let certain screen readers give some more details about the element's purpose (ie. VoiceOver/iOS would say "combobox")
  await expect(filterInput).toHaveAttribute('aria-expanded', 'false');
  await expect(filterInput).toHaveAttribute('autocomplete', 'off');
// Default browser autocompletion should not be confused (or interfere) with our filter feature!
  await expect(filterInput).toHaveAttribute('placeholder', 'Enter filter term');
  await expect(filterInput).toHaveAttribute('aria-describedby', 'hobbies-x-options-selected');

  const unselectAllButton = filterAndOptionsContainer.locator('button.adg-combobox--unselect-all-button');
  await expect(unselectAllButton).toHaveAttribute('type', 'button');
  await expect(unselectAllButton).toHaveAttribute('hidden', '');
  await expect(unselectAllButton).toHaveText("0 Hobbies selected: ,");
// TODO: No colon, no comma!

  const xOptionsSelected = unselectAllButton.locator('#hobbies-x-options-selected')
  const xSelectedCount = xOptionsSelected.locator('.adg-combobox--x-selected-count')
  await expect(xSelectedCount).toHaveText('0');

  const xOptionSelectedVisuallyHidden = xOptionsSelected.locator('span[data-visually-hidden]');

  await expect(xOptionSelectedVisuallyHidden).toHaveText("Hobbies selected: ,")
// TODO: No colon, no comma!

  const xSelectedLabels = xOptionSelectedVisuallyHidden.locator('.adg-combobox--x-selected-labels');
  await expect(xSelectedLabels).toBeEmpty()

  const unselectAllButtonImage = unselectAllButton.locator('img[src="clear.svg"]');
  await expect(unselectAllButtonImage).toHaveAttribute('alt', 'unselect all');

  const toggleOptionsButton = filterAndOptionsContainer.locator('button.adg-combobox--toggle-options-button');
  await expect(toggleOptionsButton).toHaveAttribute('type', 'button');

  const toggleOptionsButtonImage = toggleOptionsButton.locator('img[src="close.svg"]');
  await expect(toggleOptionsButtonImage).toHaveAttribute('alt', 'Open Hobbies options');

  const availableOptionsContainer = filterAndOptionsContainer.locator('fieldset.adg-combobox--available-options-container');
  await expect(availableOptionsContainer).toHaveAttribute('hidden', '');

  const availableOptionsContainerLegend = availableOptionsContainer.locator('legend');
  await expect(availableOptionsContainerLegend).toHaveText("Available Hobbies: 12 of 12 options for empty filter, starting with \"Soccer\"");

  const availableOptionsContainerLegendVisuallyHidden = availableOptionsContainerLegend.locator('span[data-visually-hidden]');
  await expect(availableOptionsContainerLegendVisuallyHidden).toHaveText('Available Hobbies:');

  const xOfYForFilterText = availableOptionsContainerLegend.locator('.adg-combobox--x-of-y-for-filter-text');
  await expect(xOfYForFilterText).toHaveAttribute('data-live-region', '');
  await expect(xOfYForFilterText).toHaveAttribute('aria-live', 'assertive');
// TODO: Change to role="alert" for browsers other than FF!
  await expect(xOfYForFilterText).toHaveText("12 of 12 options for empty filter, starting with \"Soccer\"");


  const xOfYForFilterTextVisuallyHidden = xOfYForFilterText.locator('span[data-visually-hidden]');
  await expect(xOfYForFilterTextVisuallyHidden).toHaveText(", starting with \"Soccer\"");
};

