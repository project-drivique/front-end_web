// src/modules/auth/hooks/useSocialRegistration.js
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { createPkceChallenge } from '../utils/pkce'

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '15258745812-cg3pq0pmq7c78seov68c5c3n5vmoa6gr.apps.googleusercontent.com'
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '100000000000000'

/* ── Carga dinámica del SDK de Google Identity Services (GIS) ── */
function cargarGoogleSDK() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = () => reject(new Error('No se pudo cargar la API oficial de Google'))
    document.head.appendChild(script)
  })
}

/* ── Carga dinámica del SDK oficial de Facebook (Meta) ── */
function cargarFacebookSDK() {
  return new Promise((resolve) => {
    if (window.FB) {
      resolve()
      return
    }
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
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

  const [cargandoGoogle, setCargandoGoogle] = useState(false)
  const [cargandoFacebook, setCargandoFacebook] = useState(false)
  const [errorSocial, setErrorSocial] = useState(null)
  const [proveedorExito, setProveedorExito] = useState(null)

  const googleClientRef = useRef(null)

  /* Pre-carga los SDKs oficiales de Google y Facebook */
  useEffect(() => {
    cargarGoogleSDK().catch(() => {})
    cargarFacebookSDK().catch(() => {})
  }, [])

  /* ─────────────────────────────────────────
     AUTENTICACIÓN REAL CON GOOGLE (OIDC & GIS)
  ───────────────────────────────────────── */
  const iniciarGoogle = async () => {
    setErrorSocial(null)
    setProveedorExito(null)
    setCargandoGoogle(true)

    try {
      await cargarGoogleSDK()
      const { codeVerifier, nonce, state } = await createPkceChallenge()

      // 1. Abrir la ventana oficial de Google (Account Chooser / Consent Screen)
      const tokenResponse = await new Promise((resolve, reject) => {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'openid email profile',
            callback: (resp) => {
              if (resp.error) {
                reject(new Error(resp.error_description || resp.error))
                return
              }
              resolve(resp)
            },
            error_callback: (err) => {
              reject(new Error(err?.message || 'Error al abrir ventana de Google'))
            },
          })

          googleClientRef.current = client
          client.requestAccessToken({ prompt: 'select_account' })
        } catch (e) {
          reject(e)
        }
      })

      // 2. Obtener datos del perfil real desde la API UserInfo de Google
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      })

      if (!userInfoRes.ok) {
        throw new Error('No se pudo obtener el perfil desde la API de Google')
      }

      const googleUser = await userInfoRes.json()

      let rawFirst = (googleUser.given_name || '').trim()
      let rawLast = (googleUser.family_name || '').trim()
      const fullName = (googleUser.name || '').trim()

      if (!rawFirst && fullName) {
        const parts = fullName.split(/\s+/)
        rawFirst = parts[0]
        rawLast = parts.length > 1 ? parts[1] : ''
      } else if (!rawLast && fullName) {
        const parts = fullName.split(/\s+/)
        if (parts.length > 1) {
          rawLast = parts[1]
        }
      }

      // 3. Enviar al backend / servicio de autenticación
      const payload = {
        provider: 'GOOGLE',
        email: googleUser.email,
        name: fullName,
        firstName: rawFirst || (googleUser.email ? googleUser.email.split('@')[0] : 'Usuario'),
        lastName: rawLast,
        picture: googleUser.picture,
        accessToken: tokenResponse.access_token,
        codeVerifier,
        nonce,
        state,
        deviceInfo: navigator.userAgent,
      }

      const res = await authService.loginGoogle(payload)
      const token = res.accessToken || res.token
      const usuario = res.usuario || res.userProfile

      storeLogin(token, usuario)
      setProveedorExito('google')
      onExito?.('google', { token, usuario })
    } catch (err) {
      if (
        err?.type === 'popup_closed' ||
        err?.message?.includes('popup_closed') ||
        err?.message?.includes('user_cancel')
      ) {
        // Usuario cerró la ventana de Google sin seleccionar cuenta
        return
      }
      setErrorSocial(
        err?.message || t('registro.errors.googleError', 'Error al autenticar con la API de Google')
      )
    } finally {
      setCargandoGoogle(false)
    }
  }

  /* ─────────────────────────────────────────
     AUTENTICACIÓN REAL CON FACEBOOK (META SDK)
  ───────────────────────────────────────── */
  const iniciarFacebook = async () => {
    setErrorSocial(null)
    setProveedorExito(null)
    setCargandoFacebook(true)

    try {
      await cargarFacebookSDK()

      // 1. Abrir el diálogo oficial de inicio de sesión de Facebook
      const authResp = await new Promise((resolve, reject) => {
        if (!window.FB) {
          reject(new Error('El SDK oficial de Facebook no está disponible en este navegador'))
          return
        }

        window.FB.login(
          (response) => {
            if (response.authResponse) {
              resolve(response.authResponse)
            } else {
              reject(new Error('popup_closed'))
            }
          },
          { scope: 'public_profile,email', return_scopes: true }
        )
      })

      // 2. Consultar perfil real desde Graph API de Facebook
      const fbUser = await new Promise((resolve, reject) => {
        window.FB.api(
          '/me',
          { fields: 'id,name,first_name,last_name,email,picture' },
          (response) => {
            if (response.error) {
              reject(new Error(response.error.message))
            } else {
              resolve(response)
            }
          }
        )
      })

      let rawFirst = (fbUser.first_name || '').trim()
      let rawLast = (fbUser.last_name || '').trim()
      const fullName = (fbUser.name || '').trim()

      if (!rawFirst && fullName) {
        const parts = fullName.split(/\s+/)
        rawFirst = parts[0]
        rawLast = parts.length > 1 ? parts[1] : ''
      } else if (!rawLast && fullName) {
        const parts = fullName.split(/\s+/)
        if (parts.length > 1) {
          rawLast = parts[1]
        }
      }

      const { codeVerifier, nonce } = await createPkceChallenge()

      const payload = {
        provider: 'FACEBOOK',
        email: fbUser.email || `${fbUser.id}@facebook.com`,
        name: fullName,
        firstName: rawFirst || 'Usuario',
        lastName: rawLast,
        picture: fbUser.picture?.data?.url,
        accessToken: authResp.accessToken,
        codeVerifier,
        nonce,
        deviceInfo: navigator.userAgent,
      }

      const res = await authService.loginFacebook(payload)
      const token = res.accessToken || res.token
      const usuario = res.usuario || res.userProfile

      storeLogin(token, usuario)
      setProveedorExito('facebook')
      onExito?.('facebook', { token, usuario })
    } catch (err) {
      if (
        err?.type === 'popup_closed' ||
        err?.message?.includes('popup_closed') ||
        err?.message?.includes('user_cancel')
      ) {
        // Usuario cerró el diálogo de Facebook
        return
      }
      setErrorSocial(
        err?.message ||
          t('registro.errors.facebookError', 'Error al autenticar con la API de Facebook')
      )
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