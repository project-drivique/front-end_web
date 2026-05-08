import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUsuario } from '../services/authService'

const MAX_INTENTOS = 3

export function useLogin() {
  const navigate = useNavigate()

  const [correo, setCorreo]           = useState('')
  const [contrasena, setContrasena]   = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)
  const [cargando, setCargando]       = useState(false)
  const [intentos, setIntentos]       = useState(0)
  const [bloqueado, setBloqueado]     = useState(false)
  const [errores, setErrores]         = useState({ correo: '', contrasena: '', general: '' })
  const [exito, setExito]             = useState('')

  const validarCorreo = (valor) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!valor) return 'El correo es obligatorio'
    if (!regex.test(valor)) return 'Formato de correo inválido'
    return ''
  }

  const validarFormulario = () => {
    const nuevos = {
      correo: validarCorreo(correo),
      contrasena: !contrasena ? 'La contraseña es obligatoria' : '',
      general: '',
    }
    setErrores(nuevos)
    return !nuevos.correo && !nuevos.contrasena
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setExito('')

    if (bloqueado) {
      setErrores(prev => ({ ...prev, general: 'Cuenta bloqueada. Usa ¿Olvidaste tu contraseña?' }))
      return
    }

    if (!validarFormulario()) return

    setCargando(true)
    setErrores({ correo: '', contrasena: '', general: '' })

    try {
      const datos = await loginUsuario({ correo, contrasena })
      localStorage.setItem('renta_token', datos.token)
      localStorage.setItem('renta_user', JSON.stringify({ correo, nombre: datos.nombre, rol: datos.rol }))
      setExito('¡Acceso exitoso! Redirigiendo...')
      setTimeout(() => {
        if (datos.rol === 'administrador') navigate('/admin')
        else navigate('/home')
      }, 1000)
    } catch (error) {
      const nuevosIntentos = intentos + 1
      setIntentos(nuevosIntentos)
      if (nuevosIntentos >= MAX_INTENTOS) {
        setBloqueado(true)
        setErrores(prev => ({ ...prev, general: `Cuenta bloqueada tras ${MAX_INTENTOS} intentos fallidos.` }))
      } else {
        setErrores(prev => ({
          ...prev,
          general: `${error.message}. Intentos restantes: ${MAX_INTENTOS - nuevosIntentos}`,
        }))
      }
    } finally {
      setCargando(false)
    }
  }

  const handleCorreoChange = (valor) => {
    setCorreo(valor)
    if (errores.correo) setErrores(prev => ({ ...prev, correo: validarCorreo(valor) }))
  }

  return {
    correo, contrasena, mostrarPass, cargando,
    intentos, bloqueado, errores, exito,
    setContrasena, setMostrarPass,
    handleCorreoChange, handleSubmit,
    MAX_INTENTOS,
  }
}