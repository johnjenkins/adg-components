import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'adg-components',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers,
      copy: [
        {
          src: '**/*.i18n.*.json',
          dest: 'i18n',
        },
      ],
    },
  ],
};
