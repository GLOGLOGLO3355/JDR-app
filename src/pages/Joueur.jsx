import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getState, subscribe, lancerJet } from '../lib/store.js'
import { STATS_CONFIG } from '../lib/supabase.js'

const s = {
  page: { minHeight: '100vh', background: 'radial-gradient(ellipse at 50% -20%, #1a0f2e 0%, #0d0b0f 60%)', padding: '1.5rem', maxWidth: '500px', margin: '0 auto', position: 'relative', overflow: 'hidden' },
  back: { background: 'transparent', color: 'var(--muted)', fontSize: '0.9rem', padding: '0.3rem 0', marginBottom: '1.5rem', display: 'block' },
  header: { textAlign: 'center', marginBottom: '2rem' },
  nom: { fontFamily: 'var(--font-title)', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', color: 'var(--gold)', textShadow: '0 0 30px rgba(201,168,76,0.35)', marginBottom: '0.2rem' },
  classe: { color: 'var(--muted)', fontStyle: 'italic' },
  pvCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.2rem 1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' },
  pvLabel: { color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.2rem' },
  pvVal: { fontSize: '2rem', fontWeight: 600, color: 'var(--danger)', lineHeight: 1 },
  pvMax: { color: 'var(--muted)', fontSize: '0.9rem' },
  pvBar: { height: '6px', background: 'var(--border)', borderRadius: '3px', marginTop: '0.8rem', overflow: 'hidden' },
  argent: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  argentVal: { fontSize: '1.6rem', color: 'var(--gold2)', fontWeight: 600 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' },
  statCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  statHeader: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--muted)' },
  statVal: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.1 },
}

const CSS_ANIMATIONS = `
  @keyframes floatUp {
    0%   { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-90px) scale(0.6); opacity: 0; }
  }
  @keyframes bloodDrop {
    0%   { transform: translateY(0) scale(1); opacity: 1; }
    80%  { opacity: 0.7; }
    100% { transform: translateY(80px) scale(0.4) rotate(20deg); opacity: 0; }
  }
  @keyframes flashRed {
    0%   { box-shadow: inset 0 0 0 0 rgba(224,92,92,0); }
    30%  { box-shadow: inset 0 0 60px 20px rgba(224,92,92,0.35); }
    100% { box-shadow: inset 0 0 0 0 rgba(224,92,92,0); }
  }
  @keyframes flashGreen {
    0%   { box-shadow: inset 0 0 0 0 rgba(92,224,168,0); }
    30%  { box-shadow: inset 0 0 60px 20px rgba(92,224,168,0.25); }
    100% { box-shadow: inset 0 0 0 0 rgba(92,224,168,0); }
  }
  @keyframes slideDown {
    from { transform: translateY(-100%); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to   { opacity: 0; transform: translateY(-20px) scale(0.95); }
  }
  @keyframes rollSpin {
    0%   { transform: rotate(0deg) scale(1); }
    50%  { transform: rotate(180deg) scale(1.3); }
    100% { transform: rotate(360deg) scale(1); }
  }
`

function Particule({ type, x, id }) {
  const isHeal = type === 'heal'
  const symbols = isHeal ? ['+', '✚', '+'] : ['🩸', '💧', '🩸']
  const symbol = symbols[id % symbols.length]
  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: isHeal ? '30%' : '25%', fontSize: isHeal ? '1.3rem' : '1.1rem', color: isHeal ? '#5ce0a8' : '#cc2222', fontWeight: 900, pointerEvents: 'none', zIndex: 50, animation: `${isHeal ? 'floatUp' : 'bloodDrop'} 1.1s ease-out forwards`, userSelect: 'none', filter: isHeal ? 'drop-shadow(0 0 6px rgba(92,224,168,0.8))' : 'drop-shadow(0 0 4px rgba(200,0,0,0.6))' }}>
      {symbol}
    </div>
  )
}

// Bannière de demande de jet (en_attente)
function BanniereJet({ jet, estConcerne, statCfg, nomJoueur, avatarJoueur, onLancer }) {
    const [rolling, setRolling] = useState(false)

  async function handleLancer() {
    if (!estConcerne || rolling) return
    setRolling(true)
    await onLancer(jet.id, jet.faces)
    setRolling(false)
  }

  return (
    <div style={{
      background: estConcerne ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${estConcerne ? 'var(--gold)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)', padding: '1rem 1.2rem', marginBottom: '1.2rem',
      animation: 'slideDown 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
  {!estConcerne && avatarJoueur && (
    <img src={avatarJoueur} alt="avatar"
      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }}
    />
  )}
  <div>
    <div style={{ fontFamily: 'var(--font-title)', color: estConcerne ? 'var(--gold)' : 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
      {estConcerne ? '🎲 À toi de lancer !' : `⏳ ${nomJoueur} lance le dé...`}
    </div>
    <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
      {statCfg?.icon} {statCfg?.label} — D{jet.faces}
      <span style={{ color: 'var(--muted)', marginLeft: '0.5rem' }}>· Palier {jet.palier}</span>
    </div>
  </div>
        {estConcerne && (
          <button
            onClick={handleLancer}
            disabled={rolling}
            style={{
              background: 'var(--gold)', color: '#000',
              fontFamily: 'var(--font-title)', fontSize: '0.9rem',
              padding: '0.6rem 1.4rem', borderRadius: '999px',
              fontWeight: 700, cursor: rolling ? 'default' : 'pointer',
              border: 'none', transition: 'all 0.2s',
              opacity: rolling ? 0.7 : 1,
            }}
          >
            <span style={{ display: 'inline-block', animation: rolling ? 'rollSpin 0.5s linear infinite' : 'none', marginRight: '0.4rem' }}>🎲</span>
            {rolling ? 'Lancer...' : 'Lancer le dé !'}
          </button>
        )}
      </div>
    </div>
  )
}

// Notification flottante résultat (disparaît après 5s)
function NotifResultat({ jet, statCfg, avatarJoueur, nomJoueur }) {
  const [visible, setVisible] = useState(true)
  const [fadeout, setFadeout] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFadeout(true), 4200)
    const t2 = setTimeout(() => setVisible(false), 5000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [jet.id])

  if (!visible) return null

  const reussite = jet.valeur >= jet.palier
  const critique = jet.valeur === jet.faces
  const echecCrit = jet.valeur === 1
  const couleur = critique ? 'var(--gold)' : echecCrit ? '#cc0000' : reussite ? 'var(--success)' : 'var(--danger)'

  return (
    <div style={{
      position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, minWidth: '280px', maxWidth: '90vw',
      background: 'var(--bg2)', border: `2px solid ${couleur}`,
      borderRadius: '16px', padding: '1.2rem 1.5rem', textAlign: 'center',
      boxShadow: `0 0 40px ${couleur}44`,
      animation: fadeout ? 'fadeOut 0.8s ease forwards' : 'slideDown 0.3s ease',
    }}>
      {avatarJoueur && (
        <img src={avatarJoueur} alt="avatar"
          style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${couleur}`, marginBottom: '0.5rem' }}
        />
      )}
      {nomJoueur && <div style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, marginBottom: '0.2rem' }}>{nomJoueur}</div>}
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>
        {statCfg?.icon} {statCfg?.label} — D{jet.faces} · Palier {jet.palier}
      </div>
      <div style={{ fontSize: '3.5rem', fontWeight: 900, color: couleur, lineHeight: 1, marginBottom: '0.3rem' }}>
        {jet.valeur}
      </div>
      <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', color: couleur, letterSpacing: '0.08em' }}>
        {critique ? '✦ RÉUSSITE CRITIQUE ✦' : echecCrit ? '✗ ÉCHEC CRITIQUE' : reussite ? '✓ Réussite' : '✗ Échec'}
      </div>
    </div>
  )
}

export default function Joueur() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [personnages, setPersonnages] = useState(getState().personnages)
  const [jetActif, setJetActif] = useState(getState().jetActif)
  const [notifResultat, setNotifResultat] = useState(null)
  const [particules, setParticules] = useState([])
  const [pageFlash, setPageFlash] = useState(null)
  const prevPvRef = useRef(null)
  const particuleId = useRef(0)
  const prevJetRef = useRef(null)

  useEffect(() => subscribe(st => {
    setPersonnages(st.personnages)
    const jet = st.jetActif

    // Détecter passage en_attente → resolu
    if (jet && jet.statut === 'resolu' && prevJetRef.current?.statut === 'en_attente') {
      setNotifResultat(jet)
    }
    // Effacer la notif quand le jet est nettoyé
    if (!jet) setNotifResultat(null)

    prevJetRef.current = jet
    setJetActif(jet)
  }), [])

  useEffect(() => {
    import('../lib/store.js').then(m => {
      m.refresh()
      m.refreshJet()
      const interval = setInterval(() => { m.refresh(); m.refreshJet() }, 2000)
      return () => clearInterval(interval)
    })
  }, [])

  const p = personnages.find(x => x.id === Number(id))

  // Détecter changements de PV
  useEffect(() => {
    if (!p) return
    const prev = prevPvRef.current
    if (prev !== null && prev !== p.pv_actuel) {
      const delta = p.pv_actuel - prev
      const type = delta > 0 ? 'heal' : 'damage'
      const count = Math.min(Math.abs(delta), 8)
      setPageFlash(type)
      setTimeout(() => setPageFlash(null), 800)
      const nouvelles = Array.from({ length: count }, (_, i) => ({ id: particuleId.current++, type, x: 20 + Math.random() * 60 }))
      setParticules(p => [...p, ...nouvelles])
      setTimeout(() => setParticules(p => p.filter(pt => !nouvelles.find(n => n.id === pt.id))), 1200)
    }
    prevPvRef.current = p.pv_actuel
  }, [p?.pv_actuel])

  if (!p) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Personnage introuvable.</div>

  const pvPct = Math.max(0, Math.min(100, (p.pv_actuel / p.pv_max) * 100))
  const pvColor = pvPct > 60 ? 'var(--success)' : pvPct > 30 ? '#f0c060' : 'var(--danger)'
  const flashStyle = pageFlash === 'damage' ? { animation: 'flashRed 0.8s ease-out' } : pageFlash === 'heal' ? { animation: 'flashGreen 0.8s ease-out' } : {}

  const estConcerne = jetActif && jetActif.personnage_id === p.id
  const jetStatCfg = jetActif && STATS_CONFIG.find(c => c.key === jetActif.stat)
  const notifStatCfg = notifResultat && STATS_CONFIG.find(c => c.key === notifResultat.stat)

  return (
    <div style={{ ...s.page, ...flashStyle }}>
      <style>{CSS_ANIMATIONS}</style>

      {particules.map(pt => <Particule key={pt.id} type={pt.type} x={pt.x} id={pt.id} />)}

      {/* Notification résultat (tous les joueurs) */}
      {notifResultat && <NotifResultat
        jet={notifResultat}
        statCfg={notifStatCfg}
        avatarJoueur={personnages.find(x => x.id === notifResultat.personnage_id)?.avatar}
        nomJoueur={personnages.find(x => x.id === notifResultat.personnage_id)?.nom}
      />}

      <button style={s.back} onClick={() => navigate('/')}>← Retour</button>

      <div style={s.header}>
        {p.avatar && (
          <img src={p.avatar} alt="avatar"
            style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold)', boxShadow: '0 0 24px rgba(201,168,76,0.35)', marginBottom: '0.8rem' }}
          />
        )}
        <div style={s.nom}>{p.nom}</div>
        <div style={s.classe}>{p.classe}</div>
      </div>

      {/* Bannière jet en attente */}
      {jetActif && jetActif.statut === 'en_attente' && (
        <BanniereJet
          jet={jetActif}
          estConcerne={estConcerne}
          statCfg={jetStatCfg}
          nomJoueur={personnages.find(x => x.id === jetActif.personnage_id)?.nom}
          avatarJoueur={personnages.find(x => x.id === jetActif.personnage_id)?.avatar}
          onLancer={lancerJet}
/>
      )}

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
          <div style={s.pvLabel}>Stellar</div>
          <div style={s.argentVal}>🪙 {p.argent}</div>
        </div>
      </div>

      <div style={s.statsGrid}>
        {STATS_CONFIG.map(cfg => (
          <div key={cfg.key} style={{ ...s.statCard, border: estConcerne && jetActif?.stat === cfg.key ? `1px solid ${cfg.color}` : '1px solid var(--border)' }}>
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