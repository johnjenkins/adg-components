import { test, expect, Page } from '@playwright/test';
import {
  tabIntoFilter,
  pressTab,
  pressSpace,
  focusFilter,
  pressEsc,
  checkMultiState,
  pressDown,
  pressUp,
  ALL_OPTIONS,
  expectFocusedOption,
  pressEnter,
} from './helpers';

test.describe('Multiselect', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3333');
  });

  test('Initial display', async ({ page }) => {
    await checkMultiState(page, {}); // Default state
  });

  test.describe('Keyboard', () => {
    test('Tab into filter input', async ({ page }) => {
      await tabIntoFilter(page);
      await checkMultiState(page, {
        filterFocused: true,
      });
    });

    test('Tab out of filter input', async ({ page }) => {
      await focusFilter(page);
      await checkMultiState(page, {
        filterFocused: true,
      });

      await page.keyboard.press('Shift+Tab'); // At the time being, the open/close button is also focusable, so we should rather do a Shift-Tab here to definitely move focus outside the component. This might change though, see https://github.com/NothingAG/adg-components/issues/16.
      await checkMultiState(page, {
        filterFocused: false,
      });
    });

    test('Activate open/close button', async ({ page }) => {
      // This button will not remain focusable, see https://github.com/NothingAG/adg-components/issues/16
      // await focusFilter(page);
      // await pressTab(page);
      // await pressSpace(page);
      // await checkMultiState(page, {
      //   filterFocused: false,
      //   optionsExpanded: true,
      //   visibleOptions: ALL_OPTIONS
      // });
      // // todo: tbd: should the component automatically focus the first item or not?
      // await pressSpace(page);
      // await checkMultiState(page, {
      //   filterFocused: false,
      //   optionsExpanded: false
      // });
    });

    test('Toggle downwards through options using Down key', async ({
      page,
    }) => {
      await tabIntoFilter(page);
      await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
      await checkMultiState(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS,
        focusedOption: null,
      });

      await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option
      await checkMultiState(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS,
        focusedOption: 'Soccer',
      });

      await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on next option
      await checkMultiState(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS,
        focusedOption: 'Badminton',
      });

      for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowDown'); //  // Press `Down` multiple times to set focus on last option
      await checkMultiState(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS,
        focusedOption: 'Programming',
      });

      await page.keyboard.press('ArrowDown'); // Press `Down` to set focus back to filter input
      await checkMultiState(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS,
        focusedOption: null,
      });
    });

    test('Toggle upwards through options using Up key', async ({ page }) => {
      await tabIntoFilter(page);
      await page.keyboard.press('ArrowUp'); // Press `Up` to expand options
      await checkMultiState(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS,
        focusedOption: null,
      });

      await page.keyboard.press('ArrowUp'); // Press `Up` to set focus on last option
      await checkMultiState(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS,
        focusedOption: 'Programming',
      });

      await page.keyboard.press('ArrowUp'); // Press `Up` to set focus on previous option
      await checkMultiState(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS,
        focusedOption: 'Sleeping',
      });

      for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowUp'); //  // Press `Up` multiple times to set focus on first option
      await checkMultiState(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS,
        focusedOption: 'Soccer',
      });

      await page.keyboard.press('ArrowUp'); // Press `Up` to set focus back to filter input
      await checkMultiState(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS,
        focusedOption: null,
      });
    });

    test.describe('Close options using Esc key', () => {
      test('When focus in filter input', async ({ page }) => {
        await focusFilter(page);
        await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
        await checkMultiState(page, {
          filterFocused: true,
          optionsExpanded: true,
          visibleOptions: ALL_OPTIONS,
        });

        await page.keyboard.press('Escape'); // Press `Esc` to collapse options and set focus back to filter input
        await checkMultiState(page, {
          filterFocused: true,
          optionsExpanded: false,
        });
      });

      test('When focus on option', async ({ page }) => {
        await focusFilter(page);
        await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option
        await checkMultiState(page, {
          filterFocused: false,
          optionsExpanded: true,
          visibleOptions: ALL_OPTIONS,
          focusedOption: 'Soccer',
        });

        await page.keyboard.press('Escape'); // Press `Esc` to collapse options and set focus back to filter input
        await checkMultiState(page, {
          filterFocused: true,
          optionsExpanded: false,
        });
      });
    });

    test.describe('Select/unselect options', () => {
      test('Using Space key', async ({ page }) => {
        await focusFilter(page);
        await page.keyboard.press('ArrowDown'); // Press `Down` to expand options
        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on first option "Soccer"
        await checkMultiState(page, {
          filterFocused: false,
          optionsExpanded: true,
          visibleOptions: ALL_OPTIONS,
          focusedOption: 'Soccer',
        });

        await page.keyboard.press('Space'); // Press `Space` to check option "Soccer"
        await checkMultiState(page, {
          filterFocused: false,
          visibleOptions: ALL_OPTIONS,
          optionsExpanded: true,
          focusedOption: 'Soccer',
          selectedOptions: ['Soccer'],
        });

        await page.keyboard.press('ArrowDown'); // Press `Down` to set focus on second option "Badminton"
        await page.keyboard.press('ArrowDown'); // Press `Down` again to set focus on third option "Movies"
        await page.keyboard.press('Space'); // Press `Space` to check option "Movies"
        await checkMultiState(page, {
          filterFocused: false,
          visibleOptions: ALL_OPTIONS,
          optionsExpanded: true,
          focusedOption: 'Movies',
          selectedOptions: ['Soccer', 'Movies'],
        });

        await page.keyboard.press('Space'); // Press `Space` to uncheck option "Movies"
        await checkMultiState(page, {
          filterFocused: false,
          visibleOptions: ALL_OPTIONS,
          optionsExpanded: true,
          focusedOption: 'Movies',
          selectedOptions: ['Soccer'],
        });
      });

      test('Using Enter key', async ({ page }) => {});
    });

    test('Activate "unselect all" button', async ({ page }) => {});
    test('Propagate Enter key', async ({ page }) => {});
  });
});
