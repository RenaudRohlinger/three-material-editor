import { Color, FrontSide, Mesh, MeshBasicMaterial, Scene } from 'three';
import { addShaderDebugMaterial } from './helpers/improveMaterial';
import { editorState, editorContextState } from './state';

const getMUIIndex = (muid: string) => muid === 'muidEditor';

const isAlreadyDerived: any[] = [];

let hasInit = false
let materialInstanceId = 1e10

const meshDebugger:any = new Mesh(undefined, new MeshBasicMaterial({
  color: new Color(0xff0000),
  side: FrontSide,
  wireframe: true,
  visible: false
}))
meshDebugger.debugMaterial = true

export const traverseMaterialsToProgram = (scene: Scene, gl: any) => {
  if (!hasInit) {
    hasInit = true
    scene.add(meshDebugger)
  }
  if (editorContextState.composer) {
    editorContextState.composer.passes.forEach((pass: any) => {
      if (pass.effects) {
        pass.effects.forEach((effect: any) => {
          if (effect.isDerived) {
            return
          }
          effect.isDerived = true
          effect.defines.set('muidEditor', materialInstanceId)
          isAlreadyDerived[materialInstanceId] = effect;
          materialInstanceId++
          console.log(effect)
        })
      }
    })
  }
  const programs: object[] = [];
  // update
  scene?.traverse((el: any) => {
    if (el === 'Effect') {

    }
    // Vanilla return Object3D so (el instanceof Mesh || el instanceof InstancedMesh) doesn't work ?
    if (el.material) {
      if (el.debugMaterial) {
        return
      }
    
      if (!el.material.defines) {
        el.material.defines = {};
      }
      
      if (!el.material.defines.muidEditor) {
        el.material.defines = Object.assign(el.material.defines || {}, {
          muidEditor: el.material.id
        });
      }

      const muid = el.material.id;
      // prevent to derive loop
      if (
        muid &&
        !isAlreadyDerived[muid] &&
        el.material.defines
      ) {
        const { material } = addShaderDebugMaterial(el.material);

        el.material = material;
        // to check if multiple material users
        el.tmeDerived = true;
        el.material.numberOfMaterialsUser = 1
        isAlreadyDerived[muid] = el.material;
        isAlreadyDerived[muid].mesh = el;
        el.material.customProgramCacheKey = () => {
          return Date.now();
        };
      }
      // inc counter if the mesh also use the material
      if (el.material.defines && !el.tmeDerived) {
        el.tmeDerived = true;
        el.material.numberOfMaterialsUser++
      }
    }
  });
  let iError = 0;

  gl.info.programs?.forEach((program: any) => {

    const cacheKeySplited = program.cacheKey.split(',');
    // convert and supply all mesh associated to this material to a debugger material
    const muidDerived = cacheKeySplited[cacheKeySplited.findIndex(getMUIIndex) + 1];
    if (!isNaN(muidDerived) && isAlreadyDerived[muidDerived]) {
      isAlreadyDerived[muidDerived].program = program
      programs.push({
        material: isAlreadyDerived[muidDerived],
        program: program,
      });
      
      if (program) {
        const programDiagnostic: any = program;
        if (programDiagnostic.diagnostics) {
          if (isAlreadyDerived[muidDerived] && isAlreadyDerived[muidDerived].mesh) {
            if (!meshDebugger.material.visible) {
              meshDebugger.geometry = isAlreadyDerived[muidDerived].mesh.geometry
              meshDebugger.material.visible = true
            }
            meshDebugger.position.copy( isAlreadyDerived[muidDerived].mesh.position );
            meshDebugger.quaternion.copy( isAlreadyDerived[muidDerived].mesh.quaternion );
            meshDebugger.updateMatrix()
          }
          editorState.diagnostics = programDiagnostic.diagnostics;
          iError++;
        }
      }
   
    } else {
      if (program.postprocessInitialized) {
        return
      }
      // program.postprocessInitialized = true
      // const arr = program.cacheKey.split('},')
      // const frag = arr[0] + '// endsection \n}'
      // const vert = arr[1] + '// endsection \n}'
      // // TODO SUPPORT POSTPROCESS
      // const material:any = new ShaderMaterial({
      //   // todo add uniforms with program.getUniforms
      //   uniforms: program.getUniforms().map,
      //   vertexShader: vert,
      //   fragmentShader: frag,
      // })
      // material.customProgramCacheKey = () => {
      //   return Date.now();
      // };
      // material.postprocess = true
      // material.cacheKey = arr
      // const mesh:any = new Mesh(undefined, material)
      // mesh.debugMaterial = true
      // scene.add(mesh)
      // console.log(program.getUniforms())
      // console.log(scene)
      // program.destroy()
      programs.push({
        program
      });
    }
  });
  editorContextState.gl = gl;
  if (iError === 0) {
    meshDebugger.material.visible = false
    // editorState.diagnostics = null
  }
  if (
    programs.length !== editorContextState.programs.length
  ) {
    console.log(programs)
    editorState.programs = programs;
    editorContextState.programs = programs;
    editorState.triggerUpdate++;
  }
};
