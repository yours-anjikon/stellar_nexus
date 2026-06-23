"use client";
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Environment, Stars } from '@react-three/drei';
import { Crystal } from './Crystal';

export default function MarketplaceScene() {
    return (
        <div className="fixed inset-0 -z-10 h-full w-full pointer-events-none">
            <Canvas camera={{ position: [0, 0, 15], fov: 50 }} gl={{ antialias: true, alpha: true }}>
                <fog attach="fog" args={['#000000', 5, 30]} />
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
                <spotLight position={[-10, 10, -5]} intensity={2} color="#4f46e5" /> {/* Purple/Blue Spot */}

                {/* Floating Marketplace Items */}
                <Crystal position={[-5, 2, -2]} rotation={[0, 1, 0]} scale={1.8} color="#3b82f6" /> {/* Blue */}
                <Crystal position={[5, -3, -4]} rotation={[1, 0, 1]} scale={2} color="#a855f7" /> {/* Purple */}
                <Crystal position={[0, 4, -8]} rotation={[0, 0, 1]} scale={1.5} color="#22c55e" /> {/* Green */}

                {/* Background Dust */}
                <Crystal position={[-8, -5, -10]} rotation={[1, 1, 1]} scale={1} color="#1e40af" />
                <Crystal position={[8, 5, -12]} rotation={[2, 2, 2]} scale={1.2} color="#6b21a8" />

                <Stars radius={80} depth={40} count={3000} factor={3} saturation={0} fade speed={0.5} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
