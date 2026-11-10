/* El gran misterio del poblamiento — interfaz. v1.0.3 */
(function () {
  'use strict';
  var D = window.POB_DATA, M = window.POB_MAP, E = window.POB_ENGINE;
  var $ = function (id) { return document.getElementById(id); };
  var TN = D.TN;
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  /* v1.0.3 — páginas: número o rango («2–5», «7 y 9») */
  function pgTxt(pg) { return (/–| y /.test(String(pg)) ? 'págs. ' : 'pág. ') + pg; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function show(id) { ['home', 'study', 'play', 'sum'].forEach(function (x) { $(x).classList.toggle('hid', x !== id); }); window.scrollTo(0, 0); }
  function store() { try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return localStorage; } catch (e) { var m = {}; return { getItem: function (k) { return k in m ? m[k] : null; }, setItem: function (k, v) { m[k] = String(v); }, removeItem: function (k) { delete m[k]; } }; } }
  var ST = store();
  /* Que la explicación quede entera por encima de la barra fija de abajo, sin sacar el mensaje por arriba */
  function revealAbove(el) {
    try {
      if (!el || el.classList.contains('hid')) return;
      var bar = $('pAct'), limit = (bar.classList.contains('stick') ? bar.getBoundingClientRect().top : window.innerHeight) - 8;
      var r = el.getBoundingClientRect();
      if (r.bottom > limit) {
        var dy = r.bottom - limit, top = $('msg').getBoundingClientRect().top;
        if (top - dy < 8) dy = Math.max(0, top - 8);
        window.scrollBy(0, dy);
      }
    } catch (e) {}
  }
  function drawCk() { var c = E.getChecks(ST); document.querySelectorAll('.chk').forEach(function (e) { e.classList.toggle('no', c.indexOf(e.dataset.t) < 0); }); }
  function home() { stopTimer(); chal = false; drawCk(); $('best').textContent = ST.getItem(E.BK) || 0; document.querySelectorAll('.nm').forEach(function (e) { e.textContent = window.NM(); }); show('home'); }
  document.querySelectorAll('[data-home]').forEach(function (b) { b.onclick = home; });

  /* ---------------- ESTUDIAR ---------------- */
  var stTab = 'rutas', rSel = 'asia', fcI = 0, fcF = false;
  var TABS = [['rutas', '🗺️ Rutas en el mapa']].concat(D.TOPICS.map(function (t) { return [t, D.TE[t] + ' ' + TN[t]]; }));
  function study() {
    $('stTabs').innerHTML = '';
    TABS.forEach(function (t) {
      var b = document.createElement('button'); b.className = 'btn ' + (t[0] === stTab ? 'g' : 'gray'); b.textContent = t[1];
      b.onclick = function () { stTab = t[0]; fcI = 0; fcF = false; study(); }; $('stTabs').appendChild(b);
    });
    var isR = stTab === 'rutas';
    $('stRoute').classList.toggle('hid', !isR); $('stCards').classList.toggle('hid', isR);
    if (isR) drawRoute(); else drawFc();
    show('study');
  }
  function drawRoute() {
    $('stTitle').textContent = '📖 Rutas del poblamiento';
    var opts = [['asia', '🟠 Asiática'], ['pacifico', '🔵 Transpacífica'], ['antartica', '🟣 Antártica'], ['todas', '🌎 Las tres']];
    $('rTabs').innerHTML = '';
    opts.forEach(function (o) {
      var b = document.createElement('button'); b.className = 'btn ' + (o[0] === rSel ? 'o' : 'gray'); b.textContent = o[1];
      b.onclick = function () { rSel = o[0]; drawRoute(); }; $('rTabs').appendChild(b);
    });
    var all = rSel === 'todas', ks = all ? ['asia', 'pacifico', 'antartica'] : [rSel];
    $('rMap').innerHTML = M.svg({ routes: ks, labels: true, dots: true, title: 'Mapa de rutas del poblamiento' });
    if (all) {
      $('rInfo').innerHTML = ks.map(function (k) { var R = D.ROUTES[k]; return '<p><b style="color:' + R.color + '">■</b> <b>' + R.name + '</b>: ' + R.who + '</p>'; }).join('');
      $('rSteps').innerHTML = '';
    } else {
      var R = D.ROUTES[rSel];
      $('rInfo').innerHTML = '<p><b>' + R.name + '</b><br>👤 ' + R.who + '<br>🚶 ' + R.how + '<br><span class="hint">📄 Folleto, ' + pgTxt(R.pg) + '</span></p><p style="margin:4px 0"><b>Ruta para memorizar:</b></p>';
      $('rSteps').innerHTML = [R.who].concat(R.steps).map(function (s, i) { return '<li><span class="n" style="background:' + R.color + '">' + (i === 0 ? '👤' : i) + '</span><span>' + s + '</span></li>'; }).join('');
    }
  }
  function drawFc() {
    var cs = D.CARDS[stTab], c = cs[fcI];
    $('stTitle').textContent = '📖 ' + TN[stTab] + ' (' + (fcI + 1) + '/' + cs.length + ')';
    $('fc').innerHTML = fcF ? '<div>' + esc(c[1]) + '</div><div class="hint" style="margin-top:8px">📄 ' + pgTxt(c[2]) + '</div>' : '<div class="big">' + esc(c[0]) + '</div>';
  }
  $('fc').onclick = function () { fcF = !fcF; drawFc(); };
  $('fc').onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fcF = !fcF; drawFc(); } };
  $('fcPrev').onclick = function () { var n = D.CARDS[stTab].length; fcI = (fcI - 1 + n) % n; fcF = false; drawFc(); };
  $('fcNext').onclick = function () { var n = D.CARDS[stTab].length; fcI = (fcI + 1) % n; fcF = false; drawFc(); };
  $('bStudy').onclick = study;

  /* ---------------- PRACTICAR / DESAFÍO ---------------- */
  var cur = null, score = 0, streak = 0, done = 0, missed = [], answered = false, chal = false, timer = null, left = 0, chalT = [], picker = null, repeatQ = [];
  function sel() { var s = [].map.call(document.querySelectorAll('#topics input:checked'), function (i) { return i.value; }); return s.length ? s : D.TOPICS.slice(); }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function begin(topics, isChal) {
    var list = E.pool(D.ITEMS, topics, isChal);
    picker = E.makePicker(list);
    score = 0; streak = 0; done = 0; missed = []; chal = isChal;
    $('sc').textContent = 0; $('st').textContent = 0; show('play'); stopTimer();
    if (chal) {
      left = 60; $('tm').classList.remove('hid'); $('tm').textContent = '⏱️ 60';
      timer = setInterval(function () { left--; $('tm').textContent = '⏱️ ' + left; if (left <= 0) finish(); }, 1000);
    } else $('tm').classList.add('hid');
    next();
  }
  var SUB = { vf: ' · ¿Verdadero o falso?', ns: ' · ¿Nómadas o sedentarios?' };
  var KIND = { order: ' · Ordenar', match: ' · Relacionar', tap: ' · Mapa' };
  function next() {
    cur = repeatQ.length ? repeatQ.shift() : picker();
    answered = false;
    $('tg').textContent = D.TE[cur.topic] + ' ' + TN[cur.topic] + (SUB[cur.sub] || KIND[cur.kind] || (cur.map ? ' · Mapa' : ''));
    $('qt').textContent = cur.q;
    $('cnt').textContent = 'Preguntas: ' + done;
    $('opts').innerHTML = ''; $('msg').textContent = ''; $('exp').classList.add('hid'); $('nx').classList.add('hid'); $('pAct').classList.remove('stick');
    var mb = $('pMap');
    if (cur.map) {
      mb.classList.remove('hid');
      mb.innerHTML = M.svg({ route: cur.route, tap: cur.kind === 'tap', continents: true, title: cur.kind === 'tap' ? 'Mapa: toca un punto' : 'Mapa con una ruta' });
      if (cur.kind === 'tap') {
        [].forEach.call(mb.querySelectorAll('g.zone'), function (gz) {
          gz.addEventListener('click', function () { answer(gz.getAttribute('data-z')); });
          gz.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); answer(gz.getAttribute('data-z')); } });
        });
        $('opts').innerHTML = '<p class="hint">👆 Toca un punto blanco en el mapa.</p>';
        return;
      }
    } else { mb.classList.add('hid'); mb.innerHTML = ''; }
    if (cur.kind === 'order') return drawOrder();
    if (cur.kind === 'match') return drawMatch();
    var fixed = cur.sub === 'vf' || cur.sub === 'ns';
    var box = $('opts'); if (fixed) { box = document.createElement('div'); box.className = 'vf'; $('opts').appendChild(box); }
    var list = (fixed ? cur.o : E.shuffle(cur.o));
    var long = list.some(function (o) { return o.length > 40; });
    list.forEach(function (o) {
      var b = document.createElement('button'); b.className = 'btn opt' + (long ? ' long' : ''); b.textContent = (fixed ? (o === 'Verdadero' ? '✅ ' : o === 'Falso' ? '❌ ' : o === 'Nómadas' ? '🚶 ' : '🏠 ') : '') + o; b.dataset.v = o;
      b.onclick = function () { answer(o, b); }; box.appendChild(b);
    });
  }
  function drawOrder() {
    var built = [], bx = document.createElement('div'); bx.className = 'built'; bx.textContent = '…';
    var ch = document.createElement('div'); ch.className = 'chips';
    var sh = E.shuffle(cur.ord.map(function (w, i) { return [w, i]; }));
    var guard = 0; while (sh.every(function (x, i) { return x[1] === i; }) && guard++ < 20) sh = E.shuffle(sh);
    sh.forEach(function (x) {
      var c = document.createElement('button'); c.className = 'chip'; c.textContent = x[0];
      c.onclick = function () { if (answered) return; c.disabled = true; built.push(x[0]); bx.textContent = built.join(' → '); if (built.length === cur.ord.length) answer(built.slice(), null, bx); };
      ch.appendChild(c);
    });
    var rs = document.createElement('button'); rs.className = 'btn gray'; rs.textContent = '↩️ Borrar';
    rs.onclick = function () { if (answered) return; built.length = 0; bx.textContent = '…'; [].forEach.call(ch.children, function (x) { x.disabled = false; }); };
    var hint = document.createElement('p'); hint.className = 'hint'; hint.textContent = '👆 Toca las fichas en orden, de la primera a la última.';
    $('opts').append(hint, bx, ch, rs);
  }
  function drawMatch() {
    var given = {}, active = 0, L = cur.pairs.map(function (p) { return p[0]; });
    var R = E.shuffle(cur.pairs.map(function (p) { return p[1]; }));
    var guard = 0; while (R.every(function (r, i) { return r === cur.pairs[i][1]; }) && guard++ < 20) R = E.shuffle(R);
    var wrap = document.createElement('div'); wrap.className = 'pairs';
    var hint = document.createElement('p'); hint.className = 'hint'; hint.textContent = '👆 Elige la fila naranja y luego toca su pareja abajo.';
    var ch = document.createElement('div'); ch.className = 'chips';
    var ok = document.createElement('button'); ok.className = 'btn g hid'; ok.id = 'mOk'; ok.textContent = '✅ Comprobar';
    function firstEmpty() { for (var i = 0; i < L.length; i++) if (!given[L[i]]) return i; return -1; }
    function paint() {
      wrap.innerHTML = '';
      L.forEach(function (l, i) {
        var row = document.createElement('div'); row.className = 'pr' + (i === active && !answered ? ' active' : ''); row.dataset.l = l;
        row.innerHTML = '<span class="l">' + esc(l) + '</span><span class="r' + (given[l] ? ' fill' : '') + '">' + (given[l] ? esc(given[l]) : '❓') + '</span>';
        row.onclick = function () { if (answered) return; if (given[l]) delete given[l]; active = i; paint(); };
        wrap.appendChild(row);
      });
      ch.innerHTML = '';
      var used = Object.keys(given).map(function (k) { return given[k]; });
      R.forEach(function (r) {
        var c = document.createElement('button'); c.className = 'chip'; c.textContent = r; c.disabled = used.indexOf(r) >= 0 || answered;
        c.onclick = function () { if (answered || active < 0) return; given[L[active]] = r; active = firstEmpty(); paint(); };
        ch.appendChild(c);
      });
      ok.classList.toggle('hid', firstEmpty() >= 0 || answered);
    }
    ok.onclick = function () { if (answered) return; answer(Object.assign({}, given), null, wrap); };
    paint();
    $('opts').append(hint, wrap, ch, ok);
  }
  var GOOD = ['¡Muy bien! 🎉', '¡Excelente! ⭐', '¡Correcto! 👏', '¡Lo hiciste genial! 🚀', '¡Súper! 💪'];
  function answer(given, el, bx) {
    if (answered) return; answered = true; done++;
    var ok = E.isRight(cur, given);
    if (cur.kind === 'order') {
      bx.classList.add(ok ? 'ok' : 'bad');
      bx.innerHTML = ok ? esc(cur.a) : 'Tu orden: ' + esc(given.join(' → ')) + '<br>✔️ ' + esc(cur.a);
    } else if (cur.kind === 'match') {
      [].forEach.call(bx.children, function (row) {
        var l = row.dataset.l, right = cur.pairs.filter(function (p) { return p[0] === l; })[0][1], good = given[l] === right;
        row.classList.remove('active'); row.classList.add(good ? 'ok' : 'bad');
        if (!good) row.querySelector('.r').innerHTML = esc(given[l] || '—') + '<span class="fix">✔️ ' + esc(right) + '</span>';
      });
      $('mOk').classList.add('hid');
      [].forEach.call(document.querySelectorAll('#opts .chips, #opts .hint'), function (c) { c.classList.add('hid'); });
    } else if (cur.kind === 'tap') {
      var mk = {}; mk[cur.a] = 'ok'; if (!ok) mk[given] = 'bad';
      $('pMap').innerHTML = M.svg({ route: cur.route, mark: mk, continents: true });
    } else {
      [].forEach.call($('opts').querySelectorAll('button.opt'), function (x) { if (x.dataset.v === cur.a) x.classList.add('ok'); x.disabled = true; x.style.opacity = 1; });
      if (!ok && el) el.classList.add('bad');
    }
    if (ok) { score++; streak++; $('msg').textContent = rnd(GOOD) + (streak >= 3 ? ' ¡Racha de ' + streak + '! 🔥' : ''); }
    else { streak = 0; missed.push(cur); $('msg').textContent = '¡Casi! Mira la respuesta correcta 💡'; }
    $('sc').textContent = score; $('st').textContent = streak; $('cnt').textContent = 'Preguntas: ' + done;
    if (chal) { setTimeout(function () { if (chal && left > 0) next(); }, ok ? 600 : 1600); return; }
    $('exp').innerHTML = 'ℹ️ ' + esc(cur.e) + '<span class="pg">📄 Folleto, ' + pgTxt(cur.pg) + '</span>';
    $('exp').classList.remove('hid'); $('nx').classList.remove('hid'); $('pAct').classList.add('stick');
    revealAbove($('exp'));
  }
  var lock = 0;
  $('nx').onclick = function () { if (Date.now() - lock < 400) return; lock = Date.now(); next(); window.scrollTo(0, 0); };
  function zoneName(z) { var f = M.ZONES.filter(function (x) { return x.id === z; })[0]; return f ? f.n : z; }
  function finish() {
    stopTimer(); var wasChal = chal; chal = false; var t = '¡Buen trabajo, ' + window.NM() + '! 🌟';
    if (wasChal) {
      var res = E.applyChallenge(ST, chalT, score, done);
      if (res.record) t = '🏆 ¡Nuevo récord: ' + score + '!';
      if (res.granted) { drawCk(); t = '✅ ¡Tema superado! ' + score + ' sin errores. ¡Bravo, ' + window.NM() + '!'; }
    }
    $('sumT').textContent = t; $('sumP').textContent = 'Respondiste bien ' + score + ' de ' + done + ' preguntas.';
    $('sumL').innerHTML = missed.length ? '<h3>Para repasar:</h3><ul>' + missed.map(function (q) { return '<li><b>' + esc(q.q) + '</b><br>✔️ ' + esc(q.kind === 'tap' ? zoneName(q.a) : q.a) + ' — ' + esc(q.e) + ' <span class="hint">(' + pgTxt(q.pg) + ')</span></li>'; }).join('') + '</ul>' : '<p>¡No tuviste errores! 🎉</p>';
    $('rep').classList.toggle('hid', !missed.length); show('sum');
  }
  $('bFinish').onclick = finish;
  $('bPractice').onclick = function () { repeatQ = []; begin(sel(), false); };
  $('bChal').onclick = function () { repeatQ = []; chalT = sel(); begin(chalT, true); };
  $('rep').onclick = function () { repeatQ = missed.slice(); begin(D.TOPICS.slice(), false); };

  /* Gancho solo para pruebas automáticas (no cambia nada) */
  window.__TEST__ = function () { return { cur: cur, score: score, done: done, chal: chal, setScore: function (s, d) { score = s; done = d; }, force: function (id) { var it = D.ITEMS.filter(function (x) { return x.id === id; })[0]; if (it) { repeatQ = [it]; next(); } }, left: function () { return left; } }; };
  drawCk(); $('best').textContent = ST.getItem(E.BK) || 0;
})();
