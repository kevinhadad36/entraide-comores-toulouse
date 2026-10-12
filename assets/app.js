(function () {
  // Source du visiteur (?src=whatsapp, ?src=facebook…), gardée pour la session
  var src = 'direct';
  try {
    var p = new URLSearchParams(location.search).get('src');
    if (p) sessionStorage.setItem('src', p);
    src = sessionStorage.getItem('src') || 'direct';
  } catch (e) {}

  // Menu mobile
  var mb = document.querySelector('.menu-btn'), dr = document.getElementById('drawer');
  if (mb && dr) mb.addEventListener('click', function () {
    var o = dr.classList.toggle('open');
    mb.setAttribute('aria-expanded', o);
  });

  // Apparition douce
  var rv = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  // Annuaire : recherche + secteurs
  var q = document.getElementById('dir-q'), chips = document.getElementById('dir-chips');
  if (q && chips) {
    var sector = '', cards = document.querySelectorAll('#dir .member'), none = document.getElementById('dir-none');
    var run = function () {
      var t = q.value.trim().toLowerCase(), n = 0;
      cards.forEach(function (c) {
        var ok = (!sector || c.dataset.sector === sector) && (!t || c.dataset.hay.indexOf(t) > -1);
        c.hidden = !ok; if (ok) n++;
      });
      none.hidden = n > 0;
    };
    q.addEventListener('input', run);
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      chips.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c === b); });
      sector = b.dataset.s; run();
    });
  }

  // Formulaire d'adhésion
  var f = document.getElementById('join');
  if (!f) return;
  f.elements.source.value = src;
  var msg = document.getElementById('form-msg'), done = document.getElementById('done');
  var share = 'Rejoins le réseau d’entraide des entrepreneurs comoriens de Toulouse : ' + location.origin + location.pathname + '?src=whatsapp';
  document.getElementById('wa-share').href = 'https://wa.me/?text=' + encodeURIComponent(share);

  // Barre de progression : une étape par fieldset rempli
  var sets = f.querySelectorAll('fieldset'), bars = f.querySelectorAll('.progress i');
  var prog = function () {
    sets.forEach(function (s, i) {
      var filled = Array.prototype.some.call(s.querySelectorAll('input,select,textarea'), function (el) {
        return (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value.trim() !== '';
      });
      if (bars[i]) bars[i].classList.toggle('on', i === 0 || filled);
    });
  };
  f.addEventListener('input', prog); f.addEventListener('change', prog);

  var show = function (t, err) { msg.hidden = false; msg.textContent = t; msg.className = 'form-msg' + (err ? ' err' : ''); };
  var success = function () {
    f.hidden = true; done.classList.add('show'); done.focus();
    window.scrollTo({ top: done.getBoundingClientRect().top + scrollY - 100, behavior: 'smooth' });
    if (window.umami && umami.track) umami.track('adhesion', { source: src });
  };
  // Résumé lisible des réponses (pour WhatsApp / e-mail)
  var labels = { prenom: 'Prénom', nom: 'Nom', telephone: 'Téléphone', email: 'E-mail', ville: 'Ville', profil: 'Profil', entreprise: 'Entreprise / projet', secteur: 'Secteur', activite: 'Activité', apports: 'Peut apporter', besoins: 'Cherche', idee_nom: 'Idée de nom', message: 'Message', annuaire: 'Annuaire', source: 'Source' };
  var summary = function (fd) {
    var o = {};
    fd.forEach(function (v, k) { if (labels[k] && k !== 'source' && String(v).trim()) o[k] = o[k] ? o[k] + ', ' + v : v; });
    o.source = src;
    return 'Nouvelle adhésion\n\n' + Object.keys(o).map(function (k) { return labels[k] + ' : ' + o[k]; }).join('\n');
  };

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.hidden = true;
    var bad = Array.prototype.find.call(f.querySelectorAll('[required]'), function (el) {
      return el.type === 'checkbox' ? !el.checked : !el.value.trim();
    });
    if (bad) { show(bad.name === 'consentement' ? 'Merci de cocher la case de consentement pour envoyer votre adhésion.' : 'Merci de remplir les champs obligatoires (prénom, nom, téléphone, ville, profil).', true); bad.focus(); return; }
    var em = f.elements.email;
    if (em.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) { show('L’adresse e-mail semble incorrecte.', true); em.focus(); return; }
    if (f.elements._gotcha.value) return;

    var fd = new FormData(f), ep = f.dataset.endpoint, wa = f.dataset.whatsapp, mail = f.dataset.email;
    if (ep) {
      var btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.firstChild.textContent = 'Envoi… ';
      fetch(ep, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw 0; success(); })
        .catch(function () { show('L’envoi n’a pas fonctionné. Vérifiez votre connexion et réessayez.', true); })
        .then(function () { btn.disabled = false; btn.firstChild.textContent = 'Envoyer mon adhésion '; });
    } else if (wa) {
      window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(summary(fd)), '_blank');
      done.querySelector('p').innerHTML = '<b>Dernière étape :</b> dans la conversation WhatsApp qui vient de s’ouvrir, appuyez sur « Envoyer » pour que votre adhésion nous parvienne. Ensuite, partagez le formulaire autour de vous : plus nous serons nombreux, plus le réseau sera utile à chacun.';
      success();
    } else if (mail) {
      location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent('Adhésion au réseau') + '&body=' + encodeURIComponent(summary(fd)); success();
    } else {
      show('Le formulaire n’est pas encore relié à une boîte de réception. Réessayez dans quelques jours.', true);
    }
  });
})();
