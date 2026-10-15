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
  WHATSAPP:    env.WHATSAPP    || '33641478339',   // format international sans + ni espaces, ex. 33612345678

  // Formulaire d'inscription (/adherer/) → base Supabase (schéma : supabase/schema.sql).
  // Supabase > Project Settings > API : « Project URL » et clé « anon public » (faite pour être publique).
  // Vides = chaque inscription est envoyée sur le WhatsApp ci-dessus, pour ne rien perdre en attendant la base.
  SUPABASE_URL:      env.SUPABASE_URL      || '',
  SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || '',

  // Cagnotte (HelloAsso conseillé). Vides = « ouverture prochaine ».
  CAGNOTTE_URL:     env.CAGNOTTE_URL     || '',  // lien de la page de don
  CAGNOTTE_WIDGET:  env.CAGNOTTE_WIDGET  || '',  // URL du widget HelloAsso (iframe), facultatif
  CAGNOTTE_PROJECT: env.CAGNOTTE_PROJECT || '',  // nom du projet soutenu
  CAGNOTTE_TEXT:    env.CAGNOTTE_TEXT    || '',  // 2-3 phrases sur le projet
  CAGNOTTE_GOAL:    Number(env.CAGNOTTE_GOAL   || 0),  // objectif en € (0 = pas de jauge)
  CAGNOTTE_RAISED:  Number(env.CAGNOTTE_RAISED || 0),  // montant collecté en €

  UMAMI_ID:    env.UMAMI_ID    || '',
};
