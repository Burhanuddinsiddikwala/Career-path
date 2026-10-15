import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { COLORS, createRockyCliff, createClassicalArches } from './environmentUtils'

export default function CareerPedestalCanvas() {
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

    let width = container.clientWidth || 680
    let height = container.clientHeight || 560

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0xf3efe6, 0.038)

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
    camera.position.set(0.2, 3.4, 7.4)
    camera.lookAt(0, 0.5, 0)

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
    const sunLight = new THREE.DirectionalLight(0xfff3df, 3.6)
    sunLight.position.set(6, 12, 7)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    sunLight.shadow.bias = -0.0003
    scene.add(sunLight)

    const skyFill = new THREE.AmbientLight(0xf5ece0, 1.3)
    scene.add(skyFill)

    const envGroup = new THREE.Group()
    scene.add(envGroup)

    // 1. Classical Colonnade / Arches in Deep Background
    const arches = createClassicalArches(0.72)
    arches.position.set(0, -0.2, -3.2)
    envGroup.add(arches)

    // 2. Left Rocky Cliff with Crimson Tree
    const cliff = createRockyCliff(3.0, 2.8, 2.5, { addTree: true, color: 0xc4b7a2 })
    cliff.position.set(-2.8, -0.3, -1.2)
    envGroup.add(cliff)

    // 3. Stepped Architectural Stone Pedestals (Terraces) Flanking the Composition
    const stoneMat = new THREE.MeshStandardMaterial({
      color: COLORS.sandstone,
      roughness: 0.72,
      metalness: 0.08
    })

    const plinthConfigs = [
      // Left flanking plinth
      { x: -2.0, y: -0.2, z: 0.4, w: 2.2, h: 0.4, d: 2.0 },
      // Right flanking plinth
      { x: 2.2, y: -0.1, z: 0.2, w: 2.4, h: 0.45, d: 2.2 },
      // Center low foundation terrace
      { x: 0, y: -0.6, z: 0, w: 6.0, h: 0.3, d: 3.2 }
    ]

    plinthConfigs.forEach(p => {
      const geo = new THREE.BoxGeometry(p.w, p.h, p.d)
      const mesh = new THREE.Mesh(geo, stoneMat)
      mesh.position.set(p.x, p.y, p.z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      envGroup.add(mesh)
    })

    // 4. 3D Miniature Bar Chart Pillars (Matching concept reference)
    const barMatBurgundy = new THREE.MeshStandardMaterial({ color: COLORS.burgundy, roughness: 0.25, metalness: 0.35 })
    const barMatGold = new THREE.MeshStandardMaterial({ color: COLORS.gold, roughness: 0.3, metalness: 0.85 })
    const barMatDark = new THREE.MeshStandardMaterial({ color: COLORS.burgundyDeep, roughness: 0.3, metalness: 0.4 })

    // Left Bar Cluster (Cloud & Data Metrics)
    const barsLeft = [
      { h: 2.2, mat: barMatBurgundy, x: -2.3, z: 0.3 },
      { h: 1.7, mat: barMatGold, x: -2.0, z: 0.3 },
      { h: 1.2, mat: barMatDark, x: -1.7, z: 0.3 }
    ]

    // Right Bar Cluster (AI Systems & High-Growth Metrics)
    const barsRight = [
      { h: 2.5, mat: barMatBurgundy, x: 1.7, z: 0.1 },
      { h: 2.0, mat: barMatGold, x: 2.0, z: 0.1 },
      { h: 1.5, mat: barMatDark, x: 2.3, z: 0.1 },
      { h: 1.0, mat: barMatBurgundy, x: 2.6, z: 0.1 }
    ]

    const allBars = [...barsLeft, ...barsRight]
    allBars.forEach(b => {
      const geo = new THREE.BoxGeometry(0.24, b.h, 0.24)
      const mesh = new THREE.Mesh(geo, b.mat)
      mesh.position.set(b.x, b.h / 2, b.z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      envGroup.add(mesh)
    })

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
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      mouseX += (targetX - mouseX) * 0.05
      mouseY += (targetY - mouseY) * 0.05

      camera.position.x = 0.2 + mouseX * 0.6
      camera.position.y = 3.4 + mouseY * 0.4
      camera.position.z = 7.4
      camera.lookAt(0, 0.5, 0)

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
    return null
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
    </div>
  )
}
