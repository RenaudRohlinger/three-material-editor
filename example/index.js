import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Canvas, useFrame } from 'react-three-fiber';
import './index.css'
import { Perf } from 'r3f-perf';
import { MaterialEditor, useEditorComposer } from '@three-material-editor/react';
import { Environment, MeshDistortMaterial, Sphere, Text } from '@react-three/drei'
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing'

import * as THREE from 'three';

const BoxStandard = (props) => {
  return (
    <mesh {...props}>
      <boxGeometry args={[1, 1]} />
      <meshStandardMaterial />
    </mesh>
  );
}


const BoxNormal = (props) => {
  const mesh = React.useRef()

  useFrame(() => {
    mesh.current.rotation.x = mesh.current.rotation.y += 0.01
  })

  return (
    <mesh ref={mesh} {...props}>
      <boxGeometry args={[1, 1]} />
      <meshNormalMaterial />
    </mesh>
  );
}

const BoxShader = (props) => {
  const shader = React.useMemo(() => new THREE.MeshNormalMaterial())
  return (
    <group>
      <mesh {...props} material={shader}>
        <boxGeometry args={[1, 1]} />
      </mesh>
      <mesh {...props} material={shader} position={[0, -1, 0]} >
        <sphereBufferGeometry args={[1, 32, 32, 32 ]} />
      </mesh>
    </group>
  );
}

const BoxShader2 = (props) => {
  return (
    <mesh {...props}>
      <boxGeometry args={[1, 1]} />
      <shaderMaterial />
    </mesh>
  );
}

const App = () => {
  return (
    <Canvas concurrent shadowMap orthographic pixelRatio={[1, 2]} camera={{ position: [0, 0, 5], near: 1, far: 15, zoom: 100 }}>
      {/* <Perf showGraph={false} position={'top-left'} /> */}
      <MaterialEditor />
      {/* <ambientLight intensity={0.5} /> */}

      <React.Suspense fallback={null}>
        <Sphere
          args={[1, 32, 32]}
        >
          <MeshDistortMaterial factor={2} color={'black'} />
        </Sphere>
        <Environment preset={'studio'} />
        {/* <EffectComposer ref={useEditorComposer()}>
          <Noise opacity={0.4} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer> */}

      </React.Suspense>

    
      {/* <pointLight position={[5, 0, 10]} intensity={1} /> */}
     {/*  <BoxStandard position={[-2, 0, 0]} rotation={[.35,.35,.35]} /> */}
      <BoxNormal position={[2, 0, 0]} rotation={[.35,.35,.35]} />
      {/* <BoxShader position={[0, 1, 0]} rotation={[.35,.35,.35]} /> */}
      {/* <BoxShader2 position={[2, 1, 0]} rotation={[.35,.35,.35]} /> */}
       {/* <BoxShader2 position={[2, 1, 0]} rotation={[.35,.35,.35]} /> */}
       <Text fontSize={3} letterSpacing={-0.06}>
          drei
          <MeshDistortMaterial factor={2} color={'black'} />
        </Text>
    </Canvas>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
