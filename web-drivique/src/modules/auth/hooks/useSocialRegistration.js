// src/modules/auth/hooks/useSocialRegistration.js
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { createPkceChallenge } from '../utils/pkce'

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
        appId:   FACEBOOK_APP_ID || '100000000000000',
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

export function useSocialRegistration({ onExito } = {}) {
  const { t } = useTranslation()
  const { login: storeLogin } = useAuthStore()

  const [cargandoGoogle,   setCargandoGoogle]   = useState(false)
  const [cargandoFacebook, setCargandoFacebook] = useState(false)
  const [errorSocial,      setErrorSocial]      = useState(null)
  const [proveedorExito,   setProveedorExito]   = useState(null)

  const googleClientRef = useRef(null)

  /* Pre-carga el SDK de Facebook en segundo plano al montar */
  useEffect(() => {
    if (FACEBOOK_APP_ID) {
      cargarFacebookSDK().catch(() => {})
    }
  }, [])

  /* ─────────────────────────────────────────
     GOOGLE (PKCE & OIDC)
  ───────────────────────────────────────── */
  const iniciarGoogle = async () => {
    setErrorSocial(null)
    setProveedorExito(null)
    setCargandoGoogle(true)

    try {
      const { codeVerifier, nonce, state } = await createPkceChallenge()

      let tokenPayload = null

      if (GOOGLE_CLIENT_ID) {
        await cargarGoogleSDK()

        tokenPayload = await new Promise((resolve, reject) => {
          if (!googleClientRef.current) {
            googleClientRef.current = window.google.accounts.oauth2.initTokenClient({
              client_id: GOOGLE_CLIENT_ID,
              scope: 'openid email profile',
              callback: () => {},
            })
          }

          googleClientRef.current.callback = (resp) => {
            if (resp.error) {
              reject(new Error(resp.error_description || resp.error))
              return
            }
            resolve({
              accessToken: resp.access_token,
              idToken: resp.id_token,
              codeVerifier,
              nonce,
              state,
              provider: 'GOOGLE',
            })
          }

          googleClientRef.current.requestAccessToken({ prompt: 'select_account' })
        })
      } else {
        // Modo sandbox / desarrollo local sin credenciales OAuth registradas
        await new Promise((r) => setTimeout(r, 600))
        tokenPayload = {
          provider: 'GOOGLE',
          idToken: 'sandbox_google_token:cliente.google@drivique.com',
          codeVerifier,
          nonce,
          deviceInfo: navigator.userAgent,
        }
      }

      const res = await authService.loginGoogle(tokenPayload)
      const token = res.accessToken || res.token
      const usuario = res.usuario || res.userProfile

      storeLogin(token, usuario)
      setProveedorExito('google')
      onExito?.('google', { token, usuario })

    } catch (err) {
      if (err?.type === 'popup_closed' || err?.message?.includes('popup_closed')) return
      setErrorSocial(err?.message || t('registro.errors.googleError', 'Error al iniciar sesión con Google'))
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
      let tokenPayload = null

      if (FACEBOOK_APP_ID && window.FB) {
        await cargarFacebookSDK()

        const accessToken = await new Promise((resolve, reject) => {
          window.FB.login((resp) => {
            if (resp.status === 'connected') {
              resolve(resp.authResponse.accessToken)
            } else {
              reject(null)
            }
          }, { scope: 'public_profile,email', return_scopes: true })
        })

        tokenPayload = {
          provider: 'FACEBOOK',
          accessToken,
          deviceInfo: navigator.userAgent,
        }
      } else {
        // Modo sandbox / desarrollo local sin credenciales FB registradas
        await new Promise((r) => setTimeout(r, 600))
        tokenPayload = {
          provider: 'FACEBOOK',
          accessToken: 'sandbox_facebook_token:cliente.facebook@drivique.com',
          deviceInfo: navigator.userAgent,
        }
      }

      const res = await authService.loginFacebook(tokenPayload)
      const token = res.accessToken || res.token
      const usuario = res.usuario || res.userProfile

      storeLogin(token, usuario)
      setProveedorExito('facebook')
      onExito?.('facebook', { token, usuario })

    } catch (err) {
      if (!err) return
      setErrorSocial(err?.message || t('registro.errors.facebookError', 'Error al iniciar sesión con Facebook'))
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