import { Material, ShaderLib } from 'three';

// Copied from threejs WebGLPrograms.js so we can resolve builtin materials to their shaders
const MATERIAL_TYPES_TO_SHADERS: { [key: string]: string } = {
  MeshDepthMaterial: 'depth',
  MeshDistanceMaterial: 'distanceRGBA',
  MeshNormalMaterial: 'normal',
  MeshBasicMaterial: 'basic',
  MeshLambertMaterial: 'lambert',
  MeshPhongMaterial: 'phong',
  MeshToonMaterial: 'toon',
  MeshStandardMaterial: 'physical',
  MeshPhysicalMaterial: 'physical',
  MeshMatcapMaterial: 'matcap',
  LineBasicMaterial: 'basic',
  LineDashedMaterial: 'dashed',
  PointsMaterial: 'points',
  ShadowMaterial: 'shadow',
  SpriteMaterial: 'sprite',
};

export const getTypeForMaterial = (material: string) => {
  let builtinType: string = MATERIAL_TYPES_TO_SHADERS[material];
  return builtinType || (material === 'ShaderMaterial' ? 'shader' : 'unknown');
};

export const getNameForEditorMaterial = (material: any, programGl: any) => {
  let name = ''

  if (material.isEffect) {
    name = material.name.replace('Effect', '').toLowerCase()
  } else {
    name = getTypeForMaterial(programGl.name)
  }
  name = name + '_' + programGl.id;

  return name;
};

export const getShaderWithObc = (material: any) => {
  let builtinType = MATERIAL_TYPES_TO_SHADERS[material.type];

  const dummyShaderLib = Object.assign({}, ShaderLib[builtinType] ? ShaderLib[builtinType] : material)

  if (ShaderLib[builtinType]) {
    for (const [_key, value] of Object.entries(dummyShaderLib.uniforms)) {
      const val:any = value
      val.isNativeUniforms = true
    }
  }
  
  // TODO DEBUG UNIFORMS OF CUSTOM MATERIALS SHADER IS NOT SHOWING
  if (!dummyShaderLib.obcAdded && !material.obcAdded) {
    material.obcAdded = true;
    dummyShaderLib.obcAdded = true;
    material.onBeforeCompile.call(
      material,
      dummyShaderLib
    );
    dummyShaderLib.uniforms = Object.assign(dummyShaderLib.uniforms, material.uniforms);
  }
  return dummyShaderLib;
};

export const getShaderLibForMaterial = (material: Material) => {
  let builtinType = MATERIAL_TYPES_TO_SHADERS[material.type];

  return builtinType ? ShaderLib[builtinType] : material;
};
