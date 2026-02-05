import api from './api';

interface WelcomeEmailData {
  email: string;
  firstName: string;
}

class EmailService {
  /**
   * Envoie un email de vérification après l'inscription
   * TODO: Configurer le SMTP sur le backend
   */
  async sendVerificationEmail(email: string): Promise<void> {
    try {
      await api.post('/api/emails/verify', { email });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
      throw error;
    }
  }

  /**
   * Renvoie un email de vérification
   */
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      await api.post('/api/emails/resend-verification', { email });
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email de vérification:', error);
      throw error;
    }
  }

  /**
   * Vérifie le code de vérification
   */
  async verifyCode(email: string, code: string): Promise<void> {
    try {
      await api.post('/api/emails/verify-code', { email, code });
    } catch (error) {
      console.error('Erreur lors de la vérification du code:', error);
      throw error;
    }
  }

  /**
   * Envoie un email de bienvenue après vérification
   * TODO: Configurer le SMTP sur le backend
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    try {
      await api.post('/emails/welcome', data);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
      // Ne pas bloquer si l'email échoue
    }
  }
}

export default new EmailService();
