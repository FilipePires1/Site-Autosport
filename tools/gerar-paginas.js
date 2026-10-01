/* Monta as páginas de veículo (estoque/<id>/index.html) a partir do template.
   Uso: node tools/gerar-paginas.js [--check]  (só compara, não escreve) */
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const SITE = "https://autosportmultimarcas.com";
const OPCIONAIS = require(path.join(RAIZ, "assets", "js", "opcionais.js"));
const TEMPLATE = fs.readFileSync(path.join(RAIZ, "assets", "templates", "veiculo.html"), "utf8");

const sandbox = { window: {} };
new Function("window", fs.readFileSync(path.join(RAIZ, "assets", "js", "veiculos.js"), "utf8"))(sandbox.window);
const DADOS = sandbox.window.AUTOSPORT_DADOS;
const LOJA = DADOS.loja;

const checar = process.argv.indexOf("--check") >= 0;

/* ---------- formatação (espelha assets/js/ui.js) ---------- */
const brl = (v) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const numero = (v) => (v || 0).toLocaleString("pt-BR");
const kmFmt = (v) => numero(v) + " km";
const titulo = (v) => v.marca + " " + v.modelo + " " + v.versao;
const zap = (msg) => "https://wa.me/" + LOJA.whatsapp + "?text=" + encodeURIComponent(msg);

/* ---------- blocos ---------- */
const ROTULOS_SELO = { oferta: "Oferta", destaque: "Destaque", novo: "Novo no estoque" };

function selosHTML(v) {
  let html = "";
  (v.selos || []).forEach((s) => {
    html += '<span class="selo selo-' + s + '">' + (ROTULOS_SELO[s] || s) + "</span>";
  });
  if (v.status === "reservado") html += '<span class="selo selo-reservado">Reservado</span>';
  else if (v.status === "vendido") html += '<span class="selo selo-vendido">Vendido</span>';
  if (!html) html = '<span class="selo selo-destaque">Disponível</span>';
  return html;
}

const AVISOS = {
  reservado: '<div class="container"><div class="aviso-status reservado"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2" stroke-linecap="round"/></svg><span><strong>Veículo reservado.</strong> Fale com um consultor para conferir a disponibilidade ou unidades semelhantes.</span></div></div>',
  vendido: '<div class="container"><div class="aviso-status vendido"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke-linecap="round"/></svg><span><strong>Veículo vendido.</strong> Consulte opções semelhantes no nosso estoque.</span></div></div>'
};

const CHIP_ICONES = {
  ano: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18" stroke-linecap="round"/>',
  km: '<path d="M4 17.5a9 9 0 1 1 16 0" stroke-linecap="round"/><path d="M12 17.5l4.4-5" stroke-linecap="round"/>',
  cambio: '<path d="M7 4v10M17 4v10M7 8h10M7 14l4 6M17 14l-4 6" stroke-linecap="round"/>',
  combustivel: '<path d="M4 20V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15M3 20h12M14 9h3a2 2 0 0 1 2 2v5a2 2 0 0 0 4 0V9l-3-3" stroke-linecap="round" stroke-linejoin="round"/>'
};

function chip(rotulo, icone) {
  return '<span class="chip-spec"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    icone + "</svg>" + rotulo + "</span>";
}

function chipsHTML(v) {
  return [
    chip(v.ano + "/" + v.anoModelo, CHIP_ICONES.ano),
    chip(kmFmt(v.km), CHIP_ICONES.km),
    chip(v.cambio, CHIP_ICONES.cambio),
    chip(v.combustivel, CHIP_ICONES.combustivel)
  ].join("");
}

function fichaHTML(v) {
  const itens = [
    ["Marca", v.marca],
    ["Modelo", v.modelo],
    ["Versão", v.versao],
    ["Ano", v.ano + "/" + v.anoModelo],
    ["Quilometragem", kmFmt(v.km)],
    ["Câmbio", v.cambio],
    ["Combustível", v.combustivel],
    ["Cor", v.cor],
    ["Carroceria", v.carroceria]
  ];
  return itens
    .map(([rot, val]) => '<div class="ficha-item"><dt>' + rot + "</dt><dd>" + val + "</dd></div>")
    .join("");
}

function opcionaisHTML(v) {
  const itens = (v.opcionais || [])
    .map((chave) => {
      const o = OPCIONAIS[chave];
      if (!o) throw new Error("opcional desconhecido: " + chave + " (" + v.id + ")");
      return '<div class="opcional"><span class="icone"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
        o.svg + "</svg></span>" + o.rotulo + "</div>";
    })
    .join("");
  return '<div class="opcionais-grid">' + itens + "</div>";
}

function miniaturasHTML(v, base, tituloV) {
  return v.fotos
    .map((foto, i) => {
      const n = i + 1;
      return '<button class="miniatura' + (i === 0 ? " ativa" : "") + '" type="button" data-foto="' + i +
        '" role="listitem" aria-label="Foto ' + n + " de " + v.fotos.length + '"><img src="' + base + foto +
        '" alt="Foto ' + n + " - " + tituloV + '" loading="lazy"></button>';
    })
    .join("");
}

const DISPONIBILIDADE = {
  disponivel: "https://schema.org/InStock",
  reservado: "https://schema.org/PreOrder",
  vendido: "https://schema.org/OutOfStock"
};

function jsonLD(v, url) {
  const obj = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: titulo(v),
    brand: { "@type": "Brand", name: v.marca },
    model: v.modelo,
    vehicleModelDate: String(v.ano),
    vehicleTransmission: v.cambio,
    fuelType: v.combustivel,
    color: v.cor,
    bodyType: v.carroceria,
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.km, unitCode: "KMT" },
    image: v.fotos.map((f) => SITE + "/" + f),
    description: v.descricao,
    url: url,
    offers: {
      "@type": "Offer",
      price: v.preco,
      priceCurrency: "BRL",
      availability: DISPONIBILIDADE[v.status] || DISPONIBILIDADE.disponivel,
      url: url,
      seller: {
        "@type": "AutoDealer",
        name: LOJA.nome,
        telephone: LOJA.telefone,
        address: {
          "@type": "PostalAddress",
          streetAddress: LOJA.endereco,
          addressLocality: "Ipatinga",
          addressRegion: "MG",
          postalCode: LOJA.cep,
          addressCountry: "BR"
        }
      }
    }
  };
  return '<script type="application/ld+json">' + JSON.stringify(obj) + "</script>";
}

function substituir(html, mapa) {
  Object.keys(mapa).forEach((chave) => {
    html = html.split("{{" + chave + "}}").join(mapa[chave]);
  });
  return html;
}

function montar(v) {
  const base = "../../";
  const url = SITE + "/estoque/" + v.id + "/";
  const tituloV = titulo(v);
  const anoModelo = v.anoModelo;
  const emOferta = !!v.precoAnterior && v.precoAnterior > v.preco;
  const [ano, mes, dia] = (v.publicadoEm || "").split("-");

  const mapa = {
    TITLE: tituloV + " " + anoModelo + " | Auto Sport Multimarcas - Ipatinga/MG",
    DESC: tituloV + ", " + v.ano + "/" + anoModelo + ", " + kmFmt(v.km) + ", " + v.cambio + ", " + v.combustivel +
      ". Veículo disponível na Auto Sport Multimarcas em Ipatinga/MG.",
    KEYWORDS: v.marca + " " + v.modelo + " usado Ipatinga, " + v.modelo + " seminovo Vale do Aço, " +
      v.marca + " à venda Ipatinga, carros usados Ipatinga",
    CANONICAL: url,
    OGIMAGE: SITE + "/" + (v.fotos && v.fotos[0] ? v.fotos[0] : "assets/img/ui/logo.png"),
    JSONLD: jsonLD(v, url),
    BASE: base,
    ID: v.id,
    ZAP_HEADER: zap("Olá! Vim pelo site da Auto Sport Multimarcas e gostaria de ajuda."),
    MARCASLUG: encodeURIComponent(v.marca),
    MARCA: v.marca,
    MODELO: v.modelo,
    SITUACAO: AVISOS[v.status] || "",
    FOTO_PRINCIPAL: base + v.fotos[0],
    ALT: tituloV + " " + anoModelo + " - Auto Sport Multimarcas",
    TOTAL_FOTOS: String(v.fotos.length),
    MINIATURAS: miniaturasHTML(v, base, tituloV),
    SELOS: selosHTML(v),
    H1: tituloV,
    VERSAO_SUB: v.carroceria + " · " + v.cor + " · " + v.tipo + " · Ipatinga/MG",
    CHIPS: chipsHTML(v),
    ANTIGO: emOferta ? '<span class="antigo">' + brl(v.precoAnterior) + "</span>" : "",
    PRECO: brl(v.preco),
    ECONOMIA: emOferta ? '<span class="economia">Economize ' + brl(v.precoAnterior - v.preco) + "</span>" : "",
    ZAP_INTERESSE: zap("Olá! Vi o " + tituloV + " no site da Auto Sport e gostaria de mais informações."),
    ZAP_VENDEDOR: zap("Olá! Quero falar com um vendedor sobre o " + tituloV + " " + anoModelo + " anunciado no site da Auto Sport."),
    DATA_PUBLICACAO: dia + "/" + mes + "/" + ano,
    FICHA: fichaHTML(v),
    OPCIONAIS: opcionaisHTML(v),
    DESCRICAO: v.descricao
  };

  const html = substituir(TEMPLATE, mapa);
  const pendentes = html.match(/\{\{[A-Z_]+\}\}/g);
  if (pendentes) throw new Error(v.id + " tem placeholders sem preencher: " + pendentes.join(","));
  return html;
}

/* ---------- execução ---------- */
let escritas = 0;
const divergencias = [];

DADOS.veiculos.forEach((v) => {
  const destino = path.join(RAIZ, "estoque", v.id, "index.html");
  const html = montar(v);

  if (checar) {
    const atual = fs.existsSync(destino) ? fs.readFileSync(destino, "utf8") : "";
    if (atual !== html) {
      // as 2 linhas novas do rodapé (Pick-ups / Trabalhe conosco) são esperadas
      const NOVAS = [
        '          <li><a href="../../#pickups">Auto Sport Pick-ups</a></li>',
        '          <li><a href="../../trabalhe-conosco/">Trabalhe conosco</a></li>'
      ];
      const semNovas = (txt) => NOVAS.reduce((t, l) => t.split(l + "\n").join(""), txt);
      if (semNovas(atual) !== semNovas(html)) {
        const a = semNovas(atual).split("\n");
        const b = semNovas(html).split("\n");
        const difs = [];
        const max = Math.max(a.length, b.length);
        for (let i = 0; i < max; i++) {
          if (a[i] !== b[i]) difs.push("linha " + (i + 1) + ":\n  atual: " + JSON.stringify(a[i]) + "\n  novo : " + JSON.stringify(b[i]));
        }
        divergencias.push(v.id + " (" + difs.length + " linhas reais)\n" + difs.slice(0, 6).join("\n"));
      }
    }
    return;
  }

  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html, "utf8");
  escritas++;
});

if (checar) {
  if (divergencias.length) {
    console.log("PÁGINAS DIVERGENTES: " + divergencias.length);
    console.log(divergencias.join("\n\n"));
    process.exitCode = 1;
  } else {
    console.log("Todas as páginas de veículo batem com o template.");
  }
} else {
  console.log("Páginas de veículo geradas:", escritas);
}
