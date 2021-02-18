

import React, { VFC } from 'react';
import { editorState } from '../../state';
import { useProxy } from 'valtio';
import { editorContextState as editorContext } from '../../state';

// import styles from './menu.module.css';

interface UniformsMenuProps {
}


export const UniformsMenu: VFC<UniformsMenuProps> = () => {
  const snapshot = useProxy(editorState);

  if (!editorContext.monacoRef) {
    return null;
  }

  if (!editorContext.activeMaterial.ref) {
    return null;
  }

  const material: any = editorContext.activeMaterial.ref.material;

  return material && material.uniforms && Object.keys(material.uniforms).length > 0 ? (
    <div key={snapshot.triggerUpdate}>
    </div>
  ) : null;
};



