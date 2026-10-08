import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaHeart, FaTrashAlt, FaCar, FaArrowRight, FaUsers, FaCog, FaGasPump } from 'react-icons/fa'
import { useAuthStore } from '@/store/authStore'
import { useLanding } from '@/modules/landing/LandingContext'
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

  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todos')

  // Key de favoritos alineada con el resto del sistema
  const favoritosKey = useMemo(() => {
    if (!usuario?.id) return 'favoritosVehiculos'
    return `favoritosVehiculos_${usuario.id}`
  }, [usuario?.id])

  const { favoritos, vehiculosFavoritos: vehiculos, toggleFavorito, cargado, error } = useFavoritos(favoritosKey)
  const cargando = !cargado

  // Conjunto único de IDs guardados
  const idsFavoritos = useMemo(() => {
    const setFavs = new Set()
    favoritos.forEach(id => setFavs.add(String(id)))

    return Array.from(setFavs)
  }, [favoritos])

  // Filtra vehículos favoritos + búsqueda/categoría
  const vehiculosFavoritos = useMemo(() => {
    return vehiculos.filter((v) => {
      const esFav = idsFavoritos.includes(String(v.id))
      if (!esFav) return false

      if (busqueda) {
        const query = busqueda.toLowerCase().trim()
        const matchNombre = v.model?.toLowerCase().includes(query)
        const matchMarca = v.brandName?.toLowerCase().includes(query)
        const matchCat = v.categoryName?.toLowerCase().includes(query)
        if (!matchNombre && !matchMarca && !matchCat) return false
      }

      if (categoria && categoria !== 'Todos') {
        if (v.categoryName?.toLowerCase() !== categoria.toLowerCase()) return false
      }

      return true
    })
  }, [vehiculos, idsFavoritos, busqueda, categoria])

  const handleEliminar = (id, e) => {
    e.stopPropagation()
    toggleFavorito(id)
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
              {[...new Set(vehiculos.map(vehicle => vehicle.categoryName).filter(Boolean))].map(nombre => (
                <option key={nombre} value={nombre}>{nombre}</option>
              ))}
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
            <p style={{ color: '#ef4444' }}>{error?.response?.data?.detail || t('favoritos.loadError', 'No fue posible cargar tus favoritos.')}</p>
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
                  {v.mainImageUrl ? (
                    <img src={v.mainImageUrl} alt={`${v.brandName} ${v.model}`} />
                  ) : (
                    <FaCar style={{ fontSize: 44, color: '#94a3b8' }} />
                  )}
                </div>

                {/* Contenido info */}
                <div className="favorito-card-contenido">
                  <div>
                    <div className="favorito-card-top-header">
                      <div>
                        <span className="favorito-badge-categoria">{v.categoryName}</span>
                        <h3 className="favorito-card-titulo">{v.brandName} {v.model}</h3>
                      </div>
                      <div className="favorito-card-precio">
                        {formatCurrency(v.dailyRate, moneda)} <span>/{t('vehiculo.perDay', 'día')}</span>
                      </div>
                    </div>

                    <div className="favorito-specs-list">
                      <span className="favorito-spec-item">
                        <FaCog style={{ color: 'var(--brand-text)' }} /> {v.transmissionName}
                      </span>
                      <span className="favorito-spec-item">
                        <FaUsers style={{ color: 'var(--brand-text)' }} /> {v.passengerCapacity} {t('vehiculo.seats', 'Plazas')}
                      </span>
                      <span className="favorito-spec-item">
                        <FaGasPump style={{ color: 'var(--brand-text)' }} /> {v.fuelTypeName}
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
