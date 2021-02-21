

import React, { useEffect, VFC } from 'react';
import { editorContextState as editorContext, editorState } from '../../state';
import { Leva, usePanel, LevaPanel } from "leva";
import { useProxy } from 'valtio';
// import * as THREE from 'three'

// import styles from './menu.module.css';

interface UniformsMenuProps {
}

// foreach

export const UniformsMenu: VFC<UniformsMenuProps> = () => {
  const snapshot = useProxy(editorState);
  const [store, setSelection]:any = React.useState(null)
  if (!editorContext.monacoRef) {
    return null;
  }

  if (!editorContext.activeMaterial.ref) {
    return null;
  }

  const material: any = editorContext.activeMaterial.ref.material;
 
  if (!editorState.showUniforms || !material.uniforms || Object.keys(material.uniforms).length === 0) {
    return null
  }
  const filteredItems:any = {}
  Object.entries(material.uniforms).map(([key, uniform]: any) => {

   
    if (!uniform.isNativeUniforms && key !== 'time') {
      if (typeof uniform.value === 'number') {
        uniform.min = -1
        uniform.max = 1
      }

      if (uniform.type) {
        delete uniform.age
      }
      if (uniform.value.isColor) {
        const col = uniform.value
        filteredItems[key] = {r: col.r, g: col.g, b: col.b}
      } else {
        filteredItems[key] = uniform
      }
      // console.log(filteredItems[key])

      Object.entries(filteredItems[key]).map(([skey, value]) => {
        if (typeof value === 'string') {
          delete filteredItems[key][skey]
        }
      })
    }
  })
  // const [, store] = usePanel({});

  // const [key, set] = React.useState(false)
  // setSelection([-1, null])
  // var filteredItems = Object.keys(material.uniforms).reduce(function(r:any, e) {
  //   if (!r.isNativeUniforms && e !== 'time') r[e] = material.uniforms[e]
  //   return r;
  // }, {})
  return (
    <div>
      <Leva detached={true} hideTitleBar oneLineLabels={false} />
      <LevaPanel store={store} oneLineLabels={false} />
      {/* <LevaPanel store={store} oneLineLabels={false} /> */}
      <div key={snapshot.triggerUpdate}>
      <UniformComp filteredItems={filteredItems} setSelection={setSelection} uniforms={material.uniforms} store={store} />
      </div>
      {/* {
      Object.entries(material.uniforms).map(([key, uniform]: any) => {
        // console.log(key, uniform)
        // if (key === 'time' || uniform.isNativeUniforms) {
        //   return null
        // }
         

       
      })
      } */}
    </div>
  )
};

const UniformComp = ({filteredItems, uniforms, setSelection} :any) => {
  // const obj:any = {}
  // obj[key] = uniform.value
  // const [val, store] = usePanel(obj);
  // uniform.value = val[key]
  // const [val, ] = usePanelControls(filteredItems);
  // const [boxes, setBoxes] = React.useState([])
  // }
  const [val, store] = usePanel(filteredItems)
  useEffect(() => {
    for (const [key, value] of Object.entries(val)) {
      // const val:any = value
      if (uniforms[key]) {
        // if (val['r'] && val['g'] && val['b']) {
        //   uniforms[key].value = new THREE.Color(val['r'], val['g'], val['b'])
        //   break
        // } else {
          uniforms[key].value = value
        // }
      }
    }
  }, [val])

  useEffect(() => {
    setSelection(store)
  }, [store, setSelection])

  return null
}

