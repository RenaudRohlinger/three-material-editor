import React, { useState, VFC } from 'react';
import { getNameForEditorMaterial } from '../../helpers/shaderToMaterial';
import { editorState } from '../../state';
import { useProxy } from 'valtio';

import { IoEyeOutline } from 'react-icons/io5';
import { IoEyeOffOutline } from 'react-icons/io5';
import { RiArrowDownSFill } from 'react-icons/ri';
import { RiArrowRightSFill } from 'react-icons/ri';
import styles from './menu.module.css';
import { IoCubeOutline } from 'react-icons/io5';
import { LiMenu } from './menuLi';

interface SubMenuProps {
  program: any;
}

export const SubMenu: VFC<SubMenuProps> = ({ program }) => {
  const snapshot = useProxy(editorState);
  const [open, set] = useState(true);
  const material = program.material;
  const programGl = program.program;
  if (!programGl) {
    return null
  }
  const name = getNameForEditorMaterial(material, programGl)

  const hide = (e: any) => {
    e.stopPropagation();
    
    // TODO PP LIBS renderToScreen or pass.enabled
    material.visible = !material.visible;
    material.enabled = !material.enabled;
    material.needsUpdate = true;
    editorState.triggerUpdate++;
  };
  return programGl && material ? (
    <div key={snapshot.triggerUpdate} className={open ? styles.sbopen : ''}>
      <div
        className={`${styles.hmenu} ${
          snapshot.tabs[`urn:${name}.frag`] || snapshot.tabs[`urn:${name}.vert`]
            ? styles.open
            : ''
        }`}
        onClick={() => {
          set(!open);
        }}
      >
        {open ? <RiArrowDownSFill /> : <RiArrowRightSFill />} {name}
        {material && material.numberOfMaterialsUser > 1 && (
          <span className={styles.multiusers}>
            <IoCubeOutline />
            <small>{material.numberOfMaterialsUser}</small>
          </span>
        )}
        {(material && !material.visible && !material.isEffect ? (
          <IoEyeOffOutline onClick={hide} className={styles.eye} />
        ) : (
          <IoEyeOutline onClick={hide} className={styles.eye} />
        ))}
      </div>
      {open && (
        <ul>
          {material.fragmentShader && <LiMenu program={program} type={'frag'} />}
          {material.vertexShader && <LiMenu program={program} type={'vert'} />}
        </ul>
      )}
    </div>
  ) : null;
};