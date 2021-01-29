import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useProxy } from 'valtio';
import styles from './editor.module.css';
import { editorContextState, editorState } from './state';

export const FullScreen = () => {
  const snapshot = useProxy(editorState);
  const embed = useRef<any>(null);
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.left = '0';
  div.style.right = '0';
  div.style.bottom = '0';
  div.style.top = '0';
  const [el] = useState(() => div);
  const element = editorContextState.gl.domElement;

  useEffect(() => {
    if (el && embed.current) {
      document.body.appendChild(el);

      el.appendChild(element);
      embed.current.appendChild(editorContextState.gl.domElement);
      return () => {
        // if (el) document.body.removeChild(el);
        // unmountComponentAtNode(el);
      };
    }
    return undefined;
  }, [el, element]);

  // use drag https://codesandbox.io/s/rkgzi?file=/src/index.js
  return createPortal(
    <div
      ref={embed}
      className={`${styles.embed} ${
        !snapshot.diffMode && snapshot.fullScreen && snapshot.showEditor
          ? styles.embedfull
          : ''
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="54"
        height="14"
        viewBox="0 0 54 14"
      >
        <g fill="none" fillRule="evenodd" transform="translate(1 1)">
          <circle
            cx="6"
            cy="6"
            r="6"
            fill="#FF5F56"
            stroke="#E0443E"
            strokeWidth=".5"
          ></circle>
          <circle
            cx="26"
            cy="6"
            r="6"
            fill="#FFBD2E"
            stroke="#DEA123"
            strokeWidth=".5"
          ></circle>
          <circle
            cx="46"
            cy="6"
            r="6"
            fill="#27C93F"
            stroke="#1AAB29"
            strokeWidth=".5"
          ></circle>
        </g>
      </svg>
      <div className={styles.embedglass}></div>
    </div>,
    el
  );
};
