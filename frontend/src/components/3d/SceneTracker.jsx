import { useEffect, useState } from 'react'

export default function SceneTracker() {
  const [activeScene, setActiveScene] = useState('discover-scene')

  const scenes = [
    { id: 'discover-scene', label: 'Discover', idx: '01' },
    { id: 'skills-scene', label: 'Analyze', idx: '02' },
    { id: 'explore-scene', label: 'Explore', idx: '03' },
    { id: 'roadmap-scene', label: 'Plan', idx: '04' },
    { id: 'assistant-scene', label: 'Assistant', idx: '05' }
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35
      for (let i = scenes.length - 1; i >= 0; i--) {
        const el = document.getElementById(scenes[i].id)
        if (el && el.offsetTop <= scrollPos) {
          setActiveScene(scenes[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToScene = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="scene-tracker-dock" aria-label="3D Storyline Progress">
      <div className="scene-tracker-line" />
      {scenes.map(s => {
        const isActive = activeScene === s.id
        return (
          <button
            key={s.id}
            type="button"
            className={`scene-tracker-item ${isActive ? 'active' : ''}`}
            onClick={() => scrollToScene(s.id)}
            title={`Scroll to ${s.idx} ${s.label}`}
          >
            <span className="tracker-dot" />
            <span className="tracker-idx">{s.idx}</span>
            <span className="tracker-label">{s.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
