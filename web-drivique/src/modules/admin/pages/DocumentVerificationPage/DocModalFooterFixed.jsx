export default function DocModalFooterFixed({ errorMessage, handleAprobarDocumento, handleRechazarDocumento, totalChecked, totalPoints }) {
  return (
    <footer className="doc-modal-footer-fixed">
                  {errorMessage && (
                    <div className="doc-modal-error-banner">
                      ⚠️ {errorMessage}
                    </div>
                  )}
                  <div className="doc-modal-footer-bar">
                    <div className="doc-modal-counter">
                      <strong>{totalChecked} de {totalPoints}</strong> revisados
                    </div>
                    <div className="doc-modal-footer-btns">
                      <button
                        type="button"
                        className="doc-btn-reject"
                        onClick={handleRechazarDocumento}
                      >
                        Rechazar
                      </button>
                      <button
                        type="button"
                        className="doc-btn-approve"
                        onClick={handleAprobarDocumento}
                      >
                        Aprobar
                      </button>
                    </div>
                  </div>
                </footer>
  )
}
