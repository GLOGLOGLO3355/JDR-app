import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MJ_PASSWORD = 'caca123'
export default function MaitreLogin({ onSuccess }) {
  const [input, setInput] = useState('')
  const [erreur, setErreur] = useState(false)
  const navigate = useNavigate()

  function handleSubmit() {
    if (input === MJ_PASSWORD) {
      onSuccess()
      navigate('/maitre')
    } else {
      setErreur(true)
      setTimeout(() => setErreur(false), 1500)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, #1a0820 0%, #0d0b0f 70%)',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎲</div>
        <h1 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold)', fontSize: '1.4rem', letterSpacing: '0.04em' }}>
          Accès Maître du Jeu
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>Prononcez le mot de passe</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '320px' }}>
        <input
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Mot de passe..."
          style={{
            background: 'var(--bg2)',
            border: `1px solid ${erreur ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            padding: '0.9rem 1.2rem',
            color: 'var(--text)',
            fontSize: '1.1rem',
            width: '100%',
            transition: 'border-color 0.2s',
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            background: 'var(--gold)',
            color: '#0d0b0f',
            fontFamily: 'var(--font-title)',
            fontSize: '0.9rem',
            padding: '0.9rem',
            borderRadius: 'var(--radius)',
            fontWeight: 700,
            letterSpacing: '0.05em',
            transition: 'opacity 0.2s',
          }}
        >
          ENTRER
        </button>
        {erreur && <p style={{ color: 'var(--danger)', textAlign: 'center', fontSize: '0.9rem' }}>Mot de passe incorrect.</p>}
        <button
          onClick={() => navigate('/')}
          style={{ background: 'transparent', color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}
        >
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
