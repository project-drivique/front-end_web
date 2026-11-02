export default function RegistrationPart({ c }) {
  return (
    <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          input::placeholder { color: ${c.inputPlaceholder}; opacity: 1; }
          @media (max-width: 920px) {
            .auth-back-floating {
              top: 18px !important;
              left: 18px !important;
            }
            .auth-split-card {
              max-width: 500px !important;
              grid-template-columns: 1fr !important;
            }
            .auth-split-brand {
              min-height: 220px !important;
              border-radius: 24px 24px 0 0 !important;
              padding: 26px 22px !important;
            }
            .auth-brand-logo {
              width: 128px !important;
              height: 128px !important;
            }
            .auth-split-form {
              padding: 28px 24px 26px !important;
            }
          }
          .auth-back-floating {
            position: absolute;
            top: 28px;
            left: 34px;
            z-index: 4;
            width: auto;
          }
          .auth-back-floating > div {
            margin-bottom: 0 !important;
          }
        `}</style>
  )
}
