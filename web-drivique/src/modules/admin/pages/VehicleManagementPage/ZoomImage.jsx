export default function ZoomImage({ setZoomImage, zoomImage }) {
  return (
    <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(5px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 99999,
                padding: 20,
              }}
              onClick={() => setZoomImage(null)}
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  padding: 20,
                  maxWidth: 640,
                  width: "100%",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
                  position: "relative",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {zoomImage.title}
                    </h3>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      Vista ampliada del vehículo
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setZoomImage(null)}
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      fontWeight: 700,
                      color: "#64748b",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                    }}
                  >
                    âœ•
                  </button>
                </div>
                <div
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <img
                    src={zoomImage.url}
                    alt={zoomImage.title}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 480,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </div>
              </div>
            </div>
  )
}
