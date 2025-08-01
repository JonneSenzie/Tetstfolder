import { Environment, OrbitControls } from "@react-three/drei";
import { GPGPUParticles } from './GPGPUParticles.jsx';

export const Experience = () => {
  return (
    <>
      <OrbitControls />
      <GPGPUParticles />
    </>
  );
};
