# Site du réseau d'entraide des entrepreneurs comoriens de Toulouse
Déployé sur GitHub Pages : https://kevinhadad36.github.io/entraide-comores-toulouse/ (branche main, racine).

- Association en cours de création, **pas encore de nom** : nom provisoire dans `config.mjs` (NAME / SHORT), changer là et rebuild.
- Piliers : réseautage, annuaire des membres (« cherchez chez nous d'abord »), partage de compétences/infos, projets d'envergure, financement halal (soutien direct ou accompagnement), cagnotte communautaire.
- Style : Refero « Ramp » (https://styles.refero.design/style/b38702a0-75ab-474c-9106-00b624535825), **couleurs alignées sur le formulaire d'inscription** (dépôt inscription-comoriens-toulouse) : fond #f7f5ef, texte #1b1f1c, vert #1f6b3a (boutons), vert foncé #154d29 (bandes sombres, pied de page), jaune #f6c21c (surlignage), bande drapeau en haut. Logo vert, croissant et étoiles blancs. Inter / Inter Tight en 400 uniquement, filets fins, pas d'ombres, rayons 6/10/12/16.
- Logo : croissant + 4 étoiles (généré dans build.mjs).
- Règles : aucun chiffre, membre, témoignage, montant ou partenaire inventé. Voix « nous », ton chaleureux.

## Build
Ne pas éditer les .html à la main. Source : `build.mjs`, `config.mjs`, `members.json`, `assets/style.css`, `assets/app.js`.
- `node build.mjs`
- Page formulaire dédiée : `/adherer/` (version épurée, sans menu, pour le lien WhatsApp ; ajouter `?src=whatsapp` au lien partagé).
- Formulaire : `FORM_ENDPOINT` (Formspree/Web3Forms…) ; sinon repli sur WhatsApp (`WHATSAPP`) ou e-mail (`EMAIL`).
- Cagnotte : `CAGNOTTE_URL` (HelloAsso), `CAGNOTTE_WIDGET`, `CAGNOTTE_PROJECT`, `CAGNOTTE_TEXT`, `CAGNOTTE_GOAL`, `CAGNOTTE_RAISED`.
- Annuaire : ajouter les membres (avec leur accord) dans `members.json` :
  `{"nom":"", "entreprise":"", "activite":"", "secteur":"", "ville":"", "description":"", "telephone":"", "whatsapp":"336…", "email":"", "site":""}`
- `assets/og.png` = image d'aperçu WhatsApp (1200×630), à refaire si le nom change.
