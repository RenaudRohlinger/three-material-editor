import { Material, Scene } from 'three';
import { proxy } from 'valtio';
import { devtools } from 'valtio/utils';

export interface State {
  showMenu: boolean;
  showEditor: boolean;
  fullScreen: boolean;
  className: string;
  diffMode: boolean;
  obcMode: boolean;
  triggerUpdate: number;
  length: number;
  scene: Scene | null;
  diagnostics: object | null;
  composer: any | null;
  materials: Material[];
  programs: object[];
  tabs: any;
  activeMaterial: {
    type: string;
    open: boolean;
    cache?: any;
    isModif: boolean;
    model?: null | string;
    cachedModel?: null | string;
    ref: {
      material: Material | null;
      program: any;
    };
  };
}

export const editorState = proxy<State>({
  className: '',
  showMenu: false,
  showEditor: false,
  fullScreen: true,
  diffMode: false,
  obcMode: false,
  length: 0,
  triggerUpdate: 0,
  scene: null,
  composer: null,
  materials: [],
  diagnostics: {},
  tabs: {},
  programs: [],
  activeMaterial: {
    type: '',
    open: false,
    model: null,
    cachedModel: null,
    isModif: false,
    cache: {
      vert: '',
      frag: '',
    },
    ref: {
      material: null,
      program: null,
    },
  },
});
devtools(editorState, 'material editor');

interface Map {
  [key: string]: any;
}

export const editorContextState: Map = {
  materials: {},
  programs: [],
  editorWidth: 520,
  editorMinusHeight: 0,
  gl: null,
};
