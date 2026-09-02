export const IDIOMAS = {
  es: { label: 'Español',             flag: '🇪🇸' },
  en: { label: 'English',             flag: '🇺🇸' },
  fr: { label: 'Français',            flag: '🇫🇷' },
  pt: { label: 'Português',           flag: '🇵🇹' },
  br: { label: 'Português brasileiro', flag: '🇧🇷' },
}

export const CAT_MAP = {
  'Económico': { es: 'Económico', en: 'Economy', fr: 'Économique', pt: 'Económico', br: 'Econômico' },
  'Deportivo': { es: 'Deportivo', en: 'Sport', fr: 'Sportive', pt: 'Esportivo', br: 'Esportivo' },
  'Sedan': { es: 'Sedan', en: 'Sedan', fr: 'Berline', pt: 'Berlina', br: 'Sedã' },
  'SUV': { es: 'SUV', en: 'SUV', fr: 'SUV', pt: 'SUV', br: 'SUV' },
}

export const LANDING_UI = {
  es: { light: 'Claro', dark: 'Oscuro', faqTitle: 'Preguntas frecuentes', contactTitle: 'Canales de contacto', privacyTitle: 'Política de privacidad', lawTitle: 'Ley 1581 de 2012', securityTitle: 'Seguridad de la cuenta', closeDetails: 'Cerrar información', securityLink: 'Seguridad de la cuenta' },
  en: { light: 'Light', dark: 'Dark', faqTitle: 'Frequently asked questions', contactTitle: 'Contact channels', privacyTitle: 'Privacy policy', lawTitle: 'Law 1581 of 2012', securityTitle: 'Account security', closeDetails: 'Close information', securityLink: 'Account security' },
  fr: { light: 'Clair', dark: 'Sombre', faqTitle: 'Questions fréquentes', contactTitle: 'Canaux de contact', privacyTitle: 'Politique de confidentialité', lawTitle: 'Loi 1581 de 2012', securityTitle: 'Sécurité du compte', closeDetails: 'Fermer les informations', securityLink: 'Sécurité du compte' },
  pt: { light: 'Claro', dark: 'Escuro', faqTitle: 'Perguntas frequentes', contactTitle: 'Canais de contacto', privacyTitle: 'Política de privacidade', lawTitle: 'Lei 1581 de 2012', securityTitle: 'Segurança da conta', closeDetails: 'Fechar informação', securityLink: 'Segurança da conta' },
  br: { light: 'Claro', dark: 'Escuro', faqTitle: 'Perguntas frequentes', contactTitle: 'Canais de contato', privacyTitle: 'Política de privacidade', lawTitle: 'Lei 1581 de 2012', securityTitle: 'Segurança da conta', closeDetails: 'Fechar informações', securityLink: 'Segurança da conta' },
}

const traducciones = {
  es: {
    nav: {
      vehiculos: 'Vehículos', sucursales: 'Sucursales', servicios: 'Servicios',
      tarifas: 'Tarifas', soporte: 'Soporte', login: 'Iniciar sesión',
      registro: 'Registrarse', config: 'Configuración',
      tema: 'Tema', claro: 'Claro', oscuro: 'Oscuro', idioma: 'Idioma',
    },
    hero: {
      badge: 'Disponible en Colombia 🇨🇴',
      h1a: 'Alquila fácil,', h1b: 'conduce libre',
      sub: 'La plataforma digital que moderniza el alquiler de vehículos en Colombia. Reserva en minutos, paga seguro y maneja sin complicaciones.',
      cta1: 'Comenzar ahora', cta2: 'Iniciar sesión',
      stat1: 'Vehículos', stat2: 'Soporte', stat3: 'Digital',
      cardTitle: 'Disponibles ahora', cardOnline: 'En línea', verFlota: 'Ver toda la flota',
      perDay: '/día', passengers: 'pasajeros', previousVehicle: 'Vehículo anterior', nextVehicle: 'Vehículo siguiente',
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
    app: {
      label: 'Experiencia movil',
      titulo: 'Tambien puedes gestionar tu actividad desde la App Drivique',
      sub: 'Consulta reservas, pagos, contratos y notificaciones desde una interfaz pensada para el celular.',
      cta: 'Entrar a mi cuenta',
      previewTitle: 'Resumen de viaje',
      status: 'Contrato listo',
      items: ['Reserva activa', 'Pago confirmado', 'Contrato digital'],
    },
    requirements: {
      label: 'Antes de reservar',
      titulo: 'Requisitos para alquiler',
      sub: 'Ten estos datos listos para validar tu cuenta, firmar el contrato y retirar el vehiculo sin demoras.',
      items: [
        { titulo: 'Documento vigente', desc: 'Cedula o documento de identidad registrado en tu perfil.' },
        { titulo: 'Licencia de conducir', desc: 'Archivo de licencia cargado y legible para la verificacion.' },
        { titulo: 'Medio de pago', desc: 'Pago en linea o punto de efectivo autorizado segun la sucursal.' },
        { titulo: 'Contrato digital', desc: 'Firma y conserva el contrato generado para tu reserva.' },
      ],
      cta: 'Crear cuenta',
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
      tema: 'Theme', claro: 'Light', oscuro: 'Dark', idioma: 'Language',
    },
    hero: {
      badge: 'Available in Colombia 🇨🇴',
      h1a: 'Rent easy,', h1b: 'drive free',
      sub: 'The digital platform modernizing vehicle rental in Colombia. Book in minutes, pay safely and drive without hassle.',
      cta1: 'Get started', cta2: 'Log in',
      stat1: 'Vehicles', stat2: 'Support', stat3: 'Digital',
      cardTitle: 'Available now', cardOnline: 'Online', verFlota: 'View full fleet',
      perDay: '/day', passengers: 'passengers', previousVehicle: 'Previous vehicle', nextVehicle: 'Next vehicle',
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
    app: {
      label: 'Mobile experience',
      titulo: 'You can also manage your activity from the Drivique App',
      sub: 'Check bookings, payments, contracts and notifications from a phone-first interface.',
      cta: 'Access my account',
      previewTitle: 'Trip summary',
      status: 'Contract ready',
      items: ['Active booking', 'Payment confirmed', 'Digital contract'],
    },
    requirements: {
      label: 'Before booking',
      titulo: 'Rental requirements',
      sub: 'Keep these details ready to validate your account, sign the contract and pick up the vehicle without delays.',
      items: [
        { titulo: 'Valid ID', desc: 'ID document registered in your profile.' },
        { titulo: 'Driver license', desc: 'Readable license file uploaded for verification.' },
        { titulo: 'Payment method', desc: 'Online payment or authorized cash point depending on the branch.' },
        { titulo: 'Digital contract', desc: 'Sign and keep the contract generated for your booking.' },
      ],
      cta: 'Create account',
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
      tema: 'Thème', claro: 'Clair', oscuro: 'Sombre', idioma: 'Langue',
    },
    hero: {
      badge: 'Disponible en Colombie 🇨🇴',
      h1a: 'Louez facile,', h1b: 'conduisez libre',
      sub: 'La plateforme numérique qui modernise la location de véhicules en Colombie. Réservez en minutes, payez en sécurité.',
      cta1: 'Commencer', cta2: 'Se connecter',
      stat1: 'Véhicules', stat2: 'Support', stat3: 'Numérique',
      cardTitle: 'Disponibles maintenant', cardOnline: 'En ligne', verFlota: 'Voir toute la flotte',
      perDay: '/jour', passengers: 'passagers', previousVehicle: 'Véhicule précédent', nextVehicle: 'Véhicule suivant',
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
    app: {
      label: 'Expérience mobile',
      titulo: "Vous pouvez aussi gérer votre activité depuis l'App Drivique",
      sub: 'Consultez réservations, paiements, contrats et notifications depuis une interface pensée pour mobile.',
      cta: 'Accéder à mon compte',
      previewTitle: 'Résumé du trajet',
      status: 'Contrat prêt',
      items: ['Réservation active', 'Paiement confirmé', 'Contrat numérique'],
    },
    requirements: {
      label: 'Avant de reserver',
      titulo: 'Conditions de location',
      sub: 'Gardez ces donnees pretes pour valider votre compte, signer le contrat et retirer le vehicule sans retard.',
      items: [
        { titulo: 'Piece d identite valide', desc: 'Document d identite enregistre dans votre profil.' },
        { titulo: 'Permis de conduire', desc: 'Fichier du permis lisible charge pour verification.' },
        { titulo: 'Mode de paiement', desc: 'Paiement en ligne ou point de paiement en especes autorise selon l agence.' },
        { titulo: 'Contrat numerique', desc: 'Signez et conservez le contrat genere pour votre reservation.' },
      ],
      cta: 'Creer un compte',
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
      tema: 'Tema', claro: 'Claro', oscuro: 'Escuro', idioma: 'Idioma',
    },
    hero: {
      badge: 'Disponível na Colômbia 🇨🇴',
      h1a: 'Alugue fácil,', h1b: 'conduza livre',
      sub: 'A plataforma digital que moderniza o aluguer de veículos na Colômbia. Reserve em minutos, pague com segurança.',
      cta1: 'Começar agora', cta2: 'Entrar',
      stat1: 'Veículos', stat2: 'Suporte', stat3: 'Digital',
      cardTitle: 'Disponíveis agora', cardOnline: 'Online', verFlota: 'Ver toda a frota',
      perDay: '/dia', passengers: 'passageiros', previousVehicle: 'Veículo anterior', nextVehicle: 'Veículo seguinte',
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
    app: {
      label: 'Experiência móvel',
      titulo: 'Também pode gerir a sua atividade na App Drivique',
      sub: 'Consulte reservas, pagamentos, contratos e notificações numa interface pensada para telemóvel.',
      cta: 'Entrar na minha conta',
      previewTitle: 'Resumo da viagem',
      status: 'Contrato pronto',
      items: ['Reserva ativa', 'Pagamento confirmado', 'Contrato digital'],
    },
    requirements: {
      label: 'Antes de reservar',
      titulo: 'Requisitos para aluguel',
      sub: 'Tenha estes dados prontos para validar a conta, assinar o contrato e levantar o veiculo sem atrasos.',
      items: [
        { titulo: 'Documento valido', desc: 'Documento de identidade registado no seu perfil.' },
        { titulo: 'Carta de conducao', desc: 'Ficheiro da carta legivel carregado para verificacao.' },
        { titulo: 'Metodo de pagamento', desc: 'Pagamento online ou ponto de numerario autorizado conforme a agencia.' },
        { titulo: 'Contrato digital', desc: 'Assine e guarde o contrato gerado para a sua reserva.' },
      ],
      cta: 'Criar conta',
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
      tema: 'Tema', claro: 'Claro', oscuro: 'Escuro', idioma: 'Idioma',
    },
    hero: {
      badge: 'Disponível na Colômbia 🇨🇴',
      h1a: 'Alugue fácil,', h1b: 'dirija livre',
      sub: 'A plataforma digital que moderniza o aluguel de veículos na Colômbia. Reserve em minutos, pague com segurança.',
      cta1: 'Começar agora', cta2: 'Entrar',
      stat1: 'Veículos', stat2: 'Suporte', stat3: 'Digital',
      cardTitle: 'Disponíveis agora', cardOnline: 'Online', verFlota: 'Ver toda a frota',
      perDay: '/dia', passengers: 'passageiros', previousVehicle: 'Veículo anterior', nextVehicle: 'Veículo seguinte',
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
    app: {
      label: 'Experiência mobile',
      titulo: 'Você também pode gerenciar sua atividade pelo App Drivique',
      sub: 'Consulte reservas, pagamentos, contratos e notificações em uma interface pensada para celular.',
      cta: 'Entrar na minha conta',
      previewTitle: 'Resumo da viagem',
      status: 'Contrato pronto',
      items: ['Reserva ativa', 'Pagamento confirmado', 'Contrato digital'],
    },
    requirements: {
      label: 'Antes de reservar',
      titulo: 'Requisitos para aluguel',
      sub: 'Tenha estes dados prontos para validar sua conta, assinar o contrato e retirar o veiculo sem atrasos.',
      items: [
        { titulo: 'Documento valido', desc: 'Documento de identidade cadastrado no seu perfil.' },
        { titulo: 'Carteira de motorista', desc: 'Arquivo da carteira legivel enviado para verificacao.' },
        { titulo: 'Forma de pagamento', desc: 'Pagamento online ou ponto de dinheiro autorizado conforme a filial.' },
        { titulo: 'Contrato digital', desc: 'Assine e mantenha o contrato gerado para sua reserva.' },
      ],
      cta: 'Criar conta',
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
