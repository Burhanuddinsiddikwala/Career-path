import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  COLORS,
  createCrimsonTree,
  createRockyCliff,
  createClassicalArches,
  createDistantMountains
} from './environmentUtils'

export default function HeroSculptureCanvas({ onBadgeClick }) {
  const containerRef = useRef(null)
  const [webglSupported, setWebglSupported] = useState(true)
  const [hoveredBadge, setHoveredBadge] = useState(null)

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

    let width = container.clientWidth || 880
    let height = container.clientHeight || 760

    const scene = new THREE.Scene()
    // Atmospheric warm distance fog matching the concept image
    scene.fog = new THREE.FogExp2(0xf3efe6, 0.036)

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    // Framed to capture the central sculpture on the center-right and environmental architecture
    camera.position.set(0.6, 1.4, 11.8)

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

    // Directional Sunlight with Shadows (Warm Golden Sun)
    const sunLight = new THREE.DirectionalLight(0xfff3df, 3.8)
    sunLight.position.set(7.5, 12, 8.5)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 30
    sunLight.shadow.camera.left = -8
    sunLight.shadow.camera.right = 8
    sunLight.shadow.camera.top = 8
    sunLight.shadow.camera.bottom = -8
    sunLight.shadow.bias = -0.0003
    scene.add(sunLight)

    // Soft Ambient Sky Fill
    const skyFill = new THREE.AmbientLight(0xf7ede2, 1.3)
    scene.add(skyFill)

    // Deep Burgundy Ambient Bounce Light (Adds rich contrast to shadows)
    const burgundyBounce = new THREE.DirectionalLight(0x813744, 1.9)
    burgundyBounce.position.set(-8, -3, -4)
    scene.add(burgundyBounce)

    // Environmental Groups
    // 1. Distant Mountain Ridge
    const mountains = createDistantMountains()
    scene.add(mountains)

    // 2. Classical Architectural Arches in Background
    const arches = createClassicalArches()
    scene.add(arches)

    // 3. Rocky Cliff on Right Edge with Crimson Bonsai Tree
    const cliff = createRockyCliff(3.2, 2.6, 2.8, { addTree: true })
    cliff.position.set(4.6, -1.8, -1.5)
    scene.add(cliff)

    // Master Hero Environment Group
    const heroEnvGroup = new THREE.Group()
    heroEnvGroup.position.set(0.4, 0, 0)
    scene.add(heroEnvGroup)

    // 4. Multi-Tiered Circular Sunlit Plaza & Stepped Dais
    const plazaGroup = new THREE.Group()
    plazaGroup.position.set(0, -2.1, 0)

    const stoneMat = new THREE.MeshStandardMaterial({
      color: COLORS.sandstone,
      roughness: 0.68,
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

    // Ground Terrace Foundation
    const groundGeo = new THREE.CylinderGeometry(8.5, 9.0, 0.4, 64)
    const ground = new THREE.Mesh(groundGeo, stoneMat)
    ground.position.y = -0.2
    ground.receiveShadow = true
    plazaGroup.add(ground)

    // Stepped Tier 1 Base
    const tier1Geo = new THREE.CylinderGeometry(4.6, 4.9, 0.22, 64)
    const tier1 = new THREE.Mesh(tier1Geo, stoneMat)
    tier1.position.y = 0.05
    tier1.castShadow = true
    tier1.receiveShadow = true
    plazaGroup.add(tier1)

    // Inset Burgundy Concentric Ring 1
    const ring1Geo = new THREE.TorusGeometry(4.4, 0.035, 16, 80)
    ring1Geo.rotateX(Math.PI / 2)
    const ring1Mesh = new THREE.Mesh(ring1Geo, burgundyMat)
    ring1Mesh.position.y = 0.17
    plazaGroup.add(ring1Mesh)

    // Stepped Tier 2 Mid
    const tier2Geo = new THREE.CylinderGeometry(3.6, 3.8, 0.2, 64)
    const tier2 = new THREE.Mesh(tier2Geo, stoneMat)
    tier2.position.y = 0.24
    tier2.castShadow = true
    tier2.receiveShadow = true
    plazaGroup.add(tier2)

    // Inset Gold Concentric Ring 2
    const ring2Geo = new THREE.TorusGeometry(3.4, 0.03, 16, 80)
    ring2Geo.rotateX(Math.PI / 2)
    const ring2Mesh = new THREE.Mesh(ring2Geo, goldMat)
    ring2Mesh.position.y = 0.35
    plazaGroup.add(ring2Mesh)

    // Stepped Tier 3 Top Dais
    const tier3Geo = new THREE.CylinderGeometry(2.6, 2.8, 0.18, 64)
    const tier3 = new THREE.Mesh(tier3Geo, stoneMat)
    tier3.position.y = 0.42
    tier3.castShadow = true
    tier3.receiveShadow = true
    plazaGroup.add(tier3)

    // Radial Stone Inlays
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      const studGeo = new THREE.SphereGeometry(0.05, 16, 16)
      const stud = new THREE.Mesh(studGeo, i % 2 === 0 ? goldMat : burgundyMat)
      stud.position.set(Math.cos(angle) * 4.2, 0.18, Math.sin(angle) * 4.2)
      stud.castShadow = true
      plazaGroup.add(stud)
    }

    heroEnvGroup.add(plazaGroup)

    // 5. Massive Central Career Intelligence Sculpture
    const sculptureGroup = new THREE.Group()
    sculptureGroup.position.set(0, 0.2, 0)
    sculptureGroup.scale.set(0.88, 0.88, 0.88)

    // Inner Glossy Lacquer Burgundy & White Marble Nucleus
    const nucleusGroup = new THREE.Group()

    const innerSphereGeo = new THREE.SphereGeometry(1.28, 64, 64)
    const innerSphereMat = new THREE.MeshStandardMaterial({
      color: COLORS.burgundy,
      roughness: 0.12,
      metalness: 0.4
    })
    const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat)
    innerSphere.castShadow = true
    nucleusGroup.add(innerSphere)

    // Curved Marble Interlocking Slices
    const marbleSliceGeo1 = new THREE.TorusGeometry(1.29, 0.065, 24, 80)
    marbleSliceGeo1.rotateY(Math.PI / 3)
    marbleSliceGeo1.rotateZ(0.4)
    const marbleMat = new THREE.MeshStandardMaterial({
      color: COLORS.surface,
      roughness: 0.18,
      metalness: 0.1
    })
    const marbleSlice1 = new THREE.Mesh(marbleSliceGeo1, marbleMat)
    nucleusGroup.add(marbleSlice1)

    // Golden Equatorial Girdle
    const goldEquatorGeo = new THREE.TorusGeometry(1.31, 0.04, 24, 80)
    goldEquatorGeo.rotateX(Math.PI / 2)
    const goldEquator = new THREE.Mesh(goldEquatorGeo, goldMat)
    nucleusGroup.add(goldEquator)

    // Thick Refractive Optical Glass Shell
    const glassShellGeo = new THREE.SphereGeometry(1.58, 64, 64)
    const glassShellMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.42,
      roughness: 0.04,
      metalness: 0.08,
      transmission: 0.92,
      thickness: 1.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    })
    const glassShell = new THREE.Mesh(glassShellGeo, glassShellMat)
    nucleusGroup.add(glassShell)

    sculptureGroup.add(nucleusGroup)

    // 6. Multi-Axis Metallic Bronze Orbital Gimbal Rings
    const ringsGroup = new THREE.Group()

    const ringMat1 = new THREE.MeshStandardMaterial({
      color: COLORS.goldBright,
      roughness: 0.22,
      metalness: 0.88
    })
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: COLORS.gold,
      roughness: 0.26,
      metalness: 0.84
    })
    const ringMat3 = new THREE.MeshStandardMaterial({
      color: COLORS.goldDark,
      roughness: 0.28,
      metalness: 0.86
    })

    // Heavy Orbital Ring 1
    const r1Geo = new THREE.TorusGeometry(2.55, 0.048, 24, 120)
    const ring1 = new THREE.Mesh(r1Geo, ringMat1)
    ring1.rotation.set(0.45, 0.72, 0.2)
    ring1.castShadow = true
    ringsGroup.add(ring1)

    // Heavy Orbital Ring 2
    const r2Geo = new THREE.TorusGeometry(2.95, 0.042, 24, 120)
    const ring2 = new THREE.Mesh(r2Geo, ringMat2)
    ring2.rotation.set(-0.8, 0.35, -0.5)
    ring2.castShadow = true
    ringsGroup.add(ring2)

    // Heavy Orbital Ring 3
    const r3Geo = new THREE.TorusGeometry(3.35, 0.038, 24, 120)
    const ring3 = new THREE.Mesh(r3Geo, ringMat3)
    ring3.rotation.set(0.9, -0.6, 0.85)
    ring3.castShadow = true
    ringsGroup.add(ring3)

    sculptureGroup.add(ringsGroup)

    // 7. Constellation Nodes & Golden Lattice
    const nodesGroup = new THREE.Group()
    const nodeGeo = new THREE.SphereGeometry(0.12, 24, 24)
    const nodeMat = new THREE.MeshStandardMaterial({
      color: COLORS.goldBright,
      roughness: 0.18,
      metalness: 0.92
    })

    const nodeCoords = [
      new THREE.Vector3(2.2, 1.1, 1.0),
      new THREE.Vector3(-2.1, 1.3, -0.8),
      new THREE.Vector3(-2.4, -0.9, 1.1),
      new THREE.Vector3(2.0, -1.4, -1.1),
      new THREE.Vector3(0.5, 2.7, 0.8),
      new THREE.Vector3(-0.8, -2.3, -1.4),
      new THREE.Vector3(2.8, 0.3, -0.6),
      new THREE.Vector3(-2.7, 0.5, 0.9)
    ]

    nodeCoords.forEach(pos => {
      const mesh = new THREE.Mesh(nodeGeo, nodeMat)
      mesh.position.copy(pos)
      mesh.castShadow = true
      nodesGroup.add(mesh)
    })

    // Connecting Golden Lattice Lines
    const linePoints = []
    for (let i = 0; i < nodeCoords.length; i++) {
      const nextIdx = (i + 1) % nodeCoords.length
      linePoints.push(nodeCoords[i], nodeCoords[nextIdx])
      if (i % 2 === 0) {
        const crossIdx = (i + 3) % nodeCoords.length
        linePoints.push(nodeCoords[i], nodeCoords[crossIdx])
      }
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints)
    const lineMat = new THREE.LineBasicMaterial({
      color: COLORS.gold,
      transparent: true,
      opacity: 0.55
    })
    const latticeLines = new THREE.LineSegments(lineGeo, lineMat)
    nodesGroup.add(latticeLines)

    sculptureGroup.add(nodesGroup)
    heroEnvGroup.add(sculptureGroup)

    // Interactive Parallax
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const relX = (e.clientX - rect.left) / rect.width - 0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5
      targetX = relX * 0.7
      targetY = -relY * 0.45
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    let scrollY = 0
    const handleScroll = () => {
      scrollY = window.scrollY || 0
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

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
      const delta = clock.getDelta()
      const time = clock.getElapsedTime()

      mouseX += (targetX - mouseX) * 0.05
      mouseY += (targetY - mouseY) * 0.05

      // Continuous majestic planetary rotation of rings
      ring1.rotation.z += delta * 0.16
      ring2.rotation.x -= delta * 0.12
      ring3.rotation.y += delta * 0.14

      // Central core breathing rotation
      innerSphere.rotation.y += delta * 0.2
      marbleSlice1.rotation.y += delta * 0.15
      glassShell.rotation.y -= delta * 0.08
      glassShell.position.y = Math.sin(time * 1.5) * 0.04

      // Subtle float on node lattice
      nodesGroup.rotation.y += delta * 0.06
      nodesGroup.rotation.x = Math.sin(time * 0.7) * 0.04

      // Camera & Environment Parallax
      camera.position.x = 0.6 + mouseX * 0.9
      camera.position.y = 1.4 + mouseY * 0.6 - (scrollY * 0.0006)
      camera.lookAt(0.3, 0.1, 0)

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
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
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: '180px', height: '180px', margin: '0 auto', border: '3px solid var(--accent-burgundy)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--accent-burgundy)' }}>CP</span>
          </div>
        </div>
      </div>
    )
  }

  const badges = [
    {
      id: 'careers',
      title: 'Explore Careers',
      desc: 'Find roles that fit you',
      icon: '◈',
      top: '16%',
      left: '2%',
      targetId: 'explore-scene'
    },
    {
      id: 'skills',
      title: 'Analyze Skills',
      desc: 'Discover gaps & strengths',
      icon: '▤',
      top: '62%',
      left: '6%',
      targetId: 'skills-scene'
    },
    {
      id: 'roadmap',
      title: 'Build Roadmap',
      desc: 'Turn plans into progress',
      icon: '⇱',
      top: '20%',
      right: '8%',
      targetId: 'roadmap-scene'
    },
    {
      id: 'guidance',
      title: 'Get AI Guidance',
      desc: 'Personalized career advice',
      icon: '✦',
      top: '66%',
      right: '6%',
      targetId: 'assistant-scene'
    }
  ]

  return (
    <div className="hero-3d-viewport" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '680px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }} />

      {/* Floating Interactive 3D Perspective Badges */}
      <div className="hero-badges-layer" style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
        {badges.map(badge => (
          <button
            key={badge.id}
            type="button"
            className={`hero-floating-badge ${hoveredBadge === badge.id ? 'active' : ''}`}
            style={{
              position: 'absolute',
              top: badge.top,
              left: badge.left,
              right: badge.right,
              pointerEvents: 'auto',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredBadge(badge.id)}
            onMouseLeave={() => setHoveredBadge(null)}
            onClick={() => onBadgeClick && onBadgeClick(badge.targetId)}
          >
            <div className="badge-icon-box">
              <span>{badge.icon}</span>
            </div>
            <div className="badge-text-box">
              <strong className="badge-title">{badge.title}</strong>
              <span className="badge-desc">{badge.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
