import { useState, useCallback } from 'react'

/**
 * Custom Hook: useManagementModal (Patrón Custom Hook)
 * Centraliza la gestión de estados y controles de modales para páginas de administración
 * (Detalle, Creación, Edición, Eliminación, Respuesta y Visor Lightbox).
 */
export function useManagementModal() {
  const [modalDetail, setModalDetail] = useState(null)
  const [modalCreate, setModalCreate] = useState(false)
  const [modalEdit, setModalEdit] = useState(null)
  const [modalDelete, setModalDelete] = useState(null)
  const [modalReply, setModalReply] = useState(null)
  const [zoomMedia, setZoomMedia] = useState(null)
  const [notice, setNotice] = useState('')
  const [errorModal, setErrorModal] = useState('')

  const openDetail = useCallback((item) => setModalDetail(item), [])
  const closeDetail = useCallback(() => setModalDetail(null), [])

  const openCreate = useCallback(() => setModalCreate(true), [])
  const closeCreate = useCallback(() => setModalCreate(false), [])

  const openEdit = useCallback((item) => setModalEdit(item), [])
  const closeEdit = useCallback(() => setModalEdit(null), [])

  const openDelete = useCallback((item) => setModalDelete(item), [])
  const closeDelete = useCallback(() => setModalDelete(null), [])

  const openReply = useCallback((item) => setModalReply(item), [])
  const closeReply = useCallback(() => setModalReply(null), [])

  const openZoom = useCallback((mediaObj) => setZoomMedia(mediaObj), [])
  const closeZoom = useCallback(() => setZoomMedia(null), [])

  const closeAll = useCallback(() => {
    setModalDetail(null)
    setModalCreate(false)
    setModalEdit(null)
    setModalDelete(null)
    setModalReply(null)
    setZoomMedia(null)
    setErrorModal('')
  }, [])

  return {
    modalDetail,
    setModalDetail,
    openDetail,
    closeDetail,

    modalCreate,
    setModalCreate,
    openCreate,
    closeCreate,

    modalEdit,
    setModalEdit,
    openEdit,
    closeEdit,

    modalDelete,
    setModalDelete,
    openDelete,
    closeDelete,

    modalReply,
    setModalReply,
    openReply,
    closeReply,

    zoomMedia,
    setZoomMedia,
    openZoom,
    closeZoom,

    notice,
    setNotice,
    errorModal,
    setErrorModal,

    closeAll,
  }
}
