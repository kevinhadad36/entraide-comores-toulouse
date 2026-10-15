// Génère le site : index.html, adherer/, annuaire/, financement/, cagnotte/, mentions-legales/, sitemap.xml, robots.txt.
// Usage : node build.mjs   (réglages dans config.mjs ; membres de l'annuaire dans members.json)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG as C } from './config.mjs';

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
  ['', 'Le réseau'], ['annuaire/', 'Annuaire'], ['financement/', 'Financement'], ['cagnotte/', 'Cagnotte'],
];
const analytics = C.UMAMI_ID ? `<script defer src="https://cloud.umami.is/script.js" data-website-id="${C.UMAMI_ID}"></script>` : '';

function page({ slug = '', title, desc, body, minimal = false }) {
  const root = slug ? '../'.repeat(slug.split('/').filter(Boolean).length) : '';
  const url = `${C.BASE}/${slug}`;
  const nav = NAV.map(([h, l]) => `<li><a href="${root}${h}"${h === slug ? ' aria-current="page"' : ''}>${l}</a></li>`).join('');
  const drawer = NAV.map(([h, l]) => `<a href="${root}${h}">${l}</a>`).join('') + `<a href="${root}adherer/">Adhérer au réseau</a>`;
  const brand = `<a class="brand" href="${root || './'}">${LOGO('lg')}<span>${esc(C.SHORT)}<small>Entraide · Toulouse</small></span></a>`;
  return `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:locale" content="fr_FR">
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
<div><h4>Le réseau</h4><ul>${NAV.map(([h, l]) => `<li><a href="${root}${h}">${l}</a></li>`).join('')}<li><a href="${root}adherer/">Adhérer</a></li></ul></div>
<div><h4>Contact</h4><ul>${C.WHATSAPP ? `<li><a href="https://wa.me/${C.WHATSAPP}">WhatsApp</a></li>` : ''}${C.EMAIL ? `<li><a href="mailto:${C.EMAIL}">${esc(C.EMAIL)}</a></li>` : ''}<li><a href="${root}adherer/">Formulaire d’adhésion</a></li><li><a href="${root}mentions-legales/">Mentions légales</a></li></ul></div>
</div>
<div class="foot-bottom"><span>Association en cours de création · Toulouse, Occitanie</span><span>Karibu.</span></div>
</div></footer>
<script src="${root}assets/app.js" defer></script>
</body></html>`;
}

// ---------- ACCUEIL ----------
const PILLARS = [
  { n: '01', ic: 'users', t: 'Se rencontrer', d: 'Des rencontres régulières entre membres, des mises en relation ciblées, un carnet d’adresses qui grandit à chaque nouvel adhérent.', wide: true },
  { n: '02', ic: 'search', t: 'Se trouver', d: 'Un plombier, un comptable, un traiteur, un développeur ? Avant d’aller chercher ailleurs, cherchez chez nous : l’annuaire des membres est fait pour ça.', href: 'annuaire/', more: 'Ouvrir l’annuaire', wide: true },
  { n: '03', ic: 'share', t: 'Partager', d: 'Compétences, bons plans, démarches administratives, retours d’expérience : ce que l’un a appris, tout le monde en profite.' },
  { n: '04', ic: 'build', t: 'Bâtir', d: 'Des projets d’envergure, communautaires ou non, que personne ne porterait seul. Nous mettons en commun les moyens et les savoir-faire.' },
  { n: '05', ic: 'seed', t: 'Financer', d: 'Soutenir les nouveaux entrepreneurs de la diaspora : un coup de pouce de l’association ou un accompagnement vers des financements halal.', href: 'financement/', more: 'Le volet financement', hl: true },
];
const FAQ = [
  ['Faut-il être comorien pour adhérer ?', 'Le réseau est pensé pour la communauté comorienne de Toulouse et de sa région, et pour toutes celles et ceux qui ont un lien avec les Comores. Vous vous posez la question ? Remplissez le formulaire, nous en parlerons ensemble.'],
  ['Je ne suis pas encore entrepreneur, je peux venir ?', 'Oui, et c’est même une des raisons d’être du réseau. Porteurs de projet, étudiants, salariés qui veulent se lancer : vous trouverez ici des gens qui sont passés par là.'],
  ['L’adhésion est-elle payante ?', 'Le formulaire est gratuit et ne vous engage à rien. Les modalités de cotisation seront fixées collectivement lors de la création officielle de l’association, et communiquées à tous les inscrits.'],
  ['Faut-il habiter Toulouse ?', 'Les rencontres ont lieu à Toulouse et autour. Le volet financement et accompagnement peut s’ouvrir plus largement à la diaspora en France : inscrivez-vous en précisant votre ville.'],
  ['Qu’entendez-vous par « financement halal » ?', 'Un financement sans intérêt (sans riba), qui ne repose pas sur la spéculation et qui partage le risque plutôt que de le faire porter au seul emprunteur. Concrètement : prêts à taux zéro, apports en capital, financement participatif, contrats de finance islamique quand ils sont disponibles.'],
  ['Qui voit mes informations ?', 'Seuls les responsables du réseau. Vous n’apparaissez dans l’annuaire public que si vous cochez la case prévue, et vous pouvez demander à tout moment la modification ou la suppression de vos données.'],
];

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
  <li><span>01</span>Réseautage</li><li><span>02</span>Annuaire des membres</li><li><span>03</span>Partage de compétences</li>
  <li><span>04</span>Projets d’envergure</li><li><span>05</span>Financement halal</li><li><span>06</span>Cagnotte communautaire</li>
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

<section><div class="wrap">
  <div class="final reveal">
    <div><span class="label" style="color:var(--ink)">Membres fondateurs</span><h2 style="margin-top:16px">Le réseau commence maintenant. Soyez des premiers.</h2></div>
    <div class="cta"><a class="btn btn-dark" href="${r}adherer/">Adhérer au réseau ${I.arrow}</a></div>
  </div>
</div></section>`,
});
out('index.html', home);

// ---------- ADHÉRER (page dédiée, partagée par WhatsApp) ----------
const opt = (name, v, type = 'checkbox') => `<label class="opt"><input type="${type}" name="${name}" value="${esc(v)}"><span>${esc(v)}</span></label>`;
const SECTEURS = ['Bâtiment & travaux', 'Restauration & traiteur', 'Commerce', 'Transport & logistique', 'Beauté & bien-être', 'Santé', 'Numérique & tech', 'Conseil, gestion, comptabilité', 'Immobilier', 'Éducation & formation', 'Événementiel', 'Import-export', 'Services à la personne', 'Autre'];
const APPORTS = ['Mes services / produits', 'Des conseils dans mon domaine', 'Du temps bénévole', 'Mon réseau de contacts', 'Un soutien financier aux projets', 'Animer un atelier'];
const BESOINS = ['Des clients', 'Des partenaires', 'Des conseils', 'Un financement halal', 'Un mentor', 'Des infos sur les démarches', 'Rencontrer du monde'];

const adherer = page({
  slug: 'adherer/', minimal: true,
  title: `Adhérer · ${C.NAME}`,
  desc: 'Rejoignez le réseau d’entraide des entrepreneurs comoriens de Toulouse. Formulaire d’adhésion en 2 minutes, gratuit et sans engagement.',
  body: r => `
<div class="wrap form-wrap">
  <div>
    <div class="sticky">
      <span class="label">Formulaire d’adhésion</span>
      <h1 style="font-size:clamp(2.4rem,6vw,3.5rem);margin:16px 0 18px;line-height:1">Rejoignez le réseau.</h1>
      <p class="lead muted" style="font-size:1.125rem">Deux minutes pour vous présenter. Nous revenons vers vous rapidement pour faire connaissance.</p>
      <ul class="aside-list">
        <li>${I.clock}<span>2 minutes, 3 étapes</span></li>
        <li>${I.check}<span>Gratuit et sans engagement</span></li>
        <li>${I.lock}<span>Vos informations restent entre nous</span></li>
        <li>${I.users}<span>Ouvert aux entrepreneurs, porteurs de projet et soutiens</span></li>
      </ul>
      <p style="margin-top:28px"><a class="link" href="${r}">Découvrir le réseau d’abord</a></p>
    </div>
  </div>

  <div>
  <form class="join" id="join" novalidate
    data-endpoint="${esc(C.FORM_ENDPOINT)}" data-whatsapp="${esc(C.WHATSAPP)}" data-email="${esc(C.EMAIL)}">
    <div class="progress" aria-hidden="true"><i class="on"></i><i></i><i></i></div>
    ${C.FORM_ACCESS_KEY ? `<input type="hidden" name="access_key" value="${esc(C.FORM_ACCESS_KEY)}">` : ''}
    <input type="hidden" name="_subject" value="Nouvelle adhésion · ${esc(C.SHORT)}">
    <input type="hidden" name="source" value="">
    <label class="hp" aria-hidden="true">Ne pas remplir <input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label>

    <fieldset>
      <legend><small>01</small>Vous</legend>
      <div class="fgrid c2">
        <label class="field"><span>Prénom</span><input type="text" name="prenom" autocomplete="given-name" required></label>
        <label class="field"><span>Nom</span><input type="text" name="nom" autocomplete="family-name" required></label>
        <label class="field"><span>Téléphone <em>(WhatsApp de préférence)</em></span><input type="tel" name="telephone" autocomplete="tel" inputmode="tel" placeholder="06 12 34 56 78" required></label>
        <label class="field"><span>E-mail <em>(facultatif)</em></span><input type="email" name="email" autocomplete="email" placeholder="vous@exemple.fr"></label>
        <label class="field"><span>Ville</span><input type="text" name="ville" autocomplete="address-level2" placeholder="Toulouse, Blagnac, Colomiers…" required></label>
        <label class="field"><span>Vous êtes…</span><select name="profil" required>
          <option value="">Choisir</option><option>Entrepreneur / chef d’entreprise</option><option>Indépendant / artisan / auto-entrepreneur</option><option>Porteur de projet</option><option>Étudiant / jeune diplômé</option><option>Salarié, envie de soutenir le réseau</option><option>Autre</option>
        </select></label>
      </div>
    </fieldset>

    <fieldset>
      <legend><small>02</small>Votre activité</legend>
      <div class="fgrid c2">
        <label class="field"><span>Nom de l’entreprise ou du projet <em>(facultatif)</em></span><input type="text" name="entreprise" autocomplete="organization"></label>
        <label class="field"><span>Secteur</span><select name="secteur">
          <option value="">Choisir</option>${SECTEURS.map(s => `<option>${esc(s)}</option>`).join('')}
        </select></label>
      </div>
      <label class="field"><span>En deux mots, que faites-vous ? <em>(ou que voulez-vous lancer ?)</em></span><textarea name="activite" placeholder="Ex. : je suis plombier à mon compte depuis 3 ans…"></textarea></label>
    </fieldset>

    <fieldset>
      <legend><small>03</small>Entraide</legend>
      <div class="field"><span class="group-title">Ce que vous pouvez apporter <em>(plusieurs choix)</em></span><div class="opts">${APPORTS.map(v => opt('apports', v)).join('')}</div></div>
      <div class="field"><span class="group-title">Ce que vous cherchez <em>(plusieurs choix)</em></span><div class="opts">${BESOINS.map(v => opt('besoins', v)).join('')}</div></div>
      <label class="field"><span>Une idée de nom pour l’association ? <em>(facultatif, on vote ensemble)</em></span><input type="text" name="idee_nom"></label>
      <label class="field"><span>Un message, une idée de projet ? <em>(facultatif)</em></span><textarea name="message"></textarea></label>
    </fieldset>

    <div style="display:grid;gap:14px">
      <label class="check"><input type="checkbox" name="annuaire" value="oui"><span>J’accepte que mon nom, mon activité et mon contact professionnel apparaissent dans l’annuaire des membres (après validation avec moi).</span></label>
      <label class="check"><input type="checkbox" name="consentement" value="oui" required><span>J’accepte que mes informations soient utilisées par l’association pour me recontacter et gérer mon adhésion. Elles ne sont jamais revendues. <a class="link" href="${r}mentions-legales/">En savoir plus</a></span></label>
    </div>

    <div class="form-msg" id="form-msg" role="alert" hidden></div>
    <div class="form-foot">
      <p>Gratuit, sans engagement. Les modalités de cotisation seront présentées à la création officielle de l’association.</p>
      <button class="btn btn-hl" type="submit">Envoyer mon adhésion ${I.arrow}</button>
    </div>
  </form>

  <div class="done" id="done" tabindex="-1">
    <div class="big">${I.check}</div>
    <h2>Bienvenue dans le réseau.</h2>
    <p class="muted">Merci ! Nous avons bien reçu votre demande et nous revenons vers vous très vite. En attendant, partagez le formulaire autour de vous : plus nous serons nombreux, plus le réseau sera utile à chacun.</p>
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
  <div><h2>Données personnelles</h2><p>Les informations envoyées via le formulaire d’adhésion servent uniquement à vous recontacter, à gérer votre adhésion et, si vous l’avez accepté, à vous faire figurer dans l’annuaire des membres. Elles ne sont ni revendues ni cédées.</p><p>Vous pouvez à tout moment demander l’accès, la rectification ou la suppression de vos données${C.EMAIL ? ` en écrivant à <a class="link" href="mailto:${C.EMAIL}">${esc(C.EMAIL)}</a>` : ' en nous contactant'}.</p></div>
</div></section>`,
}));

// ---------- sitemap / robots ----------
const urls = ['', 'adherer/', 'annuaire/', 'financement/', 'cagnotte/', 'mentions-legales/'];
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${C.BASE}/${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
out('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${C.BASE}/sitemap.xml\n`);
console.log(`OK · ${urls.length} pages · ${MEMBERS.length} membre(s) · base ${C.BASE}`);
