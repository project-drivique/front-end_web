// src/modules/auth/hooks/useRegistroSocial.js
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

const GOOGLE_CLIENT_ID  = import.meta.env.VITE_GOOGLE_CLIENT_ID
const FACEBOOK_APP_ID   = import.meta.env.VITE_FACEBOOK_APP_ID

/* ── Carga dinámica del SDK de Google Identity Services ── */
function cargarGoogleSDK() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload  = resolve
    script.onerror = () => reject(new Error('No se pudo cargar el SDK de Google'))
    document.head.appendChild(script)
  })
}

/* ── Carga dinámica del SDK de Facebook ── */
function cargarFacebookSDK() {
  return new Promise((resolve) => {
    if (window.FB) { resolve(); return }
    window.fbAsyncInit = () => {
      window.FB.init({
        appId:   FACEBOOK_APP_ID,
        cookie:  true,
        xfbml:   false,
        version: 'v20.0',
      })
      resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/es_LA/sdk.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  })
}

export function useRegistroSocial({ onExito } = {}) {
  const { t } = useTranslation()
  const { login: storeLogin } = useAuthStore()

  const [cargandoGoogle,   setCargandoGoogle]   = useState(false)
  const [cargandoFacebook, setCargandoFacebook] = useState(false)
  const [errorSocial,      setErrorSocial]      = useState(null)
  const [proveedorExito,   setProveedorExito]   = useState(null)

  const googleClientRef = useRef(null)

  /* Pre-carga el SDK de Facebook en segundo plano al montar */
  useEffect(() => {
    cargarFacebookSDK().catch(() => {})
  }, [])

  /* ─────────────────────────────────────────
     GOOGLE
  ───────────────────────────────────────── */
  const iniciarGoogle = async () => {
    setErrorSocial(null)
    setProveedorExito(null)
    setCargandoGoogle(true)

    try {
      await cargarGoogleSDK()

      const idToken = await new Promise((resolve, reject) => {
        // Reutiliza el cliente si ya fue inicializado
        if (!googleClientRef.current) {
          googleClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'openid email profile',
            callback: () => {}, // se reemplaza abajo
          })
        }

        googleClientRef.current.callback = async (resp) => {
          if (resp.error) { reject(new Error(resp.error_description || resp.error)); return }
          // resp.access_token → se lo pedimos a Google para obtener el id_token
          // Usamos el endpoint de userinfo para obtener el id_token implícito
          // ALTERNATIVA: usar initCodeClient para flujo server-side más seguro
          resolve(resp.access_token)
        }

        googleClientRef.current.requestAccessToken({ prompt: 'select_account' })
      })

      const { token, usuario } = await authService.loginGoogle(idToken)
      storeLogin(token, usuario)
      setProveedorExito('google')
      onExito?.('google', { token, usuario })

    } catch (err) {
      // El usuario cerró la ventana → error silencioso
      if (err?.type === 'popup_closed' || err?.message?.includes('popup_closed')) return
      setErrorSocial(err?.message || t('registro.errors.googleError'))
    } finally {
      setCargandoGoogle(false)
    }
  }

  /* ─────────────────────────────────────────
     FACEBOOK
  ───────────────────────────────────────── */
  const iniciarFacebook = async () => {
    setErrorSocial(null)
    setProveedorExito(null)
    setCargandoFacebook(true)

    try {
      await cargarFacebookSDK()

      const accessToken = await new Promise((resolve, reject) => {
        window.FB.login((resp) => {
          if (resp.status === 'connected') {
            resolve(resp.authResponse.accessToken)
          } else {
            // El usuario canceló el login
            reject(null)
          }
        }, { scope: 'public_profile,email', return_scopes: true })
      })

      const { token, usuario } = await authService.loginFacebook(accessToken)
      storeLogin(token, usuario)
      setProveedorExito('facebook')
      onExito?.('facebook', { token, usuario })

    } catch (err) {
      // null = el usuario canceló → error silencioso
      if (!err) return
      setErrorSocial(err?.message || t('registro.errors.facebookError'))
    } finally {
      setCargandoFacebook(false)
    }
  }

  return {
    cargandoGoogle,
    cargandoFacebook,
    errorSocial,
    proveedorExito,
    iniciarGoogle,
    iniciarFacebook,
  }
}