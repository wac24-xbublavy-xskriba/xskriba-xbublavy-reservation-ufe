import { Config } from '@stencil/core'

export const config: Config = {
  namespace: 'reservation',
  globalScript: 'src/global/app.ts',
  globalStyle: 'src/global/global.css',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    },
    {
      type: 'dist-custom-elements'
    },
    {
      type: 'docs-readme'
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        {
          src: '../node_modules/@shoelace-style/shoelace/dist/assets/icons',
          dest: 'assets/icons',
          warn: true
        }
      ]
    }
  ],
  testing: {
    transformIgnorePatterns: ['/node_modules/(?!axios)'],
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest'
    },
    moduleNameMapper: {
      '^.+\\.svg$': 'jest-svg-transformer'
    }
  }
}
