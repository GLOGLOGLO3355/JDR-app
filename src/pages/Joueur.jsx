import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getState, subscribe, lancerJet, validerBonus, aDejaValide, refreshBonus } from '../lib/store.js'
import { STATS_CONFIG } from '../lib/supabase.js'
import { CLASSES, COMPETENCES } from '../lib/classes.js'

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
function BanniereJet({ jet, estConcerne, statCfg, onLancer }) {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-title)', color: estConcerne ? 'var(--gold)' : 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
            {estConcerne ? '🎲 À toi de lancer !' : '⏳ Jet en cours...'}
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

  const estLibre = !jet.stat
  const reussite = !estLibre && jet.valeur >= jet.palier
  const critique = jet.valeur === jet.faces
  const echecCrit = jet.valeur === 1
  const couleur = critique ? 'var(--gold)' : echecCrit ? '#cc0000' : estLibre ? 'var(--gold2)' : reussite ? 'var(--success)' : 'var(--danger)'

  return (
    <div style={{
      position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, minWidth: '280px', maxWidth: '90vw',
      background: 'var(--bg2)', border: `2px solid ${couleur}`,
      borderRadius: '16px', padding: '1.2rem 1.5rem', textAlign: 'center',
      boxShadow: `0 0 40px ${couleur}44`,
      animation: fadeout ? 'fadeOut 0.8s ease forwards' : 'slideDown 0.3s ease',
    }}>
      {!estLibre && avatarJoueur && (
        <img src={avatarJoueur} alt="avatar"
          style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${couleur}`, marginBottom: '0.5rem' }}
        />
      )}
      {estLibre ? (
        <div style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, marginBottom: '0.2rem' }}>🎲 Jet du Maître</div>
      ) : (
        nomJoueur && <div style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, marginBottom: '0.2rem' }}>{nomJoueur}</div>
      )}
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>
        {estLibre ? `D${jet.faces}` : `${statCfg?.icon} ${statCfg?.label} — D${jet.faces} · Palier ${jet.palier}`}
      </div>
      <div style={{ fontSize: '3.5rem', fontWeight: 900, color: couleur, lineHeight: 1, marginBottom: '0.3rem' }}>
        {jet.valeur}
      </div>
      {!estLibre && (
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', color: couleur, letterSpacing: '0.08em' }}>
          {critique ? '✦ RÉUSSITE CRITIQUE ✦' : echecCrit ? '✗ ÉCHEC CRITIQUE' : reussite ? '✓ Réussite' : '✗ Échec'}
        </div>
      )}
    </div>
  )
}

// ── Répartition des points bonus ──────────────────────────────────────────────
function BonusRepartition({ bonus, personnage, onValide }) {
  const [repartition, setRepartition] = useState({})
  const [saving, setSaving] = useState(false)

  const totalAssigne = Object.values(repartition).reduce((a, b) => a + b, 0)
  const restants = bonus.montant - totalAssigne

  function ajouterPoint(key) {
    if (restants <= 0) return
    setRepartition(r => ({ ...r, [key]: (r[key] || 0) + 1 }))
  }

  function retirerPoint(key) {
    if (!repartition[key] || repartition[key] <= 0) return
    setRepartition(r => ({ ...r, [key]: r[key] - 1 }))
  }

  async function handleValider() {
    if (restants !== 0) return
    setSaving(true)
    const changements = {}
    Object.entries(repartition).forEach(([key, val]) => {
      if (val > 0) changements[key] = personnage[key] + val
    })
    await onValide(bonus.id, personnage.id, changements)
    setSaving(false)
  }

  return (
    <div style={{
      background: 'rgba(201,168,76,0.08)',
      border: '1px solid var(--gold)',
      borderRadius: 'var(--radius)', padding: '1rem 1.2rem', marginBottom: '1.2rem',
      animation: 'slideDown 0.3s ease',
    }}>
      <div style={{ fontFamily: 'var(--font-title)', color: 'var(--gold)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
        ⭐ {bonus.montant} points bonus à distribuer !
      </div>
      <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
        Restants : <strong style={{ color: restants === 0 ? 'var(--success)' : 'var(--gold2)' }}>{restants}</strong>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {STATS_CONFIG.map(cfg => (
          <div key={cfg.key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: cfg.color, fontSize: '0.85rem', flex: 1 }}>{cfg.icon} {cfg.label}</span>
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem', minWidth: '28px', textAlign: 'right' }}>{personnage[cfg.key]}</span>
            <button onClick={() => retirerPoint(cfg.key)} disabled={!repartition[cfg.key]}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: repartition[cfg.key] ? 'var(--text)' : 'var(--border)', borderRadius: '4px', width: '24px', height: '24px', fontSize: '0.9rem', cursor: repartition[cfg.key] ? 'pointer' : 'default' }}>−</button>
            <span style={{ color: 'var(--gold2)', fontWeight: 700, minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
              {repartition[cfg.key] ? `+${repartition[cfg.key]}` : ''}
            </span>
            <button onClick={() => ajouterPoint(cfg.key)} disabled={restants <= 0}
              style={{ background: restants > 0 ? 'var(--gold)' : 'var(--bg3)', border: 'none', color: restants > 0 ? '#000' : 'var(--border)', borderRadius: '4px', width: '24px', height: '24px', fontSize: '0.9rem', cursor: restants > 0 ? 'pointer' : 'default', fontWeight: 700 }}>+</button>
          </div>
        ))}
      </div>

      <button onClick={handleValider} disabled={restants !== 0 || saving}
        style={{
          width: '100%', background: restants === 0 ? 'var(--gold)' : 'var(--bg3)',
          color: restants === 0 ? '#000' : 'var(--muted)',
          fontFamily: 'var(--font-title)', fontSize: '0.9rem', padding: '0.7rem',
          borderRadius: 'var(--radius)', fontWeight: 700, cursor: restants === 0 ? 'pointer' : 'default',
          transition: 'all 0.2s', border: 'none',
        }}>
        {saving ? 'Validation...' : restants === 0 ? '✓ Valider la répartition' : `Il reste ${restants} point${restants > 1 ? 's' : ''} à assigner`}
      </button>
    </div>
  )
}

export default function Joueur() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [personnages, setPersonnages] = useState(getState().personnages)
  const [jetActif, setJetActif] = useState(getState().jetActif)
  const [bonusActif, setBonusActif] = useState(getState().bonusActif)
  const [dejaValide, setDejaValide] = useState(false)
  const [notifResultat, setNotifResultat] = useState(null)
  const [particules, setParticules] = useState([])
  const [pageFlash, setPageFlash] = useState(null)
  const prevPvRef = useRef(null)
  const particuleId = useRef(0)
  const prevJetRef = useRef(null)

  useEffect(() => subscribe(st => {
    setPersonnages(st.personnages)
    const jet = st.jetActif
    const bonus = st.bonusActif

    if (jet && jet.statut === 'resolu' && (
      prevJetRef.current?.statut === 'en_attente' ||
      !prevJetRef.current ||
      prevJetRef.current.id !== jet.id
    )) {
      setNotifResultat(jet)
    }
    if (!jet) setNotifResultat(null)
    prevJetRef.current = jet
    setJetActif(jet)
    setBonusActif(bonus)
  }), [])

  useEffect(() => {
    import('../lib/store.js').then(m => {
      m.refresh()
      m.refreshJet()
      m.refreshBonus()
      const interval = setInterval(() => { m.refresh(); m.refreshJet(); m.refreshBonus() }, 2000)
      return () => clearInterval(interval)
    })
  }, [])

  const p = personnages.find(x => x.id === Number(id))

  // Vérifier en BDD si ce joueur a déjà validé le bonus actif
  useEffect(() => {
    if (!bonusActif || !p) { setDejaValide(false); return }
    aDejaValide(bonusActif.id, p.id).then(setDejaValide)
  }, [bonusActif, p?.id])

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

      {/* Points bonus à distribuer */}
      {bonusActif && !dejaValide && (
        <BonusRepartition
          bonus={bonusActif}
          personnage={p}
          onValide={async (bonusId, personnageId, changements) => {
            await validerBonus(bonusId, personnageId, changements)
            setDejaValide(true)
          }}
        />
      )}
      {bonusActif && dejaValide && (
        <div style={{ background: 'rgba(92,224,168,0.08)', border: '1px solid var(--success)', borderRadius: 'var(--radius)', padding: '0.8rem 1.2rem', marginBottom: '1.2rem', fontSize: '0.9rem', color: 'var(--success)' }}>
          ✓ Points bonus validés !
        </div>
      )}

      {/* Bannière jet en attente */}
      {jetActif && jetActif.statut === 'en_attente' && (
        <BanniereJet
          jet={jetActif}
          estConcerne={estConcerne}
          statCfg={jetStatCfg}
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
          <div style={s.pvLabel}>Argent</div>
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

      {/* PV des autres membres de l'escadron */}
      {personnages.filter(x => x.id !== p.id).length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--font-title)', color: 'var(--muted)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '0.8rem', textTransform: 'uppercase' }}>
            Escadron
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {personnages.filter(x => x.id !== p.id).map(autre => {
              const pct = Math.max(0, Math.min(100, (autre.pv_actuel / autre.pv_max) * 100))
              const couleur = pct > 60 ? 'var(--success)' : pct > 30 ? '#f0c060' : 'var(--danger)'
              return (
                <div key={autre.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  {autre.avatar
                    ? <img src={autre.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    : <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>👤</span>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{autre.nom}</span>
                      <span style={{ fontSize: '0.8rem', color: couleur, fontWeight: 700, flexShrink: 0, marginLeft: '0.5rem' }}>{autre.pv_actuel} / {autre.pv_max}</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: couleur, borderRadius: '3px', transition: 'all 0.5s ease' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Compétences */}
      {(() => {
        const classeKey = Object.keys(CLASSES).find(k => CLASSES[k].nom === p.classe) || p.classe
        const competencesBase = COMPETENCES[classeKey]
        const couleurClasse = CLASSES[classeKey]?.couleur || 'var(--gold)'
        if (!competencesBase) return null

// Remplacer les slots verrouillés (???) par les compétences spéciales du joueur, dans l'ordre
        const customs = p.competences_custom || []
        let customIndex = 0
        const competencesAffichees = competencesBase.map(comp => {
          if (comp.locked && customIndex < customs.length) {
            const custom = customs[customIndex]
            customIndex++
            return { ...custom, estSpeciale: true }
          }
          return comp
        })
        // Compétences spéciales en surplus (plus de slots ??? disponibles) : ajoutées à la suite
        const customsRestantes = customs.slice(customIndex).map(c => ({ ...c, estSpeciale: true }))
        const competencesFinales = [...competencesAffichees, ...customsRestantes]

        return (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-title)', color: 'var(--muted)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '0.8rem', textTransform: 'uppercase' }}>
              Compétences
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {competencesFinales.map((comp, i) => {
                const estBarree = !comp.locked && (p.competences_barrees || []).includes(comp.nom)
                return (
                  <div key={i} style={{
                    background: 'var(--bg2)',
                    border: `1px solid ${comp.locked ? 'var(--border)' : estBarree ? 'var(--danger)' : comp.estSpeciale ? 'var(--gold)' + '55' : couleurClasse + '55'}`,
                    borderRadius: 'var(--radius)',
                    padding: '0.9rem 1rem',
                    opacity: comp.locked ? 0.5 : estBarree ? 0.6 : 1,
                    filter: comp.locked ? 'grayscale(1)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: comp.locked ? 0 : '0.4rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{comp.icone}</span>
                      <span style={{
                        fontFamily: 'var(--font-title)',
                        color: comp.locked ? 'var(--muted)' : estBarree ? 'var(--danger)' : comp.estSpeciale ? 'var(--gold2)' : couleurClasse,
                        fontSize: '0.85rem',
                        textDecoration: estBarree ? 'line-through' : 'none',
                      }}>
                        {comp.nom}
                      </span>
                      {comp.estSpeciale && !estBarree && (
                        <span style={{ marginLeft: comp.seuil ? '0' : 'auto', fontSize: '0.65rem', color: 'var(--gold)', fontStyle: 'italic' }}>
                          ⭐
                        </span>
                      )}
                      {estBarree && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--danger)', fontStyle: 'italic' }}>
                          Indisponible
                        </span>
                      )}
                      {comp.seuil && !comp.locked && !estBarree && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                          {comp.seuil}
                        </span>
                      )}
                    </div>
                    {!comp.locked && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, opacity: 0.85, textDecoration: estBarree ? 'line-through' : 'none' }}>
                        {comp.description}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}