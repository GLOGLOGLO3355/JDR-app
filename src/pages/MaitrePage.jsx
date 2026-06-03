import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PERSONNAGES_DEFAUT } from '../lib/supabase'

const STATS = ['force', 'agilite', 'intelligence', 'charisme', 'furtivite', 'defense', 'actions']
const STATS_LABELS = {
  force: 'FORCE', agilite: 'AGILITÉ', intelligence: 'INTEL',
  charisme: 'CHARISME', furtivite: 'FURTIVITÉ', defense: 'DÉFENSE', actions: 'ACTIONS'
}

function DiceRoller() {
  const [result, setResult] = useState(null)
  const [rolling, setRolling] = useState(false)
  const [history, setHistory] = useState([])
  const [faces, setFaces] = useState(20)

  const roll = () => {
    if (rolling) return
    setRolling(true)
    setResult('...')
    setTimeout(() => {
      const r = Math.floor(Math.random() * faces) + 1
      setResult(r)
      setRolling(false)
      setHistory(prev => [`d${faces}: ${r}`, ...prev].slice(0, 6))
    }, 600)
  }

  const isCrit = result === faces
  const isEchec = result === 1

  return (
    <div className="panel p-4 mb-4">
      <div className="text-xs tracking-widest mb-3" style={{color: 'var(--magenta)'}}>// GÉNÉRATEUR ALÉATOIRE</div>

      {/* Sélecteur de dé */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[4,6,8,10,12,20,100].map(d => (
          <button key={d} onClick={() => setFaces(d)}
                  className={`font-display text-xs px-2 py-1 transition-all ${faces===d ? 'btn-magenta' : 'btn-cyan'}`}
                  style={{minWidth: '2.5rem'}}>
            d{d}
          </button>
        ))}
      </div>

      {/* Résultat */}
      <div className="text-center mb-4">
        <div className={`font-display text-6xl font-black transition-all cursor-pointer select-none
          ${rolling ? 'dice-rolling' : ''}
          ${isCrit ? 'glow-yellow' : isEchec ? 'glow-magenta' : 'glow-cyan'}
        `} onClick={roll} title="Cliquer pour lancer">
          {result ?? '?'}
        </div>
        {isCrit && <div className="text-xs glow-yellow mt-1 tracking-widest">⚡ CRITIQUE !</div>}
        {isEchec && <div className="text-xs glow-magenta mt-1 tracking-widest">💀 ÉCHEC CRITIQUE</div>}
      </div>

      <button onClick={roll} disabled={rolling} className="btn-magenta w-full py-2 mb-3">
        {rolling ? '/// CALCUL...' : `⬡ LANCER d${faces}`}
      </button>

      {history.length > 0 && (
        <div className="text-xs text-slate-600 space-y-0.5">
          {history.map((h, i) => (
            <div key={i} className={i === 0 ? 'text-slate-400' : ''}>{i === 0 ? '▶ ' : '  '}{h}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function PersonnageControls({ perso, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [selectedStat, setSelectedStat] = useState('pv_actuel')

  const applyDelta = (delta) => {
    const val = parseInt(inputVal) || 1
    const field = selectedStat
    let newVal
    if (field === 'pv_actuel') {
      newVal = Math.max(0, Math.min(perso.pv_max, perso.pv_actuel + (delta * val)))
      onUpdate(perso.id, { ...perso, pv_actuel: newVal, _lastChange: `PV ${delta > 0 ? '+' : ''}${delta * val}` })
    } else if (field === 'argent') {
      newVal = Math.max(0, perso.argent + (delta * val))
      onUpdate(perso.id, { ...perso, argent: newVal, _lastChange: `¢ ${delta > 0 ? '+' : ''}${delta * val}` })
    } else {
      newVal = Math.max(0, Math.min(20, perso[field] + (delta * val)))
      onUpdate(perso.id, { ...perso, [field]: newVal, _lastChange: `${STATS_LABELS[field] || field} ${delta > 0 ? '+' : ''}${delta * val}` })
    }
  }

  const pvPct = Math.round((perso.pv_actuel / perso.pv_max) * 100)
  const pvColor = pvPct > 60 ? '#00ff88' : pvPct > 30 ? '#ffaa00' : '#ff0044'

  return (
    <div className="panel mb-3">
      {/* Header */}
      <button className="w-full p-3 flex items-center gap-3 text-left" onClick={() => setExpanded(!expanded)}>
        <span className="text-2xl">{perso.avatar}</span>
        <div className="flex-1">
          <div className="font-display text-sm font-bold" style={{color: 'var(--cyan)'}}>{perso.nom}</div>
          <div className="text-xs text-slate-600">{perso.classe}</div>
        </div>
        <div className="text-right mr-2">
          <div className="text-xs" style={{color: pvColor}}>{perso.pv_actuel}/{perso.pv_max} PV</div>
          <div className="text-xs" style={{color: 'var(--yellow)'}}>{perso.argent.toLocaleString()}¢</div>
        </div>
        <div className="text-slate-600">{expanded ? '▲' : '▼'}</div>
      </button>

      {/* Barre PV mini */}
      <div className="px-3 pb-2">
        <div className="stat-bar-bg">
          <div style={{width:`${pvPct}%`, height:'100%', background: pvColor, boxShadow:`0 0 4px ${pvColor}`, transition:'width 0.4s'}} />
        </div>
      </div>

      {/* Contrôles */}
      {expanded && (
        <div className="p-3 border-t slide-in" style={{borderColor: 'var(--border)'}}>
          {/* Sélecteur de stat */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {['pv_actuel', 'argent', ...STATS].map(s => (
              <button key={s}
                      onClick={() => setSelectedStat(s)}
                      className={`text-xs px-2 py-1 transition-all ${selectedStat === s ? 'btn-cyan' : 'btn-magenta'}`}
                      style={{fontSize: '0.6rem'}}>
                {s === 'pv_actuel' ? 'PV' : s === 'argent' ? '¢' : STATS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Valeur actuelle */}
          <div className="text-center mb-3">
            <span className="text-xs text-slate-500">{selectedStat === 'pv_actuel' ? 'PV' : selectedStat === 'argent' ? 'CRÉDITS' : STATS_LABELS[selectedStat]} : </span>
            <span className="font-display text-sm glow-cyan">
              {selectedStat === 'pv_actuel' ? `${perso.pv_actuel}/${perso.pv_max}` : perso[selectedStat]}
            </span>
          </div>

          {/* Input + boutons */}
          <div className="flex gap-2 items-center">
            <button onClick={() => applyDelta(-1)} className="btn-magenta px-3 py-2 text-sm font-bold">−</button>
            <input
              type="number"
              min="1"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="1"
              className="cyber-input text-center"
              style={{width: '4rem'}}
            />
            <button onClick={() => applyDelta(1)} className="btn-cyan px-3 py-2 text-sm font-bold">+</button>
          </div>

          {/* Stats rapides lecture */}
          <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
            {STATS.map(s => (
              <div key={s} className="text-xs py-1 px-1" style={{border:'1px solid var(--border)'}}>
                <div className="text-slate-600" style={{fontSize:'0.55rem'}}>{STATS_LABELS[s]}</div>
                <div style={{color: 'var(--cyan)'}}>{perso[s]}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MaitrePage() {
  const navigate = useNavigate()
  const [personnages, setPersonnages] = useState(() => {
    // Récupère l'état depuis localStorage si dispo
    return PERSONNAGES_DEFAUT.map(p => {
      const stored = localStorage.getItem(`perso_${p.id}`)
      return stored ? JSON.parse(stored) : p
    })
  })

  const updatePersonnage = (id, updated) => {
    setPersonnages(prev => prev.map(p => p.id === id ? updated : p))
    // Pont démo : sauvegarde dans localStorage pour que la vue joueur le détecte
    localStorage.setItem(`perso_${id}`, JSON.stringify(updated))
  }

  const resetAll = () => {
    const reset = PERSONNAGES_DEFAUT.map(p => ({...p}))
    setPersonnages(reset)
    reset.forEach(p => localStorage.removeItem(`perso_${p.id}`))
  }

  return (
    <div className="min-h-screen grid-bg max-w-lg mx-auto p-4">
      {/* Header MJ */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <button onClick={() => navigate('/')} className="text-slate-600 hover:text-slate-400 text-xs">‹ RETOUR</button>
        <div className="text-center">
          <div className="font-display text-lg font-black glow-magenta flicker">MAÎTRE DU JEU</div>
          <div className="text-xs tracking-widest text-slate-600">NEXUS // CONTRÔLE TOTAL</div>
        </div>
        <button onClick={resetAll} className="text-xs text-slate-700 hover:text-red-500 transition-colors" title="Reset">↺</button>
      </div>

      {/* Dés */}
      <DiceRoller />

      {/* Personnages */}
      <div className="text-xs tracking-widest mb-3" style={{color: 'var(--cyan)'}}>// GESTION DES AGENTS</div>
      {personnages.map(p => (
        <PersonnageControls key={p.id} perso={p} onUpdate={updatePersonnage} />
      ))}

      <div className="text-center text-xs text-slate-700 mt-6 py-2">
        NEXUS // AUTORITÉ MAÎTRE // MODE DÉMO ACTIF
      </div>
    </div>
  )
}
