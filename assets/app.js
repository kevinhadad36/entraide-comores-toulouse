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
})();
