// src/modules/landing/traducciones.js

export const IDIOMAS = {
  es: { label: 'Español',             flag: '🇪🇸' },
  en: { label: 'English',             flag: '🇺🇸' },
  fr: { label: 'Français',            flag: '🇫🇷' },
  pt: { label: 'Português',           flag: '🇵🇹' },
  br: { label: 'Português brasileiro', flag: '🇧🇷' },
}

const traducciones = {
  es: {
    nav: {
      vehiculos: 'Vehículos', sucursales: 'Sucursales', servicios: 'Servicios',
      tarifas: 'Tarifas', soporte: 'Soporte', login: 'Iniciar sesión',
      registro: 'Registrarse', config: 'Configuración',
      tema: 'Tema', claro: '☀️ Claro', oscuro: '🌙 Oscuro', idioma: 'Idioma',
    },
    hero: {
      badge: 'Disponible en Colombia 🇨🇴',
      h1a: 'Alquila fácil,', h1b: 'conduce libre',
      sub: 'La plataforma digital que moderniza el alquiler de vehículos en Colombia. Reserva en minutos, paga seguro y maneja sin complicaciones.',
      cta1: 'Comenzar ahora', cta2: 'Iniciar sesión',
      stat1: 'Vehículos', stat2: 'Soporte', stat3: 'Digital',
      cardTitle: 'Disponibles ahora', cardOnline: 'En línea', verFlota: 'Ver toda la flota',
    },
    como: {
      label: 'Proceso simple', titulo: '¿Cómo funciona?',
      sub: 'En 4 pasos tienes tu vehículo listo para manejar',
      pasos: [
        { num: '01', titulo: 'Crea tu cuenta',    desc: 'Regístrate en minutos y sube tu licencia de conducir para verificación.' },
        { num: '02', titulo: 'Elige tu vehículo', desc: 'Explora la flota, filtra por categoría, precio y disponibilidad.' },
        { num: '03', titulo: 'Reserva y paga',    desc: 'Selecciona fechas, sucursal y método de pago. Recibe tu contrato digital.' },
        { num: '04', titulo: 'Conduce libre',     desc: 'Recoge tu vehículo, disfruta el viaje y califica tu experiencia.' },
      ],
    },
    features: {
      label: 'Todo incluido', titulo: 'Por qué elegirnos',
      sub: 'Una plataforma completa diseñada para tu comodidad',
      items: [
        { titulo: 'Flota premium',         desc: 'Más de 50 vehículos disponibles: SUVs, sedanes, económicos y deportivos para cada necesidad.' },
        { titulo: 'Pagos 100% seguros',    desc: 'PSE, Nequi, tarjetas crédito/débito a través de Wompi con cifrado SSL/TLS.' },
        { titulo: 'Contratos digitales',   desc: 'Firma tu contrato en línea con validez legal. Sin papeleos, sin filas, sin complicaciones.' },
        { titulo: 'Múltiples sucursales',  desc: 'Recoge y devuelve tu vehículo en la sucursal más cercana con disponibilidad en tiempo real.' },
        { titulo: 'App móvil PWA',         desc: 'Reserva desde tu celular Android. Interfaz adaptada para una experiencia fluida en cualquier dispositivo.' },
        { titulo: 'Calificaciones reales', desc: 'Lee reseñas verificadas de otros conductores y califica tu experiencia al finalizar cada viaje.' },
      ],
    },
    cta: {
      titulo: '¿Listo para manejar sin complicaciones?',
      sub: 'Únete a cientos de conductores que ya confían en Drivique.',
      btn1: 'Crear cuenta gratis', btn2: 'Ya tengo cuenta',
    },
    footer: {
      desc: 'Plataforma digital de alquiler de vehículos desarrollada en Colombia. Segura, eficiente y accesible.',
      cols: [
        { title: 'Plataforma', links: ['Catálogo de vehículos', 'Reservas', 'Pagos en línea', 'Contratos digitales'] },
        { title: 'Soporte',    links: ['Preguntas frecuentes', 'Contacto', 'Quejas y sugerencias', 'WhatsApp 24/7'] },
        { title: 'Legal',      links: ['Términos y condiciones', 'Política de privacidad', 'Ley 1581 de 2012', 'OWASP Top 10'] },
      ],
      copy: '© 2025 Drivique. Todos los derechos reservados. Ficha 3145555 — SENA CIES.',
    },
  },

  en: {
    nav: {
      vehiculos: 'Vehicles', sucursales: 'Branches', servicios: 'Services',
      tarifas: 'Rates', soporte: 'Support', login: 'Log in',
      registro: 'Sign up', config: 'Settings',
      tema: 'Theme', claro: '☀️ Light', oscuro: '🌙 Dark', idioma: 'Language',
    },
    hero: {
      badge: 'Available in Colombia 🇨🇴',
      h1a: 'Rent easy,', h1b: 'drive free',
      sub: 'The digital platform modernizing vehicle rental in Colombia. Book in minutes, pay safely and drive without hassle.',
      cta1: 'Get started', cta2: 'Log in',
      stat1: 'Vehicles', stat2: 'Support', stat3: 'Digital',
      cardTitle: 'Available now', cardOnline: 'Online', verFlota: 'View full fleet',
    },
    como: {
      label: 'Simple process', titulo: 'How does it work?',
      sub: 'In 4 steps your vehicle is ready to drive',
      pasos: [
        { num: '01', titulo: 'Create your account', desc: "Register in minutes and upload your driver's license for verification." },
        { num: '02', titulo: 'Choose your vehicle',  desc: 'Browse the fleet, filter by category, price and availability.' },
        { num: '03', titulo: 'Book and pay',          desc: 'Select dates, branch and payment method. Receive your digital contract.' },
        { num: '04', titulo: 'Drive free',            desc: 'Pick up your vehicle, enjoy the ride and rate your experience.' },
      ],
    },
    features: {
      label: 'All included', titulo: 'Why choose us',
      sub: 'A complete platform designed for your convenience',
      items: [
        { titulo: 'Premium fleet',          desc: 'More than 50 vehicles: SUVs, sedans, economy and sports cars for every need.' },
        { titulo: '100% secure payments',   desc: 'PSE, Nequi, credit/debit cards through Wompi with SSL/TLS encryption.' },
        { titulo: 'Digital contracts',      desc: 'Sign your contract online with legal validity. No paperwork, no queues.' },
        { titulo: 'Multiple branches',      desc: 'Pick up and return your vehicle at the nearest branch with real-time availability.' },
        { titulo: 'PWA mobile app',         desc: 'Book from your Android phone. Adapted interface for a smooth experience on any device.' },
        { titulo: 'Real ratings',           desc: 'Read verified reviews from other drivers and rate your experience after each trip.' },
      ],
    },
    cta: {
      titulo: 'Ready to drive without complications?',
      sub: 'Join hundreds of drivers who already trust Drivique.',
      btn1: 'Create free account', btn2: 'I already have an account',
    },
    footer: {
      desc: 'Digital vehicle rental platform developed in Colombia. Safe, efficient and accessible.',
      cols: [
        { title: 'Platform', links: ['Vehicle catalog', 'Bookings', 'Online payments', 'Digital contracts'] },
        { title: 'Support',  links: ['FAQ', 'Contact', 'Complaints & suggestions', 'WhatsApp 24/7'] },
        { title: 'Legal',    links: ['Terms & conditions', 'Privacy policy', 'Law 1581 of 2012', 'OWASP Top 10'] },
      ],
      copy: '© 2025 Drivique. All rights reserved. File 3145555 — SENA CIES.',
    },
  },

  fr: {
    nav: {
      vehiculos: 'Véhicules', sucursales: 'Agences', servicios: 'Services',
      tarifas: 'Tarifs', soporte: 'Support', login: 'Se connecter',
      registro: "S'inscrire", config: 'Paramètres',
      tema: 'Thème', claro: '☀️ Clair', oscuro: '🌙 Sombre', idioma: 'Langue',
    },
    hero: {
      badge: 'Disponible en Colombie 🇨🇴',
      h1a: 'Louez facile,', h1b: 'conduisez libre',
      sub: 'La plateforme numérique qui modernise la location de véhicules en Colombie. Réservez en minutes, payez en sécurité.',
      cta1: 'Commencer', cta2: 'Se connecter',
      stat1: 'Véhicules', stat2: 'Support', stat3: 'Numérique',
      cardTitle: 'Disponibles maintenant', cardOnline: 'En ligne', verFlota: 'Voir toute la flotte',
    },
    como: {
      label: 'Processus simple', titulo: 'Comment ça marche ?',
      sub: 'En 4 étapes votre véhicule est prêt à conduire',
      pasos: [
        { num: '01', titulo: 'Créez votre compte',     desc: 'Inscrivez-vous en minutes et téléchargez votre permis de conduire.' },
        { num: '02', titulo: 'Choisissez un véhicule', desc: 'Parcourez la flotte, filtrez par catégorie, prix et disponibilité.' },
        { num: '03', titulo: 'Réservez et payez',      desc: "Sélectionnez les dates, l'agence et le mode de paiement. Recevez votre contrat." },
        { num: '04', titulo: 'Conduisez libre',        desc: 'Récupérez votre véhicule, profitez du voyage et évaluez votre expérience.' },
      ],
    },
    features: {
      label: 'Tout inclus', titulo: 'Pourquoi nous choisir',
      sub: 'Une plateforme complète conçue pour votre confort',
      items: [
        { titulo: 'Flotte premium',           desc: 'Plus de 50 véhicules : SUV, berlines, économiques et sportifs pour chaque besoin.' },
        { titulo: 'Paiements 100% sécurisés', desc: 'PSE, Nequi, cartes crédit/débit via Wompi avec chiffrement SSL/TLS.' },
        { titulo: 'Contrats numériques',      desc: 'Signez votre contrat en ligne avec valeur légale. Sans paperasse, sans files.' },
        { titulo: 'Plusieurs agences',        desc: "Récupérez et retournez votre véhicule à l'agence la plus proche en temps réel." },
        { titulo: 'Application mobile PWA',   desc: 'Réservez depuis votre téléphone Android. Interface adaptée à tout appareil.' },
        { titulo: 'Avis réels',               desc: 'Lisez des avis vérifiés et évaluez votre expérience après chaque trajet.' },
      ],
    },
    cta: {
      titulo: 'Prêt à conduire sans complications ?',
      sub: 'Rejoignez des centaines de conducteurs qui font confiance à Drivique.',
      btn1: 'Créer un compte gratuit', btn2: "J'ai déjà un compte",
    },
    footer: {
      desc: 'Plateforme numérique de location de véhicules développée en Colombie. Sûre, efficace et accessible.',
      cols: [
        { title: 'Plateforme', links: ['Catalogue de véhicules', 'Réservations', 'Paiements en ligne', 'Contrats numériques'] },
        { title: 'Support',    links: ['FAQ', 'Contact', 'Plaintes et suggestions', 'WhatsApp 24/7'] },
        { title: 'Légal',      links: ['Conditions générales', 'Politique de confidentialité', 'Loi 1581 de 2012', 'OWASP Top 10'] },
      ],
      copy: '© 2025 Drivique. Tous droits réservés. Dossier 3145555 — SENA CIES.',
    },
  },

  pt: {
    nav: {
      vehiculos: 'Veículos', sucursales: 'Agências', servicios: 'Serviços',
      tarifas: 'Tarifas', soporte: 'Suporte', login: 'Entrar',
      registro: 'Registar', config: 'Configurações',
      tema: 'Tema', claro: '☀️ Claro', oscuro: '🌙 Escuro', idioma: 'Idioma',
    },
    hero: {
      badge: 'Disponível na Colômbia 🇨🇴',
      h1a: 'Alugue fácil,', h1b: 'conduza livre',
      sub: 'A plataforma digital que moderniza o aluguer de veículos na Colômbia. Reserve em minutos, pague com segurança.',
      cta1: 'Começar agora', cta2: 'Entrar',
      stat1: 'Veículos', stat2: 'Suporte', stat3: 'Digital',
      cardTitle: 'Disponíveis agora', cardOnline: 'Online', verFlota: 'Ver toda a frota',
    },
    como: {
      label: 'Processo simples', titulo: 'Como funciona?',
      sub: 'Em 4 passos o seu veículo está pronto a conduzir',
      pasos: [
        { num: '01', titulo: 'Crie a sua conta',  desc: 'Registe-se em minutos e carregue a sua carta de condução para verificação.' },
        { num: '02', titulo: 'Escolha o veículo', desc: 'Explore a frota, filtre por categoria, preço e disponibilidade.' },
        { num: '03', titulo: 'Reserve e pague',   desc: 'Selecione datas, agência e método de pagamento. Receba o seu contrato digital.' },
        { num: '04', titulo: 'Conduza livre',     desc: 'Levante o seu veículo, aproveite a viagem e avalie a sua experiência.' },
      ],
    },
    features: {
      label: 'Tudo incluído', titulo: 'Por que nos escolher',
      sub: 'Uma plataforma completa desenhada para o seu conforto',
      items: [
        { titulo: 'Frota premium',           desc: 'Mais de 50 veículos disponíveis: SUVs, berlinas, económicos e desportivos.' },
        { titulo: 'Pagamentos 100% seguros', desc: 'PSE, Nequi, cartões crédito/débito via Wompi com encriptação SSL/TLS.' },
        { titulo: 'Contratos digitais',      desc: 'Assine o seu contrato online com validade legal. Sem papelada, sem filas.' },
        { titulo: 'Várias agências',         desc: 'Levante e devolva o seu veículo na agência mais próxima em tempo real.' },
        { titulo: 'App móvel PWA',           desc: 'Reserve pelo seu telemóvel Android. Interface adaptada a qualquer dispositivo.' },
        { titulo: 'Avaliações reais',        desc: 'Leia avaliações verificadas e classifique a sua experiência após cada viagem.' },
      ],
    },
    cta: {
      titulo: 'Pronto para conduzir sem complicações?',
      sub: 'Junte-se a centenas de condutores que já confiam na Drivique.',
      btn1: 'Criar conta grátis', btn2: 'Já tenho conta',
    },
    footer: {
      desc: 'Plataforma digital de aluguer de veículos desenvolvida na Colômbia. Segura, eficiente e acessível.',
      cols: [
        { title: 'Plataforma', links: ['Catálogo de veículos', 'Reservas', 'Pagamentos online', 'Contratos digitais'] },
        { title: 'Suporte',    links: ['Perguntas frequentes', 'Contacto', 'Reclamações e sugestões', 'WhatsApp 24/7'] },
        { title: 'Legal',      links: ['Termos e condições', 'Política de privacidade', 'Lei 1581 de 2012', 'OWASP Top 10'] },
      ],
      copy: '© 2025 Drivique. Todos os direitos reservados. Ficha 3145555 — SENA CIES.',
    },
  },

  br: {
    nav: {
      vehiculos: 'Veículos', sucursales: 'Filiais', servicios: 'Serviços',
      tarifas: 'Tarifas', soporte: 'Suporte', login: 'Entrar',
      registro: 'Cadastrar', config: 'Configurações',
      tema: 'Tema', claro: '☀️ Claro', oscuro: '🌙 Escuro', idioma: 'Idioma',
    },
    hero: {
      badge: 'Disponível na Colômbia 🇨🇴',
      h1a: 'Alugue fácil,', h1b: 'dirija livre',
      sub: 'A plataforma digital que moderniza o aluguel de veículos na Colômbia. Reserve em minutos, pague com segurança.',
      cta1: 'Começar agora', cta2: 'Entrar',
      stat1: 'Veículos', stat2: 'Suporte', stat3: 'Digital',
      cardTitle: 'Disponíveis agora', cardOnline: 'Online', verFlota: 'Ver toda a frota',
    },
    como: {
      label: 'Processo simples', titulo: 'Como funciona?',
      sub: 'Em 4 passos seu veículo está pronto para dirigir',
      pasos: [
        { num: '01', titulo: 'Crie sua conta',    desc: 'Cadastre-se em minutos e envie sua carteira de habilitação para verificação.' },
        { num: '02', titulo: 'Escolha o veículo', desc: 'Explore a frota, filtre por categoria, preço e disponibilidade.' },
        { num: '03', titulo: 'Reserve e pague',   desc: 'Selecione datas, filial e forma de pagamento. Receba seu contrato digital.' },
        { num: '04', titulo: 'Dirija livre',      desc: 'Retire seu veículo, aproveite a viagem e avalie sua experiência.' },
      ],
    },
    features: {
      label: 'Tudo incluído', titulo: 'Por que nos escolher',
      sub: 'Uma plataforma completa projetada para o seu conforto',
      items: [
        { titulo: 'Frota premium',           desc: 'Mais de 50 veículos: SUVs, sedãs, econômicos e esportivos para cada necessidade.' },
        { titulo: 'Pagamentos 100% seguros', desc: 'PSE, Nequi, cartões crédito/débito via Wompi com criptografia SSL/TLS.' },
        { titulo: 'Contratos digitais',      desc: 'Assine seu contrato online com validade legal. Sem papelada, sem filas.' },
        { titulo: 'Várias filiais',          desc: 'Retire e devolva seu veículo na filial mais próxima em tempo real.' },
        { titulo: 'App móvel PWA',           desc: 'Reserve pelo seu celular Android. Interface adaptada para qualquer dispositivo.' },
        { titulo: 'Avaliações reais',        desc: 'Leia avaliações verificadas e classifique sua experiência após cada viagem.' },
      ],
    },
    cta: {
      titulo: 'Pronto para dirigir sem complicações?',
      sub: 'Junte-se a centenas de motoristas que já confiam na Drivique.',
      btn1: 'Criar conta grátis', btn2: 'Já tenho conta',
    },
    footer: {
      desc: 'Plataforma digital de aluguel de veículos desenvolvida na Colômbia. Segura, eficiente e acessível.',
      cols: [
        { title: 'Plataforma', links: ['Catálogo de veículos', 'Reservas', 'Pagamentos online', 'Contratos digitais'] },
        { title: 'Suporte',    links: ['Perguntas frequentes', 'Contato', 'Reclamações e sugestões', 'WhatsApp 24/7'] },
        { title: 'Legal',      links: ['Termos e condições', 'Política de privacidade', 'Lei 1581 de 2012', 'OWASP Top 10'] },
      ],
      copy: '© 2025 Drivique. Todos os direitos reservados. Ficha 3145555 — SENA CIES.',
    },
  },
}

export default traducciones