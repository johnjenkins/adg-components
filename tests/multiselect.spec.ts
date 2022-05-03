import { test, expect, Page } from '@playwright/test';
import {
  tabIntoFilter,
  expectMultiCombobox,
  ALL_MULTI_OPTIONS,
  clickIntoFilter,
  clickOutsideFilter,
  clickOpenCloseButton,
  clickOption,
} from './helpers';

test.describe('ADG-Combobox (multi)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3333');
  });

  test('Initial display', async ({ page }) => {
    await expectMultiCombobox(page, {}); // Default state
  });

  test.describe('Keyboard interaction', () => {
    test('Tab into filter input', async ({ page }) => {
      await tabIntoFilter(page, 'hobbies');
      await expectMultiCombobox(page, {
        filterFocused: true,
        optionsExpanded: false,
      });
    });

    test('Tab out of filter input', async ({ page }) => {
      await tabIntoFilter(page, 'hobbies');
      await expectMultiCombobox(page, {
        filterFocused: true,
        optionsExpanded: false,
      });

      await page.keyboard.press('Shift+Tab'); // At the time being, the open/close button is also focusable, so we should rather do a Shift-Tab here to definitely move focus outside the component. This might change though, see https://github.com/NothingAG/adg-components/issues/16.
      await expectMultiCombobox(page, {
        filterFocused: false,
        optionsExpanded: false,
      });
    });

    test('Toggle downwards through options using Down key', async ({
      page,
    }) => {
      await tabIntoFilter(page, 'hobbies');
      await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
      await expectMultiCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        focusedOption: null,
      });

      await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option
      await expectMultiCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        focusedOption: 'Soccer',
      });

      await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on next option
      await expectMultiCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        focusedOption: 'Badminton',
      });

      for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowDown'); //  // Press `Down` multiple times to set focus on last option
      await expectMultiCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        focusedOption: 'Programming',
      });

      await page.keyboard.press('ArrowDown'); // Press `Down` to set focus back to filter input
      await expectMultiCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        focusedOption: null,
      });
    });

    test('Toggle upwards through options using Up key', async ({ page }) => {
      await tabIntoFilter(page, 'hobbies');
      await page.keyboard.press('ArrowUp'); // Press `Up` to expand options
      await expectMultiCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        focusedOption: null,
      });

      await page.keyboard.press('ArrowUp'); // Press `Up` to set focus on last option
      await expectMultiCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        focusedOption: 'Programming',
      });

      await page.keyboard.press('ArrowUp'); // Press `Up` to set focus on previous option
      await expectMultiCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        focusedOption: 'Sleeping',
      });

      for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowUp'); //  // Press `Up` multiple times to set focus on first option
      await expectMultiCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        focusedOption: 'Soccer',
      });

      await page.keyboard.press('ArrowUp'); // Press `Up` to set focus back to filter input
      await expectMultiCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        focusedOption: null,
      });
    });

    test.describe('Close options using Esc key', () => {
      test('When focus in filter input', async ({ page }) => {
        await tabIntoFilter(page, 'hobbies');
        await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
        await expectMultiCombobox(page, {
          filterFocused: true,
          optionsExpanded: true,
          visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        });

        await page.keyboard.press('Escape'); // Press `Esc` to collapse options and set focus back to filter input
        await expectMultiCombobox(page, {
          filterFocused: true,
          optionsExpanded: false,
        });
      });

      test('When focus on option', async ({ page }) => {
        await tabIntoFilter(page, 'hobbies');
        await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option
        await expectMultiCombobox(page, {
          filterFocused: false,
          optionsExpanded: true,
          visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
          focusedOption: 'Soccer',
        });

        await page.keyboard.press('Escape'); // Press `Esc` to collapse options and set focus back to filter input
        await expectMultiCombobox(page, {
          filterFocused: true,
          optionsExpanded: false,
        });
      });
    });

    test.describe('Select/unselect options', () => {
      test('Using Space key', async ({ page }) => {
        await tabIntoFilter(page, 'hobbies');
        await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option "Soccer"
        await expectMultiCombobox(page, {
          filterFocused: false,
          optionsExpanded: true,
          visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
          focusedOption: 'Soccer',
        });

        await page.keyboard.press('Space'); // Press `Space` to check option "Soccer"
        await expectMultiCombobox(page, {
          filterFocused: false,
          visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
          optionsExpanded: true,
          focusedOption: 'Soccer',
          selectedOptions: ['Soccer'],
        });

        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on second option "Badminton"
        await page.keyboard.press('ArrowDown'); // Press `Down` again to set focus on third option "Movies"
        await page.keyboard.press('Space'); // Press `Space` to check option "Movies"
        await expectMultiCombobox(page, {
          filterFocused: false,
          visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
          optionsExpanded: true,
          focusedOption: 'Movies',
          selectedOptions: ['Soccer', 'Movies'],
        });

        await page.keyboard.press('Space'); // Press `Space` to uncheck option "Movies"
        await expectMultiCombobox(page, {
          filterFocused: false,
          visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
          optionsExpanded: true,
          focusedOption: 'Movies',
          selectedOptions: ['Soccer'],
        });
      });

      test('Using Enter key', async ({ page }) => {
        await tabIntoFilter(page, 'hobbies');
        await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option "Soccer"
        await page.keyboard.press('Enter'); // Press `Enter` to check option "Soccer"
        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on second option "Badminton"
        await page.keyboard.press('ArrowDown'); // Press `Down` again to set focus on third option "Movies"
        await page.keyboard.press('Enter'); // Press `Enter` to check option "Movies"
        await expectMultiCombobox(page, {
          filterFocused: false,
          visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
          optionsExpanded: true,
          focusedOption: 'Movies',
          selectedOptions: ['Soccer', 'Movies'],
        });

        await page.keyboard.press('Enter'); // Press `Enter` to uncheck option "Movies"
        await expectMultiCombobox(page, {
          filterFocused: false,
          visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
          optionsExpanded: true,
          focusedOption: 'Movies',
          selectedOptions: ['Soccer'],
        });
      });
    });

    test.describe('Activate "Clear selection" button', () => {
      test('With empty filter', async ({ page }) => {
        await tabIntoFilter(page, 'hobbies');
        await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option
        await page.keyboard.press('Space'); // Press `Space` to check option "Soccer"
        await page.keyboard.press('Escape'); // Press `Esc` to collapse options and set focus to "Clear Selection" button
        await expectMultiCombobox(page, {
          filterFocused: true,
          optionsExpanded: false,
          selectedOptions: ['Soccer'],
        });

        await page.keyboard.press('Tab'); // Press `Tab` to move focus to "Clear Selection" button
        await expectMultiCombobox(page, {
          selectionClearedButtonFocused: true,
          optionsExpanded: false,
          selectedOptions: ['Soccer'],
        });

        await page.keyboard.press('Enter'); // Press `Enter` to activate "Clear Selection" button
        await expectMultiCombobox(page, {
          filterFocused: true,
          optionsExpanded: false,
          selectedOptions: [],
        });
      });

      test('With filter term', async ({ page }) => {
        await tabIntoFilter(page, 'hobbies');
        await page.keyboard.press('b'); // Press "b" to filter options
        await expectMultiCombobox(page, {
          filterFocused: true,
          filterValue: 'b',
          optionsExpanded: true,
          visibleOptions: ['Badminton', 'Kickboxing'],
        });

        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option
        await page.keyboard.press('Space'); // Press `Space` to check option "Badminton"
        await page.keyboard.press('Escape'); // Press `Esc` to collapse options and set focus back to filter
        await expectMultiCombobox(page, {
          filterFocused: true,
          filterValue: 'b',
          optionsExpanded: false,
          selectedOptions: ['Badminton'],
          visibleOptions: ['Badminton', 'Kickboxing'],
        });

        await page.keyboard.press('Tab'); // Press `Tab` to move focus to "Clear Selection" button
        await expectMultiCombobox(page, {
          selectionClearedButtonFocused: true,
          filterValue: 'b',
          optionsExpanded: false,
          selectedOptions: ['Badminton'],
          visibleOptions: ['Badminton', 'Kickboxing'],
        });

        await page.keyboard.press('Enter'); // Press `Enter` to activate "Clear Selection" button
        await expectMultiCombobox(page, {
          filterFocused: true,
          optionsExpanded: false,
          selectedOptions: [],
          visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        });
      });
    });

    test('Propagate Enter key', async ({ page }) => {
      await tabIntoFilter(page, 'hobbies');
      await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
      await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option
      await page.keyboard.press('Space'); // Press `Space` to check option "Soccer"
      await page.keyboard.press('ArrowUp'); // Press `Up` to set focus back to filter input
      await page.keyboard.press('Enter'); // Press `Enter` to trigger browser default behaviour (send form)
      await expect(page).toHaveURL(/.*\?hobbies%5B%5D=soccer/);
    });
  });

  test.describe('Mouse interaction', () => {
    test('Click into filter input', async ({ page }) => {
      await clickIntoFilter(page, 'hobbies'); // Click into the filter to expand options
      await expectMultiCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
      });

      await clickIntoFilter(page, 'hobbies'); // Click again into the filter, options remain expanded (unsure about that, see https://github.com/NothingAG/adg-components/issues/17)
      await expectMultiCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
      });
    });

    test('Click out of filter input', async ({ page }) => {
      await clickIntoFilter(page, 'hobbies'); // Click into the filter to expand options
      await expectMultiCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
      });

      await clickOutsideFilter(page); // Click into the filter to expand options
      await expectMultiCombobox(page, {
        filterFocused: false,
        optionsExpanded: false,
      });
    });

    test('Click open/close button', async ({ page }) => {
      await clickOpenCloseButton(page, 'hobbies'); // Click open/close button to expand options
      await expectMultiCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
      });

      await clickOpenCloseButton(page, 'hobbies'); // Click open/close button to collapse options
      await expectMultiCombobox(page, {
        filterFocused: true,
        optionsExpanded: false,
      });
    });

    test('Select/unselect options', async ({ page }) => {
      await clickIntoFilter(page, 'hobbies'); // Expand options
      await clickOption(page, 'Soccer', 'hobbies'); // Select option "Soccer"
      await clickOption(page, 'Movies', 'hobbies'); // Select option "Movies"
      await expectMultiCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        focusedOption: 'Movies',
        selectedOptions: ['Soccer', 'Movies'],
      });

      await clickOption(page, 'Movies', 'hobbies'); // Unselect option "Movies"
      await expectMultiCombobox(page, {
        filterFocused: false,
        visibleOptions: ALL_MULTI_OPTIONS.map((i) => i.label),
        optionsExpanded: true,
        focusedOption: 'Movies',
        selectedOptions: ['Soccer'],
      });
    });
  });

  test.describe('Filter', () => {
    test('Change filter term to expand options', async ({ page }) => {
      await tabIntoFilter(page, 'hobbies'); // Focus filter term (does not expand options)
      await expectMultiCombobox(page, {
        filterFocused: true,
        optionsExpanded: false,
      });

      await page.keyboard.press('b'); // Enter something will expand options
      await expectMultiCombobox(page, {
        filterFocused: true,
        filterValue: 'b',
        visibleOptions: ['Badminton', 'Kickboxing'],
        optionsExpanded: true,
      });
    });

    test('Enter term to filter options', async ({ page }) => {
      await clickIntoFilter(page, 'hobbies'); // Expand options
      await page.keyboard.press('b'); // Start filtering with "b"
      await expectMultiCombobox(page, {
        filterFocused: true,
        filterValue: 'b',
        visibleOptions: ['Badminton', 'Kickboxing'],
        optionsExpanded: true,
      });

      await page.keyboard.press('a'); // Add "a", so filter is "ba"
      await expectMultiCombobox(page, {
        filterFocused: true,
        filterValue: 'ba',
        visibleOptions: ['Badminton'],
        optionsExpanded: true,
      });

      await page.keyboard.press('t'); // Add "t", so filter is "bat"
      await expectMultiCombobox(page, {
        filterFocused: true,
        filterValue: 'bat',
        visibleOptions: [],
        optionsExpanded: true,
      });
    });

    test('Toggle through filtered options', async ({ page }) => {
      await clickIntoFilter(page, 'hobbies'); // Expand options
      await page.keyboard.press('b'); // Start filtering with "b"
      await expectMultiCombobox(page, {
        filterFocused: true,
        filterValue: 'b',
        visibleOptions: ['Badminton', 'Kickboxing'],
        optionsExpanded: true,
      });

      await page.keyboard.press('ArrowDown'); // Move focus to first option "Badminton"
      await expectMultiCombobox(page, {
        filterValue: 'b',
        visibleOptions: ['Badminton', 'Kickboxing'],
        focusedOption: 'Badminton',
        optionsExpanded: true,
      });

      await page.keyboard.press('ArrowDown'); // Move focus to next (last) option "Kickboxing"
      await expectMultiCombobox(page, {
        filterValue: 'b',
        visibleOptions: ['Badminton', 'Kickboxing'],
        focusedOption: 'Kickboxing',
        optionsExpanded: true,
      });

      await page.keyboard.press('ArrowDown'); // Move focus back to top (filter input)
      await expectMultiCombobox(page, {
        filterFocused: true,
        filterValue: 'b',
        visibleOptions: ['Badminton', 'Kickboxing'],
        optionsExpanded: true,
      });
    });

    test('Change filter while toggling through options', async ({ page }) => {
      await clickIntoFilter(page, 'hobbies'); // Expand options
      await page.keyboard.press('a'); // Start filtering with "a"
      await expectMultiCombobox(page, {
        filterFocused: true,
        filterValue: 'a',
        visibleOptions: [
          'Badminton',
          'Gardening',
          'Dancing',
          'Painting',
          'Reading',
          'Programming',
        ],
        optionsExpanded: true,
      });

      await page.keyboard.press('ArrowDown'); // Move focus to first option "Badminton"
      await expectMultiCombobox(page, {
        filterValue: 'a',
        visibleOptions: [
          'Badminton',
          'Gardening',
          'Dancing',
          'Painting',
          'Reading',
          'Programming',
        ],
        optionsExpanded: true,
        focusedOption: 'Badminton',
      });

      await page.keyboard.press('d'); // Add "d", so filter is "ad", and focus should be back on filter input
      await expectMultiCombobox(page, {
        filterFocused: true,
        filterValue: 'ad',
        visibleOptions: ['Badminton', 'Reading'],
        optionsExpanded: true,
      });

      await page.keyboard.press('ArrowDown'); // Move focus to first option "Badminton"
      await page.keyboard.press('ArrowDown'); // Move focus to next option "Reading"
      await expectMultiCombobox(page, {
        filterValue: 'ad',
        visibleOptions: ['Badminton', 'Reading'],
        optionsExpanded: true,
        focusedOption: 'Reading',
      });

      await page.keyboard.press('x'); // Add "x", so filter is "adx", and focus should be back on filter input
      await expectMultiCombobox(page, {
        filterFocused: true,
        filterValue: 'adx',
        visibleOptions: [],
        optionsExpanded: true,
      });
    });
  });

  test('Pre-selected values', async ({ page }) => {
    await page.goto('http://localhost:3333?preselectValues');
    await expectMultiCombobox(page, {
      filterValue: '',
      selectedOptions: ['Soccer', 'Hiking', 'Cooking'],
    });
  });

  test.describe('Custom events', () => {
    test('Events optionsDropdownOpened/Closed are fired upon opening/closing options dropdown', async ({
      page,
    }) => {
      await clickIntoFilter(page, 'hobbies'); // Click into the filter to expand options
      await expect(page.locator('#events p:nth-child(1)')).toHaveText(
        '1: optionsDropdownOpened, null'
      );

      await clickOutsideFilter(page); // Click into the filter to expand options
      await expect(page.locator('#events p:nth-child(2)')).toHaveText(
        '2: optionsDropdownClosed, null'
      );
    });

    test('Event optionChanged(selected: true) is fired upon selecting an option', async ({
      page,
    }) => {
      await clickIntoFilter(page, 'hobbies'); // Click into the filter to expand options
      await clickOption(page, 'Soccer', 'hobbies'); // Select option "Black"
      await expect(page.locator('#events p:nth-child(2)')).toHaveText(
        '2: optionChanged, {"value":"soccer","selected":true}'
      );
    });

    test('Event optionChanged(selected: false) is fired upon unselecting an option', async ({
      page,
    }) => {
      await clickIntoFilter(page, 'hobbies'); // Click into the filter to expand options
      await clickOption(page, 'Soccer', 'hobbies'); // Select option "Black"
      await clickOption(page, 'Soccer', 'hobbies'); // Select option "Black"
      await expect(page.locator('#events p:nth-child(3)')).toHaveText(
        '3: optionChanged, {"value":"soccer","selected":false}'
      );
    });

    test('Event selectionCleared is fired upon activating "Clear Selection" button', async ({
      page,
    }) => {
      await clickIntoFilter(page, 'hobbies'); // Click into the filter to expand options
      await clickOption(page, 'Soccer', 'hobbies'); // Select option "Black"
      await page.keyboard.press('Escape'); // Press `Escape` to move focus back to filter term
      await page.keyboard.press('Tab'); // Press `Tab` to move focus to "Clear Selection" button
      await page.keyboard.press('Enter'); // Press `Enter` to activate "Clear Selection" button
      await expect(page.locator('#events p:nth-child(4)')).toHaveText(
        '4: optionChanged, {"value":"soccer","selected":false}'
      );
      await expect(page.locator('#events p:nth-child(5)')).toHaveText(
        '5: selectionCleared, null'
      );
    });

    test('Event filterTermChanged is fired upon changing filter term', async ({
      page,
    }) => {
      await clickIntoFilter(page, 'hobbies'); // Click into the filter to expand options
      await page.keyboard.press('a'); // Press "a" set change filter
      await expect(page.locator('#events p:nth-child(2)')).toHaveText(
        '2: filterTermChanged, {"previousFilterTerm":"","filterTerm":"a"}'
      );
    });
  });
});
