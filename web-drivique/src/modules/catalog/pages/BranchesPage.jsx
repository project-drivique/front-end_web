import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanding } from '../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'
import { useCatalogo } from '../hooks/useCatalog'
import VehicleGrid from '../components/VehicleGrid'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import CatalogPagination from '../components/CatalogPagination'
import {
  FaMapMarkerAlt,
  FaClock,
  FaCar,
  FaCheckCircle,
  FaArrowLeft
} from 'react-icons/fa'

const coloresTema = (esModoOscuro) => ({
  pageBg: esModoOscuro ? '#020617' : '#f8fafc',
  panelBg: esModoOscuro ? '#111827' : '#ffffff',
  panelBorder: esModoOscuro ? '#1e293b' : '#e2e8f0',
  panelBorderStrong: esModoOscuro ? '#334155' : '#cbd5e1',
  panelShadow: esModoOscuro ? '0 20px 60px rgba(0,0,0,0.45)' : '0 20px 60px rgba(15,23,42,0.06)',
  textPrimary: esModoOscuro ? '#f8fafc' : '#0f172a',
  textSecondary: esModoOscuro ? '#94a3b8' : '#64748b',
  accentText: esModoOscuro ? '#93c5fd' : '#1e3a8a',
  accentBgSoft: esModoOscuro ? 'rgba(37,99,235,0.18)' : '#eff6ff',
  itemBg: esModoOscuro ? '#1e293b' : '#f8fafc',
  cardBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  cardBorderHover: esModoOscuro ? '#60a5fa' : '#1e3a8a',
  subCardBg: esModoOscuro ? '#0f172a' : '#f8fafc',
  paginationDisabledBg: esModoOscuro ? '#1e293b' : '#f1f5f9',
  paginationDisabledText: esModoOscuro ? '#475569' : '#94a3b8',
  paginationIdleBg: esModoOscuro ? '#1e293b' : '#ffffff',
  paginationIdleText: esModoOscuro ? '#cbd5e1' : '#475569',
})

function BrandLogo({ marca }) {
  if (marca === 'Alamo') {
    return (
      <div style={{ background: '#00205b', border: '3px solid #ffcc00', borderRadius: 8, padding: '4px 16px', display: 'inline-flex', alignItems: 'center' }}>
        <span style={{ color: '#ffcc00', fontWeight: 900, fontSize: 20, fontStyle: 'italic', fontFamily: 'sans-serif' }}>Alamo</span>
      </div>
    )
  }
  if (marca === 'TuRoll') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#eab308', fontWeight: 900, fontSize: 24, letterSpacing: '-0.03em', fontFamily: 'sans-serif' }}>TU</span>
        <span style={{ color: '#64748b', fontWeight: 800, fontSize: 24, fontStyle: 'italic', fontFamily: 'sans-serif' }}>Roll</span>
      </div>
    )
  }
  if (marca === 'Enterprise') {
    return (
      <div style={{ background: '#006633', borderRadius: 6, padding: '4px 16px', display: 'inline-flex', alignItems: 'center' }}>
        <span style={{ color: '#ffffff', fontWeight: 900, fontSize: 18, fontStyle: 'italic', letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>enterprise</span>
      </div>
    )
  }
  if (marca === 'Localiza') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 14, height: 14, borderLeft: '4px solid #eab308', borderBottom: '4px solid #16a34a', transform: 'rotate(-45deg)' }} />
        <span style={{ color: '#15803d', fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>Localiza</span>
      </div>
    )
  }
  if (marca === 'Hertz') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        <span style={{ color: '#0f172a', fontWeight: 900, fontSize: 26, fontStyle: 'italic', fontFamily: 'sans-serif', letterSpacing: '-0.03em' }}>Hertz</span>
      </div>
    )
  }
  if (marca === 'Budget') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '14px solid #f97316' }} />
        <span style={{ color: '#1e3a8a', fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>Budget</span>
      </div>
    )
  }
  return <span style={{ fontWeight: 800, fontSize: 18 }}>{marca}</span>
}

const SUCURSALES_GRID = [
  {
    id: 'alamo-bogota',
    alias: 'Alamo Bogotá - Aeropuerto',
    nombre: 'Alamo Bogotá - Aeropuerto',
    marca: 'Alamo',
    tag: 'Aeropuerto',
    direccion: 'Aeropuerto Internacional El Dorado, Terminal 1, Piso 1, Bogotá',
    horario: 'Lun-Dom 24 Horas',
    flota: 'Toyota Corolla, etc.',
    precioCOP: 108280,
    porQue: 'Servicio 24/7 directo en la terminal de llegadas internacionales.',
    porQueKey: '247',
    nombreKeys: {
      es: 'Alamo Bogotá - Aeropuerto',
      en: 'Alamo Bogotá - Airport',
      fr: 'Alamo Bogotá - Aéroport',
      pt: 'Alamo Bogotá - Aeroporto'
    },
    direccionKeys: {
      es: 'Aeropuerto Internacional El Dorado, Terminal 1, Piso 1, Bogotá',
      en: 'El Dorado International Airport, Terminal 1, Floor 1, Bogotá',
      fr: 'Aéroport International El Dorado, Terminal 1, Étage 1, Bogotá',
      pt: 'Aeroporto Internacional El Dorado, Terminal 1, 1º Andar, Bogotá'
    },
    flotaKeys: {
      es: 'Toyota Corolla, entre otros',
      en: 'Toyota Corolla, and more',
      fr: 'Toyota Corolla, entre autres',
      pt: 'Toyota Corolla, entre outros'
    }
  },
  {
    id: 'alamo-medellin',
    alias: 'Alamo Medellín Poblado',
    nombre: 'Alamo Medellín Poblado',
    marca: 'Alamo',
    tag: 'Poblado',
    direccion: 'Calle 10 # 43C-28, El Poblado, Medellín',
    horario: 'Lun-Sáb 7:00 - 22:00',
    flota: 'Mazda CX-5, etc.',
    precioCOP: 184680,
    porQue: 'Excelente ubicación estratégica en la zona hotelera de El Poblado.',
    porQueKey: 'poblado',
    nombreKeys: {
      es: 'Alamo Medellín - Poblado',
      en: 'Alamo Medellín - Poblado Area',
      fr: 'Alamo Medellín - Quartier Poblado',
      pt: 'Alamo Medellín - Bairro Poblado'
    },
    direccionKeys: {
      es: 'Calle 10 # 43C-28, El Poblado, Medellín',
      en: '10th Street # 43C-28, El Poblado, Medellín',
      fr: 'Rue 10 # 43C-28, El Poblado, Medellín',
      pt: 'Rua 10 # 43C-28, El Poblado, Medellín'
    },
    flotaKeys: {
      es: 'Mazda CX-5, entre otros',
      en: 'Mazda CX-5, and more',
      fr: 'Mazda CX-5, entre autres',
      pt: 'Mazda CX-5, entre outros'
    }
  },
  {
    id: 'national-barranquilla',
    alias: 'National Downtown Barranquilla',
    nombre: 'National Downtown Barranquilla',
    marca: 'TuRoll',
    tag: 'Centro',
    direccion: 'Carrera 53 # 74-86, Barrio Prado, Barranquilla',
    horario: 'Lun-Vie 8:00 - 18:00',
    flota: 'Chevrolet Spark, etc.',
    precioCOP: 76440,
    porQue: 'La opción ideal para desplazamientos ejecutivos en el sector financiero.',
    porQueKey: 'executive',
    nombreKeys: {
      es: 'National Barranquilla - Centro',
      en: 'National Barranquilla - Downtown',
      fr: 'National Barranquilla - Centre-ville',
      pt: 'National Barranquilla - Centro'
    },
    direccionKeys: {
      es: 'Carrera 53 # 74-86, Barrio Prado, Barranquilla',
      en: 'Carrera 53 # 74-86, Prado Neighborhood, Barranquilla',
      fr: 'Carrera 53 # 74-86, Quartier Prado, Barranquilla',
      pt: 'Carrera 53 # 74-86, Bairro Prado, Barranquilla'
    },
    flotaKeys: {
      es: 'Chevrolet Spark, entre otros',
      en: 'Chevrolet Spark, and more',
      fr: 'Chevrolet Spark, entre autres',
      pt: 'Chevrolet Spark, entre outros'
    }
  },
  {
    id: 'alamo-cartagena',
    alias: 'Alamo Cartagena - Aeropuerto',
    nombre: 'Alamo Cartagena - Aeropuerto',
    marca: 'Alamo',
    tag: 'Aeropuerto',
    direccion: 'Aeropuerto Internacional Rafael Núñez, Local 01-08, Cartagena',
    horario: 'Lun-Dom 7:00 - 22:00',
    flota: 'Ford Mustang GT, etc.',
    precioCOP: 280240,
    porQue: 'Entrega ágil a la salida del aeropuerto con flota convertible disponible.',
    porQueKey: 'convertible',
    nombreKeys: {
      es: 'Alamo Cartagena - Aeropuerto',
      en: 'Alamo Cartagena - Airport',
      fr: 'Alamo Cartagena - Aéroport',
      pt: 'Alamo Cartagena - Aeroporto'
    },
    direccionKeys: {
      es: 'Aeropuerto Internacional Rafael Núñez, Local 01-08, Cartagena',
      en: 'Rafael Núñez International Airport, Gate 01-08, Cartagena',
      fr: 'Aéroport International Rafael Núñez, Local 01-08, Cartagena',
      pt: 'Aeroporto Internacional Rafael Núñez, Loja 01-08, Cartagena'
    },
    flotaKeys: {
      es: 'Ford Mustang GT, entre otros',
      en: 'Ford Mustang GT, and more',
      fr: 'Ford Mustang GT, entre autres',
      pt: 'Ford Mustang GT, entre outros'
    }
  },
  {
    id: 'enterprise-bogota',
    alias: 'Enterprise Bogotá - El Dorado',
    nombre: 'Enterprise Bogotá - El Dorado',
    marca: 'Enterprise',
    tag: 'Aeropuerto',
    direccion: 'Aeropuerto Internacional El Dorado, Terminal 1, Piso 1, Bogotá',
    horario: 'Lun-Dom 24 Horas',
    flota: 'Chevrolet Onix, etc.',
    precioCOP: 103600,
    porQue: 'Servicio prémium con opción de conductor adicional sin recargo.',
    porQueKey: 'premium',
    nombreKeys: {
      es: 'Enterprise Bogotá - El Dorado',
      en: 'Enterprise Bogotá - El Dorado Airport',
      fr: 'Enterprise Bogotá - Aéroport El Dorado',
      pt: 'Enterprise Bogotá - Aeroporto El Dorado'
    },
    direccionKeys: {
      es: 'Aeropuerto Internacional El Dorado, Terminal 1, Piso 1, Bogotá',
      en: 'El Dorado International Airport, Terminal 1, Floor 1, Bogotá',
      fr: 'Aéroport International El Dorado, Terminal 1, Étage 1, Bogotá',
      pt: 'Aeroporto Internacional El Dorado, Terminal 1, 1º Andar, Bogotá'
    },
    flotaKeys: {
      es: 'Chevrolet Onix, entre otros',
      en: 'Chevrolet Onix, and more',
      fr: 'Chevrolet Onix, entre autres',
      pt: 'Chevrolet Onix, entre outros'
    }
  },
  {
    id: 'localiza-medellin',
    alias: 'Localiza Medellín - Poblado',
    nombre: 'Localiza Medellín - Poblado',
    marca: 'Localiza',
    tag: 'Poblado',
    direccion: 'Calle 10 # 43C-28, El Poblado, Medellín',
    horario: 'Lun-Sáb 7:00 - 22:00',
    flota: 'Nissan Kicks, etc.',
    precioCOP: 178000,
    porQue: 'Variedad de SUVs y sedanes modernos con condiciones flexibles.',
    porQueKey: 'flexible',
    nombreKeys: {
      es: 'Localiza Medellín - Poblado',
      en: 'Localiza Medellín - Poblado Area',
      fr: 'Localiza Medellín - Quartier Poblado',
      pt: 'Localiza Medellín - Bairro Poblado'
    },
    direccionKeys: {
      es: 'Calle 10 # 43C-28, El Poblado, Medellín',
      en: '10th Street # 43C-28, El Poblado, Medellín',
      fr: 'Rue 10 # 43C-28, El Poblado, Medellín',
      pt: 'Rua 10 # 43C-28, El Poblado, Medellín'
    },
    flotaKeys: {
      es: 'Nissan Kicks, entre otros',
      en: 'Nissan Kicks, and more',
      fr: 'Nissan Kicks, entre autres',
      pt: 'Nissan Kicks, entre outros'
    }
  },
  {
    id: 'hertz-barranquilla',
    alias: 'Hertz Barranquilla - Centro',
    nombre: 'Hertz Barranquilla - Centro',
    marca: 'Hertz',
    tag: 'Centro',
    direccion: 'Carrera 51B # 80-58, Alto Prado, Barranquilla',
    horario: 'Lun-Vie 8:00 - 18:00',
    flota: 'Kia Picanto, etc.',
    precioCOP: 85200,
    porQue: 'Garantía internacional de alquiler y excelente eficiencia de combustible.',
    porQueKey: 'efficiency',
    nombreKeys: {
      es: 'Hertz Barranquilla - Centro',
      en: 'Hertz Barranquilla - Downtown',
      fr: 'Hertz Barranquilla - Centre-ville',
      pt: 'Hertz Barranquilla - Centro'
    },
    direccionKeys: {
      es: 'Carrera 51B # 80-58, Alto Prado, Barranquilla',
      en: 'Carrera 51B # 80-58, Alto Prado, Barranquilla',
      fr: 'Carrera 51B # 80-58, Alto Prado, Barranquilla',
      pt: 'Carrera 51B # 80-58, Alto Prado, Barranquilla'
    },
    flotaKeys: {
      es: 'Kia Picanto, entre otros',
      en: 'Kia Picanto, and more',
      fr: 'Kia Picanto, entre autres',
      pt: 'Kia Picanto, entre outros'
    }
  },
  {
    id: 'budget-cali',
    alias: 'Budget Cali - Aeropuerto',
    nombre: 'Budget Cali - Aeropuerto',
    marca: 'Budget',
    tag: 'Aeropuerto',
    direccion: 'Aeropuerto Internacional Alfonso Bonilla Aragón, Local 12, Cali',
    horario: 'Lun-Dom 7:00 - 22:00',
    flota: 'Renault Duster, etc.',
    precioCOP: 273600,
    porQue: 'Reserva rápida directamente en la terminal aérea del Valle.',
    porQueKey: 'valle',
    nombreKeys: {
      es: 'Budget Cali - Aeropuerto',
      en: 'Budget Cali - Airport',
      fr: 'Budget Cali - Aéroport',
      pt: 'Budget Cali - Aeroporto'
    },
    direccionKeys: {
      es: 'Aeropuerto Internacional Alfonso Bonilla Aragón, Local 12, Cali',
      en: 'Alfonso Bonilla Aragón International Airport, Gate 12, Cali',
      fr: 'Aéroport International Alfonso Bonilla Aragón, Local 12, Cali',
      pt: 'Aeroporto Internacional Alfonso Bonilla Aragón, Loja 12, Cali'
    },
    flotaKeys: {
      es: 'Renault Duster, entre otros',
      en: 'Renault Duster, and more',
      fr: 'Renault Duster, entre autres',
      pt: 'Renault Duster, entre outros'
    }
  },
  {
    id: 'alamo-cali',
    alias: 'Alamo Cali - Aeropuerto',
    nombre: 'Alamo Cali - Aeropuerto',
    marca: 'Alamo',
    tag: 'Aeropuerto',
    direccion: 'Aeropuerto Internacional Alfonso Bonilla Aragón (CLO), Palmira, Valle',
    horario: 'Lun-Dom 6:00 - 23:00',
    flota: 'Toyota Prado, etc.',
    precioCOP: 220000,
    porQue: 'Servicio eficiente y entrega directa en el aeropuerto internacional de Cali.',
    porQueKey: '247',
    nombreKeys: {
      es: 'Alamo Cali - Aeropuerto',
      en: 'Alamo Cali - Airport',
      fr: 'Alamo Cali - Aéroport',
      pt: 'Alamo Cali - Aeroporto'
    },
    direccionKeys: {
      es: 'Aeropuerto Internacional Alfonso Bonilla Aragón (CLO), Palmira, Valle',
      en: 'Alfonso Bonilla Aragón International Airport (CLO), Palmira, Valle',
      fr: 'Aéroport International Alfonso Bonilla Aragón (CLO), Palmira, Valle',
      pt: 'Aeroporto Internacional Alfonso Bonilla Aragón (CLO), Palmira, Valle'
    },
    flotaKeys: {
      es: 'Toyota Prado, entre otros',
      en: 'Toyota Prado, and more',
      fr: 'Toyota Prado, entre autres',
      pt: 'Toyota Prado, entre outros'
    }
  },
  {
    id: 'national-bogota',
    alias: 'National Bogota El Dorado Intl. Airport',
    nombre: 'National Bogotá - Aeropuerto',
    marca: 'TuRoll',
    tag: 'Aeropuerto',
    direccion: 'Aeropuerto Internacional El Dorado (BOG), Puerta 4, Bogotá D.C.',
    horario: 'Lun-Dom 24 Horas',
    flota: 'Hyundai Tucson, etc.',
    precioCOP: 190000,
    porQue: 'Atención personalizada para viajeros corporativos e internacionales.',
    porQueKey: 'executive',
    nombreKeys: {
      es: 'National Bogotá - Aeropuerto',
      en: 'National Bogotá - Airport',
      fr: 'National Bogotá - Aéroport',
      pt: 'National Bogotá - Aeroporto'
    },
    direccionKeys: {
      es: 'Aeropuerto Internacional El Dorado (BOG), Puerta 4, Bogotá D.C.',
      en: 'El Dorado International Airport (BOG), Gate 4, Bogotá D.C.',
      fr: 'Aéroport International El Dorado (BOG), Porte 4, Bogotá D.C.',
      pt: 'Aeroporto Internacional El Dorado (BOG), Portão 4, Bogotá D.C.'
    },
    flotaKeys: {
      es: 'Hyundai Tucson, entre otros',
      en: 'Hyundai Tucson, and more',
      fr: 'Hyundai Tucson, entre autres',
      pt: 'Hyundai Tucson, entre outros'
    }
  },
  {
    id: 'national-rionegro',
    alias: 'National Medellin Rionegro Jose Maria Cordova Intl. Airport',
    nombre: 'National Rionegro - Aeropuerto',
    marca: 'TuRoll',
    tag: 'Aeropuerto',
    direccion: 'Aeropuerto José María Córdova (MDE), Terminal de arriendo, Rionegro',
    horario: 'Lun-Dom 6:00 - 22:00',
    flota: 'Nissan Qashqai, etc.',
    precioCOP: 210000,
    porQue: 'Ubicación directa a la llegada de vuelos nacionales e internacionales.',
    porQueKey: 'poblado',
    nombreKeys: {
      es: 'National Rionegro - Aeropuerto',
      en: 'National Rionegro - Airport',
      fr: 'National Rionegro - Aéroport',
      pt: 'National Rionegro - Aeroporto'
    },
    direccionKeys: {
      es: 'Aeropuerto José María Córdova (MDE), Terminal de arriendo, Rionegro',
      en: 'José María Córdova Airport (MDE), Rental Terminal, Rionegro',
      fr: 'Aéroport José María Córdova (MDE), Terminal de location, Rionegro',
      pt: 'Aeroporto José María Córdova (MDE), Terminal de aluguel, Rionegro'
    },
    flotaKeys: {
      es: 'Nissan Qashqai, entre otros',
      en: 'Nissan Qashqai, and more',
      fr: 'Nissan Qashqai, entre autres',
      pt: 'Nissan Qashqai, entre outros'
    }
  },
  {
    id: 'localiza-cucuta',
    alias: 'Localiza Cúcuta Aeropuerto Camilo Daza',
    nombre: 'Localiza Cúcuta - Aeropuerto',
    marca: 'Localiza',
    tag: 'Aeropuerto',
    direccion: 'Aeropuerto Internacional Camilo Daza (CUC), Cúcuta',
    horario: 'Lun-Dom 8:00 - 20:00',
    flota: 'Nissan Kicks, etc.',
    precioCOP: 165000,
    porQue: 'Facilidad de alquiler y flotilla moderna en la zona fronteriza.',
    porQueKey: 'flexible',
    nombreKeys: {
      es: 'Localiza Cúcuta - Aeropuerto',
      en: 'Localiza Cúcuta - Airport',
      fr: 'Localiza Cúcuta - Aéroport',
      pt: 'Localiza Cúcuta - Aeroporto'
    },
    direccionKeys: {
      es: 'Aeropuerto Internacional Camilo Daza (CUC), Cúcuta',
      en: 'Camilo Daza International Airport (CUC), Cúcuta',
      fr: 'Aéroport International Camilo Daza (CUC), Cúcuta',
      pt: 'Aeroporto Internacional Camilo Daza (CUC), Cúcuta'
    },
    flotaKeys: {
      es: 'Nissan Kicks, entre otros',
      en: 'Nissan Kicks, and more',
      fr: 'Nissan Kicks, entre autres',
      pt: 'Nissan Kicks, entre outros'
    }
  },
  {
    id: 'alamo-bucaramanga',
    alias: 'Alamo Bucaramanga - Aeropuerto',
    nombre: 'Alamo Bucaramanga - Aeropuerto',
    marca: 'Alamo',
    tag: 'Aeropuerto',
    direccion: 'Aeropuerto Internacional Palonegro (BGA), Lebrija, Santander',
    horario: 'Lun-Dom 8:00 - 21:00',
    flota: 'Kia Sportage, etc.',
    precioCOP: 175000,
    porQue: 'La mejor opción para ejecutivos y turismo en Santander.',
    porQueKey: 'executive',
    nombreKeys: {
      es: 'Alamo Bucaramanga - Aeropuerto',
      en: 'Alamo Bucaramanga - Airport',
      fr: 'Alamo Bucaramanga - Aéroport',
      pt: 'Alamo Bucaramanga - Aeroporto'
    },
    direccionKeys: {
      es: 'Aeropuerto Internacional Palonegro (BGA), Lebrija, Santander',
      en: 'Palonegro International Airport (BGA), Lebrija, Santander',
      fr: 'Aéroport International Palonegro (BGA), Lebrija, Santander',
      pt: 'Aeroporto Internacional Palonegro (BGA), Lebrija, Santander'
    },
    flotaKeys: {
      es: 'Kia Sportage, entre otros',
      en: 'Kia Sportage, and more',
      fr: 'Kia Sportage, entre autres',
      pt: 'Kia Sportage, entre outros'
    }
  },
  {
    id: 'alamo-pereira',
    alias: 'Alamo Pereira - Aeropuerto',
    nombre: 'Alamo Pereira - Aeropuerto',
    marca: 'Alamo',
    tag: 'Aeropuerto',
    direccion: 'Aeropuerto Internacional Matecaña (PEI), Pereira',
    horario: 'Lun-Dom 7:00 - 22:00',
    flota: 'Kia Cerato, etc.',
    precioCOP: 155000,
    porQue: 'Ubicación clave en el Eje Cafetero para explorar la región.',
    porQueKey: 'convertible',
    nombreKeys: {
      es: 'Alamo Pereira - Aeropuerto',
      en: 'Alamo Pereira - Airport',
      fr: 'Alamo Pereira - Aéroport',
      pt: 'Alamo Pereira - Aeroporto'
    },
    direccionKeys: {
      es: 'Aeropuerto Internacional Matecaña (PEI), Pereira',
      en: 'Matecaña International Airport (PEI), Pereira',
      fr: 'Aéroport International Matecaña (PEI), Pereira',
      pt: 'Aeroporto Internacional Matecaña (PEI), Pereira'
    },
    flotaKeys: {
      es: 'Kia Cerato, entre otros',
      en: 'Kia Cerato, and more',
      fr: 'Kia Cerato, entre autres',
      pt: 'Kia Cerato, entre outros'
    }
  },
  {
    id: 'hertz-bucaramanga',
    alias: 'Hertz Bucaramanga - Centro',
    nombre: 'Hertz Bucaramanga - Centro',
    marca: 'Hertz',
    tag: 'Centro',
    direccion: 'Carrera 27 # 36-14, Barrio Cañaveral, Bucaramanga',
    horario: 'Lun-Vie 8:00 - 18:00',
    flota: 'Chevrolet Tracker, etc.',
    precioCOP: 140000,
    porQue: 'Tarifas competitivas de alquiler corporativo en zona céntrica.',
    porQueKey: 'efficiency',
    nombreKeys: {
      es: 'Hertz Bucaramanga - Centro',
      en: 'Hertz Bucaramanga - Downtown',
      fr: 'Hertz Bucaramanga - Centre-ville',
      pt: 'Hertz Bucaramanga - Centro'
    },
    direccionKeys: {
      es: 'Carrera 27 # 36-14, Barrio Cañaveral, Bucaramanga',
      en: 'Carrera 27 # 36-14, Cañaveral Neighborhood, Bucaramanga',
      fr: 'Carrera 27 # 36-14, Quartier Cañaveral, Bucaramanga',
      pt: 'Carrera 27 # 36-14, Bairro Cañaveral, Bucaramanga'
    },
    flotaKeys: {
      es: 'Chevrolet Tracker, entre otros',
      en: 'Chevrolet Tracker, and more',
      fr: 'Chevrolet Tracker, entre autres',
      pt: 'Chevrolet Tracker, entre outros'
    }
  },
  {
    id: 'budget-cartagena',
    alias: 'Budget Cartagena - Bocagrande',
    nombre: 'Budget Cartagena - Bocagrande',
    marca: 'Budget',
    tag: 'Centro',
    direccion: 'Av. San Martín # 6-45, Barrio Bocagrande, Cartagena',
    horario: 'Lun-Sáb 8:00 - 20:00',
    flota: 'Renault Stepway, etc.',
    precioCOP: 160000,
    porQue: 'Alquiler flexible en la zona hotelera de Bocagrande.',
    porQueKey: 'valle',
    nombreKeys: {
      es: 'Budget Cartagena - Bocagrande',
      en: 'Budget Cartagena - Bocagrande Area',
      fr: 'Budget Cartagena - Quartier Bocagrande',
      pt: 'Budget Cartagena - Bairro Bocagrande'
    },
    direccionKeys: {
      es: 'Av. San Martín # 6-45, Barrio Bocagrande, Cartagena',
      en: 'San Martín Ave # 6-45, Bocagrande Neighborhood, Cartagena',
      fr: 'Avenue San Martín # 6-45, Quartier Bocagrande, Cartagena',
      pt: 'Av. San Martín # 6-45, Bairro Bocagrande, Cartagena'
    },
    flotaKeys: {
      es: 'Renault Stepway, entre otros',
      en: 'Renault Stepway, and more',
      fr: 'Renault Stepway, entre autres',
      pt: 'Renault Stepway, entre outros'
    }
  }
]

export default function SucursalesPage() {
  const { t, i18n } = useTranslation()
  const { tema, moneda } = useLanding()
  const navigate = useNavigate()
  const esModoOscuro = tema === 'oscuro'
  const c = coloresTema(esModoOscuro)
  const [sucursalActiva, setSucursalActiva] = useState(null)
  const [pagina, setPagina] = useState(1)
  const SUCURSALES_POR_PAGINA = 8
  const totalPaginas = Math.ceil(SUCURSALES_GRID.length / SUCURSALES_POR_PAGINA)

  const resultadosRef = useRef(null)
  const { vehiculos, cargando, error, reintentar } = useCatalogo()

  const lang = (i18n.language || 'es').substring(0, 2)

  const getNombre = (suc) => {
    if (suc.nombreKeys && suc.nombreKeys[lang]) return suc.nombreKeys[lang]
    return suc.nombre
  }

  const getDireccion = (suc) => {
    if (suc.direccionKeys && suc.direccionKeys[lang]) return suc.direccionKeys[lang]
    return suc.direccion
  }

  const getFlota = (suc) => {
    if (suc.flotaKeys && suc.flotaKeys[lang]) return suc.flotaKeys[lang]
    return suc.flota
  }

  const vehiculosSucursalCache = useMemo(() => {
    const map = {}
    SUCURSALES_GRID.forEach(s => { map[s.alias] = [] })
    vehiculos.forEach(v => {
      if (map[v.sucursal]) map[v.sucursal].push(v)
    })
    return map
  }, [vehiculos])

  const flotaFiltrada = useMemo(() => {
    if (!sucursalActiva) return []
    return vehiculosSucursalCache[sucursalActiva.alias] || vehiculos.slice(0, 3)
  }, [sucursalActiva, vehiculosSucursalCache, vehiculos])

  const sucursalesPagina = useMemo(() => {
    const inicio = (pagina - 1) * SUCURSALES_POR_PAGINA
    return SUCURSALES_GRID.slice(inicio, inicio + SUCURSALES_POR_PAGINA)
  }, [pagina])

  const getTagTraducido = (tag) => {
    if (tag === 'Aeropuerto') return t('sucursales.tags.airport', 'Aeropuerto')
    if (tag === 'Poblado') return t('sucursales.tags.poblado', 'Poblado')
    if (tag === 'Centro') return t('sucursales.tags.downtown', 'Centro')
    return tag
  }

  const getHorarioTraducido = (horarioStr) => {
    if (!horarioStr) return ''
    return horarioStr
      .replace(/Lun-Dom 24 Horas/g, t('sucursales.schedules.24h', 'Lun-Dom 24 Horas'))
      .replace(/Lun-Sáb/g, t('sucursales.schedules.monSat', 'Lun-Sáb'))
      .replace(/Lun-Vie/g, t('sucursales.schedules.monFri', 'Lun-Vie'))
      .replace(/Lun-Dom/g, t('sucursales.schedules.monSun', 'Lun-Dom'))
  }

  const getPorQueTraducido = (suc) => {
    if (suc.porQueKey) return t(`sucursales.guarantees.${suc.porQueKey}`, suc.porQue)
    return suc.porQue
  }

  const verCarrosSucursal = (suc) => {
    setSucursalActiva(suc)
    setTimeout(() => {
      resultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

  return (
    <div className="catalogo-page" style={{ minHeight: '100vh', background: c.pageBg, color: c.textPrimary, position: 'relative', overflowX: 'hidden', zoom: 0.9 }}>
      
      <div className="detalle-contenido-inner" style={{ maxWidth: 1360, margin: '0 auto', padding: '24px 24px 60px' }}>
        
        {/* Action Header Row */}
        <div style={{ marginBottom: 24 }}>
          <button 
            className="catalogo-header-back" 
            onClick={() => navigate('/')}
            style={{
              background: c.panelBg,
              border: `1px solid ${c.cardBorder}`,
              color: c.accentText,
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <FaArrowLeft size={12} /> {t('common.backToHome', 'Volver al inicio')}
          </button>
        </div>

        {/* Main Container Card */}
        <div className="sucursales-main-card" style={{
          background: c.panelBg,
          borderRadius: '28px',
          border: `1px solid ${c.panelBorder}`,
          boxShadow: c.panelShadow,
          padding: '40px 32px 48px',
        }}>
          {/* Clean Minimal Header Section */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 900,
              color: c.textPrimary,
              margin: '0 0 10px',
              letterSpacing: '-0.02em'
            }}>
              {t('sucursales.byAgency', 'Vehículos por Agencia')}
            </h1>

            <p style={{
              fontSize: '15px',
              color: c.textSecondary,
              margin: '0 auto',
              maxWidth: '560px',
              lineHeight: 1.55
            }}>
              {t('sucursales.byAgencySubtitle', 'Selecciona una compañía y mira solo los carros disponibles para esa sucursal.')}
            </p>
          </div>

          {/* Agencies Grid (4 Columns in Desktop) */}
          <div className="sucursales-grid-container" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {sucursalesPagina.map((suc) => {
              const esActivo = sucursalActiva?.alias === suc.alias

              return (
                <div
                  key={suc.alias}
                  style={{
                    background: c.panelBg,
                    borderRadius: '20px',
                    border: `1.5px solid ${esActivo ? c.accentText : c.cardBorder}`,
                    boxShadow: esActivo ? '0 12px 32px rgba(37,99,235,0.20)' : '0 6px 20px rgba(15,23,42,0.04)',
                    padding: '22px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 220ms ease',
                    cursor: 'default',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow = '0 14px 32px rgba(37,99,235,0.15)'
                    e.currentTarget.style.borderColor = c.cardBorderHover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = esActivo ? '0 12px 32px rgba(37,99,235,0.20)' : '0 6px 20px rgba(15,23,42,0.04)'
                    e.currentTarget.style.borderColor = esActivo ? c.accentText : c.cardBorder
                  }}
                >
                  <div>
                    {/* Brand Logo Box */}
                    <div style={{
                      height: 72,
                      background: c.itemBg,
                      borderRadius: '14px',
                      border: `1px solid ${c.panelBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      <BrandLogo marca={suc.marca} />
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: 16.5, fontWeight: 800, color: c.textPrimary, margin: '0 0 10px', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
                      {getNombre(suc)}
                    </h3>

                    {/* Location Tag */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 12px',
                      borderRadius: 20,
                      background: c.accentBgSoft,
                      color: c.accentText,
                      fontSize: 11.5,
                      fontWeight: 700,
                      marginBottom: 12
                    }}>
                      <FaMapMarkerAlt size={11} /> {getTagTraducido(suc.tag)}
                    </div>

                    {/* Address */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 16, minHeight: 40 }}>
                      <p style={{ fontSize: 12.5, color: c.textSecondary, margin: 0, lineHeight: 1.5 }}>
                        {getDireccion(suc)}
                      </p>
                    </div>

                    {/* Info Sub-Card (Horario & Flota) */}
                    <div style={{
                      background: c.subCardBg,
                      borderRadius: '14px',
                      border: `1px solid ${c.panelBorder}`,
                      padding: '12px 14px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: c.accentText, marginBottom: 4 }}>
                          <FaClock size={11} /> {t('sucursales.schedule', 'Horario')}
                        </div>
                        <div style={{ fontSize: 11.5, color: c.textPrimary, fontWeight: 600, lineHeight: 1.3 }}>
                          {getHorarioTraducido(suc.horario)}
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: c.accentText, marginBottom: 4 }}>
                          <FaCar size={11} /> {t('sucursales.fleet', 'Flota')}
                        </div>
                        <div style={{ fontSize: 11.5, color: c.textPrimary, fontWeight: 600, lineHeight: 1.3 }}>
                          {getFlota(suc)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Price & Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 14, borderTop: `1px solid ${c.panelBorder}` }}>
                    <div>
                      <span style={{ fontSize: 10.5, color: c.textSecondary, display: 'block', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {t('sucursales.from', 'Desde')}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: c.textPrimary }}>
                        {formatCurrency(suc.precioCOP, moneda)}<span style={{ fontSize: 12, fontWeight: 600, color: c.textSecondary }}>{t('sucursales.perDay', '/día')}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => verCarrosSucursal(suc)}
                      style={{
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                        transition: 'all 150ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)'
                        e.currentTarget.style.boxShadow = '0 6px 18px rgba(37,99,235,0.35)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.25)'
                      }}
                    >
                      {t('sucursales.viewCars', 'Ver carros')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Catalog Pagination Component (Anterior / Numbers / Siguiente) */}
          {totalPaginas > 1 && (
            <CatalogPagination
              pagina={pagina}
              setPagina={setPagina}
              totalPaginas={totalPaginas}
              c={c}
            />
          )}

          {/* Selected Agency Vehicle Fleet Panel */}
          {sucursalActiva && (
            <div
              ref={resultadosRef}
              className="sucursales-flota-panel"
              style={{
                marginTop: '40px',
                background: c.panelBg,
                borderRadius: '22px',
                border: `1.5px solid ${c.accentText}`,
                boxShadow: '0 12px 36px rgba(37,99,235,0.12)',
                padding: '28px',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: c.textPrimary }}>
                    {t('sucursales.availableCars', { name: getNombre(sucursalActiva) })}
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: c.textSecondary }}>
                    {t('sucursales.resultsCount', { count: flotaFiltrada.length })}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: c.accentText, background: c.accentBgSoft, padding: '8px 16px', borderRadius: '12px', fontWeight: 700 }}>
                  <FaCheckCircle color={c.accentText} />
                  <span><strong>{t('sucursales.guarantee', { name: getNombre(sucursalActiva) })}</strong> {getPorQueTraducido(sucursalActiva)}</span>
                </div>
              </div>

              {cargando ? (
                <LoadingState text={t('catalogo.loading')} />
              ) : error ? (
                <ErrorState mensaje={error} onReintentar={reintentar} />
              ) : flotaFiltrada.length > 0 ? (
                <VehicleGrid vehiculos={flotaFiltrada} c={c} />
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 20px', background: c.itemBg, borderRadius: '16px', border: `1px solid ${c.cardBorder}` }}>
                  <FaCar size={36} color={c.accentText} style={{ marginBottom: '12px' }} />
                  <p style={{ margin: '0 0 4px', fontSize: '15px', color: c.textPrimary, fontWeight: 700 }}>{t('sucursales.noVehicles', 'No hay vehículos disponibles en esta sucursal')}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: c.textSecondary }}>{t('sucursales.noVehiclesSubtitle', 'Prueba seleccionando otra sucursal de la lista.')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
