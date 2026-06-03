import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getState, subscribe, updatePersonnage, updateAllPersonnages } from '../lib/store.js'
import { STATS_CONFIG } from '../lib/supabase.js'

function De({ faces, onRoll }) {
  const [resultat, setResultat] = useState(null)
  const [rolling, setRolling] = useState(false)

  function lancer() {
    setRolling(true)
    setResultat(null)
    setTimeout(() => {
      const r = Math.floor(Math.random() * faces) + 1
      setResultat(r)
      setRolling(false)
      onRoll && onRoll(r, faces)
    }, 600)
  }

  return (
    <div style={{
      background: 'var(--bg3)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      minWidth: '90px',
    }}
    onClick={lancer}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ fontSize: '1.6rem', animation: rolling ? 'spin 0.6s linear' : 'none' }}>
        {rolling ? '🎲' : (resultat !== null ? '✦' : '🎲')}
      </div>
      <div style={{ fontFamily: 'var(--font-title)', color: 'var(--gold)', fontSize: '0.75rem', marginTop: '0.3rem' }}>
        D{faces}
      </div>
      {resultat !== null && !rolling && (
        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold2)', marginTop: '0.2rem' }}>
          {resultat}
        </div>
      )}
    </div>
  )
}

function ResultatDe({ resultat, statCfg, nomJoueur, onClose }) {
  const [compteur, setCompteur] = useState(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCompteur(Math.floor(Math.random() * resultat.faces) + 1)
    }, 60)
    setTimeout(() => {
      clearInterval(interval)
      setCompteur(resultat.valeur)
    }, 700)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)',
          border: `2px solid ${statCfg.color}`,
          borderRadius: '20px',
          padding: '2.5rem 3rem',
          textAlign: 'center',
          boxShadow: `0 0 60px ${statCfg.color}33`,
          minWidth: '260px',
          animation: 'popIn 0.2s ease',
        }}
      >
        <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>{nomJoueur}</div>
        <div style={{ fontFamily: 'var(--font-title)', color: statCfg.color, fontSize: '0.9rem', marginBottom: '1rem' }}>
          {statCfg.icon} {statCfg.label} — D{resultat.faces}
        </div>

        <div style={{
          fontSize: '5rem',
          fontWeight: 900,
          lineHeight: 1,
          color: 'var(--text)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {compteur ?? '?'}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '1.5rem',
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
            borderRadius: '8px',
            padding: '0.5rem 1.5rem',
            fontSize: '0.85rem',
          }}
        >
          Fermer
        </button>
      </div>
    </div>
  )
}

function CarteJoueur({ p, onModif }) {
  const [resultat, setResultat] = useState(null)
  const [editArgent, setEditArgent] = useState(false)
  const [deltaArgent, setDeltaArgent] = useState('')
  const [editStat, setEditStat] = useState(null)
  const [deltaStat, setDeltaStat] = useState('')

  function lancerDe(cfg) {
    const faces = p[cfg.key]
    const valeur = Math.floor(Math.random() * faces) + 1
    setResultat({ valeur, faces, statCfg: cfg })
    onModif(`${p.nom} — ${cfg.label} (D${faces}) : ${valeur}`)
  }

  function appliquerStat(cfg) {
    const d = parseInt(deltaStat)
    if (!isNaN(d)) updatePersonnage(p.id, { [cfg.key]: Math.max(0, p[cfg.key] + d) })
    setEditStat(null)
    setDeltaStat('')
  }

  function appliquerArgent() {
    const d = parseInt(deltaArgent)
    if (!isNaN(d)) updatePersonnage(p.id, { argent: Math.max(0, p.argent + d) })
    setEditArgent(false)
    setDeltaArgent('')
  }

  function setPvDirect(v) {
    const n = parseInt(v)
    if (!isNaN(n)) updatePersonnage(p.id, { pv_actuel: Math.max(0, Math.min(p.pv_max, n)) })
  }

  const pvPct = Math.max(0, Math.min(100, (p.pv_actuel / p.pv_max) * 100))
  const pvColor = pvPct > 60 ? 'var(--success)' : pvPct > 30 ? '#f0c060' : 'var(--danger)'

  return (
    <>
      {resultat && (
        <ResultatDe
          resultat={resultat}
          statCfg={resultat.statCfg}
          nomJoueur={p.nom}
          onClose={() => setResultat(null)}
        />
      )}

      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.2rem',
        marginBottom: '1rem',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', color: 'var(--gold2)', fontSize: '1rem' }}>{p.nom}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>{p.classe}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>PV</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input
                type="number"
                value={p.pv_actuel}
                onChange={e => setPvDirect(e.target.value)}
                style={{
                  width: '60px', background: 'var(--bg3)',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  color: pvColor, fontSize: '1.2rem', fontWeight: 700,
                  textAlign: 'center', padding: '0.2rem',
                }}
              />
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>/ {p.pv_max}</span>
            </div>
            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pvPct}%`, background: pvColor, transition: 'all 0.4s' }} />
            </div>
          </div>
        </div>

        {/* Argent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>🪙 Stellars :</span>
          <span style={{ color: 'var(--gold2)', fontWeight: 600 }}>{p.argent}</span>
          {editArgent ? (
            <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
              <input
                autoFocus type="number" placeholder="±"
                value={deltaArgent}
                onChange={e => setDeltaArgent(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') appliquerArgent(); if (e.key === 'Escape') setEditArgent(false) }}
                style={{ width: '65px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', padding: '0.2rem 0.4rem', fontSize: '0.9rem' }}
              />
              <button onClick={appliquerArgent}
                style={{ background: 'var(--gold)', color: '#000', borderRadius: '6px', padding: '0.2rem 0.6rem', fontWeight: 700, fontSize: '0.85rem' }}>✓</button>
              <button onClick={() => setEditArgent(false)}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.85rem' }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setEditArgent(true)}
              style={{ marginLeft: 'auto', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>
              ±
            </button>
          )}
        </div>

        <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
          🎲 Clique une stat pour lancer le dé
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {STATS_CONFIG.map(cfg => (
            <div key={cfg.key} style={{ background: 'var(--bg3)', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Zone cliquable = lancer dé */}
              <div
                onClick={() => lancerDe(cfg)}
                style={{
                  padding: '0.5rem 0.5rem 0.2rem',
                  cursor: 'pointer',
                  borderBottom: editStat === cfg.key ? `1px solid ${cfg.color}` : '1px solid transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = cfg.color + '20'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{cfg.icon} {cfg.label}</div>
                <div style={{ color: cfg.color, fontWeight: 700, fontSize: '1.1rem' }}>{p[cfg.key]}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.1rem' }}>D{p[cfg.key]}</div>
              </div>

              {/* Bouton édition */}
              {editStat === cfg.key ? (
                <div style={{ display: 'flex', gap: '0.2rem', padding: '0.3rem' }} onClick={e => e.stopPropagation()}>
                  <input
                    autoFocus type="number" placeholder="±"
                    value={deltaStat}
                    onChange={e => setDeltaStat(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') appliquerStat(cfg); if (e.key === 'Escape') { setEditStat(null); setDeltaStat('') } }}
                    style={{ width: '45px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', padding: '0.15rem 0.3rem', fontSize: '0.85rem' }}
                  />
                  <button onClick={() => appliquerStat(cfg)}
                    style={{ background: cfg.color, color: '#000', borderRadius: '4px', padding: '0.15rem 0.4rem', fontWeight: 700, fontSize: '0.8rem', flex: 1 }}>✓</button>
                  <button onClick={() => { setEditStat(null); setDeltaStat('') }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '0.8rem', padding: '0.15rem' }}>✕</button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditStat(cfg.key); setDeltaStat('') }}
                  style={{ width: '100%', background: 'transparent', color: 'var(--muted)', fontSize: '0.7rem', padding: '0.2rem', borderTop: '1px solid var(--border)', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                >
                   modifier
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default function Maitre() {
  const navigate = useNavigate()
  const [personnages, setPersonnages] = useState(getState().personnages)
  const [log, setLog] = useState([])
  const [onglet, setOnglet] = useState('joueurs')

  useEffect(() => subscribe(s => setPersonnages(s.personnages)), [])

  function addLog(msg) {
    setLog(l => [`${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — ${msg}`, ...l].slice(0, 30))
  }

  function modifTous(stat, delta) {
    const d = parseInt(delta)
    if (isNaN(d)) return
    personnages.forEach(p => updatePersonnage(p.id, { [stat]: Math.max(0, p[stat] + d) }))
    addLog(`Tous — ${stat} ${d >= 0 ? '+' : ''}${d}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #0a1520 0%, #0d0b0f 60%)', padding: '1rem', maxWidth: '700px', margin: '0 auto' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold)', fontSize: '1.1rem' }}>🎲 Maître du Jeu</h1>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', color: 'var(--muted)', fontSize: '0.85rem' }}>← Accueil</button>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['joueurs', 'global', 'journal'].map(o => (
          <button key={o} onClick={() => setOnglet(o)}
            style={{
              background: onglet === o ? 'var(--gold)' : 'var(--bg2)',
              color: onglet === o ? '#0d0b0f' : 'var(--muted)',
              border: '1px solid var(--border)',
              borderRadius: '999px',
              padding: '0.4rem 1rem',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-title)',
              fontWeight: onglet === o ? 700 : 400,
              transition: 'all 0.2s',
            }}>
            {o === 'joueurs' ? '⚔ Joueurs' : o === 'global' ? '🌐 Global' : '📜 Journal'}
          </button>
        ))}
      </div>

      {/* Onglet joueurs */}
      {onglet === 'joueurs' && personnages.map(p => (
        <CarteJoueur key={p.id} p={p} onModif={addLog} />
      ))}

      {/* Onglet global */}
      {onglet === 'global' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold2)', fontSize: '1rem', marginBottom: '1.2rem' }}>Modifier tous les joueurs</h2>
          {STATS_CONFIG.map(cfg => (
            <GlobalModif key={cfg.key} cfg={cfg} onApply={(delta) => modifTous(cfg.key, delta)} />
          ))}
          <div style={{ marginTop: '1.2rem', borderTop: '1px solid var(--border)', paddingTop: '1.2rem' }}>
            <GlobalModifArgent onApply={(delta) => {
              const d = parseInt(delta)
              if (!isNaN(d)) {
                personnages.forEach(p => updatePersonnage(p.id, { argent: Math.max(0, p.argent + d) }))
                addLog(`Tous — Argent ${d >= 0 ? '+' : ''}${d}`)
              }
            }} />
          </div>
        </div>
      )}

      {/* Journal */}
      {onglet === 'journal' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold2)', fontSize: '1rem', marginBottom: '1rem' }}>📜 Journal des actions</h2>
          {log.length === 0
            ? <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Aucune action pour l'instant.</p>
            : log.map((entry, i) => (
              <div key={i} style={{ fontSize: '0.9rem', color: i === 0 ? 'var(--text)' : 'var(--muted)', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                {entry}
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}

function GlobalModif({ cfg, onApply }) {
  const [val, setVal] = useState('')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.7rem' }}>
      <span style={{ color: cfg.color, width: '110px', fontSize: '0.9rem' }}>{cfg.icon} {cfg.label}</span>
      <input
        type="number"
        placeholder="±"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { onApply(val); setVal('') }}}
        style={{ width: '70px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', padding: '0.3rem 0.5rem', fontSize: '0.9rem' }}
      />
      <button onClick={() => { onApply(val); setVal('') }}
        style={{ background: cfg.color, color: '#000', borderRadius: '6px', padding: '0.3rem 0.8rem', fontWeight: 700, fontSize: '0.85rem' }}>
        Appliquer à tous
      </button>
    </div>
  )
}

function GlobalModifArgent({ onApply }) {
  const [val, setVal] = useState('')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
      <span style={{ color: 'var(--gold2)', width: '110px', fontSize: '0.9rem' }}>🪙 Stellars</span>
      <input
        type="number"
        placeholder="±"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { onApply(val); setVal('') }}}
        style={{ width: '70px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', padding: '0.3rem 0.5rem', fontSize: '0.9rem' }}
      />
      <button onClick={() => { onApply(val); setVal('') }}
        style={{ background: 'var(--gold)', color: '#000', borderRadius: '6px', padding: '0.3rem 0.8rem', fontWeight: 700, fontSize: '0.85rem' }}>
        Appliquer à tous
      </button>
    </div>
  )
}