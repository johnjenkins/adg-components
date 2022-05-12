import path  from 'path';

import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

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
      externalRuntime: false,
      includeGlobalScripts: true,
      autoDefineCustomElements: true,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers,
      copy: [
        {
          src: '../../../dist/packages/adg-components/dist/components',
          dest: 'components',
        },
      ],
    },
  ],
  plugins: [
    sass({
      injectGlobalPaths: [
        path.resolve(__dirname, 'src/styles/mixins.scss'),
        path.resolve(__dirname, 'src/styles/base.scss'),
      ],
    }),
  ]
};
