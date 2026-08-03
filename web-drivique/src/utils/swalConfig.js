import Swal from 'sweetalert2'

const defaultOptions = {
  customClass: {
    popup: 'swal2-project-popup',
    title: 'swal2-project-title',
    htmlContainer: 'swal2-project-text',
    confirmButton: 'swal2-project-confirm',
    cancelButton: 'swal2-project-cancel',
  },
  background: '#f8fafc',
  color: '#0f172a',
  iconColor: '#1e3a8a',
  confirmButtonColor: '#1e3a8a',
  cancelButtonColor: '#64748b',
  buttonsStyling: false,
}

export const showAlert = ({ customClass = {}, ...options }) => {
  return Swal.fire({
    ...defaultOptions,
    ...options,
    customClass: {
      ...defaultOptions.customClass,
      ...customClass,
    },
  })
}
