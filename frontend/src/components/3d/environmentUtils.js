import * as THREE from 'three'

// Non-negotiable Preserved Palette Colors
export const COLORS = {
  paper: 0xF3EFE6,
  surface: 0xFAF8F2,
  sandstone: 0xDFD8CB,
  sandstoneDark: 0xC8BFA8,
  rock: 0xBAAF9B,
  burgundy: 0x813744,
  burgundyDeep: 0x5A1822,
  burgundyLight: 0x9B4453,
  gold: 0xAD8C50,
  goldBright: 0xC5A869,
  goldDark: 0x8A6F3B,
  olive: 0x626B4F,
  crimsonTree: 0x7A2330,
  crimsonTreeDark: 0x4D131C,
  trunk: 0x3D352E,
  ink: 0x292923
}

/**
 * Creates an architectural crimson bonsai / autumn tree cluster
 * exactly matching the concept image's rich foliage.
 */
export function createCrimsonTree(scale = 1, options = {}) {
  const treeGroup = new THREE.Group()

  // Trunk & Branches (Dark weathered wood)
  const trunkMat = new THREE.MeshStandardMaterial({
    color: options.trunkColor || COLORS.trunk,
    roughness: 0.85,
    metalness: 0.1
  })

  const trunkGeo = new THREE.CylinderGeometry(0.04 * scale, 0.09 * scale, 0.9 * scale, 8)
  const trunk = new THREE.Mesh(trunkGeo, trunkMat)
  trunk.position.y = 0.45 * scale
  trunk.rotation.z = (Math.random() - 0.5) * 0.25
  trunk.rotation.x = (Math.random() - 0.5) * 0.2
  trunk.castShadow = true
  trunk.receiveShadow = true
  treeGroup.add(trunk)

  // Secondary Branch
  const branchGeo = new THREE.CylinderGeometry(0.02 * scale, 0.04 * scale, 0.5 * scale, 6)
  const branch = new THREE.Mesh(branchGeo, trunkMat)
  branch.position.set(0.12 * scale, 0.65 * scale, 0)
  branch.rotation.z = -0.6
  branch.castShadow = true
  treeGroup.add(branch)

  // Crimson Foliage Clouds
  const leavesMat1 = new THREE.MeshStandardMaterial({
    color: options.leafColor1 || COLORS.crimsonTree,
    roughness: 0.65,
    metalness: 0.15,
    flatShading: true
  })
  const leavesMat2 = new THREE.MeshStandardMaterial({
    color: options.leafColor2 || COLORS.crimsonTreeDark,
    roughness: 0.75,
    metalness: 0.1,
    flatShading: true
  })

  const cloudConfigs = [
    { x: 0, y: 0.9 * scale, z: 0, r: 0.38 * scale, mat: leavesMat1 },
    { x: 0.25 * scale, y: 0.82 * scale, z: 0.08 * scale, r: 0.3 * scale, mat: leavesMat2 },
    { x: -0.22 * scale, y: 0.78 * scale, z: -0.06 * scale, r: 0.28 * scale, mat: leavesMat1 },
    { x: 0.08 * scale, y: 1.15 * scale, z: -0.05 * scale, r: 0.24 * scale, mat: leavesMat1 },
    { x: -0.1 * scale, y: 0.98 * scale, z: 0.16 * scale, r: 0.22 * scale, mat: leavesMat2 }
  ]

  cloudConfigs.forEach(cfg => {
    const geo = new THREE.DodecahedronGeometry(cfg.r, 1)
    const mesh = new THREE.Mesh(geo, cfg.mat)
    mesh.position.set(cfg.x, cfg.y, cfg.z)
    mesh.scale.set(1.2, 0.85, 1.1)
    mesh.rotation.set(Math.random(), Math.random(), Math.random())
    mesh.castShadow = true
    mesh.receiveShadow = true
    treeGroup.add(mesh)
  })

  return treeGroup
}

/**
 * Creates rugged natural rock formations and cliff crags with deep facets.
 */
export function createRockyCliff(width = 4, height = 3, depth = 3, options = {}) {
  const cliffGroup = new THREE.Group()

  const rockMat = new THREE.MeshStandardMaterial({
    color: options.color || COLORS.rock,
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true
  })

  const boulderCount = options.count || 12
  for (let i = 0; i < boulderCount; i++) {
    const radius = 0.5 + Math.random() * 0.9
    const geo = new THREE.DodecahedronGeometry(radius, 1)
    const mesh = new THREE.Mesh(geo, rockMat)

    const rx = (Math.random() - 0.5) * width
    const ry = (Math.random() * 0.8) * height
    const rz = (Math.random() - 0.5) * depth

    mesh.position.set(rx, ry, rz)
    mesh.scale.set(1.0 + Math.random() * 0.6, 0.7 + Math.random() * 0.8, 1.0 + Math.random() * 0.6)
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    mesh.castShadow = true
    mesh.receiveShadow = true
    cliffGroup.add(mesh)
  }

  // Nest a crimson tree in the rock crevices if requested
  if (options.addTree) {
    const tree = createCrimsonTree(0.9)
    tree.position.set(width * 0.2, height * 0.7, depth * 0.1)
    cliffGroup.add(tree)
  }

  return cliffGroup
}

/**
 * Creates grand classical architectural arches receding into the distance
 * exactly like the arches on the right of the reference image.
 */
export function createClassicalArches() {
  const archGroup = new THREE.Group()

  const travertineMat = new THREE.MeshStandardMaterial({
    color: COLORS.sandstone,
    roughness: 0.7,
    metalness: 0.08
  })
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: COLORS.gold,
    roughness: 0.35,
    metalness: 0.8
  })

  // 3 Receding Triumphal Arches
  const archConfigs = [
    { x: 3.8, y: -0.2, z: -2.8, r: 2.2, tube: 0.28, rotY: -0.4 },
    { x: 5.5, y: -0.4, z: -5.2, r: 2.8, tube: 0.32, rotY: -0.55 },
    { x: 7.2, y: -0.6, z: -8.0, r: 3.4, tube: 0.38, rotY: -0.7 }
  ]

  archConfigs.forEach(cfg => {
    const singleArch = new THREE.Group()
    singleArch.position.set(cfg.x, cfg.y, cfg.z)
    singleArch.rotation.y = cfg.rotY

    // Semi-torus Arch curve
    const archGeo = new THREE.TorusGeometry(cfg.r, cfg.tube, 16, 48, Math.PI)
    const archMesh = new THREE.Mesh(archGeo, travertineMat)
    archMesh.position.y = cfg.r * 0.6
    archMesh.castShadow = true
    archMesh.receiveShadow = true
    singleArch.add(archMesh)

    // Supporting Colonnade Pillars
    const colGeo = new THREE.CylinderGeometry(cfg.tube * 1.1, cfg.tube * 1.25, cfg.r * 1.4, 24)
    const colLeft = new THREE.Mesh(colGeo, travertineMat)
    colLeft.position.set(-cfg.r, cfg.r * 0.3, 0)
    colLeft.castShadow = true
    colLeft.receiveShadow = true
    singleArch.add(colLeft)

    const colRight = new THREE.Mesh(colGeo, travertineMat)
    colRight.position.set(cfg.r, cfg.r * 0.3, 0)
    colRight.castShadow = true
    colRight.receiveShadow = true
    singleArch.add(colRight)

    // Golden Capital / Cornice band
    const capGeo = new THREE.BoxGeometry(cfg.tube * 3.2, 0.08, cfg.tube * 3.2)
    const capLeft = new THREE.Mesh(capGeo, goldTrimMat)
    capLeft.position.set(-cfg.r, cfg.r * 0.95, 0)
    singleArch.add(capLeft)

    const capRight = new THREE.Mesh(capGeo, goldTrimMat)
    capRight.position.set(cfg.r, cfg.r * 0.95, 0)
    singleArch.add(capRight)

    archGroup.add(singleArch)
  })

  return archGroup
}

/**
 * Creates distant mountain ridges that dissolve into the warm atmospheric fog.
 */
export function createDistantMountains() {
  const mountainGroup = new THREE.Group()
  const mountainMat = new THREE.MeshStandardMaterial({
    color: 0xC8BCA8,
    roughness: 0.95,
    metalness: 0.02,
    flatShading: true
  })

  // Layer 1: Mid-distance mountain peaks
  const peakConfigs = [
    { x: -5.5, y: -0.5, z: -11.0, r: 4.8, h: 4.5 },
    { x: -1.2, y: -0.6, z: -13.0, r: 6.2, h: 5.4 },
    { x: 3.5, y: -0.7, z: -14.0, r: 5.5, h: 4.8 },
    { x: 8.2, y: -0.8, z: -12.5, r: 5.8, h: 5.2 }
  ]

  peakConfigs.forEach(cfg => {
    const geo = new THREE.ConeGeometry(cfg.r, cfg.h, 6)
    const mesh = new THREE.Mesh(geo, mountainMat)
    mesh.position.set(cfg.x, cfg.y + cfg.h * 0.5, cfg.z)
    mesh.scale.set(1.4, 1.0, 0.9)
    mountainGroup.add(mesh)
  })

  return mountainGroup
}
