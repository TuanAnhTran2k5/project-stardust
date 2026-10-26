import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const ShootingStar: React.FC = () => {
  const lineObj = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const pos = new Float32Array(6)
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    })
    const line = new THREE.Line(geom, mat)
    line.visible = false
    return line
  }, [])

  const state = useRef({
    active: false,
    progress: 0,
    start: new THREE.Vector3(-20, 15, -10),
    end: new THREE.Vector3(20, -10, -5),
    nextShootTime: 2.0,
  })

  useFrame((_, delta) => {
    const s = state.current

    if (!s.active) {
      s.nextShootTime -= delta
      if (s.nextShootTime <= 0) {
        s.active = true
        s.progress = 0
        s.nextShootTime = 3.5 + Math.random() * 4
        s.start.set(
          -25 + Math.random() * 10,
          10 + Math.random() * 10,
          -10 - Math.random() * 10
        )
        s.end.set(
          s.start.x + 25 + Math.random() * 15,
          s.start.y - 15 - Math.random() * 10,
          s.start.z + 5
        )
      }
    } else {
      s.progress += delta * 2.2
      if (s.progress >= 1) {
        s.active = false
        lineObj.visible = false
      } else {
        lineObj.visible = true
        const curX = THREE.MathUtils.lerp(s.start.x, s.end.x, s.progress)
        const curY = THREE.MathUtils.lerp(s.start.y, s.end.y, s.progress)
        const curZ = THREE.MathUtils.lerp(s.start.z, s.end.z, s.progress)

        const tailX = THREE.MathUtils.lerp(s.start.x, s.end.x, Math.max(0, s.progress - 0.2))
        const tailY = THREE.MathUtils.lerp(s.start.y, s.end.y, Math.max(0, s.progress - 0.2))
        const tailZ = THREE.MathUtils.lerp(s.start.z, s.end.z, Math.max(0, s.progress - 0.2))

        const positions = lineObj.geometry.attributes.position.array as Float32Array
        positions[0] = tailX
        positions[1] = tailY
        positions[2] = tailZ
        positions[3] = curX
        positions[4] = curY
        positions[5] = curZ
        lineObj.geometry.attributes.position.needsUpdate = true
      }
    }
  })

  return <primitive object={lineObj} />
}
