import {
  getShaderLibForMaterial,
  getShaderWithObc,
} from './shaderToMaterial';

export const addShaderDebugMaterial = (material: any) => {
  let newMaterial = material;

  const type: any = getShaderLibForMaterial(material);
  if (type) {
    newMaterial.uniforms = type.uniforms;
    newMaterial.vertexShader = type.vertexShader;
    newMaterial.fragmentShader = type.fragmentShader;
  }

  const epoch = Date.now();

  newMaterial = Object.assign(newMaterial, getShaderWithObc(newMaterial));
  newMaterial.onBeforeCompile = function (shader: any) {
    // initialize with the oBC of the material 
    // @ts-ignore
    if (this.editorOnBeforeCompile) {
      // @ts-ignore
      this.editorOnBeforeCompile.call(this, shader)
    } else {
      // override with the editor
      shader.vertexShader = newMaterial.vertexShader;
      shader.fragmentShader = newMaterial.fragmentShader;
    }

    // if time detected in obc or material, automatically update the value
    if (shader.uniforms.time) {
      shader.uniforms.time = {
        // @ts-ignore
        get value() {
          return (Date.now() - epoch) / 1000;
        },
      };
    }
  };

  return {
    debug: null,
    material: newMaterial,
  };
};
