'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Float, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';

export function Crystal({ position, rotation, scale, color }: { position: [number, number, number], rotation: [number, number, number], scale: number, color: string }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.002;
            meshRef.current.rotation.y += 0.003;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
                <icosahedronGeometry args={[1, 0]} />
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={2} // Increased thickness for more refraction
                    chromaticAberration={0.5} // High chromatic aberration for rainbow effects
                    anisotropy={0.5}
                    distortion={0.5}
                    distortionScale={0.5}
                    temporalDistortion={0.2}
                    iridescence={1}
                    iridescenceIOR={1}
                    iridescenceThicknessRange={[0, 1400]}
                    roughness={0.1}
                    clearcoat={1}
                    color={color}
                    resolution={512} // Lower resolution for performance if needed, but 512 is decent
                />
            </mesh>
        </Float>
    );
}

export default function CrystalBackground() {
    return (
        <div className="absolute inset-0 -z-10 h-full w-full bg-transparent">
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                <fog attach="fog" args={['#000000', 5, 30]} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
                <spotLight position={[-10, -10, -5]} intensity={1.5} color="#06b6d4" />

                {/* Main Crystal Clusters */}
                <Crystal position={[0, 0, 0]} rotation={[0, 0, 0]} scale={3} color="#a5f3fc" />
                <Crystal position={[-6, 2, -5]} rotation={[1, 1, 0]} scale={2} color="#67e8f9" />
                <Crystal position={[6, -2, -5]} rotation={[0, 1, 1]} scale={2} color="#22d3ee" />

                {/* Background smaller crystals */}
                <Crystal position={[-9, -5, -10]} rotation={[2, 0, 1]} scale={1.5} color="#0891b2" />
                <Crystal position={[9, 5, -10]} rotation={[0, 2, 0]} scale={1.5} color="#0e7490" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
} 
