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

const verificarCorreoKeys = {
  es: {
    'verificarCorreo.sendTitle': 'Autenticación por correo',
    'verificarCorreo.sendSubtitle': 'Enviaremos un código de verificación a',
    'verificarCorreo.sendButton': 'Enviarme el código',
    'verificarCorreo.sending': 'Enviando código...',
    'verificarCorreo.backToRegistro': 'Volver al registro',
    'verificarCorreo.title': 'Verifica tu correo electrónico',
    'verificarCorreo.subtitle': 'Ingresa el código de 6 dígitos que enviamos a',
    'verificarCorreo.expired': 'El código ha expirado. Por favor solicita uno nuevo.',
    'verificarCorreo.expiresIn': 'El código expira en {{time}}',
    'verificarCorreo.submit': 'Verificar código',
    'verificarCorreo.verifying': 'Verificando...',
    'verificarCorreo.resendCountdown': 'Reenviar en {{seconds}}s',
    'verificarCorreo.resend': 'Reenviar código',
    'verificarCorreo.resending': 'Reenviando...',
    'verificarCorreo.successTitle': '¡Correo verificado con éxito!',
    'verificarCorreo.successSubtitle': 'Tu cuenta ha sido verificada correctamente. Serás redirigido en unos segundos.'
  },
  en: {
    'verificarCorreo.sendTitle': 'Email Authentication',
    'verificarCorreo.sendSubtitle': 'We will send a verification code to',
    'verificarCorreo.sendButton': 'Send me the code',
    'verificarCorreo.sending': 'Sending code...',
    'verificarCorreo.backToRegistro': 'Back to registration',
    'verificarCorreo.title': 'Verify your email address',
    'verificarCorreo.subtitle': 'Enter the 6-digit code we sent to',
    'verificarCorreo.expired': 'The code has expired. Please request a new one.',
    'verificarCorreo.expiresIn': 'Code expires in {{time}}',
    'verificarCorreo.submit': 'Verify code',
    'verificarCorreo.verifying': 'Verifying...',
    'verificarCorreo.resendCountdown': 'Resend in {{seconds}}s',
    'verificarCorreo.resend': 'Resend code',
    'verificarCorreo.resending': 'Resending...',
    'verificarCorreo.successTitle': 'Email verified successfully!',
    'verificarCorreo.successSubtitle': 'Your account has been successfully verified. You will be redirected in a few seconds.'
  },
  pt: {
    'verificarCorreo.sendTitle': 'Autenticação por e-mail',
    'verificarCorreo.sendSubtitle': 'Enviaremos um código de verificação para',
    'verificarCorreo.sendButton': 'Enviar o código',
    'verificarCorreo.sending': 'Enviando código...',
    'verificarCorreo.backToRegistro': 'Voltar ao cadastro',
    'verificarCorreo.title': 'Verifique seu e-mail',
    'verificarCorreo.subtitle': 'Insira o código de 6 dígitos que enviamos para',
    'verificarCorreo.expired': 'O código expirou. Por favor solicite um novo.',
    'verificarCorreo.expiresIn': 'O código expira em {{time}}',
    'verificarCorreo.submit': 'Verificar código',
    'verificarCorreo.verifying': 'Verificando...',
    'verificarCorreo.resendCountdown': 'Reenviar em {{seconds}}s',
    'verificarCorreo.resend': 'Reenviar código',
    'verificarCorreo.resending': 'Reenviando...',
    'verificarCorreo.successTitle': 'E-mail verificado com sucesso!',
    'verificarCorreo.successSubtitle': 'Sua conta foi verificada com sucesso. Você será redirecionado em alguns segundos.'
  },
  fr: {
    'verificarCorreo.sendTitle': 'Authentification par e-mail',
    'verificarCorreo.sendSubtitle': 'Nous enverrons un code de vérification à',
    'verificarCorreo.sendButton': 'M\'envoyer le code',
    'verificarCorreo.sending': 'Envoi du code...',
    'verificarCorreo.backToRegistro': 'Retour à l\'inscription',
    'verificarCorreo.title': 'Vérifiez votre adresse e-mail',
    'verificarCorreo.subtitle': 'Entrez le code à 6 chiffres que nous avons envoyé à',
    'verificarCorreo.expired': 'Le code a expiré. Veuillez en demander un nouveau.',
    'verificarCorreo.expiresIn': 'Le code expire dans {{time}}',
    'verificarCorreo.submit': 'Vérifier le code',
    'verificarCorreo.verifying': 'Vérification...',
    'verificarCorreo.resendCountdown': 'Renvoyer dans {{seconds}}s',
    'verificarCorreo.resend': 'Renvoyer le code',
    'verificarCorreo.resending': 'Renvoi en cours...',
    'verificarCorreo.successTitle': 'E-mail vérifié avec succès !',
    'verificarCorreo.successSubtitle': 'Votre compte a été vérifié avec succès. Vous serez redirigé dans quelques secondes.'
  }
};
verificarCorreoKeys.br = verificarCorreoKeys.pt;

Object.keys(verificarCorreoKeys).forEach(lang => {
  if (!translations[lang]) translations[lang] = {};
  Object.assign(translations[lang], verificarCorreoKeys[lang]);
});

const verificar2FAKeys = {
  es: {
    'verificar2fa.title': 'Autenticación en dos pasos',
    'verificar2fa.subtitle': 'Ingresa el código de 6 dígitos enviado a tu dispositivo',
    'verificar2fa.panelTitle': 'Seguridad de dos factores (2FA)',
    'verificar2fa.panelSubtitle': 'Protege tu cuenta con verificación adicional cada vez que inicies sesión.',
    'verificar2fa.panelCheck1': 'Verificación instantánea',
    'verificar2fa.panelCheck2': 'Código seguro y dinámico',
    'verificar2fa.panelCheck3': 'Protección total de cuenta',
    'verificar2fa.backToLogin': 'Volver al inicio de sesión',
    'verificar2fa.submit': 'Verificar e ingresar',
    'verificar2fa.verifying': 'Verificando...',
    'verificar2fa.resend': 'Reenviar código',
    'verificar2fa.resending': 'Reenviando...',
    'verificar2fa.resendCountdown': 'Reenviar en {{seconds}}s',
    'verificarRecuperacion.title': 'Verificar código',
    'verificarRecuperacion.subtitle': 'Ingresa el código de 6 dígitos que enviamos a',
    'verificarRecuperacion.verifying': 'Verificando...',
    'verificarRecuperacion.submit': 'Verificar código',
    'verificarRecuperacion.resending': 'Reenviando...',
    'verificarRecuperacion.resendIn': 'Reenviar en {{seconds}}s',
    'verificarRecuperacion.resendCode': 'Reenviar código',
    'verificarRecuperacion.cancel': 'Cancelar'
  },
  en: {
    'verificar2fa.title': 'Two-Factor Authentication',
    'verificar2fa.subtitle': 'Enter the 6-digit code sent to your device',
    'verificar2fa.panelTitle': 'Two-Factor Security (2FA)',
    'verificar2fa.panelSubtitle': 'Protect your account with additional verification every time you log in.',
    'verificar2fa.panelCheck1': 'Instant verification',
    'verificar2fa.panelCheck2': 'Secure & dynamic code',
    'verificar2fa.panelCheck3': 'Total account protection',
    'verificar2fa.backToLogin': 'Back to login',
    'verificar2fa.submit': 'Verify & Enter',
    'verificar2fa.verifying': 'Verifying...',
    'verificar2fa.resend': 'Resend code',
    'verificar2fa.resending': 'Resending...',
    'verificar2fa.resendCountdown': 'Resend in {{seconds}}s',
    'verificarRecuperacion.title': 'Verify code',
    'verificarRecuperacion.subtitle': 'Enter the 6-digit code we sent to',
    'verificarRecuperacion.verifying': 'Verifying...',
    'verificarRecuperacion.submit': 'Verify code',
    'verificarRecuperacion.resending': 'Resending...',
    'verificarRecuperacion.resendIn': 'Resend in {{seconds}}s',
    'verificarRecuperacion.resendCode': 'Resend code',
    'verificarRecuperacion.cancel': 'Cancel'
  },
  pt: {
    'verificar2fa.title': 'Autenticação de dois fatores',
    'verificar2fa.subtitle': 'Insira o código de 6 dígitos enviado para seu dispositivo',
    'verificar2fa.panelTitle': 'Segurança de dois fatores (2FA)',
    'verificar2fa.panelSubtitle': 'Proteja sua conta com verificação adicional sempre que entrar.',
    'verificar2fa.panelCheck1': 'Verificação instantânea',
    'verificar2fa.panelCheck2': 'Código seguro e dinâmico',
    'verificar2fa.panelCheck3': 'Proteção total da conta',
    'verificar2fa.backToLogin': 'Voltar ao login',
    'verificar2fa.submit': 'Verificar e entrar',
    'verificar2fa.verifying': 'Verificando...',
    'verificar2fa.resend': 'Reenviar código',
    'verificar2fa.resending': 'Reenviando...',
    'verificar2fa.resendCountdown': 'Reenviar em {{seconds}}s',
    'verificarRecuperacion.title': 'Verificar código',
    'verificarRecuperacion.subtitle': 'Insira o código de 6 dígitos que enviamos para',
    'verificarRecuperacion.verifying': 'Verificando...',
    'verificarRecuperacion.submit': 'Verificar código',
    'verificarRecuperacion.resending': 'Reenviando...',
    'verificarRecuperacion.resendIn': 'Reenviar em {{seconds}}s',
    'verificarRecuperacion.resendCode': 'Reenviar código',
    'verificarRecuperacion.cancel': 'Cancelar'
  },
  fr: {
    'verificar2fa.title': 'Authentification à deux facteurs',
    'verificar2fa.subtitle': 'Entrez le code à 6 chiffres envoyé sur votre appareil',
    'verificar2fa.panelTitle': 'Sécurité à deux facteurs (2FA)',
    'verificar2fa.panelSubtitle': 'Protégez votre compte avec une vérification supplémentaire à chaque connexion.',
    'verificar2fa.panelCheck1': 'Vérification instantanée',
    'verificar2fa.panelCheck2': 'Code sécurisé et dynamique',
    'verificar2fa.panelCheck3': 'Protection totale du compte',
    'verificar2fa.backToLogin': 'Retour à la connexion',
    'verificar2fa.submit': 'Vérifier et entrer',
    'verificar2fa.verifying': 'Vérification...',
    'verificar2fa.resend': 'Renvoyer le code',
    'verificar2fa.resending': 'Renvoi en cours...',
    'verificar2fa.resendCountdown': 'Renvoyer dans {{seconds}}s',
    'verificarRecuperacion.title': 'Vérifier le code',
    'verificarRecuperacion.subtitle': 'Entrez le code à 6 chiffres envoyé à',
    'verificarRecuperacion.verifying': 'Vérification...',
    'verificarRecuperacion.submit': 'Vérifier le code',
    'verificarRecuperacion.resending': 'Renvoi en cours...',
    'verificarRecuperacion.resendIn': 'Renvoyer dans {{seconds}}s',
    'verificarRecuperacion.resendCode': 'Renvoyer le code',
    'verificarRecuperacion.cancel': 'Annuler'
  }
};
verificar2FAKeys.br = verificar2FAKeys.pt;

Object.keys(verificar2FAKeys).forEach(lang => {
  if (!translations[lang]) translations[lang] = {};
  Object.assign(translations[lang], verificar2FAKeys[lang]);
});

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
