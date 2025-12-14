/**
 * Script d'initialisation de la base de données
 * Crée les données de démonstration pour tester l'application
 */

const path = require('path');
const fs = require('fs');

// Créer le dossier data s'il n'existe pas
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Créer les dossiers d'upload
const uploadDirs = [
  path.join(__dirname, '../../uploads'),
  path.join(__dirname, '../../uploads/photos'),
  path.join(__dirname, '../../uploads/pdf')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Dossier créé: ${dir}`);
  }
});

// Charger la base de données (cela va créer les tables)
const db = require('../config/database');
const Utilisateur = require('../models/Utilisateur');
const Template = require('../models/Template');

console.log('\n🚀 Initialisation de la base de données...\n');

// Données de démonstration - Utilisateurs
const utilisateursDemo = [
  {
    numero_carte: 'FR-2024-001',
    nom: 'DUPONT',
    prenom: 'Jean',
    date_naissance: '1985-03-15',
    lieu_naissance: 'Paris',
    adresse: '15 Rue de la République',
    ville: 'Lyon',
    code_postal: '69001',
    pays: 'France',
    email: 'jean.dupont@email.fr',
    telephone: '0612345678',
    numero_permis: '12AB34567',
    categorie_permis: 'B',
    date_delivrance: '2010-06-20',
    date_expiration: '2030-06-20'
  },
  {
    numero_carte: 'FR-2024-002',
    nom: 'MARTIN',
    prenom: 'Marie',
    date_naissance: '1990-07-22',
    lieu_naissance: 'Marseille',
    adresse: '8 Avenue des Champs',
    ville: 'Paris',
    code_postal: '75008',
    pays: 'France',
    email: 'marie.martin@email.fr',
    telephone: '0698765432',
    numero_permis: '98CD76543',
    categorie_permis: 'B, A2',
    date_delivrance: '2015-09-10',
    date_expiration: '2035-09-10'
  },
  {
    numero_carte: 'FR-2024-003',
    nom: 'BERNARD',
    prenom: 'Pierre',
    date_naissance: '1978-11-30',
    lieu_naissance: 'Toulouse',
    adresse: '42 Boulevard Victor Hugo',
    ville: 'Toulouse',
    code_postal: '31000',
    pays: 'France',
    email: 'pierre.bernard@email.fr',
    telephone: '0654321987',
    numero_permis: '45EF12389',
    categorie_permis: 'B, C, CE',
    date_delivrance: '2000-04-15',
    date_expiration: '2025-04-15'
  },
  {
    numero_carte: 'FR-2024-004',
    nom: 'LEROY',
    prenom: 'Sophie',
    date_naissance: '1995-02-14',
    lieu_naissance: 'Bordeaux',
    adresse: '23 Rue du Commerce',
    ville: 'Bordeaux',
    code_postal: '33000',
    pays: 'France',
    email: 'sophie.leroy@email.fr',
    telephone: '0687654321'
  },
  {
    numero_carte: 'FR-2024-005',
    nom: 'MOREAU',
    prenom: 'Thomas',
    date_naissance: '1988-09-05',
    lieu_naissance: 'Nantes',
    adresse: '7 Place de la Liberté',
    ville: 'Nantes',
    code_postal: '44000',
    pays: 'France',
    email: 'thomas.moreau@email.fr',
    telephone: '0623456789'
  }
];

// Templates de cartes de démonstration
const templatesDemo = [
  {
    nom: 'Permis de Conduire Français',
    description: 'Modèle de permis de conduire format européen',
    type: 'permis_conduire',
    largeur_mm: 85.6,
    hauteur_mm: 53.98,
    html_recto: `
<div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); height: 100%; color: white; padding: 3mm; font-size: 7pt;">
  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <div>
      <div style="font-size: 6pt; opacity: 0.8;">RÉPUBLIQUE FRANÇAISE</div>
      <div style="font-size: 10pt; font-weight: bold; margin-top: 1mm;">PERMIS DE CONDUIRE</div>
      <div style="font-size: 5pt; opacity: 0.8; margin-top: 0.5mm;">DRIVING LICENCE</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 14pt; font-weight: bold;">F</div>
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='gold'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E" style="width: 8mm; height: 8mm;" />
    </div>
  </div>

  <div style="display: flex; margin-top: 2mm;">
    <div style="width: 22mm; height: 28mm; background: #ddd; border: 1px solid #999; display: flex; align-items: center; justify-content: center; color: #666; font-size: 5pt;">
      {{#if photo_url}}
        <img src="{{photo_url}}" style="width: 100%; height: 100%; object-fit: cover;" />
      {{else}}
        PHOTO
      {{/if}}
    </div>

    <div style="margin-left: 3mm; flex: 1;">
      <div style="font-size: 5pt; opacity: 0.7;">1. Nom</div>
      <div style="font-size: 9pt; font-weight: bold;">{{uppercase nom}}</div>

      <div style="font-size: 5pt; opacity: 0.7; margin-top: 1mm;">2. Prénom</div>
      <div style="font-size: 8pt;">{{prenom}}</div>

      <div style="font-size: 5pt; opacity: 0.7; margin-top: 1mm;">3. Date de naissance</div>
      <div style="font-size: 7pt;">{{formatDate date_naissance}}</div>

      <div style="font-size: 5pt; opacity: 0.7; margin-top: 1mm;">4a. Délivrance</div>
      <div style="font-size: 7pt;">{{formatDate date_delivrance}}</div>
    </div>
  </div>

  <div style="position: absolute; bottom: 3mm; left: 3mm; right: 3mm;">
    <div style="font-size: 5pt; opacity: 0.7;">5. N° Permis</div>
    <div style="font-family: 'Courier New', monospace; font-size: 8pt; letter-spacing: 1px;">{{numero_permis}}</div>
  </div>
</div>
    `,
    html_verso: `
<div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); height: 100%; color: white; padding: 3mm; font-size: 6pt;">
  <div style="font-size: 8pt; font-weight: bold; margin-bottom: 2mm;">CATÉGORIES</div>

  <table style="width: 100%; border-collapse: collapse; font-size: 5pt;">
    <tr style="background: rgba(255,255,255,0.2);">
      <th style="padding: 1mm; text-align: left;">Cat.</th>
      <th style="padding: 1mm;">Date</th>
      <th style="padding: 1mm;">Validité</th>
    </tr>
    <tr>
      <td style="padding: 1mm; font-weight: bold;">{{categorie_permis}}</td>
      <td style="padding: 1mm; text-align: center;">{{formatDate date_delivrance}}</td>
      <td style="padding: 1mm; text-align: center;">{{formatDate date_expiration}}</td>
    </tr>
  </table>

  <div style="margin-top: 3mm;">
    <div style="font-size: 5pt; opacity: 0.7;">8. Adresse</div>
    <div style="font-size: 6pt;">{{adresse}}</div>
    <div style="font-size: 6pt;">{{code_postal}} {{ville}}</div>
  </div>

  <div style="position: absolute; bottom: 3mm; left: 3mm;">
    <div style="font-size: 5pt; opacity: 0.7;">N° Carte: {{numero_carte}}</div>
  </div>
</div>
    `,
    css: '',
    champs_dynamiques: ['nom', 'prenom', 'date_naissance', 'photo_url', 'numero_permis', 'categorie_permis', 'date_delivrance', 'date_expiration', 'adresse', 'ville', 'code_postal', 'numero_carte']
  },
  {
    nom: 'Badge Employé',
    description: 'Badge d\'identification employé avec photo et QR code',
    type: 'badge_employe',
    largeur_mm: 85.6,
    hauteur_mm: 53.98,
    html_recto: `
<div style="background: linear-gradient(180deg, #059669 0%, #10b981 50%, #fff 50%); height: 100%; padding: 3mm;">
  <div style="text-align: center; color: white;">
    <div style="font-size: 10pt; font-weight: bold;">ENTREPRISE SA</div>
    <div style="font-size: 6pt;">Badge d'identification</div>
  </div>

  <div style="background: white; margin-top: 2mm; padding: 2mm; border-radius: 2mm; display: flex; align-items: center;">
    <div style="width: 25mm; height: 32mm; background: #f0f0f0; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 5pt; color: #999;">
      {{#if photo_url}}
        <img src="{{photo_url}}" style="width: 100%; height: 100%; object-fit: cover;" />
      {{else}}
        PHOTO
      {{/if}}
    </div>

    <div style="margin-left: 3mm; flex: 1;">
      <div style="font-size: 12pt; font-weight: bold; color: #059669;">{{uppercase nom}}</div>
      <div style="font-size: 10pt; color: #333;">{{prenom}}</div>
      <div style="font-size: 7pt; color: #666; margin-top: 2mm;">{{email}}</div>
      <div style="font-size: 8pt; color: #059669; margin-top: 1mm; font-weight: bold;">ID: {{numero_carte}}</div>
    </div>
  </div>
</div>
    `,
    html_verso: `
<div style="background: #f5f5f5; height: 100%; padding: 3mm;">
  <div style="text-align: center;">
    <div style="font-size: 8pt; font-weight: bold; color: #333;">En cas de perte</div>
    <div style="font-size: 6pt; color: #666; margin-top: 1mm;">Merci de retourner ce badge à:</div>
    <div style="font-size: 7pt; margin-top: 2mm;">
      ENTREPRISE SA<br/>
      Service RH<br/>
      01 23 45 67 89
    </div>
  </div>

  <div style="background: #fff; margin-top: 3mm; padding: 2mm; text-align: center;">
    <div style="font-size: 5pt; color: #999;">Code de sécurité</div>
    <div style="font-family: 'Courier New', monospace; font-size: 10pt; letter-spacing: 2px;">{{numero_carte}}</div>
  </div>

  <div style="position: absolute; bottom: 3mm; left: 3mm; right: 3mm; text-align: center;">
    <div style="font-size: 5pt; color: #999;">Validité: {{formatDate date_delivrance}} - {{formatDate date_expiration}}</div>
  </div>
</div>
    `,
    css: '',
    champs_dynamiques: ['nom', 'prenom', 'photo_url', 'email', 'numero_carte', 'date_delivrance', 'date_expiration']
  },
  {
    nom: 'Carte d\'Accès',
    description: 'Carte d\'accès NFC simple',
    type: 'carte_acces',
    largeur_mm: 85.6,
    hauteur_mm: 53.98,
    html_recto: `
<div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); height: 100%; padding: 4mm; color: white;">
  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <div>
      <div style="font-size: 12pt; font-weight: bold;">CARTE D'ACCÈS</div>
      <div style="font-size: 6pt; opacity: 0.8;">ACCESS CARD</div>
    </div>
    <div style="width: 10mm; height: 10mm; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 14pt;">🔐</span>
    </div>
  </div>

  <div style="margin-top: 5mm;">
    <div style="font-size: 14pt; font-weight: bold;">{{uppercase nom}} {{prenom}}</div>
    <div style="font-size: 8pt; opacity: 0.9; margin-top: 1mm;">{{email}}</div>
  </div>

  <div style="position: absolute; bottom: 4mm; left: 4mm; right: 4mm; display: flex; justify-content: space-between; align-items: flex-end;">
    <div>
      <div style="font-size: 5pt; opacity: 0.7;">N° Carte</div>
      <div style="font-family: 'Courier New', monospace; font-size: 10pt;">{{numero_carte}}</div>
    </div>
    <div style="background: rgba(255,255,255,0.2); padding: 1mm 2mm; border-radius: 1mm;">
      <span style="font-size: 6pt;">NFC</span>
    </div>
  </div>
</div>
    `,
    html_verso: null,
    css: '',
    champs_dynamiques: ['nom', 'prenom', 'email', 'numero_carte']
  }
];

// Insérer les données de démonstration
console.log('📝 Création des utilisateurs de démonstration...');
utilisateursDemo.forEach(utilisateur => {
  try {
    const created = Utilisateur.creer(utilisateur);
    console.log(`   ✅ ${created.prenom} ${created.nom} (ID: ${created.id})`);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.log(`   ⚠️ ${utilisateur.prenom} ${utilisateur.nom} existe déjà`);
    } else {
      console.error(`   ❌ Erreur: ${error.message}`);
    }
  }
});

console.log('\n📄 Création des templates de démonstration...');
templatesDemo.forEach(template => {
  try {
    const created = Template.creer(template);
    console.log(`   ✅ ${created.nom} (ID: ${created.id})`);
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
  }
});

console.log('\n✅ Initialisation terminée!');
console.log('\n📊 Résumé:');
console.log(`   - Utilisateurs: ${Utilisateur.compter()}`);
console.log(`   - Templates: ${Template.getAll().length}`);

console.log('\n🚀 Vous pouvez maintenant démarrer le serveur avec: npm run dev');
