// Parafe · démo d'application (maquette interactive, aucune donnée envoyée).
// Les données restent dans le navigateur (sessionStorage) et disparaissent à la fermeture de l'onglet.
(function () {
  'use strict';

  var KEY = 'parafe-demo-v1';
  var STATUS = { draft: ['Brouillon', 'pill-draft'], sent: ['En attente', 'pill-sent'], signed: ['Signé', 'pill-signed'] };
  var TYPES = [
    ['Bon de commande', 'Le client valide sa commande.'],
    ['Devis', 'Le client accepte votre proposition.'],
    ['Contrat', 'Le client s’engage par écrit.']
  ];
  var ICON = {
    doc: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>'
  };
  var MASCOT = '<svg class="mascot" viewBox="0 0 80 104" width="84" height="109" aria-hidden="true"><ellipse class="m-shadow" cx="40" cy="91" rx="24" ry="4.5"/><g class="m-body"><polygon class="m-shape" points="40,22 15,80 65,80"/><g class="m-eyes"><g class="m-eye"><circle cx="31" cy="61" r="7" fill="#fff"/><circle cx="33" cy="62" r="3.2" fill="#16201B"/></g><g class="m-eye"><circle cx="49" cy="61" r="7" fill="#fff"/><circle cx="51" cy="62" r="3.2" fill="#16201B"/></g></g></g></svg>';

  function blankDraft() { return { type: 'Bon de commande', client: '', contact: '', message: '' }; }
  function seed() {
    return {
      filter: 'all', draft: blankDraft(), flash: '',
      docs: [
        { id: 'd1', type: 'Bon de commande', client: 'Client exemple A', contact: 'exemple-a@example.com', status: 'signed', when: 'Hier' },
        { id: 'd2', type: 'Devis', client: 'Client exemple B', contact: 'exemple-b@example.com', status: 'sent', when: 'Aujourd’hui' },
        { id: 'd3', type: 'Contrat', client: 'Client exemple C', contact: 'exemple-c@example.com', status: 'draft', when: 'Il y a 3 jours' }
      ]
    };
  }
  function load() { try { var s = sessionStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible : la démo continue en mémoire */ } }
  var state = load() || seed();

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function find(id) { for (var i = 0; i < state.docs.length; i++) if (state.docs[i].id === id) return state.docs[i]; return null; }
  function pill(s) { return '<span class="pill ' + STATUS[s][1] + '">' + STATUS[s][0] + '</span>'; }
  function defaultMsg(type) { return 'Bonjour, voici votre ' + type.toLowerCase() + ' à signer. Vous pouvez le faire depuis votre téléphone, en quelques secondes. Merci.'; }
  function stepper(n) {
    var labels = ['Document', 'Destinataire', 'Envoi'];
    return '<ol class="stepper" aria-label="Étapes">' + labels.map(function (l, i) {
      var cls = i + 1 < n ? 'done' : (i + 1 === n ? 'on' : '');
      return '<li data-n="' + (i + 1) + '" class="' + cls + '"' + (i + 1 === n ? ' aria-current="step"' : '') + '>' + l + '</li>';
    }).join('') + '</ol>';
  }
  function docLines() { return '<div class="doc-lines"><span></span><span></span><span class="short"></span></div>'; }

  // ---------- Écrans ----------
  var routes = {};
  var cli = { step: 'read' };
  var pad = null;

  routes.documents = function () {
    var f = state.filter;
    var list = state.docs.filter(function (d) { return f === 'all' || d.status === f; });
    var tabs = [['all', 'Tous'], ['sent', 'En attente'], ['signed', 'Signés']].map(function (t) {
      return '<button type="button" class="tab' + (f === t[0] ? ' on' : '') + '" data-action="filter" data-v="' + t[0] + '" aria-pressed="' + (f === t[0]) + '">' + t[1] + '</button>';
    }).join('');
    var rows = list.length ? list.map(function (d) {
      return '<a class="row" href="#/suivi/' + esc(d.id) + '"><span class="row-ic">' + ICON.doc + '</span><span class="row-main"><strong>' + esc(d.type) + '</strong><span>' + esc(d.client) + ' · ' + esc(d.when) + '</span></span>' + pill(d.status) + '</a>';
    }).join('') : '<p class="empty">Aucun document dans cette liste.</p>';
    return {
      title: 'Documents',
      html: '<div class="page-head"><div><p class="eyebrow">Vos documents</p><h1>Documents</h1></div><a class="btn" href="#/nouveau">Nouveau document</a></div>' +
        '<div class="tabs" role="group" aria-label="Filtrer par statut">' + tabs + '</div><div class="list">' + rows + '</div>'
    };
  };

  routes.nouveau = function () {
    var cur = state.draft.type;
    var cards = TYPES.map(function (t) {
      return '<label class="choice"><input type="radio" name="type" value="' + esc(t[0]) + '"' + (t[0] === cur ? ' checked' : '') + '><span><strong>' + esc(t[0]) + '</strong><small>' + esc(t[1]) + '</small></span></label>';
    }).join('');
    return {
      title: 'Nouveau document',
      html: stepper(1) + '<div class="page-head"><div><h1>Quel document faire signer ?</h1><p>Choisissez le type, vous préciserez le client à l’étape suivante.</p></div></div>' +
        '<form data-form="type"><fieldset class="choices"><legend class="sr">Type de document</legend>' + cards + '</fieldset>' +
        '<div class="actions"><button class="btn" type="submit">Continuer</button><a class="link" href="#/documents">Annuler</a></div></form>'
    };
  };

  routes.destinataire = function () {
    var d = state.draft;
    return {
      title: 'Destinataire',
      html: stepper(2) + '<a class="back" href="#/nouveau">← Changer de document</a><div class="page-head"><div><h1>À qui l’envoyer ?</h1><p>' + esc(d.type) + '</p></div></div>' +
        '<form data-form="dest" novalidate>' +
        '<div class="field"><label for="f-client">Nom du client</label><input id="f-client" name="client" autocomplete="off" value="' + esc(d.client) + '"><p class="err" id="e-client" hidden>Indiquez le nom du client.</p></div>' +
        '<div class="field"><label for="f-contact">E-mail ou téléphone</label><input id="f-contact" name="contact" autocomplete="off" value="' + esc(d.contact) + '"><p class="err" id="e-contact" hidden>Indiquez un e-mail ou un numéro de téléphone.</p></div>' +
        '<div class="field"><label for="f-msg">Message pour le client</label><textarea id="f-msg" name="message">' + esc(d.message || defaultMsg(d.type)) + '</textarea></div>' +
        '<div class="actions"><button class="btn" type="submit">Continuer</button></div></form>'
    };
  };

  routes.envoi = function () {
    var d = state.draft;
    if (!d.client) { history.replaceState(null, '', '#/nouveau'); return routes.nouveau(); }
    return {
      title: 'Envoi',
      html: stepper(3) + '<a class="back" href="#/destinataire">← Modifier le destinataire</a><div class="page-head"><div><h1>Tout est bon ?</h1><p>Vérifiez avant d’envoyer.</p></div></div>' +
        '<div class="panel"><h3>' + esc(d.type) + '</h3>' + docLines() + '<div class="signzone">Zone de signature du client</div></div>' +
        '<div class="panel"><dl class="recap"><div><dt>Client</dt><dd>' + esc(d.client) + '</dd></div><div><dt>Contact</dt><dd>' + esc(d.contact) + '</dd></div><div><dt>Message</dt><dd>' + esc(d.message || defaultMsg(d.type)) + '</dd></div></dl></div>' +
        '<div class="actions"><button class="btn" type="button" data-action="send">Envoyer au client</button><a class="link" href="#/destinataire">Retour</a></div>'
    };
  };

  routes.suivi = function (id) {
    var d = find(id);
    if (!d) return routes.documents();
    var steps = [
      ['Créé', true],
      ['Envoyé au client', d.status !== 'draft'],
      ['Ouvert par le client', d.status === 'signed'],
      ['Signé', d.status === 'signed']
    ];
    var tl = '<ol class="timeline">' + steps.map(function (s) {
      return '<li class="' + (s[1] ? 'done' : 'todo') + '"><strong>' + s[0] + '</strong><span class="sr">' + (s[1] ? ' : fait' : ' : à venir') + '</span></li>';
    }).join('') + '</ol>';
    var act = '';
    if (d.status === 'sent') act = '<a class="btn" href="#/client/' + esc(d.id) + '">Simuler la vue du client</a>';
    if (d.status === 'draft') act = '<button class="btn" type="button" data-action="resume" data-id="' + esc(d.id) + '">Terminer et envoyer</button>';
    var sig = d.status === 'signed' ? '<div class="panel"><h3>Signature</h3>' + (d.sig ? '<img class="sigimg" src="' + esc(d.sig) + '" alt="Signature du client">' : '<p class="muted">Document signé (exemple).</p>') + '</div>' : '';
    return {
      title: d.type,
      html: '<a class="back" href="#/documents">← Documents</a><div class="page-head"><div><p class="eyebrow">' + esc(d.client) + '</p><h1>' + esc(d.type) + '</h1></div>' + pill(d.status) + '</div>' +
        '<div class="panel"><h3>Suivi</h3>' + tl + '</div>' + sig +
        '<div class="panel"><dl class="recap"><div><dt>Client</dt><dd>' + esc(d.client) + '</dd></div><div><dt>Contact</dt><dd>' + esc(d.contact || '—') + '</dd></div></dl></div>' +
        (act ? '<div class="actions">' + act + '</div>' : '')
    };
  };

  routes.client = function (id) {
    var d = id ? find(id) : null;
    if (!d) { for (var i = 0; i < state.docs.length; i++) if (state.docs[i].status === 'sent') { d = state.docs[i]; break; } }
    cli = { step: 'read', id: d ? d.id : null, type: d ? d.type : 'Bon de commande', client: d ? d.client : 'Client exemple' };
    return {
      title: 'Vue du client',
      html: '<div class="page-head"><div><p class="eyebrow">Côté client</p><h1>Ce que voit votre client</h1><p>Signez à sa place pour voir le parcours complet.</p></div></div>' +
        '<div class="phone" id="phone"></div><p class="caption" style="margin-top:20px">Le client ouvre le lien reçu, lit le document et signe avec le doigt.</p>',
      after: paintClient
    };
  };

  function paintClient() {
    var el = document.getElementById('phone');
    if (!el) return;
    pad = null;
    if (cli.step === 'read') {
      el.innerHTML = '<p class="tag">Document reçu</p><h2>' + esc(cli.type) + '</h2><p class="muted" style="margin:0">Pour ' + esc(cli.client) + '</p>' + docLines() + '<div class="signzone">Votre signature ici</div><button class="btn" type="button" data-action="c-sign">Lire puis signer</button>';
    } else if (cli.step === 'sign') {
      el.innerHTML = '<p class="tag">Étape finale</p><h2>Signez avec votre doigt</h2><canvas id="pad" class="pad" aria-label="Zone de signature"></canvas><div class="pad-actions"><button class="btn" id="validate" type="button" data-action="c-validate" disabled>Valider ma signature</button><button class="link" type="button" data-action="c-clear">Effacer</button></div>';
      initPad();
    } else {
      var back = cli.id ? '#/suivi/' + cli.id : '#/documents';
      el.innerHTML = '<div class="done-box">' + MASCOT + '<h2>Merci, c’est signé.</h2><p class="muted" style="margin:0">Votre ' + esc(cli.type.toLowerCase()) + ' a bien été signé.</p></div><a class="btn" href="' + back + '" style="text-align:center">Retourner dans l’application</a>';
    }
  }

  function initPad() {
    var cv = document.getElementById('pad');
    if (!cv || !cv.getContext) return;
    var dpr = window.devicePixelRatio || 1, r = cv.getBoundingClientRect();
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    var g = cv.getContext('2d');
    g.scale(dpr, dpr); g.lineWidth = 2.6; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#1F4D3A';
    var down = false, last = null, drawn = false, btn = document.getElementById('validate');
    function pos(e) { var b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; }
    cv.addEventListener('pointerdown', function (e) {
      down = true; last = pos(e);
      try { cv.setPointerCapture(e.pointerId); } catch (x) { /* ignoré */ }
      g.beginPath(); g.moveTo(last[0], last[1]); g.lineTo(last[0] + 0.1, last[1]); g.stroke();
      drawn = true; btn.disabled = false;
    });
    cv.addEventListener('pointermove', function (e) {
      if (!down) return;
      var p = pos(e); g.beginPath(); g.moveTo(last[0], last[1]); g.lineTo(p[0], p[1]); g.stroke(); last = p;
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { cv.addEventListener(t, function () { down = false; }); });
    pad = {
      clear: function () { g.clearRect(0, 0, r.width, r.height); drawn = false; btn.disabled = true; },
      data: function () { return drawn ? cv.toDataURL('image/png') : ''; }
    };
  }

  // ---------- Feuille de partage ----------
  var sheetOpener = null;
  function openSheet(id) {
    var d = find(id); if (!d) return;
    sheetOpener = id;
    document.getElementById('sheet-root').innerHTML =
      '<div class="sheet-bg" data-action="close-sheet"></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t">' +
      '<h2 id="sheet-t">Le document est prêt à partir</h2><p>Envoyez le lien de signature à ' + esc(d.client) + '.</p>' +
      '<div class="linkbox"><code>Lien d’exemple · …/signer/' + esc(d.id) + '</code><button class="btn btn-small" type="button" data-action="copy">Copier</button></div>' +
      '<div class="share"><button type="button" data-action="share" data-v="WhatsApp">WhatsApp</button><button type="button" data-action="share" data-v="SMS">SMS</button><button type="button" data-action="share" data-v="E-mail">E-mail</button></div>' +
      '<div class="actions"><a class="btn" href="#/suivi/' + esc(d.id) + '">Voir le suivi</a><a class="link" href="#/client/' + esc(d.id) + '">Simuler la vue du client</a></div></div>';
    var first = document.querySelector('#sheet-root .btn');
    if (first) first.focus();
  }
  function closeSheet(go) {
    var id = sheetOpener; sheetOpener = null;
    document.getElementById('sheet-root').innerHTML = '';
    if (go && id) location.hash = '#/suivi/' + id;
  }

  var toastTimer = null;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3600);
  }

  // ---------- Routeur ----------
  var view = document.getElementById('view');
  var NAVMAP = { documents: 'documents', suivi: 'documents', nouveau: 'nouveau', destinataire: 'nouveau', envoi: 'nouveau', client: 'client' };
  function route() {
    var parts = (location.hash.replace(/^#\/?/, '') || 'documents').split('/');
    var name = routes[parts[0]] ? parts[0] : 'documents';
    if (sheetOpener) closeSheet(false);
    var r = routes[name](parts[1]);
    document.title = r.title + ' · Parafe (démo)';
    view.className = ''; void view.offsetWidth; view.className = 'view';
    view.innerHTML = r.html;
    if (r.after) r.after();
    var cur = NAVMAP[name];
    Array.prototype.forEach.call(document.querySelectorAll('.navlink'), function (a) {
      if (a.getAttribute('data-route') === cur) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    view.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    if (state.flash) { toast(state.flash); state.flash = ''; save(); }
  }
  window.addEventListener('hashchange', route);

  // ---------- Actions ----------
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-action]');
    if (!a) return;
    var act = a.getAttribute('data-action');
    if (act === 'filter') { state.filter = a.getAttribute('data-v'); save(); route(); }
    else if (act === 'send') {
      var d = state.draft, id = 'd' + Date.now();
      state.docs.unshift({ id: id, type: d.type, client: d.client, contact: d.contact, message: d.message || defaultMsg(d.type), status: 'sent', when: 'À l’instant' });
      state.draft = blankDraft(); save(); openSheet(id);
    }
    else if (act === 'resume') {
      var doc = find(a.getAttribute('data-id'));
      if (doc) { state.draft = { type: doc.type, client: doc.client, contact: doc.contact || '', message: '' }; state.docs = state.docs.filter(function (x) { return x !== doc; }); save(); location.hash = '#/destinataire'; }
    }
    else if (act === 'close-sheet') closeSheet(true);
    else if (act === 'copy') {
      var txt = '…/signer/' + sheetOpener;
      try { if (navigator.clipboard) navigator.clipboard.writeText(txt); } catch (x) { /* ignoré */ }
      toast('Lien d’exemple copié.');
    }
    else if (act === 'share') toast('Démo : le partage par ' + a.getAttribute('data-v') + ' n’est pas actif.');
    else if (act === 'c-sign') { cli.step = 'sign'; paintClient(); }
    else if (act === 'c-clear') { if (pad) pad.clear(); }
    else if (act === 'c-validate') {
      if (!pad) return;
      var sig = pad.data(); if (!sig) return;
      var target = cli.id ? find(cli.id) : null;
      if (target) { target.status = 'signed'; target.sig = sig; target.when = 'À l’instant'; state.flash = target.type + ' signé par ' + target.client + '.'; save(); }
      cli.step = 'done'; paintClient();
    }
  });

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-form]');
    if (!form) return;
    e.preventDefault();
    var kind = form.getAttribute('data-form');
    if (kind === 'type') {
      var picked = form.querySelector('input[name="type"]:checked');
      var changed = picked && picked.value !== state.draft.type;
      if (picked) state.draft.type = picked.value;
      if (changed) state.draft.message = '';
      save(); location.hash = '#/destinataire';
    } else if (kind === 'dest') {
      var c = form.elements.client, k = form.elements.contact, m = form.elements.message;
      var okC = c.value.trim() !== '', okK = k.value.trim() !== '';
      c.setAttribute('aria-invalid', String(!okC)); k.setAttribute('aria-invalid', String(!okK));
      document.getElementById('e-client').hidden = okC; document.getElementById('e-contact').hidden = okK;
      if (!okC) { c.focus(); return; }
      if (!okK) { k.focus(); return; }
      state.draft.client = c.value.trim(); state.draft.contact = k.value.trim(); state.draft.message = m.value.trim();
      save(); location.hash = '#/envoi';
    }
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheetOpener) closeSheet(true); });

  route();
})();
