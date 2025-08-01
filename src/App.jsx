import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import * as THREE from "three/webgpu";
import { Experience } from "./components/Experience";

function App() {
  const [frameloop, setFrameloop] = useState("never");
  return (
    <>
      <Stats />
      <Canvas
        shadows
        camera={{ position: [3, 3, 5], fov: 30 }}
        frameloop={frameloop}
        gl={(canvas) => {
          const renderer = new THREE.WebGPURenderer({
            canvas,
            powerPreference: "high-performance",
            antialias: true,
            alpha: false,
            stencil: false,
          });

          renderer.init().then(() => {
            setFrameloop("always");
          });
          return renderer;
        }}
      >
        <Suspense>
          <Experience />
        </Suspense>
      </Canvas>
    </>
  );
}
export default App;
