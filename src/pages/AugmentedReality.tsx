import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, RoundedBox, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Info } from "lucide-react";

const scenes = [
  { id: "classroom", name: "Sala de Aula", desc: "Explore uma sala de aula virtual em 3D", emoji: "🏫" },
  { id: "lab", name: "Laboratório", desc: "Ambiente de laboratório científico", emoji: "🔬" },
  { id: "solar", name: "Sistema Solar", desc: "Visualize planetas e órbitas", emoji: "🪐" },
];

function FloatingBook({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3;
      ref.current.rotation.y += 0.005;
    }
  });
  return (
    <RoundedBox ref={ref} args={[1.2, 0.15, 0.9]} position={position} radius={0.03}>
      <meshStandardMaterial color={color} />
    </RoundedBox>
  );
}

function Desk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[1.5, 0.08, 1]} position={[0, 0.7, 0]} radius={0.02}>
        <meshStandardMaterial color="#8B6914" />
      </RoundedBox>
      {[[-0.6, 0.35, -0.4], [0.6, 0.35, -0.4], [-0.6, 0.35, 0.4], [0.6, 0.35, 0.4]].map((pos, i) => (
        <RoundedBox key={i} args={[0.06, 0.7, 0.06]} position={pos as [number, number, number]} radius={0.01}>
          <meshStandardMaterial color="#6B4E0A" />
        </RoundedBox>
      ))}
    </group>
  );
}

function ClassroomScene() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#e8dcc8" />
      </mesh>
      {/* Board */}
      <RoundedBox args={[4, 2, 0.1]} position={[0, 2, -5]} radius={0.05}>
        <meshStandardMaterial color="#2d5a3d" />
      </RoundedBox>
      <Text position={[0, 2, -4.9]} fontSize={0.3} color="white" anchorX="center">
        Bem-vindo à aula!
      </Text>
      {/* Desks */}
      <Desk position={[-2, 0, -1]} />
      <Desk position={[0, 0, -1]} />
      <Desk position={[2, 0, -1]} />
      <Desk position={[-2, 0, 1.5]} />
      <Desk position={[0, 0, 1.5]} />
      <Desk position={[2, 0, 1.5]} />
      {/* Floating books */}
      <FloatingBook position={[-1, 2.5, 0]} color="#e74c3c" />
      <FloatingBook position={[1.5, 3, -2]} color="#3498db" />
      <FloatingBook position={[0, 2.8, 2]} color="#2ecc71" />
    </group>
  );
}

function LabScene() {
  const flaskRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (flaskRef.current) {
      flaskRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
      {/* Lab table */}
      <RoundedBox args={[6, 0.1, 2]} position={[0, 1, 0]} radius={0.03}>
        <meshStandardMaterial color="#1a1a2e" />
      </RoundedBox>
      {/* Flasks */}
      <group ref={flaskRef} position={[0, 1.5, 0]}>
        {[[-1.5, 0, 0], [0, 0, 0], [1.5, 0, 0]].map((pos, i) => (
          <group key={i} position={pos as [number, number, number]}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
            </mesh>
            <Sphere args={[0.25, 16, 16]} position={[0, 0, 0]}>
              <meshStandardMaterial
                color={["#e74c3c", "#2ecc71", "#9b59b6"][i]}
                transparent
                opacity={0.7}
              />
            </Sphere>
          </group>
        ))}
      </group>
      {/* Microscope */}
      <group position={[-2.5, 1.1, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 0.6, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 16]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      </group>
    </group>
  );
}

function Planet({ radius, distance, speed, color }: { radius: number; distance: number; speed: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed;
      ref.current.position.x = Math.cos(t) * distance;
      ref.current.position.z = Math.sin(t) * distance;
    }
  });
  return (
    <Sphere ref={ref} args={[radius, 32, 32]} position={[distance, 0, 0]}>
      <meshStandardMaterial color={color} />
    </Sphere>
  );
}

function SolarScene() {
  return (
    <group>
      {/* Sun */}
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial color="#f39c12" emissive="#f39c12" emissiveIntensity={0.5} />
      </Sphere>
      <pointLight position={[0, 0, 0]} intensity={2} color="#f39c12" />
      {/* Orbits */}
      {[2.5, 3.5, 4.8, 6.5].map((r, i) => (
        <Torus key={i} args={[r, 0.01, 8, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#444" transparent opacity={0.3} />
        </Torus>
      ))}
      <Planet radius={0.15} distance={2.5} speed={1.5} color="#a0522d" />
      <Planet radius={0.25} distance={3.5} speed={1} color="#4169E1" />
      <Planet radius={0.2} distance={4.8} speed={0.7} color="#cd5c5c" />
      <Planet radius={0.35} distance={6.5} speed={0.4} color="#daa520" />
    </group>
  );
}

const AugmentedReality = () => {
  const [activeScene, setActiveScene] = useState("classroom");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Realidade Aumentada 🌐</h1>
            <p className="text-muted-foreground mt-1">Explore ambientes 3D interativos</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
            <Info className="h-4 w-4" />
            Arraste para girar • Scroll para zoom
          </div>
        </div>

        {/* Scene selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => setActiveScene(scene.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                activeScene === scene.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-muted/30"
              }`}
            >
              <span className="text-2xl">{scene.emoji}</span>
              <p className="font-semibold text-foreground text-sm mt-2">{scene.name}</p>
              <p className="text-xs text-muted-foreground">{scene.desc}</p>
            </button>
          ))}
        </div>

        {/* 3D Canvas */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[500px] w-full bg-gradient-to-b from-muted/30 to-muted/10 rounded-xl">
              <Canvas
                camera={{
                  position: activeScene === "solar" ? [0, 5, 12] : [5, 4, 5],
                  fov: 50,
                }}
                key={activeScene}
              >
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 8, 5]} intensity={1} />
                <Suspense fallback={null}>
                  {activeScene === "classroom" && <ClassroomScene />}
                  {activeScene === "lab" && <LabScene />}
                  {activeScene === "solar" && <SolarScene />}
                </Suspense>
                <OrbitControls
                  enablePan={false}
                  minDistance={3}
                  maxDistance={20}
                  autoRotate
                  autoRotateSpeed={0.5}
                />
              </Canvas>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AugmentedReality;
