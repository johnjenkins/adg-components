# ADG Combobox: A Searchable Single/Multi Select Dropdown

An initiative of the [«Accessibility Developer Guide»](https://www.accessibility-developer-guide.com/) community to provide a **truly accessible** reusable **select dropdown** with the following features:

- It is **searchable** 🔍
- It handles both ✅ **single** and ✅✅✅ **multi** selection
- ~~Options can be loaded **async** 🧩~~ (not yet)
- It is 100% **accessible** ♿️, based on [WCAG 2.1](https://www.w3.org/TR/WCAG21/)

It is based on HTML form controls, with which we prove that **accessibility is simple** by relying on rock-solid browser standard behaviour, instead of reinventing the wheel with the (up to this day) fragmentarily supported [ARIA Standard](https://www.w3.org/WAI/standards-guidelines/aria/).

## Usage

```html
<script type="module" src="/build/adg-components.esm.js"></script>
<script nomodule src="/build/adg-components.js"></script>

<adg-combobox
  id="hobbies"
  name="hobbies"
  label="Hobbies"
  lang="de"
></adg-combobox>

<script>
  const hobbies = document.querySelector('#hobbies');
  hobbies.formControlName = 'hobbies';
  hobbies.filterlabel = 'Hobbies';
  hobbies.options = [
    'Soccer',
    'Badminton',
    'Movies',
    'Gardening',
    'Kickboxing',
  ];
</script>
```

### HTML attributes

| Attribute     | Type      | Description                                                                                                                                                                                     |
| ------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | `string`  | Provide an (optional) value, ie. `my-cool-hobbies`. Otherwise a unique value is generated, ie. `adg-combobox-0`.                                                                                |
| `multi`       | `boolean` | If set to `true`, the combobox will allow selection of multiple values, ie. checkboxes will be created instead of radio buttons. Defaults to `false`.                                           |
| `label`       | `string`  | If given, a `<label>` element will be created automatically, with the given string as inner text.                                                                                               |
| `filterlabel` | `string`  | The "bare", natural name of the given options. For example, while the `label` might be something like `Please select your hobbies`, the `filterlabel` should be something like `Hobbies` alone. |
| `name`        | `string`  | The value of the `name` attribute(s), as submitted by the form through `GET` or `POST`.                                                                                                         |
| `lang`        | `string`  | The language of the component. If none is given, the language will be detected from the document's `<html>` tag.                                                                                |

### JavaScript variables

Many of the HTML attributes above can also be set using JavaScript:

```js
const hobbiesCombobox = document.querySelector('#my-cool-hobbies');
hobbiesCombobox.multi = true;
```

In addition, the following can be set:

| Attribute | Type       | Description                                                                          |
| --------- | ---------- | ------------------------------------------------------------------------------------ |
| `options` | `string[]` | Either an array of strings, ie. `['Green', 'Blue', 'Black']`.                        |
|           | `{}[]`     | Or an array of objects in the following form: `[{label: 'Green', value: '008000'}]`. |
| `value`   | `string`   | Either a single string, ie. `'Green'`.                                               |
|           | `string[]` | Or an array of strings, ie. `['Green', 'Black']` (for multi selection).              |

### Custom events

The following events will be fired upon interaction with a combobox:

| Event                   | Description                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `optionChanged`         | Fired when an option is selected of unselected. See `event.detail.option` and `event.detail.selected` for details.           |
| `allOptionsUnselected`  | Fired when all options are unselected.                                                                                       |
| `filterTermChanged`     | Fired when the filter term was changed. See `event.detail.prevFilterTermText` and `event.detail.filterTermText` for details. |
| `optionsDropdownOpened` | Fired when options were opened.                                                                                              |
| `optionsDropdownClosed` | Fired when options were closed.                                                                                              |

## Development

Our components are based on [Stencil](https://stenciljs.com/).

- `$ cd path/to/adg-components`
- `$ nvm use` to use correct node version
- `$ npm i` to install dependencies
- `$ npm run start` starts a local server on <http://localhost:3333/> (with hot reload)

### Automated tests

Our components are thoroughly tested using [Playwright](https://playwright.dev/).

- Make sure your local server is running
- `$ npm run test:run` for headless
- `$ npm run test:gui` to see the magic happen!

See `playwright.config.ts` for further configuration.

You can also run Playwright tests from within VSCode with the [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension.

### Debugging

- To debug the component's internals, simply add a `debugger` statement in a `*.tsx` file. This will trigger the debugging environment in your browser.
- To debug Playwright tests, install [Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright), then add a breakpoint in a `*.spec.ts` file. Now open the "Testing" tab on the left (below "Extensions"), and click "Debug Tests" or hover over a specific test and click "Debug Test"). This will run the test environment in headed mode and trigger the debugging environment in VSCode.

## Involved parties

- **[Eidgenössische Technische Hochschule (ETH) Zürich](https://www.ethz.ch/)** (Manu Heim): customer and funder of the initiative
- **[Nothing](https://www.nothing.ch/)** ([Josua Muheim](https://github.com/jmuheim) & [Xaver Fleer]()): initiators of the original [proof of concept](https://github.com/NothingAG/accessible-dropdown/), implementation
- **[Lambda IT](https://lambda-it.ch/)** ([Wayne Maurer](https://github.com/wmaurer) & [Thomas Schneiter](https://github.com/thomasschneiter)): implementation
- **[Dept](https://www.deptagency.com/)** ([Jürgen Rudigier](https://github.com/rudigier)): implementation
- **[Iterativ](https://www.iterativ.ch/)** ([Ramon Wenger](https://github.com/ramonwenger)): automated testing
- **[Access for all](https://www.access-for-all.ch/)** (Gianfranco Giudice & Petra Ritter): accessibility testing
