import React, { useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import {
  editorState,
  EditorDom,
  materialsToProgram,
} from '@three-material-editor/core';

class MaterialEditorOptions {
  camera?: PerspectiveCamera | OrthographicCamera;
  overrideRaf?: boolean;
  fullScreen?: boolean;
}

const optionsDefault: MaterialEditorOptions = {
  overrideRaf: false,
  fullScreen: true,
};

export let updateMaterialEditor = (
  _scene: Scene,
  _gl: WebGLRenderer,
  _options?: MaterialEditorOptions
) => {};
export let MaterialEditor = (
  _scene: Scene,
  _gl: WebGLRenderer,
  _options?: MaterialEditorOptions
) => {};

if (process.env.NODE_ENV === 'development' || process.env.TME_PROD === 'SHOW') {
  const resizeCanvasToDisplaySize = (
    gl: WebGLRenderer,
    options?: MaterialEditorOptions
  ) => {
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      gl.setSize(width, height, false);
      if (options?.camera) {
        const camera = options.camera;

        if (camera.type === 'PerspectiveCamera') {
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }
      }
    }

    return needResize;
  };

  updateMaterialEditor = (
    scene: Scene,
    gl: WebGLRenderer,
    _options?: MaterialEditorOptions
  ) => {
    const options = Object.assign(optionsDefault, _options);

    materialsToProgram(scene, gl);
    resizeCanvasToDisplaySize(gl, options);
  };

  const App = (props: any) => {
    useLayoutEffect(() => {
      editorState.scene = props.scene;
    });

    return (
      <>
        <EditorDom position={props.position} />
      </>
    );
  };

  MaterialEditor = (
    scene: Scene,
    gl: WebGLRenderer,
    _options?: MaterialEditorOptions
  ) => {
    const options = Object.assign(optionsDefault, _options);
    Object.assign(editorState, options);

    materialsToProgram(scene, gl);
    if (!options || (options && !options.overrideRaf)) {
      const animate = () => {
        updateMaterialEditor(scene, gl, options);
        requestAnimationFrame(animate);
      };
      animate();
    }
    
    ReactDOM.render(<App scene={scene} />, document.body);
  };
}
