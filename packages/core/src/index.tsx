import React, { VFC } from 'react';
import { MaterialEditor } from './editor';
import { traverseMaterialsToProgram } from './middleware';
import { editorState as state, editorContextState } from './state';

interface Props {
  className?: any;
  position?: string | undefined;
}
/**
 * Core components
 */
export let EditorDom: VFC<Props> = () => null;
export let editorState: any = {};
export let editorContext: any = {};
export let materialsToProgram: any = {};

if (process.env.NODE_ENV === 'development' || process.env.TME_PROD === 'SHOW') {
  EditorDom = () => {
    return <MaterialEditor />;
  };
  editorState = state;
  editorContext = editorContextState;
  materialsToProgram = traverseMaterialsToProgram;
}
