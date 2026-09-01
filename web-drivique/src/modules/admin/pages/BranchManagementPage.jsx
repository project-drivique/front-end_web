import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaBuilding, FaCar, FaEdit, FaFileExcel, FaFilePdf, FaMoneyBillWave, FaPlus, FaPrint, FaSearch, FaTrash } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { branchManagementService } from '../../../services/branchManagementService'
import { cityManagementService } from '../../../services/cityManagementService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './BranchManagementPage.css'

const EMPTY = { nombre: '', ciudad: '', direccion: '', encargadoId: '', autorizadoPagoEfectivo: false }

export default function BranchManagementPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const [branches, setBranches] = useState(() => branchManagementService.list())
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [cashFilter, setCashFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const cities = cityManagementService.list().sort((a, b) => a.nombre.localeCompare(b.nombre))
  const managers = branchManagementService.managers()

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    return branches.filter((branch) => (cityFilter === 'all' || branch.ciudad === cityFilter)
      && (cashFilter === 'all' || String(branch.autorizadoPagoEfectivo) === cashFilter)
      && (!term || `${branch.nombre} ${branch.ciudad} ${branch.direccion} ${branchManagementService.managerName(branch)}`.toLocaleLowerCase().includes(term)))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [branches, cashFilter, cityFilter, search])

  const headers = [t('admin.branchesManagement.fields.name'), t('admin.branchesManagement.fields.city'), t('admin.branchesManagement.fields.address'), t('admin.branchesManagement.fields.manager'), t('admin.branchesManagement.fields.cash'), t('admin.branchesManagement.fields.vehicles'), t('admin.branchesManagement.fields.reservations')]
  const rows = filtered.map((branch) => { const linked = branchManagementService.associations(branch); return [branch.nombre, branch.ciudad, branch.direccion, branchManagementService.managerName(branch), branch.autorizadoPagoEfectivo ? t('common.yes') : t('common.no'), linked.vehicles, linked.reservations] })
  const exportData = { title: t('admin.branchesManagement.exportTitle'), headers, rows, filename: 'sucursales-drivique' }
  const close = () => { setModal(null); setError('') }
  const openCreate = () => { setForm({ ...EMPTY, ciudad: cities[0]?.nombre || '', encargadoId: managers[0]?.correo || '' }); setError(''); setModal({ type: 'form' }) }
  const openEdit = (branch) => { setForm({ nombre: branch.nombre, ciudad: branch.ciudad, direccion: branch.direccion, encargadoId: branch.encargadoId, autorizadoPagoEfectivo: branch.autorizadoPagoEfectivo }); setError(''); setModal({ type: 'form', branch }) }
  const save = (event) => { event.preventDefault(); try { if (modal.branch) branchManagementService.update(modal.branch.id, form, user); else branchManagementService.create(form, user); setBranches(branchManagementService.list()); setNotice(t(modal.branch ? 'admin.branchesManagement.messages.updated' : 'admin.branchesManagement.messages.created')); close() } catch (caught) { setError(t(`admin.branchesManagement.errors.${caught.message}`)) } }
  const remove = () => { try { branchManagementService.remove(modal.branch.id, user); setBranches(branchManagementService.list()); setNotice(t('admin.branchesManagement.messages.deleted')); close() } catch (caught) { setModal(null); setNotice(t(`admin.branchesManagement.errors.${caught.message}`, { vehicles: caught.linked?.vehicles || 0, reservations: caught.linked?.reservations || 0 })) } }

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar />
      <main className="management-main" style={{ padding: '24px 32px' }}>
        <div className="cities-container" style={{ maxWidth: '100%' }}>
    <header className="cities-topbar"><div><p className="cities-eyebrow">{t('admin.management')}</p><h1>{t('admin.branchesManagement.title')}</h1><p className="cities-subtitle">{t('admin.branchesManagement.subtitle')}</p></div><div className="cities-topbar__actions"><MenuConfiguracion /><button className="cities-primary" type="button" onClick={openCreate}><FaPlus /> {t('admin.branchesManagement.create')}</button></div></header>
    {notice && <div className="cities-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label={t('common.close')}>×</button></div>}
    <section className="cities-card"><div className="branches-toolbar"><label className="cities-search"><FaSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('admin.branchesManagement.search')} /></label><select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}><option value="all">{t('admin.branchesManagement.allCities')}</option>{cities.map((city) => <option key={city.id} value={city.nombre}>{city.nombre}</option>)}</select><select value={cashFilter} onChange={(event) => setCashFilter(event.target.value)}><option value="all">{t('admin.branchesManagement.allCashStates')}</option><option value="true">{t('admin.branchesManagement.authorized')}</option><option value="false">{t('admin.branchesManagement.notAuthorized')}</option></select><div className="cities-export"><button type="button" onClick={() => exportExcel(exportData)}><FaFileExcel /> Excel</button><button type="button" onClick={() => exportPdf(exportData)}><FaFilePdf /> PDF</button><button type="button" onClick={() => printTable(exportData)}><FaPrint /> {t('admin.cities.print')}</button></div></div>
      <div className="cities-summary"><strong>{filtered.length}</strong> {t('admin.branchesManagement.results')}</div>{filtered.length === 0 ? <div className="cities-empty"><FaBuilding /><h2>{t('admin.branchesManagement.emptyTitle')}</h2><p>{t('admin.branchesManagement.emptyText')}</p></div> : <div className="cities-table-wrap"><table className="branches-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}<th>{t('admin.cities.fields.actions')}</th></tr></thead><tbody>{filtered.map((branch) => { const linked = branchManagementService.associations(branch); return <tr key={branch.id}><td><div className="cities-name"><span><FaBuilding /></span><div><strong>{branch.nombre}</strong><small>ID: {branch.id}</small></div></div></td><td>{branch.ciudad}</td><td>{branch.direccion}</td><td>{branchManagementService.managerName(branch) || '—'}</td><td><span className={`branches-cash ${branch.autorizadoPagoEfectivo ? 'is-authorized' : ''}`}><FaMoneyBillWave /> {branch.autorizadoPagoEfectivo ? t('admin.branchesManagement.authorized') : t('admin.branchesManagement.notAuthorized')}</span></td><td><span className="branches-linked"><FaCar /> {linked.vehicles}</span></td><td>{linked.reservations}</td><td><div className="cities-row-actions"><button type="button" onClick={() => openEdit(branch)} aria-label={t('common.edit')}><FaEdit /></button><button className="is-danger" type="button" onClick={() => setModal({ type: 'delete', branch })} aria-label={t('common.delete')}><FaTrash /></button></div></td></tr> })}</tbody></table></div>}
    </section></div>
    {modal && <div className="cities-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && close()}><section className="cities-modal branches-modal" role="dialog" aria-modal="true" aria-labelledby="branch-modal-title">{modal.type === 'form' ? <><div className="cities-modal__head"><div><p className="cities-eyebrow">{t('admin.branchesManagement.formLabel')}</p><h2 id="branch-modal-title">{t(modal.branch ? 'admin.branchesManagement.editTitle' : 'admin.branchesManagement.createTitle')}</h2></div><button type="button" onClick={close}>×</button></div><form onSubmit={save}><label>{t('admin.branchesManagement.fields.name')}<input autoFocus value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} /></label><div className="branches-form-grid"><label>{t('admin.branchesManagement.fields.city')}<select value={form.ciudad} onChange={(event) => setForm({ ...form, ciudad: event.target.value })}>{cities.map((city) => <option key={city.id}>{city.nombre}</option>)}</select></label><label>{t('admin.branchesManagement.fields.manager')}<select value={form.encargadoId} onChange={(event) => setForm({ ...form, encargadoId: event.target.value })}>{managers.map((manager) => <option key={manager.correo} value={manager.correo}>{`${manager.nombre || ''} ${manager.apellido || ''}`.trim() || manager.correo}</option>)}</select></label></div><label>{t('admin.branchesManagement.fields.address')}<input value={form.direccion} onChange={(event) => setForm({ ...form, direccion: event.target.value })} /></label><label className="branches-cash-check"><input type="checkbox" checked={form.autorizadoPagoEfectivo} onChange={(event) => setForm({ ...form, autorizadoPagoEfectivo: event.target.checked })} /><span><strong>{t('admin.branchesManagement.cashLabel')}</strong><small>{t('admin.branchesManagement.cashHint')}</small></span></label>{managers.length === 0 && <p className="cities-error">{t('admin.branchesManagement.errors.noManagers')}</p>}{error && <p className="cities-error">{error}</p>}<div className="cities-modal__actions"><button type="button" onClick={close}>{t('common.cancel')}</button><button className="cities-primary" type="submit" disabled={!managers.length}>{t('common.save')}</button></div></form></> : <><div className="cities-delete-icon"><FaTrash /></div><h2 id="branch-modal-title">{t('admin.branchesManagement.deleteTitle')}</h2><p>{t('admin.branchesManagement.deleteText', { branch: modal.branch.nombre })}</p><div className="cities-modal__actions"><button type="button" onClick={close}>{t('common.cancel')}</button><button className="cities-danger" type="button" onClick={remove}>{t('common.delete')}</button></div></>}</section></div>}
      </main>
    </div>
  )
}

