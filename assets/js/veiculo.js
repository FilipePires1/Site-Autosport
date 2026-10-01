/* Auto Sport — comportamento da página do veículo */
(function () {
  "use strict";
  if (!window.AS) return;

  var fotos = [];
  var indice = 0;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  document.addEventListener("DOMContentLoaded", function () {
    var id = document.body.getAttribute("data-veiculo");
    var veiculo = AS.porId(id);
    if (!veiculo) return;
    fotos = (veiculo.fotos || []).slice();
    var total = fotos.length;

    /* ---------- galeria ---------- */
    var principal = $("#foto-principal");
    var contadorFoto = $("#foto-indice");
    var miniaturas = $$(".miniatura");

    function mostrar(i, abrirLightbox) {
      if (!total) return;
      indice = (i + total) % total;
      var base = AS.base;
      if (principal) principal.src = base + fotos[indice];
      if (contadorFoto) contadorFoto.textContent = String(indice + 1);
      miniaturas.forEach(function (m, idx) { m.classList.toggle("ativa", idx === indice); });
      if (abrirLightbox) mostrarLightbox();
      else if (lightbox.classList.contains("aberto")) mostrarLightbox();
    }

    var lightbox = $("#lightbox");
    var lbFoto = $("#lightbox-foto");
    var lbIndice = $("#lb-indice");

    function mostrarLightbox() {
      if (!lbFoto) return;
      lbFoto.src = AS.base + fotos[indice];
      if (lbIndice) lbIndice.textContent = String(indice + 1);
    }
    function abrirLightbox() {
      if (!lightbox) return;
      mostrarLightbox();
      lightbox.classList.add("aberto");
      document.body.style.overflow = "hidden";
    }
    function fecharLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("aberto");
      document.body.style.overflow = "";
    }

    miniaturas.forEach(function (m, idx) {
      m.addEventListener("click", function () { mostrar(idx, false); });
    });

    var ant = $("[data-foto-anterior]");
    var prox = $("[data-foto-proxima]");
    if (ant) ant.addEventListener("click", function () { mostrar(indice - 1, false); });
    if (prox) prox.addEventListener("click", function () { mostrar(indice + 1, false); });

    var ampliar = $("[data-ampliar]");
    var abrirGaleria = $("[data-abrir-galeria]");
    if (ampliar) ampliar.addEventListener("click", abrirLightbox);
    if (abrirGaleria) abrirGaleria.addEventListener("click", abrirLightbox);
    if (principal) principal.addEventListener("click", abrirLightbox);

    var lbFechar = $("[data-lb-fechar]");
    var lbAnt = $("[data-lb-anterior]");
    var lbProx = $("[data-lb-proxima]");
    if (lbFechar) lbFechar.addEventListener("click", fecharLightbox);
    if (lbAnt) lbAnt.addEventListener("click", function () { mostrar(indice - 1, true); });
    if (lbProx) lbProx.addEventListener("click", function () { mostrar(indice + 1, true); });
    if (lightbox) lightbox.addEventListener("click", function (e) { if (e.target === lightbox) fecharLightbox(); });

    document.addEventListener("keydown", function (e) {
      if (!lightbox || !lightbox.classList.contains("aberto")) return;
      if (e.key === "Escape") fecharLightbox();
      if (e.key === "ArrowLeft") mostrar(indice - 1, true);
      if (e.key === "ArrowRight") mostrar(indice + 1, true);
    });

    /* swipe (mobile) */
    var x0 = null;
    var alvoSwipe = principal ? principal.parentNode : null;
    if (alvoSwipe) {
      alvoSwipe.addEventListener("touchstart", function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
      alvoSwipe.addEventListener("touchend", function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 45) mostrar(indice + (dx < 0 ? 1 : -1), false);
        x0 = null;
      }, { passive: true });
    }

    /* ---------- botão favoritar da página ---------- */
    var favPagina = $('[data-fav="' + id + '"]');
    if (favPagina) {
      var rotulo = favPagina.querySelector(".texto-fav");
      var atualizar = function () {
        if (rotulo) rotulo.textContent = AS.ehFavorito(id) ? "Remover dos favoritos" : "Favoritar";
      };
      favPagina.addEventListener("click", function () { setTimeout(atualizar, 0); });
      atualizar();
    }

    /* ---------- veículos semelhantes ---------- */
    var gridSemelhantes = $("#grid-semelhantes");
    if (gridSemelhantes) {
      var pontuar = function (x) {
        var s = 0;
        if (x.marca === veiculo.marca) s += 3;
        if (x.tipo === veiculo.tipo) s += 2;
        if (x.carroceria === veiculo.carroceria) s += 1;
        var dif = Math.abs(x.preco - veiculo.preco) / veiculo.preco;
        if (dif <= 0.15) s += 3; else if (dif <= 0.3) s += 1;
        if (Math.abs(x.ano - veiculo.ano) <= 1) s += 1;
        return s;
      };
      var lista = AS.estoque()
        .filter(function (x) { return x.id !== veiculo.id; })
        .map(function (x) { return { v: x, s: pontuar(x) }; })
        .filter(function (o) { return o.s >= 3; })
        .sort(function (a, b) { return b.s - a.s; })
        .map(function (o) { return o.v; });

      if (lista.length < 4) {
        AS.recentes().forEach(function (x) {
          if (lista.length < 4 && x.id !== veiculo.id && lista.indexOf(x) === -1) lista.push(x);
        });
      }
      setTimeout(function () { AS.renderCards(gridSemelhantes, lista.slice(0, 4)); }, 300);
    }
  });
})();
