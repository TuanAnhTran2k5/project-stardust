import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const NebulaCloud: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.015
    }
  })

  return (
    <group ref={groupRef}>
      {/* Tinh vân Hồng Pastel */}
      <mesh position={[-8, 3, -15]}>
        <sphereGeometry args={[12, 16, 16]} />
        <meshBasicMaterial
          color="#ffb6c1"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Tinh vân Tím Lavender */}
      <mesh position={[10, -4, -18]}>
        <sphereGeometry args={[14, 16, 16]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Tinh vân Xanh Biển Sao */}
      <mesh position={[0, -8, -12]}>
        <sphereGeometry args={[10, 16, 16]} />
        <meshBasicMaterial
          color="#818cf8"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
