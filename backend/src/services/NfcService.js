/**
 * Service NFC
 * Gère l'encodage des cartes NFC via le lecteur intégré de l'imprimante Luca 40 KM
 * Utilise la bibliothèque nfc-pcsc pour la communication avec les lecteurs PC/SC
 *
 * Type de carte principal: NTAG 216
 * - Mémoire: 888 bytes (924 bytes totale)
 * - Pages: 231 pages de 4 bytes
 * - UID: 7 bytes
 * - URL/Texte NDEF supporté
 * - Protection par mot de passe disponible
 */

let NFC;
try {
  NFC = require('nfc-pcsc').NFC;
} catch (error) {
  console.warn('⚠️ Module nfc-pcsc non disponible. Les fonctionnalités NFC seront simulées.');
  NFC = null;
}

// Constantes NTAG 216
const NTAG216_CONFIG = {
  nom: 'NTAG 216',
  memoire_totale: 924,      // bytes
  memoire_utilisable: 888,  // bytes
  pages_totales: 231,
  pages_utilisateur: 222,   // Pages 4-225 pour données utilisateur
  taille_page: 4,           // bytes par page
  uid_taille: 7,            // bytes
  page_debut_donnees: 4,    // Première page pour données utilisateur
  page_fin_donnees: 225,    // Dernière page pour données utilisateur
  page_config: 227,         // Page de configuration
  page_password: 229,       // Page mot de passe
  max_ndef_message: 868,    // Taille max message NDEF
};

class NfcService {
  constructor() {
    this.nfc = null;
    this.lecteurs = new Map();
    this.carteActuelle = null;
    this.estConnecte = false;
    this.config = NTAG216_CONFIG;

    // Initialiser si le module est disponible
    if (NFC) {
      this.initialiser();
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

        // Événement carte détectée
        reader.on('card', card => {
          console.log(`💳 Carte NTAG 216 détectée: ${card.uid}`);
          this.carteActuelle = {
            uid: card.uid,
            atr: card.atr,
            standard: card.standard,
            type: this.determinerTypeCarte(card.atr),
            lecteur: reader.name,
            capacite: this.config.memoire_utilisable
          };
        });

        // Événement carte retirée
        reader.on('card.off', card => {
          console.log(`💳 Carte retirée: ${card.uid}`);
          this.carteActuelle = null;
        });

        // Erreurs du lecteur
        reader.on('error', err => {
          console.error(`❌ Erreur lecteur ${reader.name}:`, err);
        });

        reader.on('end', () => {
          console.log(`📡 Lecteur déconnecté: ${reader.name}`);
          this.lecteurs.delete(reader.name);
        });
      });

      this.nfc.on('error', err => {
        console.error('❌ Erreur NFC:', err);
      });

      this.estConnecte = true;
      console.log('✅ Service NFC initialisé (NTAG 216)');

    } catch (error) {
      console.error('❌ Erreur initialisation NFC:', error);
      this.estConnecte = false;
    }
  }

  /**
   * Obtenir le statut du service NFC
   */
  async getStatus() {
    return {
      disponible: !!NFC,
      connecte: this.estConnecte,
      nombreLecteurs: this.lecteurs.size,
      cartePresente: !!this.carteActuelle,
      carteActuelle: this.carteActuelle,
      typeCarteSupportee: 'NTAG 216',
      capacite: this.config.memoire_utilisable + ' bytes'
    };
  }

  /**
   * Obtenir la liste des lecteurs
   */
  async getLecteurs() {
    const lecteursList = [];

    for (const [nom, lecteur] of this.lecteurs) {
      lecteursList.push({
        nom,
        connecte: true,
        typeCarteSupportee: 'NTAG 216'
      });
    }

    // Si aucun lecteur réel, simuler pour le développement
    if (lecteursList.length === 0) {
      lecteursList.push({
        nom: 'Luca 40 KM - NFC Reader (Simulé)',
        connecte: false,
        simule: true,
        typeCarteSupportee: 'NTAG 216'
      });
    }

    return lecteursList;
  }

  /**
   * Lire les données d'une carte NFC NTAG 216
   */
  async lireCarte(nomLecteur = null) {
    // Mode simulé si pas de module NFC
    if (!NFC || !this.carteActuelle) {
      const uid = this.genererUIDSimule();
      return {
        succes: true,
        simule: true,
        donnees: {
          uid: uid,
          type: 'NTAG_216',
          capacite: this.config.memoire_utilisable,
          donnees: {
            message: 'Mode simulation - Aucune donnée réelle'
          }
        }
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

      // Lire les pages de données NTAG 216 (pages 4-225)
      const donnees = await this.lirePages(lecteur, 4, 20); // Lire les 20 premières pages

      return {
        succes: true,
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
    if (!NFC || !this.carteActuelle) {
      const uid = this.genererUIDSimule();
      console.log('📡 [SIMULÉ] Encodage NTAG 216 avec données:', donnees);
      return {
        succes: true,
        simule: true,
        uid: uid,
        type: 'NTAG_216',
        message: 'Encodage simulé avec succès',
        tailleEcrite: JSON.stringify(donnees).length
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

      // Préparer les données NDEF pour NTAG 216
      const donneesNDEF = this.preparerDonneesNDEF(donnees);

      // Vérifier la taille
      if (donneesNDEF.length > this.config.max_ndef_message) {
        return {
          succes: false,
          erreur: `Données trop volumineuses (${donneesNDEF.length} bytes, max: ${this.config.max_ndef_message} bytes)`
        };
      }

      // Écrire sur la carte NTAG 216
      await this.ecrirePagesNTAG216(lecteur, donneesNDEF);

      console.log('✅ Encodage NTAG 216 réussi');

      return {
        succes: true,
        uid: this.carteActuelle.uid,
        type: 'NTAG_216',
        tailleEcrite: donneesNDEF.length
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
      // Commande READ pour NTAG (lit 4 pages à la fois = 16 bytes)
      const commande = Buffer.from([
        0xFF, // CLA
        0xB0, // INS - READ BINARY
        0x00, // P1
        page, // P2 - Numéro de page
        0x04  // Le - Nombre de bytes à lire (1 page = 4 bytes)
      ]);

      try {
        const response = await this.transmettreAPDU(lecteur, commande);
        donnees.push(...response.slice(0, 4));
      } catch (error) {
        console.error(`Erreur lecture page ${page}:`, error);
        break;
      }
    }

    return Buffer.from(donnees);
  }

  /**
   * Écrire des données sur NTAG 216
   */
  async ecrirePagesNTAG216(lecteur, donnees) {
    // Ajouter l'en-tête NDEF TLV
    const ndefTLV = Buffer.concat([
      Buffer.from([0x03]), // Type: NDEF Message
      Buffer.from([donnees.length]), // Length
      donnees,
      Buffer.from([0xFE]) // Terminator TLV
    ]);

    // Calculer le nombre de pages nécessaires
    const nombrePages = Math.ceil(ndefTLV.length / 4);

    // Écrire page par page à partir de la page 4
    for (let i = 0; i < nombrePages; i++) {
      const pageNum = this.config.page_debut_donnees + i;
      const offset = i * 4;
      const pageData = Buffer.alloc(4);

      // Copier les données pour cette page
      for (let j = 0; j < 4 && offset + j < ndefTLV.length; j++) {
        pageData[j] = ndefTLV[offset + j];
      }

      // Commande WRITE pour NTAG 216
      const commande = Buffer.from([
        0xFF, // CLA
        0xD6, // INS - UPDATE BINARY
        0x00, // P1
        pageNum, // P2 - Numéro de page
        0x04, // Lc - Longueur données
        ...pageData
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
        } else {
          // Vérifier le status word (90 00 = succès)
          if (response.length >= 2) {
            const sw1 = response[response.length - 2];
            const sw2 = response[response.length - 1];
            if (sw1 === 0x90 && sw2 === 0x00) {
              resolve(response.slice(0, -2));
            } else {
              reject(new Error(`Erreur APDU: ${sw1.toString(16).padStart(2, '0')} ${sw2.toString(16).padStart(2, '0')}`));
            }
          } else {
            reject(new Error('Réponse APDU invalide'));
          }
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

    // Format NDEF pour record texte (court)
    const langCodeBuffer = Buffer.from(langCode, 'utf8');
    const texteBuffer = Buffer.from(texte, 'utf8');
    const payloadLength = langCodeBuffer.length + texteBuffer.length + 1;

    // Record Header
    const header = Buffer.from([
      0xD1, // MB=1, ME=1, CF=0, SR=1, IL=0, TNF=001 (Well-Known)
      0x01, // Type Length = 1
      payloadLength, // Payload Length
      0x54, // Type = 'T' (Text)
      langCodeBuffer.length // Status byte (Language code length)
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
      // Chercher le TLV NDEF (type 0x03)
      let offset = 0;
      while (offset < donnees.length && donnees[offset] !== 0x03) {
        offset++;
      }

      if (offset >= donnees.length) {
        return { raw: donnees.toString('hex') };
      }

      // Lire la longueur du message NDEF
      offset++; // Skip type
      const length = donnees[offset];
      offset++; // Skip length

      if (offset + length > donnees.length) {
        return { raw: donnees.toString('hex') };
      }

      // Parser le record NDEF
      const header = donnees[offset];
      const typeLength = donnees[offset + 1];
      const payloadLength = donnees[offset + 2];

      if ((header & 0x07) === 0x01 && donnees[offset + 3] === 0x54) {
        // Record texte
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
    if (!NFC || !this.carteActuelle) {
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
        return {
          succes: false,
          erreur: 'Aucun lecteur disponible'
        };
      }

      // Écrire des pages vides + Terminator TLV
      const vide = Buffer.from([0x03, 0x00, 0xFE, 0x00]); // Empty NDEF + Terminator

      const commande = Buffer.from([
        0xFF, 0xD6, 0x00,
        this.config.page_debut_donnees,
        0x04,
        ...vide
      ]);

      await this.transmettreAPDU(lecteur, commande);

      console.log('🗑️ Carte NTAG 216 formatée');
      return {
        succes: true,
        message: 'Carte NTAG 216 formatée avec succès'
      };
    } catch (error) {
      return {
        succes: false,
        erreur: error.message
      };
    }
  }

  /**
   * Protéger la carte avec un mot de passe (NTAG 216)
   */
  async protegerCarte(motDePasse, nomLecteur = null) {
    if (!NFC || !this.carteActuelle) {
      return {
        succes: true,
        simule: true,
        message: 'Protection NTAG 216 simulée avec succès'
      };
    }

    if (motDePasse.length !== 4) {
      return {
        succes: false,
        erreur: 'Le mot de passe doit faire exactement 4 caractères'
      };
    }

    try {
      const lecteur = nomLecteur
        ? this.lecteurs.get(nomLecteur)
        : this.lecteurs.values().next().value;

      // Écrire le mot de passe sur la page 229
      const pwdBuffer = Buffer.from(motDePasse, 'utf8');
      const commande = Buffer.from([
        0xFF, 0xD6, 0x00,
        this.config.page_password,
        0x04,
        ...pwdBuffer
      ]);

      await this.transmettreAPDU(lecteur, commande);

      return {
        succes: true,
        message: 'Carte NTAG 216 protégée avec succès'
      };
    } catch (error) {
      return {
        succes: false,
        erreur: error.message
      };
    }
  }

  /**
   * Générer un UID simulé au format NTAG 216 (7 bytes)
   */
  genererUIDSimule() {
    const hex = '0123456789ABCDEF';
    let uid = '';
    for (let i = 0; i < 14; i++) {
      uid += hex[Math.floor(Math.random() * 16)];
    }
    return uid;
  }

  /**
   * Déterminer le type de carte depuis l'ATR
   */
  determinerTypeCarte(atr) {
    if (!atr) return 'INCONNU';

    const atrHex = atr.toString('hex').toUpperCase();

    // Patterns ATR pour NTAG
    if (atrHex.includes('0044')) return 'NTAG_216';
    if (atrHex.includes('0042')) return 'NTAG_215';
    if (atrHex.includes('003E')) return 'NTAG_213';
    if (atrHex.includes('0001')) return 'MIFARE_CLASSIC_1K';
    if (atrHex.includes('0002')) return 'MIFARE_CLASSIC_4K';
    if (atrHex.includes('0003')) return 'MIFARE_ULTRALIGHT';
    if (atrHex.includes('0004')) return 'MIFARE_DESFIRE';

    return 'ISO14443A';
  }

  /**
   * Obtenir les informations de la carte NTAG 216
   */
  getInfoCarte() {
    return {
      type: 'NTAG 216',
      fabricant: 'NXP Semiconductors',
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
      compatibilite: [
        'ISO/IEC 14443-3A',
        'NFC Forum Type 2 Tag'
      ]
    };
  }

  /**
   * Fermer le service
   */
  fermer() {
    if (this.nfc) {
      this.nfc.close();
    }
    this.lecteurs.clear();
    this.estConnecte = false;
  }
}

module.exports = new NfcService();
