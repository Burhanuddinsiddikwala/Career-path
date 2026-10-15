import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import CareerDetailModal from '../components/CareerDetailModal'
import UnifiedCareerUniverseCanvas from '../components/3d/UnifiedCareerUniverseCanvas'
import AIPartnerConsole from '../components/3d/AIPartnerConsole'
import SceneTracker from '../components/3d/SceneTracker'

export default function LandingPage() {
  const [sampleJobs, setSampleJobs] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [demoSkills, setDemoSkills] = useState(['Python', 'SQL', 'React', 'Git'])
  const [demoSkillInput, setDemoSkillInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)
  const [activeWeek, setActiveWeek] = useState(1)

  // Fetch jobs for live interactive matching
  useEffect(() => {
    api.get('/api/jobs')
      .then(res => setSampleJobs(res.data.jobs || []))
      .catch(() => {})
  }, [])

  const handleAddSkill = (skillToAdd) => {
    const val = (skillToAdd || demoSkillInput).trim()
    if (val && !demoSkills.some(s => s.toLowerCase() === val.toLowerCase())) {
      setDemoSkills([...demoSkills, val])
      setDemoSkillInput('')
    }
  }

  const handleRemoveSkill = (skill) => {
    setDemoSkills(demoSkills.filter(s => s !== skill))
  }

  const scrollToScene = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const presetSkills = ['Docker', 'AWS', 'PostgreSQL', 'TypeScript', 'Machine Learning', 'Figma', 'Linux', 'Kubernetes']
  const categories = ['All', 'Engineering', 'Data & AI', 'Cloud & Systems', 'Product']

  const filteredJobs = sampleJobs.filter(job => {
    if (selectedCategory === 'All') return true
    if (selectedCategory === 'Engineering') return job.category?.includes('Software') || job.category?.includes('Development')
    if (selectedCategory === 'Data & AI') return job.category?.includes('Data') || job.category?.includes('Machine Learning')
    if (selectedCategory === 'Cloud & Systems') return job.category?.includes('DevOps') || job.category?.includes('Cloud') || job.category?.includes('Security')
    if (selectedCategory === 'Product') return job.category?.includes('Product') || job.category?.includes('Design')
    return true
  })

  // Curated showcase roles matching the visual reference panel
  const showcaseRoles = [
    {
      id: sampleJobs[0]?.id || 1,
      title: 'AI Systems Engineer',
      category: 'Data & AI',
      tags: ['AI', 'Machine Learning'],
      matchScore: 92,
      salary: '$140k – $190k'
    },
    {
      id: sampleJobs[1]?.id || 2,
      title: 'Data Analyst & Modeling',
      category: 'Analytics',
      tags: ['Data', 'Analytics'],
      matchScore: 78,
      salary: '$105k – $145k'
    },
    {
      id: sampleJobs[2]?.id || 3,
      title: 'Cloud DevOps Associate',
      category: 'Cloud & Systems',
      tags: ['Cloud', 'Infrastructure'],
      matchScore: 64,
      salary: '$115k – $160k'
    }
  ]

  const roadmapWeeks = [
    {
      week: 1,
      title: 'Learn Foundations',
      focus: 'Language specifications, concurrency models, and algorithmic time complexity.',
      resources: ['Official MDN Standards', 'Python PEP Architecture', 'Clean Architecture Patterns']
    },
    {
      week: 2,
      title: 'Build Core Competencies',
      focus: 'High-throughput database indexing, schema migrations, and REST/gRPC API protocols.',
      resources: ['PostgreSQL Indexing Deep-Dive', 'Redis In-Memory Caching', 'FastAPI Production Guides']
    },
    {
      week: 3,
      title: 'Apply in Real Context',
      focus: 'Containerized deployment pipelines, Docker orchestration, and cloud observability.',
      resources: ['Docker Multi-stage Builds', 'AWS ECS / Kubernetes Pods', 'Prometheus & Grafana Metrics']
    },
    {
      week: 4,
      title: 'Showcase & Grow',
      focus: 'Portfolio deployment verification, STAR interview narrative tuning, and XYZ resume calibration.',
      resources: ['Google XYZ Impact Framework', 'STAR Behavioral Preparation', 'System Design Monograph']
    }
  ]

  // Perspective floating badges for Scene 01 (Hero)
  const heroBadges = [
    { id: 'skills-scene', label: '95% Match Accuracy', desc: 'Competency Calibration', top: '16%', left: '8%', icon: '✦' },
    { id: 'explore-scene', label: '12K+ Role Models', desc: 'Industry Benchmarks', top: '22%', right: '6%', icon: '◈' },
    { id: 'roadmap-scene', label: '30-Day Curricula', desc: 'Structured Milestones', bottom: '26%', left: '10%', icon: '▲' },
    { id: 'assistant-scene', label: 'AI Autonomous Guidance', desc: 'Real-time Mentor Advice', bottom: '18%', right: '8%', icon: '●' }
  ]

  // Spatial floating badges for Scene 02 (Skills)
  const skillBadges = [
    { label: 'Cloud Architecture', score: '94%', top: '14%', left: '10%' },
    { label: 'Deep Learning / ML', score: '88%', top: '32%', right: '8%' },
    { label: 'Distributed Systems', score: '91%', bottom: '22%', left: '14%' },
    { label: 'System Optimization', score: '86%', bottom: '12%', right: '12%' }
  ]

  // Spatial waypoint badges for Scene 04 (Roadmap)
  const roadmapMilestones = [
    { week: 1, label: 'Week 1', desc: 'Learn Foundations', top: '70%', left: '8%' },
    { week: 2, label: 'Week 2', desc: 'Build Core Competencies', top: '48%', left: '30%' },
    { week: 3, label: 'Week 3', desc: 'Apply in Real Context', top: '30%', right: '32%' },
    { week: 4, label: 'Week 4', desc: 'Showcase & Grow', top: '14%', right: '8%' }
  ]

  return (
    <div className="landing-shell cinematic-universe-shell">
      {/* 
        ONE CONTINUOUS 3D CAREER UNIVERSE:
        Fixed full-viewport background canvas spanning all storytelling sections.
        Camera travels along a 3D architectural spline synchronized to user scroll.
      */}
      <UnifiedCareerUniverseCanvas activeWeek={activeWeek} />

      {/* Floating 3D Scene Storyline Navigation */}
      <SceneTracker />

      {/* Editorial Folio Strip */}
      <div className="landing-folio" style={{ position: 'relative', zIndex: 10 }}>
        <span>CAREERPATH AI · THE EDITORIAL CAREER INTELLIGENCE PLATFORM</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
          <span className="status-dot online" />
          <span>CONTINUOUS 3D CAREER UNIVERSE ACTIVE</span>
        </span>
        <span>ALIGNED WITH UN SUSTAINABLE DEVELOPMENT GOAL 8</span>
      </div>

      <div className="landing-container" style={{ position: 'relative', zIndex: 10 }}>
        {/* Masthead Navigation Bar */}
        <header className="landing-nav-bar">
          <Link to="/" className="landing-brand-link">
            <span className="landing-brand-title">CAREERPATH AI</span>
            <span className="landing-brand-sub">THE DIGITAL CAREER INTELLIGENCE DISPATCH</span>
          </Link>
          <nav className="landing-nav-links">
            <button type="button" onClick={() => scrollToScene('discover-scene')} style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
              Discover
            </button>
            <button type="button" onClick={() => scrollToScene('skills-scene')} style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
              Skills
            </button>
            <button type="button" onClick={() => scrollToScene('explore-scene')} style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
              Careers
            </button>
            <button type="button" onClick={() => scrollToScene('roadmap-scene')} style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
              Roadmap
            </button>
            <button type="button" onClick={() => scrollToScene('assistant-scene')} style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
              AI Assistant
            </button>
            <Link to="/login" style={{ marginLeft: '1rem', fontWeight: 600 }}>Sign In</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.55rem 1.35rem', fontSize: '0.85rem' }}>
              Get Started →
            </Link>
          </nav>
        </header>

        {/* ==========================================================================
            SCENE 01: DISCOVER YOUR POTENTIAL
            Matching Reference: Map Your Next+ Horizon with 3D Central Sovereign Core
            ========================================================================== */}
        <section className="cinematic-scene-section" id="discover-scene" style={{ borderTop: 0, paddingTop: '2.5rem' }}>
          <div className="cinematic-scene-grid">
            <div>
              <div className="hero-pill-badge" style={{ marginBottom: '1.25rem' }}>
                <span className="hero-pulsing-dot" />
                <span>01 / DISCOVER · CAREER INTELLIGENCE PLATFORM</span>
              </div>

              <h1 className="cinematic-hero-headline">
                <span className="hero-display-arch">Map</span><br />
                <span className="hero-display-sans">Your </span>
                <span className="hero-display-serif">Next<span className="hero-plus-accent">+</span></span><br />
                <span className="hero-display-serif-italic">Horizon</span>
              </h1>

              <p className="landing-deck" style={{ maxWidth: '540px', fontSize: '1.15rem', lineHeight: 1.6, color: 'var(--ink-secondary)', marginBottom: '2.25rem' }}>
                AI-powered career intelligence that turns your skills, interests, and goals into real opportunities.
              </p>

              <div className="landing-cta-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link to="/register" className="btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '0.92rem' }}>
                  Start Your Journey →
                </Link>
                <button
                  type="button"
                  onClick={() => scrollToScene('skills-scene')}
                  className="btn-secondary"
                  style={{ padding: '0.85rem 1.5rem', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                >
                  <span style={{ display: 'inline-flex', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(129,55,68,0.12)', color: 'var(--accent-burgundy)', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700 }}>▶</span>
                  <span>See It in Motion</span>
                </button>
              </div>

              {/* Stat Strip matching Visual Reference */}
              <div className="cinematic-stat-strip">
                <div className="cinematic-stat-item">
                  <span className="cinematic-stat-num">12K+</span>
                  <span className="cinematic-stat-label">Career Pathways</span>
                </div>
                <div className="cinematic-stat-item">
                  <span className="cinematic-stat-num">95%</span>
                  <span className="cinematic-stat-label">Skill Mapping Accuracy</span>
                </div>
                <div className="cinematic-stat-item">
                  <span className="cinematic-stat-num">30-Day</span>
                  <span className="cinematic-stat-label">Personalized Roadmaps</span>
                </div>
                <div className="cinematic-stat-item">
                  <span className="cinematic-stat-num">∞</span>
                  <span className="cinematic-stat-label">Lifelong Growth</span>
                </div>
              </div>
            </div>

            {/* Spatial Overlay Framing Sector 1 (Sovereign Core Sculpture in 3D Universe) */}
            <div className="cinematic-scene-viewport" style={{ height: '700px', width: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {heroBadges.map(b => (
                  <div
                    key={b.id}
                    className="hero-floating-badge"
                    style={{
                      position: 'absolute',
                      top: b.top,
                      bottom: b.bottom,
                      left: b.left,
                      right: b.right,
                      pointerEvents: 'auto',
                      cursor: 'pointer'
                    }}
                    onClick={() => scrollToScene(b.id)}
                    title={`Scroll to ${b.label}`}
                  >
                    <div className="badge-icon-box">
                      <span>{b.icon}</span>
                    </div>
                    <div className="badge-text-box">
                      <strong className="badge-title">{b.label}</strong>
                      <span className="badge-desc">{b.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            SCENE 02: UNDERSTAND YOUR SKILLS
            Matching Reference: See Your Skills Clearly framing the 3D Skill Lattice
            ========================================================================== */}
        <section className="cinematic-scene-section" id="skills-scene">
          <div className="cinematic-scene-grid">
            <div>
              <div className="hero-pill-badge" style={{ marginBottom: '1rem' }}>
                <span className="hero-pulsing-dot" />
                <span>02 / ANALYZE · COMPETENCY CALIBRATION</span>
              </div>

              <h2 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', lineHeight: 1.1, margin: '0.5rem 0 1rem', fontWeight: 400 }}>
                See Your <span style={{ color: 'var(--accent-burgundy)', fontWeight: 600 }}>Skills</span> Clearly
              </h2>

              <p style={{ fontSize: '1.05rem', color: 'var(--ink-secondary)', lineHeight: 1.65, maxWidth: '520px', marginBottom: '2rem' }}>
                Visualize your strengths, identify gaps, and understand where you stand against real industry benchmarks.
              </p>

              {/* Live Interactive Skill Calibrator Chips */}
              <div style={{ background: 'rgba(250, 248, 242, 0.92)', backdropFilter: 'blur(14px)', border: '1px solid var(--rule-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.75rem', boxShadow: 'var(--shadow-card)' }}>
                <span className="field-label" style={{ marginBottom: '0.75rem' }}>
                  ACTIVE COMPETENCY LEDGER ({demoSkills.length})
                </span>
                <div className="chip-list" style={{ minHeight: '44px', marginBottom: '1rem' }}>
                  {demoSkills.map(skill => (
                    <button
                      key={skill}
                      className="chip"
                      onClick={() => handleRemoveSkill(skill)}
                      title="Click to remove competency"
                    >
                      {skill} <span style={{ marginLeft: '4px', opacity: 0.7 }}>✕</span>
                    </button>
                  ))}
                </div>

                <div className="add-row">
                  <input
                    type="text"
                    value={demoSkillInput}
                    onChange={e => setDemoSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Type a skill (e.g. Docker, AWS, PyTorch)..."
                    aria-label="Add technical competency"
                  />
                  <button onClick={() => handleAddSkill()} className="btn-secondary" style={{ padding: '0.55rem 1.15rem' }}>
                    Add Skill
                  </button>
                </div>

                <div style={{ marginTop: '1.25rem' }}>
                  <span className="field-label" style={{ fontSize: '0.72rem' }}>QUICK-ADD BENCHMARK SKILLS</span>
                  <div className="landing-preset-chips" style={{ marginTop: '0.4rem' }}>
                    {presetSkills.map(skill => (
                      <button
                        key={skill}
                        className="landing-preset-btn"
                        onClick={() => handleAddSkill(skill)}
                        disabled={demoSkills.some(s => s.toLowerCase() === skill.toLowerCase())}
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Link to="/register" className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.92rem' }}>
                  Analyze My Skills →
                </Link>
              </div>
            </div>

            {/* Spatial Overlay Framing Sector 2 (3D Floating Ruby & Glass Cubes in Background) */}
            <div className="cinematic-scene-viewport" style={{ height: '580px', width: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {skillBadges.map(b => (
                  <div
                    key={b.label}
                    className="hero-floating-badge"
                    style={{
                      position: 'absolute',
                      top: b.top,
                      bottom: b.bottom,
                      left: b.left,
                      right: b.right,
                      padding: '0.55rem 0.95rem'
                    }}
                  >
                    <div className="badge-icon-box" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                      <span>✦</span>
                    </div>
                    <div className="badge-text-box">
                      <strong className="badge-title" style={{ fontSize: '0.82rem' }}>{b.label}</strong>
                      <span className="badge-desc" style={{ color: 'var(--accent-burgundy)', fontWeight: 600 }}>{b.score} Benchmark Match</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            SCENE 03: FIND YOUR CAREER PATH
            Matching Reference: Careers That Match Your Potential with Interactive Role Cards
            ========================================================================== */}
        <section className="cinematic-scene-section" id="explore-scene">
          <div className="cinematic-scene-grid">
            <div>
              <div className="hero-pill-badge" style={{ marginBottom: '1rem' }}>
                <span className="hero-pulsing-dot" />
                <span>03 / EXPLORE · INDUSTRY BENCHMARKS</span>
              </div>

              <h2 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', lineHeight: 1.1, margin: '0.5rem 0 1rem', fontWeight: 400 }}>
                Careers That Match<br />
                <span style={{ color: 'var(--accent-burgundy)', fontWeight: 600 }}>Your Potential</span>
              </h2>

              <p style={{ fontSize: '1.05rem', color: 'var(--ink-secondary)', lineHeight: 1.65, maxWidth: '520px', marginBottom: '2rem' }}>
                Explore industry-vetted career paths with real requirements, skill benchmarks, and growth insights.
              </p>

              {/* Filter Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`btn-secondary ${selectedCategory === cat ? 'active' : ''}`}
                    style={{
                      padding: '0.45rem 1rem',
                      fontSize: '0.82rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: selectedCategory === cat ? 'var(--accent-burgundy)' : 'var(--surface-primary)',
                      color: selectedCategory === cat ? '#FAF8F2' : 'var(--ink-primary)',
                      borderColor: selectedCategory === cat ? 'var(--accent-burgundy)' : 'var(--rule-subtle)'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <Link to="/careers" className="btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '0.92rem' }}>
                Explore Career Paths →
              </Link>
            </div>

            {/* Interactive Role Cards Stack Layered Over 3D Colonnade & Metric Towers */}
            <div className="cinematic-scene-viewport" style={{ position: 'relative', width: '100%', minHeight: '520px', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {showcaseRoles.map(role => (
                  <div
                    key={role.title}
                    className="cinematic-role-card"
                    onClick={() => setSelectedRole(role.id)}
                    title="Click to inspect role monograph"
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                        <strong style={{ fontSize: '1.15rem', color: 'var(--ink-primary)' }}>{role.title}</strong>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.65rem' }}>
                        {role.tags.map(t => (
                          <span key={t} className="comp-tag" style={{ fontSize: '0.72rem', padding: '0.18rem 0.55rem' }}>
                            {t}
                          </span>
                        ))}
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginLeft: '0.4rem', alignSelf: 'center' }}>
                          {role.salary}
                        </span>
                      </div>

                      {/* Match Meter Bar */}
                      <div className="skill-meter-track" style={{ height: '6px', width: '100%' }}>
                        <div
                          className="skill-meter-fill"
                          style={{
                            width: `${role.matchScore}%`,
                            backgroundColor: role.matchScore >= 75 ? 'var(--accent-olive)' : 'var(--accent-burgundy)'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-burgundy)' }}>
                        {role.matchScore}%
                      </span>
                      <button
                        type="button"
                        className="cinematic-role-action-btn"
                        aria-label={`Inspect ${role.title}`}
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                    Click any role card to inspect sovereign monograph & AI mentor evaluation.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            SCENE 04: BUILD YOUR ROADMAP
            Matching Reference: A Roadmap Built for You framing the 3D Winding Ribbon Highway
            ========================================================================== */}
        <section className="cinematic-scene-section" id="roadmap-scene">
          <div className="cinematic-scene-grid">
            <div>
              <div className="hero-pill-badge" style={{ marginBottom: '1rem' }}>
                <span className="hero-pulsing-dot" />
                <span>04 / PLAN · STRUCTURED 30-DAY CURRICULUM</span>
              </div>

              <h2 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', lineHeight: 1.1, margin: '0.5rem 0 1rem', fontWeight: 400 }}>
                A Roadmap<br />
                <span style={{ color: 'var(--accent-burgundy)', fontWeight: 600 }}>Built for You</span>
              </h2>

              <p style={{ fontSize: '1.05rem', color: 'var(--ink-secondary)', lineHeight: 1.65, maxWidth: '520px', marginBottom: '2rem' }}>
                Get a structured 30-day learning plan with curated resources, hands-on projects, and milestones tailored to your goals.
              </p>

              {/* Milestone Details Box */}
              <div style={{ background: 'rgba(250, 248, 242, 0.92)', backdropFilter: 'blur(14px)', border: '1px solid var(--rule-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.75rem', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {roadmapWeeks.map(w => (
                    <button
                      key={w.week}
                      type="button"
                      className={`btn-secondary ${activeWeek === w.week ? 'active' : ''}`}
                      onClick={() => setActiveWeek(w.week)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.78rem',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: activeWeek === w.week ? 'var(--accent-burgundy)' : 'var(--surface-secondary)',
                        color: activeWeek === w.week ? '#FAF8F2' : 'var(--ink-primary)',
                        borderColor: activeWeek === w.week ? 'var(--accent-burgundy)' : 'var(--rule-subtle)'
                      }}
                    >
                      Week {w.week}
                    </button>
                  ))}
                </div>

                <div style={{ minHeight: '90px' }}>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--accent-burgundy)', marginBottom: '0.35rem' }}>
                    {roadmapWeeks[activeWeek - 1].title}
                  </strong>
                  <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', margin: '0 0 0.85rem', lineHeight: 1.55 }}>
                    {roadmapWeeks[activeWeek - 1].focus}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {roadmapWeeks[activeWeek - 1].resources.map(r => (
                      <span key={r} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', background: 'var(--bg-paper)', border: '1px solid var(--rule-subtle)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-xs)', color: 'var(--ink-primary)' }}>
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Link to="/register" className="btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '0.92rem' }}>
                  View My Roadmap →
                </Link>
              </div>
            </div>

            {/* Spatial Overlay Framing Sector 4 (Winding Highway Ribbon in 3D Universe) */}
            <div className="cinematic-scene-viewport" style={{ height: '580px', width: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {roadmapMilestones.map(m => (
                  <div
                    key={m.week}
                    className={`hero-floating-badge ${activeWeek === m.week ? 'active' : ''}`}
                    style={{
                      position: 'absolute',
                      top: m.top,
                      left: m.left,
                      right: m.right,
                      pointerEvents: 'auto',
                      cursor: 'pointer',
                      padding: '0.55rem 0.95rem'
                    }}
                    onClick={() => setActiveWeek(m.week)}
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
          </div>
        </section>

        {/* ==========================================================================
            SCENE 05: TAKE ACTION & AI PARTNER
            Matching Reference: Your AI Career Partner with 3D Sculptural Altar in Background
            ========================================================================== */}
        <section className="cinematic-scene-section" id="assistant-scene">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem' }}>
            <div className="hero-pill-badge" style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
              <span className="hero-pulsing-dot" />
              <span>05 / ASSISTANT · AUTONOMOUS CAREER MENTOR</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2.4rem, 4.2vw, 3.6rem)', lineHeight: 1.1, margin: '0.4rem 0 0.85rem', fontWeight: 400 }}>
              Your AI <span style={{ color: 'var(--accent-burgundy)', fontWeight: 600 }}>Career Partner</span>
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
              Ask questions, get personalized advice, and turn insights into real next steps.
            </p>
          </div>

          <div className="cinematic-scene-grid" style={{ alignItems: 'center' }}>
            {/* Spatial Window into Sector 5 (3D Breathing AI Ovoid Altar) */}
            <div className="cinematic-scene-viewport" style={{ height: '520px', width: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div className="hero-floating-badge" style={{ padding: '0.75rem 1.25rem', pointerEvents: 'auto' }}>
                  <div className="badge-icon-box" style={{ background: 'var(--accent-burgundy)', color: '#FAF8F2' }}>
                    <span>✦</span>
                  </div>
                  <div className="badge-text-box">
                    <strong className="badge-title">AI Sovereign Desk</strong>
                    <span className="badge-desc">Dual-engine reasoning calibrated against employer standards</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Conversational AI Dialogue Card */}
            <div>
              <AIPartnerConsole />
            </div>
          </div>
        </section>

        {/* Closing Inscription Call to Action */}
        <section style={{ padding: '6.5rem 0', textAlign: 'center', borderTop: '1px solid rgba(212, 205, 192, 0.4)' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', background: 'rgba(250, 248, 242, 0.94)', backdropFilter: 'blur(16px)', border: '1px solid rgba(41, 41, 35, 0.08)', padding: '4rem 2.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-elevated)' }}>
            <span className="panel-kicker burgundy">COMMENCE YOUR ROADMAP</span>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 400, margin: '0.5rem 0 0.85rem', color: 'var(--ink-primary)' }}>
              Begin Your Professional Calibration
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--ink-secondary)', lineHeight: 1.65, marginBottom: '2.5rem' }}>
              Create your profile in 60 seconds. Quantify skill gaps, generate your 30-day curriculum, and consult the sovereign advisory desk.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '0.95rem' }}>
                Create Calibrated Account →
              </Link>
              <Link to="/login" className="btn-secondary" style={{ padding: '0.9rem 1.6rem', fontSize: '0.95rem' }}>
                Sign In to Existing Dossier
              </Link>
            </div>
          </div>
        </section>

        {/* Fully Designed Cinematic Footer */}
        <footer className="landing-footer" style={{ background: 'rgba(250, 248, 242, 0.92)', backdropFilter: 'blur(16px)' }}>
          <div className="landing-footer-grid">
            <div className="landing-footer-brand">
              <h4>CAREERPATH AI</h4>
              <div className="landing-footer-sub">THE DIGITAL CAREER INTELLIGENCE DISPATCH</div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--ink-secondary)', maxWidth: '420px', margin: 0 }}>
                Academic and professional career intelligence platform. Standardized roles and requirements represent benchmark educational profiles rather than live commercial job postings.
              </p>
              <div className="status-beacon-pill">
                <span className="status-dot online" />
                <span>All Systems Operational · Dual-Engine AI Active</span>
              </div>
            </div>

            <div className="landing-footer-col">
              <h5>Platform Coordinates</h5>
              <div className="landing-footer-links">
                <Link to="/dashboard">Executive Briefing</Link>
                <Link to="/careers">Role Catalogue</Link>
                <Link to="/skills">Competency Ledger</Link>
                <Link to="/roadmap">30-Day Curricula</Link>
                <Link to="/calendar">Study Calendar</Link>
                <Link to="/chat">AI Advisory Desk</Link>
              </div>
            </div>

            <div className="landing-footer-col">
              <h5>Governance & Trust</h5>
              <div className="landing-footer-links">
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
                <Link to="/login">Account Access</Link>
                <Link to="/register">Create Dossier</Link>
                <button type="button" onClick={() => scrollToScene('assistant-scene')} style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
                  AI Guidance Ethics
                </button>
              </div>
            </div>

            <div className="landing-footer-col">
              <h5>Dispatch Subscription</h5>
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '1rem' }}>
                Receive notifications when new role specifications or curricula updates are published.
              </p>
              {newsletterSubscribed ? (
                <div style={{ color: 'var(--color-success)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                  ✓ Inscription Confirmed
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (newsletterEmail) setNewsletterSubscribed(true)
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    style={{
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.82rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--rule-subtle)',
                      backgroundColor: 'var(--bg-paper)',
                      color: 'var(--ink-primary)',
                      outline: 'none'
                    }}
                  />
                  <button type="submit" className="btn-secondary" style={{ padding: '0.45rem', fontSize: '0.78rem' }}>
                    Subscribe to Dispatch
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="landing-footer-bottom">
            <span>© 2026 CAREERPATH AI · ALL RIGHTS RESERVED · FOUNDATIONAL EDITION</span>
            <span>IN CONSCIOUS SUPPORT OF UN SUSTAINABLE DEVELOPMENT GOAL 8</span>
          </div>
        </footer>
      </div>

      {/* Role Monograph Modal */}
      {selectedRole && (
        <CareerDetailModal
          roleId={selectedRole}
          onClose={() => setSelectedRole(null)}
        />
      )}
    </div>
  )
}
