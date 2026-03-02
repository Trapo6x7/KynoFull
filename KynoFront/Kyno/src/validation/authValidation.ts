// ─── Moteur de validation générique (OCP) ────────────────────────────────────
// Ajouter une règle = ajouter un objet dans le tableau, pas modifier les screens.

export interface ValidationRule<T> {
  test: (value: T) => boolean;
  message: string;
}

/**
 * Applique les règles dans l'ordre et retourne le premier message d'erreur,
 * ou `null` si toutes les règles passent.
 */
export const validate = <T>(value: T, rules: ValidationRule<T>[]): string | null => {
  for (const rule of rules) {
    if (!rule.test(value)) return rule.message;
  }
  return null;
};

/**
 * Valide plusieurs champs et retourne un objet d'erreurs (clé → message).
 * Retourne `null` si tout est valide.
 */
export const validateFields = <K extends string>(
  fields: Record<K, { value: unknown; rules: ValidationRule<unknown>[] }>
): Partial<Record<K, string>> | null => {
  const errors: Partial<Record<K, string>> = {};
  let hasError = false;

  (Object.keys(fields) as K[]).forEach((key) => {
    const { value, rules } = fields[key];
    const error = validate(value, rules);
    if (error) {
      errors[key] = error;
      hasError = true;
    }
  });

  return hasError ? errors : null;
};

// ─── Règles email ─────────────────────────────────────────────────────────────
export const emailRules: ValidationRule<string>[] = [
  { test: (v) => !!v.trim(), message: "L'email est requis" },
  { test: (v) => /\S+@\S+\.\S+/.test(v), message: 'Email invalide' },
];

// ─── Règles mot de passe ──────────────────────────────────────────────────────
export const passwordRules: ValidationRule<string>[] = [
  { test: (v) => !!v, message: 'Le mot de passe est requis' },
  { test: (v) => v.length >= 8, message: 'Le mot de passe doit contenir au moins 8 caractères' },
];

/** Règles allégées pour le champ login (pas de longueur min) */
export const passwordLoginRules: ValidationRule<string>[] = [
  { test: (v) => !!v, message: 'Le mot de passe est requis' },
];

// ─── Règles prénom ────────────────────────────────────────────────────────────
export const firstNameRules: ValidationRule<string>[] = [
  { test: (v) => !!v.trim(), message: 'Le prénom est requis' },
];

// ─── Règle confirmPassword ────────────────────────────────────────────────────
export const makeConfirmPasswordRule = (password: string): ValidationRule<string> => ({
  test: (v) => v === password,
  message: 'Les mots de passe ne correspondent pas',
});

// ─── Règles age ───────────────────────────────────────────────────────────────
export const birthdateRules: ValidationRule<Date | null>[] = [
  { test: (v) => v !== null, message: 'La date de naissance est requise' },
  {
    test: (v) => {
      if (!v) return false;
      return new Date().getFullYear() - v.getFullYear() >= 18;
    },
    message: 'Vous devez avoir au moins 18 ans',
  },
];
