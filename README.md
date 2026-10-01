# Auto Sport Multimarcas — site demo

Site demonstrativo estático (HTML/CSS/JS puro, sem dependências) para a
Auto Sport Multimarcas — Ipatinga/MG. Experiência de marketplace automotivo
com catálogo, filtros, páginas de veículo, favoritos, formulários e WhatsApp.

## Como rodar

```powershell
node tools\servidor.js
```

Abra <http://localhost:8080>. É só isso: não há build nem `npm install`.

## Estrutura

```
/                          páginas = URLs amigáveis
├── index.html             home
├── estoque/               catálogo (índice + 20 páginas de veículo)
│   └── <slug>/index.html  uma pasta por anúncio (SEO-friendly)
├── ofertas/               pechinhas
├── venda-seu-carro/       formulário de avaliação
├── financiamento/         simulador de crédito
├── sobre/                 a loja, equipe e avaliações
├── contato/               endereço, mapa e WhatsApp
├── favoritos/             lista salva no navegador
├── assets/
│   ├── css/main.css       todo o design (variáveis + componentes)
│   ├── js/
│   │   ├── veiculos.js    base de dados (window.AUTOSPORT_DADOS)
│   │   ├── ui.js          cards, favoritos, menu, toast, compartilhar
│   │   ├── catalogo.js    filtros, busca, ordenação, URL params
│   │   ├── home.js        destaques da home
│   │   ├── veiculo.js     galeria, lightbox, veículos semelhantes
│   │   ├── listas.js      ofertas e favoritos
│   │   ├── formularios.js validação, máscaras, dropzone, leads
│   │   └── opcionais.js   ícones dos opcionais
│   ├── img/               logo, hero, mapa e fotos SVG dos veículos
│   └── templates/         fontes dos HTMLs gerados
└── tools/                 scripts de geração (Node, só pro dev)
    ├── servidor.js        servidor local com rotas amigáveis
    ├── gerar-imagens.js   regenera as fotos SVG e as fotos em veiculos.js
    ├── gerar-paginas.js   regenera estoque/<slug>/ (20 páginas)
    └── gerar-site.js      regenera as páginas a partir de shell + conteúdo
```

## Fluxo de geração (após editar templates ou dados)

```powershell
node tools\gerar-imagens.js   # fotos dos veículos
node tools\gerar-paginas.js   # páginas de veículo (use --check p/ só comparar)
node tools\gerar-site.js      # páginas institucionais (shell + conteúdo)
```

`index.html` e `estoque/index.html` são editados direto nos arquivos.

## Como editar os veículos

Todos os dados estão em `assets/js/veiculos.js` (array de objetos com
título, marca, preço, quilometragem, opcionais, status etc.).
Para adicionar um veículo novo:

1. Inclua o objeto no array.
2. Rode `node tools\gerar-imagens.js` (cria as fotos SVG) — ou coloque fotos
   reais em `assets/img/veiculos/<slug>-1..4.jpg` e ajuste o campo `fotos`.
3. Rode `node tools\gerar-paginas.js` para criar a página do anúncio.

Status suportados: `disponivel`, `reservado`, `vendido` (mostram aviso no card).

## Fotos reais

As fotos atuais são ilustrações SVG geradas. Para trocar por fotos reais,
basta substituir os arquivos em `assets/img/veiculos/` mantendo os nomes
(`<slug>-1.jpg` … `<slug>-4.jpg`) — os cards, a galeria e a página do
veículo já usam esses caminhos.

## Observações

- Foto do hero: Mercedes-Benz SLS AMG Roadster, por Stefan Krause —
  Wikimedia Commons (Free Art License), arquivo `assets/img/ui/hero-mercedes.jpg`.
- Favoritos e leads de demonstração ficam no `localStorage`
  (chaves `autosport:favoritos` e `autosport:leads`).
- Todo CTA de WhatsApp leva ao número da loja já com a mensagem do veículo.
- Responsivo (mobile-first): filtros em bottom sheet e barra fixa de CTA
  no celular.
