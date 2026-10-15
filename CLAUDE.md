# Site du réseau d'entraide des entrepreneurs comoriens de Toulouse
Déployé sur GitHub Pages : https://kevinhadad36.github.io/entraide-comores-toulouse/ (branche main, racine).

- Association en cours de création, **pas encore de nom** : nom provisoire dans `config.mjs` (NAME / SHORT), changer là et rebuild.
- Piliers : réseautage, annuaire des membres (« cherchez chez nous d'abord »), partage de compétences/infos, projets d'envergure, accompagnement à l'entrepreneuriat (création d'entreprise, conseils, local), cagnotte communautaire.
- **Financement halal : à introduire progressivement** (demande de Kevin, 15/10/2026 : la communauté n'y est pas habituée). Il n'apparaît qu'en fin de page `accompagnement/`, avec douceur. Ne pas le remettre en avant (menu, accueil, titres) sans son accord.
- Style : Refero « Ramp » (https://styles.refero.design/style/b38702a0-75ab-474c-9106-00b624535825), **couleurs alignées sur le formulaire d'inscription** (dépôt inscription-comoriens-toulouse) : fond #f7f5ef, texte #1b1f1c, vert #1f6b3a (boutons), vert foncé #154d29 (bandes sombres, pied de page), jaune #f6c21c (surlignage), bande drapeau en haut. Logo vert, croissant et étoiles blancs. Inter / Inter Tight en 400 uniquement, filets fins, pas d'ombres, rayons 6/10/12/16.
- Logo : croissant + 4 étoiles (généré dans build.mjs).
- Règles : aucun chiffre, membre, témoignage, montant ou partenaire inventé. Voix « nous », ton chaleureux.

## Structure (fusion du 15/10/2026, demandée par Kevin)
- Chaque pilier a sa propre page, le menu y mène ; l'accueil garde tous les résumés : `reseautage/`, `annuaire/`, `competences/`, `projets/`, `accompagnement/` (ex-`financement/`, qui redirige), `cagnotte/`, `blog/`.
- Le bouton « Adhérer » mène à `/adherer/` = le **formulaire d'inscription à l'annuaire** (ex-dépôt inscription-comoriens-toulouse, qui redirige désormais ici). Lien direct à partager : `/adherer/?src=whatsapp`.
- Blog : articles dans `articles.mjs` (3 derniers en bas de l'accueil, une page par article). Journée culturelle : article « À venir », détails à fournir par Kevin.
- Sources des vocaux du projet : voir `../comoriens-toulouse/CLAUDE.md` (hors dépôt).

## Build
Ne pas éditer les .html à la main. Source : `build.mjs`, `config.mjs`, `articles.mjs`, `members.json`, `assets/style.css`, `assets/app.js`, `assets/inscription.js`.
- `node build.mjs`
- Formulaire `/adherer/` : envoi vers Supabase (`SUPABASE_URL` + `SUPABASE_ANON_KEY`, schéma `supabase/schema.sql`) ; tant que c'est vide, chaque inscription part en message WhatsApp pré-rempli vers `WHATSAPP`.
- Liste des domaines : `DOMAINES` dans build.mjs, à garder alignée avec la table `domaines` du schéma.
- Cagnotte : `CAGNOTTE_URL` (HelloAsso), `CAGNOTTE_WIDGET`, `CAGNOTTE_PROJECT`, `CAGNOTTE_TEXT`, `CAGNOTTE_GOAL`, `CAGNOTTE_RAISED`.
- Annuaire : ajouter les membres (avec leur accord) dans `members.json` :
  `{"nom":"", "entreprise":"", "activite":"", "secteur":"", "ville":"", "description":"", "telephone":"", "whatsapp":"336…", "email":"", "site":""}`
- `assets/og.png` = image d'aperçu WhatsApp (1200×630), à refaire si le nom change.
