import React from 'react';
import { editorState } from '../../state';
// import { editorContext } from '../../.';
import styles from './tabs.module.css';
import editorcss from '../../editor.module.css';
import { IoCloseOutline } from 'react-icons/io5';
import { useProxy } from 'valtio';
import { IoImageOutline } from 'react-icons/io5';
import { IoCubeOutline } from 'react-icons/io5';
import { checkIfModifications } from '../../editor';

export const EditorTabs = () => {
  const snapshot = useProxy(editorState);
  const setActive = (value: any) => {
    if (editorState.obcMode || editorState.diffMode) {
      editorState.activeMaterial.model = editorState.activeMaterial.cachedModel;
      editorState.activeMaterial.cachedModel = null;
      editorState.diffMode = false;
      editorState.obcMode = false;
      editorState.triggerUpdate++;
    } else {
      editorState.activeMaterial = value
    }
   
    checkIfModifications();
  };
  const closeTab = (key: any) => {
    delete editorState.tabs[key];
    if (Object.keys(editorState.tabs).length === 0) {
      editorState.obcMode = false;
      editorState.diffMode = false;
      editorState.triggerUpdate++;
      return
    }
    let lastKey = Object.keys(editorState.tabs).pop()
    if (lastKey) {
      editorState.activeMaterial = editorState.tabs[lastKey]
    }
  };

  return (
    <div
      className={`${styles.tabs} ${
        snapshot.showEditor && snapshot.fullScreen ? styles.full : ''
      }`}
    >
      {Object.entries(snapshot.tabs).map(([key, value]: any) => {
        const name = value.model.replace('urn:', '')
        return (
          <div key={key}>
            <div
              className={
                key === snapshot.activeMaterial.model
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
              {`${name}`}{' '}
              <IoCloseOutline onClick={() => closeTab(value.model)} />
            </div>
            {/* <div onClick={() => {value.opened = false; setActive('vert')}}>{`${name}.vert`}  <IoCloseOutline onClick={() => {value.opened = false;}}/></div> */}
          </div>
        );
      })}
    </div>
  );
};
