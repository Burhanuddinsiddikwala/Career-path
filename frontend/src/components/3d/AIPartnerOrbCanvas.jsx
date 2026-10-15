import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { COLORS, createCrimsonTree, createRockyCliff, createDistantMountains } from './environmentUtils'

export default function AIPartnerOrbCanvas() {
  const containerRef = useRef(null)
  const [webglSupported, setWebglSupported] = useState(true)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setWebglSupported(false)
        return
      }
    } catch {
      setWebglSupported(false)
      return
    }

    const container = containerRef.current
    if (!container) return

    let width = container.clientWidth || 580
    let height = container.clientHeight || 520

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0xf3efe6, 0.038)

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
    camera.position.set(0, 1.2, 7.5)
    camera.lookAt(0, 0.3, 0)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.25
      container.appendChild(renderer.domElement)
    } catch {
      setWebglSupported(false)
      return
    }

    // Directional Sunlight with Shadows
    const sunLight = new THREE.DirectionalLight(0xfff3df, 3.8)
    sunLight.position.set(6, 11, 7)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    sunLight.shadow.bias = -0.0003
    scene.add(sunLight)

    const skyFill = new THREE.AmbientLight(0xf7ede2, 1.4)
    scene.add(skyFill)

    const burgundyRim = new THREE.DirectionalLight(0x813744, 2.0)
    burgundyRim.position.set(-6, -2, -3)
    scene.add(burgundyRim)

    const auraLight = new THREE.PointLight(COLORS.goldBright, 2.2, 10)
    auraLight.position.set(0, 0.6, 0)
    scene.add(auraLight)

    const envGroup = new THREE.Group()
    scene.add(envGroup)

    // 1. Distant Mountain Ridge
    const mountains = createDistantMountains()
    mountains.position.set(0, -0.6, -3)
    envGroup.add(mountains)

    // 2. Clifftop Rock Crags
    const cliff = createRockyCliff(3.5, 2.4, 2.4, { count: 12, color: 0xc4b7a2 })
    cliff.position.set(-2.8, -1.2, -1.0)
    envGroup.add(cliff)

    // 3. Tiered Sandstone Altar / Pedestal
    const daisGroup = new THREE.Group()
    daisGroup.position.set(0, -1.5, 0)

    const stoneMat = new THREE.MeshStandardMaterial({
      color: COLORS.sandstone,
      roughness: 0.72,
      metalness: 0.08
    })
    const goldMat = new THREE.MeshStandardMaterial({
      color: COLORS.gold,
      roughness: 0.3,
      metalness: 0.85
    })
    const burgundyMat = new THREE.MeshStandardMaterial({
      color: COLORS.burgundy,
      roughness: 0.25,
      metalness: 0.35
    })

    // Ground Base
    const pBaseGeo = new THREE.CylinderGeometry(2.8, 3.1, 0.22, 64)
    const pBase = new THREE.Mesh(pBaseGeo, stoneMat)
    pBase.receiveShadow = true
    daisGroup.add(pBase)

    // Mid Tier
    const pMidGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.2, 64)
    const pMid = new THREE.Mesh(pMidGeo, stoneMat)
    pMid.position.y = 0.2
    pMid.castShadow = true
    pMid.receiveShadow = true
    daisGroup.add(pMid)

    // Inset Burgundy Rim
    const pRingGeo = new THREE.TorusGeometry(2.18, 0.025, 16, 64)
    pRingGeo.rotateX(Math.PI / 2)
    const pRing = new THREE.Mesh(pRingGeo, burgundyMat)
    pRing.position.y = 0.3
    daisGroup.add(pRing)

    // Top Plinth
    const pTopGeo = new THREE.CylinderGeometry(1.5, 1.65, 0.18, 64)
    const pTop = new THREE.Mesh(pTopGeo, stoneMat)
    pTop.position.y = 0.39
    pTop.castShadow = true
    pTop.receiveShadow = true
    daisGroup.add(pTop)

    // Miniature Crimson Bonsai Tree beside the Altar (matching the concept image)
    const bonsaiTree = createCrimsonTree(0.7)
    bonsaiTree.position.set(1.4, 0.3, 0.4)
    daisGroup.add(bonsaiTree)

    // Zen River Stones
    const stoneGeo = new THREE.DodecahedronGeometry(0.12, 1)
    const stone1 = new THREE.Mesh(stoneGeo, stoneMat)
    stone1.position.set(1.1, 0.35, 0.7)
    stone1.scale.set(1.4, 0.6, 1.0)
    daisGroup.add(stone1)

    envGroup.add(daisGroup)

    // 4. Levitating Sculptural AI Ovoid / Egg
    const orbGroup = new THREE.Group()
    orbGroup.position.set(0, 0.5, 0)

    // Inner Glossy Lacquer Burgundy Ovoid
    const ovoidGeo = new THREE.SphereGeometry(1.25, 64, 64)
    ovoidGeo.scale(1.0, 1.28, 1.0)
    const ovoidMat = new THREE.MeshStandardMaterial({
      color: COLORS.burgundy,
      roughness: 0.15,
      metalness: 0.4
    })
    const ovoidMesh = new THREE.Mesh(ovoidGeo, ovoidMat)
    ovoidMesh.castShadow = true
    orbGroup.add(ovoidMesh)

    // White Marble Diagonal Inlay
    const sliceGeo = new THREE.TorusGeometry(1.26, 0.055, 24, 80)
    sliceGeo.rotateX(0.75)
    sliceGeo.rotateY(0.45)
    const sliceMat = new THREE.MeshStandardMaterial({
      color: COLORS.surface,
      roughness: 0.2,
      metalness: 0.1
    })
    const sliceMesh = new THREE.Mesh(sliceGeo, sliceMat)
    orbGroup.add(sliceMesh)

    // Golden Equatorial Inlay
    const eqGeo = new THREE.TorusGeometry(1.28, 0.035, 24, 80)
    eqGeo.rotateX(Math.PI / 2)
    const eqMesh = new THREE.Mesh(eqGeo, goldMat)
    orbGroup.add(eqMesh)

    // Thick Refractive Glass Shell
    const outerGeo = new THREE.SphereGeometry(1.42, 64, 64)
    outerGeo.scale(1.0, 1.28, 1.0)
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.38,
      roughness: 0.05,
      metalness: 0.08,
      transmission: 0.9,
      thickness: 0.9,
      clearcoat: 1.0
    })
    const outerMesh = new THREE.Mesh(outerGeo, outerMat)
    orbGroup.add(outerMesh)

    // Slender Floating Gold Orbital Halo Ring
    const floatRingGeo = new THREE.TorusGeometry(1.95, 0.028, 20, 80)
    floatRingGeo.rotateX(0.85)
    floatRingGeo.rotateZ(0.3)
    const floatRing = new THREE.Mesh(floatRingGeo, goldMat)
    floatRing.castShadow = true
    orbGroup.add(floatRing)

    envGroup.add(orbGroup)

    // Mouse Parallax
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const relX = (e.clientX - rect.left) / rect.width - 0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5
      targetX = relX * 0.4
      targetY = -relY * 0.3
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const cr = entry.contentRect
        if (cr.width && cr.height) {
          width = cr.width
          height = cr.height
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          renderer.setSize(width, height)
        }
      }
    })
    resizeObserver.observe(container)

    let animationFrameId
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const time = clock.getElapsedTime()

      mouseX += (targetX - mouseX) * 0.05
      mouseY += (targetY - mouseY) * 0.05

      camera.position.x = mouseX * 0.8
      camera.position.y = 1.2 + mouseY * 0.5
      camera.lookAt(0, 0.3, 0)

      // Levitating breathing animation
      orbGroup.position.y = 0.5 + Math.sin(time * 1.5) * 0.08
      orbGroup.rotation.y = time * 0.18 + mouseX * 0.5
      floatRing.rotation.z += 0.007

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      resizeObserver.disconnect()
      cancelAnimationFrame(animationFrameId)
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
        renderer.dispose()
      }
      scene.clear()
    }
  }, [])

  if (!webglSupported) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--surface-primary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--rule-subtle)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-burgundy)' }}>
            [AI Sovereign Core Orb Altar]
          </span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
    </div>
  )
}
