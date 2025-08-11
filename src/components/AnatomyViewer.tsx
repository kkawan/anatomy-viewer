// src/components/AnatomyViewer.tsx
import * as THREE from "three";
import React, { useState, useRef, Suspense, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { AnimatePresence } from "framer-motion";
import AnimatedSymptomsForm from "./AnimatedSymptomsForm";
import Iridescence from "./Iridescence/Iridescence";

// normalized [0–1]
interface Rect { xMin: number; xMax: number; yMin: number; yMax: number; }
interface Region {
  name: string;
  rects: Rect[];
  cameraPos: THREE.Vector3;
  target: THREE.Vector3;
  color: string;
}

const regions: Region[] = [
  {
    name: "Cabeça",
    rects: [{ xMin: 0.48, xMax: 0.52, yMin: 0.05, yMax: 0.2 }],
    cameraPos: new THREE.Vector3(0, 2.5, 1.5),
    target:    new THREE.Vector3(0, 1.8, 0),
    color:     "",
  },
  {
    name: "Tórax",
    rects: [{ xMin: 0.46, xMax: 0.54, yMin: 0.22, yMax: 0.35 }],
    cameraPos: new THREE.Vector3(0, 1.6, 2.0),
    target:    new THREE.Vector3(0, 1.2, 0),
    color:     "",
  },
  {
    name: "Braço Esquerdo",
    rects: [{ xMin: 0.35, xMax: 0.45, yMin: 0.40, yMax: 0.52 }],
    cameraPos: new THREE.Vector3(-1.5, 1.4, 1.5),
    target:    new THREE.Vector3(-0.5, 1.2, 0),
    color:     "",
  },
  {
    name: "Braço Direito",
    rects: [{ xMin: 0.55, xMax: 0.65, yMin: 0.40, yMax: 0.52 }],
    cameraPos: new THREE.Vector3(1.5, 1.4, 1.5),
    target:    new THREE.Vector3(0.5, 1.2, 0),
    color:     "",
  },
  {
    name: "Abdômen",
    rects: [{ xMin: 0.46, xMax: 0.54, yMin: 0.35, yMax: 0.5 }],
    cameraPos: new THREE.Vector3(0, 1.0, 2.5),
    target:    new THREE.Vector3(0, 0.8, 0),
    color:     "",
  },
  {
    name: "Pernas",
    rects: [{ xMin: 0.44, xMax: 0.56, yMin: 0.5, yMax: 0.95 }],
    cameraPos: new THREE.Vector3(0, 0.2, 3.0),
    target:    new THREE.Vector3(0, 0.2, 0),
    color:     "",
  },
];

export default function AnatomyViewer() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const animate = useRef({
    fromPos: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
    currentTarget: new THREE.Vector3(0,0,0),
    t: 0,
    duration: 1.2,
    active: false,
  });

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas>
        <hemisphereLight intensity={1.2} />
        <directionalLight position={[5,10,7.5]} intensity={0.8} />

        <Suspense fallback={null}>
          <NormalizedAndScaledModel />
        </Suspense>

        <CameraAnimator animateRef={animate} />

        <ScreenRegionHandler
          animateRef={animate}
          onRegionSelect={r => setSelectedPart(r.name)}
          onOutsideSelect={() => setSelectedPart(null)}
        />
      </Canvas>

      {regions.map((r,i) =>
        r.rects.map((rect,j) => {
          let transformStyle: React.CSSProperties = {};
          if (r.name==="Braço Esquerdo") transformStyle={transform:"rotate(-45deg)",transformOrigin:"center"};
          if (r.name==="Braço Direito")  transformStyle={transform:"rotate(45deg)", transformOrigin:"center"};
          return <div key={`${i}-${j}`} style={{
            position:"absolute",
            left:`${rect.xMin*100}%`,
            top:`${rect.yMin*100}%`,
            width:`${(rect.xMax-rect.xMin)*100}%`,
            height:`${(rect.yMax-rect.yMin)*100}%`,
            backgroundColor:r.color,
            pointerEvents:"none",
            ...transformStyle
          }}/>;
        })
      )}


      <AnimatePresence>
        {selectedPart && (
          <AnimatedSymptomsForm
            partName={selectedPart}
            onClose={() => setSelectedPart(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NormalizedAndScaledModel() {
  const { scene } = useGLTF("/models/anatomy2.glb");
  const ref = useRef<THREE.Object3D>(null);
  useEffect(() => {
    if (!ref.current) return;
    const box = new THREE.Box3().setFromObject(ref.current);
    ref.current.position.sub(box.getCenter(new THREE.Vector3()));
    ref.current.scale.set(3.5,3.5,3.5);
  },[]);
  return <primitive ref={ref} object={scene}/>;
}

function CameraAnimator({
  animateRef,
}: {
  animateRef: React.MutableRefObject<{
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    currentTarget: THREE.Vector3;
    t: number;
    duration: number;
    active: boolean;
  }>;
}) {
  const { camera } = useThree();
  useFrame((_,delta) => {
    const a = animateRef.current;
    if (!a.active) return;
    a.t += delta;
    const tt = Math.min(a.t / a.duration, 1);
    camera.position.lerpVectors(a.fromPos, a.toPos, tt);
    a.currentTarget.lerpVectors(a.fromTarget, a.toTarget, tt);
    camera.lookAt(a.currentTarget);
    if (tt===1) a.active = false;
  });
  return null;
}

function ScreenRegionHandler({
  animateRef,
  onRegionSelect,
  onOutsideSelect,
}: {
  animateRef: React.MutableRefObject<any>;
  onRegionSelect: (r: Region) => void;
  onOutsideSelect: () => void;
}) {
  const { camera, gl } = useThree();
  const defaultPos = useRef(camera.position.clone());
  const defaultTarget = useRef(new THREE.Vector3(0,0,0));

  useEffect(() => {
    const handleClick = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = (e.clientX-rect.left)/rect.width;
      const y = (e.clientY-rect.top)/rect.height;
      const region = regions.find(r =>
        r.rects.some(rt => x>=rt.xMin && x<=rt.xMax && y>=rt.yMin && y<=rt.yMax)
      );
      const a = animateRef.current;
      a.fromPos.copy(camera.position);
      a.fromTarget.copy(a.currentTarget);
      a.t = 0;
      if (region) {
        onRegionSelect(region);
        a.toPos.copy(region.cameraPos);
        a.toTarget.copy(region.target);
      } else {
        onOutsideSelect();
        a.toPos.copy(defaultPos.current);
        a.toTarget.copy(defaultTarget.current);
      }
      a.active = true;
    };
    gl.domElement.addEventListener("pointerdown", handleClick);
    return () => gl.domElement.removeEventListener("pointerdown", handleClick);
  },[camera,gl.domElement,onRegionSelect,onOutsideSelect,animateRef]);

  return null;
}
