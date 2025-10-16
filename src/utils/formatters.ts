/**
 * Format price with currency (Libyan Dinar)
 */
export const formatPrice = (price: number): string => {
  return `${price.toFixed(2)} د.ل`;
};

/**
 * Format date
 */
export const formatDate = (date: Date | string, locale = 'ar-SA'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Calculate discounted price
 */
export const calculateDiscountedPrice = (price: number, discountPercent?: number): number => {
  if (!discountPercent || discountPercent <= 0) return price;
  return price * (1 - discountPercent / 100);
};

/**
 * Format phone number (Libya)
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as: +218 XX XXX XXXX (Libya country code)
  if (cleaned.startsWith('218')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
};

