/**
 * Service de génération PDF
 * Utilise Puppeteer pour convertir les templates HTML en PDF
 * Format carte CR80 (85.6mm x 53.98mm)
 */

const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Enregistrer les helpers Handlebars
Handlebars.registerHelper('formatDate', function(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR');
});

Handlebars.registerHelper('uppercase', function(str) {
  return str ? str.toUpperCase() : '';
});

Handlebars.registerHelper('lowercase', function(str) {
  return str ? str.toLowerCase() : '';
});

class PdfService {
  constructor() {
    this.browser = null;
    this.outputDir = path.join(__dirname, '../../uploads/pdf');

    // Créer le dossier de sortie s'il n'existe pas
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Initialiser le navigateur Puppeteer
   */
  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
    }
    return this.browser;
  }

  /**
   * Fermer le navigateur
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Générer le HTML complet pour une carte
   */
  genererHtmlCarte(utilisateur, template) {
    // Compiler le template Handlebars
    const templateRecto = Handlebars.compile(template.html_recto);
    const htmlRecto = templateRecto(utilisateur);

    let htmlVerso = '';
    if (template.html_verso) {
      const templateVerso = Handlebars.compile(template.html_verso);
      htmlVerso = templateVerso(utilisateur);
    }

    // Dimensions carte CR80 en mm
    const largeur = template.largeur_mm || 85.6;
    const hauteur = template.hauteur_mm || 53.98;

    // HTML complet avec styles
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carte - ${utilisateur.nom} ${utilisateur.prenom}</title>
  <style>
    @page {
      size: ${largeur}mm ${hauteur}mm;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .carte {
      width: ${largeur}mm;
      height: ${hauteur}mm;
      position: relative;
      overflow: hidden;
      page-break-after: always;
    }

    .carte:last-child {
      page-break-after: auto;
    }

    /* Styles par défaut du template */
    ${template.css || ''}

    /* Styles communs pour les cartes */
    .carte-recto, .carte-verso {
      width: 100%;
      height: 100%;
      position: relative;
      padding: 3mm;
    }

    .photo-identite {
      width: 25mm;
      height: 32mm;
      object-fit: cover;
      border: 1px solid #ccc;
    }

    .info-ligne {
      font-size: 8pt;
      margin: 1mm 0;
    }

    .info-label {
      font-weight: bold;
      font-size: 6pt;
      color: #666;
      text-transform: uppercase;
    }

    .info-valeur {
      font-size: 9pt;
      font-weight: bold;
    }

    .nom-complet {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
    }

    .numero-carte {
      font-family: 'Courier New', monospace;
      font-size: 10pt;
      letter-spacing: 1px;
    }

    .date-validite {
      font-size: 7pt;
      color: #666;
    }

    .code-barres {
      height: 10mm;
    }

    .qr-code {
      width: 15mm;
      height: 15mm;
    }
  </style>
</head>
<body>
  <!-- Recto de la carte -->
  <div class="carte">
    <div class="carte-recto">
      ${htmlRecto}
    </div>
  </div>

  ${htmlVerso ? `
  <!-- Verso de la carte -->
  <div class="carte">
    <div class="carte-verso">
      ${htmlVerso}
    </div>
  </div>
  ` : ''}
</body>
</html>
    `;
  }

  /**
   * Générer un PDF pour une carte
   */
  async genererPdfCarte(utilisateur, template) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // Générer le HTML
      const html = this.genererHtmlCarte(utilisateur, template);

      // Charger le HTML dans la page
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      // Dimensions carte CR80
      const largeur = template.largeur_mm || 85.6;
      const hauteur = template.hauteur_mm || 53.98;

      // Générer le nom du fichier
      const nomFichier = `carte_${utilisateur.id}_${uuidv4().substring(0, 8)}.pdf`;
      const cheminPdf = path.join(this.outputDir, nomFichier);

      // Générer le PDF
      await page.pdf({
        path: cheminPdf,
        width: `${largeur}mm`,
        height: `${hauteur}mm`,
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      });

      await page.close();

      console.log(`✅ PDF généré: ${cheminPdf}`);

      return {
        succes: true,
        chemin: cheminPdf,
        nomFichier
      };

    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      return {
        succes: false,
        erreur: error.message
      };
    }
  }

  /**
   * Générer un aperçu image (PNG) d'une carte
   */
  async genererApercuImage(utilisateur, template) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      const html = this.genererHtmlCarte(utilisateur, template);
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Dimensions carte CR80 en pixels (300 DPI)
      const largeurPx = Math.round((template.largeur_mm || 85.6) * 300 / 25.4);
      const hauteurPx = Math.round((template.hauteur_mm || 53.98) * 300 / 25.4);

      await page.setViewport({
        width: largeurPx,
        height: hauteurPx,
        deviceScaleFactor: 2
      });

      const nomFichier = `apercu_${utilisateur.id}_${uuidv4().substring(0, 8)}.png`;
      const cheminImage = path.join(this.outputDir, nomFichier);

      await page.screenshot({
        path: cheminImage,
        fullPage: true
      });

      await page.close();

      return {
        succes: true,
        chemin: cheminImage,
        nomFichier
      };

    } catch (error) {
      console.error('❌ Erreur génération aperçu:', error);
      return {
        succes: false,
        erreur: error.message
      };
    }
  }
}

module.exports = new PdfService();
