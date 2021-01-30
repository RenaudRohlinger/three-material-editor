import React from 'react';
import { useFrame, useThree } from 'react-three-fiber';
import {
  EditorDom,
  editorState,
  materialsToProgram,
} from '@three-material-editor/core';
import { Html } from './html';

class MaterialEditorOptions {
  overrideRaf?: boolean;
  className?: string;
  fullScreen?: boolean;
}

const optionsDefault: MaterialEditorOptions = {
  overrideRaf: false,
  fullScreen: true,
};

export let Logic = () => null;
export let MaterialEditor = (_options?: MaterialEditorOptions) => {};

if (process.env.NODE_ENV === 'production' || process.env.TME_PROD === 'SHOW') {
} else {
  Logic = () => {
    const { scene, gl } = useThree();

    useFrame(() => {
      materialsToProgram(scene, gl);
    });

    return null;
  };

  MaterialEditor = (_options?: MaterialEditorOptions) => {
    const options = Object.assign(optionsDefault, _options);
    Object.assign(editorState, options);

    return (
      <>
        <Logic />
        <Html>
          <EditorDom className={editorState.className} />
        </Html>
      </>
    );
  };
}
