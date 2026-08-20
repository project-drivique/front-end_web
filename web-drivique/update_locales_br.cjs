const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'i18n', 'locales', 'br.json');
if (fs.existsSync(filePath)) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!data.vehiculo) data.vehiculo = {};
  Object.assign(data.vehiculo, {
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
  });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Updated br.json');
}

