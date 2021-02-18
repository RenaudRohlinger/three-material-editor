import React from 'react';
import { editorState } from '../../state';
import { useProxy } from 'valtio';

import { AiOutlineFullscreen } from 'react-icons/ai';
import { BiDockRight } from 'react-icons/bi';
import { BsArrowBarRight } from 'react-icons/bs';
import { BsArrowBarLeft } from 'react-icons/bs';
import styles from './menu.module.css';

export const HeadMenu = () => {
  const snapshot = useProxy(editorState);

  return (
    <div key={snapshot.triggerUpdate} className={styles.mhead}>
      {editorState.showEditor && editorState.fullScreen && (
        <BiDockRight
          onClick={() => {
            editorState.fullScreen = false;
          }}
        />
      )}
      {editorState.showEditor && !editorState.fullScreen && (
        <AiOutlineFullscreen
          onClick={() => {
            editorState.fullScreen = true;
          }}
        />
      )}
      <div
        onClick={() => {
          editorState.showEditor = !editorState.showEditor;
          editorState.diffMode = false;
        }}
      >
        {snapshot.showEditor ? <BsArrowBarRight /> : <BsArrowBarLeft />}
      </div>
    </div>
  );
};
