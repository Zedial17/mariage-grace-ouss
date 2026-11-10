// ============================================================
//  Grace & Ouss — RSVP et livre d'or dans Google Sheets
// ============================================================
//  Installation : voir le README du site, section « Google Sheets ».
//  En deux mots :
//    1. Créer un Google Sheet, le partager avec la mariée.
//    2. Extensions → Apps Script, coller ce fichier.
//    3. Mettre un jeton dans JETON (le même que SHEETS_TOKEN du site).
//    4. Exécuter « initialiser » une fois.
//    5. Déployer → Nouveau déploiement → Application web
//         Exécuter en tant que : moi
//         Accès : tout le monde
//       puis copier l'URL /exec dans SHEETS_ENDPOINT.
//
//  Mise à jour ultérieure : Déployer → Gérer les déploiements →
//  crayon → Version « Nouvelle version » → Déployer. L'URL ne change pas.
// ============================================================

/** Doit être identique à SHEETS_TOKEN côté site. À remplacer. */
var JETON = 'REMPLACER_PAR_UN_JETON_LONG_ET_UNIQUE';

/** Adresse prévenue à chaque réponse. Laisser '' pour ne rien envoyer. */
var NOTIFIER = '';

var ONGLET_RSVP = 'RSVP';
var ONGLET_MOTS = "Livre d'or";
var FUSEAU = 'Europe/Paris';

var COLONNES_RSVP = [
  'Horodatage',
  'Nom',
  'E-mail',
  'Réponse',
  'Accompagnant',
  'Nom accompagnant',
  'Ville',
  'Pays',
  'Latitude',
  'Longitude',
  'Message',
  'Personnes',
  'ID',
];

var COLONNES_MOTS = ['Horodatage', 'Nom', 'Message', 'Publié', 'ID'];

// ────────────────────────────────────────────────────────────
//  Point d'entrée
// ────────────────────────────────────────────────────────────

function doGet() {
  // Page de contrôle : permet de vérifier que le déploiement répond.
  return json({ ok: true, service: 'grace-et-ouss', message: 'Déploiement actif.' });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Le site est entièrement statique : il appelle ce script depuis le
    // navigateur, donc l'URL est publique. Les actions ci-dessous sont
    // celles qu'un invité a le droit de déclencher ; elles n'exposent
    // aucune donnée nominative et ne peuvent rien effacer.
    switch (data.action) {
      case 'rsvp':     return ajouterRsvp(data);
      case 'message':  return ajouterMessage(data);
      case 'messages': return listerMessagesPublies();
      case 'convives': return listerConvives();
      case 'virement': return demandeVirement(data);
    }

    // Tout le reste touche aux données brutes : jeton obligatoire.
    if (!JETON || JETON.indexOf('REMPLACER') === 0) {
      return json({ ok: false, message: 'JETON non configuré dans Apps Script.' });
    }
    if (String(data.token || '') !== JETON) {
      return json({ ok: false, message: 'Jeton invalide.' });
    }

    switch (data.action) {
      case 'tout':              return listerTout();
      case 'approuver':         return publier(data.id, true);
      case 'retirer':           return publier(data.id, false);
      case 'supprimer_message': return supprimer(ONGLET_MOTS, data.id);
      case 'supprimer_rsvp':    return supprimer(ONGLET_RSVP, data.id);
      default:
        return json({ ok: false, message: 'Action inconnue : ' + data.action });
    }
  } catch (err) {
    Logger.log(err);
    return json({ ok: false, message: String(err) });
  }
}

// ────────────────────────────────────────────────────────────
//  RSVP
// ────────────────────────────────────────────────────────────

function ajouterRsvp(data) {
  var nom = texte(data.nom);
  var email = texte(data.email);
  var reponse = data.reponse === 'oui' ? 'oui' : data.reponse === 'non' ? 'non' : '';
  var accompagnant = data.accompagnant === true;
  var nomAccompagnant = accompagnant ? texte(data.nom_accompagnant) : '';

  // Mêmes règles que le site : le classeur reste cohérent même si
  // quelqu'un appelle ce script directement.
  if (nom.length < 2) return json({ ok: false, message: 'Nom manquant.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ ok: false, message: 'E-mail invalide.' });
  }
  if (!reponse) return json({ ok: false, message: 'Réponse manquante.' });
  // Une seule personne supplémentaire maximum : le champ est unique et
  // son nom est obligatoire dès que la case est cochée.
  if (accompagnant && nomAccompagnant.length < 2) {
    return json({ ok: false, message: 'Nom de l’accompagnant manquant.' });
  }

  var feuille = onglet(ONGLET_RSVP, COLONNES_RSVP);
  var id = Utilities.getUuid();
  var personnes = reponse === 'oui' ? (accompagnant ? 2 : 1) : 0;

  // La ville est géocodée ici, une fois pour toutes : la carte des invités
  // n'a plus qu'à lire les coordonnées.
  var ville = texte(data.ville);
  var lieu = ville ? geocoder(ville) : null;

  feuille.appendRow([
    horodatage(),
    nom,
    email,
    reponse === 'oui' ? 'Oui' : 'Non',
    accompagnant ? 'Oui' : 'Non',
    nomAccompagnant || '—',
    ville || '—',
    lieu ? lieu.pays : '—',
    lieu ? lieu.lat : '',
    lieu ? lieu.lng : '',
    texte(data.message) || '—',
    personnes,
    id,
  ]);

  notifier(nom, email, reponse, accompagnant, nomAccompagnant, texte(data.message));
  return json({ ok: true, id: id });
}

// ────────────────────────────────────────────────────────────
//  Livre d'or
// ────────────────────────────────────────────────────────────

function ajouterMessage(data) {
  var mot = texte(data.texte);
  if (mot.length < 2) return json({ ok: false, message: 'Message vide.' });

  var feuille = onglet(ONGLET_MOTS, COLONNES_MOTS);
  var id = Utilities.getUuid();

  // Publié = false : rien ne paraît sur le site sans validation.
  feuille.appendRow([horodatage(), texte(data.nom) || 'Un invité', mot, false, id]);
  caseACocher(feuille);

  return json({ ok: true, id: id });
}

function listerMessagesPublies() {
  var lignes = lire(ONGLET_MOTS, COLONNES_MOTS);
  var publies = [];

  for (var i = lignes.length - 1; i >= 0; i--) {
    if (vrai(lignes[i]['Publié'])) {
      publies.push({
        id: String(lignes[i]['ID'] || ''),
        nom: String(lignes[i]['Nom'] || 'Un invité'),
        texte: String(lignes[i]['Message'] || ''),
      });
    }
  }
  return json({ ok: true, messages: publies });
}

function publier(id, etat) {
  var feuille = onglet(ONGLET_MOTS, COLONNES_MOTS);
  var ligne = trouverLigne(feuille, COLONNES_MOTS, id);
  if (ligne < 0) return json({ ok: false, message: 'Message introuvable.' });

  feuille.getRange(ligne, COLONNES_MOTS.indexOf('Publié') + 1).setValue(etat === true);
  return json({ ok: true });
}

// ────────────────────────────────────────────────────────────
//  Carte des invités — agrégat public
// ────────────────────────────────────────────────────────────

/**
 * Villes d'origine, regroupées et comptées.
 *
 * Ne sort ni nom, ni e-mail, ni message : seulement une ville, un pays et
 * un nombre. Seules les réponses positives et géocodées comptent, et deux
 * réponses d'une même adresse ne comptent qu'une fois (la plus récente).
 */
function listerConvives() {
  var lignes = lire(ONGLET_RSVP, COLONNES_RSVP);

  // Dernière réponse par adresse e-mail.
  var derniere = {};
  for (var i = 0; i < lignes.length; i++) {
    var email = texte(lignes[i]['E-mail']).toLowerCase();
    if (email) derniere[email] = lignes[i];
  }

  var parVille = {};
  var total = 0;
  var pays = {};

  for (var cle in derniere) {
    var l = derniere[cle];
    if (!vrai(l['Réponse'])) continue;

    var ville = texte(l['Ville']);
    var lat = parseFloat(l['Latitude']);
    var lng = parseFloat(l['Longitude']);
    if (!ville || ville === '—' || isNaN(lat) || isNaN(lng)) continue;

    var personnes = vrai(l['Accompagnant']) ? 2 : 1;
    var k = ville.toLowerCase();

    if (parVille[k]) {
      parVille[k].personnes += personnes;
    } else {
      parVille[k] = {
        nom: ville,
        pays: propre(l['Pays']),
        lat: lat,
        lng: lng,
        personnes: personnes,
      };
    }
    total += personnes;
    if (propre(l['Pays'])) pays[propre(l['Pays'])] = true;
  }

  var villes = [];
  for (var v in parVille) villes.push(parVille[v]);
  villes.sort(function (a, b) { return b.personnes - a.personnes; });

  return json({ ok: true, villes: villes, personnes: total, pays: Object.keys(pays).length });
}

// ────────────────────────────────────────────────────────────
//  Lecture complète — jeton obligatoire
// ────────────────────────────────────────────────────────────

function listerTout() {
  var rsvp = lire(ONGLET_RSVP, COLONNES_RSVP)
    .map(function (l) {
      return {
        id: String(l['ID'] || ''),
        created_at: String(l['Horodatage'] || ''),
        nom: String(l['Nom'] || ''),
        email: String(l['E-mail'] || ''),
        reponse: vrai(l['Réponse']) ? 'oui' : 'non',
        accompagnant: vrai(l['Accompagnant']),
        nom_accompagnant: propre(l['Nom accompagnant']),
        ville: propre(l['Ville']),
        pays: propre(l['Pays']),
        lat: parseFloat(l['Latitude']) || null,
        lng: parseFloat(l['Longitude']) || null,
        message: propre(l['Message']),
      };
    })
    .reverse();

  var messages = lire(ONGLET_MOTS, COLONNES_MOTS)
    .map(function (l) {
      return {
        id: String(l['ID'] || ''),
        created_at: String(l['Horodatage'] || ''),
        nom: String(l['Nom'] || 'Un invité'),
        texte: String(l['Message'] || ''),
        approuve: vrai(l['Publié']),
      };
    })
    .reverse();

  return json({ ok: true, rsvp: rsvp, messages: messages });
}

function supprimer(nomOnglet, id) {
  var colonnes = nomOnglet === ONGLET_RSVP ? COLONNES_RSVP : COLONNES_MOTS;
  var feuille = onglet(nomOnglet, colonnes);
  var ligne = trouverLigne(feuille, colonnes, id);
  if (ligne < 0) return json({ ok: false, message: 'Ligne introuvable.' });

  feuille.deleteRow(ligne);
  return json({ ok: true });
}

// ────────────────────────────────────────────────────────────
//  Demande de coordonnées bancaires
// ────────────────────────────────────────────────────────────

/** N'écrit rien dans le classeur : envoie seulement un e-mail. */
function demandeVirement(data) {
  var nom = texte(data.nom);
  var contact = texte(data.contact);
  if (nom.length < 2 || contact.length < 4) {
    return json({ ok: false, message: 'Demande incomplète.' });
  }
  if (!NOTIFIER) {
    return json({ ok: false, message: 'NOTIFIER non configuré dans Apps Script.' });
  }

  GmailApp.sendEmail(
    NOTIFIER,
    '🏦 Demande de RIB — ' + nom,
    'Un invité souhaite vos coordonnées bancaires pour un virement.\n\n' +
      '  Nom     : ' + nom + '\n' +
      '  Contact : ' + contact + '\n\n' +
      'Merci de le recontacter directement — le RIB ne figure pas sur le site.\n\n' +
      'Grace & Ouss · 27 mars & 1er mai 2027',
  );
  return json({ ok: true });
}

// ────────────────────────────────────────────────────────────
//  Géocodage (natif Apps Script, sans clé API)
// ────────────────────────────────────────────────────────────

function geocoder(ville) {
  try {
    var r = Maps.newGeocoder().setLanguage('fr').geocode(ville);
    if (r.status === 'OK' && r.results.length > 0) {
      var premier = r.results[0];
      var pays = '';
      premier.address_components.forEach(function (c) {
        if (c.types.indexOf('country') !== -1) pays = c.long_name;
      });
      return {
        lat: premier.geometry.location.lat,
        lng: premier.geometry.location.lng,
        pays: pays,
      };
    }
  } catch (err) {
    Logger.log('Géocodage impossible pour « ' + ville + ' » : ' + err);
  }
  return null;
}

// ────────────────────────────────────────────────────────────
//  Outils
// ────────────────────────────────────────────────────────────

function json(objet) {
  return ContentService.createTextOutput(JSON.stringify(objet)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function texte(valeur) {
  return valeur === undefined || valeur === null ? '' : String(valeur).trim();
}

/** '—' et '' deviennent null, pour que le site affiche un tiret propre. */
function propre(valeur) {
  var v = texte(valeur);
  return v && v !== '—' ? v : null;
}

/** Lit indifféremment un booléen, une case à cocher ou « Oui »/« true ». */
function vrai(valeur) {
  if (valeur === true) return true;
  var v = texte(valeur).toLowerCase();
  return v === 'oui' || v === 'true' || v === 'vrai' || v === 'x';
}

function horodatage() {
  return Utilities.formatDate(new Date(), FUSEAU, 'dd/MM/yyyy HH:mm:ss');
}

function onglet(nom, colonnes) {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();
  var feuille = classeur.getSheetByName(nom) || classeur.insertSheet(nom);
  enTetes(feuille, colonnes);
  return feuille;
}

function enTetes(feuille, colonnes) {
  var existantes =
    feuille.getLastRow() > 0
      ? feuille.getRange(1, 1, 1, Math.max(feuille.getLastColumn(), colonnes.length)).getValues()[0]
      : [];

  var correct = colonnes.every(function (c, i) {
    return existantes[i] === c;
  });
  if (correct) return;

  var plage = feuille.getRange(1, 1, 1, colonnes.length);
  plage.setValues([colonnes]);
  plage.setFontWeight('bold');
  plage.setBackground('#2E1D15');
  plage.setFontColor('#F2E6DC');
  feuille.setFrozenRows(1);
}

/** Transforme la colonne « Publié » en vraies cases à cocher. */
function caseACocher(feuille) {
  var col = COLONNES_MOTS.indexOf('Publié') + 1;
  var lignes = feuille.getLastRow() - 1;
  if (lignes < 1) return;
  feuille
    .getRange(2, col, lignes, 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
}

/** Renvoie toutes les lignes sous forme d'objets { 'En-tête': valeur }. */
function lire(nomOnglet, colonnes) {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();
  var feuille = classeur.getSheetByName(nomOnglet);
  if (!feuille || feuille.getLastRow() <= 1) return [];

  var valeurs = feuille.getDataRange().getValues();
  var entetes = valeurs[0];

  return valeurs.slice(1).map(function (ligne) {
    var objet = {};
    colonnes.forEach(function (c) {
      var i = entetes.indexOf(c);
      objet[c] = i === -1 ? '' : ligne[i];
    });
    return objet;
  });
}

/** Numéro de ligne (1-indexé) correspondant à un ID, ou -1. */
function trouverLigne(feuille, colonnes, id) {
  if (!id) return -1;
  var col = colonnes.indexOf('ID') + 1;
  if (feuille.getLastRow() <= 1) return -1;

  var valeurs = feuille.getRange(2, col, feuille.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < valeurs.length; i++) {
    if (String(valeurs[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

function notifier(nom, email, reponse, accompagnant, nomAccompagnant, message) {
  if (!NOTIFIER) return;
  try {
    var vient = reponse === 'oui';
    GmailApp.sendEmail(
      NOTIFIER,
      (vient ? '💌' : '💭') + ' RSVP — ' + nom + (vient ? '' : ' (empêché·e)'),
      'Nom           : ' + nom + '\n' +
        'E-mail        : ' + email + '\n' +
        'Réponse       : ' + (vient ? 'Avec joie' : 'Empêché(e)') + '\n' +
        'Accompagnant  : ' + (accompagnant ? nomAccompagnant : 'non') + '\n' +
        'Personnes     : ' + (vient ? (accompagnant ? 2 : 1) : 0) + '\n' +
        'Message       : ' + (message || '—') + '\n\n' +
        SpreadsheetApp.getActiveSpreadsheet().getUrl() + '\n\n' +
        'Grace & Ouss · 27 mars & 1er mai 2027',
    );
  } catch (err) {
    Logger.log('Notification impossible : ' + err);
  }
}

// ────────────────────────────────────────────────────────────
//  À exécuter une fois depuis l'éditeur
// ────────────────────────────────────────────────────────────

function initialiser() {
  onglet(ONGLET_RSVP, COLONNES_RSVP);
  var mots = onglet(ONGLET_MOTS, COLONNES_MOTS);
  caseACocher(mots);
  Logger.log('✅ Onglets « %s » et « %s » prêts.', ONGLET_RSVP, ONGLET_MOTS);
}

/** Vide les deux onglets en gardant les en-têtes. À utiliser avec prudence. */
function toutEffacer() {
  [
    [ONGLET_RSVP, COLONNES_RSVP],
    [ONGLET_MOTS, COLONNES_MOTS],
  ].forEach(function (paire) {
    var feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(paire[0]);
    if (feuille && feuille.getLastRow() > 1) {
      feuille.deleteRows(2, feuille.getLastRow() - 1);
    }
  });
  Logger.log('Onglets vidés.');
}

function tester() {
  var faux = function (corps) {
    return { postData: { contents: JSON.stringify(corps) } };
  };
  Logger.log(doPost(faux({
    token: JETON, action: 'rsvp', nom: 'Marie Dupont', email: 'marie@exemple.fr',
    reponse: 'oui', accompagnant: true, nom_accompagnant: 'Paul Dupont',
    message: 'Sans gluten',
  })).getContent());
  Logger.log(doPost(faux({
    token: JETON, action: 'message', nom: 'Tata Jo', texte: 'On arrive en jaune soleil.',
  })).getContent());
  Logger.log(doPost(faux({ token: JETON, action: 'tout' })).getContent());
}
