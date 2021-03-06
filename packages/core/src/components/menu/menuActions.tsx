import React from 'react';
import { editorState } from '../../state';
import { useProxy } from 'valtio';

import { getNameForEditorMaterial } from '../../helpers/shaderToMaterial';

import { AiOutlineFunction } from 'react-icons/ai';
import { VscCompareChanges } from 'react-icons/vsc';
import { HiOutlineClipboardCopy } from 'react-icons/hi';
import { BiEraser } from 'react-icons/bi';

import styles from './menu.module.css';
import { editorContextState as editorContext } from '../../state';


export const BottomAction = () => {
  const snapshot = useProxy(editorState);
  let isShader = false;
  if (!editorContext.monacoRef || !editorState.activeMaterial.model) {
    return null;
  }
  let activeMat = editorContext.activeMaterialRef[editorState.activeMaterial.model]
  if ( activeMat && activeMat.material) {
    isShader = activeMat.material.type === ('ShaderMaterial' || 'RawShaderMaterial');
  }

  if (editorState.obcMode && editorState.activeMaterial.cachedModel) {
    activeMat = editorContext.activeMaterialRef[editorState.activeMaterial.cachedModel]
  }
  
  if (!activeMat) {
    return null
  }
  const material: any = activeMat.material;

  const cancelChange = () => {
    const type = editorState.activeMaterial.type;
    const program: any = activeMat.program;
    const name = getNameForEditorMaterial(material, program)

    const oModel = editorContext.monacoRef.editor.getModel(
      `urn:${name}.${type}_orig`
    );
    const model = editorContext.monacoRef.editor.getModel(
      `urn:${name}.${type}`
    );
    if (model) {
      model.setValue(oModel.getValue());
    }
    editorState.activeMaterial.isModif = false;
  };

  const openObcMode = () => {
    editorState.activeMaterial.cachedModel = editorState.activeMaterial.model + '';
    setTimeout(() => {
      editorState.activeMaterial.model = 'urn:obc_result';
      editorState.showEditor = true;
      editorState.diffMode = false;
      editorState.obcMode = true;
    }, 0);
  };
  const closeObcMode = () => {
    editorState.activeMaterial.model = editorState.activeMaterial.cachedModel;
    editorState.activeMaterial.cachedModel = null;
    editorState.diffMode = false;
    editorState.obcMode = false;
    editorState.triggerUpdate++;
  };
  return snapshot.activeMaterial && snapshot.activeMaterial.isModif && snapshot.showEditor && material ? (
    <div key={snapshot.triggerUpdate} className={styles.menub}>
      {snapshot.obcMode && (
        <div
          className={`${styles.menubaction}`}
          onClick={() => {
            editorContext.editor.trigger(
              'source',
              'editor.action.clipboardCopyAction'
            );
          }}
        >
          <HiOutlineClipboardCopy /> Copy
        </div>
      )}
      {!snapshot.diffMode && !snapshot.obcMode && (
        <div
          className={styles.menubaction}
          onClick={() => {
            editorState.diffMode = true;
          }}
        >
          <VscCompareChanges /> Analyze diff
        </div>
      )}
      {snapshot.diffMode && !snapshot.obcMode && (
        <div
          className={`${styles.menubaction} ${styles.closemenubaction}`}
          onClick={() => {
            editorState.diffMode = false;
          }}
        >
          <VscCompareChanges /> Close diff
        </div>
      )}
      {!isShader && !snapshot.diffMode && !snapshot.obcMode && material && !material.isEffect && (
        <div
          className={styles.menubaction}
          onClick={() => {
            openObcMode();
          }}
        >
          <AiOutlineFunction /> onBeforeCompile
        </div>
      )}
      {!isShader && snapshot.obcMode && material && !material.isEffect && (
        <div
          className={`${styles.menubaction} ${styles.closemenubaction}`}
          onClick={() => {
            closeObcMode();
          }}
        >
          <AiOutlineFunction /> onBeforeCompile
        </div>
      )}
      {!snapshot.obcMode && !snapshot.diffMode && (
        <div
          className={`${styles.menubaction} ${styles.closemenubaction} ${styles.resetmenub}`}
          onClick={cancelChange}
        >
          <BiEraser /> Reset shader
        </div>
      )}
    </div>
  ) : null;
};