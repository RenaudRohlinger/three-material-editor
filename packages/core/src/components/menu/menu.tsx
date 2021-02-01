import React, { useState, VFC } from 'react';
import { editorContext } from '../../.';
import { getTypeForMaterial } from '../../helpers/shaderToMaterial';
import { editorState } from '../../state';
import { useProxy } from 'valtio';
import { IoEyeOutline } from 'react-icons/io5';
import { IoEyeOffOutline } from 'react-icons/io5';
import { IoImageOutline } from 'react-icons/io5';
import { IoCubeOutline } from 'react-icons/io5';
import { RiArrowDownSFill } from 'react-icons/ri';
import { RiArrowRightSFill } from 'react-icons/ri';
import { AiOutlineFunction } from 'react-icons/ai';
import { VscCompareChanges } from 'react-icons/vsc';
import { HiOutlineClipboardCopy } from 'react-icons/hi';
import { BiEraser } from 'react-icons/bi';

import { AiOutlineFullscreen } from 'react-icons/ai';
import { BiDockRight } from 'react-icons/bi';
import { BsArrowBarRight } from 'react-icons/bs';
import { BsArrowBarLeft } from 'react-icons/bs';

import { useDrag } from 'react-use-gesture';
import editorcss from '../../editor.module.css';
import styles from './menu.module.css';
import { checkIfModifications } from '../../editor';

interface LiMenuProps {
  type: string;
  program: any;
}

export const LiMenu: VFC<LiMenuProps> = ({ type, program }) => {
  const snapshot = useProxy(editorState);
  const programGl = program.program;

  const name = getTypeForMaterial(programGl.name) + '_' + programGl.id;
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
          ref: program,
          type,
          open: true,
          isModif: false,
          model: `urn:${name}.${type}`,
        };
        editorState.tabs[`urn:${name}.${type}`] = value;
        editorState.activeMaterial = value;
        editorContext.activeMaterial = value;
        editorState.showEditor = true;
        editorState.diffMode = false;
        editorState.obcMode = false;
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
  const name = getTypeForMaterial(programGl.name) + '_' + programGl.id;

  const hide = (e: any) => {
    e.stopPropagation();
    
    material.visible = !material.visible;
    material.needsUpdate = true;
    editorState.triggerUpdate++;
  };
  return programGl ? (
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
        {material && !material.visible ? (
          <IoEyeOffOutline onClick={hide} className={styles.eye} />
        ) : (
          <IoEyeOutline onClick={hide} className={styles.eye} />
        )}
      </div>
      {open && (
        <ul>
          <LiMenu program={program} type={'frag'} />
          <LiMenu program={program} type={'vert'} />
        </ul>
      )}
    </div>
  ) : null;
};
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

export const BottomAction = () => {
  const snapshot = useProxy(editorState);
  let isShader = false;
  if (!editorContext.monacoRef) {
    return null;
  }
  if (
    editorState.activeMaterial.ref &&
    editorState.activeMaterial.ref.material
  ) {
    isShader =
      editorState.activeMaterial.ref.material.type ===
      ('ShaderMaterial' || 'RawShaderMaterial');
  }
  const cancelChange = () => {
    const type = editorState.activeMaterial.type;
    const program: any = editorState.activeMaterial.ref.program;
    const name = getTypeForMaterial(program.name) + '_' + program.id;

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
    editorState.activeMaterial.cachedModel =
      editorState.activeMaterial.model + '';
    editorContext.activeMaterial.cachedModel =
      editorState.activeMaterial.model + '';
    editorState.activeMaterial.model = 'urn:obc_result';
    editorContext.activeMaterial.model = 'urn:obc_result';
    editorState.showEditor = true;
    editorState.diffMode = false;
    editorState.obcMode = true;
  };
  const closeObcMode = () => {
    editorState.activeMaterial.model = editorState.activeMaterial.cachedModel;
    editorContext.activeMaterial.model =
      editorContext.activeMaterial.cachedModel;
    editorState.diffMode = false;
    editorState.obcMode = false;
    editorState.triggerUpdate++;
  };

  return snapshot.activeMaterial && snapshot.activeMaterial.isModif && snapshot.showEditor ? (
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
      {!isShader && !snapshot.diffMode && !snapshot.obcMode && (
        <div
          className={styles.menubaction}
          onClick={() => {
            openObcMode();
          }}
        >
          <AiOutlineFunction /> onBeforeCompile
        </div>
      )}
      {!isShader && snapshot.obcMode && (
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
      <BottomAction />
    </div>
  ) : null;
};
