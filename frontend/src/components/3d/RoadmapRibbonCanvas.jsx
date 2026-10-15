import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { COLORS, createCrimsonTree, createRockyCliff, createDistantMountains } from './environmentUtils'

export default function RoadmapRibbonCanvas({ activeWeek, onSelectWeek }) {
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

    let width = container.clientWidth || 740
    let height = container.clientHeight || 580

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0xf3efe6, 0.034)

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
    camera.position.set(0.4, 5.8, 10.2)
    camera.lookAt(0.1, 0.3, 0)

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
    sunLight.position.set(6, 12, 8)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    sunLight.shadow.bias = -0.0003
    scene.add(sunLight)

    const skyFill = new THREE.AmbientLight(0xf7ede2, 1.3)
    scene.add(skyFill)

    const burgundyRim = new THREE.DirectionalLight(0x813744, 1.8)
    burgundyRim.position.set(-6, -2, -4)
    scene.add(burgundyRim)

    const envGroup = new THREE.Group()
    scene.add(envGroup)

    // 1. Distant Mountain Peaks
    const mountains = createDistantMountains()
    mountains.position.set(0, -0.5, -4)
    envGroup.add(mountains)

    // 2. Rugged Mountain Cliffs & Crags framing the pass
    // Left Mountain Ridge
    const leftCliff = createRockyCliff(4.5, 3.5, 3.5, { count: 16, addTree: true, color: 0xbaa48e })
    leftCliff.position.set(-4.6, -1.2, -0.4)
    envGroup.add(leftCliff)

    // Right Mountain Summit
    const rightCliff = createRockyCliff(4.8, 4.2, 4.0, { count: 18, addTree: true, color: 0xc4b7a2 })
    rightCliff.position.set(4.6, -0.6, -1.8)
    envGroup.add(rightCliff)

    // Crimson Bonsai Trees along the Pass
    const tree1 = createCrimsonTree(0.75)
    tree1.position.set(-2.2, 0.1, 0.6)
    envGroup.add(tree1)

    const tree2 = createCrimsonTree(0.85)
    tree2.position.set(2.2, 0.65, -0.6)
    envGroup.add(tree2)

    // 3. Winding Highway Ribbon through Mountain Pass
    const curvePoints = [
      new THREE.Vector3(-3.4, -0.4, 2.4),
      new THREE.Vector3(-1.8, -0.15, 1.2),
      new THREE.Vector3(-0.3, 0.15, 0.3),
      new THREE.Vector3(1.2, 0.5, -0.4),
      new THREE.Vector3(2.6, 0.9, -1.4),
      new THREE.Vector3(3.6, 1.3, -2.4)
    ]
    const curve = new THREE.CatmullRomCurve3(curvePoints)

    // Curbs / Retaining Wall Foundation (Travertine stone underneath)
    const curbMat = new THREE.MeshStandardMaterial({
      color: COLORS.sandstone,
      roughness: 0.72,
      metalness: 0.1
    })
    const curbGeo = new THREE.TubeGeometry(curve, 100, 0.40, 16, false)
    const curbMesh = new THREE.Mesh(curbGeo, curbMat)
    curbMesh.position.y = -0.12
    curbMesh.castShadow = true
    curbMesh.receiveShadow = true
    envGroup.add(curbMesh)

    // Rich Burgundy Asphalt Road Surface (Prominent on top)
    const roadMat = new THREE.MeshStandardMaterial({
      color: COLORS.burgundy,
      roughness: 0.22,
      metalness: 0.45
    })
    const roadGeo = new THREE.TubeGeometry(curve, 100, 0.32, 16, false)
    const roadMesh = new THREE.Mesh(roadGeo, roadMat)
    roadMesh.castShadow = true
    roadMesh.receiveShadow = true
    envGroup.add(roadMesh)

    // Golden Centerline Guide Rail (Gleaming crest)
    const railMat = new THREE.MeshStandardMaterial({
      color: COLORS.goldBright,
      roughness: 0.22,
      metalness: 0.92
    })
    const railGeo = new THREE.TubeGeometry(curve, 100, 0.045, 12, false)
    const railMesh = new THREE.Mesh(railGeo, railMat)
    railMesh.position.y += 0.32
    envGroup.add(railMesh)

    // 4. Elevated Milestone Waypoint Pavilions (Week 1 to 4)
    const milestoneRatios = [0.08, 0.38, 0.68, 0.95]
    const waypointGroups = []

    milestoneRatios.forEach((ratio, idx) => {
      const pt = curve.getPointAt(ratio)
      const group = new THREE.Group()
      group.position.copy(pt)

      // Stone Plinth Pedestal
      const plinthGeo = new THREE.CylinderGeometry(0.35, 0.42, 0.22, 24)
      const plinth = new THREE.Mesh(plinthGeo, curbMat)
      plinth.position.y = 0.12
      plinth.castShadow = true
      plinth.receiveShadow = true
      group.add(plinth)

      // Golden Halo Ring
      const ringGeo = new THREE.TorusGeometry(0.32, 0.024, 16, 32)
      ringGeo.rotateX(Math.PI / 2)
      const ring = new THREE.Mesh(ringGeo, railMat)
      ring.position.y = 0.24
      group.add(ring)

      // Glowing Lantern Orb
      const orbGeo = new THREE.SphereGeometry(0.14, 24, 24)
      const orbMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? COLORS.burgundy : COLORS.goldBright,
        metalness: 0.85,
        roughness: 0.18
      })
      const orb = new THREE.Mesh(orbGeo, orbMat)
      orb.position.y = 0.32
      orb.castShadow = true
      group.add(orb)

      envGroup.add(group)
      waypointGroups.push(group)
    })

    // Animated Traveler Light traversing the highway
    const travelerGeo = new THREE.SphereGeometry(0.12, 20, 20)
    const travelerMat = new THREE.MeshBasicMaterial({ color: 0xffe8b0 })
    const traveler = new THREE.Mesh(travelerGeo, travelerMat)
    const travelerLight = new THREE.PointLight(0xffe8b0, 3.2, 5)
    traveler.add(travelerLight)
    envGroup.add(traveler)

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

      camera.position.x = 0.6 + mouseX * 0.7
      camera.position.y = 4.8 + mouseY * 0.4
      camera.position.z = 9.4
      camera.lookAt(0.1, 0.5, 0)

      // Traveler light traversing the curve smoothly
      const progress = (time * 0.16) % 1
      const pos = curve.getPointAt(progress)
      traveler.position.copy(pos)
      traveler.position.y += 0.28

      // Waypoints gentle breathing
      waypointGroups.forEach((wp, idx) => {
        wp.position.y = curve.getPointAt(milestoneRatios[idx]).y + Math.sin(time * 2 + idx) * 0.03
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
            [3D Mountain Pass & Winding Learning Highway]
          </span>
        </div>
      </div>
    )
  }

  const milestones = [
    { week: 1, label: 'Week 1', desc: 'Learn Foundations', top: '70%', left: '8%' },
    { week: 2, label: 'Week 2', desc: 'Build Core Competencies', top: '48%', left: '30%' },
    { week: 3, label: 'Week 3', desc: 'Apply in Real Context', top: '30%', right: '32%' },
    { week: 4, label: 'Week 4', desc: 'Showcase & Grow', top: '14%', right: '8%' }
  ]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '560px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }} />

      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        {milestones.map(m => (
          <div
            key={m.week}
            className="hero-floating-badge"
            style={{
              position: 'absolute',
              top: m.top,
              left: m.left,
              right: m.right,
              pointerEvents: 'auto',
              cursor: 'pointer',
              padding: '0.55rem 0.95rem'
            }}
            onClick={() => onSelectWeek && onSelectWeek(m.week)}
          >
            <div className="badge-icon-box" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
              <span>W{m.week}</span>
            </div>
            <div className="badge-text-box">
              <strong className="badge-title" style={{ fontSize: '0.85rem' }}>{m.label}</strong>
              <span className="badge-desc">{m.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
