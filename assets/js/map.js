/* Mapa simplificado (no a escala), centrado en el océano Pacífico como los mapas del folleto. v1.0.1 */
(function (g) {
  'use strict';
  var ZONES = [
    { id: 'siberia', n: 'Siberia', x: 112, y: 40, lx: 112, ly: 64 },
    { id: 'bering', n: 'Estrecho de Bering', x: 164, y: 30, lx: 164, ly: 14 },
    { id: 'alaska', n: 'Alaska', x: 206, y: 50, lx: 206, ly: 74 },
    { id: 'polinesia', n: 'Polinesia', x: 196, y: 186, lx: 196, ly: 166 },
    { id: 'costas', n: 'Costas de Perú, Ecuador y norte de Chile', x: 290, y: 206, lx: 274, ly: 232, l2: ['Costas de Perú, Ecuador', 'y norte de Chile'], anchor: 'end' },
    { id: 'australia', n: 'Australia', x: 70, y: 214, lx: 70, ly: 256 },
    { id: 'antartida', n: 'Antártida', x: 170, y: 306, lx: 108, ly: 310 },
    { id: 'fuego', n: 'Tierra del Fuego', x: 300, y: 272, lx: 352, ly: 286 }
  ];
  var LAND = [
    /* Asia */ 'M0,8 L150,8 L160,22 L150,34 L136,52 L124,74 L112,98 L92,112 L62,122 L30,118 L0,112 Z',
    /* América del Norte */ 'M180,26 L230,16 L300,12 L346,26 L342,58 L312,80 L300,102 L282,122 L266,136 L258,142 L264,152 L278,160 L288,166 L284,171 L270,163 L252,150 L240,132 L226,102 L216,80 L198,64 L182,58 L174,44 Z',
    /* América del Sur */ 'M288,170 L304,166 L326,176 L350,192 L346,216 L326,238 L312,258 L302,278 L294,276 L292,252 L286,228 L278,200 Z',
    /* Australia */ 'M34,196 L70,184 L106,194 L114,220 L96,240 L58,242 L36,228 Z',
    /* Antártida */ 'M0,300 Q50,294 100,298 Q160,292 220,298 Q290,292 400,298 L400,320 L0,320 Z'
  ];
  var ISLES = [[184, 176, 4], [196, 182, 3], [206, 174, 3], [190, 192, 3], [210, 190, 4], [86, 252, 5]];
  var PATHS = {
    asia: 'M56,70 Q86,44 112,40 L164,30 Q190,32 206,50 Q240,76 258,112',
    pacifico: 'M196,186 Q238,222 282,206',
    antartica: 'M74,232 Q78,284 140,300 Q228,306 296,272 L312,226'
  };
  var COLORS = { asia: '#f08a24', pacifico: '#2b8de2', antartica: '#7b4fd6' };
  var LABELS = [['ASIA', 50, 90], ['AMÉRICA', 290, 50], ['DEL NORTE', 290, 64], ['AMÉRICA', 318, 206], ['DEL SUR', 318, 220], ['OCEANÍA', 72, 178]];
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  /* opt: {route, routes:[...], tap:bool, mark:{zone:'ok'|'bad'}, labels:bool, continents:bool, title} */
  var uid = 0;
  function svg(opt) {
    opt = opt || {}; var u = 'm' + (++uid) + '-'; /* ids únicos: varios mapas en la página no comparten flechas */
    var s = '<svg class="map' + (opt.tap ? ' tapmap' : '') + '" viewBox="0 0 400 320" role="img" aria-label="' + esc(opt.title || 'Mapa simplificado del océano Pacífico y América') + '">';
    s += '<defs>';
    Object.keys(COLORS).forEach(function (k) { s += '<marker id="' + u + 'ar-' + k + '" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + COLORS[k] + '"/></marker>'; });
    s += '</defs><rect width="400" height="320" rx="18" fill="#cfe9fb"/>';
    s += '<text x="172" y="146" class="ocean">OCÉANO PACÍFICO</text>';
    LAND.forEach(function (d) { s += '<path d="' + d + '" fill="#f3e3b8" stroke="#9c7b3c" stroke-width="1.5"/>'; });
    ISLES.forEach(function (c) { s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#f3e3b8" stroke="#9c7b3c" stroke-width="1"/>'; });
    if (opt.continents !== false) LABELS.forEach(function (l) { s += '<text x="' + l[1] + '" y="' + l[2] + '" class="cont">' + l[0] + '</text>'; });
    var rs = opt.routes || (opt.route ? [opt.route] : []);
    rs.forEach(function (r) { s += '<path d="' + PATHS[r] + '" fill="none" stroke="' + COLORS[r] + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 0" marker-end="url(#' + u + 'ar-' + r + ')" opacity=".92"/>'; });
    ZONES.forEach(function (z) {
      var st = opt.mark && opt.mark[z.id] ? ' ' + opt.mark[z.id] : '';
      var showLbl = opt.labels || (opt.mark && opt.mark[z.id]);
      if (opt.tap || st || opt.dots) {
        s += '<g class="zone' + st + '" data-z="' + z.id + '"' + (opt.tap ? ' tabindex="0" role="button" aria-label="Lugar en el mapa"' : '') + '>';
        s += '<circle cx="' + z.x + '" cy="' + z.y + '" r="17" class="hit"/><circle cx="' + z.x + '" cy="' + z.y + '" r="9" class="dot"/></g>';
      }
      if (showLbl) {
        var an = z.anchor ? ' text-anchor="' + z.anchor + '"' : '';
        if (z.l2) s += '<text x="' + z.lx + '" y="' + z.ly + '" class="zl"' + an + '>' + esc(z.l2[0]) + '</text><text x="' + z.lx + '" y="' + (z.ly + 13) + '" class="zl"' + an + '>' + esc(z.l2[1]) + '</text>';
        else s += '<text x="' + z.lx + '" y="' + z.ly + '" class="zl">' + esc(z.n) + '</text>';
      }
    });
    return s + '</svg>';
  }
  g.POB_MAP = { ZONES: ZONES, PATHS: PATHS, COLORS: COLORS, svg: svg };
})(typeof window !== 'undefined' ? window : globalThis);
