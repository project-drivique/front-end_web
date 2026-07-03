import { useContext } from 'react';
import { useLanding } from '../modules/landing/LandingContext';
import traduccionesExtras from './traduccionesExtras';

export function useI18n() {
  const { idioma } = useLanding();
  
  const t = (key) => {
    if (!key) return '';
    const keys = key.split('.');
    let result = traduccionesExtras[idioma];
    
    // Fallback to es if translation is missing in chosen lang
    if (!result) result = traduccionesExtras['es'];
    
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        // Fallback translation
        let fallback = traduccionesExtras['es'];
        for (const fk of keys) {
            if (fallback) fallback = fallback[fk];
        }
        return fallback !== undefined ? fallback : key;
      }
    }
    return result;
  };

  return { t, idioma };
}
