# ADG Combobox: a searchable single/multi select dropdown

An initiative of the [«Accessibility Developer Guide»](https://www.accessibility-developer-guide.com/) community to provide a **truly accessible** reusable **select dropdown** with the following features:

- It is **searchable** 🔍
- It handles both ✅ **single** and ✅✅✅ **multi** selection
- Options can be loaded async (**AJAX**) 🧩
- 100% **accessible** ♿️, based on [WCAG 2.1](https://www.w3.org/TR/WCAG21/)

It is based on HTML form controls, with which we prove that **accessibility is simple** by relying on rock-solid browser standard behaviour, instead of reinventing the wheel with the rather complex (and fragmentarily supported) [ARIA Standard](https://www.w3.org/WAI/standards-guidelines/aria/).

## How to use

```html
<script type="module" src="/build/adg-components.esm.js"></script>
<script nomodule src="/build/adg-components.js"></script>

<adg-combobox id="hobbiesCombobox" name='hobbies' label='Hobbies'></adg-combobox>

<script>
  const hobbiesCombobox = document.querySelector('#hobbiesCombobox');
  hobbiesCombobox.options = ['Soccer', 'Badminton', 'Movies', 'Gardening', 'Kickboxing'];
</script>
```

## Involved parties

- [Eidgenössische Technische Hochschule (ETH) Zürich](https://www.ethz.ch/), customer and funder of the initiative.
- [Nothing](https://www.nothing.ch/), accessibility experts, lead of the team, implementers of the [proof of concept](https://github.com/NothingAG/accessible-dropdown/).
- [Lambda IT](https://lambda-it.ch/), head of the implementation
- [Dept](https://www.deptagency.com/), implementation of multi-language support
- [Iterativ](https://www.iterativ.ch/), implementation of automated testing
- [Access for all](https://www.access-for-all.ch/), accessibility testing
