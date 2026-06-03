import { useNavigate } from 'react-router-dom'
import { PERSONNAGES_DEFAUT } from '../lib/supabase'
import { useState } from 'react'

export default function SelectPage() {
  const navigate = useNavigate()
  const [mjCode, setMjCode] = useState('')
  const [mjError, setMjError] = useState(false)
  const [showMj, setShowMj] = useState(false)

  const MJ_PASSWORD = 'nexus2099'

  const handleMj = () => {
    if (mjCode === MJ_PASSWORD) {
      navigate('/maitre')
    } else {
      setMjError(true)
      setTimeout(() => setMjError(false), 1000)
    }
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-xs tracking-[0.4em] text-slate-500 mb-2 font-mono">SYSTÈME // v2.099</div>
        <h1 className="font-display text-4xl font-black glow-cyan flicker mb-1">NEXUS</h1>
        <div className="text-xs tracking-[0.3em] text-slate-400">TERMINAL D'ACCÈS NEURAL</div>
        <div className="mt-3 h-px w-48 mx-auto" style={{background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)'}} />
      </div>

      {/* Choisir personnage */}
      <div className="w-full max-w-md mb-6">
        <div className="text-xs glow-cyan mb-3 tracking-widest">// SÉLECTIONNER IDENTITÉ</div>
        <div className="space-y-3">
          {PERSONNAGES_DEFAUT.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/joueur/${p.id}`)}
              className="w-full panel corner-tl p-4 flex items-center gap-4 hover:border-cyan-glow transition-all duration-200 text-left group"
              style={{border: '1px solid var(--border)'}}
            >
              <span className="text-3xl">{p.avatar}</span>
              <div className="flex-1">
                <div className="font-display text-sm font-bold group-hover:glow-cyan transition-all"
                     style={{color: 'var(--cyan)'}}>
                  {p.nom}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{p.classe}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">PV</div>
                <div className="font-display text-sm" style={{color: 'var(--magenta)'}}>
                  {p.pv_actuel}/{p.pv_max}
                </div>
              </div>
              <div className="text-slate-600 group-hover:text-cyan-400 transition-colors">›</div>
            </button>
          ))}
        </div>
      </div>

      {/* Accès MJ */}
      <div className="w-full max-w-md">
        <div className="h-px mb-6" style={{background: 'linear-gradient(90deg, transparent, rgba(255,0,255,0.3), transparent)'}} />
        {!showMj ? (
          <button
            onClick={() => setShowMj(true)}
            className="btn-magenta w-full py-2 text-xs"
          >
            ⬡ ACCÈS MAÎTRE DU JEU
          </button>
        ) : (
          <div className={`panel p-4 border-magenta-glow slide-in ${mjError ? 'border-red-500' : ''}`}>
            <div className="text-xs mb-3 tracking-widest" style={{color: 'var(--magenta)'}}>
              // CODE D'ACCÈS MJ
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                className="cyber-input flex-1"
                placeholder="••••••••"
                value={mjCode}
                onChange={e => setMjCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleMj()}
                autoFocus
              />
              <button onClick={handleMj} className="btn-magenta px-4">OK</button>
            </div>
            {mjError && (
              <div className="text-xs mt-2 text-red-400">// ACCÈS REFUSÉ</div>
            )}
            <div className="text-xs mt-2 text-slate-600">demo: nexus2099</div>
          </div>
        )}
      </div>
    </div>
  )
}
