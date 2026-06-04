import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CLASSES, STATS_LABELS, TOTAL_POINTS, calculerPV, statsInitiales, pointsRestants } from '../lib/classes.js'
import { getState, subscribe } from '../lib/store.js'
import { supabase } from '../lib/supabase.js'

// ─── Étape 1 : Choix de la classe ────────────────────────────────────────────
function ChoixClasse({ onChoisir }) {
  const [personnages, setPersonnages] = useState(getState().personnages)
  useEffect(() => subscribe(s => setPersonnages(s.personnages)), [])

  const countParClasse = {}
  personnages.forEach(p => {
    countParClasse[p.classe] = (countParClasse[p.classe] || 0) + 1
  })

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #1e1030 0%, #0d0b0f 70%)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold)', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', textAlign: 'center', marginBottom: '0.4rem', textShadow: '0 0 40px rgba(201,168,76,0.4)' }}>
        Choisissez votre race
      </h1>
      <p style={{ color: 'var(--muted)', fontStyle: 'italic', marginBottom: '2.5rem', textAlign: 'center' }}>
        Chaque race a ses forces et ses faiblesses
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', width: '100%', maxWidth: '860px' }}>
        {Object.values(CLASSES).map(cls => {
          const count = countParClasse[cls.nom] || 0
          return (
            <div key={cls.nom} onClick={() => onChoisir(Object.keys(CLASSES).find(k => CLASSES[k].nom === cls.nom))
}
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.4rem', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = cls.couleur; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${cls.couleur}22` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ position: 'absolute', top: '0.8rem', right: '0.8rem', background: count > 0 ? cls.couleur + '33' : 'var(--bg3)', border: `1px solid ${count > 0 ? cls.couleur : 'var(--border)'}`, borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.75rem', color: count > 0 ? cls.couleur : 'var(--muted)' }}>
                {count} joueur{count !== 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{cls.emoji}</div>
              <div style={{ fontFamily: 'var(--font-title)', color: cls.couleur, fontSize: '1.1rem', marginBottom: '0.3rem' }}>{cls.nom}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '0.8rem' }}>{cls.description}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text)', opacity: 0.7 }}>
                <span>⚔ {cls.arme}</span>
                <span style={{ margin: '0 0.5rem', color: 'var(--border)' }}>·</span>
                <span>{cls.combat}</span>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {Object.entries(cls.stats).map(([key, { min, max }]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--muted)', width: '80px' }}>{STATS_LABELS[key].icon} {STATS_LABELS[key].label}</span>
                    <div style={{ flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: `${(min / 40) * 100}%`, width: `${((max - min) / 40) * 100}%`, height: '100%', background: cls.couleur, borderRadius: '2px', opacity: 0.7 }} />
                    </div>
                    <span style={{ color: 'var(--muted)', width: '50px', textAlign: 'right' }}>{min}–{max}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Étape 2 : Nom ───────────────────────────────────────────────────────────
function SaisieNom({ classe, onSuivant, onRetour }) {
  const [nom, setNom] = useState('')
  const cls = CLASSES[classe]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 0%, #1e1030 0%, #0d0b0f 70%)', padding: '2rem' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>{cls.emoji}</div>
      <h2 style={{ fontFamily: 'var(--font-title)', color: cls.couleur, fontSize: '1.4rem', marginBottom: '0.3rem' }}>{cls.nom}</h2>
      <p style={{ color: 'var(--muted)', fontStyle: 'italic', marginBottom: '2.5rem' }}>{cls.description}</p>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nom de votre personnage</label>
        <input autoFocus type="text" value={nom} onChange={e => setNom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && nom.trim() && onSuivant(nom.trim())}
          placeholder="Ex: Kekette l'Intrépide..." maxLength={32}
          style={{ background: 'var(--bg2)', border: `1px solid ${cls.couleur}66`, borderRadius: 'var(--radius)', padding: '0.9rem 1.2rem', color: 'var(--text)', fontSize: '1.1rem', width: '100%' }}
        />
        <button onClick={() => nom.trim() && onSuivant(nom.trim())} disabled={!nom.trim()}
          style={{ background: nom.trim() ? cls.couleur : 'var(--bg3)', color: nom.trim() ? '#000' : 'var(--muted)', fontFamily: 'var(--font-title)', fontSize: '0.9rem', padding: '0.9rem', borderRadius: 'var(--radius)', fontWeight: 700, letterSpacing: '0.05em', transition: 'all 0.2s', cursor: nom.trim() ? 'pointer' : 'default' }}>
          Choisir un avatar →
        </button>
        <button onClick={onRetour} style={{ background: 'transparent', color: 'var(--muted)', fontSize: '0.9rem' }}>← Changer de race</button>
      </div>
    </div>
  )
}

// ─── Étape 3 : Choix de l'avatar ─────────────────────────────────────────────
function ChoixAvatar({ classe, nom, onSuivant, onRetour }) {
  const cls = CLASSES[classe]
  const [personnages, setPersonnages] = useState(getState().personnages)
  const [avatarSelectionne, setAvatarSelectionne] = useState(null)

  useEffect(() => subscribe(s => setPersonnages(s.personnages)), [])

  // Avatars déjà pris globalement
  const avatarsPris = {}
  personnages.forEach(p => {
    if (p.avatar) avatarsPris[p.avatar] = p.nom
  })

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #1e1030 0%, #0d0b0f 70%)', padding: '1.5rem', maxWidth: '540px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2rem' }}>{cls.emoji}</div>
        <h2 style={{ fontFamily: 'var(--font-title)', color: cls.couleur, fontSize: '1.2rem' }}>{nom}</h2>
        <div style={{ color: 'var(--muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>{cls.nom}</div>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.8rem' }}>Choisissez votre avatar</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
        {cls.avatars.map((url, i) => {
          const pris = avatarsPris[url]
          const selectionne = avatarSelectionne === url

          return (
            <div key={i}
              onClick={() => !pris && setAvatarSelectionne(url)}
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: selectionne ? `3px solid ${cls.couleur}` : pris ? '2px solid var(--border)' : '2px solid transparent',
                cursor: pris ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                aspectRatio: '1',
                background: 'var(--bg3)',
                boxShadow: selectionne ? `0 0 20px ${cls.couleur}55` : 'none',
              }}
              onMouseEnter={e => { if (!pris) e.currentTarget.style.borderColor = cls.couleur }}
              onMouseLeave={e => { if (!selectionne && !pris) e.currentTarget.style.borderColor = 'transparent' }}
            >
              {/* Image */}
              <img src={url} alt={`avatar ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: pris ? 'grayscale(100%) brightness(0.4)' : 'none', transition: 'filter 0.2s' }}
              />

              {/* Overlay pris */}
              {pris && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🔒</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', lineHeight: 1.3, fontStyle: 'italic' }}>{pris}</div>
                </div>
              )}

              {/* Checkmark sélectionné */}
              {selectionne && (
                <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: cls.couleur, borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#000' }}>
                  ✓
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Aperçu sélection */}
      {avatarSelectionne && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg2)', border: `1px solid ${cls.couleur}`, borderRadius: 'var(--radius)', padding: '0.8rem 1rem', marginBottom: '1rem' }}>
          <img src={avatarSelectionne} alt="avatar" style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-title)', color: cls.couleur, fontSize: '0.85rem' }}>Avatar sélectionné</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{nom} · {cls.nom}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <button onClick={() => avatarSelectionne && onSuivant(avatarSelectionne)} disabled={!avatarSelectionne}
          style={{ background: avatarSelectionne ? cls.couleur : 'var(--bg3)', color: avatarSelectionne ? '#000' : 'var(--muted)', fontFamily: 'var(--font-title)', fontSize: '0.9rem', padding: '0.9rem', borderRadius: 'var(--radius)', fontWeight: 700, letterSpacing: '0.05em', transition: 'all 0.2s', cursor: avatarSelectionne ? 'pointer' : 'default' }}>
          Répartir les points →
        </button>
        <button onClick={onRetour} style={{ background: 'transparent', color: 'var(--muted)', fontSize: '0.9rem' }}>← Modifier le nom</button>
      </div>
    </div>
  )
}

// ─── Étape 4 : Répartition des stats ─────────────────────────────────────────
function RepartitionStats({ classe, nom, avatar, onCreer, onRetour }) {
  const cls = CLASSES[classe]
  const [stats, setStats] = useState(statsInitiales(classe))
  const [saving, setSaving] = useState(false)

  const restants = pointsRestants(stats, classe)
  const pv = calculerPV(stats)
  const totalAlloue = Object.values(stats).reduce((a, b) => a + b, 0)

  function changerStat(key, valeur) {
    const cfg = cls.stats[key]
    const nouvelleVal = Math.max(cfg.min, Math.min(cfg.max, valeur))
    const delta = nouvelleVal - stats[key]
    if (delta > 0 && restants - delta < 0) return
    setStats(s => ({ ...s, [key]: nouvelleVal }))
  }

  async function handleCreer() {
    if (restants !== 0) return
    setSaving(true)
    await onCreer({ nom, classe, avatar, stats, pv })
    setSaving(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #1e1030 0%, #0d0b0f 70%)', padding: '1.5rem', maxWidth: '540px', margin: '0 auto' }}>
      {/* Header avec avatar */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <img src={avatar} alt="avatar" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', border: `2px solid ${cls.couleur}` }} />
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', color: cls.couleur, fontSize: '1.2rem', margin: 0 }}>{nom}</h2>
          <div style={{ color: 'var(--muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>{cls.nom} · {cls.arme}</div>
        </div>
      </div>

      {/* Compteur de points */}
      <div style={{ background: restants === 0 ? 'rgba(92,224,168,0.1)' : restants < 0 ? 'rgba(224,92,92,0.1)' : 'var(--bg2)', border: `1px solid ${restants === 0 ? 'var(--success)' : restants < 0 ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem', transition: 'all 0.3s' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>Points restants</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: restants === 0 ? 'var(--success)' : restants < 0 ? 'var(--danger)' : 'var(--text)' }}>{restants}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.3rem' }}>{totalAlloue} / {TOTAL_POINTS} attribués</div>
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {Object.entries(cls.stats).map(([key, { min, max }]) => {
          const val = stats[key]
          const SLIDER_MAX = 40
          const minPct = (min / SLIDER_MAX) * 100
          const maxPct = (max / SLIDER_MAX) * 100
          const valPct = (val / SLIDER_MAX) * 100
          return (
            <div key={key} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '0.9rem' }}>{STATS_LABELS[key].icon} {STATS_LABELS[key].label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => changerStat(key, val - 1)} disabled={val <= min}
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: val <= min ? 'var(--border)' : 'var(--text)', borderRadius: '4px', width: '26px', height: '26px', fontSize: '1rem', cursor: val <= min ? 'default' : 'pointer' }}>−</button>
                  <span style={{ fontWeight: 700, fontSize: '1.2rem', color: cls.couleur, minWidth: '2rem', textAlign: 'center' }}>{val}</span>
                  <button onClick={() => changerStat(key, val + 1)} disabled={val >= max || restants <= 0}
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: (val >= max || restants <= 0) ? 'var(--border)' : 'var(--text)', borderRadius: '4px', width: '26px', height: '26px', fontSize: '1rem', cursor: (val >= max || restants <= 0) ? 'default' : 'pointer' }}>+</button>
                </div>
              </div>
              <div style={{ position: 'relative', padding: '0.3rem 0' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '6px', transform: 'translateY(-50%)', background: 'var(--border)', borderRadius: '3px' }} />
                <div style={{ position: 'absolute', top: '50%', left: `${minPct}%`, width: `${maxPct - minPct}%`, height: '6px', transform: 'translateY(-50%)', background: cls.couleur + '44', borderRadius: '3px' }} />
                <div style={{ position: 'absolute', top: '50%', left: 0, width: `${valPct}%`, height: '6px', transform: 'translateY(-50%)', background: cls.couleur, borderRadius: '3px', transition: 'width 0.1s' }} />
                <div style={{ position: 'absolute', top: '50%', left: `${minPct}%`, transform: 'translate(-50%, -50%)', width: '2px', height: '14px', background: cls.couleur, borderRadius: '1px', opacity: 0.8 }} />
                <div style={{ position: 'absolute', top: '50%', left: `${maxPct}%`, transform: 'translate(-50%, -50%)', width: '2px', height: '14px', background: cls.couleur, borderRadius: '1px', opacity: 0.8 }} />
                <input type="range" min={0} max={SLIDER_MAX} value={val} onChange={e => changerStat(key, parseInt(e.target.value))}
                  style={{ position: 'relative', width: '100%', accentColor: cls.couleur, cursor: 'pointer', background: 'transparent', appearance: 'none', WebkitAppearance: 'none', height: '24px', zIndex: 1 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.1rem' }}>
                  <span>0</span>
                  <span style={{ position: 'absolute', left: `${minPct}%`, transform: 'translateX(-50%)', color: cls.couleur, fontWeight: 600 }}>min {min}</span>
                  <span style={{ position: 'absolute', left: `${maxPct}%`, transform: 'translateX(-50%)', color: cls.couleur, fontWeight: 600 }}>max {max}</span>
                  <span>40</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* PV preview */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.8rem 1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>❤ Points de vie de départ</span>
        <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '1.3rem' }}>{pv}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <button onClick={handleCreer} disabled={restants !== 0 || saving}
          style={{ background: restants === 0 ? 'var(--gold)' : 'var(--bg3)', color: restants === 0 ? '#000' : 'var(--muted)', fontFamily: 'var(--font-title)', fontSize: '0.95rem', padding: '1rem', borderRadius: 'var(--radius)', fontWeight: 700, letterSpacing: '0.05em', cursor: restants === 0 ? 'pointer' : 'default', transition: 'all 0.2s' }}>
          {saving ? 'Création en cours...' : restants === 0 ? '✦ Créer mon personnage' : `Il reste ${restants} point${restants > 1 ? 's' : ''} à attribuer`}
        </button>
        <button onClick={onRetour} style={{ background: 'transparent', color: 'var(--muted)', fontSize: '0.9rem' }}>← Modifier l'avatar</button>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Creation() {
  const navigate = useNavigate()
  const [etape, setEtape] = useState('classe')
  const [classe, setClasse] = useState(null)
  const [nom, setNom] = useState(null)
  const [avatar, setAvatar] = useState(null)

  async function creerPersonnage({ nom, classe, avatar, stats, pv }) {
    const nouveau = { nom, classe, avatar, pv_max: pv, pv_actuel: pv, argent: 100, ...stats }

    if (supabase) {
      const { error } = await supabase.from('personnages').insert([nouveau])
      if (error) { console.error('Erreur création:', error); return }
    }

    navigate('/')
  }

  if (etape === 'classe')  return <ChoixClasse onChoisir={c => { setClasse(c); setEtape('nom') }} />
  if (etape === 'nom')     return <SaisieNom classe={classe} onSuivant={n => { setNom(n); setEtape('avatar') }} onRetour={() => setEtape('classe')} />
  if (etape === 'avatar')  return <ChoixAvatar classe={classe} nom={nom} onSuivant={a => { setAvatar(a); setEtape('stats') }} onRetour={() => setEtape('nom')} />
  if (etape === 'stats')   return <RepartitionStats classe={classe} nom={nom} avatar={avatar} onCreer={creerPersonnage} onRetour={() => setEtape('avatar')} />
}