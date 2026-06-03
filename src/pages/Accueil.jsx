import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getState, subscribe, refresh } from '../lib/store.js'

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'radial-gradient(ellipse at 50% 0%, #1e1030 0%, #0d0b0f 70%)',
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: 'clamp(1.4rem, 5vw, 2.2rem)',
    color: 'var(--gold)',
    textAlign: 'center',
    marginBottom: '0.4rem',
    letterSpacing: '0.04em',
    textShadow: '0 0 40px rgba(201,168,76,0.4)',
  },
  subtitle: {
    color: 'var(--muted)',
    textAlign: 'center',
    marginBottom: '3rem',
    fontStyle: 'italic',
    fontSize: '1.1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.2rem',
    width: '100%',
    maxWidth: '700px',
    marginBottom: '3rem',
  },
  card: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  cardNom: {
    fontFamily: 'var(--font-title)',
    fontSize: '1rem',
    color: 'var(--gold2)',
    letterSpacing: '0.02em',
  },
  cardClasse: {
    color: 'var(--muted)',
    fontSize: '0.95rem',
    fontStyle: 'italic',
  },
  cardPv: {
    marginTop: '0.5rem',
    fontSize: '0.9rem',
    color: 'var(--success)',
  },
  mjBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--muted)',
    padding: '0.6rem 1.4rem',
    borderRadius: '999px',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
}

export default function Accueil() {
  const navigate = useNavigate()
  const [personnages, setPersonnages] = useState(getState().personnages)

  useEffect(() => subscribe(s => setPersonnages(s.personnages)), [])

  // Recharge depuis Supabase à chaque fois qu'on arrive sur cette page
  useEffect(() => { refresh() }, [])

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>⚔ JEU DE Rôle super COOL</h1>
      <p style={styles.subtitle}>Choisissez votre personnage pour rejoindre la partie</p>

      <div style={styles.grid}>
        {personnages.map(p => (
          <div
            key={p.id}
            style={styles.card}
            onClick={() => navigate(`/joueur/${p.id}`)}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--gold)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,168,76,0.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={styles.cardNom}>{p.nom}</div>
            <div style={styles.cardClasse}>{p.classe}</div>
            <div style={styles.cardPv}>❤ {p.pv_actuel} / {p.pv_max} PV</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          style={{ ...styles.mjBtn, borderColor: 'var(--gold)', color: 'var(--gold)' }}
          onClick={() => navigate('/creation')}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#000' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gold)' }}
        >
          ✦ Créer un personnage
        </button>
        <button
          style={styles.mjBtn}
          onClick={() => navigate('/maitre/login')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
        >
          🎲 Accès Maître du Jeu
        </button>
      </div>
    </div>
  )
}