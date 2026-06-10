// src/modules/auth/components/SpinnerBtn.jsx

export default function SpinnerBtn({ esModoOscuro = false }) {
  return (
    <span style={{
      width: 16, height: 16,
      border: `2px solid ${esModoOscuro ? 'rgba(255,255,255,0.18)' : '#e2e8f0'}`,
      borderTopColor: esModoOscuro ? '#cbd5e1' : '#64748b',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
      flexShrink: 0,
    }} />
  )
}