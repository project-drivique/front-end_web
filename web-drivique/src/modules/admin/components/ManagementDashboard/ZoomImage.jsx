export default function ZoomImage({ c, setZoomImage, zoomImage }) {
  return (
    <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(5px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
              }}
              onClick={() => setZoomImage(null)}
            >
              <div
                style={{
                  position: 'relative',
                  background: c.zoomModalBg,
                  border: `1px solid ${c.cardBorder}`,
                  borderRadius: 16,
                  padding: 20,
                  maxWidth: 580,
                  width: '100%',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: c.text }}>{zoomImage.title}</h3>
                  <button
                    type="button"
                    onClick={() => setZoomImage(null)}
                    style={{
                      background: c.zoomCloseBtnBg,
                      border: 'none',
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      fontWeight: 700,
                      color: c.textMuted,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
                <img
                  src={zoomImage.url}
                  alt={zoomImage.title}
                  style={{
                    width: '100%',
                    maxHeight: 380,
                    objectFit: 'contain',
                    borderRadius: 10,
                    background: c.bg,
                  }}
                />
              </div>
            </div>
  )
}
