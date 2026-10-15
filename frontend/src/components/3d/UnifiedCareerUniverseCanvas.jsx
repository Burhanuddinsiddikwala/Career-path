import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  COLORS,
  createCrimsonTree,
  createRockyCliff,
  createClassicalArches,
  createDistantMountains
} from './environmentUtils'

/**
 * UnifiedCareerUniverseCanvas
 * 
 * One continuous, scroll-driven 3D architectural universe spanning all major
 * storytelling sections of the CareerPath AI platform.
 * 
 * Exact viewport-calibrated camera choreographies:
 * - Scene 01 (Discover): Sovereign Core positioned on right half, pristine negative space for typography
 * - Scene 02 (Analyze): Floating isometric ruby & glass crystal matrix with glowing edges
 * - Scene 03 (Explore): Classical colonnade arches & 3D metric growth towers framing role cards
 * - Scene 04 (Plan): Elevated mountain canyon vista overlooking winding highway ribbon & glowing waypoints
 * - Scene 05 (Assistant): Sacred AI Altar with levitating refractive glass ovoid framed in left column beside AI Console
 */
export default function UnifiedCareerUniverseCanvas({ activeWeek = 1 }) {
  const containerRef = useRef(null)
  const [webglSupported, setWebglSupported] = useState(true)

  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas')
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
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

    let width = window.innerWidth
    let height = window.innerHeight

    // 1. Scene & Warm Atmospheric Fog
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(COLORS.paper)
    scene.fog = new THREE.FogExp2(COLORS.paper, 0.015)

    // 2. Camera Setup (Adjust FOV for mobile)
    const isMobile = width < 768
    const camera = new THREE.PerspectiveCamera(isMobile ? 48 : 38, width / height, 0.1, 150)
    camera.position.set(0.6, 1.2, 7.2)
    camera.lookAt(1.8, 0.2, 0)

    // 3. Renderer with Filmic Tone Mapping & Crisp Shadows
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.25
      container.appendChild(renderer.domElement)
    } catch {
      setWebglSupported(false)
      return
    }

    // 4. Global Illumination Rig
    const sunLight = new THREE.DirectionalLight(0xfff5e4, 3.8)
    sunLight.position.set(12, 22, 14)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    sunLight.shadow.bias = -0.0003
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 120
    sunLight.shadow.camera.left = -25
    sunLight.shadow.camera.right = 25
    sunLight.shadow.camera.top = 25
    sunLight.shadow.camera.bottom = -25
    scene.add(sunLight)

    const skyLight = new THREE.AmbientLight(0xf7ede2, 1.45)
    scene.add(skyLight)

    const burgundyRimLight = new THREE.DirectionalLight(0x813744, 2.4)
    burgundyRimLight.position.set(-14, -4, -10)
    scene.add(burgundyRimLight)

    // Shared Materials
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
    const goldBrightMat = new THREE.MeshStandardMaterial({
      color: COLORS.goldBright,
      roughness: 0.2,
      metalness: 0.95
    })
    const burgundyMat = new THREE.MeshStandardMaterial({
      color: COLORS.burgundy,
      roughness: 0.22,
      metalness: 0.38
    })
    const darkBurgundyMat = new THREE.MeshStandardMaterial({
      color: COLORS.burgundyDeep,
      roughness: 0.25,
      metalness: 0.45
    })
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.42,
      roughness: 0.08,
      metalness: 0.05,
      transmission: 0.9,
      thickness: 0.8,
      clearcoat: 1.0
    })

    // Root World Group
    const universeGroup = new THREE.Group()
    scene.add(universeGroup)

    // =========================================================================
    // BACKGROUND ARCHITECTURAL CONTINUUM (Spans the entire scroll depth)
    // =========================================================================
    const mountain1 = createDistantMountains()
    mountain1.position.set(0, -1.0, -16)
    universeGroup.add(mountain1)

    const mountain2 = createDistantMountains()
    mountain2.position.set(-5, -5.0, -38)
    mountain2.scale.set(1.5, 1.4, 1.4)
    universeGroup.add(mountain2)

    const mountain3 = createDistantMountains()
    mountain3.position.set(6, -9.0, -68)
    mountain3.scale.set(2.0, 1.8, 1.8)
    universeGroup.add(mountain3)

    // Subtle Floating Golden Stardust Particles
    const particleCount = 200
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 32
      particlePositions[i * 3 + 1] = Math.random() * 10 - 15
      particlePositions[i * 3 + 2] = -Math.random() * 75
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: COLORS.goldBright,
      size: 0.12,
      transparent: true,
      opacity: 0.65
    })
    const dustParticles = new THREE.Points(particleGeo, particleMat)
    universeGroup.add(dustParticles)

    // =========================================================================
    // SECTOR 1: THE SOVEREIGN CORE (Hero - Z ≈ 0, Framed on Right)
    // =========================================================================
    const heroSector = new THREE.Group()
    heroSector.position.set(2.4, 0, 0)
    universeGroup.add(heroSector)

    const heroDaisGeo = new THREE.CylinderGeometry(2.4, 2.8, 0.35, 64)
    const heroDais = new THREE.Mesh(heroDaisGeo, stoneMat)
    heroDais.position.y = -1.2
    heroDais.receiveShadow = true
    heroSector.add(heroDais)

    const heroInnerDaisGeo = new THREE.CylinderGeometry(1.8, 1.95, 0.22, 64)
    const heroInnerDais = new THREE.Mesh(heroInnerDaisGeo, stoneMat)
    heroInnerDais.position.y = -0.92
    heroInnerDais.receiveShadow = true
    heroSector.add(heroInnerDais)

    const heroCoreGeo = new THREE.SphereGeometry(1.0, 64, 64)
    const heroCoreMesh = new THREE.Mesh(heroCoreGeo, burgundyMat)
    heroCoreMesh.castShadow = true
    heroSector.add(heroCoreMesh)

    const heroEquatorGeo = new THREE.TorusGeometry(1.02, 0.04, 20, 80)
    heroEquatorGeo.rotateX(Math.PI / 2)
    const heroEquator = new THREE.Mesh(heroEquatorGeo, stoneMat)
    heroSector.add(heroEquator)

    const ring1Geo = new THREE.TorusGeometry(1.65, 0.032, 20, 96)
    const ring1 = new THREE.Mesh(ring1Geo, goldMat)
    ring1.rotation.set(0.65, 0.4, 0)
    ring1.castShadow = true
    heroSector.add(ring1)

    const ring2Geo = new THREE.TorusGeometry(2.15, 0.026, 20, 96)
    const ring2 = new THREE.Mesh(ring2Geo, goldMat)
    ring2.rotation.set(-0.55, 0.85, 0.3)
    ring2.castShadow = true
    heroSector.add(ring2)

    const heroSatellites = []
    const satConfigs = [
      { r: 0.16, dist: 1.65, speed: 0.6, tilt: 0.65, mat: goldBrightMat },
      { r: 0.13, dist: 2.15, speed: -0.45, tilt: -0.55, mat: burgundyMat },
      { r: 0.11, dist: 1.9, speed: 0.75, tilt: 1.1, mat: goldBrightMat }
    ]
    satConfigs.forEach(cfg => {
      const satMesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.r, 24, 24), cfg.mat)
      satMesh.castShadow = true
      heroSector.add(satMesh)
      heroSatellites.push({ mesh: satMesh, ...cfg })
    })

    // Crimson trees tucked behind the dais to keep left side open for headline
    const heroTree1 = createCrimsonTree(0.72)
    heroTree1.position.set(-0.5, -0.9, -1.2)
    heroSector.add(heroTree1)

    const heroTree2 = createCrimsonTree(0.7)
    heroTree2.position.set(1.9, -0.9, -0.5)
    heroSector.add(heroTree2)

    // Far flanking cliffs
    const cliffHeroLeft = createRockyCliff(3.8, 2.6, 2.8, { count: 10, addTree: true, color: 0xc4b7a2 })
    cliffHeroLeft.position.set(-7.5, -1.8, -3.5)
    universeGroup.add(cliffHeroLeft)

    const cliffHeroRight = createRockyCliff(4.2, 3.2, 3.0, { count: 12, addTree: true, color: 0xbaa48e })
    cliffHeroRight.position.set(6.5, -0.8, -1.8)
    universeGroup.add(cliffHeroRight)

    const bgArches1 = createClassicalArches()
    bgArches1.position.set(4.0, -0.6, -6.5)
    universeGroup.add(bgArches1)

    // =========================================================================
    // SECTOR 2: THE SKILL LATTICE MATRIX (Skills Analysis - Z ≈ -16)
    // =========================================================================
    const skillsSector = new THREE.Group()
    skillsSector.position.set(2.4, -2.4, -16)
    universeGroup.add(skillsSector)

    const skillsDaisGeo = new THREE.BoxGeometry(4.8, 0.4, 4.8)
    const skillsDais = new THREE.Mesh(skillsDaisGeo, stoneMat)
    skillsDais.position.y = -1.2
    skillsDais.receiveShadow = true
    skillsSector.add(skillsDais)

    const skillsCliff = createRockyCliff(3.8, 3.2, 3.0, { count: 12, addTree: true, color: 0xbaa48e })
    skillsCliff.position.set(3.4, -0.8, -1.2)
    skillsSector.add(skillsCliff)

    const skillCubes = []
    const cubeConfigs = [
      { x: -0.8, y: 0.2, z: 0.6, s: 0.65, mat: burgundyMat, rotY: 0.4 },
      { x: 0.6, y: 0.65, z: 0.2, s: 0.8, mat: glassMat, rotY: -0.3 },
      { x: -0.2, y: 1.25, z: -0.4, s: 0.55, mat: goldMat, rotY: 0.8 },
      { x: 1.2, y: -0.1, z: 0.9, s: 0.6, mat: burgundyMat, rotY: 0.15 },
      { x: -1.3, y: -0.2, z: -0.2, s: 0.5, mat: glassMat, rotY: -0.6 },
      { x: 0.2, y: -0.3, z: -1.0, s: 0.7, mat: darkBurgundyMat, rotY: 0.5 },
      { x: 0.8, y: 1.4, z: -0.6, s: 0.45, mat: goldBrightMat, rotY: -0.4 }
    ]

    cubeConfigs.forEach((cfg, idx) => {
      const geo = new THREE.BoxGeometry(cfg.s, cfg.s, cfg.s)
      const mesh = new THREE.Mesh(geo, cfg.mat)
      mesh.position.set(cfg.x, cfg.y, cfg.z)
      mesh.rotation.set(0.35, cfg.rotY, 0.2)
      mesh.castShadow = true
      mesh.receiveShadow = true
      skillsSector.add(mesh)

      if (idx % 2 === 0) {
        const edgeGeo = new THREE.EdgesGeometry(geo)
        const edgeMat = new THREE.LineBasicMaterial({ color: COLORS.goldBright, linewidth: 1.5 })
        const wireframe = new THREE.LineSegments(edgeGeo, edgeMat)
        mesh.add(wireframe)
      }

      skillCubes.push({
        mesh,
        baseY: cfg.y,
        speed: 1.2 + idx * 0.25,
        rotSpeed: 0.008 + (idx % 3) * 0.004
      })
    })

    const gridLineMat = new THREE.LineBasicMaterial({ color: COLORS.gold, transparent: true, opacity: 0.4 })
    const linePoints = [
      new THREE.Vector3(-0.8, 0.2, 0.6),
      new THREE.Vector3(0.6, 0.65, 0.2),
      new THREE.Vector3(-0.2, 1.25, -0.4),
      new THREE.Vector3(0.8, 1.4, -0.6),
      new THREE.Vector3(1.2, -0.1, 0.9)
    ]
    const gridLineGeo = new THREE.BufferGeometry().setFromPoints(linePoints)
    const gridLines = new THREE.Line(gridLineGeo, gridLineMat)
    skillsSector.add(gridLines)

    // =========================================================================
    // SECTOR 3: THE CAREER COLONNADE & BENCHMARK PILLARS (Z ≈ -32)
    // =========================================================================
    const careersSector = new THREE.Group()
    careersSector.position.set(2.2, -5.2, -32)
    universeGroup.add(careersSector)

    const careerArches = createClassicalArches()
    careerArches.position.set(1.4, 0.2, -4.5)
    careersSector.add(careerArches)

    const terr1 = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.4, 4.2), stoneMat)
    terr1.position.set(0, -1.4, 0)
    terr1.receiveShadow = true
    careersSector.add(terr1)

    const terr2 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.35, 3.2), stoneMat)
    terr2.position.set(-0.4, -1.05, 0.2)
    terr2.receiveShadow = true
    careersSector.add(terr2)

    const barPillars = [
      { h: 2.8, x: -1.6, z: 0.4, mat: burgundyMat },
      { h: 2.2, x: -1.15, z: 0.4, mat: goldMat },
      { h: 1.6, x: -0.7, z: 0.4, mat: darkBurgundyMat },
      { h: 3.2, x: 1.2, z: 0.2, mat: burgundyMat },
      { h: 2.6, x: 1.65, z: 0.2, mat: goldBrightMat },
      { h: 1.9, x: 2.1, z: 0.2, mat: darkBurgundyMat },
      { h: 1.3, x: 2.55, z: 0.2, mat: burgundyMat }
    ]

    barPillars.forEach(bp => {
      const geo = new THREE.BoxGeometry(0.32, bp.h, 0.32)
      const mesh = new THREE.Mesh(geo, bp.mat)
      mesh.position.set(bp.x, -1.05 + bp.h / 2, bp.z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      careersSector.add(mesh)

      const capGeo = new THREE.BoxGeometry(0.36, 0.06, 0.36)
      const capMesh = new THREE.Mesh(capGeo, goldBrightMat)
      capMesh.position.set(bp.x, -1.05 + bp.h + 0.03, bp.z)
      careersSector.add(capMesh)
    })

    const careerTree = createCrimsonTree(0.8)
    careerTree.position.set(0.2, -0.85, 0.8)
    careersSector.add(careerTree)

    // =========================================================================
    // SECTOR 4: THE CANYON PASS & HIGHWAY RIBBON (Roadmap - Z ≈ -48)
    // =========================================================================
    const roadmapSector = new THREE.Group()
    roadmapSector.position.set(1.4, -8.6, -48)
    universeGroup.add(roadmapSector)

    const passCliffLeft = createRockyCliff(5.2, 4.5, 4.2, { count: 18, addTree: true, color: 0xbaa48e })
    passCliffLeft.position.set(-5.6, -1.2, -0.6)
    roadmapSector.add(passCliffLeft)

    const passCliffRight = createRockyCliff(5.5, 4.8, 4.5, { count: 20, addTree: true, color: 0xc4b7a2 })
    passCliffRight.position.set(5.2, -0.8, -2.4)
    roadmapSector.add(passCliffRight)

    const passTree1 = createCrimsonTree(0.85)
    passTree1.position.set(-2.5, 0.2, 1.0)
    roadmapSector.add(passTree1)

    const passTree2 = createCrimsonTree(0.95)
    passTree2.position.set(2.4, 0.8, -0.8)
    roadmapSector.add(passTree2)

    const highwayPoints = [
      new THREE.Vector3(-3.4, -0.5, 2.8),
      new THREE.Vector3(-1.8, -0.15, 1.4),
      new THREE.Vector3(-0.3, 0.22, 0.3),
      new THREE.Vector3(1.2, 0.58, -0.6),
      new THREE.Vector3(2.6, 1.05, -1.6),
      new THREE.Vector3(3.6, 1.5, -2.8)
    ]
    const highwayCurve = new THREE.CatmullRomCurve3(highwayPoints)

    const curbGeo = new THREE.TubeGeometry(highwayCurve, 100, 0.40, 16, false)
    const curbMesh = new THREE.Mesh(curbGeo, stoneMat)
    curbMesh.position.y = -0.14
    curbMesh.castShadow = true
    curbMesh.receiveShadow = true
    roadmapSector.add(curbMesh)

    const roadGeo = new THREE.TubeGeometry(highwayCurve, 100, 0.32, 16, false)
    const roadMesh = new THREE.Mesh(roadGeo, burgundyMat)
    roadMesh.castShadow = true
    roadMesh.receiveShadow = true
    roadmapSector.add(roadMesh)

    const railGeo = new THREE.TubeGeometry(highwayCurve, 100, 0.045, 12, false)
    const railMesh = new THREE.Mesh(railGeo, goldBrightMat)
    railMesh.position.y = 0.32
    roadmapSector.add(railMesh)

    const milestoneRatios = [0.08, 0.38, 0.68, 0.95]
    const waypointOrbs = []

    milestoneRatios.forEach((ratio, idx) => {
      const pt = highwayCurve.getPointAt(ratio)
      const wpGroup = new THREE.Group()
      wpGroup.position.copy(pt)

      const wpPlinthGeo = new THREE.CylinderGeometry(0.36, 0.44, 0.24, 24)
      const wpPlinth = new THREE.Mesh(wpPlinthGeo, stoneMat)
      wpPlinth.position.y = 0.12
      wpPlinth.castShadow = true
      wpPlinth.receiveShadow = true
      wpGroup.add(wpPlinth)

      const wpHaloGeo = new THREE.TorusGeometry(0.34, 0.026, 16, 32)
      wpHaloGeo.rotateX(Math.PI / 2)
      const wpHalo = new THREE.Mesh(wpHaloGeo, goldMat)
      wpHalo.position.y = 0.25
      wpGroup.add(wpHalo)

      const isSelected = activeWeek === (idx + 1)
      const orbMat = new THREE.MeshStandardMaterial({
        color: isSelected ? COLORS.goldBright : (idx % 2 === 0 ? COLORS.burgundy : COLORS.gold),
        metalness: 0.88,
        roughness: 0.16,
        emissive: isSelected ? COLORS.gold : 0x000000,
        emissiveIntensity: isSelected ? 0.45 : 0.0
      })
      const wpOrb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 24), orbMat)
      wpOrb.position.y = 0.34
      wpOrb.castShadow = true
      wpGroup.add(wpOrb)

      roadmapSector.add(wpGroup)
      waypointOrbs.push({ group: wpGroup, orb: wpOrb, ratio, idx })
    })

    const traveler = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xffe8b0 })
    )
    const travelerLight = new THREE.PointLight(0xffe8b0, 3.2, 6)
    traveler.add(travelerLight)
    roadmapSector.add(traveler)

    // =========================================================================
    // SECTOR 5: THE SOVEREIGN AI SANCTUM (AI Partner - Z ≈ -66, Framed on Left)
    // =========================================================================
    const aiSector = new THREE.Group()
    aiSector.position.set(-2.8, -15.8, -66)
    universeGroup.add(aiSector)

    const aiBaseDais = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.4, 0.24, 64), stoneMat)
    aiBaseDais.position.y = -1.6
    aiBaseDais.receiveShadow = true
    aiSector.add(aiBaseDais)

    const aiMidDais = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.22, 64), stoneMat)
    aiMidDais.position.y = -1.38
    aiMidDais.receiveShadow = true
    aiSector.add(aiMidDais)

    const aiRimGeo = new THREE.TorusGeometry(2.28, 0.026, 16, 64)
    aiRimGeo.rotateX(Math.PI / 2)
    const aiRim = new THREE.Mesh(aiRimGeo, burgundyMat)
    aiRim.position.y = -1.27
    aiSector.add(aiRim)

    const aiBonsai = createCrimsonTree(0.72)
    aiBonsai.position.set(1.5, -1.26, 0.5)
    aiSector.add(aiBonsai)

    const zenStone1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 1), stoneMat)
    zenStone1.position.set(1.15, -1.2, 0.85)
    zenStone1.scale.set(1.4, 0.6, 1.0)
    aiSector.add(zenStone1)

    const aiOrbGroup = new THREE.Group()
    aiOrbGroup.position.set(0, 0.35, 0)
    aiSector.add(aiOrbGroup)

    const ovoidGeo = new THREE.SphereGeometry(1.18, 64, 64)
    ovoidGeo.scale(1.0, 1.28, 1.0)
    const ovoidMesh = new THREE.Mesh(ovoidGeo, burgundyMat)
    ovoidMesh.castShadow = true
    aiOrbGroup.add(ovoidMesh)

    const ribbonInlayGeo = new THREE.TorusGeometry(1.20, 0.048, 24, 80)
    ribbonInlayGeo.rotateX(0.75)
    ribbonInlayGeo.rotateY(0.45)
    const ribbonInlayMesh = new THREE.Mesh(ribbonInlayGeo, stoneMat)
    aiOrbGroup.add(ribbonInlayMesh)

    const eqInlayGeo = new THREE.TorusGeometry(1.22, 0.034, 24, 80)
    eqInlayGeo.rotateX(Math.PI / 2)
    const eqInlayMesh = new THREE.Mesh(eqInlayGeo, goldMat)
    aiOrbGroup.add(eqInlayMesh)

    const outerGlassGeo = new THREE.SphereGeometry(1.34, 64, 64)
    outerGlassGeo.scale(1.0, 1.28, 1.0)
    const outerGlassMesh = new THREE.Mesh(outerGlassGeo, glassMat)
    aiOrbGroup.add(outerGlassMesh)

    const aiHaloRingGeo = new THREE.TorusGeometry(1.85, 0.026, 20, 80)
    aiHaloRingGeo.rotateX(0.85)
    aiHaloRingGeo.rotateZ(0.3)
    const aiHaloRing = new THREE.Mesh(aiHaloRingGeo, goldBrightMat)
    aiHaloRing.castShadow = true
    aiOrbGroup.add(aiHaloRing)

    const aiAuraLight = new THREE.PointLight(COLORS.goldBright, 2.5, 12)
    aiAuraLight.position.set(0, 0.35, 0)
    aiSector.add(aiAuraLight)

    // =========================================================================
    // CAMERA CHOREOGRAPHY: EXACT SECTION-ANCHORED SPLINE
    // =========================================================================
    const cameraPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.6, 1.2, 7.2),     // 0.00: Hero (sculpture on right at X=2.4)
      new THREE.Vector3(1.6, 0.0, 1.0),     // 0.12: transition
      new THREE.Vector3(2.4, -1.8, -10.5),  // 0.25: Skills Matrix (cubes at X=2.4)
      new THREE.Vector3(2.0, -3.2, -19.0),  // 0.38: transition
      new THREE.Vector3(1.4, -4.6, -26.5),  // 0.50: Career Pedestals & Arches (pillars at X=2.2)
      new THREE.Vector3(1.5, -5.8, -35.5),  // 0.62: transition
      new THREE.Vector3(1.6, -6.5, -40.5),  // 0.75: Roadmap Ribbon Highway (elevated vista over highway at X=1.4)
      new THREE.Vector3(0.5, -9.8, -51.5),  // 0.88: transition to left sanctum
      new THREE.Vector3(-0.6, -13.5, -59.5) // 1.00: AI Sanctum (frames altar at X=-2.8 on lower left)
    ])

    const lookAtPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.8, 0.2, 0.0),     // Hero center
      new THREE.Vector3(2.0, -0.6, -5.0),
      new THREE.Vector3(2.4, -2.4, -16.0),  // Skills focus
      new THREE.Vector3(2.0, -3.8, -23.0),
      new THREE.Vector3(2.2, -5.0, -32.0),  // Career pillars focus
      new THREE.Vector3(1.8, -6.8, -38.0),
      new THREE.Vector3(1.4, -8.2, -47.5),  // Roadmap curve focus
      new THREE.Vector3(-0.8, -11.5, -57.5),
      new THREE.Vector3(-2.4, -15.4, -66.0) // AI Ovoid focus on lower left
    ])

    // Accurate Viewport Document Offset Tracking
    const sceneIds = ['discover-scene', 'skills-scene', 'explore-scene', 'roadmap-scene', 'assistant-scene']
    let targetScrollProgress = 0
    let smoothedScrollProgress = 0
    let mouseX = 0
    let mouseY = 0
    let targetMouseX = 0
    let targetMouseY = 0

    const handleScroll = () => {
      const elements = sceneIds.map(id => document.getElementById(id)).filter(Boolean)
      if (elements.length < 2) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        if (maxScroll > 0) {
          targetScrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1)
        }
        return
      }

      const scrollY = window.scrollY
      const tops = elements.map(el => el.getBoundingClientRect().top + window.scrollY)

      if (scrollY <= tops[0]) {
        targetScrollProgress = 0
        return
      }
      if (scrollY >= tops[tops.length - 1]) {
        targetScrollProgress = 1
        return
      }

      for (let i = 0; i < tops.length - 1; i++) {
        const start = tops[i]
        const end = tops[i + 1]
        if (scrollY >= start && scrollY < end) {
          const ratio = (scrollY - start) / (end - start)
          targetScrollProgress = (i + ratio) / (tops.length - 1)
          return
        }
      }
    }

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.4
      targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 0.3
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      camera.aspect = width / height
      camera.fov = width < 768 ? 48 : 38
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      handleScroll()
    }
    window.addEventListener('resize', handleResize)

    handleScroll()

    // Animation Loop
    let animationFrameId
    const currentCamPos = new THREE.Vector3(0.6, 1.2, 7.2)
    const currentLookAt = new THREE.Vector3(1.8, 0.2, 0.0)
    let startTime = performance.now()

    const animate = (now) => {
      animationFrameId = requestAnimationFrame(animate)
      const time = (now - startTime) * 0.001

      // Dynamic Lerp Damping
      smoothedScrollProgress += (targetScrollProgress - smoothedScrollProgress) * 0.12
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      const clampedProgress = Math.min(Math.max(smoothedScrollProgress, 0), 1)
      const targetCam = cameraPath.getPointAt(clampedProgress)
      const targetLook = lookAtPath.getPointAt(clampedProgress)

      currentCamPos.lerp(targetCam, 0.12)
      currentLookAt.lerp(targetLook, 0.12)

      camera.position.set(
        currentCamPos.x + mouseX * 0.5,
        currentCamPos.y + mouseY * 0.35,
        currentCamPos.z
      )
      camera.lookAt(currentLookAt)

      // Sector 1 Animations
      heroCoreMesh.rotation.y = time * 0.15
      ring1.rotation.z += 0.004
      ring2.rotation.x += 0.003
      heroSatellites.forEach(sat => {
        const angle = time * sat.speed
        sat.mesh.position.set(
          Math.cos(angle) * sat.dist,
          Math.sin(angle) * sat.dist * Math.sin(sat.tilt),
          Math.sin(angle) * sat.dist * Math.cos(sat.tilt)
        )
      })

      // Sector 2 Animations
      skillCubes.forEach(sc => {
        sc.mesh.position.y = sc.baseY + Math.sin(time * sc.speed) * 0.06
        sc.mesh.rotation.y += sc.rotSpeed
      })

      // Sector 4 Animations
      const highwayProgress = (time * 0.16) % 1
      const travelerPos = highwayCurve.getPointAt(highwayProgress)
      traveler.position.copy(travelerPos)
      traveler.position.y += 0.32

      waypointOrbs.forEach(wp => {
        wp.group.position.y = highwayCurve.getPointAt(wp.ratio).y + Math.sin(time * 2 + wp.idx) * 0.025
      })

      // Sector 5 Animations
      aiOrbGroup.position.y = 0.35 + Math.sin(time * 1.4) * 0.07
      aiOrbGroup.rotation.y = time * 0.16 + mouseX * 0.4
      aiHaloRing.rotation.z += 0.006

      // Ambient Dust Drift
      dustParticles.rotation.y = time * 0.015

      renderer.render(scene, camera)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
        renderer.dispose()
      }
      scene.clear()
    }
  }, [activeWeek])

  if (!webglSupported) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="unified-3d-universe-canvas"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    />
  )
}
