import {test, expect} from '@playwright/test';
import {
  assertions, pressTab, pressSpace, focusFilter, pressEsc,
  checkMultiState, pressDown, pressUp, ALL_OPTIONS, expectFocusedOption,
  pressEnter
} from './helpers';



test.describe('Multiselect', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:3333');
  });

  test('Initial display', async ({page}) => {
    const label = page.locator('.adg-combobox--filter-label').first();
    await expect(label).toHaveText('Hobbies');
    await assertions(page);
  });

  test.describe('Keyboard', () => {
    test('Tab into filter input', async ({page}) => {
      // todo: this is what right now needs to be pressed to get from page load to the filter, but it's easily breakable, if someone changes the example
      for (let i = 0; i < 4; i++) { // press tab 4 times
        await page.keyboard.press('Tab');
      }
      // todo: this would be better, but it doesn't 'tab into' the filter input
      // await filter.focus();
      await checkMultiState(page, {
        optionsExpanded: false,
        filterFocused: true
      });

    });

    test('Tab outside filter input', async ({page}) => {
      await focusFilter(page);
      await checkMultiState(page, {
        filterFocused: true
      });

      await page.keyboard.press('Shift+Tab');
      await checkMultiState(page, {
        filterFocused: false
      });
    });

    test('Activate open/close button', async ({page}) => {
      await focusFilter(page);
      await pressTab(page);
      await pressSpace(page);
      await checkMultiState(page, {
        filterFocused: false,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS
      });
      // todo: tbd: should the component automatically focus the first item or not?
      await pressSpace(page);
      await checkMultiState(page, {
        filterFocused: false,
        optionsExpanded: false
      });
    })

    test('Toggle through options using Down key', async ({page}) => {
      await focusFilter(page);
      await pressDown(page);
      await checkMultiState(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS
      });
      await pressDown(page);
      await expectFocusedOption(page, 'Soccer');
      await pressDown(page);
      await expectFocusedOption(page, 'Badminton');
      for (let i = 0; i < 11; i++) {
        await pressDown(page);
      }
      await checkMultiState(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS
      })
    });

    test('Toggle through options using Up key', async ({page}) => {
      await focusFilter(page);
      await pressUp(page);
      await checkMultiState(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS
      });
      await pressUp(page);
      await expectFocusedOption(page, 'Programming');
      await pressUp(page);
      await expectFocusedOption(page, 'Sleeping');
      for (let i = 0; i < 11; i++) {
        await pressUp(page);
      }
      await checkMultiState(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS
      })

    });

    test('Close options using Esc key', async ({page}) => {
      await focusFilter(page);
      await pressDown(page);
      await checkMultiState(page, {
        filterFocused: true,
        optionsExpanded: true,
        visibleOptions: ALL_OPTIONS
      });
      await pressEsc(page);
      await checkMultiState(page, {
        filterFocused: true,
        optionsExpanded: false,
      });
    });

    test('Toggle options using Space/Enter key', async ({page}) => {
      await focusFilter(page);
      await pressDown(page);
      await pressDown(page);
      await pressEnter(page);
      await checkMultiState(page, {
        filterFocused:false,
        visibleOptions: ALL_OPTIONS,
        optionsExpanded: true,
        focusedOption: 'Soccer',
        selectedOptions: ['Soccer']
      })
      await pressDown(page);
      await pressDown(page);
      await pressSpace(page);
      await checkMultiState(page, {
        filterFocused:false,
        visibleOptions: ALL_OPTIONS,
        optionsExpanded: true,
        focusedOption: 'Movies',
        selectedOptions: ['Soccer', 'Movies']
      });
      await pressSpace(page);
      await checkMultiState(page, {
        filterFocused:false,
        visibleOptions: ALL_OPTIONS,
        optionsExpanded: true,
        focusedOption: 'Movies',
        selectedOptions: ['Soccer']
      });


    });

    test('Tab out of filter input', async ({page}) => {
    });
    test('Activate "unselect all" button', async ({page}) => {
    });
    test('Propagate Enter key', async ({page}) => {
    });
  })


});

