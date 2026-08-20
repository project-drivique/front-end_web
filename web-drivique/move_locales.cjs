const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'i18n', 'locales');
const locales = ['es', 'en', 'fr', 'pt', 'br'];

const keysToMove = [
  'errorPickupLocation',
  'errorPickupDate',
  'errorPickupTime',
  'errorReturnLocation',
  'errorReturnDate',
  'errorReturnTime',
  'errorDomicilioData',
  'errorProtectionPlan',
  'errorMileageType',
  'editDatesLocations',
  'yourProtectionExtras',
  'editAdditionalServices'
];

locales.forEach(lang => {
  const filePath = path.join(localesDir, lang + '.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.reservas) data.reservas = {};
    
    keysToMove.forEach(key => {
      if (data.vehiculo && data.vehiculo[key]) {
        data.reservas[key] = data.vehiculo[key];
        delete data.vehiculo[key];
      }
    });
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Moved keys in ' + lang + '.json');
  }
});

