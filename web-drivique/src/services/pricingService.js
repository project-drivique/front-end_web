import { api } from './httpClient'

/**
 * Servicio de Cotización, Precios, Promociones y Tasas de Cambio para HU-INT-09.
 */

export async function cotizarPrecio({
  vehicleId,
  pickupDate,
  returnDate,
  insuranceId,
  mileagePlanId,
  additionalServiceIds = [],
  couponCode = null,
}) {
  const payload = {
    vehicleId,
    pickupDate,
    returnDate,
    insuranceId,
    mileagePlanId,
    additionalServiceIds: additionalServiceIds.filter(Boolean),
    couponCode: couponCode?.trim() || null,
  }

  const { data } = await api.post('/pricing/quote', payload)
  return data
}

export async function getServiciosAdicionales() {
  const { data } = await api.get('/additional-services')
  return Array.isArray(data) ? data : []
}

export async function getCoberturasSeguro() {
  const { data } = await api.get('/insurance-coverages')
  return Array.isArray(data) ? data : []
}

export async function getPlanesKilometraje() {
  const { data } = await api.get('/mileage-plans')
  return Array.isArray(data) ? data : []
}

export async function validarPromocion({
  code,
  vehicleId,
  categoryId,
  pickupDate,
  returnDate,
}) {
  const payload = {
    code: code?.trim(),
    vehicleId,
    categoryId,
    pickupDate,
    returnDate,
  }
  const { data } = await api.post('/promotions/validate', payload)
  return data
}

export async function getPromocionesDestacadas() {
  const { data } = await api.get('/promotions/featured')
  return Array.isArray(data) ? data : []
}

export async function getMonedas() {
  const { data } = await api.get('/currencies')
  return Array.isArray(data) ? data : []
}

export async function getTasasCambio() {
  const { data } = await api.get('/exchange-rates/latest')
  return Array.isArray(data) ? data : []
}

export default {
  cotizarPrecio,
  getServiciosAdicionales,
  getCoberturasSeguro,
  getPlanesKilometraje,
  validarPromocion,
  getPromocionesDestacadas,
  getMonedas,
  getTasasCambio,
}
