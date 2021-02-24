import React, { VFC } from 'react';
import { getNameForEditorMaterial } from '../../helpers/shaderToMaterial';
import { editorState } from '../../state';
import { useProxy } from 'valtio';
import { editorContext } from '../../.';
import editorcss from '../../editor.module.css';
import { checkIfModifications } from '../../editor';

import styles from './menu.module.css';
import { IoImageOutline } from 'react-icons/io5';
import { IoCubeOutline } from 'react-icons/io5';

interface LiMenuProps {
  type: string;
  program: any;
}

export const LiMenu: VFC<LiMenuProps> = ({ type, program }) => {
  const snapshot = useProxy(editorState);
  const material = program.material;
  const programGl = program.program;

  const name = getNameForEditorMaterial(material, programGl)
  const getModif = (type: string) => {
    if (!editorContext.monacoRef) {
      return;
    }
    const oModel = editorContext.monacoRef.editor.getModel(
      `urn:${name}.${type}_orig`
    );
    const mModel = editorContext.monacoRef.editor.getModel(
      `urn:${name}.${type}`
    );
    if (!oModel || !mModel) {
      return null;
    }
    return oModel.getValue() !== mModel.getValue();
  };
  // TODO M DISPARAIT QUAND ON MINIMIZE L'EDITOR

  return (
    <li
      className={`${
        snapshot.tabs[`urn:${name}.${type}`] ? styles.open : ''
      } + ' ' + ${
        snapshot.activeMaterial &&
        snapshot.activeMaterial.model === `urn:${name}.${type}`
          ? styles.mactive
          : ''
      }`}
      onClick={() => {
        const value = {
          type,
          open: true,
          cachedModel: `urn:${name}.${type}`,
          isModif: false,
          model: `urn:${name}.${type}`
        };
        editorState.activeMaterial = value;
        editorContext.activeMaterialRef[value.model] = program;
        editorState.tabs[`urn:${name}.${type}`] = value;

        editorState.showUniforms = true

        editorState.showEditor = true;
        editorState.diffMode = false;
        editorState.obcMode = false;
        editorState.triggerUpdate++;
        checkIfModifications();
      }}
    >
      {type === 'frag' ? (
        <IoImageOutline className={editorcss.colorf} />
      ) : (
        <IoCubeOutline className={editorcss.colorv} />
      )}{' '}
      {name}.{type}{' '}
      {getModif(type) && <span className={styles.isModif}>M</span>}
    </li>
  );
};
