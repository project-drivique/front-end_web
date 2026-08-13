const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'i18n', 'locales');
const files = ['es.json', 'en.json', 'pt.json', 'br.json', 'fr.json'];

const translations = {
  es: {
    'catalog.menu.catalog': 'Catálogo',
    'catalog.menu.reservations': 'Mis reservas',
    'catalog.menu.favorites': 'Mis favoritos',
    'catalog.menu.notifications': 'Notificaciones',
    'catalog.menu.support': 'Soporte',
    'placeholder.title': 'Aún falta implementar esta pantalla',
    'placeholder.subtitle': 'Estamos trabajando para tener lista esta sección lo antes posible.',
    'placeholder.backBtn': 'Volver al Catálogo',
    'catalog.reviews.emptyTitle': 'Este vehículo aún no tiene reseñas',
    'catalog.reviews.emptySubtitle': '¡Anímate a reservarlo y sé el primero en compartir tu experiencia!',
    'catalog.gallery.new': 'Nuevo',
    'catalog.card.noReviews': 'Sin reseñas'
  },
  en: {
    'catalog.menu.catalog': 'Catalog',
    'catalog.menu.reservations': 'My Reservations',
    'catalog.menu.favorites': 'My Favorites',
    'catalog.menu.notifications': 'Notifications',
    'catalog.menu.support': 'Support',
    'placeholder.title': 'This screen is not implemented yet',
    'placeholder.subtitle': 'We are working to have this section ready as soon as possible.',
    'placeholder.backBtn': 'Back to Catalog',
    'catalog.reviews.emptyTitle': 'This vehicle has no reviews yet',
    'catalog.reviews.emptySubtitle': 'Book it now and be the first to share your experience!',
    'catalog.gallery.new': 'New',
    'catalog.card.noReviews': 'No reviews'
  },
  pt: {
    'catalog.menu.catalog': 'Catálogo',
    'catalog.menu.reservations': 'Minhas reservas',
    'catalog.menu.favorites': 'Meus favoritos',
    'catalog.menu.notifications': 'Notificações',
    'catalog.menu.support': 'Suporte',
    'placeholder.title': 'Esta tela ainda não foi implementada',
    'placeholder.subtitle': 'Estamos trabalhando para deixar esta seção pronta o mais rápido possível.',
    'placeholder.backBtn': 'Voltar ao Catálogo',
    'catalog.reviews.emptyTitle': 'Este veículo ainda não tem avaliações',
    'catalog.reviews.emptySubtitle': 'Reserve agora e seja o primeiro a compartilhar sua experiência!',
    'catalog.gallery.new': 'Novo',
    'catalog.card.noReviews': 'Sem avaliações'
  },
  fr: {
    'catalog.menu.catalog': 'Catalogue',
    'catalog.menu.reservations': 'Mes réservations',
    'catalog.menu.favorites': 'Mes favoris',
    'catalog.menu.notifications': 'Notifications',
    'catalog.menu.support': 'Support',
    'placeholder.title': 'Cet écran n\'est pas encore implémenté',
    'placeholder.subtitle': 'Nous travaillons pour que cette section soit prête le plus rapidement possible.',
    'placeholder.backBtn': 'Retour au catalogue',
    'catalog.reviews.emptyTitle': 'Ce véhicule n\'a pas encore d\'avis',
    'catalog.reviews.emptySubtitle': 'Réservez-le maintenant et soyez le premier à partager votre expérience !',
    'catalog.gallery.new': 'Nouveau',
    'catalog.card.noReviews': 'Aucun avis'
  }
};

translations.br = translations.pt; // reuse PT for BR

function setNestedProperty(obj, pathString, value) {
  const parts = pathString.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const lang = file.replace('.json', '');
    const langData = translations[lang] || translations.es;
    
    Object.keys(langData).forEach(key => {
      setNestedProperty(data, key, langData[key]);
    });
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Updated ' + file);
  }
});
