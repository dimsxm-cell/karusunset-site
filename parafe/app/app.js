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
  var MASCOT = '<svg class="mascot" viewBox="0 0 112 128" width="96" height="110" aria-hidden="true"><ellipse class="m-shadow" cx="56" cy="119" rx="30" ry="4.5"/><g class="m-body"><image href="../assets/lea-body.webp" x="6" y="6" width="100" height="109.4"/><g class="m-eye"><ellipse cx="40" cy="80" rx="5.2" ry="6" fill="#1B1412"/><circle cx="38.4" cy="77.6" r="1.7" fill="#fff"/><circle cx="41.6" cy="82.6" r=".8" fill="#fff" opacity=".55"/></g><g class="m-eye"><ellipse cx="73" cy="80" rx="5.2" ry="6" fill="#1B1412"/><circle cx="71.4" cy="77.6" r="1.7" fill="#fff"/><circle cx="74.6" cy="82.6" r=".8" fill="#fff" opacity=".55"/></g><path d="M50.5 88 Q56.5 93.5 62.5 88" fill="none" stroke="#2B1A14" stroke-width="1.7" stroke-linecap="round"/></g></svg>';

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

  // ---------- Léa, assistante (réponses préparées à l'avance, ce n'est pas une IA) ----------
  var LEA_AV = '<svg class="mascot lea-av" viewBox="0 0 112 128" width="38" height="43" aria-hidden="true"><g class="m-body"><image href="../assets/lea-body.webp" x="6" y="6" width="100" height="109.4"/><g class="m-eye"><ellipse cx="40" cy="80" rx="5.2" ry="6" fill="#1B1412"/><circle cx="38.4" cy="77.6" r="1.7" fill="#fff"/><circle cx="41.6" cy="82.6" r=".8" fill="#fff" opacity=".55"/></g><g class="m-eye"><ellipse cx="73" cy="80" rx="5.2" ry="6" fill="#1B1412"/><circle cx="71.4" cy="77.6" r="1.7" fill="#fff"/><circle cx="74.6" cy="82.6" r=".8" fill="#fff" opacity=".55"/></g><path d="M50.5 88 Q56.5 93.5 62.5 88" fill="none" stroke="#2B1A14" stroke-width="1.7" stroke-linecap="round"/></g></svg>';
  var lea = { open: false, visible: true, msgs: [], flow: null, route: { name: 'documents', arg: null } };

  function msgFor(type, client) {
    return 'Bonjour ' + client + ', voici votre ' + type.toLowerCase() + ' à signer. Vous pouvez le faire depuis votre téléphone, en quelques secondes. Merci.';
  }
  function leaSay(t) { lea.msgs.push({ from: 'lea', text: t }); }
  function leaMe(t) { lea.msgs.push({ from: 'me', text: t }); }

  function leaChips() {
    var n = lea.route.name, c = [];
    if (n === 'documents') c = [['pending', 'Que veut dire « En attente » ?'], ['howsend', 'Comment envoyer un document ?'], ['wheresig', 'Où voir la signature ?']];
    else if (n === 'nouveau') c = [['type', 'Quel type choisir ?']];
    else if (n === 'destinataire') c = [['contact', 'Quel contact indiquer ?'], ['msg', 'Écrire le message pour moi']];
    else if (n === 'envoi') c = [['clientsees', 'Que verra mon client ?'], ['share', 'Comment partager le lien ?']];
    else if (n === 'suivi') c = [['steps', 'Que veulent dire les étapes ?'], ['next', 'Et maintenant ?']];
    c.push(['guide', 'Préparer un document avec Léa']);
    return c;
  }

  function leaAnswer(id) {
    var d = lea.route.arg ? find(lea.route.arg) : null;
    switch (id) {
      case 'pending': return 'Le document est parti chez votre client, qui ne l’a pas encore signé. Ouvrez-le pour suivre son avancement.';
      case 'howsend': return 'Cliquez sur « Nouveau document », choisissez le type, indiquez votre client, vérifiez, puis envoyez. Je peux aussi le faire avec vous.';
      case 'wheresig': return 'Ouvrez un document « Signé » : la signature de votre client s’affiche dans sa fiche.';
      case 'type': return 'Bon de commande : votre client valide ce qu’il achète. Devis : il accepte votre proposition. Contrat : il s’engage par écrit. Choisissez selon ce que vous avez convenu avec lui.';
      case 'contact': return 'Un e-mail ou un numéro de téléphone suffit : c’est là que votre client recevra le lien. Dans cette démo, rien n’est réellement envoyé.';
      case 'clientsees': return 'Votre client reçoit votre message, ouvre le document sur son téléphone, le lit puis signe avec le doigt. Après l’envoi, vous pouvez essayer à sa place.';
      case 'share': return 'Après « Envoyer au client », une feuille propose de copier le lien ou de le partager. Dans cette démo, le partage n’est pas actif.';
      case 'steps': return 'Créé : le document existe. Envoyé : il est parti chez votre client. Ouvert : votre client l’a consulté. Signé : c’est terminé.';
      case 'next':
        if (!d) return 'Retournez à la liste des documents pour choisir le suivant.';
        if (d.status === 'sent') return 'Votre client n’a pas encore signé. Pour la démo, vous pouvez signer à sa place avec « Simuler la vue du client ».';
        if (d.status === 'signed') return 'C’est signé. Vous pouvez passer au client suivant.';
        return 'Ce brouillon n’est pas encore parti. Terminez-le pour l’envoyer.';
    }
    return '';
  }

  function leaAsk(id) {
    if (id === 'guide') {
      leaMe('Préparer un document avec Léa');
      lea.flow = { step: 'type', data: {} };
      leaSay('Avec plaisir. Quel type de document voulez-vous faire signer ?');
      leaRender('input'); return;
    }
    var label = id;
    leaChips().forEach(function (c) { if (c[0] === id) label = c[1]; });
    leaMe(label);
    if (id === 'msg') {
      var field = document.getElementById('f-msg'), cn = document.getElementById('f-client');
      var name = cn ? cn.value.trim() : '', text = name ? msgFor(state.draft.type, name) : defaultMsg(state.draft.type);
      if (field) {
        field.value = text;
        leaSay('Voici un message prêt à l’emploi : « ' + text + ' » Je l’ai ajouté dans le champ, vous pouvez le modifier.');
        leaClose(); toast('Message ajouté par Léa.'); return;
      }
      leaSay('Ouvrez l’étape « Destinataire » et je rédigerai le message pour vous.');
    } else {
      leaSay(leaAnswer(id));
    }
    leaRender();
  }

  function leaSubmit() {
    var f = lea.flow, input = document.getElementById('lea-field');
    if (!f || !input) return;
    var v = input.value.trim();
    if (!v) { input.focus(); return; }
    leaMe(v);
    if (f.step === 'client') {
      f.data.client = v; f.step = 'contact';
      leaSay('Merci. Quel est son e-mail ou son numéro de téléphone ?');
      leaRender('input');
    } else if (f.step === 'contact') {
      f.data.contact = v; f.step = 'confirm';
      leaSay('Voici le message que je propose : « ' + msgFor(f.data.type, f.data.client) + ' » Je prépare le document avec ça ?');
      leaRender();
    }
  }

  function leaAction(act, a) {
    if (act === 'lea-toggle') { if (lea.open) leaClose(); else leaOpen(); }
    else if (act === 'lea-close') leaClose();
    else if (act === 'lea-ask') leaAsk(a.getAttribute('data-v'));
    else if (act === 'lea-type') {
      var t = a.getAttribute('data-v');
      lea.flow.data.type = t; lea.flow.step = 'client';
      leaMe(t); leaSay('Très bien. Quel est le nom de votre client ?');
      leaRender('input');
    }
    else if (act === 'lea-apply') {
      var dd = lea.flow.data;
      state.draft = { type: dd.type, client: dd.client, contact: dd.contact, message: msgFor(dd.type, dd.client) };
      state.flash = 'Léa a préparé le document. Vérifiez, puis envoyez.';
      save(); leaMe('Oui, préparez-le.');
      leaSay('C’est prêt : vérifiez le récapitulatif, puis envoyez.');
      lea.flow = null; leaClose();
      if (location.hash === '#/envoi') route(); else location.hash = '#/envoi';
    }
    else if (act === 'lea-cancel') { leaMe('Non, merci.'); lea.flow = null; leaSay('D’accord. Je reste là si besoin.'); leaRender(); }
  }

  function leaOpen() {
    if (!lea.msgs.length) leaSay('Bonjour, je suis Léa. Je peux vous expliquer cet écran ou préparer un document avec vous. Mes réponses sont préparées à l’avance : c’est une démo.');
    lea.open = true; leaRender('close');
  }
  function leaClose() {
    lea.open = false; leaRender();
    var f = document.querySelector('.lea-fab'); if (f) f.focus();
  }

  function leaRender(focus) {
    var root = document.getElementById('lea-root');
    if (!root) return;
    if (!lea.visible) { root.innerHTML = ''; return; }
    if (!lea.open) {
      root.innerHTML = '<button class="lea-fab" type="button" data-action="lea-toggle" aria-expanded="false" aria-controls="lea-panel">' + LEA_AV + '<span>Léa</span></button>';
      return;
    }
    var log = lea.msgs.map(function (m) { return '<div class="b ' + (m.from === 'lea' ? 'b-lea' : 'b-me') + '">' + esc(m.text) + '</div>'; }).join('');
    var f = lea.flow, foot;
    if (f && (f.step === 'client' || f.step === 'contact')) {
      var lab = f.step === 'client' ? 'Nom du client' : 'E-mail ou téléphone';
      foot = '<form class="lea-in" data-form="lea" novalidate><label class="sr" for="lea-field">' + lab + '</label><input id="lea-field" autocomplete="off" placeholder="' + lab + '"><button class="btn btn-small" type="submit">Envoyer</button></form>';
    } else if (f && f.step === 'type') {
      foot = '<div class="lea-chips">' + TYPES.map(function (t) { return '<button type="button" class="chip" data-action="lea-type" data-v="' + esc(t[0]) + '">' + esc(t[0]) + '</button>'; }).join('') + '</div>';
    } else if (f && f.step === 'confirm') {
      foot = '<div class="lea-chips"><button type="button" class="chip chip-main" data-action="lea-apply">Préparer le document</button><button type="button" class="chip" data-action="lea-cancel">Annuler</button></div>';
    } else {
      foot = '<div class="lea-chips">' + leaChips().map(function (c) { return '<button type="button" class="chip" data-action="lea-ask" data-v="' + c[0] + '">' + esc(c[1]) + '</button>'; }).join('') + '</div>';
    }
    root.innerHTML = '<section class="lea" id="lea-panel" role="dialog" aria-label="Léa, assistante">' +
      '<header class="lea-head">' + LEA_AV + '<div><strong>Léa</strong><span>Assistante · réponses préparées (démo)</span></div><button class="lea-close" type="button" data-action="lea-close" aria-label="Fermer Léa">✕</button></header>' +
      '<div class="lea-log" role="log" aria-live="polite">' + log + '</div><div class="lea-foot">' + foot + '</div></section>';
    var lg = root.querySelector('.lea-log'); lg.scrollTop = lg.scrollHeight;
    if (focus === 'input') { var inp = document.getElementById('lea-field'); if (inp) inp.focus(); else { var ch = root.querySelector('.chip'); if (ch) ch.focus(); } }
    else if (focus === 'close') { var cb = root.querySelector('.lea-close'); if (cb) cb.focus(); }
  }

  function leaSync(name, arg) {
    lea.route = { name: name, arg: arg || null };
    lea.visible = name !== 'client';
    if (!lea.visible) lea.open = false;
    leaRender();
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
    leaSync(name, parts[1]);
    if (state.flash) { toast(state.flash); state.flash = ''; save(); }
  }
  window.addEventListener('hashchange', route);

  // ---------- Actions ----------
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-action]');
    if (!a) return;
    var act = a.getAttribute('data-action');
    if (act.indexOf('lea-') === 0) { leaAction(act, a); return; }
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
    if (kind === 'lea') { leaSubmit(); return; }
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

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (sheetOpener) closeSheet(true);
    else if (lea.open) leaClose();
  });

  route();
})();
