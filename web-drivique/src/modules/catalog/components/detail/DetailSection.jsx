export default function DetailSection({ icon, title, action, children, first = false, style = {} }) {
  return (
    <section
      style={{
        paddingTop: first ? 0 : 22,
        marginTop: first ? 0 : 22,
        borderTop: first ? 'none' : '1px solid var(--borde)',
        ...style,
      }}
    >
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
          {title && (
            <h3 style={{
              display: 'flex', alignItems: 'center', gap: 9,
              fontSize: 12.5, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
              color: 'var(--texto-second)', margin: 0,
            }}>
              {icon && (
                <span style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: 'rgba(var(--brand-primary-rgb),0.1)', color: 'var(--brand-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {icon}
                </span>
              )}
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}