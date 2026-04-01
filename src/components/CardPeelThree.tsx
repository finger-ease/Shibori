import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  useEffect,
  useMemo,
  useRef,
  type PointerEventHandler,
  type RefObject,
} from 'react'
import * as THREE from 'three'
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  PEEL_VIEW_MARGIN,
} from '../constants'
import type { CardFlipState } from '../hooks/useCardFlip'
import { createBackCanvasTexture } from '../peel/createBackTexture'
import {
  deformNormal,
  deformVertex,
  getPeelFrame,
} from '../peel/peelParams'

const SEG = 56
const CURL_R = Math.min(CARD_WIDTH, CARD_HEIGHT) * 0.14

const peelVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const peelFrag = /* glsl */ `
  uniform sampler2D frontMap;
  uniform sampler2D backMap;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vec4 cFront = texture2D(frontMap, vUv);
    /* キャンバスは未描画部が透明のため、表面は白ベースに合成する */
    vec3 frontOnWhite = mix(vec3(1.0), cFront.rgb, cFront.a);
    vec4 cBack = texture2D(backMap, vUv);
    vec4 col = gl_FrontFacing ? cBack : vec4(frontOnWhite, 1.0);
    float shade = 0.58 + 0.42 * abs(normalize(vNormal).z);
    col.rgb *= shade;
    gl_FragColor = col;
  }
`

type PeelMeshProps = {
  flip: CardFlipState
  frontTexture: THREE.CanvasTexture | null
  backTexture: THREE.CanvasTexture
}

function PeelMesh({ flip, frontTexture, backTexture }: PeelMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const origPos = useRef<Float32Array | null>(null)
  const frame = useMemo(() => getPeelFrame(flip.peelEdge), [flip.peelEdge])

  const whiteTex = useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1)
    t.needsUpdate = true
    return t
  }, [])

  useEffect(() => {
    return () => {
      whiteTex.dispose()
    }
  }, [whiteTex])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        frontMap: { value: whiteTex },
        backMap: { value: backTexture },
      },
      vertexShader: peelVert,
      fragmentShader: peelFrag,
      side: THREE.DoubleSide,
    })
  }, [backTexture, whiteTex])

  useEffect(() => {
    return () => {
      material.dispose()
    }
  }, [material])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const geo = mesh.geometry
    if (!origPos.current) {
      const base = geo.attributes.position.array as Float32Array
      origPos.current = new Float32Array(base)
    }
    const orig = origPos.current
    const pos = geo.attributes.position.array as Float32Array
    const normal = geo.attributes.normal.array as Float32Array
    const p = flip.peelProgress

    const front = frontTexture ?? whiteTex
    material.uniforms.frontMap.value = front
    material.uniforms.backMap.value = backTexture
    if (frontTexture) frontTexture.needsUpdate = true

    for (let i = 0; i < pos.length; i += 3) {
      const ox = orig[i]!
      const oy = orig[i + 1]!
      const d = deformVertex(ox, oy, frame, p, CURL_R)
      pos[i] = d.x
      pos[i + 1] = d.y
      pos[i + 2] = d.z
      const n = deformNormal(ox, oy, frame, p, CURL_R)
      normal[i] = n.x
      normal[i + 1] = n.y
      normal[i + 2] = n.z
    }
    geo.attributes.position.needsUpdate = true
    geo.attributes.normal.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT, SEG, SEG]} />
    </mesh>
  )
}

function FitOrthoCamera() {
  const { camera } = useThree()
  const M = PEEL_VIEW_MARGIN
  useFrame(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return
    /** カード中心を維持し、はみ出したメッシュ全体が収まる視野 */
    camera.left = -(CARD_WIDTH / 2 + M)
    camera.right = CARD_WIDTH / 2 + M
    camera.top = CARD_HEIGHT / 2 + M
    camera.bottom = -(CARD_HEIGHT / 2 + M)
    camera.updateProjectionMatrix()
  })
  return null
}

type CardPeelThreeProps = {
  flip: CardFlipState
  drawingCanvas: HTMLCanvasElement | null
  pointerHandlers: {
    onPointerDown: PointerEventHandler<HTMLDivElement>
    onPointerMove: PointerEventHandler<HTMLDivElement>
    onPointerUp: PointerEventHandler<HTMLDivElement>
    onPointerCancel: PointerEventHandler<HTMLDivElement>
  }
  containerRef?: RefObject<HTMLDivElement | null>
}

export function CardPeelThree({
  flip,
  drawingCanvas,
  pointerHandlers,
  containerRef,
}: CardPeelThreeProps) {
  const pad = PEEL_VIEW_MARGIN
  const viewW = CARD_WIDTH + 2 * pad
  const viewH = CARD_HEIGHT + 2 * pad

  const backTexture = useMemo(() => createBackCanvasTexture(), [])

  const frontTexture = useMemo(() => {
    if (!drawingCanvas) return null
    const t = new THREE.CanvasTexture(drawingCanvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.needsUpdate = true
    return t
  }, [drawingCanvas])

  useEffect(() => {
    return () => {
      backTexture.dispose()
    }
  }, [backTexture])

  useEffect(() => {
    return () => {
      frontTexture?.dispose()
    }
  }, [frontTexture])

  return (
    <div
      ref={containerRef}
      className="relative mx-auto touch-none select-none"
      style={{
        width: viewW,
        height: viewH,
        touchAction: 'none',
        cursor:
          flip.phase === 'flipping'
            ? 'grabbing'
            : flip.phase === 'faceDown'
              ? 'grab'
              : 'default',
      }}
      {...pointerHandlers}
    >
      <Canvas
        orthographic
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 0, 520], near: 0.1, far: 2000 }}
        style={{
          width: viewW,
          height: viewH,
          borderRadius: 14,
          display: 'block',
        }}
      >
        <FitOrthoCamera />
        <PeelMesh
          flip={flip}
          frontTexture={frontTexture}
          backTexture={backTexture}
        />
      </Canvas>
    </div>
  )
}
