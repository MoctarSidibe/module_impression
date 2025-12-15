/**
 * Service NFC - NTAG 216
 * Gère l'encodage des cartes NFC via le lecteur intégré de l'imprimante Luca 40 KM
 *
 * Type de carte supporté: NTAG 216
 * - Mémoire: 888 bytes (924 bytes totale)
 * - Pages: 231 pages de 4 bytes
 * - UID: 7 bytes
 * - URL/Texte NDEF supporté
 * - Protection par mot de passe disponible
 *
 * Mode simulation activé automatiquement si:
 * - Le module nfc-pcsc n'est pas installé
 * - Aucun lecteur NFC n'est détecté
 * - L'imprimante n'est pas connectée
 */

// Constantes NTAG 216
const NTAG216_CONFIG = {
  nom: 'NTAG 216',
  fabricant: 'NXP Semiconductors',
  memoire_totale: 924,
  memoire_utilisable: 888,
  pages_totales: 231,
  pages_utilisateur: 222,
  taille_page: 4,
  uid_taille: 7,
  page_debut_donnees: 4,
  page_fin_donnees: 225,
  page_config: 227,
  page_password: 229,
  max_ndef_message: 868,
};

// Tenter de charger nfc-pcsc (optionnel)
let NFC = null;
let nfcDisponible = false;
let nfcErreur = null;

try {
  NFC = require('nfc-pcsc').NFC;
  nfcDisponible = true;
  console.log('✅ Module nfc-pcsc chargé avec succès');
} catch (error) {
  nfcErreur = error.message;
  console.warn('⚠️ Module nfc-pcsc non disponible:', error.message);
  console.warn('📡 Mode simulation NFC activé - Les cartes NTAG 216 seront simulées');
}

class NfcService {
  constructor() {
    this.nfc = null;
    this.lecteurs = new Map();
    this.carteActuelle = null;
    this.estConnecte = false;
    this.modeSimulation = !nfcDisponible;
    this.config = NTAG216_CONFIG;
    this.erreurInitialisation = nfcErreur;

    // Initialiser si le module est disponible
    if (nfcDisponible && NFC) {
      this.initialiser();
    } else {
      console.log('📡 Service NFC en mode simulation (NTAG 216)');
    }
  }

  /**
   * Initialiser le service NFC
   */
  initialiser() {
    try {
      this.nfc = new NFC();

      this.nfc.on('reader', reader => {
        console.log(`📡 Lecteur NFC détecté: ${reader.name}`);
        this.lecteurs.set(reader.name, reader);
        this.modeSimulation = false;

        reader.on('card', card => {
          console.log(`💳 Carte NTAG 216 détectée: UID=${card.uid}`);
          this.carteActuelle = {
            uid: card.uid,
            atr: card.atr?.toString('hex') || '',
            standard: card.standard || 'ISO14443A',
            type: this.determinerTypeCarte(card.atr),
            lecteur: reader.name,
            capacite: this.config.memoire_utilisable,
            timestamp: new Date().toISOString()
          };
        });

        reader.on('card.off', card => {
          console.log(`💳 Carte retirée: ${card.uid}`);
          this.carteActuelle = null;
        });

        reader.on('error', err => {
          console.error(`❌ Erreur lecteur ${reader.name}:`, err.message);
        });

        reader.on('end', () => {
          console.log(`📡 Lecteur déconnecté: ${reader.name}`);
          this.lecteurs.delete(reader.name);
          if (this.lecteurs.size === 0) {
            this.modeSimulation = true;
          }
        });
      });

      this.nfc.on('error', err => {
        console.error('❌ Erreur NFC globale:', err.message);
        this.erreurInitialisation = err.message;
      });

      this.estConnecte = true;
      console.log('✅ Service NFC initialisé (NTAG 216)');

    } catch (error) {
      console.error('❌ Erreur initialisation NFC:', error.message);
      this.estConnecte = false;
      this.modeSimulation = true;
      this.erreurInitialisation = error.message;
    }
  }

  /**
   * Obtenir le statut du service NFC
   */
  async getStatus() {
    return {
      disponible: nfcDisponible,
      connecte: this.estConnecte,
      modeSimulation: this.modeSimulation,
      nombreLecteurs: this.lecteurs.size,
      cartePresente: !!this.carteActuelle,
      carteActuelle: this.carteActuelle,
      typeCarteSupportee: 'NTAG 216',
      capacite: `${this.config.memoire_utilisable} bytes`,
      erreur: this.erreurInitialisation,
      infoModule: {
        nom: 'nfc-pcsc',
        charge: nfcDisponible,
        erreur: nfcErreur
      }
    };
  }

  /**
   * Obtenir la liste des lecteurs
   */
  async getLecteurs() {
    const lecteursList = [];

    for (const [nom] of this.lecteurs) {
      lecteursList.push({
        nom,
        connecte: true,
        typeCarteSupportee: 'NTAG 216',
        simule: false
      });
    }

    // Toujours retourner un lecteur simulé si aucun réel
    if (lecteursList.length === 0) {
      lecteursList.push({
        nom: 'Luca 40 KM - Lecteur NFC Intégré (Simulation)',
        connecte: true,
        typeCarteSupportee: 'NTAG 216',
        simule: true,
        message: 'Mode simulation actif - Connectez l\'imprimante pour utiliser le vrai lecteur'
      });
    }

    return lecteursList;
  }

  /**
   * Lire les données d'une carte NFC NTAG 216
   */
  async lireCarte(nomLecteur = null) {
    // Mode simulé
    if (this.modeSimulation || !this.carteActuelle) {
      const uid = this.genererUIDSimule();
      return {
        succes: true,
        simule: true,
        donnees: {
          uid: uid,
          type: 'NTAG_216',
          capacite: this.config.memoire_utilisable,
          pagesLibres: this.config.pages_utilisateur,
          donnees: {
            message: 'Carte NTAG 216 simulée',
            timestamp: new Date().toISOString()
          }
        },
        message: 'Lecture simulée - Aucun lecteur NFC connecté'
      };
    }

    try {
      const lecteur = nomLecteur
        ? this.lecteurs.get(nomLecteur)
        : this.lecteurs.values().next().value;

      if (!lecteur) {
        return {
          succes: false,
          erreur: 'Aucun lecteur disponible'
        };
      }

      const donnees = await this.lirePages(lecteur, 4, 20);

      return {
        succes: true,
        simule: false,
        donnees: {
          uid: this.carteActuelle.uid,
          type: 'NTAG_216',
          capacite: this.config.memoire_utilisable,
          atr: this.carteActuelle.atr,
          donnees: this.parseNDEF(donnees)
        }
      };

    } catch (error) {
      return {
        succes: false,
        erreur: error.message
      };
    }
  }

  /**
   * Encoder des données sur une carte NFC NTAG 216
   */
  async encoderCarte(donnees, nomLecteur = null) {
    // Mode simulé
    if (this.modeSimulation || !this.carteActuelle) {
      const uid = this.genererUIDSimule();
      const taille = JSON.stringify(donnees).length;

      console.log(`📡 [SIMULATION] Encodage NTAG 216:`);
      console.log(`   UID: ${uid}`);
      console.log(`   Données: ${taille} bytes`);
      console.log(`   Contenu:`, donnees);

      return {
        succes: true,
        simule: true,
        uid: uid,
        type: 'NTAG_216',
        tailleEcrite: taille,
        capaciteRestante: this.config.memoire_utilisable - taille,
        message: 'Encodage simulé avec succès - Connectez un lecteur NFC pour encoder réellement'
      };
    }

    try {
      const lecteur = nomLecteur
        ? this.lecteurs.get(nomLecteur)
        : this.lecteurs.values().next().value;

      if (!lecteur) {
        return {
          succes: false,
          erreur: 'Aucun lecteur disponible'
        };
      }

      const donneesNDEF = this.preparerDonneesNDEF(donnees);

      if (donneesNDEF.length > this.config.max_ndef_message) {
        return {
          succes: false,
          erreur: `Données trop volumineuses (${donneesNDEF.length} bytes, max: ${this.config.max_ndef_message} bytes)`
        };
      }

      await this.ecrirePagesNTAG216(lecteur, donneesNDEF);

      console.log('✅ Encodage NTAG 216 réussi');

      return {
        succes: true,
        simule: false,
        uid: this.carteActuelle.uid,
        type: 'NTAG_216',
        tailleEcrite: donneesNDEF.length,
        capaciteRestante: this.config.memoire_utilisable - donneesNDEF.length
      };

    } catch (error) {
      console.error('❌ Erreur encodage NFC:', error);
      return {
        succes: false,
        erreur: error.message
      };
    }
  }

  /**
   * Lire des pages de la carte NTAG 216
   */
  async lirePages(lecteur, pageDebut, nombrePages) {
    const donnees = [];

    for (let page = pageDebut; page < pageDebut + nombrePages; page++) {
      const commande = Buffer.from([
        0xFF, 0xB0, 0x00, page, 0x04
      ]);

      try {
        const response = await this.transmettreAPDU(lecteur, commande);
        donnees.push(...response.slice(0, 4));
      } catch (error) {
        console.error(`Erreur lecture page ${page}:`, error.message);
        break;
      }
    }

    return Buffer.from(donnees);
  }

  /**
   * Écrire des données sur NTAG 216
   */
  async ecrirePagesNTAG216(lecteur, donnees) {
    const ndefTLV = Buffer.concat([
      Buffer.from([0x03, donnees.length]),
      donnees,
      Buffer.from([0xFE])
    ]);

    const nombrePages = Math.ceil(ndefTLV.length / 4);

    for (let i = 0; i < nombrePages; i++) {
      const pageNum = this.config.page_debut_donnees + i;
      const offset = i * 4;
      const pageData = Buffer.alloc(4);

      for (let j = 0; j < 4 && offset + j < ndefTLV.length; j++) {
        pageData[j] = ndefTLV[offset + j];
      }

      const commande = Buffer.from([
        0xFF, 0xD6, 0x00, pageNum, 0x04, ...pageData
      ]);

      await this.transmettreAPDU(lecteur, commande);
    }
  }

  /**
   * Transmettre une commande APDU
   */
  transmettreAPDU(lecteur, commande) {
    return new Promise((resolve, reject) => {
      lecteur.transmit(commande, 255, (err, response) => {
        if (err) {
          reject(err);
        } else if (response.length >= 2) {
          const sw1 = response[response.length - 2];
          const sw2 = response[response.length - 1];
          if (sw1 === 0x90 && sw2 === 0x00) {
            resolve(response.slice(0, -2));
          } else {
            reject(new Error(`APDU Error: ${sw1.toString(16).padStart(2, '0')}${sw2.toString(16).padStart(2, '0')}`));
          }
        } else {
          reject(new Error('Réponse APDU invalide'));
        }
      });
    });
  }

  /**
   * Préparer les données au format NDEF pour NTAG 216
   */
  preparerDonneesNDEF(donnees) {
    const texte = typeof donnees === 'string' ? donnees : JSON.stringify(donnees);
    const langCode = 'fr';
    const langCodeBuffer = Buffer.from(langCode, 'utf8');
    const texteBuffer = Buffer.from(texte, 'utf8');
    const payloadLength = langCodeBuffer.length + texteBuffer.length + 1;

    const header = Buffer.from([
      0xD1, 0x01, payloadLength, 0x54, langCodeBuffer.length
    ]);

    return Buffer.concat([header, langCodeBuffer, texteBuffer]);
  }

  /**
   * Parser les données NDEF
   */
  parseNDEF(donnees) {
    if (!donnees || donnees.length < 5) {
      return { raw: donnees?.toString('hex') || '' };
    }

    try {
      let offset = 0;
      while (offset < donnees.length && donnees[offset] !== 0x03) {
        offset++;
      }

      if (offset >= donnees.length) {
        return { raw: donnees.toString('hex') };
      }

      offset++;
      const length = donnees[offset];
      offset++;

      if (offset + length > donnees.length) {
        return { raw: donnees.toString('hex') };
      }

      const header = donnees[offset];
      if ((header & 0x07) === 0x01 && donnees[offset + 3] === 0x54) {
        const payloadLength = donnees[offset + 2];
        const langLength = donnees[offset + 4] & 0x3F;
        const textStart = offset + 5 + langLength;
        const texte = donnees.slice(textStart, textStart + payloadLength - langLength - 1).toString('utf8');

        try {
          return JSON.parse(texte);
        } catch {
          return { texte };
        }
      }

      return { raw: donnees.toString('hex') };
    } catch (error) {
      return { raw: donnees.toString('hex'), erreur: error.message };
    }
  }

  /**
   * Formater une carte NFC NTAG 216
   */
  async formaterCarte(nomLecteur = null) {
    if (this.modeSimulation || !this.carteActuelle) {
      return {
        succes: true,
        simule: true,
        message: 'Formatage NTAG 216 simulé avec succès'
      };
    }

    try {
      const lecteur = nomLecteur
        ? this.lecteurs.get(nomLecteur)
        : this.lecteurs.values().next().value;

      if (!lecteur) {
        return { succes: false, erreur: 'Aucun lecteur disponible' };
      }

      const vide = Buffer.from([0x03, 0x00, 0xFE, 0x00]);
      const commande = Buffer.from([
        0xFF, 0xD6, 0x00, this.config.page_debut_donnees, 0x04, ...vide
      ]);

      await this.transmettreAPDU(lecteur, commande);

      return {
        succes: true,
        simule: false,
        message: 'Carte NTAG 216 formatée avec succès'
      };
    } catch (error) {
      return { succes: false, erreur: error.message };
    }
  }

  /**
   * Générer un UID simulé au format NTAG 216 (7 bytes = 14 hex chars)
   */
  genererUIDSimule() {
    const hex = '0123456789ABCDEF';
    // NTAG 216 UID format: 04:XX:XX:XX:XX:XX:XX (starts with 04 for NXP)
    let uid = '04';
    for (let i = 0; i < 12; i++) {
      uid += hex[Math.floor(Math.random() * 16)];
    }
    return uid;
  }

  /**
   * Déterminer le type de carte depuis l'ATR
   */
  determinerTypeCarte(atr) {
    if (!atr) return 'NTAG_216';
    const atrHex = (typeof atr === 'string' ? atr : atr.toString('hex')).toUpperCase();

    if (atrHex.includes('0044')) return 'NTAG_216';
    if (atrHex.includes('0042')) return 'NTAG_215';
    if (atrHex.includes('003E')) return 'NTAG_213';
    if (atrHex.includes('0001')) return 'MIFARE_CLASSIC_1K';
    if (atrHex.includes('0002')) return 'MIFARE_CLASSIC_4K';
    if (atrHex.includes('0003')) return 'MIFARE_ULTRALIGHT';
    if (atrHex.includes('0004')) return 'MIFARE_DESFIRE';

    return 'NTAG_216'; // Default pour notre cas d'usage
  }

  /**
   * Obtenir les informations de la carte NTAG 216
   */
  getInfoCarte() {
    return {
      type: this.config.nom,
      fabricant: this.config.fabricant,
      memoire: {
        totale: `${this.config.memoire_totale} bytes`,
        utilisable: `${this.config.memoire_utilisable} bytes`,
        pages: this.config.pages_totales
      },
      uid: {
        taille: `${this.config.uid_taille} bytes`,
        unique: true
      },
      securite: {
        protection_mot_de_passe: true,
        compteur_lectures: true
      },
      compatibilite: ['ISO/IEC 14443-3A', 'NFC Forum Type 2 Tag'],
      modeActuel: this.modeSimulation ? 'Simulation' : 'Réel'
    };
  }

  /**
   * Fermer le service
   */
  fermer() {
    if (this.nfc) {
      try {
        this.nfc.close();
      } catch (e) {
        // Ignorer les erreurs de fermeture
      }
    }
    this.lecteurs.clear();
    this.estConnecte = false;
    this.carteActuelle = null;
  }
}

// Exporter une instance singleton
module.exports = new NfcService();
