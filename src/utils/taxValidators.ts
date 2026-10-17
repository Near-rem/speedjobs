/**
 * Utilitários de validação e formatação fiscal brasileira (CNPJ / MEI)
 * em conformidade com as regras da Receita Federal do Brasil.
 */

/**
 * Remove qualquer caractere que não seja dígito
 */
export function cleanDigits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

/**
 * Aplica máscara de CNPJ ou MEI: 00.000.000/0000-00
 */
export function formatCnpj(value: string): string {
  const digits = cleanDigits(value).slice(0, 14);
  if (!digits) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Validação rigorosa dos 14 dígitos do CNPJ / MEI com cálculo dos dígitos verificadores (módulo 11)
 */
export function isValidCnpj(value: string): boolean {
  const digits = cleanDigits(value);
  if (digits.length !== 14) return false;

  // Rejeita sequências de números repetidos (ex: 00000000000000, 11111111111111)
  if (/^(\d)\1+$/.test(digits)) return false;

  // Validação do primeiro dígito verificador
  let length = digits.length - 2;
  let numbers = digits.substring(0, length);
  const checkDigits = digits.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(checkDigits.charAt(0))) return false;

  // Validação do segundo dígito verificador
  length = length + 1;
  numbers = digits.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(checkDigits.charAt(1))) return false;

  return true;
}

/**
 * Formata CEP: 00000-000
 */
export function formatCep(value: string): string {
  const digits = cleanDigits(value).slice(0, 8);
  if (!digits) return '';
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

/**
 * Formata Telefone ou Celular: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatPhone(value: string): string {
  const digits = cleanDigits(value).slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Verifica se a empresa está aberta no momento com base no horário e dias
 */
export function isCompanyOpenNow(days: string[], openTime: string, closeTime: string): { isOpen: boolean; statusText: string } {
  if (!days || days.length === 0 || !openTime || !closeTime) {
    return { isOpen: false, statusText: 'Horários não definidos' };
  }

  const dayMap: { [key: number]: string } = {
    0: 'Domingo',
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado',
  };

  const now = new Date();
  const currentDayName = dayMap[now.getDay()];

  // Verifica se abre no dia de hoje
  const opensToday = days.some((d) => d.toLowerCase().startsWith(currentDayName.toLowerCase().slice(0, 3)));
  if (!opensToday) {
    return { isOpen: false, statusText: `Fechado hoje (${currentDayName})` };
  }

  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openHour * 60 + (openMin || 0);
  const closeMinutes = closeHour * 60 + (closeMin || 0);

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return { isOpen: true, statusText: `Aberto agora • Fecha às ${closeTime}` };
  } else if (currentMinutes < openMinutes) {
    return { isOpen: false, statusText: `Fechado • Abre hoje às ${openTime}` };
  } else {
    return { isOpen: false, statusText: `Fechado • Fechou às ${closeTime}` };
  }
}

export const BRAZIL_STATES: string[] = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const WEEK_DAYS: string[] = [
  'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'
];
