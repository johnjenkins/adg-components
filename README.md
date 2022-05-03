# ADG Combobox: A Searchable Single/Multi Select Dropdown

An initiative of the [«Accessibility Developer Guide»](https://www.accessibility-developer-guide.com/) (ADG) community to provide a **truly accessible** reusable **select dropdown** with the following features:

- It is **searchable** 🔍
- It handles both ✅ **single** and ✅✅✅ **multi** selection
- ~~Options can be loaded **async** 🧩~~ (not yet)
- It is 100% **accessible** ♿️, based on [WCAG 2.1](https://www.w3.org/TR/WCAG21/)

It is based on HTML form controls, which proves that **accessibility is simple** by relying on rock-solid browser standard behaviour. For more info, see [ADG: Widgets simply working for all](https://www.accessibility-developer-guide.com/knowledge/semantics/widgets/).

## Usage

```html
<script type="module" src="/build/adg-components.esm.js"></script>
<script nomodule src="/build/adg-components.js"></script>

<adg-combobox
  id="hobbies"
  name="hobbies"
  label="Please select your hobbies"
  optionslabel="Hobbies"
  multi="true"
  lang="de"
></adg-combobox>

<script>
  const hobbies = document.querySelector('#hobbies');
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

| Attribute      | Type      | Description                                                                                                                                                                                                                                         |
| -------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | `string`  | Provide an (optional) value, ie. `my-cool-hobbies`. Otherwise a unique value is generated, ie. `adg-combobox-0`.                                                                                                                                    |
| `name`         | `string`  | The value of the `name` attribute(s), as submitted by the form through `GET` or `POST`.                                                                                                                                                             |
| `label`        | `string`  | If given, a `<label>` element will be created automatically, with the given string as inner text. If you want to create a `<label>` yourself, attach it to the filter input using the `for` attribute, ie. `<label for="my-cool-hobbies--filter">`. |
| `optionslabel` | `string`  | The "bare", natural name of the given options. For example, while the `label` might be something like `Please select your hobbies`, the `optionslabel` should be simply `Hobbies` alone.                                                            |
| `multi`        | `boolean` | If set to `true`, the combobox will allow selection of multiple values, ie. checkboxes will be created instead of radio buttons. Defaults to `false`.                                                                                               |
| `lang`         | `string`  | The language of the component. If none is given, the language will be detected from the document's `<html>` tag.                                                                                                                                    |

### JavaScript variables

Many of the HTML attributes above can also be set using JavaScript, ie.:

```js
const hobbiesCombobox = document.querySelector('#my-cool-hobbies');
hobbiesCombobox.multi = true;
```

In addition, the following can be set:

| Attribute  | Type       | Description                                                                          |
| ---------- | ---------- | ------------------------------------------------------------------------------------ |
| `options`  | `string[]` | Either an array of strings, ie. `['Green', 'Blue', 'Black']`.                        |
|            | `{}[]`     | Or an array of objects in the following form: `[{label: 'Green', value: '008000'}]`. |
| `selected` | `string`   | Either a single string, ie. `'Green'`.                                               |
|            | `string[]` | Or an array of strings, ie. `['Green', 'Black']` (for multi selection).              |

### Custom events

The following events will be fired upon interaction with a combobox:

| Event                   | Description                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `optionChanged`         | Fired when an option is selected or unselected. See `event.detail.value` and `event.detail.selected` for details.        |
| `selectionCleared`      | Fired when all selection was cleared.                                                                                    |
| `filterTermChanged`     | Fired when the filter term was changed. See `event.detail.previousFilterTerm` and `event.detail.filterText` for details. |
| `optionsDropdownOpened` | Fired when options were opened.                                                                                          |
| `optionsDropdownClosed` | Fired when options were closed.                                                                                          |

## Development

Our components are based on [Stencil](https://stenciljs.com/).

- `$ cd path/to/adg-components`
- `$ nvm use` to use correct node version
- `$ npm i` to install dependencies
- `$ npm run start` starts a local server on <http://localhost:3333/> (with hot reload)

We are happy to receive pull requests. Please verify that all automated tests are still passing.

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

## Accessibility

This component was built with accessibility as core requirement. We test it thoroughly with the [most used screen reader / browser combos](https://webaim.org/projects/screenreadersurvey9/):

- JAWS+Chrome
- JAWS+FF
- NVDA+Chrome
- VoiceOver/iOS
- Talkback

## Involved parties

- **[Eidgenössische Technische Hochschule (ETH) Zürich](https://www.ethz.ch/)** (Manu Heim): customer and funder of the initiative
- **[Nothing](https://www.nothing.ch/)** ([Josua Muheim](https://github.com/jmuheim) & [Xaver Fleer]()): initiators of the original [proof of concept](https://github.com/NothingAG/accessible-dropdown/), implementation
- **[Lambda IT](https://lambda-it.ch/)** ([Wayne Maurer](https://github.com/wmaurer) & [Thomas Schneiter](https://github.com/thomasschneiter)): implementation
- **[Dept](https://www.deptagency.com/)** ([Jürgen Rudigier](https://github.com/rudigier)): implementation
- **[Iterativ](https://www.iterativ.ch/)** ([Ramon Wenger](https://github.com/ramonwenger)): automated testing
- **[Access for all](https://www.access-for-all.ch/)** (Gianfranco Giudice & Petra Ritter): accessibility testing
