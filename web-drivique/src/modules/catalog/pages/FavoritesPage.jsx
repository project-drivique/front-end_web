import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaHeart, FaTrashAlt, FaCar, FaArrowRight, FaUsers, FaCog, FaGasPump } from 'react-icons/fa'
import { useAuthStore } from '@/store/authStore'
import { useLanding } from '@/modules/landing/LandingContext'
import { catalogService } from '@/services/catalogService'
import { useFavoritos } from '../hooks/useFavorites'
import { formatCurrency } from '@/utils/currencyUtils'
import CatalogTopHeader from '../components/CatalogTopHeader'
import './FavoritesPage.css'

export default function FavoritesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const { moneda, tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'

  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todos')

  // Key de favoritos alineada con el resto del sistema
  const favoritosKey = useMemo(() => {
    if (!usuario?.id) return 'favoritosVehiculos'
    return `favoritosVehiculos_${usuario.id}`
  }, [usuario?.id])

  const { favoritos, toggleFavorito } = useFavoritos(favoritosKey)

  // Conjunto único de IDs guardados
  const idsFavoritos = useMemo(() => {
    const setFavs = new Set()
    favoritos.forEach(id => setFavs.add(String(id)))

    try {
      const legacy1 = JSON.parse(localStorage.getItem('Drivique_favoritos') || '[]')
      if (Array.isArray(legacy1)) legacy1.forEach(id => setFavs.add(String(id)))
      const legacy2 = JSON.parse(localStorage.getItem('favoritosVehiculos') || '[]')
      if (Array.isArray(legacy2)) legacy2.forEach(id => setFavs.add(String(id)))
    } catch { /* Se ignoran datos heredados dañados y se usa el estado actual. */ }

    return Array.from(setFavs)
  }, [favoritos])

  // Carga lista de vehículos
  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true)
        const datos = await catalogService.getVehiculos()
        setVehiculos(datos || [])
      } catch (err) {
        setError(err?.message || 'Error al cargar los vehículos')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  // Filtra vehículos favoritos + búsqueda/categoría
  const vehiculosFavoritos = useMemo(() => {
    return vehiculos.filter((v) => {
      const esFav = idsFavoritos.includes(String(v.id))
      if (!esFav) return false

      if (busqueda) {
        const query = busqueda.toLowerCase().trim()
        const matchNombre = v.nombre?.toLowerCase().includes(query)
        const matchMarca = v.marca?.toLowerCase().includes(query)
        const matchCat = v.categoria?.toLowerCase().includes(query)
        if (!matchNombre && !matchMarca && !matchCat) return false
      }

      if (categoria && categoria !== 'Todos') {
        if (v.categoria?.toLowerCase() !== categoria.toLowerCase()) return false
      }

      return true
    })
  }, [vehiculos, idsFavoritos, busqueda, categoria])

  const handleEliminar = (id, e) => {
    e.stopPropagation()
    toggleFavorito(id)
    try {
      ['Drivique_favoritos', 'favoritosVehiculos'].forEach(key => {
        const arr = JSON.parse(localStorage.getItem(key) || '[]')
        if (Array.isArray(arr)) {
          const filtrado = arr.filter(x => String(x) !== String(id))
          localStorage.setItem(key, JSON.stringify(filtrado))
        }
      })
    } catch { /* La eliminación principal ya se realizó en el almacén actual. */ }
  }

  const c = {
    navBg: esModoOscuro ? '#0f172a' : '#ffffff',
    navBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    navShadow: '0 4px 20px rgba(0,0,0,0.04)',
    accentText: 'var(--brand-text)',
  }

  return (
    <div className="favoritos-pagina">
      {/* Header superior principal con selector de idioma, moneda y modo oscuro */}
      <CatalogTopHeader c={c} mostrarPerfil modoRegistrado />

      <main className="favoritos-main">
        {/* Encabezado sin botón de volver */}
        <div className="favoritos-header-section">
          <div className="favoritos-header-title">
            <h1>{t('favoritos.title', 'Mis Favoritos')}</h1>
            <p>{t('favoritos.subtitle', 'Gestiona tus vehículos preferidos y accede a sus detalles rápidamente')}</p>
          </div>
        </div>

        {/* Barra de filtros */}
        {idsFavoritos.length > 0 && (
          <div className="favoritos-filtros-bar">
            <input
              type="text"
              className="favoritos-search-input"
              placeholder={t('favoritos.searchPlaceholder', 'Buscar por marca o modelo...')}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <select
              className="favoritos-select-cat"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="Todos">{t('favoritos.allCategories', 'Todas las categorías')}</option>
              <option value="Sedán">Sedán</option>
              <option value="SUV">SUV</option>
              <option value="Compacto">Compacto</option>
              <option value="Económico">Económico</option>
              <option value="Deportivo">Deportivo</option>
            </select>
          </div>
        )}

        {/* Cargando / Error */}
        {cargando && (
          <div className="favoritos-vacio-contenedor">
            <p>{t('favoritos.loading', 'Cargando tus favoritos...')}</p>
          </div>
        )}

        {!cargando && error && (
          <div className="favoritos-vacio-contenedor">
            <p style={{ color: '#ef4444' }}>{error}</p>
          </div>
        )}

        {/* Estado Vacío - Sin favoritos */}
        {!cargando && !error && idsFavoritos.length === 0 && (
          <div className="favoritos-vacio-contenedor">
            <div className="favoritos-vacio-icon-wrap">
              <FaHeart color="#ef4444" />
            </div>
            <h2>{t('favoritos.noFavoritesTitle', 'No tienes vehículos favoritos guardados')}</h2>
            <p>
              {t('favoritos.noFavoritesText', 'Explora nuestro catálogo y presiona el icono de corazón en los vehículos que te gusten para guardarlos aquí.')}
            </p>
            <Link to="/home" className="btn-ver-detalles-card">
              {t('favoritos.exploreCatalog', 'Explorar catálogo')} <FaArrowRight />
            </Link>
          </div>
        )}

        {/* Estado Vacío - Filtros sin coincidencia */}
        {!cargando && !error && idsFavoritos.length > 0 && vehiculosFavoritos.length === 0 && (
          <div className="favoritos-vacio-contenedor">
            <h2>{t('favoritos.noMatchesTitle', 'No hay coincidencias')}</h2>
            <p>{t('favoritos.noMatchesText', 'No encontramos vehículos guardados en tus favoritos que coincidan con los filtros aplicados.')}</p>
            <button
              className="btn-ver-detalles-card"
              onClick={() => { setBusqueda(''); setCategoria('Todos'); }}
            >
              {t('favoritos.clearFilters', 'Limpiar filtros')}
            </button>
          </div>
        )}

        {/* Lista de Tarjetas Agrandadas */}
        {!cargando && !error && vehiculosFavoritos.length > 0 && (
          <div className="favoritos-grid-lista">
            {vehiculosFavoritos.map((v) => (
              <div
                key={v.id}
                className="favorito-card-agrandada"
                onClick={() => navigate(`/catalogo/${v.id}`)}
              >
                {/* Imagen agrandada */}
                <div className="favorito-card-imagen-wrap">
                  {v.imagenes?.[0] ? (
                    <img src={v.imagenes[0]} alt={v.nombre} />
                  ) : (
                    <FaCar style={{ fontSize: 44, color: '#94a3b8' }} />
                  )}
                </div>

                {/* Contenido info */}
                <div className="favorito-card-contenido">
                  <div>
                    <div className="favorito-card-top-header">
                      <div>
                        <span className="favorito-badge-categoria">{v.categoria || 'Sedán'}</span>
                        <h3 className="favorito-card-titulo">{v.nombre}</h3>
                      </div>
                      <div className="favorito-card-precio">
                        {formatCurrency(v.precio, moneda)} <span>/{t('vehiculo.perDay', 'día')}</span>
                      </div>
                    </div>

                    <div className="favorito-specs-list">
                      <span className="favorito-spec-item">
                        <FaCog style={{ color: 'var(--brand-text)' }} /> {v.transmision || 'Automática'}
                      </span>
                      <span className="favorito-spec-item">
                        <FaUsers style={{ color: 'var(--brand-text)' }} /> {v.pasajeros || v.capacidad || 5} {t('vehiculo.seats', 'Plazas')}
                      </span>
                      <span className="favorito-spec-item">
                        <FaGasPump style={{ color: 'var(--brand-text)' }} /> {v.combustible || 'Gasolina'}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="favorito-card-acciones">
                    <button
                      className="btn-eliminar-favorito-card"
                      onClick={(e) => handleEliminar(v.id, e)}
                    >
                      <FaTrashAlt /> {t('favoritos.delete', 'Eliminar')}
                    </button>

                    <button className="btn-ver-detalles-card">
                      {t('favoritos.viewDetailsAndReserve', 'Ver detalles y reservar')} <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
