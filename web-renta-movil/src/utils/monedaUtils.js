const TASA_USD = 4000;

export const formatCurrency = (amount, moneda) => {
  const value = Number(amount) || 0;
  if (moneda === 'USD') {
    return `USD ${(value / TASA_USD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${value.toLocaleString('es-CO')}`;
};
