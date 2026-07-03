import api from './api'
// Importa la instancia de la API configurada previamente.
// Normalmente esta instancia ya tiene baseURL, headers
// e interceptores para enviar el token automáticamente.

export const contratoService = {
  // Objeto que agrupa funciones relacionadas con contratos.

  misContratos: async () => {
    // Método asíncrono para obtener los contratos del usuario autenticado.

    const { data } = await api.get('/contratos/mis-contratos')
    // Hace una petición GET al endpoint /contratos/mis-contratos.
    // La respuesta de Axios normalmente trae muchas propiedades:
    // status, headers, config, data, etc.
    // Aquí extraemos solo la propiedad data.

    return data
    // Devuelve únicamente la información útil de la respuesta,
    // para que el componente que lo use reciba directamente los contratos.
  },
}