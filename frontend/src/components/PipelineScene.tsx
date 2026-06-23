"use client";
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Environment, Stars } from '@react-three/drei';
import { Crystal } from './Crystal';

export default function PipelineScene() {
    return (
        <div className="fixed inset-0 -z-10 h-full w-full pointer-events-none">
            <Canvas camera={{ position: [0, 0, 15], fov: 50 }} gl={{ antialias: true, alpha: true }}>
                <fog attach="fog" args={['#000000', 5, 30]} />
                <ambientLight intensity={0.3} />
                <directionalLight position={[0, 10, 5]} intensity={1.5} color="#ffffff" />
                <spotLight position={[10, 0, -5]} intensity={2} color="#06b6d4" /> {/* Cyan Spot */}

                {/* Linear Pipeline Arrangement */}
                <Crystal position={[-6, 0, -2]} rotation={[0, 0, 0]} scale={1.5} color="#22d3ee" /> {/* Cyan */}
                <Crystal position={[-2, 0, -4]} rotation={[0.5, 0.5, 0]} scale={1.2} color="#38bdf8" /> {/* Light Blue */}
                <Crystal position={[2, 0, -2]} rotation={[1, 1, 0]} scale={1.5} color="#60a5fa" /> {/* Blue */}
                <Crystal position={[6, 0, -4]} rotation={[1.5, 1.5, 1.5]} scale={1.2} color="#818cf8" /> {/* Indigo */}

                <Stars radius={80} depth={40} count={2000} factor={3} saturation={0} fade speed={2} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
