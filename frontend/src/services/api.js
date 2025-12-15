/**
 * Service API
 * Gestion des appels HTTP vers le backend
 */

import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erreur API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============== UTILISATEURS ==============

export const utilisateursApi = {
  /**
   * Récupérer tous les utilisateurs
   */
  getAll: async () => {
    const response = await api.get('/utilisateurs');
    return response.data;
  },

  /**
   * Récupérer un utilisateur par ID
   */
  getById: async (id) => {
    const response = await api.get(`/utilisateurs/${id}`);
    return response.data;
  },

  /**
   * Rechercher des utilisateurs
   */
  rechercher: async (terme) => {
    const response = await api.get('/utilisateurs/recherche', {
      params: { q: terme },
    });
    return response.data;
  },

  /**
   * Créer un utilisateur
   */
  creer: async (donnees) => {
    const response = await api.post('/utilisateurs', donnees);
    return response.data;
  },

  /**
   * Mettre à jour un utilisateur
   */
  mettreAJour: async (id, donnees) => {
    const response = await api.put(`/utilisateurs/${id}`, donnees);
    return response.data;
  },

  /**
   * Uploader une photo
   */
  uploaderPhoto: async (id, fichier) => {
    const formData = new FormData();
    formData.append('photo', fichier);
    const response = await api.post(`/utilisateurs/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Supprimer un utilisateur
   */
  supprimer: async (id) => {
    const response = await api.delete(`/utilisateurs/${id}`);
    return response.data;
  },
};

// ============== TEMPLATES ==============

export const templatesApi = {
  /**
   * Récupérer tous les templates
   */
  getAll: async () => {
    const response = await api.get('/templates');
    return response.data;
  },

  /**
   * Récupérer les types de templates
   */
  getTypes: async () => {
    const response = await api.get('/templates/types');
    return response.data;
  },

  /**
   * Récupérer un template par ID
   */
  getById: async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  /**
   * Créer un template
   */
  creer: async (donnees) => {
    const response = await api.post('/templates', donnees);
    return response.data;
  },

  /**
   * Mettre à jour un template
   */
  mettreAJour: async (id, donnees) => {
    const response = await api.put(`/templates/${id}`, donnees);
    return response.data;
  },

  /**
   * Dupliquer un template
   */
  dupliquer: async (id) => {
    const response = await api.post(`/templates/${id}/dupliquer`);
    return response.data;
  },

  /**
   * Générer un aperçu
   */
  apercu: async (id, donnees) => {
    const response = await api.post(`/templates/${id}/apercu`, { donnees });
    return response.data;
  },

  /**
   * Supprimer un template
   */
  supprimer: async (id) => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  },
};

// ============== IMPRESSION ==============

export const impressionApi = {
  /**
   * Récupérer l'historique des impressions
   */
  getHistorique: async (limite = 100) => {
    const response = await api.get('/impression', { params: { limite } });
    return response.data;
  },

  /**
   * Récupérer les statistiques
   */
  getStatistiques: async () => {
    const response = await api.get('/impression/statistiques');
    return response.data;
  },

  /**
   * Lancer une impression
   */
  imprimer: async (donnees) => {
    const response = await api.post('/impression', donnees);
    return response.data;
  },

  /**
   * Générer un aperçu PDF
   */
  apercu: async (utilisateurId, templateId) => {
    const response = await api.post('/impression/apercu', {
      utilisateur_id: utilisateurId,
      template_id: templateId,
    });
    return response.data;
  },

  /**
   * Réimprimer
   */
  reimprimer: async (id) => {
    const response = await api.post(`/impression/${id}/reimprimer`);
    return response.data;
  },
};

// ============== NFC ==============

export const nfcApi = {
  /**
   * Récupérer le statut NFC
   */
  getStatus: async () => {
    const response = await api.get('/nfc/status');
    return response.data;
  },

  /**
   * Récupérer les lecteurs
   */
  getLecteurs: async () => {
    const response = await api.get('/nfc/lecteurs');
    return response.data;
  },

  /**
   * Récupérer les types supportés
   */
  getTypesSupportes: async () => {
    const response = await api.get('/nfc/types-supportes');
    return response.data;
  },

  /**
   * Récupérer les infos de la carte NTAG 216
   */
  getInfoCarte: async () => {
    const response = await api.get('/nfc/info-carte');
    return response.data;
  },

  /**
   * Lire une carte
   */
  lire: async (lecteur) => {
    const response = await api.post('/nfc/lire', { lecteur });
    return response.data;
  },

  /**
   * Écrire sur une carte
   */
  ecrire: async (donnees, lecteur) => {
    const response = await api.post('/nfc/ecrire', { donnees, lecteur });
    return response.data;
  },

  /**
   * Formater une carte
   */
  formater: async (lecteur) => {
    const response = await api.post('/nfc/formater', { lecteur });
    return response.data;
  },
};

// ============== IMPRIMANTE ==============

export const imprimanteApi = {
  /**
   * Récupérer le statut de l'imprimante
   */
  getStatus: async () => {
    const response = await api.get('/imprimante/status');
    return response.data;
  },

  /**
   * Récupérer la liste des imprimantes
   */
  getListe: async () => {
    const response = await api.get('/imprimante/liste');
    return response.data;
  },

  /**
   * Scanner les imprimantes disponibles
   */
  scanner: async () => {
    const response = await api.get('/imprimante/scanner');
    return response.data;
  },

  /**
   * Sélectionner une imprimante
   */
  selectionner: async (nom) => {
    const response = await api.post('/imprimante/selectionner', { nom });
    return response.data;
  },

  /**
   * Vérifier si l'imprimante est prête
   */
  estPrete: async () => {
    const response = await api.get('/imprimante/prete');
    return response.data;
  },

  /**
   * Récupérer la configuration de l'imprimante
   */
  getConfig: async () => {
    const response = await api.get('/imprimante/config');
    return response.data;
  },
};

// ============== SANTÉ ==============

export const santeApi = {
  /**
   * Vérifier l'état du serveur
   */
  verifier: async () => {
    const response = await api.get('/sante');
    return response.data;
  },
};

export default api;
