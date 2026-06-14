import api from './api'

export const contratoService = {
  misContratos: async () => {
    const { data } = await api.get('/contratos/mis-contratos')
    return data
  },
}