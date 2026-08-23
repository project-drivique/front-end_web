import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaArrowLeft, FaBuilding, FaCity, FaEdit, FaFileExcel, FaFilePdf, FaPlus, FaPrint, FaSearch, FaTrash } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { cityManagementService } from '../../../services/cityManagementService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'

const EMPTY_FORM = { nombre: '', departamento: '', tieneAeropuerto: false, tieneTerminal: false }

export default function CityManagementPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const [cities, setCities] = useState(() => cityManagementService.list())
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const departments = useMemo(() => [...new Set(cities.map((city) => city.departamento))].sort((a, b) => a.localeCompare(b)), [cities])
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    return cities.filter((city) => (department === 'all' || city.departamento === department)
      && (!term || `${city.nombre} ${city.departamento}`.toLocaleLowerCase().includes(term)))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [cities, department, search])

  const rows = filtered.map((city) => [city.nombre, city.departamento, cityManagementService.branchCount(city), city.tieneAeropuerto ? t('common.yes') : t('common.no'), city.tieneTerminal ? t('common.yes') : t('common.no')])
  const headers = [t('admin.cities.fields.name'), t('admin.cities.fields.department'), t('admin.cities.fields.branches'), t('admin.cities.fields.airport'), t('admin.cities.fields.terminal')]
  const exportData = { title: t('admin.cities.exportTitle'), headers, rows, filename: 'ciudades-drivique' }

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal({ type: 'form' }) }
  const openEdit = (city) => { setForm({ nombre: city.nombre, departamento: city.departamento, tieneAeropuerto: city.tieneAeropuerto, tieneTerminal: city.tieneTerminal }); setError(''); setModal({ type: 'form', city }) }
  const closeModal = () => { setModal(null); setError('') }

  const save = (event) => {
    event.preventDefault()
    try {
      if (modal.city) cityManagementService.update(modal.city.id, form, user)
      else cityManagementService.create(form, user)
      setCities(cityManagementService.list())
      setNotice(t(modal.city ? 'admin.cities.messages.updated' : 'admin.cities.messages.created'))
      closeModal()
    } catch (caught) {
      setError(t(`admin.cities.errors.${caught.message}`))
    }
  }

  const remove = () => {
    try {
      cityManagementService.remove(modal.city.id, user)
      setCities(cityManagementService.list())
      setNotice(t('admin.cities.messages.deleted'))
      closeModal()
    } catch (caught) {
      setModal(null)
      setNotice(t(`admin.cities.errors.${caught.message}`, { count: caught.branchCount }))
    }
  }

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar />
      <main className="management-main" style={{ padding: '24px 32px' }}>
        <div className="cities-container" style={{ maxWidth: '100%' }}>
        <header className="cities-topbar">
          <div><p className="cities-eyebrow">{t('admin.management')}</p><h1>{t('admin.cities.title')}</h1><p className="cities-subtitle">{t('admin.cities.subtitle')}</p></div>
          <div className="cities-topbar__actions"><MenuConfiguracion /><button className="cities-primary" type="button" onClick={openCreate}><FaPlus /> {t('admin.cities.create')}</button></div>
        </header>

        {notice && <div className="cities-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label={t('common.close')}>×</button></div>}

        <section className="cities-card">
          <div className="cities-toolbar">
            <label className="cities-search"><FaSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('admin.cities.search')} /></label>
            <select value={department} onChange={(event) => setDepartment(event.target.value)} aria-label={t('admin.cities.filterDepartment')}><option value="all">{t('admin.cities.allDepartments')}</option>{departments.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <div className="cities-export" aria-label={t('admin.cities.export')}>
              <button type="button" onClick={() => exportExcel(exportData)}><FaFileExcel /> Excel</button>
              <button type="button" onClick={() => exportPdf(exportData)}><FaFilePdf /> PDF</button>
              <button type="button" onClick={() => printTable(exportData)}><FaPrint /> {t('admin.cities.print')}</button>
            </div>
          </div>

          <div className="cities-summary"><strong>{filtered.length}</strong> {t('admin.cities.results', { count: filtered.length })}</div>
          {filtered.length === 0 ? <div className="cities-empty"><FaCity /><h2>{t('admin.cities.emptyTitle')}</h2><p>{t('admin.cities.emptyText')}</p></div> : <div className="cities-table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}<th>{t('admin.cities.fields.actions')}</th></tr></thead><tbody>{filtered.map((city) => {
            const count = cityManagementService.branchCount(city)
            return <tr key={city.id}><td><div className="cities-name"><span><FaCity /></span><div><strong>{city.nombre}</strong><small>ID: {city.id}</small></div></div></td><td>{city.departamento}</td><td><span className={`cities-branches ${count ? 'has-branches' : ''}`}><FaBuilding /> {count}</span></td><td><span className={`cities-status ${city.tieneAeropuerto ? 'is-yes' : ''}`}>{city.tieneAeropuerto ? t('common.yes') : t('common.no')}</span></td><td><span className={`cities-status ${city.tieneTerminal ? 'is-yes' : ''}`}>{city.tieneTerminal ? t('common.yes') : t('common.no')}</span></td><td><div className="cities-row-actions"><button type="button" onClick={() => openEdit(city)} aria-label={`${t('common.edit')} ${city.nombre}`}><FaEdit /></button><button className="is-danger" type="button" onClick={() => setModal({ type: 'delete', city })} aria-label={`${t('common.delete')} ${city.nombre}`}><FaTrash /></button></div></td></tr>
          })}</tbody></table></div>}
        </section>
      </div>

      {modal && <div className="cities-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}><section className="cities-modal" role="dialog" aria-modal="true" aria-labelledby="cities-modal-title">
        {modal.type === 'form' ? <><div className="cities-modal__head"><div><p className="cities-eyebrow">{t('admin.cities.formLabel')}</p><h2 id="cities-modal-title">{t(modal.city ? 'admin.cities.editTitle' : 'admin.cities.createTitle')}</h2></div><button type="button" onClick={closeModal} aria-label={t('common.close')}>×</button></div><form onSubmit={save}><label>{t('admin.cities.fields.name')}<input autoFocus value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} /></label><label>{t('admin.cities.fields.department')}<input value={form.departamento} onChange={(event) => setForm({ ...form, departamento: event.target.value })} /></label><div className="cities-checks"><label><input type="checkbox" checked={form.tieneAeropuerto} onChange={(event) => setForm({ ...form, tieneAeropuerto: event.target.checked })} /> {t('admin.cities.hasAirport')}</label><label><input type="checkbox" checked={form.tieneTerminal} onChange={(event) => setForm({ ...form, tieneTerminal: event.target.checked })} /> {t('admin.cities.hasTerminal')}</label></div>{error && <p className="cities-error">{error}</p>}<div className="cities-modal__actions"><button type="button" onClick={closeModal}>{t('common.cancel')}</button><button className="cities-primary" type="submit">{t('common.save')}</button></div></form></> : <><div className="cities-delete-icon"><FaTrash /></div><h2 id="cities-modal-title">{t('admin.cities.deleteTitle')}</h2><p>{t('admin.cities.deleteText', { city: modal.city.nombre })}</p><div className="cities-modal__actions"><button type="button" onClick={closeModal}>{t('common.cancel')}</button><button className="cities-danger" type="button" onClick={remove}>{t('common.delete')}</button></div></>}
      </section></div>}
    </main>
    </div>
  )
}
