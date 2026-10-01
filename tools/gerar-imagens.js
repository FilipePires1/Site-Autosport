/* Gera as imagens SVG do catálogo, logo e imagens de apoio. */
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const DIR_VEIC = path.join(RAIZ, "assets", "img", "veiculos");
const DIR_UI = path.join(RAIZ, "assets", "img", "ui");
const DIR_RAIZ = RAIZ;

fs.mkdirSync(DIR_VEIC, { recursive: true });
fs.mkdirSync(DIR_UI, { recursive: true });

const dadosBrutos = fs.readFileSync(path.join(RAIZ, "assets", "js", "veiculos.js"), "utf8");
const dados = JSON.parse(dadosBrutos.slice(dadosBrutos.indexOf("=") + 1).trim().replace(/;\s*$/, ""));

function esc(t) {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const CARRO_LATERAL =
  "M60 148 L74 116 C78 106 86 100 98 98 L156 92 C176 70 198 60 226 58 L296 58 C326 60 348 72 364 94 L392 106 C406 112 412 122 412 136 L412 152 C412 160 406 166 398 166 L378 166 A34 34 0 0 0 310 166 L168 166 A34 34 0 0 0 100 166 L70 166 C62 166 56 160 56 152 Z";
const RODAS = `
  <g>
    <circle cx="134" cy="166" r="30" fill="#101215"/>
    <circle cx="134" cy="166" r="15" fill="#2A2E33"/>
    <circle cx="134" cy="166" r="6" fill="#4A5057"/>
    <circle cx="344" cy="166" r="30" fill="#101215"/>
    <circle cx="344" cy="166" r="15" fill="#2A2E33"/>
    <circle cx="344" cy="166" r="6" fill="#4A5057"/>
  </g>`;
const VIDROS = `
  <path d="M104 96 L162 90 C180 72 200 64 224 62 L292 62 C316 64 334 74 348 92 L356 100 Z" fill="rgba(255,255,255,0.16)"/>`;

function moldura(inner, legenda, variante) {
  const id = "g" + Math.random().toString(36).slice(2, 8);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800" role="img">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1C1F24"/>
      <stop offset="55%" stop-color="#131519"/>
      <stop offset="100%" stop-color="#0B0C0E"/>
    </linearGradient>
    <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.10)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#${id})"/>
  <ellipse cx="600" cy="640" rx="520" ry="70" fill="rgba(0,0,0,0.55)"/>
  <rect y="620" width="1200" height="1" fill="rgba(255,255,255,0.08)"/>
  <rect x="0" y="0" width="1200" height="220" fill="url(#${id}f)"/>
  <g opacity="0.5">
    <path d="M0 620 L1200 620" stroke="rgba(255,255,255,0.10)" stroke-width="2"/>
    <path d="M0 700 L1200 700" stroke="rgba(255,255,255,0.05)" stroke-width="2"/>
  </g>
  ${inner}
  <g opacity="0.92">
    <rect x="48" y="48" width="216" height="54" rx="27" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)"/>
    <circle cx="78" cy="75" r="7" fill="#E10600"/>
    <text x="98" y="82" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#FFFFFF" letter-spacing="2">AUTO SPORT</text>
  </g>
  <text x="60" y="748" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="rgba(255,255,255,0.92)">${esc(legenda)}</text>
  <text x="60" y="782" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="rgba(255,255,255,0.45)">${esc(variante)}</text>
  <text x="1140" y="782" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="rgba(255,255,255,0.30)">imagem ilustrativa</text>
</svg>`;
}

function cenaExterior(cor, titulo, sub, espelhar) {
  const carro = `
  <g transform="translate(240 380) scale(1.5)${espelhar ? " translate(470 0) scale(-1 1)" : ""}">
    <path d="${CARRO_LATERAL}" fill="${cor}" />
    <path d="${CARRO_LATERAL}" fill="none" stroke="rgba(0,0,0,0.45)" stroke-width="3"/>
    ${VIDROS}
    <path d="M104 128 L412 128" stroke="rgba(0,0,0,0.30)" stroke-width="3"/>
    <path d="M240 100 L240 166" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
    <rect x="384" y="116" width="26" height="14" rx="6" fill="#F5D76E"/>
    <rect x="62" y="120" width="20" height="12" rx="5" fill="#E10600"/>
    ${RODAS}
  </g>`;
  return moldura(carro, titulo, sub);
}

function cenaInterior(titulo, sub) {
  const painel = `
  <g transform="translate(150 300)">
    <path d="M40 240 C40 130 160 60 450 60 C740 60 860 130 860 240 L860 300 L40 300 Z" fill="#22262B" stroke="rgba(255,255,255,0.10)" stroke-width="3"/>
    <rect x="360" y="110" width="260" height="130" rx="12" fill="#0E1013" stroke="rgba(255,255,255,0.14)" stroke-width="3"/>
    <rect x="378" y="128" width="224" height="94" rx="6" fill="#1B2A3A"/>
    <path d="M396 190 L440 158 L476 186 L520 148 L560 184 L594 162" fill="none" stroke="#E10600" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(150 250)">
      <circle r="120" fill="#171A1E" stroke="rgba(255,255,255,0.18)" stroke-width="6"/>
      <circle r="48" fill="#22262B" stroke="rgba(255,255,255,0.14)" stroke-width="5"/>
      <path d="M-110 -22 L-46 -10 M110 -22 L46 -10 M0 48 L0 116" stroke="rgba(255,255,255,0.20)" stroke-width="14" stroke-linecap="round"/>
    </g>
    <g transform="translate(660 250)">
      <circle r="10" fill="#E10600"/>
      <circle r="46" fill="none" stroke="rgba(255,255,255,0.20)" stroke-width="8" stroke-dasharray="200 90" transform="rotate(135)"/>
    </g>
    <rect x="330" y="272" width="120" height="26" rx="13" fill="#0E1013" stroke="rgba(255,255,255,0.16)" stroke-width="3"/>
  </g>`;
  return moldura(painel, titulo, sub);
}

function cenaTraseira(cor, titulo, sub) {
  const traseira = `
  <g transform="translate(270 330)">
    <path d="M30 90 C30 50 70 26 130 24 L540 24 C600 26 640 50 640 90 L640 250 C640 274 622 288 596 288 L74 288 C48 288 30 274 30 250 Z" fill="${cor}" stroke="rgba(0,0,0,0.45)" stroke-width="3"/>
    <rect x="70" y="70" width="500" height="90" rx="14" fill="rgba(0,0,0,0.35)"/>
    <rect x="52" y="182" width="120" height="42" rx="10" fill="#E10600"/>
    <rect x="528" y="182" width="120" height="42" rx="10" fill="#E10600"/>
    <rect x="240" y="228" width="220" height="44" rx="8" fill="#15181C" stroke="rgba(255,255,255,0.25)" stroke-width="3"/>
    <text x="350" y="259" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="rgba(255,255,255,0.85)">AUTO SPORT</text>
    <rect x="150" y="288" width="60" height="34" rx="8" fill="#101215"/>
    <rect x="430" y="288" width="60" height="34" rx="8" fill="#101215"/>
  </g>`;
  return moldura(traseira, titulo, sub);
}

const TOTAL_FOTOS = 4;

dados.veiculos.forEach((v) => {
  const titulo = `${v.marca} ${v.modelo} ${v.versao}`;
  const cenas = [
    () => cenaExterior(v.corRgb, titulo, "Vista frontal", false),
    () => cenaExterior(v.corRgb, titulo, "Vista lateral", true),
    () => cenaInterior(titulo, "Painel e interior"),
    () => cenaTraseira(v.corRgb, titulo, "Vista traseira"),
  ];
  cenas.forEach((fn, i) => {
    const arquivo = path.join(DIR_VEIC, `${v.id}-${i + 1}.svg`);
    fs.writeFileSync(arquivo, fn(), "utf8");
  });
  const total = TOTAL_FOTOS;
  v.fotos = Array.from({ length: total }, (_, i) => `assets/img/veiculos/${v.id}-${i + 1}.svg`);
});

/* Reescreve veiculos.js com as fotos anexadas (mantém formato parseável). */
const cabecalho = "window.AUTOSPORT_DADOS = ";
fs.writeFileSync(
  path.join(RAIZ, "assets", "js", "veiculos.js"),
  cabecalho + JSON.stringify(dados, null, 2) + ";\n",
  "utf8"
);

/* ---------- Logotipo ---------- */
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 340" width="660" height="340" role="img" aria-label="Auto Sport Multimarcas">
  <ellipse cx="330" cy="170" rx="322" ry="162" fill="#0A0B0D"/>
  <ellipse cx="330" cy="170" rx="312" ry="152" fill="none" stroke="#FFFFFF" stroke-width="10"/>
  <text x="330" y="150" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="82" font-weight="900" fill="#FFFFFF" letter-spacing="6">AUTO</text>
  <path d="M150 196 L470 196 L446 236 L126 236 Z" fill="#E10600"/>
  <text x="330" y="304" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#FFFFFF" letter-spacing="9">MULTIMARCAS</text>
  <text x="330" y="240" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="4">SPORT</text>
</svg>`;
fs.writeFileSync(path.join(DIR_UI, "logo.svg"), logo, "utf8");

const logoFundoClaro = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 340" width="660" height="340" role="img" aria-label="Auto Sport Multimarcas">
  <ellipse cx="330" cy="170" rx="322" ry="162" fill="#0A0B0D"/>
  <ellipse cx="330" cy="170" rx="312" ry="152" fill="none" stroke="#FFFFFF" stroke-width="10"/>
  <text x="330" y="150" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="82" font-weight="900" fill="#FFFFFF" letter-spacing="6">AUTO</text>
  <path d="M150 196 L470 196 L446 236 L126 236 Z" fill="#E10600"/>
  <text x="330" y="304" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#FFFFFF" letter-spacing="9">MULTIMARCAS</text>
  <text x="330" y="240" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="4">SPORT</text>
</svg>`;
fs.writeFileSync(path.join(DIR_UI, "logo-assinatura.svg"), logoFundoClaro, "utf8");

/* ---------- Banner da home ---------- */
const hero = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 520" width="1600" height="520" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Showroom Auto Sport">
  <defs>
    <linearGradient id="hb" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#17191D"/>
      <stop offset="50%" stop-color="#101216"/>
      <stop offset="100%" stop-color="#0A0B0D"/>
    </linearGradient>
    <linearGradient id="hr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#E10600" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#E10600" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="520" fill="url(#hb)"/>
  <g opacity="0.35" stroke="rgba(255,255,255,0.16)" fill="none">
    <path d="M0 380 L1600 340"/>
    <path d="M0 440 L1600 420"/>
    <path d="M180 0 L340 520"/>
    <path d="M1420 0 L1260 520"/>
  </g>
  <rect x="0" y="470" width="1600" height="6" fill="url(#hr)"/>
  <g transform="translate(880 210) scale(1.05)" opacity="0.85">
    <path d="M60 148 L74 116 C78 106 86 100 98 98 L156 92 C176 70 198 60 226 58 L296 58 C326 60 348 72 364 94 L392 106 C406 112 412 122 412 136 L412 152 C412 160 406 166 398 166 L378 166 A34 34 0 0 0 310 166 L168 166 A34 34 0 0 0 100 166 L70 166 C62 166 56 160 56 152 Z" fill="#23272D"/>
    <path d="M104 96 L162 90 C180 72 200 64 224 62 L292 62 C316 64 334 74 348 92 L356 100 Z" fill="rgba(255,255,255,0.14)"/>
    <circle cx="134" cy="166" r="30" fill="#0E1013"/><circle cx="134" cy="166" r="14" fill="#2E333A"/>
    <circle cx="344" cy="166" r="30" fill="#0E1013"/><circle cx="344" cy="166" r="14" fill="#2E333A"/>
  </g>
</svg>`;
fs.writeFileSync(path.join(DIR_UI, "hero.svg"), hero, "utf8");

/* ---------- Mapa estilizado da localização ---------- */
const mapa = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520" role="img" aria-label="Localização da Auto Sport em Ipatinga">
  <rect width="800" height="520" fill="#EEF1F4"/>
  <g stroke="#D8DEE4" stroke-width="14" fill="none">
    <path d="M-20 140 L820 110"/>
    <path d="M-20 330 L820 360"/>
    <path d="M150 -20 L190 540"/>
    <path d="M560 -20 L530 540"/>
  </g>
  <g stroke="#E4E9EE" stroke-width="7" fill="none">
    <path d="M-20 230 L820 210"/>
    <path d="M-20 450 L820 470"/>
    <path d="M350 -20 L370 540"/>
    <path d="M700 -20 L680 540"/>
  </g>
  <rect x="60" y="60" width="120" height="60" rx="8" fill="#E1E6EB"/>
  <rect x="620" y="140" width="130" height="70" rx="8" fill="#E1E6EB"/>
  <rect x="90" y="380" width="150" height="80" rx="8" fill="#E1E6EB"/>
  <rect x="600" y="390" width="140" height="70" rx="8" fill="#E1E6EB"/>
  <g transform="translate(400 250)">
    <ellipse cx="0" cy="66" rx="34" ry="12" fill="rgba(0,0,0,0.18)"/>
    <path d="M0 60 C-34 22 -46 4 -46 -16 A46 46 0 0 1 46 -16 C46 4 34 22 0 60 Z" fill="#E10600"/>
    <circle cx="0" cy="-16" r="18" fill="#FFFFFF"/>
    <circle cx="0" cy="-16" r="8" fill="#0A0B0D"/>
  </g>
  <text x="400" y="360" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#15181C">Rua Artur Azevedo, 55 — Ideal</text>
  <text x="400" y="392" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#5B6470">Ipatinga — MG</text>
</svg>`;
fs.writeFileSync(path.join(DIR_UI, "mapa.svg"), mapa, "utf8");

/* ---------- Favicon ---------- */
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" rx="26" fill="#0A0B0D"/>
  <text x="64" y="78" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF">A</text>
  <path d="M30 88 L98 88 L92 100 L24 100 Z" fill="#E10600"/>
</svg>`;
fs.writeFileSync(path.join(DIR_UI, "favicon.svg"), favicon, "utf8");

console.log("Imagens geradas:", dados.veiculos.length, "veículos Ø", TOTAL_FOTOS, "fotos");
