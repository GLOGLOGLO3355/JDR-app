import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getState, subscribe, updatePersonnage, updateAllPersonnages, demanderJet, annulerJet } from '../lib/store.js'
import { STATS_CONFIG } from '../lib/supabase.js'

// ── Notification flottante résultat (identique à Joueur.jsx) ─────────────────
function NotifResultat({ jet, statCfg, avatarJoueur, nomJoueur }) {
  const [visible, setVisible] = useState(true)
  const [fadeout, setFadeout] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFadeout(true), 4200)
    const t2 = setTimeout(() => setVisible(false), 5000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [jet.id])

  if (!visible || !statCfg) return null

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
        {statCfg.icon} {statCfg.label} — D{jet.faces} · Palier {jet.palier}
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

// ── Modale résultat dé MJ (lancer depuis carte joueur) ───────────────────────
function ResultatDe({ resultat, statCfg, nomJoueur, onClose }) {
  const [compteur, setCompteur] = useState(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCompteur(Math.floor(Math.random() * resultat.faces) + 1)
    }, 60)
    setTimeout(() => { clearInterval(interval); setCompteur(resultat.valeur) }, 700)
    return () => clearInterval(interval)
  }, [])

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: `2px solid ${statCfg.color}`, borderRadius: '20px', padding: '2.5rem 3rem', textAlign: 'center', boxShadow: `0 0 60px ${statCfg.color}33`, minWidth: '260px', animation: 'popIn 0.2s ease' }}>
        <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>{nomJoueur}</div>
        <div style={{ fontFamily: 'var(--font-title)', color: statCfg.color, fontSize: '0.9rem', marginBottom: '1rem' }}>{statCfg.icon} {statCfg.label} — D{resultat.faces}</div>
        <div style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{compteur ?? '?'}</div>
        <button onClick={onClose} style={{ marginTop: '1.5rem', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '8px', padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>Fermer</button>
      </div>
    </div>
  )
}

// ── Carte joueur ──────────────────────────────────────────────────────────────
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
    setEditStat(null); setDeltaStat('')
  }

  function appliquerArgent() {
    const d = parseInt(deltaArgent)
    if (!isNaN(d)) updatePersonnage(p.id, { argent: Math.max(0, p.argent + d) })
    setEditArgent(false); setDeltaArgent('')
  }

  function setPvDirect(v) {
    const n = parseInt(v)
    if (!isNaN(n)) updatePersonnage(p.id, { pv_actuel: Math.max(0, Math.min(p.pv_max, n)) })
  }

  const pvPct = Math.max(0, Math.min(100, (p.pv_actuel / p.pv_max) * 100))
  const pvColor = pvPct > 60 ? 'var(--success)' : pvPct > 30 ? '#f0c060' : 'var(--danger)'

  return (
    <>
      {resultat && <ResultatDe resultat={resultat} statCfg={resultat.statCfg} nomJoueur={p.nom} onClose={() => setResultat(null)} />}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.2rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', color: 'var(--gold2)', fontSize: '1rem' }}>{p.nom}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>{p.classe}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>PV</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input type="number" value={p.pv_actuel} onChange={e => setPvDirect(e.target.value)} style={{ width: '60px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: pvColor, fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', padding: '0.2rem' }} />
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>/ {p.pv_max}</span>
            </div>
            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pvPct}%`, background: pvColor, transition: 'all 0.4s' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>🪙 Stellars :</span>
          <span style={{ color: 'var(--gold2)', fontWeight: 600 }}>{p.argent}</span>
          {editArgent ? (
            <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
              <input autoFocus type="number" placeholder="±" value={deltaArgent} onChange={e => setDeltaArgent(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') appliquerArgent(); if (e.key === 'Escape') setEditArgent(false) }} style={{ width: '65px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', padding: '0.2rem 0.4rem', fontSize: '0.9rem' }} />
              <button onClick={appliquerArgent} style={{ background: 'var(--gold)', color: '#000', borderRadius: '6px', padding: '0.2rem 0.6rem', fontWeight: 700, fontSize: '0.85rem' }}>✓</button>
              <button onClick={() => setEditArgent(false)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.85rem' }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setEditArgent(true)} style={{ marginLeft: 'auto', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>±</button>
          )}
        </div>

        <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>🎲 Clique une stat pour lancer le dé · modifier pour éditer</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {STATS_CONFIG.map(cfg => (
            <div key={cfg.key} style={{ background: 'var(--bg3)', borderRadius: '8px', overflow: 'hidden' }}>
              <div onClick={() => lancerDe(cfg)} style={{ padding: '0.5rem 0.5rem 0.2rem', cursor: 'pointer', borderBottom: editStat === cfg.key ? `1px solid ${cfg.color}` : '1px solid transparent', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = cfg.color + '20'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{cfg.icon} {cfg.label}</div>
                <div style={{ color: cfg.color, fontWeight: 700, fontSize: '1.1rem' }}>{p[cfg.key]}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.1rem' }}>D{p[cfg.key]}</div>
              </div>
              {editStat === cfg.key ? (
                <div style={{ display: 'flex', gap: '0.2rem', padding: '0.3rem' }} onClick={e => e.stopPropagation()}>
                  <input autoFocus type="number" placeholder="±" value={deltaStat} onChange={e => setDeltaStat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') appliquerStat(cfg); if (e.key === 'Escape') { setEditStat(null); setDeltaStat('') } }} style={{ width: '45px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', padding: '0.15rem 0.3rem', fontSize: '0.85rem' }} />
                  <button onClick={() => appliquerStat(cfg)} style={{ background: cfg.color, color: '#000', borderRadius: '4px', padding: '0.15rem 0.4rem', fontWeight: 700, fontSize: '0.8rem', flex: 1 }}>✓</button>
                  <button onClick={() => { setEditStat(null); setDeltaStat('') }} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '0.8rem', padding: '0.15rem' }}>✕</button>
                </div>
              ) : (
                <button onClick={() => { setEditStat(cfg.key); setDeltaStat('') }} style={{ width: '100%', background: 'transparent', color: 'var(--muted)', fontSize: '0.7rem', padding: '0.2rem', borderTop: '1px solid var(--border)', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>modifier</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Onglet Dés ────────────────────────────────────────────────────────────────
function OngletDes({ personnages, jetActif }) {
  const [joueurId, setJoueurId] = useState('')
  const [stat, setStat] = useState('')
  const [palier, setPalier] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const joueurSelectionne = personnages.find(p => p.id === Number(joueurId))
  const faces = joueurSelectionne && stat ? joueurSelectionne[stat] : null
  const palierNum = parseInt(palier)

  async function handleDemander() {
    if (!joueurId || !stat || isNaN(palierNum) || palierNum < 0 || !faces) return
    setEnvoi(true)
    await demanderJet(Number(joueurId), stat, palierNum, faces)
    setEnvoi(false)
  }

  const jetConcerne = jetActif && personnages.find(p => p.id === jetActif.personnage_id)
  const jetStatCfg = jetActif && STATS_CONFIG.find(c => c.key === jetActif.stat)

  return (
    <div>
      {/* Jet actif */}
      {jetActif && (
        <div style={{
          background: jetActif.statut === 'resolu' ? 'rgba(92,224,168,0.08)' : 'rgba(201,168,76,0.08)',
          border: `1px solid ${jetActif.statut === 'resolu' ? 'var(--success)' : 'var(--gold)'}`,
          borderRadius: 'var(--radius)', padding: '1.2rem', marginBottom: '1.5rem',
        }}>
          {jetActif.statut === 'en_attente' ? (
            <>
              <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-title)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>⏳ En attente de lancer...</div>
              <div style={{ color: 'var(--text)', fontSize: '0.95rem' }}>
                <strong>{jetConcerne?.nom}</strong> — {jetStatCfg?.icon} {jetStatCfg?.label} (D{jetActif.faces}) · Palier {jetActif.palier}
              </div>
              <button onClick={annulerJet} style={{ marginTop: '0.8rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '6px', padding: '0.3rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                Annuler
              </button>
            </>
          ) : (
            <>
              <div style={{ color: 'var(--success)', fontFamily: 'var(--font-title)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>✦ Résultat</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>
                {jetConcerne?.nom} — {jetStatCfg?.icon} {jetStatCfg?.label} (D{jetActif.faces}) · Palier {jetActif.palier}
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: jetActif.valeur >= jetActif.palier ? 'var(--success)' : 'var(--danger)' }}>
                {jetActif.valeur}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                {jetActif.valeur === jetActif.faces ? '✦ Réussite critique !' : jetActif.valeur === 1 ? '✗ Échec critique !' : jetActif.valeur >= jetActif.palier ? '✓ Réussite' : '✗ Échec'}
              </div>
            </>
          )}
        </div>
      )}

      {/* Formulaire */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold2)', fontSize: '1rem', marginBottom: '1.2rem' }}>🎲 Demander un jet</h2>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Joueur</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {personnages.map(p => (
              <button key={p.id} onClick={() => setJoueurId(String(p.id))}
                style={{ background: joueurId === String(p.id) ? 'var(--gold)' : 'var(--bg3)', color: joueurId === String(p.id) ? '#000' : 'var(--text)', border: '1px solid var(--border)', borderRadius: '999px', padding: '0.3rem 0.9rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-title)', transition: 'all 0.15s' }}>
                {p.nom}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Statistique</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {STATS_CONFIG.map(cfg => (
              <button key={cfg.key} onClick={() => setStat(cfg.key)}
                style={{ background: stat === cfg.key ? cfg.color : 'var(--bg3)', color: stat === cfg.key ? '#000' : 'var(--text)', border: `1px solid ${stat === cfg.key ? cfg.color : 'var(--border)'}`, borderRadius: '999px', padding: '0.3rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                {cfg.icon} {cfg.label} {joueurSelectionne ? `(D${joueurSelectionne[cfg.key]})` : ''}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Palier (seuil de réussite)</div>
          <input type="number" min="0" placeholder="Ex: 10" value={palier} onChange={e => setPalier(e.target.value)}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', padding: '0.5rem 0.8rem', fontSize: '1rem', width: '120px' }} />
          {faces && <span style={{ color: 'var(--muted)', fontSize: '0.8rem', marginLeft: '0.8rem' }}>Dé : D{faces}</span>}
        </div>

        <button
          onClick={handleDemander}
          disabled={!joueurId || !stat || isNaN(palierNum) || palierNum < 0 || !faces || envoi || jetActif?.statut === 'en_attente'}
          style={{
            background: (!joueurId || !stat || isNaN(palierNum) || palierNum < 0 || envoi || jetActif?.statut === 'en_attente') ? 'var(--bg3)' : 'var(--gold)',
            color: (!joueurId || !stat || isNaN(palierNum) || palierNum < 0 || envoi || jetActif?.statut === 'en_attente') ? 'var(--muted)' : '#000',
            fontFamily: 'var(--font-title)', fontSize: '0.9rem', padding: '0.8rem 1.5rem',
            borderRadius: 'var(--radius)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          {envoi ? 'Envoi...' : jetActif?.statut === 'en_attente' ? 'Jet en attente...' : '🎲 Demander le jet'}
        </button>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function Maitre() {
  const navigate = useNavigate()
  const [personnages, setPersonnages] = useState(getState().personnages)
  const [jetActif, setJetActif] = useState(getState().jetActif)
  const [notifResultat, setNotifResultat] = useState(null)
  const [log, setLog] = useState([])
  const [onglet, setOnglet] = useState('joueurs')
  const prevJetRef = useRef(null)

  useEffect(() => subscribe(s => {
    setPersonnages(s.personnages)
    const jet = s.jetActif
    if (jet && jet.statut === 'resolu' && prevJetRef.current?.statut === 'en_attente') {
      setNotifResultat(jet)
    }
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

  function addLog(msg) {
    setLog(l => [`${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — ${msg}`, ...l].slice(0, 30))
  }

  function modifTous(stat, delta) {
    const d = parseInt(delta)
    if (isNaN(d)) return
    personnages.forEach(p => updatePersonnage(p.id, { [stat]: Math.max(0, p[stat] + d) }))
    addLog(`Tous — ${stat} ${d >= 0 ? '+' : ''}${d}`)
  }

  const onglets = ['joueurs', 'des', 'global', 'journal']
  const notifStatCfg = notifResultat && STATS_CONFIG.find(c => c.key === notifResultat.stat)

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #0a1520 0%, #0d0b0f 60%)', padding: '1rem', maxWidth: '700px', margin: '0 auto' }}>
      <style>{`
        @keyframes spin    { from { transform: rotate(0deg); }           to { transform: rotate(360deg); } }
        @keyframes popIn   { from { transform: scale(0.85); opacity: 0;} to { transform: scale(1); opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(-20px) scale(0.95); } }
      `}</style>

      {/* Notification résultat flottante */}
      {notifResultat && <NotifResultat
        jet={notifResultat}
        statCfg={notifStatCfg}
        avatarJoueur={personnages.find(x => x.id === notifResultat.personnage_id)?.avatar}
        nomJoueur={personnages.find(x => x.id === notifResultat.personnage_id)?.nom}
      />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold)', fontSize: '1.1rem' }}>🎲 Maître du Jeu</h1>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', color: 'var(--muted)', fontSize: '0.85rem' }}>← Accueil</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {onglets.map(o => (
          <button key={o} onClick={() => setOnglet(o)}
            style={{ background: onglet === o ? 'var(--gold)' : 'var(--bg2)', color: onglet === o ? '#0d0b0f' : 'var(--muted)', border: '1px solid var(--border)', borderRadius: '999px', padding: '0.4rem 1rem', fontSize: '0.85rem', fontFamily: 'var(--font-title)', fontWeight: onglet === o ? 700 : 400, transition: 'all 0.2s', cursor: 'pointer' }}>
            {o === 'joueurs' ? '⚔ Joueurs' : o === 'des' ? '🎲 Dés' : o === 'global' ? '🌐 Global' : '📜 Journal'}
          </button>
        ))}
      </div>

      {onglet === 'joueurs' && personnages.map(p => <CarteJoueur key={p.id} p={p} onModif={addLog} />)}
      {onglet === 'des' && <OngletDes personnages={personnages} jetActif={jetActif} />}

      {onglet === 'global' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold2)', fontSize: '1rem', marginBottom: '1.2rem' }}>Modifier tous les joueurs</h2>
          {STATS_CONFIG.map(cfg => <GlobalModif key={cfg.key} cfg={cfg} onApply={(delta) => modifTous(cfg.key, delta)} />)}
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

      {onglet === 'journal' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold2)', fontSize: '1rem', marginBottom: '1rem' }}>📜 Journal des actions</h2>
          {log.length === 0
            ? <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Aucune action pour l'instant.</p>
            : log.map((entry, i) => <div key={i} style={{ fontSize: '0.9rem', color: i === 0 ? 'var(--text)' : 'var(--muted)', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>{entry}</div>)
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
      <input type="number" placeholder="±" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { onApply(val); setVal('') } }} style={{ width: '70px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', padding: '0.3rem 0.5rem', fontSize: '0.9rem' }} />
      <button onClick={() => { onApply(val); setVal('') }} style={{ background: cfg.color, color: '#000', borderRadius: '6px', padding: '0.3rem 0.8rem', fontWeight: 700, fontSize: '0.85rem' }}>Appliquer à tous</button>
    </div>
  )
}

function GlobalModifArgent({ onApply }) {
  const [val, setVal] = useState('')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
      <span style={{ color: 'var(--gold2)', width: '110px', fontSize: '0.9rem' }}>🪙 Stellars</span>
      <input type="number" placeholder="±" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { onApply(val); setVal('') } }} style={{ width: '70px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', padding: '0.3rem 0.5rem', fontSize: '0.9rem' }} />
      <button onClick={() => { onApply(val); setVal('') }} style={{ background: 'var(--gold)', color: '#000', borderRadius: '6px', padding: '0.3rem 0.8rem', fontWeight: 700, fontSize: '0.85rem' }}>Appliquer à tous</button>
    </div>
  )
}