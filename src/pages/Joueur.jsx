import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getState, subscribe } from '../lib/store.js'
import { STATS_CONFIG } from '../lib/supabase.js'

const s = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 50% -20%, #1a0f2e 0%, #0d0b0f 60%)',
    padding: '1.5rem',
    maxWidth: '500px',
    margin: '0 auto',
  },
  back: {
    background: 'transparent',
    color: 'var(--muted)',
    fontSize: '0.9rem',
    padding: '0.3rem 0',
    marginBottom: '1.5rem',
    display: 'block',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  nom: {
    fontFamily: 'var(--font-title)',
    fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
    color: 'var(--gold)',
    textShadow: '0 0 30px rgba(201,168,76,0.35)',
    marginBottom: '0.2rem',
  },
  classe: { color: 'var(--muted)', fontStyle: 'italic' },
  pvCard: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.2rem 1.5rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pvLabel: { color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.2rem' },
  pvVal: { fontSize: '2rem', fontWeight: 600, color: 'var(--danger)', lineHeight: 1 },
  pvMax: { color: 'var(--muted)', fontSize: '0.9rem' },
  pvBar: {
    height: '6px',
    background: 'var(--border)',
    borderRadius: '3px',
    marginTop: '0.8rem',
    overflow: 'hidden',
  },
  argent: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1rem 1.5rem',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  argentVal: { fontSize: '1.6rem', color: 'var(--gold2)', fontWeight: 600 },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.8rem',
  },
  statCard: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  statHeader: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--muted)' },
  statVal: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.1 },
}

export default function Joueur() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [personnages, setPersonnages] = useState(getState().personnages)

  useEffect(() => subscribe(st => setPersonnages(st.personnages)), [])

  const p = personnages.find(x => x.id === Number(id))
  if (!p) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Personnage introuvable.</div>

  const pvPct = Math.max(0, Math.min(100, (p.pv_actuel / p.pv_max) * 100))
  const pvColor = pvPct > 60 ? 'var(--success)' : pvPct > 30 ? '#f0c060' : 'var(--danger)'

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate('/')}>← Retour</button>

      <div style={s.header}>
        <div style={s.nom}>{p.nom}</div>
        <div style={s.classe}>{p.classe}</div>
      </div>

      <div style={s.pvCard}>
        <div>
          <div style={s.pvLabel}>Points de Vie</div>
          <div style={{ ...s.pvVal, color: pvColor }}>{p.pv_actuel}</div>
          <div style={s.pvMax}>/ {p.pv_max}</div>
        </div>
        <div style={{ fontSize: '2.5rem' }}>❤️</div>
      </div>
      <div style={s.pvBar}>
        <div style={{ height: '100%', width: `${pvPct}%`, background: pvColor, borderRadius: '3px', transition: 'all 0.5s ease' }} />
      </div>

      <div style={{ height: '1rem' }} />

      <div style={s.argent}>
        <div>
          <div style={s.pvLabel}>Argent</div>
          <div style={s.argentVal}>🪙 {p.argent}</div>
        </div>
      </div>

      <div style={s.statsGrid}>
        {STATS_CONFIG.map(cfg => (
          <div key={cfg.key} style={s.statCard}>
            <div style={s.statHeader}>
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </div>
            <div style={{ ...s.statVal, color: cfg.color }}>{p[cfg.key]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
