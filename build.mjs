// Génère le site : index.html, une page par section (reseautage/, annuaire/, competences/, projets/, financement/, cagnotte/),
// blog/ (+ un dossier par article), adherer/ (formulaire d'inscription), mentions-legales/, sitemap.xml, robots.txt.
// Usage : node build.mjs   (réglages dans config.mjs ; membres dans members.json ; articles dans articles.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG as C } from './config.mjs';
import { ARTICLES } from './articles.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const out = (p, s) => { const f = path.join(DIR, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const eur = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const TODAY = new Date().toISOString().slice(0, 10);
const MEMBERS = JSON.parse(fs.readFileSync(path.join(DIR, 'members.json'), 'utf8'));

// ---------- logo : croissant + 4 étoiles (drapeau des Comores) ----------
const star = (cx, cy, r) => {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r;
    p.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${p.join(' ')}"/>`;
};
const LOGO = (id = 'm') => `<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="#1f6b3a"/><mask id="${id}"><rect width="32" height="32" fill="#fff"/><circle cx="19" cy="16" r="8.4" fill="#000"/></mask><circle cx="15" cy="16" r="10" fill="#fff" mask="url(#${id})"/><g fill="#fff">${star(20.6, 9.6, 1.55)}${star(22.3, 13.9, 1.55)}${star(22.3, 18.1, 1.55)}${star(20.6, 22.4, 1.55)}</g></svg>`;
fs.mkdirSync(path.join(DIR, 'assets'), { recursive: true });
out('assets/logo.svg', `<svg xmlns="http://www.w3.org/2000/svg" ${LOGO('f').slice(5)}`);

// ---------- icônes (trait 1.5) ----------
const I = {
  arrow: '<svg viewBox="0 0 16 16"><path d="M2 8h12M9 3l5 5-5 5"/></svg>',
  users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.6c2.6.2 4.4 1.9 5 5.4"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/></svg>',
  build: '<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/></svg>',
  seed: '<svg viewBox="0 0 24 24"><path d="M12 21v-9"/><path d="M12 12c0-4 3-7 8-7 0 4-3 7-8 7z"/><path d="M12 14c0-3-2.5-5.5-7-5.5 0 3 2.5 5.5 7 5.5z"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.4-7.5 10-7.5 10z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M4 19.5l1.3-3.8A8 8 0 1 1 8.4 19z"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 8h16M4 16h16"/></svg>',
};

// ---------- gabarit commun ----------
const NAV = [
  ['reseautage/', 'Réseautage'], ['annuaire/', 'Annuaire'], ['competences/', 'Compétences'], ['projets/', 'Projets'],
  ['financement/', 'Financement'], ['cagnotte/', 'Cagnotte'], ['blog/', 'Blog'],
];
const analytics = C.UMAMI_ID ? `<script defer src="https://cloud.umami.is/script.js" data-website-id="${C.UMAMI_ID}"></script>` : '';

function page({ slug = '', title, desc, body, minimal = false, scripts = [], ogType = 'website' }) {
  const root = slug ? '../'.repeat(slug.split('/').filter(Boolean).length) : '';
  const url = `${C.BASE}/${slug}`;
  const current = h => h && slug.startsWith(h) ? ' aria-current="page"' : '';
  const nav = NAV.map(([h, l]) => `<li><a href="${root}${h}"${current(h)}>${l}</a></li>`).join('');
  const drawer = `<a href="${root || './'}">Accueil</a>` + NAV.map(([h, l]) => `<a href="${root}${h}">${l}</a>`).join('') + `<a href="${root}adherer/">Adhérer au réseau</a>`;
  const brand = `<a class="brand" href="${root || './'}">${LOGO('lg')}<span>${esc(C.SHORT)}<small>Entraide · Toulouse</small></span></a>`;
  return `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${ogType}"><meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="${esc(C.NAME)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${C.BASE}/assets/og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f7f5ef">
<link rel="icon" href="${root}assets/logo.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400&family=Inter+Tight:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}assets/style.css">
${analytics}
</head><body>
${minimal ? '' : `<div class="announce">Association en cours de création · <a href="${root}adherer/">Rejoignez les membres fondateurs</a></div>`}
<header class="top"><div class="wrap nav">
${brand}
${minimal ? '' : `<ul>${nav}</ul>`}
<div class="nav-right">${minimal
    ? `<a class="btn btn-out" href="${root || './'}">Découvrir le réseau</a>`
    : `<a class="btn btn-hl" href="${root}adherer/">Adhérer</a><button class="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="drawer">${I.menu}</button>`}</div>
</div>${minimal ? '' : `<nav class="drawer" id="drawer">${drawer}</nav>`}</header>
<main>
${body(root)}
</main>
<footer><div class="wrap">
<div class="foot">
<div>${brand}<p style="margin-top:18px;max-width:38ch">${esc(C.NAME)} : entraide, réseau et financement éthique entre entrepreneurs de la communauté comorienne.</p></div>
<div><h4>Le réseau</h4><ul><li><a href="${root || './'}">Accueil</a></li>${NAV.map(([h, l]) => `<li><a href="${root}${h}">${l}</a></li>`).join('')}<li><a href="${root}adherer/">Adhérer</a></li></ul></div>
<div><h4>Contact</h4><ul>${C.WHATSAPP ? `<li><a href="https://wa.me/${C.WHATSAPP}">WhatsApp</a></li>` : ''}${C.EMAIL ? `<li><a href="mailto:${C.EMAIL}">${esc(C.EMAIL)}</a></li>` : ''}<li><a href="${root}adherer/">Formulaire d’adhésion</a></li><li><a href="${root}mentions-legales/">Mentions légales</a></li></ul></div>
</div>
<div class="foot-bottom"><span>Association en cours de création · Toulouse, Occitanie</span><span>Karibu.</span></div>
</div></footer>
<script src="${root}assets/app.js" defer></script>${scripts.map(s => `\n<script src="${root}assets/${s}" defer></script>`).join('')}
</body></html>`;
}

// ---------- ACCUEIL ----------
const PILLARS = [
  { n: '01', ic: 'users', t: 'Se rencontrer', d: 'Des rencontres régulières entre membres, des mises en relation ciblées, un carnet d’adresses qui grandit à chaque nouvel adhérent.', href: 'reseautage/', more: 'Le réseautage', wide: true },
  { n: '02', ic: 'search', t: 'Se trouver', d: 'Un plombier, un comptable, un traiteur, un développeur ? Avant d’aller chercher ailleurs, cherchez chez nous : l’annuaire des membres est fait pour ça.', href: 'annuaire/', more: 'Ouvrir l’annuaire', wide: true },
  { n: '03', ic: 'share', t: 'Partager', d: 'Compétences, bons plans, démarches administratives, retours d’expérience : ce que l’un a appris, tout le monde en profite.', href: 'competences/', more: 'Le partage de compétences' },
  { n: '04', ic: 'build', t: 'Bâtir', d: 'Des projets d’envergure, communautaires ou non, que personne ne porterait seul. Nous mettons en commun les moyens et les savoir-faire.', href: 'projets/', more: 'Les projets' },
  { n: '05', ic: 'seed', t: 'Financer', d: 'Soutenir les nouveaux entrepreneurs de la diaspora : un coup de pouce de l’association ou un accompagnement vers des financements halal.', href: 'financement/', more: 'Le volet financement', hl: true },
];
const FAQ = [
  ['Faut-il être comorien pour adhérer ?', 'Le réseau est pensé pour la communauté comorienne de Toulouse et de sa région, et pour toutes celles et ceux qui ont un lien avec les Comores. Vous vous posez la question ? Remplissez le formulaire, nous en parlerons ensemble.'],
  ['Je ne suis pas encore entrepreneur, je peux venir ?', 'Oui, et c’est même une des raisons d’être du réseau. Porteurs de projet, étudiants, salariés qui veulent se lancer : vous trouverez ici des gens qui sont passés par là.'],
  ['L’adhésion est-elle payante ?', 'Le formulaire est gratuit et ne vous engage à rien. Les modalités de cotisation seront fixées collectivement lors de la création officielle de l’association, et communiquées à tous les inscrits.'],
  ['Faut-il habiter Toulouse ?', 'Les rencontres ont lieu à Toulouse et autour. Le volet financement et accompagnement peut s’ouvrir plus largement à la diaspora en France : inscrivez-vous en précisant votre ville.'],
  ['Qu’entendez-vous par « financement halal » ?', 'Un financement sans intérêt (sans riba), qui ne repose pas sur la spéculation et qui partage le risque plutôt que de le faire porter au seul emprunteur. Concrètement : prêts à taux zéro, apports en capital, financement participatif, contrats de finance islamique quand ils sont disponibles.'],
  ['Qui voit mes informations ?', 'Votre âge, votre téléphone, votre e-mail et votre adresse ne sont jamais publiés. Dans l’annuaire, vous choisissez d’apparaître sous votre prénom ou de façon anonyme, et vous pouvez demander à tout moment la modification ou la suppression de vos données.'],
];

// ---------- blog : carte d'article réutilisée sur l'accueil et sur /blog/ ----------
const dateFr = d => new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const postCard = (a, r) => `<a class="card post reveal" href="${r}blog/${a.slug}/">
  <div class="post-meta"><span class="tag${a.aVenir ? ' soon' : ''}">${esc(a.aVenir ? 'À venir' : a.categorie)}</span><time datetime="${a.date}">${dateFr(a.date)}</time></div>
  <h3>${esc(a.titre)}</h3><p>${esc(a.resume)}</p><span class="more">Lire l’article ${I.arrow}</span>
</a>`;

const home = page({
  title: `${C.NAME} · Entraide, réseau et financement halal`,
  desc: 'Le réseau d’entraide des entrepreneurs comoriens de Toulouse : rencontres, annuaire des membres, partage de compétences, projets communs et financement halal. Rejoignez les membres fondateurs.',
  body: r => `
<div class="hero"><div class="wrap hero-grid">
  <div>
    <span class="label">Karibu · Toulouse &amp; Occitanie</span>
    <h1>Entreprendre <span class="hl">ensemble</span>, entre Comoriens de Toulouse.</h1>
    <p class="lead">Un réseau d’entraide pour les entrepreneurs, indépendants et porteurs de projet de la communauté. On se connaît, on se recommande, on se finance, et on bâtit ensemble.</p>
    <div class="cta">
      <a class="btn btn-hl" href="${r}adherer/">Rejoindre le réseau ${I.arrow}</a>
      <a class="btn btn-out" href="${r}annuaire/">Trouver un pro de chez nous</a>
    </div>
  </div>
  <div class="panel reveal" aria-hidden="true">
    <div class="panel-bar"><i></i><i></i><i></i><span>Ce que vous trouvez dans le réseau</span></div>
    <div class="panel-body">
      <div class="search">${I.search}<span>Je cherche… un comptable</span><span class="caret"></span></div>
      <div class="chips"><span class="chip on">Tous</span><span class="chip">Bâtiment</span><span class="chip">Restauration</span><span class="chip">Transport</span><span class="chip">Conseil</span></div>
      <ul class="rows">
        <li><span class="ic">${I.users}</span><div><b>Rencontres entre membres</b><small>Réseautage, mises en relation</small></div><span class="st">Réseau</span></li>
        <li><span class="ic">${I.share}</span><div><b>Partage de compétences</b><small>Ateliers, bons plans, démarches</small></div><span class="st">Savoir</span></li>
        <li><span class="ic">${I.build}</span><div><b>Projets d’envergure</b><small>Communautaires ou non</small></div><span class="st">Projets</span></li>
        <li><span class="ic">${I.seed}</span><div><b>Financement sans intérêt</b><small>Coup de pouce ou accompagnement</small></div><span class="st go">Halal</span></li>
      </ul>
    </div>
  </div>
</div></div>

<div class="ticker on-dark"><div class="wrap"><ul>
  ${[['reseautage/', 'Réseautage'], ['annuaire/', 'Annuaire des membres'], ['competences/', 'Partage de compétences'], ['projets/', 'Projets d’envergure'], ['financement/', 'Financement halal'], ['cagnotte/', 'Cagnotte communautaire']]
    .map(([h, l], i) => `<li><a href="${r}${h}"><span>0${i + 1}</span>${l}</a></li>`).join('')}
</ul></div></div>

<section><div class="wrap manifesto-grid">
  <p class="manifesto reveal">Quand on a besoin d’un artisan, d’un comptable ou d’un traiteur, on va chercher ailleurs. <span class="dim">Alors que bien souvent, la compétence est déjà chez nous.</span> Ce réseau existe pour qu’on se trouve, qu’on se fasse confiance, et qu’on avance ensemble.</p>
  <div><span class="label">Notre idée</span><p class="muted" style="margin-top:14px">Chaque contrat passé entre nous, chaque conseil partagé, chaque euro investi dans un projet de la communauté renforce tout le monde. C’est aussi simple que ça.</p></div>
</div></section>

<section class="paper" id="piliers"><div class="wrap">
  <div class="head split"><div><span class="label">Ce que nous faisons</span><h2 style="margin-top:16px">Cinq façons de s’épauler.</h2></div><p>Le réseau se construit avec ses membres. Voici ce que nous mettons en place dès le départ, et ce que nous voulons faire grandir ensemble.</p></div>
  <div class="pillars">
  ${PILLARS.map(p => `<${p.href ? `a href="${r}${p.href}"` : 'div'} class="card reveal${p.wide ? ' wide' : ''}${p.hl ? ' hl' : ''}">
    <div style="display:flex;justify-content:space-between;align-items:center"><span class="icon">${I[p.ic]}</span><span class="num">${p.n}</span></div>
    <h3>${p.t}</h3><p>${p.d}</p>${p.more ? `<span class="more">${p.more} ${I.arrow}</span>` : ''}
  </${p.href ? 'a' : 'div'}>`).join('')}
  <a href="${r}cagnotte/" class="card wash full reveal">
    <div style="display:flex;justify-content:space-between;align-items:center"><span class="icon" style="background:#fff">${I.heart}</span><span class="num">06</span></div>
    <h3>Contribuer</h3><p>La cagnotte du réseau finance des projets communautaires. Membre ou non, chacun peut y participer.</p><span class="more">Voir la cagnotte ${I.arrow}</span>
  </a>
  </div>
</div></section>

<section><div class="wrap">
  <div class="head split"><div><span class="label">Adhérer</span><h2 style="margin-top:16px">Rejoindre le réseau, c’est simple.</h2></div><p>Pas de paperasse au départ. Un formulaire de deux minutes, et nous revenons vers vous.</p></div>
  <ol class="steps">
    <li><h3>Vous remplissez le formulaire</h3><p>Qui vous êtes, ce que vous faites, ce que vous pouvez apporter et ce que vous cherchez.</p></li>
    <li><h3>Nous vous recontactons</h3><p>Un membre de l’équipe vous appelle ou vous écrit pour faire connaissance et vous intégrer au réseau.</p></li>
    <li><h3>Vous entrez dans le cercle</h3><p>Rencontres, échanges entre membres, et si vous le souhaitez, votre activité dans l’annuaire.</p></li>
  </ol>
  <div class="cta" style="margin-top:40px"><a class="btn btn-hl" href="${r}adherer/">Remplir le formulaire ${I.arrow}</a></div>
</div></section>

<section style="padding-top:0"><div class="wrap">
  <div class="dark on-dark reveal">
    <div><span class="label">Financement</span><h2 style="margin:16px 0 18px">Financer nos projets, sans riba.</h2>
    <p>Lancer une activité demande des fonds. Nous voulons que les nouveaux entrepreneurs de la diaspora puissent le faire sans renoncer à leurs valeurs : soutien direct de l’association quand c’est possible, et accompagnement vers des solutions sans intérêt.</p>
    <div class="cta" style="margin-top:28px"><a class="btn btn-hl" href="${r}financement/">Découvrir le volet financement ${I.arrow}</a></div></div>
    <ul class="dark-list">
      <li>Prêts à taux zéro<span>prêts d’honneur</span></li>
      <li>Apports en capital<span>associés, membres</span></li>
      <li>Financement participatif<span>don ou capital</span></li>
      <li>Finance islamique<span>mourabaha, moucharaka…</span></li>
      <li>Coup de pouce du réseau<span>selon les fonds</span></li>
    </ul>
  </div>
</div></section>

<section class="paper"><div class="wrap two">
  <div><span class="label">Pour qui</span><h2 style="margin-top:16px">Une place pour chacun.</h2><p class="muted" style="margin-top:18px">Que vous ayez dix salariés ou seulement une idée, le réseau a besoin de vous, et vous de lui.</p></div>
  <ul class="who">
    <li><b>Entrepreneurs installés</b><span>Trouvez des partenaires et des clients de confiance, transmettez votre expérience.</span></li>
    <li><b>Indépendants &amp; artisans</b><span>Faites-vous connaître auprès de la communauté et sortez de l’isolement.</span></li>
    <li><b>Porteurs de projet</b><span>Profitez de conseils concrets et d’un accompagnement vers le financement.</span></li>
    <li><b>Étudiants &amp; jeunes diplômés</b><span>Rencontrez celles et ceux qui ont déjà fait le chemin.</span></li>
    <li><b>Soutiens</b><span>Pas entrepreneur, mais envie de contribuer ? Vos compétences et votre réseau comptent.</span></li>
  </ul>
</div></section>

<section><div class="wrap">
  <div class="head"><span class="label">Nos valeurs</span><h2 style="margin-top:16px">Ce qui nous tient ensemble.</h2></div>
  <div class="pillars">
    <div class="card reveal wide"><span class="num">Entraide</span><h3>On se recommande d’abord.</h3><p>Quand un membre a besoin d’un service, le réflexe est de regarder dans le réseau.</p></div>
    <div class="card reveal wide"><span class="num">Confiance</span><h3>La parole donnée compte.</h3><p>Sérieux, délais tenus, travail bien fait : la réputation de chacun fait celle de tous.</p></div>
    <div class="card reveal wide"><span class="num">Transmission</span><h3>Les anciens ouvrent la route.</h3><p>Ceux qui ont réussi accompagnent ceux qui commencent. C’est ainsi que la communauté grandit.</p></div>
    <div class="card reveal wide"><span class="num">Éthique</span><h3>Une finance qui nous ressemble.</h3><p>Pas d’intérêt, pas de spéculation : des financements en accord avec nos valeurs.</p></div>
  </div>
</div></section>

<section class="paper" id="faq"><div class="wrap faq-grid">
  <div><span class="label">Questions</span><h2 style="margin-top:16px">Vous vous demandez peut-être…</h2></div>
  <div class="faq">${FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
</div></section>

<section id="blog"><div class="wrap">
  <div class="head split"><div><span class="label">Le blog</span><h2 style="margin-top:16px">Les nouvelles de la communauté.</h2></div><p>Événements, initiatives et vie de la communauté comorienne de Toulouse.</p></div>
  <div class="posts">${ARTICLES.slice(0, 3).map(a => postCard(a, r)).join('')}</div>
  <div class="cta" style="margin-top:32px"><a class="btn btn-out" href="${r}blog/">Tous les articles</a></div>
</div></section>

<section style="padding-top:0"><div class="wrap">
  <div class="final reveal">
    <div><span class="label" style="color:var(--ink)">Membres fondateurs</span><h2 style="margin-top:16px">Le réseau commence maintenant. Soyez des premiers.</h2></div>
    <div class="cta"><a class="btn btn-dark" href="${r}adherer/">Adhérer au réseau ${I.arrow}</a></div>
  </div>
</div></section>`,
});
out('index.html', home);

// ---------- ADHÉRER : formulaire d'inscription à l'annuaire (page épurée, partagée par WhatsApp) ----------
// Domaines : garder aligné avec la table `domaines` de supabase/schema.sql
const DOMAINES = [
  ['batiment', 'Bâtiment, travaux, plomberie, électricité'], ['auto', 'Mécanique, automobile, transport'],
  ['cuisine', 'Cuisine, traiteur, plats faits maison'], ['beaute', 'Coiffure, beauté, couture'],
  ['sante', 'Santé, aide à la personne'], ['education', 'Enseignement, soutien scolaire, garde d’enfants'],
  ['compta', 'Comptabilité, banque, finance, assurance'], ['juridique', 'Juridique, administratif, démarches'],
  ['informatique', 'Informatique, numérique, développement'], ['image', 'Graphisme, photo, vidéo, communication'],
  ['commerce', 'Commerce, vente, import-export'], ['evenementiel', 'Événementiel, musique, animation'],
  ['immobilier', 'Immobilier, logement'], ['tourisme', 'Tourisme, hôtellerie, restauration'],
  ['sport', 'Sport, coaching'], ['autre', 'Autre'],
];
const radio = (name, v, l, checked = false) => `<label class="opt"><input type="radio" name="${name}" value="${v}"${checked ? ' checked' : ''}><span>${l}</span></label>`;

const adherer = page({
  slug: 'adherer/', minimal: true, scripts: ['inscription.js'],
  title: `Rejoindre l’annuaire · ${C.NAME}`,
  desc: 'Rejoignez l’annuaire de la communauté comorienne de Toulouse : faites connaître votre métier et trouvez quelqu’un de la communauté près de chez vous. 2 minutes, gratuit.',
  body: r => `
<div class="wrap form-wrap">
  <div>
    <div class="sticky">
      <span class="label">Inscription</span>
      <h1 style="font-size:clamp(2.4rem,6vw,3.5rem);margin:16px 0 18px;line-height:1">On est nombreux à Toulouse. Faisons-nous connaître.</h1>
      <p class="lead muted" style="font-size:1.125rem">Mécanicien, comptable, coiffeuse, étudiant, maman qui cuisine… La communauté a des talents partout, mais on ne se connaît pas. Ce formulaire construit l’annuaire de la communauté : demain, vous trouverez quelqu’un près de chez vous, et on pourra vous trouver aussi.</p>
      <ul class="aside-list">
        <li>${I.clock}<span>Environ 2 minutes</span></li>
        <li>${I.check}<span>Gratuit, sans but commercial : le seul objectif est de tisser des liens</span></li>
        <li>${I.users}<span>Vous choisissez d’apparaître sous votre prénom ou de façon anonyme</span></li>
        <li>${I.lock}<span>Jamais publiés : votre âge, votre téléphone, votre e-mail, votre adresse</span></li>
      </ul>
      <p style="margin-top:28px"><a class="link" href="${r}">Découvrir le réseau d’abord</a></p>
    </div>
  </div>

  <div>
  <form class="join" id="inscription" novalidate
    data-supabase-url="${esc(C.SUPABASE_URL)}" data-supabase-key="${esc(C.SUPABASE_ANON_KEY)}" data-whatsapp="${esc(C.WHATSAPP)}">
    <div class="progress" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i><i></i></div>

    <fieldset>
      <legend><small>01</small>Qui êtes-vous ?</legend>
      <div class="fgrid c2">
        <label class="field"><span>Prénom</span><input type="text" name="prenom" maxlength="80" autocomplete="given-name" required></label>
        <label class="field"><span>Nom</span><input type="text" name="nom" maxlength="80" autocomplete="family-name" required></label>
      </div>
      <div class="field"><span class="group-title">Vous êtes</span><div class="opts">${radio('sexe', 'femme', 'Une femme')}${radio('sexe', 'homme', 'Un homme')}</div></div>
      <div class="field">
        <span class="group-title">Naissance</span>
        <div class="opts">${radio('naiss_mode', 'date', 'Je donne ma date', true)}${radio('naiss_mode', 'annee', 'Seulement l’année')}</div>
        <div class="naiss">
          <input type="date" name="date_naissance" aria-label="Date de naissance">
          <input type="number" name="annee_naissance" aria-label="Année de naissance" placeholder="ex. 1990" min="1920" inputmode="numeric" hidden>
          <output id="age-preview"></output>
        </div>
        <span class="hint">Sert uniquement aux statistiques de la communauté. Votre âge se met à jour tout seul et n’est jamais affiché.</span>
      </div>
    </fieldset>

    <fieldset>
      <legend><small>02</small>Où êtes-vous ?</legend>
      <div class="fgrid c2">
        <label class="field"><span>Commune</span>
          <span class="combo"><input type="text" name="commune" required autocomplete="off" placeholder="Toulouse, Blagnac, Colomiers…" aria-autocomplete="list" aria-controls="commune-list"><ul id="commune-list" role="listbox" hidden></ul></span>
        </label>
        <label class="field"><span>Quartier <em>(facultatif)</em></span><input type="text" name="quartier" maxlength="80" placeholder="Mirail, Bagatelle, Empalot…"></label>
      </div>
      <span class="hint" style="margin-top:-6px">Sur la future carte, vous serez placé au centre de votre commune, jamais à votre adresse.</span>
      <div class="field"><span class="group-title">Jusqu’où pouvez-vous vous déplacer pour rendre service ?</span>
        <div class="opts">${radio('rayon_km', '0', 'Pas de déplacement')}${radio('rayon_km', '5', '5 km')}${radio('rayon_km', '10', '10 km', true)}${radio('rayon_km', '20', '20 km')}${radio('rayon_km', '50', 'Toute la région')}</div>
      </div>
    </fieldset>

    <fieldset>
      <legend><small>03</small>Ce que vous faites</legend>
      <div class="fgrid c2">
        <label class="field"><span>Domaine</span><select name="domaine" required><option value="">Choisir</option>${DOMAINES.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select></label>
        <label class="field"><span>Votre métier ou ce que vous savez faire</span><input type="text" name="metier" maxlength="120" required placeholder="ex. Mécanicien auto, comptable…"></label>
      </div>
      <div class="field"><span class="group-title">Situation</span>
        <div class="opts">${radio('situation', 'salarie', 'Salarié·e')}${radio('situation', 'independant', 'À mon compte')}${radio('situation', 'etudiant', 'Étudiant·e')}${radio('situation', 'recherche', 'En recherche')}${radio('situation', 'retraite', 'Retraité·e')}${radio('situation', 'autre', 'Autre')}</div>
      </div>
      <label class="check"><input type="checkbox" name="cherche_stage"><span>Je cherche un <b>stage, une alternance ou un emploi</b> : la communauté peut m’aider.</span></label>
      <label class="field"><span>Quelques mots <em>(facultatif)</em></span><textarea name="description" maxlength="600" placeholder="Ce que vous proposez, vos disponibilités, ce que vous cherchez…"></textarea><span class="hint"><span id="desc-count">0</span>/600</span></label>
    </fieldset>

    <fieldset>
      <legend><small>04</small>Comment vous joindre</legend>
      <span class="hint" style="margin-top:-8px">Jamais publié. L’équipe s’en sert pour vous mettre en relation quand quelqu’un vous cherche. Au moins un des deux.</span>
      <div class="fgrid c2">
        <label class="field"><span>Téléphone</span><input type="tel" name="telephone" autocomplete="tel" inputmode="tel" placeholder="06 12 34 56 78"></label>
        <label class="field"><span>E-mail</span><input type="email" name="email" autocomplete="email" placeholder="vous@exemple.fr"></label>
      </div>
      <label class="check"><input type="checkbox" name="whatsapp" checked><span>Ce numéro est joignable sur WhatsApp</span></label>
    </fieldset>

    <fieldset>
      <legend><small>05</small>Comment apparaître</legend>
      <div class="choices" role="radiogroup" aria-label="Visibilité">
        <label class="choice"><input type="radio" name="visibilite" value="public"><b>Sous mon prénom</b><small>Affiché « <i id="preview-nom">Prénom N.</i> » avec votre métier et votre commune.</small></label>
        <label class="choice"><input type="radio" name="visibilite" value="anonyme"><b>De façon anonyme</b><small>Seuls votre métier et votre commune apparaissent. On vous contacte via l’équipe.</small></label>
      </div>
      <label class="check"><input type="checkbox" name="consentement" required><span>J’accepte que ces informations soient enregistrées pour l’annuaire de la communauté et affichées selon mon choix ci-dessus. Je peux demander à tout moment leur modification ou leur suppression. <a class="link" href="${r}mentions-legales/">En savoir plus</a></span></label>
    </fieldset>

    <div class="form-msg err" id="form-error" role="alert" hidden></div>
    <div class="form-foot">
      <p>Gratuit, sans engagement. Votre fiche est vérifiée par l’équipe avant d’être mise en ligne.</p>
      <button class="btn btn-hl" type="submit">Rejoindre l’annuaire ${I.arrow}</button>
    </div>
  </form>

  <div class="done" id="done" tabindex="-1">
    <div class="big">${I.check}</div>
    <h2>Merci, <span id="merci-prenom"></span> !</h2>
    <p class="muted" id="merci-texte">Votre fiche est enregistrée. L’équipe la vérifie avant de la mettre en ligne.</p>
    <div class="token" id="token" hidden>
      <p><b>Gardez ce code</b> : il vous permettra de modifier ou supprimer votre fiche plus tard.</p>
      <code id="jeton"></code><button type="button" class="btn btn-out" id="copy-jeton">Copier</button>
    </div>
    <p class="muted">Faites tourner le lien autour de vous : plus on est nombreux, plus l’annuaire est utile.</p>
    <div class="cta"><a class="btn btn-hl" id="wa-share" href="#" target="_blank" rel="noopener">${I.chat} Partager sur WhatsApp</a><a class="btn btn-out" href="${r}">Découvrir le réseau</a></div>
  </div>
  </div>
</div>`,
});
out('adherer/index.html', adherer);

// ---------- ANNUAIRE ----------
const sectors = [...new Set(MEMBERS.map(m => m.secteur).filter(Boolean))].sort();
const memberCard = m => {
  const acts = [];
  if (m.whatsapp) acts.push(`<a href="https://wa.me/${esc(m.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>`);
  if (m.telephone) acts.push(`<a href="tel:${esc(m.telephone.replace(/\s/g, ''))}">Appeler</a>`);
  if (m.email) acts.push(`<a href="mailto:${esc(m.email)}">E-mail</a>`);
  if (m.site) acts.push(`<a href="${esc(m.site)}" target="_blank" rel="noopener">Site</a>`);
  const hay = [m.nom, m.entreprise, m.activite, m.secteur, m.ville, m.description].join(' ').toLowerCase();
  return `<article class="card member" data-sector="${esc(m.secteur || '')}" data-hay="${esc(hay)}">
<span class="sector">${esc(m.secteur || '')}</span><h3>${esc(m.entreprise || m.nom)}</h3>
<p class="meta">${esc([m.entreprise ? m.nom : '', m.activite, m.ville].filter(Boolean).join(' · '))}</p>
${m.description ? `<p>${esc(m.description)}</p>` : ''}
<div class="actions">${acts.join('')}</div></article>`;
};
const annuaire = page({
  slug: 'annuaire/',
  title: `Annuaire des membres · ${C.NAME}`,
  desc: 'Trouvez un professionnel de la communauté comorienne à Toulouse : artisans, commerçants, consultants, indépendants. Cherchez chez nous d’abord.',
  body: r => `
<div class="page-hero"><div class="wrap">
  <p class="crumb"><a href="${r}">Accueil</a> › Annuaire</p>
  <h1>Cherchez chez nous d’abord.</h1>
  <p class="lead">Les membres du réseau et leurs activités. Besoin d’un service ? Contactez directement un pro de la communauté.</p>
</div></div>
<section style="padding-top:48px"><div class="wrap">
${MEMBERS.length ? `
  <div class="dir-tools">
    <input type="text" id="dir-q" placeholder="Rechercher un métier, un nom, une ville…" aria-label="Rechercher dans l’annuaire">
    <div class="chips" id="dir-chips" style="margin:0"><button class="chip on" data-s="">Tous</button>${sectors.map(s => `<button class="chip" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>
  </div>
  <div class="dir" id="dir">${MEMBERS.map(memberCard).join('')}</div>
  <p class="muted" id="dir-none" hidden style="margin-top:24px">Aucun membre ne correspond. Essayez un autre mot.</p>` : `
  <div class="empty">
    <span class="label">L’annuaire se construit</span>
    <h3>Les premières fiches arrivent avec les premiers adhérents.</h3>
    <p class="muted">Chaque membre qui le souhaite apparaît ici avec son activité et son contact. Vous avez une activité ? Inscrivez-vous et soyez parmi les premiers référencés.</p>
    <div class="cta"><a class="btn btn-hl" href="${r}adherer/">M’inscrire dans l’annuaire ${I.arrow}</a></div>
  </div>`}
  <p class="note" style="margin-top:40px">Les fiches sont publiées uniquement avec l’accord de chaque membre. Pour modifier ou retirer la vôtre, contactez-nous.</p>
</div></section>`,
});
out('annuaire/index.html', annuaire);

// ---------- FINANCEMENT ----------
const financement = page({
  slug: 'financement/',
  title: `Financement halal des entrepreneurs · ${C.NAME}`,
  desc: 'Comment nous aidons les nouveaux entrepreneurs de la diaspora comorienne à financer leur projet sans intérêt : soutien du réseau, prêts à taux zéro, apports en capital, finance islamique.',
  body: r => `
<div class="page-hero"><div class="wrap">
  <p class="crumb"><a href="${r}">Accueil</a> › Financement</p>
  <span class="label">Financement &amp; accompagnement</span>
  <h1>Lancer son projet, sans renoncer à ses valeurs.</h1>
  <p class="lead">Beaucoup d’entre nous renoncent à un crédit classique à cause des intérêts. Nous voulons que ce ne soit plus un frein : le réseau aide les nouveaux entrepreneurs de la diaspora à trouver un financement halal.</p>
  <div class="cta" style="margin-top:28px"><a class="btn btn-hl" href="${r}adherer/">Présenter mon projet ${I.arrow}</a></div>
</div></div>

<section><div class="wrap">
  <div class="head split"><div><span class="label">Deux façons de vous aider</span><h2 style="margin-top:16px">Le réseau finance, ou vous accompagne.</h2></div><p>Selon votre projet et les moyens de l’association, nous intervenons directement, ou nous vous aidons à aller chercher les bons financements.</p></div>
  <div class="pillars">
    <div class="card hl wide reveal"><span class="icon">${I.seed}</span><span class="num">Voie 1</span><h3>Le coup de pouce du réseau</h3><p>À mesure que l’association grandit, une partie de ses ressources (cotisations, dons, cagnotte) pourra soutenir directement des projets de membres, sans intérêt.</p><ul><li>Avance remboursable sans intérêt</li><li>Mise en relation avec des membres prêts à investir comme associés</li><li>Les règles d’attribution seront décidées collectivement</li></ul></div>
    <div class="card wide reveal"><span class="icon">${I.users}</span><span class="num">Voie 2</span><h3>L’accompagnement vers le bon financement</h3><p>Nous vous aidons à structurer votre dossier et à identifier les solutions compatibles avec vos valeurs.</p><ul><li>Préparation du projet : business plan, prévisionnel, besoins</li><li>Orientation vers les solutions sans intérêt adaptées</li><li>Relecture du dossier par des membres expérimentés</li><li>Suivi après le lancement</li></ul></div>
  </div>
</div></section>

<section class="paper"><div class="wrap two">
  <div><span class="label">Les pistes</span><h2 style="margin-top:16px">Des financements sans riba, ça existe.</h2><p class="muted" style="margin-top:18px">Ces solutions ne conviennent pas à tous les projets. C’est justement pour ça que nous les étudions avec vous, au cas par cas.</p></div>
  <div class="faq">
    <details open><summary>Prêts d’honneur à taux zéro</summary><p>Des prêts personnels sans intérêt et sans garantie, accordés au créateur d’entreprise par des réseaux d’accompagnement. Ils renforcent vos fonds propres et facilitent la suite du financement.</p></details>
    <details><summary>Subventions et aides à la création</summary><p>Aides publiques, concours, dispositifs locaux pour les créateurs et repreneurs : pas de remboursement, donc pas d’intérêt. Nous vous aidons à repérer celles auxquelles vous avez droit.</p></details>
    <details><summary>Apports en capital</summary><p>Des investisseurs, y compris des membres du réseau, entrent au capital de votre entreprise : ils partagent les gains comme les risques. C’est le principe de la moucharaka.</p></details>
    <details><summary>Financement participatif</summary><p>Collecter auprès de nombreux contributeurs, en don (avec ou sans contrepartie) ou en capital. Un bon moyen aussi de tester votre marché.</p></details>
    <details><summary>Contrats de finance islamique</summary><p>Mourabaha (achat-revente avec marge connue d’avance), ijara (location), moucharaka (association) : quand des établissements les proposent pour votre besoin, nous vous aidons à comparer.</p></details>
  </div>
</div></section>

<section><div class="wrap">
  <div class="head"><span class="label">Comment ça se passe</span><h2 style="margin-top:16px">Quatre étapes, à vos côtés.</h2></div>
  <ol class="steps" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
    <li><h3>On fait le point</h3><p>Votre projet, votre besoin, vos apports. Sans jugement, entre nous.</p></li>
    <li><h3>On structure</h3><p>Business plan et prévisionnel, avec l’aide des membres qui s’y connaissent.</p></li>
    <li><h3>On oriente</h3><p>Vers le soutien du réseau ou les solutions sans intérêt les plus adaptées.</p></li>
    <li><h3>On suit</h3><p>Le réseau reste à vos côtés après le lancement : clients, conseils, contacts.</p></li>
  </ol>
  <p class="note" style="margin-top:40px">L’association n’est ni une banque ni un conseiller en investissement. Nous vous aidons à préparer votre projet et à vous orienter ; la décision de financement revient toujours aux organismes et aux personnes qui financent.</p>
</div></section>

<section style="padding-top:0"><div class="wrap"><div class="final">
  <div><span class="label" style="color:var(--ink)">Vous avez un projet ?</span><h2 style="margin-top:16px">Parlons-en ensemble.</h2></div>
  <div class="cta"><a class="btn btn-dark" href="${r}adherer/">Présenter mon projet ${I.arrow}</a></div>
</div></div></section>`,
});
out('financement/index.html', financement);

// ---------- CAGNOTTE ----------
const open = !!C.CAGNOTTE_URL;
const pct = C.CAGNOTTE_GOAL ? Math.min(100, Math.round(C.CAGNOTTE_RAISED / C.CAGNOTTE_GOAL * 100)) : 0;
const cagnotte = page({
  slug: 'cagnotte/',
  title: `Cagnotte des projets communautaires · ${C.NAME}`,
  desc: 'Participez à la cagnotte du réseau des entrepreneurs comoriens de Toulouse : chaque contribution finance des projets utiles à la communauté.',
  body: r => `
<div class="page-hero"><div class="wrap">
  <p class="crumb"><a href="${r}">Accueil</a> › Cagnotte</p>
  <span class="label">Cagnotte communautaire</span>
  <h1>Ensemble, on va plus loin.</h1>
  <p class="lead">La cagnotte du réseau finance des projets communautaires et d’envergure. Membre ou non, chacun peut contribuer, quel que soit le montant.</p>
</div></div>

<section><div class="wrap two">
  <div class="card" style="padding:32px">
    <span class="label">${open ? 'Projet en cours' : 'Ouverture prochaine'}</span>
    <h2 style="font-size:clamp(1.8rem,4vw,2.5rem)">${esc(C.CAGNOTTE_PROJECT || 'Le premier projet du réseau')}</h2>
    <p class="muted">${esc(C.CAGNOTTE_TEXT || 'Le premier projet soutenu par la cagnotte sera choisi avec les membres fondateurs. Inscrivez-vous pour proposer une idée et être prévenu dès l’ouverture.')}</p>
    ${C.CAGNOTTE_GOAL ? `<div class="gauge" role="img" aria-label="${eur(C.CAGNOTTE_RAISED)} collectés sur ${eur(C.CAGNOTTE_GOAL)}">
      <div class="nums"><span><b>${eur(C.CAGNOTTE_RAISED)}</b> collectés</span><span>objectif ${eur(C.CAGNOTTE_GOAL)}</span></div>
      <div class="bar"><i style="width:${pct}%"></i></div><div class="nums"><span>${pct} %</span></div></div>` : ''}
    <div class="cta">${open
      ? `<a class="btn btn-hl" href="${esc(C.CAGNOTTE_URL)}" target="_blank" rel="noopener">Contribuer à la cagnotte ${I.arrow}</a>`
      : `<a class="btn btn-hl" href="${r}adherer/">Être prévenu de l’ouverture ${I.arrow}</a>`}</div>
    ${C.CAGNOTTE_WIDGET ? `<iframe src="${esc(C.CAGNOTTE_WIDGET)}" title="Formulaire de don" style="width:100%;height:750px;border:1px solid var(--hair);border-radius:12px;margin-top:8px" loading="lazy"></iframe>` : ''}
  </div>
  <div>
    <span class="label">Notre engagement</span>
    <h2 style="margin:16px 0 28px">Chaque euro a une destination.</h2>
    <ul class="who">
      <li><b>Des projets choisis ensemble</b><span>Les projets financés sont présentés et validés par les membres.</span></li>
      <li><b>De la transparence</b><span>Nous publions ce qui a été collecté et à quoi l’argent a servi.</span></li>
      <li><b>Un paiement sécurisé</b><span>Les dons passent par une plateforme de paiement dédiée aux associations.</span></li>
      <li><b>Tout le monde peut aider</b><span>Pas besoin d’être membre ni entrepreneur pour contribuer.</span></li>
    </ul>
  </div>
</div></section>

<section class="paper"><div class="wrap">
  <div class="head split"><div><span class="label">Quels projets ?</span><h2 style="margin-top:16px">Ce que la cagnotte peut financer.</h2></div><p>Des exemples de ce que nous voulons rendre possible. Les vrais projets viendront des membres.</p></div>
  <div class="pillars">
    <div class="card reveal"><span class="icon">${I.build}</span><h3>Projets communautaires</h3><p>Des initiatives utiles à toute la communauté, ici à Toulouse ou au pays.</p></div>
    <div class="card reveal"><span class="icon">${I.seed}</span><h3>Coups de pouce</h3><p>Aider un nouvel entrepreneur à franchir la première marche, sans intérêt.</p></div>
    <div class="card reveal"><span class="icon">${I.users}</span><h3>Vie du réseau</h3><p>Rencontres, ateliers, formations ouvertes aux membres.</p></div>
  </div>
  <div class="cta" style="margin-top:40px"><a class="btn btn-out" href="${r}adherer/">Proposer un projet</a></div>
</div></section>`,
});
out('cagnotte/index.html', cagnotte);

// ---------- PAGES DE SECTION (réseautage, compétences, projets) ----------
// Même gabarit : en-tête, blocs de cartes, liste « concrètement », appel à l'action.
const sectionPage = ({ slug, crumb, label, h1, lead, title, desc, head, cards, listLabel, listTitle, listIntro, list, note, cta, ctaHref = 'adherer/' }) => page({
  slug, title: `${title} · ${C.NAME}`, desc,
  body: r => `
<div class="page-hero"><div class="wrap">
  <p class="crumb"><a href="${r}">Accueil</a> › ${crumb}</p>
  <span class="label">${label}</span>
  <h1>${h1}</h1>
  <p class="lead">${lead}</p>
  <div class="cta" style="margin-top:28px"><a class="btn btn-hl" href="${r}${ctaHref}">${cta} ${I.arrow}</a></div>
</div></div>

<section><div class="wrap">
  <div class="head split"><div><span class="label">${head[0]}</span><h2 style="margin-top:16px">${head[1]}</h2></div><p>${head[2]}</p></div>
  <div class="pillars">${cards.map(([ic, t, d], i) => `<div class="card reveal${cards.length % 2 === 0 || i < cards.length - 1 ? ' wide' : ' full'}"><span class="icon">${I[ic]}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
</div></section>

<section class="paper"><div class="wrap two">
  <div><span class="label">${listLabel}</span><h2 style="margin-top:16px">${listTitle}</h2><p class="muted" style="margin-top:18px">${listIntro}</p></div>
  <ul class="who">${list.map(([b, s]) => `<li><b>${b}</b><span>${s}</span></li>`).join('')}</ul>
</div></section>

<section><div class="wrap">
  ${note ? `<p class="note" style="margin-bottom:40px">${note}</p>` : ''}
  <div class="final">
    <div><span class="label" style="color:var(--ink)">Le réseau se construit avec vous</span><h2 style="margin-top:16px">${cta}.</h2></div>
    <div class="cta"><a class="btn btn-dark" href="${r}${ctaHref}">${cta} ${I.arrow}</a></div>
  </div>
</div></section>`,
});

out('reseautage/index.html', sectionPage({
  slug: 'reseautage/', crumb: 'Réseautage', label: 'Se rencontrer',
  title: 'Réseautage entre Comoriens de Toulouse',
  desc: 'Rencontres entre membres, mises en relation ciblées et liens entre les communautés : le réseautage du réseau des Comoriens de Toulouse.',
  h1: 'Se connaître, enfin.',
  lead: 'Nous sommes nombreux à Toulouse, mais dispersés en petits cercles qui ne se croisent pas. Le réseau existe d’abord pour ça : que les Comoriens de Toulouse se rencontrent, se reconnaissent et se recommandent.',
  head: ['Ce que nous mettons en place', 'Des occasions de se croiser, pour de vrai.', 'Le réseau n’est pas qu’un site : il vit dans les rencontres. Voici ce que nous voulons organiser avec les premiers membres.'],
  cards: [
    ['users', 'Rencontres entre membres', 'Des moments réguliers pour se présenter, échanger sur ses projets et faire connaissance au-delà de son quartier ou de son association.'],
    ['chat', 'Mises en relation ciblées', 'Vous cherchez un associé, un client, un conseil précis ? L’équipe vous présente la bonne personne du réseau.'],
    ['share', 'Des liens avec les autres communautés', 'Mieux organisés entre nous, nous serons aussi plus faciles à contacter pour les événements et projets menés avec d’autres communautés de Toulouse.'],
    ['heart', 'Un réseau qui accueille', 'Étudiants qui arrivent, familles qui s’installent : le réseau aide chacun à trouver ses repères dans la communauté toulousaine.'],
  ],
  listLabel: 'Concrètement', listTitle: 'À qui ça sert ?', listIntro: 'À toutes celles et ceux qui veulent tisser des liens dans la communauté, entrepreneurs ou non.',
  list: [
    ['Les nouveaux arrivants', 'Étudiants, jeunes actifs, familles : rencontrer la communauté dès les premières semaines.'],
    ['Les entrepreneurs et indépendants', 'Se faire connaître, trouver des partenaires et des clients de confiance.'],
    ['Les associations', 'Faire circuler les informations et mieux se coordonner entre associations comoriennes de Toulouse.'],
    ['Tout le monde', 'Savoir qu’un frère ou une sœur de la communauté peut vous aider, à quelques kilomètres.'],
  ],
  cta: 'Rejoindre le réseau',
}));

out('competences/index.html', sectionPage({
  slug: 'competences/', crumb: 'Compétences', label: 'Partager',
  title: 'Partage de compétences',
  desc: 'Compétences, bons plans, démarches administratives, stages : ce que l’un sait, tout le monde en profite dans le réseau des Comoriens de Toulouse.',
  h1: 'Ce que l’un sait, tout le monde en profite.',
  lead: 'Dans la communauté, il y a des comptables, des mécaniciens, des juristes, des développeurs, des cuisinières, des étudiants dans tous les domaines. Le partage de compétences, c’est mettre ce savoir à portée de chacun.',
  head: ['Ce que nous partageons', 'Savoir-faire, conseils, bons plans.', 'Chaque membre peut apporter quelque chose, et chacun peut en bénéficier. Voici les formes que nous voulons donner à ce partage.'],
  cards: [
    ['share', 'Ateliers et retours d’expérience', 'Des membres expliquent ce qu’ils connaissent : créer son entreprise, faire sa comptabilité, réussir un dossier, se lancer sur internet.'],
    ['chat', 'Démarches administratives', 'Titres de séjour, logement, URSSAF, inscriptions : ceux qui sont passés par là guident ceux qui commencent.'],
    ['seed', 'Stages et premiers emplois', 'Les étudiants et jeunes diplômés de la communauté trouvent plus facilement un stage, une alternance ou un premier poste grâce au réseau.'],
    ['search', 'Trouver la bonne personne', 'Chaque inscrit indique son domaine et son métier. Quand vous avez besoin d’un conseil, vous savez à qui le demander.'],
  ],
  listLabel: 'Comment participer', listTitle: 'Donner, recevoir, les deux.', listIntro: 'Il n’y a pas besoin d’être expert : chacun sait faire quelque chose qui peut aider un autre.',
  list: [
    ['Inscrivez votre domaine', 'Le formulaire d’inscription recense ce que chacun sait faire, par domaine.'],
    ['Proposez un atelier', 'Une heure pour partager ce que vous connaissez avec les membres.'],
    ['Posez vos questions', 'Une démarche, un projet, une orientation : le réseau vous oriente vers la bonne personne.'],
    ['Accueillez un stagiaire', 'Vous avez une entreprise ? Un étudiant de la communauté cherche peut-être un stage dans votre domaine.'],
  ],
  cta: 'Inscrire mes compétences',
}));

out('projets/index.html', sectionPage({
  slug: 'projets/', crumb: 'Projets', label: 'Bâtir',
  title: 'Projets d’envergure',
  desc: 'Des projets communautaires ou non, que personne ne porterait seul : le réseau des Comoriens de Toulouse met en commun moyens et savoir-faire.',
  h1: 'Bâtir ce que personne ne porterait seul.',
  lead: 'Seul, on monte un projet. Ensemble, on peut voir plus grand : événements, initiatives pour la communauté, projets ici à Toulouse ou au pays. Le réseau met en commun les moyens et les savoir-faire de ses membres.',
  head: ['Notre approche', 'Des projets choisis et menés ensemble.', 'Les projets viendront des membres. Le rôle du réseau est de les faire émerger, de réunir les bonnes personnes et de trouver les moyens.'],
  cards: [
    ['build', 'Projets communautaires', 'Des initiatives utiles à toute la communauté de Toulouse : événements culturels, entraide, accueil des nouveaux arrivants.'],
    ['users', 'Projets entre membres', 'Plusieurs membres s’associent pour une activité commune, en mettant chacun leur savoir-faire.'],
    ['heart', 'Projets au pays', 'Des actions qui relient la diaspora toulousaine aux Comores.'],
    ['seed', 'Les moyens pour avancer', 'Cagnotte communautaire, financement sans intérêt, compétences des membres : le réseau aide à trouver les moyens de chaque projet.'],
  ],
  listLabel: 'Comment ça marche', listTitle: 'De l’idée au projet.', listIntro: 'Chaque projet est présenté aux membres avant d’être soutenu. Rien ne se décide sans la communauté.',
  list: [
    ['Vous proposez une idée', 'Par le formulaire ou directement auprès de l’équipe.'],
    ['Les membres en discutent', 'Le projet est présenté, amélioré, et les volontaires se manifestent.'],
    ['On réunit les moyens', 'Compétences, temps bénévole, cagnotte, financement : chacun apporte ce qu’il peut.'],
    ['On rend compte', 'Avancement et utilisation des fonds sont partagés avec tous.'],
  ],
  note: 'Une journée culturelle se prépare. Les informations seront publiées sur le blog.',
  cta: 'Proposer un projet',
}));

// ---------- BLOG ----------
out('blog/index.html', page({
  slug: 'blog/',
  title: `Blog · ${C.NAME}`,
  desc: 'Les nouvelles de la communauté comorienne de Toulouse : événements, initiatives, vie du réseau.',
  body: r => `
<div class="page-hero"><div class="wrap">
  <p class="crumb"><a href="${r}">Accueil</a> › Blog</p>
  <span class="label">Le blog</span>
  <h1>Les nouvelles de la communauté.</h1>
  <p class="lead">Événements, initiatives et vie de la communauté comorienne de Toulouse. Vous avez une information à partager ? Écrivez-nous.</p>
</div></div>
<section style="padding-top:48px"><div class="wrap">
  <div class="posts">${ARTICLES.map(a => postCard(a, r)).join('')}</div>
</div></section>`,
}));

for (const a of ARTICLES) {
  const others = ARTICLES.filter(o => o !== a).slice(0, 2);
  out(`blog/${a.slug}/index.html`, page({
    slug: `blog/${a.slug}/`, ogType: 'article',
    title: `${a.titre} · ${C.NAME}`,
    desc: a.resume,
    body: r => `
<div class="page-hero"><div class="wrap article-head">
  <p class="crumb"><a href="${r}">Accueil</a> › <a href="${r}blog/">Blog</a></p>
  <div class="post-meta"><span class="tag${a.aVenir ? ' soon' : ''}">${esc(a.aVenir ? 'À venir' : a.categorie)}</span><time datetime="${a.date}">${dateFr(a.date)}</time></div>
  <h1>${esc(a.titre)}</h1>
  <p class="lead">${esc(a.resume)}</p>
</div></div>
<section style="padding-top:48px"><div class="wrap">
  <article class="prose article">${a.corps(r)}</article>
  ${others.length ? `<div class="head" style="margin-top:72px"><span class="label">À lire aussi</span></div><div class="posts">${others.map(o => postCard(o, r)).join('')}</div>` : ''}
</div></section>`,
  }));
}

// ---------- MENTIONS LÉGALES (à compléter) ----------
out('mentions-legales/index.html', page({
  slug: 'mentions-legales/',
  title: `Mentions légales · ${C.NAME}`,
  desc: 'Mentions légales et protection des données.',
  body: r => `
<div class="page-hero"><div class="wrap"><p class="crumb"><a href="${r}">Accueil</a> › Mentions légales</p><h1>Mentions légales</h1></div></div>
<section><div class="wrap prose" style="display:grid;gap:40px;max-width:760px;margin:0 auto">
  <div><h2>Éditeur</h2><p>${esc(C.NAME)}, association en cours de création (loi 1901), Toulouse. Les informations légales (siège, numéro RNA, responsable de la publication) seront ajoutées dès la déclaration en préfecture.</p></div>
  <div><h2>Hébergement</h2><p>GitHub Pages, GitHub Inc., 88 Colin P. Kelly Jr Street, San Francisco, CA 94107, États-Unis.</p></div>
  <div><h2>Données personnelles</h2><p>Les informations envoyées via le formulaire d’inscription servent uniquement à construire l’annuaire de la communauté et à vous mettre en relation avec d’autres membres. Elles ne sont ni revendues ni cédées.</p><p>Votre âge, votre date de naissance, votre téléphone, votre e-mail et votre adresse ne sont jamais publiés. Sur l’annuaire et la carte, vous apparaissez selon votre choix : sous votre prénom et l’initiale de votre nom, ou de façon anonyme (métier et commune uniquement). Chaque fiche est vérifiée par l’équipe avant d’être mise en ligne.</p><p>Vous pouvez à tout moment demander l’accès, la rectification ou la suppression de vos données${C.EMAIL ? ` en écrivant à <a class="link" href="mailto:${C.EMAIL}">${esc(C.EMAIL)}</a>` : ' en nous contactant'}.</p></div>
</div></section>`,
}));

// ---------- sitemap / robots ----------
const urls = ['', 'adherer/', ...NAV.map(([h]) => h), ...ARTICLES.map(a => `blog/${a.slug}/`), 'mentions-legales/'];
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${C.BASE}/${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
out('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${C.BASE}/sitemap.xml\n`);
console.log(`OK · ${urls.length} pages · ${MEMBERS.length} membre(s) · base ${C.BASE}`);
