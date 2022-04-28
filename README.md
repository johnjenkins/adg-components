# ADG Combobox: a searchable single/multi select dropdown

An initiative of the [«Accessibility Developer Guide»](https://www.accessibility-developer-guide.com/) community to provide a **truly accessible** reusable **select dropdown** with the following features:

- It is **searchable** 🔍
- It handles both ✅ **single** and ✅✅✅ **multi** selection
- Options can be loaded **async** 🧩
- It is 100% **accessible** ♿️, based on [WCAG 2.1](https://www.w3.org/TR/WCAG21/)

It is based on HTML form controls, with which we prove that **accessibility is simple** by relying on rock-solid browser standard behaviour, instead of reinventing the wheel with the (up to this day) fragmentarily supported [ARIA Standard](https://www.w3.org/WAI/standards-guidelines/aria/).

## Usage

```html
<script type="module" src="/build/adg-components.esm.js"></script>
<script nomodule src="/build/adg-components.js"></script>

<adg-combobox id="hobbiesCombobox"></adg-combobox>

<script>
  const hobbiesCombobox = document.querySelector('#hobbiesCombobox');
  hobbiesCombobox.formControlName = 'hobbies';
  hobbiesCombobox.filterLabel = 'Hobbies';
  hobbiesCombobox.options = [
    'Soccer',
    'Badminton',
    'Movies',
    'Gardening',
    'Kickboxing',
  ];
</script>
```

## Development

Our components are based on [Stencil](https://stenciljs.com/).

- `$ cd path/to/adg-components`
- `$ npm i` to install dependencies
- `$ npm run start` starts a local server on <http://localhost:3333/> (with hot reload)

### Automated tests

Our components are thoroughly tested using [Playwright](https://playwright.dev/).

- Make sure your local server is running
- `$ npm run test:run` for headless
- `$ npm run test:gui` to see the magic happen!

See <playwright.config.ts> for further configuration.

## Involved parties

- [Eidgenössische Technische Hochschule (ETH) Zürich](https://www.ethz.ch/), customer and funder of the initiative.
- [Nothing](https://www.nothing.ch/), initiators of the original [proof of concept](https://github.com/NothingAG/accessible-dropdown/), implementation.
- [Lambda IT](https://lambda-it.ch/), implementation.
- [Dept](https://www.deptagency.com/), implementation.
- [Iterativ](https://www.iterativ.ch/), automated testing.
- [Access for all](https://www.access-for-all.ch/), accessibility testing.
