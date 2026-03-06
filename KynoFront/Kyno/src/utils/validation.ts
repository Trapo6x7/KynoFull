/**
 * Valide une adresse email
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valide un mot de passe (min 8 caractères)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Valide un numéro de téléphone français
 */
export function isValidPhone(phone: string): boolean {
  const regex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return regex.test(phone);
}

/**
 * Vérifie si une chaîne est vide ou ne contient que des espaces
 */
export function isEmpty(str?: string | null): boolean {
  return !str || str.trim().length === 0;
}
