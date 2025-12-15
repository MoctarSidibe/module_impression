/**
 * Service de Détection d'Imprimante
 * Gère la détection et le statut de l'imprimante Luca 40 KM Retransfer
 */

const { exec } = require('child_process');
const os = require('os');

// Configuration de l'imprimante Luca 40 KM
const PRINTER_CONFIG = {
  nom: 'Luca 40 KM Retransfer',
  nomRecherche: ['Luca', 'LUCA', '40 KM', '40KM', 'Retransfer'],
  fabricant: 'Luca Technology',
  type: 'Retransfer Film',
  format_carte: 'CR80',
  dimensions: {
    largeur_mm: 85.6,
    hauteur_mm: 53.98
  },
  resolution_dpi: 300,
  nfc_supporte: true,
  nfc_type: 'NTAG 216'
};

class PrinterService {
  constructor() {
    this.imprimantes = [];
    this.imprimanteSelectionnee = null;
    this.modeSimulation = true;
    this.derniereScan = null;
    this.erreur = null;

    // Scan initial au démarrage
    this.scannerImprimantes();
  }

  /**
   * Scanner les imprimantes disponibles sur le système
   */
  async scannerImprimantes() {
    return new Promise((resolve) => {
      const platform = os.platform();
      let commande;

      if (platform === 'win32') {
        // Windows: utiliser PowerShell pour lister les imprimantes
        commande = 'powershell "Get-Printer | Select-Object Name, DriverName, PortName, PrinterStatus | ConvertTo-Json"';
      } else if (platform === 'darwin') {
        // macOS: utiliser lpstat
        commande = 'lpstat -p -d 2>/dev/null || echo "[]"';
      } else {
        // Linux: utiliser lpstat
        commande = 'lpstat -p 2>/dev/null || echo "[]"';
      }

      exec(commande, { timeout: 10000 }, (error, stdout, stderr) => {
        this.derniereScan = new Date().toISOString();

        if (error) {
          console.warn('⚠️ Impossible de scanner les imprimantes:', error.message);
          this.erreur = error.message;
          this.imprimantes = [];
          this.modeSimulation = true;
          resolve(this.getImprimantesAvecSimulation());
          return;
        }

        try {
          this.imprimantes = this.parseImprimantes(stdout, platform);
          this.detecterLuca40KM();
          resolve(this.getImprimantesAvecSimulation());
        } catch (parseError) {
          console.warn('⚠️ Erreur parsing imprimantes:', parseError.message);
          this.erreur = parseError.message;
          this.imprimantes = [];
          this.modeSimulation = true;
          resolve(this.getImprimantesAvecSimulation());
        }
      });
    });
  }

  /**
   * Parser la sortie des commandes selon la plateforme
   */
  parseImprimantes(stdout, platform) {
    const imprimantes = [];

    if (platform === 'win32') {
      try {
        const data = JSON.parse(stdout);
        const liste = Array.isArray(data) ? data : [data];

        for (const imp of liste) {
          if (imp && imp.Name) {
            imprimantes.push({
              nom: imp.Name,
              driver: imp.DriverName || 'Inconnu',
              port: imp.PortName || 'Inconnu',
              statut: this.parseStatutWindows(imp.PrinterStatus),
              estLuca: this.estLuca40KM(imp.Name),
              plateforme: 'Windows'
            });
          }
        }
      } catch (e) {
        // Si JSON échoue, parser comme texte
        const lignes = stdout.split('\n').filter(l => l.trim());
        for (const ligne of lignes) {
          if (ligne.trim()) {
            imprimantes.push({
              nom: ligne.trim(),
              driver: 'Inconnu',
              port: 'Inconnu',
              statut: 'Inconnu',
              estLuca: this.estLuca40KM(ligne),
              plateforme: 'Windows'
            });
          }
        }
      }
    } else {
      // macOS/Linux: parser lpstat
      const lignes = stdout.split('\n');
      for (const ligne of lignes) {
        const match = ligne.match(/printer\s+(\S+)/i) || ligne.match(/^(\S+)\s/);
        if (match) {
          const nom = match[1];
          imprimantes.push({
            nom: nom,
            driver: 'CUPS',
            port: 'USB/Network',
            statut: ligne.includes('idle') ? 'Prête' : ligne.includes('disabled') ? 'Désactivée' : 'Inconnue',
            estLuca: this.estLuca40KM(nom),
            plateforme: platform === 'darwin' ? 'macOS' : 'Linux'
          });
        }
      }
    }

    return imprimantes;
  }

  /**
   * Convertir le statut Windows en texte lisible
   */
  parseStatutWindows(statut) {
    const statuts = {
      0: 'Prête',
      1: 'Pause',
      2: 'Erreur',
      3: 'Suppression en cours',
      4: 'Bourrage papier',
      5: 'Plus de papier',
      6: 'Impression manuelle requise',
      7: 'Problème de sortie'
    };
    return statuts[statut] || 'Inconnue';
  }

  /**
   * Vérifier si une imprimante est une Luca 40 KM
   */
  estLuca40KM(nom) {
    if (!nom) return false;
    const nomUpper = nom.toUpperCase();
    return PRINTER_CONFIG.nomRecherche.some(terme => nomUpper.includes(terme.toUpperCase()));
  }

  /**
   * Détecter et sélectionner l'imprimante Luca 40 KM
   */
  detecterLuca40KM() {
    const luca = this.imprimantes.find(imp => imp.estLuca);

    if (luca) {
      this.imprimanteSelectionnee = {
        ...luca,
        config: PRINTER_CONFIG
      };
      this.modeSimulation = false;
      console.log(`🖨️ Imprimante Luca 40 KM détectée: ${luca.nom}`);
    } else {
      this.imprimanteSelectionnee = null;
      this.modeSimulation = true;
      console.log('⚠️ Imprimante Luca 40 KM non détectée - Mode simulation activé');
    }
  }

  /**
   * Obtenir la liste des imprimantes avec l'option de simulation
   */
  getImprimantesAvecSimulation() {
    const liste = [...this.imprimantes];

    // Toujours ajouter l'imprimante simulée
    liste.push({
      nom: 'Luca 40 KM Retransfer (Simulation)',
      driver: 'Virtual Printer Driver',
      port: 'VIRTUAL',
      statut: 'Prête',
      estLuca: true,
      simule: true,
      plateforme: os.platform(),
      config: PRINTER_CONFIG
    });

    return liste;
  }

  /**
   * Obtenir le statut complet du service d'impression
   */
  async getStatus() {
    // Rescanner si le dernier scan date de plus de 30 secondes
    const maintenant = new Date();
    if (!this.derniereScan || (maintenant - new Date(this.derniereScan)) > 30000) {
      await this.scannerImprimantes();
    }

    return {
      modeSimulation: this.modeSimulation,
      imprimantesDetectees: this.imprimantes.length,
      imprimanteSelectionnee: this.imprimanteSelectionnee,
      luca40KMDetectee: !this.modeSimulation,
      derniereScan: this.derniereScan,
      erreur: this.erreur,
      plateforme: os.platform(),
      configImprimante: PRINTER_CONFIG
    };
  }

  /**
   * Obtenir la liste de toutes les imprimantes
   */
  async getImprimantes() {
    await this.scannerImprimantes();
    return {
      imprimantes: this.getImprimantesAvecSimulation(),
      imprimanteRecommandee: this.imprimanteSelectionnee || {
        nom: 'Luca 40 KM Retransfer (Simulation)',
        simule: true,
        config: PRINTER_CONFIG
      }
    };
  }

  /**
   * Sélectionner une imprimante
   */
  selectionnerImprimante(nom) {
    const imprimante = this.imprimantes.find(imp => imp.nom === nom);

    if (imprimante) {
      this.imprimanteSelectionnee = imprimante;
      this.modeSimulation = imprimante.simule || false;
      return { succes: true, imprimante: this.imprimanteSelectionnee };
    }

    // Vérifier si c'est l'imprimante simulée
    if (nom.includes('Simulation')) {
      this.imprimanteSelectionnee = {
        nom: 'Luca 40 KM Retransfer (Simulation)',
        simule: true,
        config: PRINTER_CONFIG
      };
      this.modeSimulation = true;
      return { succes: true, imprimante: this.imprimanteSelectionnee };
    }

    return { succes: false, erreur: 'Imprimante non trouvée' };
  }

  /**
   * Vérifier si l'imprimante est prête
   */
  async estPrete() {
    if (this.modeSimulation) {
      return {
        prete: true,
        simule: true,
        message: 'Mode simulation - Imprimante virtuelle toujours prête'
      };
    }

    await this.scannerImprimantes();

    if (this.imprimanteSelectionnee) {
      return {
        prete: this.imprimanteSelectionnee.statut === 'Prête',
        simule: false,
        statut: this.imprimanteSelectionnee.statut,
        imprimante: this.imprimanteSelectionnee.nom
      };
    }

    return {
      prete: false,
      simule: true,
      message: 'Aucune imprimante Luca 40 KM détectée'
    };
  }

  /**
   * Obtenir les informations de configuration de l'imprimante
   */
  getConfig() {
    return PRINTER_CONFIG;
  }
}

// Exporter une instance singleton
module.exports = new PrinterService();
