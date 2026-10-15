// Formulaire d'inscription à l'annuaire (/adherer/).
// Envoi : base Supabase si data-supabase-url/key sont renseignés (config.mjs), sinon message WhatsApp pré-rempli.
(() => {
  const form = document.getElementById('inscription');
  if (!form) return;
  const $ = (name) => form.elements[name];
  const SB_URL = (form.dataset.supabaseUrl || '').replace(/\/$/, '');
  const SB_KEY = form.dataset.supabaseKey || '';
  const WA = form.dataset.whatsapp || '';
  const today = new Date();
  let src = 'direct';
  try { src = sessionStorage.getItem('src') || 'direct'; } catch { /* navigation privée */ }

  // --- Naissance et âge ---------------------------------------------------
  const dateInput = $('date_naissance');
  const yearInput = $('annee_naissance');
  dateInput.max = today.toISOString().slice(0, 10);
  yearInput.max = today.getFullYear();

  function computeAge() {
    if ($('naiss_mode').value === 'date' && dateInput.value) {
      const b = new Date(dateInput.value);
      let a = today.getFullYear() - b.getFullYear();
      if (today < new Date(today.getFullYear(), b.getMonth(), b.getDate())) a--;
      return a;
    }
    if ($('naiss_mode').value === 'annee' && yearInput.value.length === 4) {
      return today.getFullYear() - Number(yearInput.value);
    }
    return null;
  }
  function refreshAge() {
    const dateMode = $('naiss_mode').value === 'date';
    dateInput.hidden = !dateMode;
    yearInput.hidden = dateMode;
    const a = computeAge();
    document.getElementById('age-preview').textContent = a !== null && a >= 0 && a < 110 ? `${a} ans` : '';
  }
  form.addEventListener('change', (e) => { if (e.target.name === 'naiss_mode') refreshAge(); });
  dateInput.addEventListener('input', refreshAge);
  yearInput.addEventListener('input', refreshAge);

  // --- Commune : Géoplateforme IGN, sinon liste locale de l'agglomération --
  const communeInput = $('commune');
  const list = document.getElementById('commune-list');
  let commune = null;
  let timer;

  // [nom, code postal, code INSEE, lat, lng]
  const COMMUNES_LOCALES = [["Toulouse","31000","31555",43.6041,1.4338],["Aucamville","31140","31022",43.671,1.423],["Aussonne","31840","31032",43.6861,1.3321],["Balma","31130","31044",43.6098,1.5034],["Beaupuy","31850","31053",43.6497,1.5561],["Beauzelle","31700","31056",43.6662,1.3717],["Blagnac","31700","31069",43.6373,1.3833],["Brax","31490","31088",43.6138,1.2423],["Bruguières","31150","31091",43.7247,1.4114],["Castelginest","31780","31116",43.6977,1.4384],["Colomiers","31770","31149",43.6098,1.3296],["Cornebarrieu","31700","31150",43.6499,1.3157],["Cugnaux","31270","31157",43.5448,1.3453],["Fenouillet","31150","31182",43.6844,1.3915],["Flourens","31130","31184",43.5956,1.5574],["Fonbeauzard","31140","31186",43.6794,1.4361],["Gagnac-sur-Garonne","31150","31205",43.7033,1.3746],["Gratentour","31150","31230",43.7212,1.4334],["Launaguet","31140","31282",43.6616,1.4552],["Lespinasse","31150","31293",43.7183,1.3865],["L'Union","31240","31561",43.6513,1.4816],["Mondonville","31700","31351",43.6642,1.2863],["Mondouzil","31850","31352",43.6344,1.5628],["Mons","31280","31355",43.6098,1.5756],["Montrabé","31850","31389",43.6433,1.5277],["Pibrac","31820","31417",43.624,1.2613],["Pin-Balma","31130","31418",43.6238,1.5354],["Quint-Fonsegrives","31130","31445",43.5831,1.5361],["Saint-Alban","31140","31467",43.6954,1.413],["Saint-Jean","31240","31488",43.6638,1.5044],["Saint-Jory","31790","31490",43.7405,1.362],["Saint-Orens-de-Gameville","31650","31506",43.5534,1.5317],["Seilh","31840","31541",43.6902,1.3557],["Tournefeuille","31170","31557",43.5734,1.3343],["Villeneuve-Tolosane","31270","31588",43.5263,1.3479],["Ramonville-Saint-Agne","31520","31446",43.5444,1.4748],["Castanet-Tolosan","31320","31113",43.5145,1.503],["Labège","31670","31254",43.5411,1.5231],["Escalquens","31750","31169",43.5211,1.5568],["Portet-sur-Garonne","31120","31433",43.5291,1.3968],["Muret","31600","31395",43.4464,1.2984],["Plaisance-du-Touch","31830","31424",43.5655,1.2863],["Léguevin","31490","31291",43.5913,1.2307],["Fonsorbes","31470","31187",43.5341,1.2397],["Frouzins","31270","31203",43.5195,1.3138],["Seysses","31600","31547",43.497,1.2923],["Roques","31120","31458",43.5044,1.3605],["Grenade","31330","31232",43.7641,1.2893],["Fronton","31620","31202",43.8432,1.3579],["Villemur-sur-Tarn","31340","31584",43.8567,1.4824],["Montastruc-la-Conseillère","31380","31358",43.7175,1.5916],["Verfeil","31590","31573",43.6564,1.6834],["Lavaur","81500","81140",43.6969,1.8162],["Saint-Lys","31470","31499",43.5126,1.193],["Auterive","31190","31033",43.3528,1.4779]]
    .map(([nom, code_postal, code_insee, lat, lng]) => ({ nom, code_postal, code_insee, lat, lng }));
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');

  async function fetchCommunes(q) {
    try {
      const r = await fetch(`https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(q)}&index=address&type=municipality&lat=43.6047&lon=1.4442&limit=6`);
      if (!r.ok) throw new Error();
      const { features } = await r.json();
      return features.map((f) => ({
        nom: f.properties.city || f.properties.name,
        code_postal: f.properties.postcode,
        code_insee: f.properties.citycode,
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
      }));
    } catch {
      const n = norm(q);
      return COMMUNES_LOCALES.filter((c) => norm(c.nom).includes(n)).slice(0, 6);
    }
  }

  async function searchCommune(q) {
    const results = await fetchCommunes(q);
    list.replaceChildren(...results.map((c) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.textContent = `${c.nom} `;
      li.append(Object.assign(document.createElement('small'), { textContent: c.code_postal || '' }));
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        commune = c;
        communeInput.value = c.nom;
        list.hidden = true;
      });
      return li;
    }));
    list.hidden = results.length === 0;
  }
  communeInput.addEventListener('input', () => {
    commune = null;
    clearTimeout(timer);
    const q = communeInput.value.trim();
    if (q.length < 2) { list.hidden = true; return; }
    timer = setTimeout(() => searchCommune(q), 250);
  });
  communeInput.addEventListener('blur', () => setTimeout(() => { list.hidden = true; }, 150));
  communeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !list.hidden && list.firstChild) {
      e.preventDefault();
      list.firstChild.dispatchEvent(new MouseEvent('mousedown'));
    }
  });
  const communeSaisie = () => commune || COMMUNES_LOCALES.find((c) => norm(c.nom) === norm(communeInput.value)) || null;

  // --- Petits plus --------------------------------------------------------
  const desc = $('description');
  desc.addEventListener('input', () => { document.getElementById('desc-count').textContent = desc.value.length; });
  const refreshPreviewNom = () => {
    const p = $('prenom').value.trim() || 'Prénom';
    const n = $('nom').value.trim();
    document.getElementById('preview-nom').textContent = `${p} ${n ? n[0].toUpperCase() + '.' : 'N.'}`;
  };
  $('prenom').addEventListener('input', refreshPreviewNom);
  $('nom').addEventListener('input', refreshPreviewNom);

  // Barre de progression : une étape par bloc entamé
  const sets = form.querySelectorAll('fieldset');
  const bars = form.querySelectorAll('.progress i');
  const prog = () => sets.forEach((s, i) => {
    const filled = [...s.querySelectorAll('input:not([type=radio]):not([type=checkbox]), select, textarea')].some((el) => el.value.trim())
      || [...s.querySelectorAll('input[type=radio]:not([name=naiss_mode]):not([name=rayon_km]), input[name=consentement]')].some((el) => el.checked);
    bars[i]?.classList.toggle('on', i === 0 || filled);
  });
  form.addEventListener('input', prog);
  form.addEventListener('change', prog);

  // --- Validation ---------------------------------------------------------
  function validate() {
    form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
    const errors = [];
    const flag = (name, msg) => {
      const el = $(name);
      (el.length ? el[0].closest('.field, .choices') : el.closest('.field, .check'))?.classList.add('invalid');
      errors.push(msg);
    };
    if (!$('prenom').value.trim()) flag('prenom', 'votre prénom');
    if (!$('nom').value.trim()) flag('nom', 'votre nom');
    if (!$('sexe').value) flag('sexe', 'femme ou homme');
    const age = computeAge();
    if (age === null || age < 0 || age > 110) flag($('naiss_mode').value === 'date' ? 'date_naissance' : 'annee_naissance', 'votre naissance');
    if (!communeInput.value.trim()) flag('commune', 'votre commune');
    if (!$('domaine').value) flag('domaine', 'votre domaine');
    if (!$('metier').value.trim()) flag('metier', 'votre métier');
    const tel = $('telephone').value.trim();
    const mail = $('email').value.trim();
    if (!tel && !mail) { flag('telephone', 'un téléphone ou un e-mail'); $('email').closest('.field').classList.add('invalid'); }
    if (tel && tel.replace(/\D/g, '').length < 9) flag('telephone', 'un téléphone valide');
    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) flag('email', 'un e-mail valide');
    if (!$('visibilite').value) flag('visibilite', 'votre choix d’affichage');
    if (!$('consentement').checked) flag('consentement', 'votre accord');
    return errors;
  }

  // --- Envoi --------------------------------------------------------------
  const errorBox = document.getElementById('form-error');
  const submitBtn = form.querySelector('button[type=submit]');
  const btnLabel = submitBtn.firstChild.textContent;
  const LABELS = { salarie: 'Salarié·e', independant: 'À mon compte', etudiant: 'Étudiant·e', recherche: 'En recherche', retraite: 'Retraité·e', autre: 'Autre' };

  const whatsappText = (p) => [
    'Nouvelle inscription à l’annuaire', '',
    `Nom : ${p.prenom} ${p.nom}`,
    `Sexe : ${p.sexe}`,
    `Naissance : ${p.date_naissance || p.annee_naissance}`,
    `Commune : ${p.commune}${p.code_postal ? ` (${p.code_postal})` : ''}${p.quartier ? `, ${p.quartier}` : ''}`,
    `Déplacement : ${p.rayon_km ? `${p.rayon_km} km` : 'aucun'}`,
    `Domaine : ${$('domaine').selectedOptions[0].text}`,
    `Métier : ${p.metier}`,
    p.situation ? `Situation : ${LABELS[p.situation]}` : '',
    p.cherche_stage ? 'Cherche un stage / emploi : oui' : '',
    p.description ? `Description : ${p.description}` : '',
    p.telephone ? `Téléphone : ${p.telephone}${p.whatsapp ? ' (WhatsApp)' : ''}` : '',
    p.email ? `E-mail : ${p.email}` : '',
    `Affichage : ${p.visibilite === 'public' ? 'sous son prénom' : 'anonyme'}`,
    'Consentement : oui',
    `Source : ${src}`,
  ].filter(Boolean).join('\n');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length) {
      errorBox.textContent = `Il manque : ${errors.join(', ')}.`;
      errorBox.hidden = false;
      form.querySelector('.invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    errorBox.hidden = true;

    const dateMode = $('naiss_mode').value === 'date';
    const c = communeSaisie();
    const payload = {
      prenom: $('prenom').value.trim(),
      nom: $('nom').value.trim(),
      sexe: $('sexe').value,
      date_naissance: dateMode ? dateInput.value : null,
      annee_naissance: dateMode ? null : Number(yearInput.value),
      commune: c?.nom || communeInput.value.trim(),
      code_postal: c?.code_postal || null,
      code_insee: c?.code_insee || null,
      quartier: $('quartier').value.trim(),
      lat: c?.lat ?? null,
      lng: c?.lng ?? null,
      rayon_km: Number($('rayon_km').value),
      domaine: $('domaine').value,
      metier: $('metier').value.trim(),
      situation: $('situation').value || null,
      description: desc.value.trim(),
      cherche_stage: $('cherche_stage').checked,
      telephone: $('telephone').value.trim(),
      email: $('email').value.trim(),
      whatsapp: $('whatsapp').checked,
      visibilite: $('visibilite').value,
      consentement: true,
    };

    // Pas encore de base : on envoie sur WhatsApp (ouverture synchrone pour ne pas être bloqué)
    if (!SB_URL || !SB_KEY) {
      if (!WA) {
        errorBox.textContent = 'Le formulaire n’est pas encore relié. Réessayez dans quelques jours.';
        errorBox.hidden = false;
        return;
      }
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(whatsappText(payload))}`, '_blank');
      document.getElementById('merci-texte').innerHTML = '<b>Dernière étape :</b> dans la conversation WhatsApp qui vient de s’ouvrir, appuyez sur « Envoyer » pour que votre inscription nous parvienne.';
      return showDone(payload.prenom, null);
    }

    submitBtn.disabled = true;
    submitBtn.firstChild.textContent = 'Envoi… ';
    try {
      const r = await fetch(`${SB_URL}/rest/v1/rpc/inscrire_membre`, {
        method: 'POST',
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p: payload }),
      });
      if (!r.ok) throw new Error(await r.text());
      showDone(payload.prenom, await r.json());
    } catch (err) {
      console.error(err);
      errorBox.textContent = 'L’envoi n’a pas fonctionné. Vérifiez votre connexion et réessayez.';
      errorBox.hidden = false;
      submitBtn.disabled = false;
      submitBtn.firstChild.textContent = btnLabel;
    }
  });

  const done = document.getElementById('done');
  function showDone(prenom, jeton) {
    form.hidden = true;
    document.getElementById('merci-prenom').textContent = prenom;
    if (jeton) {
      document.getElementById('jeton').textContent = jeton;
      document.getElementById('token').hidden = false;
    }
    done.classList.add('show');
    done.focus();
    window.scrollTo({ top: done.getBoundingClientRect().top + scrollY - 100, behavior: 'smooth' });
    if (window.umami && umami.track) umami.track('inscription', { source: src });
  }

  document.getElementById('copy-jeton').addEventListener('click', async (e) => {
    try {
      await navigator.clipboard.writeText(document.getElementById('jeton').textContent);
      e.target.textContent = 'Copié';
    } catch { /* sélection manuelle */ }
  });

  const share = `Inscris-toi dans l’annuaire des Comoriens de Toulouse, ça prend 2 minutes : ${location.origin}${location.pathname}?src=whatsapp`;
  document.getElementById('wa-share').href = `https://wa.me/?text=${encodeURIComponent(share)}`;

  refreshAge();
})();
