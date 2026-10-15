import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { COLORS, createRockyCliff } from './environmentUtils'

export default function SkillCubesCanvas({ onSelectCategory }) {
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

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100)
    camera.position.set(6.2, 5.5, 8.2)
    camera.lookAt(0, 0.4, 0)

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
    sunLight.position.set(8, 12, 7)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    sunLight.shadow.bias = -0.0003
    scene.add(sunLight)

    const skyFill = new THREE.AmbientLight(0xf5ece0, 1.3)
    scene.add(skyFill)

    const rubyGlow = new THREE.PointLight(0x813744, 2.8, 10)
    rubyGlow.position.set(0, 1.8, 0)
    scene.add(rubyGlow)

    // Master Environment Group
    const envGroup = new THREE.Group()
    scene.add(envGroup)

    // 1. Natural Sandstone Cliff with Crimson Bonsai on the right
    const cliff = createRockyCliff(3.5, 3.0, 3.0, { addTree: true, color: 0xc4b7a2 })
    cliff.position.set(3.8, -0.4, -1.8)
    envGroup.add(cliff)

    // 2. Stepped Travertine Foundation Terrace
    const terraceMat = new THREE.MeshStandardMaterial({
      color: COLORS.sandstone,
      roughness: 0.72,
      metalness: 0.08
    })

    const baseGeo1 = new THREE.BoxGeometry(7.2, 0.35, 7.2)
    const base1 = new THREE.Mesh(baseGeo1, terraceMat)
    base1.position.y = -0.18
    base1.receiveShadow = true
    envGroup.add(base1)

    const baseGeo2 = new THREE.BoxGeometry(5.6, 0.25, 5.6)
    const base2 = new THREE.Mesh(baseGeo2, terraceMat)
    base2.position.y = 0.12
    base2.castShadow = true
    base2.receiveShadow = true
    envGroup.add(base2)

    // Golden Inset Perspective Grid Lines
    const gridHelper = new THREE.GridHelper(5.4, 8, COLORS.gold, COLORS.goldDark)
    gridHelper.position.y = 0.26
    gridHelper.material.opacity = 0.45
    gridHelper.material.transparent = true
    envGroup.add(gridHelper)

    // 3. Four Stacked Isometric Ruby & Frosted Glass Cubes
    const cubeConfigs = [
      { id: 'tech', label: 'Technical', x: -0.95, z: -0.95, h: 2.1, color: COLORS.burgundy, targetH: 2.1 },
      { id: 'soft', label: 'Soft Skills', x: 0.95, z: -0.95, h: 1.5, color: COLORS.olive, targetH: 1.5 },
      { id: 'tools', label: 'Tools', x: -0.95, z: 0.95, h: 1.35, color: COLORS.gold, targetH: 1.35 },
      { id: 'domain', label: 'Domain', x: 0.95, z: 0.95, h: 0.95, color: COLORS.burgundyLight, targetH: 0.95 }
    ]

    const cubeItems = []

    cubeConfigs.forEach(cfg => {
      const group = new THREE.Group()
      group.position.set(cfg.x, 0.25, cfg.z)

      // Inner Glowing Ruby / Obsidian Core Cube
      const innerGeo = new THREE.BoxGeometry(0.85, cfg.h * 0.78, 0.85)
      const innerMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.18,
        metalness: 0.45
      })
      const innerCube = new THREE.Mesh(innerGeo, innerMat)
      innerCube.position.y = (cfg.h * 0.78) / 2 + 0.05
      innerCube.castShadow = true
      innerCube.receiveShadow = true
      group.add(innerCube)

      // Outer Heavy Refractive Glass Cube
      const outerGeo = new THREE.BoxGeometry(1.15, cfg.h, 1.15)
      const outerMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
        roughness: 0.08,
        metalness: 0.08,
        transmission: 0.88,
        thickness: 0.8,
        clearcoat: 1.0
      })
      const outerCube = new THREE.Mesh(outerGeo, outerMat)
      outerCube.position.y = cfg.h / 2 + 0.05
      outerCube.castShadow = true
      group.add(outerCube)

      // Golden Edge Wireframe
      const edges = new THREE.EdgesGeometry(outerGeo)
      const edgeLine = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: COLORS.goldBright, transparent: true, opacity: 0.7 })
      )
      edgeLine.position.y = cfg.h / 2 + 0.05
      group.add(edgeLine)

      // Golden Node Bead on Top Center
      const beadGeo = new THREE.SphereGeometry(0.08, 16, 16)
      const beadMat = new THREE.MeshStandardMaterial({ color: COLORS.goldBright, metalness: 0.9, roughness: 0.2 })
      const bead = new THREE.Mesh(beadGeo, beadMat)
      bead.position.y = cfg.h + 0.15
      bead.castShadow = true
      group.add(bead)

      envGroup.add(group)
      cubeItems.push({ group, cfg })
    })

    // Golden Connector Vector Lines between Cubes
    const connectorPoints = [
      new THREE.Vector3(-0.95, 2.2, -0.95),
      new THREE.Vector3(0.95, 1.6, -0.95),
      new THREE.Vector3(0.95, 1.05, 0.95),
      new THREE.Vector3(-0.95, 1.45, 0.95),
      new THREE.Vector3(-0.95, 2.2, -0.95)
    ]
    const connectorGeo = new THREE.BufferGeometry().setFromPoints(connectorPoints)
    const connectorMat = new THREE.LineBasicMaterial({ color: COLORS.gold, transparent: true, opacity: 0.65 })
    const connectorLine = new THREE.Line(connectorGeo, connectorMat)
    envGroup.add(connectorLine)

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

      camera.position.x = 6.2 + mouseX * 0.8
      camera.position.y = 5.5 + mouseY * 0.5
      camera.lookAt(0, 0.4, 0)

      // Breathing lift on cubes
      cubeItems.forEach((item, idx) => {
        item.group.position.y = 0.25 + Math.sin(time * 1.5 + idx * 0.8) * 0.035
      })

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
            [Isometric Competency Lattice]
          </span>
        </div>
      </div>
    )
  }

  const badges = [
    { id: 'tech', label: 'Technical Skills', match: '76% Match', icon: '</>', top: '6%', right: '8%' },
    { id: 'soft', label: 'Soft Skills', match: '62% Match', icon: '◎', top: '34%', left: '2%' },
    { id: 'tools', label: 'Tools & Technologies', match: '58% Match', icon: '▤', bottom: '12%', left: '6%' },
    { id: 'domain', label: 'Domain Knowledge', match: '41% Match', icon: '◈', bottom: '16%', right: '10%' }
  ]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }} />

      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        {badges.map(b => (
          <div
            key={b.id}
            className="hero-floating-badge"
            style={{
              position: 'absolute',
              top: b.top,
              left: b.left,
              right: b.right,
              bottom: b.bottom,
              pointerEvents: 'auto',
              cursor: 'pointer',
              padding: '0.6rem 1.05rem'
            }}
            onClick={() => onSelectCategory && onSelectCategory(b.id)}
          >
            <div className="badge-icon-box" style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>
              <span>{b.icon}</span>
            </div>
            <div className="badge-text-box">
              <strong className="badge-title" style={{ fontSize: '0.85rem' }}>{b.label}</strong>
              <span className="badge-desc" style={{ color: 'var(--accent-burgundy)', fontWeight: 600 }}>{b.match}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
