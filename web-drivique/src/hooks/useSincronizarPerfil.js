import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { userService } from '@/services/userService'

// El perfil vive en el servidor (compartido con la app móvil): se vuelve a leer al volver a la pestaña y cada
// minuto para que un cambio hecho en la app aparezca aquí sin recargar.
export function useSincronizarPerfil() {
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!token) return undefined
    let activo = true
    const sincronizar = async () => {
      try {
        const data = await userService.getProfile()
        if (!activo || !data) return
        const nacionalidad = await userService.nacionalidadNombreDesdeId(data.nationalityId).catch(() => '')
        useAuthStore.getState().actualizarUsuario({
          nombre: data.firstName || '',
          apellido: data.lastName || '',
          telefono: data.phone || '',
          correo: data.email || '',
          cedula: data.documentNumber || '',
          fechaNacimiento: data.birthDate ? String(data.birthDate).slice(0, 10) : '',
          nacionalidad: nacionalidad || '',
          tipoDocumento: data.documentTypeCode || '',
          direccion: data.address || '',
        })
      } catch {
        /* sin conexión: se conserva lo que ya hay */
      }
    }
    const alVolver = () => { if (document.visibilityState === 'visible') sincronizar() }
    document.addEventListener('visibilitychange', alVolver)
    window.addEventListener('focus', sincronizar)
    const timer = setInterval(sincronizar, 60000)
    return () => {
      activo = false
      document.removeEventListener('visibilitychange', alVolver)
      window.removeEventListener('focus', sincronizar)
      clearInterval(timer)
    }
  }, [token])
}
