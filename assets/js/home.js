/* Auto Sport — comportamento da página inicial */
(function () {
  "use strict";
  if (!window.AS) return;

  document.addEventListener("DOMContentLoaded", function () {
    var estoque = AS.estoque();
    var contador = document.getElementById("contador-estoque");
    if (contador) {
      contador.textContent = estoque.length + " veículos disponíveis em Ipatinga/MG, com fotos e ficha técnica.";
    }

    var nEstoque = document.querySelector("[data-hero-estoque]");
    if (nEstoque) nEstoque.textContent = estoque.length;

    var hero = document.querySelector("[data-hero-veiculo]");
    if (hero) {
      var v = AS.porId(hero.getAttribute("data-hero-veiculo")) || AS.destaques()[0] || estoque[0];
      if (!v) {
        hero.style.display = "none";
      } else {
        var hLink = hero.querySelector("[data-hero-link]");
        var hFoto = hero.querySelector("[data-hero-foto]");
        var hTitulo = hero.querySelector("[data-hero-titulo]");
        var hInfo = hero.querySelector("[data-hero-info]");
        var hPreco = hero.querySelector("[data-hero-preco]");
        if (hLink) hLink.setAttribute("href", AS.rota(v));
        if (hFoto) { hFoto.src = v.fotos[0]; hFoto.alt = AS.titulo(v); }
        if (hTitulo) hTitulo.textContent = AS.titulo(v);
        if (hInfo) hInfo.textContent = AS.resumo(v);
        if (hPreco) hPreco.textContent = AS.brl(v.preco);
      }
    }

    var destaques = AS.destaques().slice(0, 3);
    if (destaques.length < 3) {
      var extras = AS.recentes().filter(function (v) { return destaques.indexOf(v) === -1; });
      destaques = destaques.concat(extras).slice(0, 3);
    }

    setTimeout(function () {
      var g1 = document.getElementById("grid-destaques");
      if (g1) { g1.removeAttribute("aria-busy"); AS.renderCards(g1, destaques); }

      var ofertas = AS.ofertas();
      var secaoOfertas = document.getElementById("secao-ofertas");
      var g2 = document.getElementById("grid-ofertas");
      if (g2 && secaoOfertas) {
        if (!ofertas.length) secaoOfertas.style.display = "none";
        else AS.renderCards(g2, ofertas.slice(0, 3));
      }

      var g3 = document.getElementById("grid-recentes");
      if (g3) AS.renderCards(g3, AS.recentes().slice(0, 3));
    }, 350);
  });
})();
