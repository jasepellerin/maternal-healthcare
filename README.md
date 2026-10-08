# react-typescript-starter

###### Minimalist React 18 starter template with TypeScript ⚛ without usage of create-react-app.

Configured with:

- Webpack
- ESLint
- Prettier

## Read post on medium:

https://medium.com/@adriancelczynski/react-with-typescript-starter-kit-without-create-react-app-including-webpack-eslint-bef225c35ffa

## Map

The map uses React Map GL with MapLibre GL 6 and the [LF Maps](https://lfmaps.fr/en/)
Positron style at `https://data.lfmaps.fr/styles/positron`. No basemap API key is
required. Map attribution is provided by the style's sources.

Webpack bundles the MapLibre worker as a separate asset alongside `build.js`;
include that asset when deploying the contents of `dist`.
