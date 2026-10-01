/* Auto Sport — páginas de lista: ofertas, favoritos e afins */
(function () {
  "use strict";
  if (!window.AS) return;

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-lista]").forEach(function (grid) {
      var tipo = grid.getAttribute("data-lista");
      var lista = [];

      if (tipo === "ofertas") {
        lista = AS.ofertas();
      } else if (tipo === "destaques") {
        lista = AS.destaques().slice(0, 9);
      } else if (tipo === "favoritos") {
        var ids = AS.favoritos();
        lista = ids.map(function (id) { return AS.porId(id); }).filter(function (v) {
          return v && v.status !== "vendido";
        });
        var total = ids.length;
        var removidos = total - lista.length;
        var aviso = document.querySelector("[data-fav-aviso]");
        if (aviso) {
          aviso.style.display = removidos > 0 ? "block" : "none";
        }
        var contador = document.querySelector("[data-fav-total]");
        if (contador) {
          contador.textContent = lista.length === 0
            ? "Nenhum veículo salvo ainda"
            : lista.length + (lista.length === 1 ? " veículo salvo" : " veículos salvos");
        }
      }

      setTimeout(function () {
        grid.removeAttribute("aria-busy");
        if (!lista.length) {
          if (tipo === "favoritos") {
            grid.innerHTML = AS.estadoVazio(
              "Sua lista de favoritos está vazia",
              "Toque no coração de um veículo para salvá-lo aqui e comparar depois.",
              '<a class="btn btn-dark" href="' + AS.pagina("estoque") + '">Explorar estoque</a>'
            );
          } else if (tipo === "ofertas") {
            grid.innerHTML = AS.estadoVazio(
              "Nenhuma oferta ativa no momento",
              "Confira o estoque completo: novas condições especiais são publicadas toda semana.",
              '<a class="btn btn-dark" href="' + AS.pagina("estoque") + '">Ver estoque completo</a>'
            );
          } else {
            grid.innerHTML = AS.estadoVazio(
              "Nenhum veículo por aqui",
              "Em breve novidades no estoque da Auto Sport.",
              '<a class="btn btn-dark" href="' + AS.pagina("estoque") + '">Ver estoque</a>'
            );
          }
          return;
        }
        AS.renderCards(grid, lista);
      }, 400);
    });

    document.addEventListener("favoritos:atualizados", function () {
      var grid = document.querySelector('[data-lista="favoritos"]');
      if (grid) window.location.reload();
    });
  });
})();
