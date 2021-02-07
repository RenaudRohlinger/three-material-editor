import React from 'react';
import { getNameForEditorMaterial } from '../../helpers/shaderToMaterial';
import { editorState } from '../../state';
import { editorContext } from '../../.';
import styles from './tabs.module.css';
import editorcss from '../../editor.module.css';
import { IoCloseOutline } from 'react-icons/io5';
import { useProxy } from 'valtio';
import { IoImageOutline } from 'react-icons/io5';
import { IoCubeOutline } from 'react-icons/io5';
// import { checkIfModifications } from '../../editor';

export const EditorTabs = () => {
  const snapshot = useProxy(editorState);
  const setActive = (value: any) => {
    if (editorState.obcMode) {
      editorState.activeMaterial.model = editorContext.activeMaterial.cachedModel;
      editorContext.activeMaterial.model = editorContext.activeMaterial.cachedModel;
    }
    editorState.activeMaterial = value;
    editorContext.activeMaterial = value;

    editorState.obcMode = false;
    editorState.diffMode = false;
    editorState.triggerUpdate++;
  };
  const closeTab = (value: any) => {
    delete editorState.tabs[value.model];
  };

  return (
    <div
      className={`${styles.tabs} ${
        snapshot.showEditor && snapshot.fullScreen ? styles.full : ''
      }`}
    >
      {Object.entries(snapshot.tabs).map(([key, value]: any) => {
        const material = value.ref.material;
        const program = value.ref.program;
        const name = getNameForEditorMaterial(material, program)

        return (
          <div key={key}>
            <div
              className={
                value.model === snapshot.activeMaterial.model
                  ? styles.tactive
                  : ''
              }
              onClick={() => {
                setActive(value);
              }}
            >
              {value.type === 'frag' ? (
                <IoImageOutline className={editorcss.colorf} />
              ) : (
                <IoCubeOutline className={editorcss.colorv} />
              )}{' '}
              {`${name}.${value.type}`}{' '}
              <IoCloseOutline onClick={() => closeTab(value)} />
            </div>
            {/* <div onClick={() => {value.opened = false; setActive('vert')}}>{`${name}.vert`}  <IoCloseOutline onClick={() => {value.opened = false;}}/></div> */}
          </div>
        );
      })}
    </div>
  );
};
