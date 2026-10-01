/* Monta as páginas internas a partir do shell + fragmentos de conteúdo. */
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const SHELL = fs.readFileSync(path.join(RAIZ, "assets", "templates", "shell.html"), "utf8");
const SITE = "https://autosportmultimarcas.com";

const PAGINAS = [
  {
    slug: "ofertas",
    destino: "ofertas/index.html",
    nav: "",
    title: "Ofertas Auto Sport | Condições especiais em Ipatinga/MG",
    desc: "Veículos com condições especiais na Auto Sport Multimarcas: preço anterior, preço atual e economia à mostra. Carros usados e seminovos em Ipatinga/MG.",
    canonical: "/ofertas/",
    scripts: ["listas.js"]
  },
  {
    slug: "venda-seu-carro",
    destino: "venda-seu-carro/index.html",
    nav: "venda",
    title: "Venda seu carro em Ipatinga/MG | Auto Sport Multimarcas",
    desc: "Quer vender seu veículo? Envie os dados e fotos para a Auto Sport Multimarcas e receba uma avaliação pelo WhatsApp.",
    canonical: "/venda-seu-carro/",
    scripts: ["formularios.js"]
  },
  {
    slug: "financiamento",
    destino: "financiamento/index.html",
    nav: "fin",
    title: "Financiamento de veículos em Ipatinga/MG | Auto Sport Multimarcas",
    desc: "Consulte condições de financiamento para o veículo escolhido com a Auto Sport Multimarcas, em Ipatinga - MG.",
    canonical: "/financiamento/",
    scripts: ["formularios.js"]
  },
  {
    slug: "sobre",
    destino: "sobre/index.html",
    nav: "sobre",
    title: "Sobre a Auto Sport Multimarcas | Concessionária em Ipatinga/MG",
    desc: "Conheça a Auto Sport Multimarcas: empresa de veículos automotores desde 2004, com 4,9 estrelas no Google, em Ipatinga - MG.",
    canonical: "/sobre/",
    scripts: []
  },
  {
    slug: "contato",
    destino: "contato/index.html",
    nav: "contato",
    title: "Contato | Auto Sport Multimarcas - Ipatinga/MG",
    desc: "Fale com a Auto Sport Multimarcas por WhatsApp (31) 98863-4747, telefone (31) 3668-5555 ou visite a loja na Rua Artur Azevedo, 55 - Ipatinga/MG.",
    canonical: "/contato/",
    scripts: ["formularios.js"]
  },
  {
    slug: "favoritos",
    destino: "favoritos/index.html",
    nav: "",
    title: "Meus favoritos | Auto Sport Multimarcas",
    desc: "Compare os veículos que você salvou no catálogo da Auto Sport Multimarcas.",
    canonical: "/favoritos/",
    scripts: ["listas.js"]
  },
  {
    slug: "trabalhe-conosco",
    destino: "trabalhe-conosco/index.html",
    nav: "",
    title: "Trabalhe conosco | Auto Sport Multimarcas - Ipatinga/MG",
    desc: "Envie seu currículo para a Auto Sport Multimarcas: vagas de vendas, administrativo, financeiro e estágio nas unidades Ideal e Pick-ups, em Ipatinga/MG.",
    canonical: "/trabalhe-conosco/",
    scripts: ["formularios.js"]
  }
];

const NAVS = {
  estoque: "NAV_ESTOQUE",
  venda: "NAV_VENDA",
  fin: "NAV_FIN",
  sobre: "NAV_SOBRE",
  contato: "NAV_CONTATO"
};

let geradas = 0;

PAGINAS.forEach((p) => {
  const conteudo = fs.readFileSync(path.join(RAIZ, "assets", "templates", "conteudo", p.slug + ".html"), "utf8");

  let html = SHELL;
  Object.keys(NAVS).forEach((chave) => {
    const marcador = "{{" + NAVS[chave] + "}}";
    html = html.split(marcador).join(p.nav === chave ? 'class="ativo"' : "");
  });

  html = html
    .split("{{CONTEUDO}}").join(conteudo)
    .split("{{TITLE}}").join(p.title)
    .split("{{DESC}}").join(p.desc)
    .split("{{CANONICAL}}").join(SITE + p.canonical)
    .split("{{SCRIPTS}}").join(p.scripts.map((s) => '  <script src="../assets/js/' + s + '"></script>').join("\n"));

  const destino = path.join(RAIZ, p.destino);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html, "utf8");
  geradas++;
});

console.log("Páginas internas geradas:", geradas);
