/**
 * Service d'impression
 * Gère l'envoi des documents vers l'imprimante Luca 40 KM Retransfer
 * Compatible avec les imprimantes de cartes utilisant le protocole Windows Print Spooler
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');

const execPromise = util.promisify(exec);

class PrintService {
  constructor() {
    // Configuration par défaut pour Luca 40 KM
    this.configDefaut = {
      imprimante: 'Luca 40 KM',
      dpi: 300,
      copies: 1,
      recto_verso: false,
      orientation: 'paysage'
    };
  }

  /**
   * Récupérer la liste des imprimantes disponibles
   */
  async getImprimantes() {
    try {
      // Windows: utiliser wmic ou PowerShell
      if (process.platform === 'win32') {
        const { stdout } = await execPromise(
          'powershell -Command "Get-Printer | Select-Object Name, DriverName, PortName | ConvertTo-Json"'
        );

        try {
          const imprimantes = JSON.parse(stdout);
          return Array.isArray(imprimantes) ? imprimantes : [imprimantes];
        } catch {
          // Fallback si JSON invalide
          return this.parseImprimantesTexte(stdout);
        }
      }

      // Linux/Mac: utiliser lpstat
      const { stdout } = await execPromise('lpstat -p -d');
      return this.parseImprimantesUnix(stdout);

    } catch (error) {
      console.error('Erreur récupération imprimantes:', error);
      return [];
    }
  }

  /**
   * Parser la sortie texte des imprimantes Windows
   */
  parseImprimantesTexte(stdout) {
    const lignes = stdout.split('\n').filter(l => l.trim());
    return lignes.map(ligne => ({ Name: ligne.trim() }));
  }

  /**
   * Parser la sortie lpstat Unix
   */
  parseImprimantesUnix(stdout) {
    const lignes = stdout.split('\n').filter(l => l.includes('printer'));
    return lignes.map(ligne => {
      const match = ligne.match(/printer\s+(\S+)/);
      return { Name: match ? match[1] : ligne };
    });
  }

  /**
   * Vérifier si l'imprimante est disponible
   */
  async verifierImprimante(nomImprimante) {
    const imprimantes = await this.getImprimantes();
    return imprimantes.some(imp =>
      imp.Name && imp.Name.toLowerCase().includes(nomImprimante.toLowerCase())
    );
  }

  /**
   * Imprimer un fichier PDF
   */
  async imprimer(cheminPdf, options = {}) {
    try {
      const config = { ...this.configDefaut, ...options };

      // Vérifier que le fichier existe
      if (!fs.existsSync(cheminPdf)) {
        return {
          succes: false,
          erreur: `Fichier PDF non trouvé: ${cheminPdf}`
        };
      }

      // Vérifier l'imprimante
      const imprimanteDisponible = await this.verifierImprimante(config.imprimante);

      if (!imprimanteDisponible) {
        console.warn(`⚠️ Imprimante "${config.imprimante}" non trouvée. Utilisation de l'imprimante par défaut.`);
      }

      // Commande d'impression selon l'OS
      let commande;

      if (process.platform === 'win32') {
        // Windows: utiliser SumatraPDF ou PDFtoPrinter pour impression directe
        // Ou utiliser la commande print native
        commande = this.genererCommandeWindows(cheminPdf, config);
      } else if (process.platform === 'darwin') {
        // macOS: utiliser lpr
        commande = this.genererCommandeMac(cheminPdf, config);
      } else {
        // Linux: utiliser lpr
        commande = this.genererCommandeLinux(cheminPdf, config);
      }

      console.log(`🖨️ Commande d'impression: ${commande}`);

      // Exécuter la commande
      const { stdout, stderr } = await execPromise(commande);

      if (stderr && stderr.includes('error')) {
        return {
          succes: false,
          erreur: stderr
        };
      }

      console.log(`✅ Impression envoyée avec succès`);

      return {
        succes: true,
        message: 'Impression envoyée avec succès',
        sortie: stdout
      };

    } catch (error) {
      console.error('❌ Erreur impression:', error);
      return {
        succes: false,
        erreur: error.message
      };
    }
  }

  /**
   * Générer la commande d'impression Windows
   */
  genererCommandeWindows(cheminPdf, config) {
    // Utiliser PowerShell pour imprimer
    // Alternative: SumatraPDF -print-to "PrinterName" file.pdf
    const cheminNormalise = cheminPdf.replace(/\//g, '\\');

    if (config.imprimante) {
      return `powershell -Command "Start-Process -FilePath '${cheminNormalise}' -Verb PrintTo -ArgumentList '${config.imprimante}'"`;
    }

    // Impression vers l'imprimante par défaut
    return `powershell -Command "Start-Process -FilePath '${cheminNormalise}' -Verb Print -Wait"`;
  }

  /**
   * Générer la commande d'impression macOS
   */
  genererCommandeMac(cheminPdf, config) {
    let commande = `lpr`;

    if (config.imprimante) {
      commande += ` -P "${config.imprimante}"`;
    }

    if (config.copies > 1) {
      commande += ` -# ${config.copies}`;
    }

    commande += ` "${cheminPdf}"`;

    return commande;
  }

  /**
   * Générer la commande d'impression Linux
   */
  genererCommandeLinux(cheminPdf, config) {
    let commande = `lpr`;

    if (config.imprimante) {
      commande += ` -P "${config.imprimante}"`;
    }

    if (config.copies > 1) {
      commande += ` -# ${config.copies}`;
    }

    // Options pour cartes
    commande += ` -o media=Custom.85.6x53.98mm`;
    commande += ` -o fit-to-page`;

    commande += ` "${cheminPdf}"`;

    return commande;
  }

  /**
   * Obtenir le statut de l'imprimante
   */
  async getStatutImprimante(nomImprimante) {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execPromise(
          `powershell -Command "Get-Printer -Name '${nomImprimante}' | Select-Object PrinterStatus, JobCount | ConvertTo-Json"`
        );
        return JSON.parse(stdout);
      }

      const { stdout } = await execPromise(`lpstat -p "${nomImprimante}"`);
      return { statut: stdout };

    } catch (error) {
      return { erreur: error.message };
    }
  }

  /**
   * Annuler tous les travaux d'impression pour une imprimante
   */
  async annulerTravaux(nomImprimante) {
    try {
      if (process.platform === 'win32') {
        await execPromise(
          `powershell -Command "Get-PrintJob -PrinterName '${nomImprimante}' | Remove-PrintJob"`
        );
      } else {
        await execPromise(`cancel -a "${nomImprimante}"`);
      }

      return { succes: true };
    } catch (error) {
      return { succes: false, erreur: error.message };
    }
  }
}

console.log('🖨️ Export PrintService...');
const printService = new PrintService();
console.log('✅ PrintService exporté');
module.exports = printService;
