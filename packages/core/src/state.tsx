import { Material, Scene } from 'three';
import { proxy } from 'valtio';
import { devtools } from 'valtio/utils';

export interface State {
  showMenu: boolean;
  showEditor: boolean;
  fullScreen: boolean;
  className: string;
  diffMode: boolean;
  showUniforms: boolean;
  obcMode: boolean;
  triggerUpdate: number;
  length: number;
  scene: Scene | null;
  diagnostics: any | null;
  composer: any | null;
  materials: Material[];
  tabs: any;
  activeMaterial: {
    type: string;
    open: boolean;
    cache?: any;
    isModif: boolean;
    model?: null | string;
    cachedModel?: null | string;
  };
}

export const editorState = proxy<State>({
  className: '',
  showMenu: false,
  showEditor: false,
  showUniforms: false,
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
  },
});
devtools(editorState, 'material editor');

interface Map {
  [key: string]: any;
}

export const editorContextState: Map = {
  materials: {},
  activeMaterialRef: {},
  programs: [],
  editorWidth: 520,
  editorMinusHeight: 0,
  gl: null,
};
