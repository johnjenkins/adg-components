# my-component

<!-- Auto Generated Below -->


## Properties

| Property       | Attribute      | Description | Type                 | Default                                  |
| -------------- | -------------- | ----------- | -------------------- | ---------------------------------------- |
| `label`        | `label`        |             | `string`             | `null`                                   |
| `multi`        | `multi`        |             | `boolean`            | `false`                                  |
| `name`         | `name`         |             | `string`             | `this.optionslabel.replace(/\W+/g, '-')` |
| `options`      | `options`      |             | `Option[] \| string` | `[]`                                     |
| `optionslabel` | `optionslabel` |             | `string`             | `this.label \|\| 'Options'`              |
| `roleAlert`    | `role-alert`   |             | `boolean`            | `false`                                  |
| `selected`     | `selected`     |             | `string \| string[]` | `undefined`                              |


## Events

| Event                   | Description | Type                                       |
| ----------------------- | ----------- | ------------------------------------------ |
| `filterTermChanged`     |             | `CustomEvent<AdgComboboxFilterTermChange>` |
| `optionChanged`         |             | `CustomEvent<AdgComboboxOptionChange>`     |
| `optionsDropdownClosed` |             | `CustomEvent<never>`                       |
| `optionsDropdownOpened` |             | `CustomEvent<never>`                       |
| `selectionCleared`      |             | `CustomEvent<never>`                       |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
