// Tout ce qui est à compléter est ici. Modifier puis lancer : node build.mjs
// Les variables d'environnement du même nom ont la priorité (ex. NAME="..." node build.mjs).
const env = process.env;
export const CONFIG = {
  // Nom provisoire : l'association n'a pas encore de nom. Le changer ici le change partout.
  NAME:        env.NAME        || 'Réseau des entrepreneurs comoriens de Toulouse',
  SHORT:       env.SHORT       || 'Réseau Comores Toulouse',
  // Adresse publique du site (sans / final). Sert aux balises de partage WhatsApp.
  BASE:        (env.BASE       || 'https://kevinhadad36.github.io/entraide-comores-toulouse').replace(/\/$/, ''),

  // Contacts (vides = masqués)
  EMAIL:       env.EMAIL       || '',
  WHATSAPP:    env.WHATSAPP    || '',   // format international sans + ni espaces, ex. 33612345678

  // Formulaire d'adhésion : URL d'envoi (Formspree, Web3Forms, Getform…).
  // Vide = les réponses sont envoyées par WhatsApp (si WHATSAPP) ou par e-mail (si EMAIL).
  FORM_ENDPOINT:   env.FORM_ENDPOINT   || '',
  FORM_ACCESS_KEY: env.FORM_ACCESS_KEY || '',   // uniquement pour Web3Forms

  // Cagnotte (HelloAsso conseillé). Vides = « ouverture prochaine ».
  CAGNOTTE_URL:     env.CAGNOTTE_URL     || '',  // lien de la page de don
  CAGNOTTE_WIDGET:  env.CAGNOTTE_WIDGET  || '',  // URL du widget HelloAsso (iframe), facultatif
  CAGNOTTE_PROJECT: env.CAGNOTTE_PROJECT || '',  // nom du projet soutenu
  CAGNOTTE_TEXT:    env.CAGNOTTE_TEXT    || '',  // 2-3 phrases sur le projet
  CAGNOTTE_GOAL:    Number(env.CAGNOTTE_GOAL   || 0),  // objectif en € (0 = pas de jauge)
  CAGNOTTE_RAISED:  Number(env.CAGNOTTE_RAISED || 0),  // montant collecté en €

  UMAMI_ID:    env.UMAMI_ID    || '',
};
