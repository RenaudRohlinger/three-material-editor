// TODO MOVE CODE

import { ShaderChunk } from 'three';

const aliases = {
  lightsBegin: '?#include <lights_fragment_maps>',
  lightsEnd: '?#include <aomap_fragment>',
  colorBegin: '?#include <logdepthbuf_fragment>',
  colorEnd: '?#include <tonemapping_fragment>',
  transformBegin: '?#include <morphtarget_vertex>',
  transformEnd: '?#include <project_vertex>',
};

function applyPatches(chunk, map) {
  for (let name in map) {
    const value = map[name];

    if (aliases[name] !== undefined) name = aliases[name];

    if (value instanceof Object) {
      if (ShaderChunk[name] === undefined) {
        console.error(
          'THREE.ShaderMaterial.extend: ShaderChunk "%s" not found',
          name
        );
      } else {
        chunk = chunk.replace(
          '#include <' + name + '>',
          applyPatches(ShaderChunk[name], value)
        );
      }
    } else {
      if (name[0] === '@') {
        // Replace

        const line = name.substr(1);

        chunk = chunk.replace(line, value);
      } else if (name[0] === '?') {
        // Insert before

        const line = name.substr(1);

        chunk = chunk.replace(line, value + '\n' + line);
      } else {
        // Insert after

        if (!chunk) {
          console.error("THREE.patchShader: chunk not found '%s'", name);
        } else {
          chunk = chunk.replace(name, name + '\n' + value);
        }
      }
    }
  }

  return chunk;
}

export function mixOnBeforeCompile(shader: any, object: any) {
  let header = (object.header || '') + '\n';
  let vertexShader = (object.vertexHeader || '') + '\n' + shader.vertexShader;
  let fragmentShader =
    (object.fragmentHeader || '') + '\n' + shader.fragmentShader;

  vertexShader = vertexShader.replace(
    /\}(?=[^.]*$)/g,
    object.vertexEnd + '\n}'
  );

  fragmentShader = fragmentShader.replace(
    /\}(?=[^.]*$)/g,
    object.fragmentEnd + '\n}'
  );

  // Insert or replace lines (@ to replace)

  if (object.vertex !== undefined)
    vertexShader = applyPatches(vertexShader, object.vertex);

  if (object.fragment !== undefined)
    fragmentShader = applyPatches(fragmentShader, object.fragment);

  shader.vertexShader = header + vertexShader;
  shader.fragmentShader = header + fragmentShader;
  return shader;
}
