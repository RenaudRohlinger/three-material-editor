import { ShaderChunk } from 'three';
import { editorContext } from '..';
import { editorState } from '../state';
import { commentedIncludeRegExp, includeRegExp } from './regex';

export const replaceShaderChunks = (code: string | undefined) => {
  if (typeof code !== 'string') {
    return
  }
  const format = code.replaceAll(
    includeRegExp,
    (_substring: any, _indent: any, name: any) => {
      let chunk = ShaderChunk[name];
      chunk = chunk.split('\n').map(line => line).join(`\n\t`);

      return `// #include <${name}>\n\t${chunk}\n//\n`;
    }
  );
  return format;
};

const _formatToObc = (code: string | undefined) => {
  if (typeof code !== 'string') {
    return
  }
  const resetIncludes = code
    .replaceAll(
      commentedIncludeRegExp,
      (_substring: any, _indent: any, name: any) => {
        return `#include <${name}>`;
      }
    )
    .trim();

  const result = resetIncludes.split(includeRegExp);

  var filtered = result.filter(function(el) {
    return el !== '';
  });
  return filtered;
};

export const generateHMRObc = (shader: any) => {
  if (!editorContext.monacoRef) {
    return ''
  }
  const model = editorState.activeMaterial.model;
  const oModel = editorContext.monacoRef.editor
    .getModel(model + '_orig')
    .getValue();
  const mModel = editorContext.monacoRef.editor.getModel(model).getValue();
  let newValue = oModel;
  // set back comments to #include
  const base = _formatToObc(oModel);
  const edited = _formatToObc(mModel);
  const result = new Map();
  if (!base || !edited) {
    return ''
  }
  for (let index = 0; index < base.length; index++) {
    const b = base[index];
    const e = edited[index];
    if (b !== e && Object.keys(e).length !== 0) {
      result.set(edited[index - 1], e);
    }
  }

  if (result.size > 0) {
    result.forEach((value: string, key: any) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <${key}>`,
        `${value}`
      );
    });
  }
  return newValue;
};

export const generateOBc = (_code: string | undefined) => {
  const model = editorState.activeMaterial.cachedModel;
  const type =
    editorState.activeMaterial.type === 'frag'
      ? 'fragmentShader'
      : 'vertexShader';
  const oModel = editorContext.monacoRef.editor
    .getModel(model + '_orig')
    .getValue();
  const mModel = editorContext.monacoRef.editor.getModel(model).getValue();

  const base = _formatToObc(oModel);
  const edited = _formatToObc(mModel);
  const result = new Map();
  if (!base || !edited) {
    return ''
  }
  for (let index = 0; index < base.length; index++) {
    const b = base[index];
    const e = edited[index];
    if (b !== e) {
      result.set(edited[index - 1], e);
    }
  }
  let onBeforeCompileFunction = `// generated using three-material-editor\nmaterial.onBeforeCompile = (shader) => {\n`;
  result.forEach((value: string, key: any) => {
    // minify
    const valueFormated =
      value.length > 500 ? value.trim().replace(/(\r\n|\n|\r)/gm, '') : value;
    onBeforeCompileFunction += `${
      value.length > 500 ? '\t// > 500 characters - auto minified\n' : ''
    }\tshader.${type} = shader.${type}.replace(\`#include <${key}>\`, \`${valueFormated} \`);\n`;
  });
  onBeforeCompileFunction += `}\n`;

  editorState.obcMode = true;
  editorState.triggerUpdate++;
  return onBeforeCompileFunction;
};
