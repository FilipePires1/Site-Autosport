/* =========================================================
   Auto Sport Multimarcas — núcleo de interface
   Compartilhado por todas as páginas do catálogo.
   ========================================================= */
(function () {
  "use strict";

  var DADOS = window.AUTOSPORT_DADOS || { veiculos: [], loja: {} };
  var LOJA = DADOS.loja || {};
  var CHAVE_FAV = "autosport:favoritos";

  var AS = {
    dados: DADOS,
    loja: LOJA,
    veiculos: DADOS.veiculos || [],

    get base() {
      return document.body.getAttribute("data-base") || "";
    },

    /* ---------- formatação ---------- */
    brl: function (v) {
      return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
    },
    numero: function (v) {
      return (v || 0).toLocaleString("pt-BR");
    },
    kmFmt: function (v) {
      return AS.numero(v) + " km";
    },
    titulo: function (v) {
      return v.marca + " " + v.modelo + " " + v.versao;
    },
    resumo: function (v) {
      return v.ano + "/" + v.anoModelo + " · " + AS.kmFmt(v.km) + " · " + v.cambio;
    },
    alt: function (v) {
      return AS.titulo(v) + " " + v.anoModelo + " na Auto Sport Multimarcas";
    },

    /* ---------- navegação ---------- */
    rota: function (v) {
      return AS.base + "estoque/" + (typeof v === "string" ? v : v.id) + "/";
    },
    pagina: function (nome) {
      var alvo = nome.replace(/^\/+|\/+$/g, "");
      return AS.base + (alvo ? alvo + "/" : "");
    },

    /* ---------- WhatsApp ---------- */
    zapLink: function (mensagem) {
      return "https://wa.me/" + (LOJA.whatsapp || "5531988634747") + "?text=" + encodeURIComponent(mensagem);
    },
    msgCard: function (v) {
      return "Olá! Tenho interesse no " + AS.titulo(v) + " " + v.anoModelo +
        " anunciado no site da Auto Sport e gostaria de mais informações.";
    },
    msgPagina: function (v) {
      return "Olá! Vi o " + AS.titulo(v) + " no site da Auto Sport e gostaria de mais informações.";
    },
    zapVeiculo: function (v) {
      return AS.zapLink(AS.msgPagina(v));
    },
    zapGeral: function (assunto) {
      var msg = "Olá! Vim pelo site da Auto Sport Multimarcas" + (assunto ? " e gostaria de " + assunto : ". Podem me ajudar?");
      return AS.zapLink(msg);
    },

    /* ---------- estoque ---------- */
    estoque: function () {
      return AS.veiculos.filter(function (v) { return v.status !== "vendido"; });
    },
    porId: function (id) {
      return AS.veiculos.filter(function (v) { return v.id === id; })[0] || null;
    },
    ofertas: function () {
      return AS.estoque().filter(function (v) { return v.precoAnterior && v.precoAnterior > v.preco; });
    },
    destaques: function () {
      return AS.estoque().filter(function (v) { return (v.selos || []).indexOf("destaque") > -1; });
    },
    recentes: function () {
      return AS.estoque().slice().sort(function (a, b) {
        return (b.publicadoEm || "").localeCompare(a.publicadoEm || "");
      });
    },
    maisBaratos: function () {
      return AS.estoque().slice().sort(function (a, b) { return a.preco - b.preco; });
    },

    /* ---------- favoritos ---------- */
    favoritos: function () {
      try { return JSON.parse(localStorage.getItem(CHAVE_FAV) || "[]"); } catch (e) { return []; }
    },
    salvarFavoritos: function (lista) {
      try { localStorage.setItem(CHAVE_FAV, JSON.stringify(lista)); } catch (e) { /* modo privado */ }
      AS.atualizarContadores();
      document.dispatchEvent(new CustomEvent("favoritos:atualizados"));
    },
    ehFavorito: function (id) {
      return AS.favoritos().indexOf(id) > -1;
    },
    alternarFavorito: function (id) {
      var lista = AS.favoritos();
      var i = lista.indexOf(id);
      var adicionou;
      if (i > -1) { lista.splice(i, 1); adicionou = false; } else { lista.push(id); adicionou = true; }
      AS.salvarFavoritos(lista);
      AS.sincronizarBotao(id);
      AS.toast(adicionou ? "Veículo adicionado aos favoritos" : "Veículo removido dos favoritos");
      return adicionou;
    },
    sincronizarBotao: function (id) {
      var ativo = AS.ehFavorito(id);
      document.querySelectorAll('[data-fav="' + id + '"]').forEach(function (btn) {
        btn.setAttribute("aria-pressed", ativo ? "true" : "false");
        btn.setAttribute("title", ativo ? "Remover dos favoritos" : "Favoritar");
        var rotulo = btn.querySelector(".sr-only");
        if (rotulo) rotulo.textContent = ativo ? "Remover dos favoritos" : "Favoritar";
      });
    },
    sincronizarTodos: function () {
      document.querySelectorAll("[data-fav]").forEach(function (btn) {
        AS.sincronizarBotao(btn.getAttribute("data-fav"));
      });
      AS.atualizarContadores();
    },
    atualizarContadores: function () {
      var qtd = AS.favoritos().length;
      document.querySelectorAll("[data-contador-fav]").forEach(function (el) {
        el.textContent = qtd;
        el.style.display = qtd > 0 ? "inline-flex" : "none";
      });
    },

    /* ---------- ícones ---------- */
    iconeCoracao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.6c0 4.3-8.8 9.6-8.8 9.6S3.2 12.9 3.2 8.6a4.4 4.4 0 0 1 8.8-.9 4.4 4.4 0 0 1 8.8.9z" stroke-linejoin="round"/></svg>',
    iconeWhats: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.53 3.75 1.45 5.31L2 22.5l5.5-1.6a9.8 9.8 0 0 0 4.54 1.12h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2zm0 17.96a8 8 0 0 1-4.2-1.2l-.3-.18-3.1.9.92-3.02-.2-.31a8.1 8.1 0 0 1-1.25-4.3c0-4.5 3.67-8.16 8.18-8.16 4.5 0 8.16 3.66 8.16 8.16s-3.66 8.01-8.21 8.01zm4.5-5.94c-.25-.13-1.46-.72-1.68-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.04-.38-1.97-1.22-.73-.65-1.21-1.46-1.36-1.7-.14-.25-.01-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.73 2.63 4.18 3.69.58.25 1.04.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29z"/></svg>',
    iconeLupa: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5" stroke-linecap="round"/></svg>',
    iconeEstrela: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z"/></svg>',

    /* ---------- cards ---------- */
    selosHTML: function (v) {
      var html = "";
      (v.selos || []).forEach(function (s) {
        var rotulo = { oferta: "Oferta", destaque: "Destaque", novo: "Novo no estoque" }[s] || s;
        html += '<span class="selo selo-' + s + '">' + rotulo + "</span>";
      });
      if (v.status === "reservado") html += '<span class="selo selo-reservado">Reservado</span>';
      if (v.status === "vendido") html += '<span class="selo selo-vendido">Vendido</span>';
      return html;
    },

    cardHTML: function (v) {
      var base = AS.base;
      var foto = base + (v.fotos && v.fotos[0] ? v.fotos[0] : "");
      var rota = AS.rota(v);
      var precoAntigo = v.precoAnterior && v.precoAnterior > v.preco
        ? '<span class="antigo">' + AS.brl(v.precoAnterior) + "</span>" : "";
      var economia = v.precoAnterior && v.precoAnterior > v.preco
        ? '<span class="economia">Economize ' + AS.brl(v.precoAnterior - v.preco) + "</span>" : "";

      return '' +
        '<article class="card" data-id="' + v.id + '" data-status="' + v.status + '">' +
          '<div class="card-media">' +
            '<a href="' + rota + '" tabindex="-1" aria-hidden="true">' +
              '<img src="' + foto + '" alt="' + AS.alt(v) + '" loading="lazy" width="1200" height="800">' +
            "</a>" +
            (v.status !== "disponivel"
              ? '<div class="card-veiculo-sobreposicao ' + (v.status === "vendido" ? "vendido" : "") + '"><span>' +
                (v.status === "reservado" ? "Reservado" : "Vendido") + "</span></div>"
              : "") +
            '<div class="selos">' + AS.selosHTML(v) + "</div>" +
            '<button class="btn-fav" data-fav="' + v.id + '" aria-pressed="false" type="button">' +
              AS.iconeCoracao + '<span class="sr-only">Favoritar</span>' +
            "</button>" +
            '<span class="card-km-chip">' + AS.kmFmt(v.km) + "</span>" +
          "</div>" +
          '<div class="card-body">' +
            '<h3 class="card-titulo"><a href="' + rota + '">' + AS.titulo(v) + "</a></h3>" +
            '<p class="card-info">' + AS.resumo(v) + "</p>" +
            '<p class="card-tags"><span>' + v.combustivel + "</span><span>" + v.carroceria + "</span><span>" + v.cor + "</span></p>" +
            '<div class="card-preco">' +
              precoAntigo +
              '<span class="valor">' + AS.brl(v.preco) + "</span>" +
              economia +
            "</div>" +
            '<div class="card-acoes">' +
              '<a class="btn btn-outline" href="' + rota + '">Ver detalhes</a>' +
              (v.status === "vendido"
                ? '<a class="btn btn-dark" href="' + AS.zapGeral("ver veículos semelhantes") + '" target="_blank" rel="noopener">Consultar similar</a>'
                : '<a class="btn btn-whats" href="' + AS.zapVeiculo(v) + '" target="_blank" rel="noopener">Tenho interesse</a>') +
            "</div>" +
          "</div>" +
        "</article>";
    },

    skeletons: function (qtd) {
      var html = "";
      for (var i = 0; i < (qtd || 6); i++) {
        html += '<div class="skeleton" aria-hidden="true">' +
          '<div class="sk-img"></div>' +
          '<div class="sk-linha medio"></div>' +
          '<div class="sk-linha curta"></div>' +
          '<div class="sk-preco"></div>' +
          "</div>";
      }
      return html;
    },

    renderCards: function (alvo, lista) {
      var el = typeof alvo === "string" ? document.querySelector(alvo) : alvo;
      if (!el) return;
      if (!lista.length) { el.innerHTML = ""; return; }
      el.innerHTML = lista.map(AS.cardHTML).join("");
      AS.sincronizarTodos();
    },

    estadoVazio: function (titulo, texto, acaoHtml) {
      return '<div class="estado">' +
        '<div class="icone"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6" stroke-linecap="round"/></svg></div>' +
        "<h3>" + titulo + "</h3><p>" + texto + "</p>" + (acaoHtml || "") +
        "</div>";
    },

    /* ---------- toast ---------- */
    toast: function (mensagem) {
      var el = document.querySelector(".toast");
      if (!el) {
        el = document.createElement("div");
        el.className = "toast";
        el.setAttribute("role", "status");
        document.body.appendChild(el);
      }
      el.textContent = mensagem;
      el.classList.add("visivel");
      clearTimeout(AS._toastTimer);
      AS._toastTimer = setTimeout(function () { el.classList.remove("visivel"); }, 2600);
    },

    /* ---------- menu mobile ---------- */
    menuMobile: function () {
      var abrir = document.querySelector("[data-menu-abrir]");
      var fechar = document.querySelector("[data-menu-fechar]");
      var fundo = document.querySelector("[data-menu]");
      if (!abrir || !fundo) return;
      function abrirMenu() {
        fundo.classList.add("aberto");
        abrir.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
      }
      function fecharMenu() {
        fundo.classList.remove("aberto");
        abrir.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
      abrir.addEventListener("click", abrirMenu);
      if (fechar) fechar.addEventListener("click", fecharMenu);
      fundo.addEventListener("click", function (e) { if (e.target === fundo) fecharMenu(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") fecharMenu(); });
    },

    /* ---------- compartilhar ---------- */
    compartilhar: function (titulo, url) {
      var dados = { title: titulo, text: titulo + " – Auto Sport Multimarcas", url: url };
      if (navigator.share) {
        navigator.share(dados).catch(function () { });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          AS.toast("Link copiado para compartilhar");
        }).catch(function () {
          AS.toast(url);
        });
      } else {
        AS.toast(url);
      }
    }
  };

  window.AS = AS;

  document.addEventListener("DOMContentLoaded", function () {
    AS.menuMobile();
    AS.sincronizarTodos();

    document.addEventListener("click", function (e) {
      var fav = e.target.closest ? e.target.closest("[data-fav]") : null;
      if (fav) {
        e.preventDefault();
        AS.alternarFavorito(fav.getAttribute("data-fav"));
        return;
      }
      var compart = e.target.closest ? e.target.closest("[data-compartilhar]") : null;
      if (compart) {
        e.preventDefault();
        AS.compartilhar(compart.getAttribute("data-compartilhar"), window.location.href);
      }
    });

    var ano = document.querySelectorAll("[data-ano-atual]");
    ano.forEach(function (el) { el.textContent = new Date().getFullYear(); });

    var buscaTopo = document.querySelector("[data-busca-rapida]");
    if (buscaTopo) {
      buscaTopo.addEventListener("submit", function (e) {
        e.preventDefault();
        var termo = buscaTopo.querySelector("input").value.trim();
        window.location.href = AS.pagina("estoque") + (termo ? "?q=" + encodeURIComponent(termo) : "");
      });
    }
  });
})();
