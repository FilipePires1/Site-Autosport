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

    var destaques = AS.destaques().slice(0, 6);
    if (destaques.length < 6) {
      var extras = AS.recentes().filter(function (v) { return destaques.indexOf(v) === -1; });
      destaques = destaques.concat(extras).slice(0, 6);
    }

    setTimeout(function () {
      var g1 = document.getElementById("grid-destaques");
      if (g1) { g1.removeAttribute("aria-busy"); AS.renderCards(g1, destaques); }

      var ofertas = AS.ofertas();
      var secaoOfertas = document.getElementById("secao-ofertas");
      var g2 = document.getElementById("grid-ofertas");
      if (g2 && secaoOfertas) {
        if (!ofertas.length) secaoOfertas.style.display = "none";
        else AS.renderCards(g2, ofertas.slice(0, 6));
      }

      var g3 = document.getElementById("grid-recentes");
      if (g3) AS.renderCards(g3, AS.recentes().slice(0, 6));
    }, 350);
  });
})();
