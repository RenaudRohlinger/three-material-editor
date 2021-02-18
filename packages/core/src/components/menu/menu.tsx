import React from 'react';
import { editorContext } from '../../.';
import { editorState } from '../../state';
import { useProxy } from 'valtio';

import { useDrag } from 'react-use-gesture';
import styles from './menu.module.css';
import { SubMenu } from './menuSub';
import { HeadMenu } from './menuHead';
import { BottomAction } from './menuActions';
import { UniformsMenu } from './menuUniforms';

export const Menu = () => {
  const snapshot = useProxy(editorState);
  let editorWidth = editorContext.editorWidth;
  let editorHeight = editorContext.editorMinusHeight;
  const menuSize = 160

  const bind = useDrag(({ down, delta: [mx, my] }) => {
    if (editorState.fullScreen) {
      return;
    }
    if (down && typeof window !== 'undefined') {
      editorWidth -= editorWidth - mx > window.innerWidth - menuSize ? 0 : mx
      editorHeight -= editorHeight - my < 0 ? 0 : my

      editorContext.dom.current.style.setProperty(
        '--editor-width', editorWidth + 'px'
      );
      editorContext.dom.current.style.setProperty(
        '--editor-minus-height', editorHeight + 'px'
      );
    } else {
      if (typeof window !== 'undefined') {
        if (window.innerWidth - editorWidth < 200) { editorWidth = window.innerWidth - menuSize}
        if (editorHeight < 40) { editorHeight = 0}
        editorContext.dom.current.style.setProperty(
          '--editor-width', editorWidth + 'px'
        );
        editorContext.dom.current.style.setProperty(
          '--editor-minus-height', editorHeight + 'px'
        );
      }
      editorContext.editorWidth = editorWidth;
      editorContext.editorMinusHeight = editorHeight;
    }
  });
  return editorContext.programs.length > 0 ? (
    <div
      className={`${styles.menu} ${!snapshot.showEditor ? styles.menurh : ''} ${
        snapshot.showEditor && snapshot.fullScreen ? styles.full : ''
      }`}
      {...bind()}
      style={{ touchAction: 'none' }}
    >
      <HeadMenu />
      <div key={snapshot.triggerUpdate} className={styles.menulist}>
        {editorContext.programs.map((value: any, key: any) => {
          return <SubMenu program={value} key={key.toString()} />;
        })}
      </div>
      <UniformsMenu />
      <BottomAction />
    </div>
  ) : null;
};
