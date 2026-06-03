import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { PERSONNAGES_DEFAUT } from '../lib/supabase'
import StatBar from '../components/StatBar'

// Version démo locale avec état réactif (remplacé par Supabase realtime en prod)
export default function JoueurPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [perso, setPerso] = useState(null)
  const [lastChange, setLastChange] = useState(null)

  useEffect(() => {
    const found = PERSONNAGES_DEFAUT.find(p => p.id === id)
    if (!found) { navigate('/'); return }
    setPerso(found)

    // Écoute les changements via localStorage (pont démo MJ → Joueur)
    const handleStorage = (e) => {
      if (e.key === `perso_${id}`) {
        const updated = JSON.parse(e.newValue)
        setPerso(updated)
        // Détecter quel champ a changé
        setLastChange(updated._lastChange || null)
        setTimeout(() => setLastChange(null), 3000)
      }
    }
    // Polling démo (simule realtime)
    const poll = setInterval(() => {
      const stored = localStorage.getItem(`perso_${id}`)
      if (stored) {
        const updated = JSON.parse(stored)
        setPerso(prev => {
          if (JSON.stringify(prev) !== stored) {
            setLastChange(updated._lastChange || null)
            setTimeout(() => setLastChange(null), 3000)
            return updated
          }
          return prev
        })
      }
    }, 500)

    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      clearInterval(poll)
    }
  }, [id, navigate])

  if (!perso) return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <div className="glow-cyan font-display text-sm">CONNEXION...</div>
    </div>
  )

  const pvPct = Math.round((perso.pv_actuel / perso.pv_max) * 100)
  const pvColor = pvPct > 60 ? '#00ff88' : pvPct > 30 ? '#ffaa00' : '#ff0044'
  const actionsMax = 30 // chaque 10 pts d'action = 1 action, base 30
  const actionsAffichees = perso.actions

  return (
    <div className="min-h-screen grid-bg flex flex-col max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <button onClick={() => navigate('/')} className="text-slate-600 hover:text-slate-400 text-xs">‹ RETOUR</button>
        <div className="text-xs tracking-widest text-slate-600">NEXUS // TERMINAL</div>
        <div className="w-16 h-1.5 rounded-full" style={{background: pvColor, boxShadow: `0 0 6px ${pvColor}`}} />
      </div>

      {/* Identité */}
      <div className="panel corner-tl corner-br p-5 mb-4 relative">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{perso.avatar}</div>
          <div>
            <div className="font-display text-2xl font-black glow-cyan flicker">{perso.nom}</div>
            <div className="text-xs text-slate-500 tracking-widest mt-1">{perso.classe}</div>
          </div>
        </div>
        {/* Notification changement */}
        {lastChange && (
          <div className="absolute top-2 right-2 text-xs slide-in px-2 py-1"
               style={{color: 'var(--yellow)', border: '1px solid var(--yellow)', background: 'rgba(0,0,0,0.8)'}}>
            ⚡ {lastChange}
          </div>
        )}
      </div>

      {/* PV + Argent */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="panel p-4 text-center">
          <div className="text-xs tracking-widest text-slate-500 mb-2">POINTS DE VIE</div>
          <div className="font-display text-2xl font-black mb-2" style={{color: pvColor, textShadow: `0 0 12px ${pvColor}`}}>
            {perso.pv_actuel}
            <span className="text-base text-slate-600 font-normal">/{perso.pv_max}</span>
          </div>
          <div className="stat-bar-bg">
            <div className="stat-bar-fill"
                 style={{width:`${pvPct}%`, background: `${pvColor}`, boxShadow:`0 0 6px ${pvColor}`}} />
          </div>
        </div>
        <div className="panel p-4 text-center">
          <div className="text-xs tracking-widest text-slate-500 mb-2">CRÉDITS</div>
          <div className="font-display text-2xl font-black glow-yellow">
            {perso.argent.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600 mt-1">¢ NUMÉRIQUE</div>
        </div>
      </div>

      {/* Actions */}
      <div className="panel p-4 mb-4">
        <div className="text-xs tracking-widest text-slate-500 mb-3">// ACTIONS / TOUR</div>
        <div className="flex gap-2 justify-center">
          {Array.from({length: 5}).map((_, i) => (
            <div key={i} className="w-8 h-8 flex items-center justify-center font-display text-xs"
                 style={{
                   border: i < actionsAffichees ? '1px solid var(--cyan)' : '1px solid var(--border)',
                   color: i < actionsAffichees ? 'var(--cyan)' : 'var(--border)',
                   boxShadow: i < actionsAffichees ? '0 0 8px rgba(0,245,255,0.4)' : 'none',
                   background: i < actionsAffichees ? 'rgba(0,245,255,0.05)' : 'transparent',
                 }}>
              {i < actionsAffichees ? '◆' : '◇'}
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-slate-600 mt-2">{actionsAffichees} action{actionsAffichees > 1 ? 's' : ''} disponible{actionsAffichees > 1 ? 's' : ''}</div>
      </div>

      {/* Stats */}
      <div className="panel p-4 flex-1">
        <div className="text-xs tracking-widest text-slate-500 mb-4">// ATTRIBUTS CYBERNÉTIQUES</div>
        <StatBar label="FORCE" value={perso.force} />
        <StatBar label="AGILITÉ" value={perso.agilite} color="magenta" />
        <StatBar label="INTELLIGENCE" value={perso.intelligence} color="yellow" />
        <StatBar label="CHARISME" value={perso.charisme} color="cyan" />
        <StatBar label="FURTIVITÉ" value={perso.furtivite} color="magenta" />
        <StatBar label="DÉFENSE" value={perso.defense} color="yellow" />
      </div>

      <div className="text-center text-xs text-slate-700 mt-4 py-2">
        NEXUS // ID:{perso.id} // EN LIGNE
      </div>
    </div>
  )
}
