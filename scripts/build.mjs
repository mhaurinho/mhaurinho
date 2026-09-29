// Gera os SVGs animados do perfil em /assets.
// Uso: node scripts/build.mjs   (GITHUB_TOKEN opcional, usado na Action)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as D from './data.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'assets')
mkdirSync(OUT, { recursive: true })

/* ───────────── base ───────────── */
const W = 900
const C = {
  bg: '#03070a', green: '#00ff9c', cyan: '#19c6ff', text: '#e8fff5',
  text2: '#a9c9bc', muted: '#6f8f84', line: 'rgba(0,255,156,0.16)', line2: 'rgba(0,255,156,0.34)',
  glass: 'rgba(8,22,19,0.78)',
}
const font = (f) => readFileSync(join(ROOT, 'scripts/fonts', `${f}.woff2`)).toString('base64')
const FONTS = { sg700: ['SG', 700], sg500: ['SG', 500], jb400: ['JB', 400], jb700: ['JB', 700] }
// embute só as fontes realmente usadas no SVG
const fontsFor = (markup) =>
  Object.entries(FONTS)
    .filter(([, [n, w]]) => (n === 'SG' ? /class="sg[^"]*"/ : /class="jb[^"]*"/).test(markup) && (w === 700 ? /b|font-weight="700"/.test(markup) || n === 'SG' : true))
    .map(([f, [n, w]]) => `@font-face{font-family:${n};font-weight:${w};src:url(data:font/woff2;base64,${font(f)}) format('woff2')}`)
    .join('')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const f2 = (n) => Math.round(n * 100) / 100

// PRNG determinístico: os SVGs só mudam quando o conteúdo muda
let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

const BASE_CSS = `
.sg{font-family:SG,'Segoe UI',sans-serif}.jb{font-family:JB,Consolas,monospace}
.b{font-weight:700}.m{font-weight:500}
.fade{opacity:0;animation:fade .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes fade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes blink{50%{opacity:0}}
@keyframes ping{0%{transform:scale(.6);opacity:1}100%{transform:scale(2.4);opacity:0}}
@keyframes tw{50%{opacity:.15}}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 2s ease-out infinite}
@media (prefers-reduced-motion:reduce){*{animation:none!important;opacity:1!important}}`

const DEFS = `
<linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.green}"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>
<linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.green}"/><stop offset=".7" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
<radialGradient id="glowbg" cx=".75" cy=".45" r=".6"><stop offset="0" stop-color="#07372a"/><stop offset="1" stop-color="${C.bg}"/></radialGradient>
<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>`

// Seções ganham um painel escuro com margem (legível também no tema claro do GitHub)
const P = 28
function svg(h, body, { css = '', title = '', pad = true } = {}) {
  const ow = pad ? W + P * 2 : W
  const oh = pad ? h + P * 2 : h
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ow}" height="${oh}" viewBox="0 0 ${ow} ${oh}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>${fontsFor(body)}${BASE_CSS}${css}</style>
<defs>${DEFS}</defs>
${pad ? `<rect width="${ow}" height="${oh}" rx="22" fill="${C.bg}"/><rect x=".5" y=".5" width="${ow - 1}" height="${oh - 1}" rx="22" fill="none" stroke="${C.line}"/><g transform="translate(${P} ${P})">${body}</g>` : body}
</svg>`
}

function stars(n, w, h) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const d = f2(rnd() * 4)
    s += `<circle cx="${f2(rnd() * w)}" cy="${f2(rnd() * h)}" r="${f2(0.4 + rnd() * 0.9)}" fill="#4dffc0" opacity="${f2(0.2 + rnd() * 0.5)}" style="animation:tw ${f2(2 + rnd() * 4)}s ${d}s infinite"/>`
  }
  return s
}

// quebra de linha aproximada (largura média do glifo em em)
function wrap(text, size, maxW, em = 0.53) {
  const max = Math.floor(maxW / (size * em))
  const lines = []
  let cur = ''
  for (const w of text.split(' ')) {
    if ((cur + ' ' + w).trim().length > max) { lines.push(cur); cur = w } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines
}

const glass = (x, y, w, h, r = 16) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${C.glass}" stroke="${C.line}"/>`

// chips em fonte mono (largura exata: 0.6em)
function chips(list, x, y, maxW, size = 11) {
  let cx = x, cy = y, out = ''
  for (const t of list) {
    const w = t.length * size * 0.6 + 20
    if (cx + w > x + maxW) { cx = x; cy += 30 }
    out += `<rect x="${f2(cx)}" y="${cy}" width="${f2(w)}" height="22" rx="11" fill="rgba(0,255,156,0.06)" stroke="${C.line2}"/>`
    out += `<text x="${f2(cx + w / 2)}" y="${cy + 15}" text-anchor="middle" class="jb" font-size="${size}" fill="${C.green}">${esc(t)}</text>`
    cx += w + 8
  }
  return { svg: out, bottom: cy + 22 }
}

function header(num, title, kicker, y = 0) {
  return `<g class="fade">
<text x="0" y="${y + 20}" class="jb" font-size="13" letter-spacing="3"><tspan fill="${C.muted}">// </tspan><tspan fill="${C.green}">${num}</tspan></text>
<text x="0" y="${y + 62}" class="sg b" font-size="38" fill="${C.text}" letter-spacing="-0.5">${esc(title)}</text>
<text x="0" y="${y + 90}" class="sg m" font-size="15" fill="${C.text2}">${esc(kicker)}</text>
<rect x="0" y="${y + 106}" width="${W}" height="1" fill="${C.line}"/>
<rect x="0" y="${y + 106}" width="140" height="2" fill="url(#grad)"/>
</g>`
}

const arrow = (x, y, color = C.green) =>
  `<path d="M${x} ${y + 10} L${x + 10} ${y} M${x + 3} ${y} H${x + 10} V${y + 7}" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`

/* ───────────── formas 3D (as mesmas do site) ───────────── */
const TAU = Math.PI * 2
const rotX = ([x, y, z], a) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]
const rotY = ([x, y, z], a) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)]
const rotZ = ([x, y, z], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z]
const j = (s) => (rnd() - 0.5) * s
const SHAPES = [
  (i, n) => {
    const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), th = i * 2.399963
    return [Math.cos(th) * r * 2.3, y * 2.3, Math.sin(th) * r * 2.3]
  },
  (i) => {
    const t = rnd(), y = (t - 0.5) * 6.2, a = t * TAU * 2.4 + (i % 2) * Math.PI
    const s = i % 9 === 0 ? rnd() * 2 - 1 : 1
    return rotZ([Math.cos(a) * 1.3 * s, y, Math.sin(a) * 1.3 * s], 0.85)
  },
  () => {
    const t = rnd() * TAU, rr = Math.cos(3 * t) + 2
    return [rr * Math.cos(2 * t) * 0.75 + j(0.25), rr * Math.sin(2 * t) * 0.75 + j(0.25), -Math.sin(3 * t) * 0.75 + j(0.25)]
  },
  (i) => {
    const cell = i % 140, c = cell % 20, r = Math.floor(cell / 20)
    const h = ((Math.sin(cell * 12.9898) * 43758.5453) % 1 + 1) % 1
    return rotX([(c - 9.5) * 0.38 + j(0.12), (3 - r) * 0.38 + j(0.12), rnd() * (h < 0.3 ? 0.1 : h * h * 2.2)], -1.0)
  },
  (i) => {
    const rad = Math.pow(rnd(), 0.7) * 3.7, b = ((i % 3) / 3) * TAU + rad * 1.15
    return rotX([Math.cos(b) * rad + j(0.3), j(0.2), Math.sin(b) * rad + j(0.3)], 1.1)
  },
]
function project(p, cx, cy, scale) {
  let q = rotX(rotY(p, -0.45), 0.18)
  const s = 9 / (9 - q[2])
  return [f2(cx + q[0] * scale * s), f2(cy - q[1] * scale * s), s]
}

// Partículas que morfam entre as formas via SMIL (funciona dentro de <img> no GitHub)
function morph({ n, cx, cy, scale, dur = 24, shapes = [0, 1, 2, 3, 4] }) {
  const K = shapes.length
  const pts = shapes.map((k) => Array.from({ length: n }, (_, i) => project(SHAPES[k](i, n), cx, cy, scale)))
  let out = ''
  for (let i = 0; i < n; i++) {
    const d = rnd() * 0.035
    const vals = [], kt = [], ks = []
    for (let k = 0; k < K; k++) {
      const p = pts[k][i]
      const t0 = k / K, hold = t0 + 0.72 / K + d
      vals.push(`${p[0]} ${p[1]}`, `${p[0]} ${p[1]}`)
      kt.push(k === 0 ? 0 : f2(t0 + d * 0.5), f2(Math.min(hold, (k + 1) / K - 0.001)))
      ks.push('0.6 0 0.2 1', '0 0 1 1')
    }
    vals.push(vals[0]); kt.push(1)
    ks.shift(); ks.push('0.6 0 0.2 1')
    // o primeiro keyTime é 0 e o primeiro trecho é a espera
    ks[0] = '0 0 1 1'
    const r = f2((0.55 + rnd() * 1.05) * pts[0][i][2])
    const c = rnd()
    const fill = c < 0.45 ? C.green : c < 0.92 ? C.cyan : '#ffffff'
    out += `<circle r="${r}" fill="${fill}" style="animation:tw ${f2(1.5 + rnd() * 3)}s ${f2(rnd() * 3)}s infinite"><animateTransform attributeName="transform" type="translate" dur="${dur}s" repeatCount="indefinite" calcMode="spline" values="${vals.join(';')}" keyTimes="${kt.join(';')}" keySplines="${ks.slice(0, vals.length - 1).join(';')}"/></circle>`
  }
  return `<g filter="url(#glow)">${out}</g>`
}

/* ───────────── 1. HERO ───────────── */
function typing(x, y, size) {
  const cw = size * 0.6
  const steps = []
  let t = 0
  for (const role of D.ROLES) {
    for (let c = 1; c <= role.length; c++) { steps.push([t, role, c]); t += 0.075 }
    t += 1.8
    for (let c = role.length - 1; c >= 0; c--) { steps.push([t, role, c]); t += 0.035 }
    t += 0.35
  }
  const T = t
  const kt = steps.map((s) => +(s[0] / T).toFixed(4))
  kt[0] = 0
  // remove keyTimes duplicados (arredondamento)
  for (let i = 1; i < kt.length; i++) if (kt[i] <= kt[i - 1]) kt[i] = f2(kt[i - 1] + 0.0001)
  const ktStr = kt.map((v) => v.toFixed(4)).join(';')
  let out = ''
  D.ROLES.forEach((role, ri) => {
    const vals = steps.map((s) => (s[1] === role ? f2(s[2] * cw) : 0)).join(';')
    out += `<clipPath id="cl${ri}"><rect x="${x}" y="${y - size}" height="${size * 1.4}" width="0"><animate attributeName="width" dur="${f2(T)}s" repeatCount="indefinite" calcMode="discrete" values="${vals}" keyTimes="${ktStr}"/></rect></clipPath>`
    out += `<text x="${x}" y="${y}" clip-path="url(#cl${ri})" class="jb b" font-size="${size}" fill="${C.green}" letter-spacing="0">${esc(role)}</text>`
  })
  const cur = steps.map((s) => f2(x + s[2] * cw + 2)).join(';')
  out += `<rect y="${y - size + 3}" width="${f2(size * 0.5)}" height="${size}" fill="${C.green}" style="animation:blink .9s steps(1) infinite" x="${x}"><animate attributeName="x" dur="${f2(T)}s" repeatCount="indefinite" calcMode="discrete" values="${cur}" keyTimes="${ktStr}"/></rect>`
  return out
}

function hero() {
  const H = 400
  const pill = 'Disponível para novos desafios · Goiânia, GO'
  const pw = pill.length * 12 * 0.6 + 50
  const body = `
<rect width="${W}" height="${H}" rx="20" fill="url(#glowbg)"/>
<g>${stars(110, W, H)}</g>
<circle cx="680" cy="190" r="120" fill="${C.green}" opacity=".06" filter="url(#soft)"/>
${morph({ n: 700, cx: 680, cy: 195, scale: 48 })}
<g class="fade" style="animation-delay:.1s">
  <rect x="40" y="40" width="${f2(pw)}" height="30" rx="15" fill="rgba(3,7,10,.7)" stroke="${C.line}"/>
  <circle cx="60" cy="55" r="4" fill="${C.green}"/><circle cx="60" cy="55" r="4" fill="none" stroke="${C.green}" class="ping"/>
  <text x="74" y="59.5" class="jb" font-size="12" fill="${C.text2}">${esc(pill)}</text>
</g>
<g class="fade" style="animation-delay:.3s">
  <text x="36" y="160" class="sg b" font-size="86" fill="${C.text}" letter-spacing="-2">MAURO</text>
</g>
<g class="fade" style="animation-delay:.5s">
  <text x="36" y="238" class="sg b" font-size="86" fill="url(#grad)" letter-spacing="-2">ANDRADE</text>
  <linearGradient id="shine" gradientUnits="userSpaceOnUse" x1="-300" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="0 0;800 0;800 0" keyTimes="0;.35;1" dur="6s" repeatCount="indefinite"/>
  </linearGradient>
  <text x="36" y="238" class="sg b" font-size="86" fill="url(#shine)" letter-spacing="-2">ANDRADE</text>
</g>
<g class="fade" style="animation-delay:.7s">
  <text x="40" y="288" class="jb b" font-size="19" fill="${C.muted}">&gt;</text>
  ${typing(64, 288, 19)}
</g>
<g class="fade" style="animation-delay:.9s">
  <text x="40" y="330" class="sg m" font-size="16" fill="${C.text2}">Transformo dados dispersos em decisões — BI, automação</text>
  <text x="40" y="354" class="sg m" font-size="16" fill="${C.text2}">e IA aplicada a operações comerciais e supply chain.</text>
</g>
<text x="${W - 24}" y="${H - 20}" text-anchor="end" class="jb" font-size="11" fill="${C.muted}">versão 3D interativa → mhaurinho.github.io</text>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="20" fill="none" stroke="${C.line}"/>`
  return svg(H, body, { pad: false, title: 'Mauro Andrade — Business Analyst & Analista de Dados' })
}

/* ───────────── 2. BOTÕES ───────────── */
function button(label, primary) {
  const size = 14
  const w = Math.round(label.length * size * 0.6 + 58)
  const h = 44
  const fg = primary ? '#001a10' : C.text
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<style>${fontsFor('class="jb" font-weight="700"').replace(/@font-face\{font-family:JB;font-weight:400[^}]*\}/, '')}.jb{font-family:JB,Consolas,monospace}@keyframes sh{0%{transform:translateX(-120px)}60%,100%{transform:translateX(${w + 40}px)}}.s{animation:sh 4s ease-in-out infinite}</style>
<defs>${DEFS}<clipPath id="c"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${h / 2 - 1}"/></clipPath></defs>
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${h / 2 - 1}" fill="${primary ? 'url(#grad)' : '#061411'}" stroke="${primary ? 'none' : C.line2}"/>
${primary ? `<g clip-path="url(#c)"><rect class="s" x="0" y="0" width="60" height="${h}" fill="#fff" opacity=".35" transform="skewX(-20)"/></g>` : ''}
<text x="22" y="${h / 2 + 5}" class="jb" font-weight="700" font-size="${size}" fill="${fg}">${esc(label)}</text>
${arrow(w - 30, h / 2 - 5, fg)}
</svg>`
}

/* ───────────── 3. PERFIL ───────────── */
function perfil() {
  const top = 130
  const lw = 540
  const lines = wrap(D.PERFIL.resumo, 16, lw - 56)
  let left = lines.map((l, i) => `<text x="28" y="${44 + i * 26}" class="sg m" font-size="16" fill="${C.text}">${esc(l)}</text>`).join('')
  let y = 44 + lines.length * 26 + 10
  for (const [k, v] of D.PERFIL.itens) {
    left += `<rect x="28" y="${y}" width="${lw - 56}" height="1" fill="${C.line}"/>`
    left += `<text x="28" y="${y + 27}" class="jb" font-size="10.5" letter-spacing="1.5" fill="${C.muted}">${esc(k)}</text>`
    left += `<text x="150" y="${y + 27}" class="sg m" font-size="14" fill="${C.text2}">${esc(v)}</text>`
    y += 42
  }
  const lh = y + 12
  const sw = (W - lw - 20 - 16) / 2
  const sh = (lh - 16) / 2
  let right = ''
  D.PERFIL.stats.forEach(([v, a, b], i) => {
    const x = lw + 20 + (i % 2) * (sw + 16)
    const yy = Math.floor(i / 2) * (sh + 16)
    right += `<g class="fade" style="animation-delay:${0.3 + i * 0.15}s">${glass(x, top + yy, sw, sh)}
<text x="${x + 20}" y="${top + yy + sh - 58}" class="sg b" font-size="40" fill="url(#grad)">${esc(v)}</text>
<text x="${x + 20}" y="${top + yy + sh - 34}" class="sg m" font-size="12.5" fill="${C.text2}">${esc(a)}</text>
<text x="${x + 20}" y="${top + yy + sh - 17}" class="sg m" font-size="12.5" fill="${C.text2}">${esc(b)}</text></g>`
  })
  const H = top + lh
  return svg(H, `${header('01', 'Perfil', 'Dados, negócio e IA na mesma conversa.')}
<g transform="translate(0 ${top})"><g class="fade" style="animation-delay:.15s">${glass(0, 0, lw, lh)}${left}</g></g>${right}`, { title: 'Perfil' })
}

/* ───────────── 4. EXPERIÊNCIA ───────────── */
function experiencia() {
  let y = 134
  let cards = ''
  const x = 44
  const cw = W - x
  D.EXPERIENCIAS.forEach((e, i) => {
    const bl = e.pontos.map((p) => wrap(p, 14, cw - 70))
    const nLines = bl.reduce((a, l) => a + l.length, 0)
    const ch = chips(e.tags, x + 24, 0, cw - 48)
    const h = 92 + nLines * 21 + bl.length * 4 + 14 + ch.bottom + 20
    let b = ''
    let by = y + 92
    bl.forEach((ls) => {
      b += `<path d="M${x + 26} ${by - 9} l6 4 l-6 4z" fill="${C.green}"/>`
      ls.forEach((l) => { b += `<text x="${x + 42}" y="${by}" class="sg m" font-size="14" fill="${C.text2}">${esc(l)}</text>`; by += 21 })
      by += 4
    })
    const chy = by + 4
    cards += `<g class="fade" style="animation-delay:${0.2 + i * 0.18}s">
${glass(x, y, cw, h)}
<circle cx="14" cy="${y + 34}" r="8" fill="${e.atual ? C.green : C.bg}" stroke="${C.green}" stroke-width="2"/><circle cx="14" cy="${y + 34}" r="14" fill="${C.green}" opacity=".15"/>
${e.atual ? `<circle cx="14" cy="${y + 34}" r="8" fill="none" stroke="${C.green}" class="ping"/>` : ''}
<text x="${x + 24}" y="${y + 38}" class="sg b" font-size="19" fill="${C.text}">${esc(e.cargo)}</text>
<text x="${x + 24}" y="${y + 60}" class="sg b" font-size="14" fill="${C.green}">${esc(e.empresa)}</text>
<text x="${x + cw - 24}" y="${y + 37}" text-anchor="end" class="jb" font-size="12" fill="${C.text2}">${esc(e.periodo)}</text>
<text x="${x + cw - 24}" y="${y + 58}" text-anchor="end" class="sg m" font-size="12" fill="${C.muted}">${esc(e.local)}</text>
${b}
${chips(e.tags, x + 24, chy, cw - 48).svg}
</g>`
    y += h + 18
  })
  // anteriores
  const ah = 136
  let a = ''
  D.ANTERIORES.forEach(([emp, desc], i) => {
    const ax = x + 24 + (i % 2) * ((cw - 48) / 2)
    const ay = y + 68 + Math.floor(i / 2) * 40
    a += `<text x="${ax}" y="${ay}" class="sg b" font-size="13.5" fill="${C.text}">${esc(emp)}</text><text x="${ax}" y="${ay + 17}" class="sg m" font-size="12" fill="${C.muted}">${esc(desc)}</text>`
  })
  cards += `<g class="fade" style="animation-delay:${0.2 + D.EXPERIENCIAS.length * 0.18}s">${glass(x, y, cw, ah)}
<circle cx="14" cy="${y + 34}" r="7" fill="${C.bg}" stroke="${C.muted}" stroke-width="2"/>
<text x="${x + 24}" y="${y + 38}" class="sg b" font-size="16" fill="${C.text}">Experiências anteriores</text>${a}</g>`
  y += ah
  const lineH = y - 150
  const css = `.draw{transform-box:fill-box;transform-origin:top;transform:scaleY(0);animation:draw 2.4s .2s cubic-bezier(.6,0,.2,1) forwards}@keyframes draw{to{transform:scaleY(1)}}`
  const body = `${header('02', 'Experiência', 'Trajetória prática — do comércio exterior à IA aplicada.')}
<rect x="11" y="150" width="6" height="${y - 160}" rx="3" fill="${C.green}" opacity=".12"/>
<rect x="13" y="150" width="2" height="${y - 160}" fill="url(#gv)" class="draw"/>
${cards}`
  return svg(y + 4, body, { css, title: 'Experiência profissional' })
}

/* ───────────── 5. STACK ───────────── */
function stack() {
  const top = 130, gap = 16, cw = (W - gap * 2) / 3
  const rows = []
  D.STACK.forEach((s, i) => {
    const ch = chips(s[2], 0, 0, cw - 44)
    ;(rows[Math.floor(i / 3)] ??= []).push(ch.bottom)
  })
  const rh = rows.map((r) => 84 + Math.max(...r) + 22)
  let out = ''
  D.STACK.forEach(([ab, title, items], i) => {
    const x = (i % 3) * (cw + gap)
    const r = Math.floor(i / 3)
    const y = top + rh.slice(0, r).reduce((a, b) => a + b + gap, 0)
    out += `<g class="fade" style="animation-delay:${0.15 + i * 0.1}s">${glass(x, y, cw, rh[r])}
<rect x="${x + 22}" y="${y + 22}" width="36" height="36" rx="10" fill="rgba(0,255,156,0.08)" stroke="${C.line2}"/>
<text x="${x + 40}" y="${y + 45}" text-anchor="middle" class="jb b" font-size="12" fill="${C.green}">${ab}</text>
<text x="${x + 72}" y="${y + 46}" class="sg b" font-size="16" fill="${C.text}">${esc(title)}</text>
${chips(items, x + 22, y + 76, cw - 44).svg}</g>`
  })
  const H = top + rh.reduce((a, b) => a + b, 0) + gap * (rh.length - 1)
  return svg(H, `${header('03', 'Stack', 'Ferramentas para ir do dado bruto à decisão.')}${out}`, { title: 'Stack técnica' })
}

/* ───────────── 6. PROJETOS (um SVG por cartão, cada um é um link) ───────────── */
function projectCard(p, i) {
  const w = 440, h = 216
  const lines = wrap(p.desc, 14, w - 48)
  const desc = lines.slice(0, 3).map((l, k) => `<text x="24" y="${96 + k * 21}" class="sg m" font-size="14" fill="${C.text2}">${esc(l)}</text>`).join('')
  const ch = chips(p.tags, 24, h - 44, w - 48)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(p.titulo)}">
<title>${esc(p.titulo)}</title>
<style>${fontsFor('class="sg b" class="sg m" class="jb"').replace(/@font-face\{font-family:JB;font-weight:700[^}]*\}/, '')}${BASE_CSS}@keyframes sweep{0%{transform:translateX(-200px)}50%,100%{transform:translateX(${w + 200}px)}}.sw{animation:sweep 6s ${f2(i * 0.8)}s ease-in-out infinite}</style>
<defs>${DEFS}<clipPath id="c"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="16"/></clipPath></defs>
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="16" fill="#061411" stroke="${C.line}"/>
<g clip-path="url(#c)"><rect class="sw" x="0" y="0" width="160" height="2" fill="url(#grad)"/>
<circle cx="${w - 40}" cy="30" r="70" fill="${C.green}" opacity=".05" filter="url(#soft)"/></g>
<text x="24" y="36" class="jb" font-size="12" fill="${C.muted}">/${String(i + 1).padStart(2, '0')}</text>
<text x="24" y="68" class="sg b" font-size="22" fill="${C.text}">${esc(p.titulo)}</text>
${arrow(w - 38, 26)}
${desc}
${ch.svg}
</svg>`
}

/* ───────────── 7. CONQUISTAS + FORMAÇÃO ───────────── */
function conquistas() {
  const top = 130, gap = 16, cw = (W - gap * 2) / 3, ch = 112
  let out = ''
  D.CONQUISTAS.forEach(([t, s], i) => {
    const x = (i % 3) * (cw + gap), y = top + Math.floor(i / 3) * (ch + gap)
    const tl = wrap(t, 15, cw - 80, 0.56)
    const sl = wrap(s, 12, cw - 44)
    out += `<g class="fade" style="animation-delay:${0.15 + i * 0.1}s">${glass(x, y, cw, ch)}
<path transform="translate(${x + 22} ${y + 20})" d="M11 0l3.2 7 7.6.8-5.7 5.1 1.6 7.5L11 16.6 4.3 20.4l1.6-7.5L.2 7.8 7.8 7z" fill="url(#grad)" filter="url(#glow)"/>
${tl.map((l, k) => `<text x="${x + 56}" y="${y + 36 + k * 19}" class="sg b" font-size="15" fill="${C.text}">${esc(l)}</text>`).join('')}
${sl.slice(0, 2).map((l, k) => `<text x="${x + 22}" y="${y + ch - 36 + k * 17}" class="sg m" font-size="12" fill="${C.text2}">${esc(l)}</text>`).join('')}</g>`
  })
  // formação
  const fy = top + 2 * (ch + gap) + 40
  const fw = (W - gap * 4) / 5, fh = 150
  let f = `<g class="fade" style="animation-delay:.6s"><text x="0" y="${fy - 12}" class="jb" font-size="12" letter-spacing="2" fill="${C.muted}">FORMAÇÃO ACADÊMICA</text></g>`
  D.FORMACAO.forEach(([s, c, a], i) => {
    const x = i * (fw + gap)
    const cl = wrap(c, 12.5, fw - 32)
    f += `<g class="fade" style="animation-delay:${0.7 + i * 0.1}s">${glass(x, fy, fw, fh)}
<text x="${x + 16}" y="${fy + 38}" class="sg b" font-size="${s.length > 6 ? 17 : 22}" fill="url(#grad)">${esc(s)}</text>
${cl.slice(0, 4).map((l, k) => `<text x="${x + 16}" y="${fy + 64 + k * 17}" class="sg m" font-size="12.5" fill="${C.text2}">${esc(l)}</text>`).join('')}
<text x="${x + 16}" y="${fy + fh - 16}" class="jb" font-size="11" fill="${C.green}">${esc(a)}</text></g>`
  })
  return svg(fy + fh + 4, `${header('05', 'Conquistas & Formação', 'Comunidade, inovação e base acadêmica.')}${out}${f}`, { title: 'Conquistas e formação' })
}

/* ───────────── 8. GITHUB (dados ao vivo) ───────────── */
async function fetchGitHub() {
  const headers = { 'User-Agent': D.USER, ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) }
  const html = await (await fetch(`https://github.com/users/${D.USER}/contributions`, { headers: { 'User-Agent': D.USER } })).text()
  const days = [...html.matchAll(/data-date="([\d-]+)" id="contribution-day-component-(\d+)-(\d+)" data-level="(\d)"/g)]
    .map((m) => ({ date: m[1], row: +m[2], col: +m[3], level: +m[4] }))
  const tips = Object.fromEntries([...html.matchAll(/for="contribution-day-component-(\d+-\d+)"[^>]*>(\d+|No) contribution/g)].map((m) => [m[1], m[2] === 'No' ? 0 : +m[2]]))
  days.forEach((d) => (d.count = tips[`${d.row}-${d.col}`] ?? 0))
  const total = days.reduce((a, d) => a + d.count, 0)
  const repos = (await (await fetch(`https://api.github.com/users/${D.USER}/repos?per_page=100`, { headers })).json()).filter((r) => !r.fork)
  const langs = {}
  for (const r of repos) {
    const l = await (await fetch(r.languages_url, { headers })).json()
    for (const [k, v] of Object.entries(l)) langs[k] = (langs[k] || 0) + v
  }
  const active = new Set(days.filter((d) => d.count > 0).map((d) => d.date)).size
  return { days, total, repos: repos.length, langs, active }
}

function github(g) {
  const top = 130
  const LC = { TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5', HTML: '#e34c26', CSS: '#8a5cf6', Shell: '#89e051' }
  const cols = Math.max(...g.days.map((d) => d.col)) + 1
  const a1 = 14.2, b1 = 1.9, a2 = 6.5, b2 = 7.2, ox = 58, oy = top + 70
  const tile = (d) => {
    const x = ox + d.col * a1 - d.row * a2 + 42
    const y = oy + d.col * b1 + d.row * b2
    const hgt = d.level === 0 ? 2 : 10 + d.level * 14
    const colr = ['#0b2a21', '#0e6b4d', '#00b37a', '#00e08f', C.cyan][d.level]
    const tw = 11, td = 6
    // topo, face frontal e face direita
    const topF = `M${x} ${y - hgt} l${tw} ${b1 * 0.8} l${-td * 0.9} ${td} l${-tw} ${-b1 * 0.8}z`
    const front = `M${x - td * 0.9} ${y - hgt + td} l${tw} ${b1 * 0.8} v${hgt} l${-tw} ${-b1 * 0.8}z`
    const right = `M${x + tw} ${y - hgt + b1 * 0.8} l${-td * 0.9} ${td} v${hgt} l${td * 0.9} ${-td}z`
    return `<g class="bar" style="animation-delay:${f2(0.3 + d.col * 0.025)}s"><path d="${front}" fill="${colr}" opacity=".75"/><path d="${right}" fill="${colr}" opacity=".5"/><path d="${topF}" fill="${colr}"/></g>`
  }
  const sorted = [...g.days].sort((a, b) => a.row - b.row || a.col - b.col)
  const bars = sorted.map(tile).join('')
  const sy = oy + cols * b1 + 7 * b2 + 40
  const totalBytes = Object.values(g.langs).reduce((a, b) => a + b, 0) || 1
  const top5 = Object.entries(g.langs).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const cw = (W - 32) / 3
  let bx = 0
  const barW = cw * 2 + 16 - 48
  let langBar = '', legend = ''
  top5.forEach(([k, v], i) => {
    const w = (v / totalBytes) * barW
    langBar += `<rect x="${f2(24 + cw + 16 + bx)}" y="${sy + 58}" width="${f2(Math.max(w - 2, 1))}" height="10" rx="3" fill="${LC[k] || C.green}"/>`
    legend += `<circle cx="${f2(24 + cw + 16 + (i % 3) * 170 + 5)}" cy="${sy + 90 + Math.floor(i / 3) * 20}" r="5" fill="${LC[k] || C.green}"/><text x="${f2(24 + cw + 16 + (i % 3) * 170 + 16)}" y="${sy + 94 + Math.floor(i / 3) * 20}" class="sg m" font-size="12.5" fill="${C.text2}">${esc(k)} <tspan class="jb" fill="${C.muted}" font-size="11">${((v / totalBytes) * 100).toFixed(1)}%</tspan></text>`
    bx += w
  })
  const date = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const css = `.bar{opacity:0;animation:rise .8s cubic-bezier(.2,.8,.2,1) forwards}@keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}`
  const body = `${header('06', 'GitHub', 'Contribuições do último ano em 3D — atualizado automaticamente todo dia.')}
<g class="fade" style="animation-delay:.1s">${glass(0, top, W, sy - top - 18)}</g>
<text x="24" y="${top + 34}" class="jb" font-size="12" fill="${C.muted}">CONTRIBUTION SKYLINE · @${D.USER}</text>
<text x="${W - 24}" y="${top + 34}" text-anchor="end" class="jb" font-size="12" fill="${C.muted}">atualizado em ${date}</text>
<g filter="url(#glow)">${bars}</g>
<g class="fade" style="animation-delay:.6s">${glass(0, sy, cw, 130)}
<text x="24" y="${sy + 62}" class="sg b" font-size="44" fill="url(#grad)">${g.total}</text>
<text x="24" y="${sy + 88}" class="sg m" font-size="13" fill="${C.text2}">contribuições no último ano</text>
<text x="24" y="${sy + 108}" class="jb" font-size="11" fill="${C.muted}">${g.active} dias ativos · ${g.repos} repositórios</text></g>
<g class="fade" style="animation-delay:.8s">${glass(cw + 16, sy, cw * 2 + 16, 130)}
<text x="${cw + 40}" y="${sy + 36}" class="jb" font-size="12" fill="${C.muted}">LINGUAGENS MAIS USADAS</text>
<rect x="${cw + 40}" y="${sy + 58}" width="${f2(barW)}" height="10" rx="3" fill="#0b2a21"/>${langBar}${legend}</g>`
  return svg(sy + 134, body, { css, title: `GitHub: ${g.total} contribuições no último ano` })
}

/* ───────────── 9. RODAPÉ ───────────── */
function footer() {
  const H = 260
  let gal = ''
  for (let i = 0; i < 520; i++) {
    const rad = Math.pow(rnd(), 0.7) * 120, b = ((i % 3) / 3) * TAU + rad * 0.03
    const x = Math.cos(b) * rad + j(10), y = Math.sin(b) * rad + j(10)
    const c = rnd()
    gal += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(0.5 + rnd() * 1.3)}" fill="${c < 0.5 ? C.green : c < 0.93 ? C.cyan : '#fff'}" opacity="${f2(0.4 + rnd() * 0.6)}"/>`
  }
  const body = `<rect width="${W}" height="${H}" rx="20" fill="url(#glowbg)"/>${stars(60, W, H)}
<g transform="translate(${W / 2} 130) scale(1 .38)"><g filter="url(#glow)">${gal}<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="60s" repeatCount="indefinite"/></g></g>
<circle cx="${W / 2}" cy="130" r="18" fill="#fff" opacity=".5" filter="url(#soft)"/>
<text x="${W / 2}" y="44" text-anchor="middle" class="jb" font-size="13" fill="${C.text2}">"There is a difference between knowing the path and walking the path."</text>
<text x="${W / 2}" y="66" text-anchor="middle" class="jb" font-size="11" fill="${C.muted}">— Morpheus, The Matrix</text>
<text x="${W / 2}" y="${H - 44}" text-anchor="middle" class="sg b" font-size="22" fill="${C.text}">Vamos construir algo <tspan fill="url(#grad)">com dados e IA?</tspan></text>
<text x="${W / 2}" y="${H - 20}" text-anchor="middle" class="jb" font-size="11" fill="${C.muted}">© ${new Date().getFullYear()} Mauro Andrade · SVGs gerados por código · versão 3D em mhaurinho.github.io</text>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="20" fill="none" stroke="${C.line}"/>`
  return svg(H, body, { pad: false, title: 'Vamos construir algo com dados e IA?' })
}

/* ───────────── build ───────────── */
const write = (name, content) => {
  writeFileSync(join(OUT, name), content)
  console.log(`${name.padEnd(26)} ${(content.length / 1024).toFixed(0)} KB`)
}

write('hero.svg', hero())
write('perfil.svg', perfil())
write('experiencia.svg', experiencia())
write('stack.svg', stack())
D.PROJETOS.forEach((p, i) => write(`proj-${p.slug}.svg`, projectCard(p, i)))
write('conquistas.svg', conquistas())
write('head-projetos.svg', svg(108, header('04', 'Projetos', 'Experimentos e entregas com dados, IA e Web3.'), { title: 'Projetos' }))
write('footer.svg', footer())
for (const [n, l, p] of [['site', 'Portfólio 3D', true], ['linkedin', 'LinkedIn', false], ['cv', 'Currículo PT', false], ['cv-en', 'Resume EN', false], ['email', 'E-mail', false], ['projects', 'Quadro de tarefas', false]])
  write(`btn-${n}.svg`, button(l, p))
try {
  write('github.svg', github(await fetchGitHub()))
} catch (e) {
  console.error('GitHub stats falhou (mantendo o arquivo anterior):', e.message)
}
