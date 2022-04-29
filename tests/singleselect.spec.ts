import { test, expect, Page } from '@playwright/test';
import {
  tabIntoFilter,
  expectSingleCombobox,
  ALL_SINGLE_OPTIONS,
  clickIntoFilter,
  clickOutsideFilter,
  clickOpenCloseButton,
  clickOption,
} from './helpers';

test.describe('ADG-Combobox (single)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3333');
    // RAMON: comboBox generell verfügbar machen in jedem `test`?! Und auch in jedem Helper?!
  });

  test.only('Initial display', async ({ page }) => {
    await expectSingleCombobox(page, {}); // Default state
  });

  test.describe('Keyboard interaction', () => {
    test('Tab into filter input', async ({ page }) => {
      await tabIntoFilter(page, 'coloursCombobox');
      await expectSingleCombobox(page, {
        filterFocused: true,
        optionsExpanded: false,
      });
    });

    test('Tab out of filter input', async ({ page }) => {
      await tabIntoFilter(page, 'coloursCombobox');
      await expectSingleCombobox(page, {
        filterFocused: true,
        optionsExpanded: false,
      });

      await page.keyboard.press('Shift+Tab'); // At the time being, the open/close button is also focusable, so we should rather do a Shift-Tab here to definitely move focus outside the component. This might change though, see https://github.com/NothingAG/adg-components/issues/16.
      await expectSingleCombobox(page, {
        filterFocused: false,
        optionsExpanded: false,
      });
    });

    test('Toggle downwards through options using Down key', async ({
      page,
    }) => {
      await tabIntoFilter(page, 'coloursCombobox');
      await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
      await expectSingleCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
        focusedOption: null,
      });

      await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option
      await expectSingleCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
        focusedOption: 'Black',
      });

      await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on next option
      await expectSingleCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
        focusedOption: 'Blue',
      });

      for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowDown'); //  // Press `Down` multiple times to set focus on last option
      await expectSingleCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
        focusedOption: 'Yellow',
      });

      await page.keyboard.press('ArrowDown'); // Press `Down` to set focus back to filter input
      await expectSingleCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
        focusedOption: null,
      });
    });

    test('Toggle upwards through options using Up key', async ({ page }) => {
      await tabIntoFilter(page, 'coloursCombobox');
      await page.keyboard.press('ArrowUp'); // Press `Up` to expand options
      await expectSingleCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
        focusedOption: null,
      });

      await page.keyboard.press('ArrowUp'); // Press `Up` to set focus on last option
      await expectSingleCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
        focusedOption: 'Yellow',
      });

      await page.keyboard.press('ArrowUp'); // Press `Up` to set focus on previous option
      await expectSingleCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
        focusedOption: 'White',
      });

      for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowUp'); //  // Press `Up` multiple times to set focus on first option
      await expectSingleCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
        focusedOption: 'Black',
      });

      await page.keyboard.press('ArrowUp'); // Press `Up` to set focus back to filter input
      await expectSingleCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
        focusedOption: null,
      });
    });

    test.describe('Close options using Esc key', () => {
      test('When focus in filter input', async ({ page }) => {
        await tabIntoFilter(page, 'coloursCombobox');
        await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
        await expectSingleCombobox(page, {
          filterFocused: true,
          optionsExpanded: true,
          visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
        });

        await page.keyboard.press('Escape'); // Press `Esc` to collapse options and set focus back to filter input
        await expectSingleCombobox(page, {
          filterFocused: true,
          optionsExpanded: false,
        });
      });

      test('When focus on option', async ({ page }) => {
        await tabIntoFilter(page, 'coloursCombobox');
        await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option
        await expectSingleCombobox(page, {
          filterFocused: false,
          optionsExpanded: true,
          visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
          focusedOption: 'Black',
        });

        await page.keyboard.press('Escape'); // Press `Esc` to collapse options and set focus back to filter input
        await expectSingleCombobox(page, {
          filterFocused: true,
          optionsExpanded: false,
        });
      });
    });

    test.describe('Select/unselect options', () => {
      test('Using Space key', async ({ page }) => {
        await tabIntoFilter(page, 'coloursCombobox');
        await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option "Black"
        await expectSingleCombobox(page, {
          filterFocused: false,
          optionsExpanded: true,
          visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
          focusedOption: 'Black',
        });

        await page.keyboard.press('Space'); // Press `Space` to check option "Black"
        await expectSingleCombobox(page, {
          filterFocused: false,
          filterValue: 'Black',
          visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
          optionsExpanded: true,
          focusedOption: 'Black',
          selectedOptions: ['Black'],
        });

        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on second option "Blue"
        await page.keyboard.press('ArrowDown'); // Press `Down` again to set focus on third option "Brown"
        await page.keyboard.press('Space'); // Press `Space` to check option "Brown"
        await expectSingleCombobox(page, {
          filterFocused: false,
          filterValue: 'Brown',
          visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
          optionsExpanded: true,
          focusedOption: 'Brown',
          selectedOptions: ['Brown'],
        });

        await page.keyboard.press('Space'); // Pressing `Space` does NOT uncheck option "Brown"
        await expectSingleCombobox(page, {
          filterFocused: false,
          filterValue: 'Brown',
          visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
          optionsExpanded: true,
          focusedOption: 'Brown',
          selectedOptions: ['Brown'],
        });
      });

      test('Using Enter key', async ({ page }) => {
        await tabIntoFilter(page, 'coloursCombobox');
        await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option "Black"
        await page.keyboard.press('Enter'); // Press `Enter` to check option "Black"
        await expectSingleCombobox(page, {
          filterFocused: true,
          filterValue: 'Black',
          visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
          optionsExpanded: false,
          selectedOptions: ['Black'],
        });
      });
    });

    test.describe('Activate "Unselect all" button', () => {
      test('"Unselect all" button', async ({ page }) => {
        await tabIntoFilter(page, 'coloursCombobox');
        await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option
        await page.keyboard.press('Space'); // Press `Space` to check option "Black"
        await page.keyboard.press('Escape'); // Press `Esc` to collapse options and set focus
        await expectSingleCombobox(page, {
          filterFocused: true,
          filterValue: 'Black',
          optionsExpanded: false,
          selectedOptions: ['Black'],
        });

        await page.keyboard.press('Tab'); // Press `Tab` to move focus to "Unselect all" button
        await expectSingleCombobox(page, {
          unselectAllButtonFocused: true,
          filterValue: 'Black',
          optionsExpanded: false,
          selectedOptions: ['Black'],
        });

        await page.keyboard.press('Enter'); // Press `Enter` to activate "Unselect all" button
        await expectSingleCombobox(page, {
          filterFocused: true,
          optionsExpanded: false,
          selectedOptions: [],
        });
      });
    });

    test('Propagate Enter key', async ({ page }) => {
      await tabIntoFilter(page, 'coloursCombobox');
      await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
      await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option
      await page.keyboard.press('Space'); // Press `Space` to check option "Black"
      await page.keyboard.press('ArrowUp'); // Press `Up` to set focus back to filter input
      await page.keyboard.press('Enter'); // Press `Enter` to trigger browser default behaviour (send form)
      await expect(page).toHaveURL(/.*\?colours=000000/);
    });
  });

  test.describe('Mouse interaction', () => {
    test('Click into filter input', async ({ page }) => {
      await clickIntoFilter(page, 'coloursCombobox'); // Click into the filter to expand options
      await expectSingleCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
      });

      await clickIntoFilter(page, 'coloursCombobox'); // Click again into the filter, options remain expanded (unsure about that, see https://github.com/NothingAG/adg-components/issues/17)
      await expectSingleCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
      });
    });

    test('Click out of filter input', async ({ page }) => {
      await clickIntoFilter(page, 'coloursCombobox'); // Click into the filter to expand options
      await expectSingleCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
      });

      await clickOutsideFilter(page); // Click into the filter to expand options
      await expectSingleCombobox(page, {
        filterFocused: false,
        optionsExpanded: false,
      });
    });

    test('Click open/close button', async ({ page }) => {
      await clickOpenCloseButton(page, 'coloursCombobox'); // Click open/close button to expand options
      await expectSingleCombobox(page, {
        filterFocused: true,
        optionsExpanded: true,
      });

      await clickOpenCloseButton(page, 'coloursCombobox'); // Click open/close button to collapse options
      await expectSingleCombobox(page, {
        filterFocused: true,
        optionsExpanded: false,
      });
    });

    test('Select/unselect options', async ({ page }) => {
      await clickIntoFilter(page, 'coloursCombobox'); // Expand options
      await clickOption(page, 'Black', 'coloursCombobox'); // Select option "Black"
      await clickOption(page, 'Brown', 'coloursCombobox'); // Select option "Brown"
      await expectSingleCombobox(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
        focusedOption: 'Brown',
        selectedOptions: ['Black', 'Brown'],
      });

      await clickOption(page, 'Brown', 'coloursCombobox'); // Unselect option "Brown"
      await expectSingleCombobox(page, {
        filterFocused: false,
        visibleOptions: ALL_SINGLE_OPTIONS.map((i) => i.label),
        optionsExpanded: true,
        focusedOption: 'Brown',
        selectedOptions: ['Black'],
      });
    });
  });

  test.describe('Filter', () => {
    test('Change filter term to expand options', async ({ page }) => {
      await tabIntoFilter(page, 'coloursCombobox'); // Focus filter term (does not expand options)
      await expectSingleCombobox(page, {
        filterFocused: true,
        optionsExpanded: false,
      });

      await page.keyboard.press('b'); // Enter something will expand options
      await expectSingleCombobox(page, {
        filterFocused: true,
        filterValue: 'b',
        visibleOptions: ['Blue', 'Kickboxing'],
        optionsExpanded: true,
      });
    });

    test('Enter term to filter options', async ({ page }) => {
      await clickIntoFilter(page, 'coloursCombobox'); // Expand options
      await page.keyboard.press('b'); // Start filtering with "b"
      await expectSingleCombobox(page, {
        filterFocused: true,
        filterValue: 'b',
        visibleOptions: ['Blue', 'Kickboxing'],
        optionsExpanded: true,
      });

      await page.keyboard.press('a'); // Add "a", so filter is "ba"
      await expectSingleCombobox(page, {
        filterFocused: true,
        filterValue: 'ba',
        visibleOptions: ['Blue'],
        optionsExpanded: true,
      });

      await page.keyboard.press('t'); // Add "t", so filter is "bat"
      await expectSingleCombobox(page, {
        filterFocused: true,
        filterValue: 'bat',
        visibleOptions: [],
        optionsExpanded: true,
      });
    });

    test('Toggle through filtered options', async ({ page }) => {
      await clickIntoFilter(page, 'coloursCombobox'); // Expand options
      await page.keyboard.press('b'); // Start filtering with "b"
      await expectSingleCombobox(page, {
        filterFocused: true,
        filterValue: 'b',
        visibleOptions: ['Blue', 'Kickboxing'],
        optionsExpanded: true,
      });

      await page.keyboard.press('ArrowDown'); // Move focus to first option "Blue"
      await expectSingleCombobox(page, {
        filterValue: 'b',
        visibleOptions: ['Blue', 'Kickboxing'],
        focusedOption: 'Blue',
        optionsExpanded: true,
      });

      await page.keyboard.press('ArrowDown'); // Move focus to next (last) option "Kickboxing"
      await expectSingleCombobox(page, {
        filterValue: 'b',
        visibleOptions: ['Blue', 'Kickboxing'],
        focusedOption: 'Kickboxing',
        optionsExpanded: true,
      });

      await page.keyboard.press('ArrowDown'); // Move focus back to top (filter input)
      await expectSingleCombobox(page, {
        filterFocused: true,
        filterValue: 'b',
        visibleOptions: ['Blue', 'Kickboxing'],
        optionsExpanded: true,
      });
    });

    test('Filter can be changed while toggling through options', async ({
      page,
    }) => {
      await clickIntoFilter(page, 'coloursCombobox'); // Expand options
      await page.keyboard.press('a'); // Start filtering with "a"
      await expectSingleCombobox(page, {
        filterFocused: true,
        filterValue: 'a',
        visibleOptions: [
          'Blue',
          'Green',
          'Dancing',
          'Painting',
          'Reading',
          'Programming',
        ],
        optionsExpanded: true,
      });

      await page.keyboard.press('ArrowDown'); // Move focus to first option "Blue"
      await expectSingleCombobox(page, {
        filterValue: 'a',
        visibleOptions: [
          'Blue',
          'Green',
          'Dancing',
          'Painting',
          'Reading',
          'Programming',
        ],
        optionsExpanded: true,
        focusedOption: 'Blue',
      });

      await page.keyboard.press('a'); // Add "d", so filter is "ba", and focus should be back on filter input
      test.fixme(); // Focus is not put back to filter input
      await expectSingleCombobox(page, {
        filterFocused: true,
        filterValue: 'ba',
        visibleOptions: ['Blue'],
        optionsExpanded: true,
      });
    });
  });
});
