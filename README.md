# three-material-editor

## [![NPM Package][npm]][npm-url] [![Build Size][build-size]][build-size-url] [![NPM Downloads][npm-downloads]][npmtrends-url]

A GLSL editor for Threejs materials. Automatically detect the WebGL programs and provide live edit for the shaders.
The editor can generates an onBeforeCompile function and possess a diff editor to analyze your changes.

![image](https://user-images.githubusercontent.com/15867665/106269312-b2778000-626f-11eb-906f-6def286e6c52.png)

#### Features :

- Generate onBeforeCompile function based on your modifications
- Diff viewer
- Handle and log errors
- The fullscreen mode will embed your canvas in a popup automatically
- Manage share materials
- Handle dynamic scene and meshes
- Automatically removed in production based on env variable

#### Support :

- Support all types of postprocess (three/example/postprocess, postprocess, react-postprocess)
- Support material with onBeforeCompile
- Support troika derive material and troika-3d-text
- React and Vanilla builds
- Support SSR framework such as NextJS

* [`@three-material-editor/core`](https://github.com/RenaudRohlinger/three-material-editor/tree/main/packages/core) - Code editor

## Quick start - Vanilla

- [`@three-material-editor/react`](https://github.com/RenaudRohlinger/three-material-editor/tree/main/packages/react) - React wrapper

- [`@three-material-editor/vanilla`](https://github.com/RenaudRohlinger/three-material-editor/tree/main/packages/vanilla) - Vanilla wrapper

```sh
yarn add -D @three-material-editor/vanilla
```

```jsx
import {
  MaterialEditor,
  useEditorComposer,
} from '@three-material-editor/vanilla';

// add the editor in the init function of your app
MaterialEditor(scene, renderer, {
  camera: camera, // handle responsize dpr for fullscreen
});

let composer = new EffectComposer(renderer);
useEditorComposer(composer);
```

Demo : [codesandbox](https://codesandbox.io/s/three-material-editorvanilla-l55jn)

[`See more - @three-material-editor/vanilla`](https://github.com/RenaudRohlinger/three-material-editor/tree/main/packages/vanilla)

## Quick start - React-Three-Fiber

```sh
yarn add -D @three-material-editor/react
```

```jsx
import {
  MaterialEditor,
  useEditorComposer,
} from '@three-material-editor/react';

<Canvas>
  <MaterialEditor />
  <EffectComposer ref={useEditorComposer()}>...</EffectComposer>
</Canvas>;
```

Demo : [codesandbox](https://codesandbox.io/s/three-material-editorreact-z59h4)

[`See more - @three-material-editor/react`](https://github.com/RenaudRohlinger/three-material-editor/tree/main/packages/react)

## Automatically removed in production

The Material Editor is automatically remove from the production build based on the `process.env.NODE_ENV`.

To render the editor in production :

```jsx
import { MaterialEditor } from '@three-material-editor/vanilla/dist/vanilla.cjs.development';
```

OR a custom env variable is available :

```jsx
process.env.TME_PROD === 'SHOW';
```

## Development workflow :

In one terminal, run tsdx watch in parallel:

`yarn start`

In another terminal, run tsdx example:

```jsx
yarn start:app // react -> localhost:1234
// OR
yarn start:vanilla // vanilla -> localhost:1234/vanilla.html
```

# How to contribute :

If you like this project, please consider helping out. All contributions are welcome as well as donations to [`paypal.me/renaudrohlinger`](https://www.paypal.me/renaudrohlinger) or by `BTC : 3DxQy7MAaFgJpuMpn8oHTyc679vREq5g6p`

[npm]: https://img.shields.io/npm/v/@three-material-editor/core
[npm-url]: https://www.npmjs.com/package/@three-material-editor/core
[build-size]: https://badgen.net/bundlephobia/minzip/@three-material-editor/core
[build-size-url]: https://bundlephobia.com/result?p=@three-material-editor/core
[npm-downloads]: https://img.shields.io/npm/dw/@three-material-editor/core
[npmtrends-url]: https://www.npmtrends.com/@three-material-editor/core

[`twitter 🐈‍⬛ @onirenaud`](https://twitter.com/onirenaud)
