import { Color, FrontSide, Mesh, MeshBasicMaterial, Scene } from 'three';
import { addShaderDebugMaterial } from './helpers/improveMaterial';
import { editorState, editorContextState } from './state';

const getMUIIndex = (muid: string) => muid === 'muidEditor';

const _insertMaterialToEditor = (element: any, isEffect?: boolean) => {
  const el = isEffect ? element.screen : element
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

    if (el.fsQuad) {
      el.material.uniformsNeedUpdate = true

      if (el.material.uniforms) {
        el.material.fragmentShader = `#defines muiEditor ${el.material.id};\n` + el.material.fragmentShader
        el.material.uniforms.muidEditor = {
          value: el.material.id
        }
        if (el.fsQuad._mesh) {
          el.fsQuad._mesh.material = el.material;
          el.fsQuad.material = el.material;
        }
        console.log(el)
      }
    }

    // to check if multiple material users
    el.tmeDerived = true;
    el.material.numberOfMaterialsUser = 1
    isAlreadyDerived[muid] = el.material;
    isAlreadyDerived[muid].mesh = el;
    // handle postprocess and react-postprocess libs
    if (element.effects) {
      let id = 0
      for(const effect of element.effects) {
        effect.id = id++
        effect.isEffect = true
      }
      el.material.postprocess = element
      element.recompile()
    }
  }
}

// const _insertEffectToEditor = (el: any, improveMaterial?: boolean) => {
// }

const isAlreadyDerived: any[] = [];

let hasInit = false

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
      // if (pass.material) {
      //   _insertMaterialToEditor(pass)
      // }
      // if (pass.effects) {
      //   pass.effects.forEach(effect => {
      //   _insertEffectToEditor(effect)
      //   });
      // }

      // check if is basic three shaderpass
      if (pass.fsQuad) {
        _insertMaterialToEditor(pass)
      }

      // handle postprocess and react-postprocess libs
      if (pass.screen) {
        _insertMaterialToEditor(pass, true)
      }
    })
  }
  const programs: object[] = [];
  // update
  scene?.traverse((el: any) => {
    // Vanilla return Object3D so (el instanceof Mesh || el instanceof InstancedMesh) doesn't work ?
    if (el.material) {
      if (el.debugMaterial) {
        return
      }
      _insertMaterialToEditor(el)
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
      if (isAlreadyDerived[muidDerived].postprocess) {
        for(const effect of isAlreadyDerived[muidDerived].postprocess.effects) {
          programs.push({
            material: effect,
            program: program,
            effect: isAlreadyDerived[muidDerived].postprocess
          });
       };
      } else {
        programs.push({
          material: isAlreadyDerived[muidDerived],
          program: program,
        });
      }
     
      
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
        

          if (editorState.diagnostics) {
            const frag = gl.getContext().getShaderSource( programDiagnostic.fragmentShader );
            const vert = gl.getContext().getShaderSource( programDiagnostic.fragmentShader );
            editorState.diagnostics.frag = frag
            editorState.diagnostics.vert = vert
          }
          iError++;
        }
      }
   
    } else {
      const uniforms = program.getUniforms().map
     
      if (uniforms.muidEditor) {
       
        programs.push({
          program
        });
      }
      // const uniforms = program.getUniforms().map
     
      // if (uniforms.muidEditor) {
      //   programs.push({
      //     program
      //   });
      // }
      // program.postprocessInitialized = true
      // const arr = program.cacheKey.split('},')
      // const frag = arr[0] + '// endsection \n}'
      // const vert = arr[1] + '// endsection \n}'
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
    console.log(isAlreadyDerived)

    editorState.programs = programs;
    editorContextState.programs = programs;
    editorState.triggerUpdate++;
  }
};
