// src/modules/auth/hooks/useSocialRegistration.js
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { createPkceChallenge } from '../utils/pkce'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID

/* ── Carga dinámica del SDK de Google Identity Services ── */
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
    script.onerror = () => reject(new Error('No se pudo cargar el SDK de Google'))
    document.head.appendChild(script)
  })
}

/* ── Carga dinámica del SDK de Facebook ── */
function cargarFacebookSDK() {
  return new Promise((resolve) => {
    if (window.FB) {
      resolve()
      return
    }
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: FACEBOOK_APP_ID || '100000000000000',
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

  // Estado del modal de consentimiento/cuenta interactiva
  const [modalConsentimiento, setModalConsentimiento] = useState({
    visible: false,
    provider: 'GOOGLE',
  })

  const googleClientRef = useRef(null)

  /* Pre-carga el SDK de Facebook en segundo plano al montar */
  useEffect(() => {
    if (FACEBOOK_APP_ID) {
      cargarFacebookSDK().catch(() => {})
    }
  }, [])

  /* ─────────────────────────────────────────
     PROCESAR LOGIN SOCIAL CON DATOS REALES
  ───────────────────────────────────────── */
  const procesarLoginSocial = async ({ provider, email, firstName, lastName, tokenPayload }) => {
    try {
      const { codeVerifier, nonce } = await createPkceChallenge()

      const payload = {
        provider: provider.toUpperCase(),
        email: email,
        firstName: firstName,
        lastName: lastName,
        codeVerifier,
        nonce,
        deviceInfo: navigator.userAgent,
        ...tokenPayload,
      }

      const res = await authService.socialLogin(payload)
      const token = res.accessToken || res.token
      const usuario = res.usuario || res.userProfile

      storeLogin(token, usuario)
      setProveedorExito(provider.toLowerCase())
      onExito?.(provider.toLowerCase(), { token, usuario })
      return true
    } catch (err) {
      const msg = err?.message || t('registro.errors.socialError', 'Error al procesar el inicio de sesión social')
      setErrorSocial(msg)
      return false
    }
  }

  /* ─────────────────────────────────────────
     GOOGLE (PKCE & OIDC / GIS)
  ───────────────────────────────────────── */
  const iniciarGoogle = async () => {
    setErrorSocial(null)
    setProveedorExito(null)

    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'TU_GOOGLE_CLIENT_ID') {
      setCargandoGoogle(true)
      try {
        const { codeVerifier, nonce, state } = await createPkceChallenge()
        await cargarGoogleSDK()

        const tokenResp = await new Promise((resolve, reject) => {
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
            resolve(resp)
          }

          googleClientRef.current.requestAccessToken({ prompt: 'select_account' })
        })

        // Consultar perfil real del usuario desde Google OAuth2 UserInfo
        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResp.access_token}` },
        })
        const googleProfile = await userinfoRes.json()

        await procesarLoginSocial({
          provider: 'GOOGLE',
          email: googleProfile.email,
          firstName: googleProfile.given_name || googleProfile.name || 'Usuario',
          lastName: googleProfile.family_name || '',
          tokenPayload: {
            accessToken: tokenResp.access_token,
            codeVerifier,
            nonce,
            state,
          },
        })
      } catch (err) {
        if (err?.type === 'popup_closed' || err?.message?.includes('popup_closed')) {
          setCargandoGoogle(false)
          return
        }
        // Si falla GIS, permitir seleccionar su cuenta mediante el diálogo de consentimiento
        setModalConsentimiento({ visible: true, provider: 'GOOGLE' })
      } finally {
        setCargandoGoogle(false)
      }
    } else {
      // Abre el diálogo interactivo de consentimiento para que el usuario ingrese su cuenta real
      setModalConsentimiento({ visible: true, provider: 'GOOGLE' })
    }
  }

  /* ─────────────────────────────────────────
     FACEBOOK (SDK / DIALOG)
  ───────────────────────────────────────── */
  const iniciarFacebook = async () => {
    setErrorSocial(null)
    setProveedorExito(null)

    if (FACEBOOK_APP_ID && FACEBOOK_APP_ID !== 'TU_FACEBOOK_APP_ID' && window.FB) {
      setCargandoFacebook(true)
      try {
        await cargarFacebookSDK()

        const authResp = await new Promise((resolve, reject) => {
          window.FB.login(
            (resp) => {
              if (resp.status === 'connected') {
                resolve(resp.authResponse)
              } else {
                reject(new Error('Inicio de sesión con Facebook cancelado'))
              }
            },
            { scope: 'public_profile,email', return_scopes: true }
          )
        })

        const fbProfile = await new Promise((resolve) => {
          window.FB.api('/me', { fields: 'id,name,first_name,last_name,email,picture' }, (res) => resolve(res))
        })

        await procesarLoginSocial({
          provider: 'FACEBOOK',
          email: fbProfile.email || `${fbProfile.id}@facebook.com`,
          firstName: fbProfile.first_name || fbProfile.name || 'Usuario',
          lastName: fbProfile.last_name || '',
          tokenPayload: {
            accessToken: authResp.accessToken,
          },
        })
      } catch (err) {
        if (!err) {
          setCargandoFacebook(false)
          return
        }
        setModalConsentimiento({ visible: true, provider: 'FACEBOOK' })
      } finally {
        setCargandoFacebook(false)
      }
    } else {
      // Abre el diálogo interactivo de consentimiento para que el usuario ingrese su cuenta real
      setModalConsentimiento({ visible: true, provider: 'FACEBOOK' })
    }
  }

  const cerrarConsentimiento = () => {
    setModalConsentimiento({ visible: false, provider: 'GOOGLE' })
  }

  const confirmarConsentimiento = async (datos) => {
    cerrarConsentimiento()
    const isGoogle = datos.provider === 'GOOGLE'
    if (isGoogle) setCargandoGoogle(true)
    else setCargandoFacebook(true)

    try {
      await procesarLoginSocial({
        provider: datos.provider,
        email: datos.email,
        firstName: datos.firstName,
        lastName: datos.lastName,
      })
    } finally {
      if (isGoogle) setCargandoGoogle(false)
      else setCargandoFacebook(false)
    }
  }

  return {
    cargandoGoogle,
    cargandoFacebook,
    errorSocial,
    proveedorExito,
    iniciarGoogle,
    iniciarFacebook,
    modalConsentimiento,
    cerrarConsentimiento,
    confirmarConsentimiento,
  }
}