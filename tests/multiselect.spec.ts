import {test, expect} from '@playwright/test'

const expectOptionsExpanded = async (page, visible = true) => {
  const list = page.locator('.adg-combobox--available-options-list').first();
  if (visible) {
    return await expect(list).toBeVisible()
  } else {
    return await expect(list).not.toBeVisible()
  }
}

interface MultiStateOptions {
  filterFocused: boolean;
  optionsExpanded: boolean;
  visibleOptions?: string[];
  focusedOption?: string;
}

const defaultOptions: MultiStateOptions = {
  optionsExpanded: false,
  visibleOptions: [],
  filterFocused: false,
  focusedOption: null
}

const checkMultiState = async (page, options: MultiStateOptions) => {
  const mergedOptions = Object.assign({}, defaultOptions, options);
  const {
    optionsExpanded,
    visibleOptions,
    filterFocused,
    focusedOption
  } = mergedOptions;
  await expectOptionsExpanded(page, optionsExpanded);

  const results = page.locator('.adg-combobox--available-options-list-item:visible');
  const count = await results.count();
  expect(count).toEqual(visibleOptions.length);

  for (let option of visibleOptions) {
    const item = await page.locator(`input[value="${option}"]`);
    await expect(item).toBeVisible();
  }

  if (filterFocused) {
    const filter = await page.locator('input[name="hobbies"]');
    await expect(filter).toBeFocused();
  }

  if (focusedOption) {
    const focused = await page.locator(`input[value="${focusedOption}"]`);
    await expect(focused).toBeFocused();
  }
}

test.describe('Multiselect', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:3333');
  });

  test('Initial display', async ({page}) => {
    const label = page.locator('.adg-combobox--filter-label').first();
    await expect(label).toHaveText('Hobbies');
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
    })
    test('Activate open/close button', async ({page}) => {
    })

    test('Toggle through options using Up key', async ({page}) => {

    });

    test('Toggle through options using Down key', async ({page}) => {

    });

    test('Close options using Esc key', async ({page}) => {

    });

    test('Toggle options using Space/Enter key', async ({page}) => {

    });

    test('Tab out of filter input', async ({page}) => {
    });
    test('Activate "unselect all" button', async ({page}) => {
    });
    test('Propagate Enter key', async ({page}) => {
    });

    test('Multiselect Test', async ({page}) => {
      await expectOptionsExpanded(page, false);

      const filter = await page.locator('input[name="hobbies"]');
      await page.keyboard.type('ing', {delay: 300});
      await expect(filter).toBeFocused();
      await expectOptionsExpanded(page);

      const results = page.locator('.adg-combobox--available-options-list-item:visible');
      const count = await results.count();
      expect(count).toEqual(9);

      const gardening = await page.locator('input[value="gardening"]');
      const hiking = await page.locator('input[value="hiking"]');

      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(gardening).toBeFocused();
      await page.keyboard.press('Space');
      await expect(gardening).toBeChecked();

      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(hiking).toBeFocused();
      await page.keyboard.press('Space');
      await expect(hiking).toBeChecked();
    });

  })


});

