import React, { FC, VFC, useEffect, useState, useRef, useLayoutEffect } from 'react';
import styles from './editor.module.css';
import { editorContextState, editorState } from './state';
import { editorContext } from '.';
import { useProxy } from 'valtio';
import { replaceShaderChunks, generateOBc } from './helpers/formatter';

import Editor, { DiffEditor, loader } from '@monaco-editor/react';
import * as shaderLanguage from './cshader';
import { EditorTabs } from './components/tabs/tabs';
import { Menu } from './components/menu/menu';
import { FullScreen } from './fullscreen';
import { getNameForEditorMaterial } from './helpers/shaderToMaterial';
import Monokai from './helpers/themes/Monokai.json';

// const epoch = Date.now();

export const checkIfModifications = () => {
  const oModel = editorContext.monacoRef.editor.getModel(
    editorState.activeMaterial.model + '_orig'
  );
  const mModel = editorContext.monacoRef.editor.getModel(
    editorState.activeMaterial.model
  );
  if (oModel && mModel) {
    var origin = oModel.getValue();
    var modif = mModel.getValue();
  }
  editorState.activeMaterial.isModif = origin !== modif;
};
export const updateActiveShader = (value: any, type: string) => {
  if (!editorState.activeMaterial.model) {
    return
  }
  const activeMat = editorContext.activeMaterialRef[editorState.activeMaterial.model]
  const material: any = activeMat.material;

  editorContext.monacoRef.editor.setModelMarkers(
    editorContext.editor.getModel(),
    editorState.activeMaterial.model,
    value
  );
  if (material) {
    if (material.isEffect) {
      material.vertexShader = type === 'vert' ? value : material.vertexShader;
      material.fragmentShader = type === 'frag' ? value : material.fragmentShader;
      activeMat.effect.recompile(editorContext.gl)
    } else {
      material.editorOnBeforeCompile = (shader: any) => {
        shader.vertexShader = type === 'vert' ? value : material.vertexShader;
        shader.fragmentShader = type === 'frag' ? value : material.fragmentShader;
      };
    }
 

    checkIfModifications();
    // if (type === 'vert') {
    //   material.setOption({
    //     vertexMainOutro: value
    //   })
    // } else if (type === 'frag') {
    //   material.setOption({
    //     fragmentColorTransform: value
    //   })

    material.needsUpdate = true;
    editorState.triggerUpdate++;
    material.customProgramCacheKey = () => {
      return editorState.triggerUpdate
    };
  }
};

export const MaterialEditor: FC = () => {
  const [instanceReady, setinstanceReady] = useState(false)
  useLayoutEffect(() => {
    if (typeof window !== "undefined" && !editorContext.monacoRef) {
      loader
        .init()
        .then(monacoInstance => {
          editorContext.monacoRef = monacoInstance;
          editorContext.monacoRef.editor.defineTheme('monokai', Monokai);
          setinstanceReady(true)
          monacoInstance.languages.register({ id: 'cshader' });
          monacoInstance.languages.setLanguageConfiguration(
            'cshader',
            shaderLanguage.conf
          );
          monacoInstance.languages.setMonarchTokensProvider(
            'cshader',
            shaderLanguage.language
          );
        })
        .catch(error =>
          console.error('An error occurred during initialization of Monaco: ', error)
        );
    }
    
  })

  return <>{instanceReady && <EditorDom />}</>;
};

const handleEditorValidation = () => {
  const diagnostics: any = editorState.diagnostics;
  if (!editorState.activeMaterial.model) {
    return
  }
  const material: any = editorContext.activeMaterialRef[editorState.activeMaterial.model].material;
  if (diagnostics && diagnostics.fragmentShader && !diagnostics.runnable && editorContext.monacoRef) {
    const error =
      diagnostics.fragmentShader.log === ''
        ? diagnostics.vertexShader
        : diagnostics.fragmentShader;
    const errs: string[] = error.log.split('\n');
    // to count the margin
    const prefix: string[] = error.prefix.split('\n');

    errs.pop();
    let errorfromEffectAdjust = 0
    const markets = errs.map(err => {
      if (material && material.isEffect && editorContext.editor) {
        const type = editorState.activeMaterial.type;

        const getVoidEffectLine = type === 'frag' ? `e${material.id}MainImage` : `e${material.id}MainUv`
        const fullProg = type === 'frag' ? diagnostics.frag : diagnostics.vert
        const progArr: string[] = fullProg.split('\n');
        errorfromEffectAdjust = progArr.findIndex((el) => {
         return el.includes(getVoidEffectLine)
        })
        const model = editorContext.editor.getModel()
        if (model) {
          const editorTxtArr: string[] = model.getValue().split('\n');
          const getVoidEditorLine = type === 'frag' ? `mainImage` : `mainUv`
          const adjustUniforms = editorTxtArr.findIndex((el) => {
            return el.includes(getVoidEditorLine)
          })
          errorfromEffectAdjust -= adjustUniforms
        }
      }

      const re = new RegExp('[^0-9]+ ([0-9]+):([0-9]+):');
      const rl: any = err.match(re) || [];

      const message = err.split(':');
      message[2] = (parseInt(message[2]) - (material.isEffect ? errorfromEffectAdjust : prefix.length) || '').toString();

      const pos = parseInt(rl[1] || 1);
      const lin = parseInt(rl[2] || 1) - (material.isEffect ? errorfromEffectAdjust : prefix.length);
      return {
        startLineNumber: lin,
        startColumn: pos,
        endLineNumber: lin,
        endColumn: 1000,
        message: message.join(':'),
        severity: editorContext.monacoRef.MarkerSeverity.Error,
      };
    });
    editorContext.monacoRef.editor.setModelMarkers(
      editorContext.editor.getModel(),
      editorState.activeMaterial.model,
      markets
    );
  }
};
export const HandleError = () => {
  const snapshot = useProxy(editorState);

  useEffect(() => {
    // const diagnostics: any = snapshot.diagnostics
    // if (diagnostics && diagnostics.fragmentShader && !diagnostics.runnable) {
    handleEditorValidation();
    // }
  }, [snapshot.diagnostics]);
  return null;
};

const EditorDom = () => {
  const dom = useRef(null);
  const snapshot = useProxy(editorState);
  editorContext.dom = dom;

  return (
    <div
      ref={dom}
      className={`${styles.editor_c} ${
        snapshot.showEditor ? '' : styles.editor_h
      } ${snapshot.showEditor && snapshot.fullScreen ? styles.full : ''} ${
        editorState.className
      }`}
    >
      <Menu />
      {editorContextState.gl && <FullScreen />}
      {snapshot.showEditor && <EditorText />}
    </div>
  );
};

const EditorEdit = () => {
  const snapshot = useProxy(editorState);
  const [isEditorReady, setIsEditorReady] = useState(false);

  function handleEditorDidMount(editor: any, _: any) {
    editorContext.editor = editor;
    setIsEditorReady(true);
  }

  useEffect(() => {
    // at initialization of any new active material set the 2 models
    if (editorState.activeMaterial && editorContext.activeMaterialRef && editorContext.monacoRef && editorState.activeMaterial.model) {
      const type = editorState.activeMaterial.type;
      const activeMat = editorContext.activeMaterialRef[editorState.activeMaterial.model]
      if (!activeMat) {
        return
      }
      const material: any = activeMat.material;
      const program: any = activeMat.program;

      if (isEditorReady && material) {
        const name = getNameForEditorMaterial(material, program)

        let textContent: string | undefined;
        if (type === 'frag') {
          textContent = replaceShaderChunks(material.fragmentShader);
        } else {
          textContent = replaceShaderChunks(material.vertexShader);
        }

        if (
          !editorContext.monacoRef.editor.getModel(`urn:${name}.${type}_orig`)
        ) {
          editorContext.monacoRef.editor.createModel(
            textContent,
            'cshader',
            `urn:${name}.${type}_orig`
          );
          // TODO ADD OPTION
          if (material.type !== 'ShaderMaterial' && material.type !== 'RawShaderMaterial' && !material.isEffect) {
            editorContext.editor.trigger('fold', 'editor.foldLevel1');
          }
        }
      }
    }
  }, [isEditorReady, snapshot.activeMaterial, editorContext.monacoRef]);

  const getText = () => {
    if (!editorState.activeMaterial.model) {
      return ''
    }
    let textContent: string | undefined;
    const type = editorState.activeMaterial.type;
    const model = editorState.activeMaterial.model;
    const activeMat = editorContext.activeMaterialRef[editorState.activeMaterial.model];
    if (activeMat) {
      const program = activeMat.program;
      const material: any = activeMat.material;
  
      if (type === 'frag') {
        textContent = replaceShaderChunks(material ? material.fragmentShader : program.fragmentShader);
      } else if (type === 'vert') {
        textContent = replaceShaderChunks(material ? material.vertexShader : program.vertexShader);
      }
    }

    if (model === 'urn:obc_result' && editorState.obcMode) {
      const result = generateOBc(textContent)
      if (editorContext.monacoRef.editor.getModel('urn:obc_result')) {

        editorContext.monacoRef.editor.getModel('urn:obc_result').setValue(result)
      }
      return result;
    }

    return textContent;
  };

  return (
    <Editor
      className={styles.editor}
      language="cshader"
      theme={'vs-dark'}
      onMount={handleEditorDidMount}
      height={'100%'}
      keepCurrentModel={true}
      path={snapshot.activeMaterial.model + ''}
      defaultLanguage={
        snapshot.activeMaterial.model === 'urn:obc_result'
          ? 'javascript'
          : 'cshader'
      }
      defaultValue={getText()}
      onChange={frag => {
        if (editorState.obcMode) {
          return false;
        }
        updateActiveShader(frag, snapshot.activeMaterial.type);
        return false;
      }}
      // onValidate={handleEditorValidation}
      options={{
        formatOnType: true,
        foldingHighlight: false,
        folding: true,
        foldingStrategy: 'auto'
      }}
    />
  );
};

const GetDiff = () => {
  const model: any = editorState.activeMaterial.model;
  const [isEditorReady, setIsEditorReady] = useState(false);

  function handleEditorDidMount(editor: any, _: any) {
    editorContext.diffEditor = editor;
    setIsEditorReady(true);
  }

  var originalModel = editorContext.monacoRef.editor.getModel(model + '_orig');
  var modifiedModel = editorContext.monacoRef.editor.getModel(model);

  useEffect(() => {
    if (isEditorReady) {
      if (!editorContext.monacoRef.editor.getModel('diff_1')) {
        editorContext.monacoRef.editor.createModel(
          originalModel.getValue(),
          'cshader',
          `diff_1`
        );
      }
      if (!editorContext.monacoRef.editor.getModel('diff_2')) {
        editorContext.monacoRef.editor.createModel(
          modifiedModel.getValue(),
          'cshader',
          `diff_2`
        );
      }
      editorContext.diffEditor.setModel({
        original: editorContext.monacoRef.editor.getModel('diff_1'),
        modified: editorContext.monacoRef.editor.getModel('diff_2'),
      });

    
    }
    return () => {
      if (
        editorContext.editor.getModel() &&
        editorContext.diffEditor.getModel().modified.getValue()
      ) {
        // send the update in the diff to the basic text editor
        editorContext.monacoRef.editor
          .getModel(editorState.activeMaterial.model)
          .setValue(editorContext.diffEditor.getModel().modified.getValue());
      }
      var navi = editorContext.monacoRef.editor.createDiffNavigator(editorContext.diffEditor, {
        followsCaret: true, // resets the navigator state when the user selects something in the editor
        ignoreCharChanges: true // jump from line to line
      });
      navi.next()
    };
    
  }, [isEditorReady, modifiedModel, originalModel]);

  return (
    <DiffEditor
      className={styles.editor}
      onMount={handleEditorDidMount}
      theme={'vs-dark'}
      height={'100%'}
      options={{
        formatOnType: true,
      }}
    />
  );
};
const EditorText: VFC = () => {
  const snapshot = useProxy(editorState);
  // implement multi-tab for vertex and frag using createModel
  return snapshot.showEditor ? (
    <>
      {snapshot.activeMaterial.type && (
        <>
          <HandleError />
          <EditorTabs />
        </>
      )}

      {Object.keys(snapshot.tabs).length > 0 && <EditorEdit />}
      {snapshot.showEditor &&
        snapshot.diffMode &&
        snapshot.activeMaterial.type && <GetDiff />}
    </>
  ) : null;
};

export default MaterialEditor;
