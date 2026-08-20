const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'i18n', 'locales');
const locales = ['es', 'en', 'fr', 'pt', 'zh'];

const translations = {
  es: {
    errorPickupLocation: 'Debes seleccionar el lugar de retiro.',
    errorPickupDate: 'Debes seleccionar la fecha de inicio.',
    errorPickupTime: 'Debes seleccionar la hora de retiro.',
    errorReturnLocation: 'Debes seleccionar el lugar de devolución.',
    errorReturnDate: 'Debes seleccionar la fecha de devolución.',
    errorReturnTime: 'Debes seleccionar la hora de devolución.',
    errorDomicilioData: 'Debes completar los datos del domicilio.',
    errorProtectionPlan: 'Debes seleccionar un plan de protección.',
    errorMileageType: 'Debes seleccionar el tipo de kilometraje.',
    editDatesLocations: 'Editar Fechas y Lugares',
    yourProtectionExtras: 'Tu Protección y Extras',
    editAdditionalServices: 'Editar Servicios Adicionales'
  },
  en: {
    errorPickupLocation: 'You must select a pickup location.',
    errorPickupDate: 'You must select a pickup date.',
    errorPickupTime: 'You must select a pickup time.',
    errorReturnLocation: 'You must select a return location.',
    errorReturnDate: 'You must select a return date.',
    errorReturnTime: 'You must select a return time.',
    errorDomicilioData: 'You must complete the home delivery address details.',
    errorProtectionPlan: 'You must select a protection plan.',
    errorMileageType: 'You must select a mileage type.',
    editDatesLocations: 'Edit Dates and Locations',
    yourProtectionExtras: 'Your Protection and Extras',
    editAdditionalServices: 'Edit Additional Services'
  },
  fr: {
    errorPickupLocation: 'Vous devez sélectionner un lieu de retrait.',
    errorPickupDate: 'Vous devez sélectionner une date de retrait.',
    errorPickupTime: 'Vous devez sélectionner une heure de retrait.',
    errorReturnLocation: 'Vous devez sélectionner un lieu de restitution.',
    errorReturnDate: 'Vous devez sélectionner une date de restitution.',
    errorReturnTime: 'Vous devez sélectionner une heure de restitution.',
    errorDomicilioData: 'Vous devez compléter les détails de l\'adresse de livraison.',
    errorProtectionPlan: 'Vous devez sélectionner un plan de protection.',
    errorMileageType: 'Vous devez sélectionner un type de kilométrage.',
    editDatesLocations: 'Modifier les dates et lieux',
    yourProtectionExtras: 'Votre protection et vos options',
    editAdditionalServices: 'Modifier les services supplémentaires'
  },
  pt: {
    errorPickupLocation: 'Você deve selecionar um local de retirada.',
    errorPickupDate: 'Você deve selecionar uma data de retirada.',
    errorPickupTime: 'Você deve selecionar um horário de retirada.',
    errorReturnLocation: 'Você deve selecionar um local de devolução.',
    errorReturnDate: 'Você deve selecionar uma data de devolução.',
    errorReturnTime: 'Você deve selecionar um horário de devolução.',
    errorDomicilioData: 'Você deve completar os dados do endereço de entrega.',
    errorProtectionPlan: 'Você deve selecionar um plano de proteção.',
    errorMileageType: 'Você deve selecionar um tipo de quilometragem.',
    editDatesLocations: 'Editar Datas e Locais',
    yourProtectionExtras: 'Sua Proteção e Extras',
    editAdditionalServices: 'Editar Serviços Adicionais'
  },
  zh: {
    errorPickupLocation: '????????????',
    errorPickupDate: '????????????',
    errorPickupTime: '????????????',
    errorReturnLocation: '????????????',
    errorReturnDate: '????????????',
    errorReturnTime: '????????????',
    errorDomicilioData: '???????????????',
    errorProtectionPlan: '????????????',
    errorMileageType: '????????????',
    editDatesLocations: '???????',
    yourProtectionExtras: '?????????',
    editAdditionalServices: '??????'
  }
};

locales.forEach(lang => {
  const filePath = path.join(localesDir, lang + '.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.vehiculo) data.vehiculo = {};
    Object.assign(data.vehiculo, translations[lang]);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Updated ' + lang + '.json');
  }
});

