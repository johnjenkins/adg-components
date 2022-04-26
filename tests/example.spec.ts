import {test, expect} from '@playwright/test'

const expectOptionsExpanded = async (page, visible=true) => {
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
  visibleOptions: string[];
  focusedOption?: string;
}

const hasMultiState = async (page, {optionsExpanded, visibleOptions, filterFocused}: MultiStateOptions = {optionsExpanded: false, visibleOptions: [], filterFocused: false}) => {
  await expectOptionsExpanded(page, optionsExpanded);

  const results = page.locator('.adg-combobox--available-options-list-item:visible');
  const count = await results.count();
  expect(count).toEqual(visibleOptions.length);

  for (let option of visibleOptions) {
    const item = await page.locator(`input[value="${option}"]`);
    await  expect(item).toBeVisible();
  }

  if (filterFocused) {

  }
}

test('basic test', async ({page}) => {
  await page.goto('http://localhost:3333');
  const label = page.locator('.adg-combobox--filter-label').first();
  await expect(label).toHaveText('Hobbies');
  await expectOptionsExpanded(page, false);

  const filter = await page.locator('input[name="hobbies"]');
  // todo: this is what right now needs to be pressed to get from page load to the filter, but it's easily breakable, if someone changes the example
  for (let i=0; i<4;i++){ // press tab 4 times
    await page.keyboard.press('Tab');
  }
  // todo: this would be better, but it doesn't 'tab into' the filter input
  // await filter.focus();
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
