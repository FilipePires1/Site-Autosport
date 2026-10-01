/* =========================================================
   Auto Sport — página de estoque: filtros, busca e ordenação
   ========================================================= */
(function () {
  "use strict";
  if (!window.AS) return;

  var CFG = {
    tipos: ["Carros", "SUVs", "Pickups", "Sedans", "Hatchbacks", "Utilitários"],
    agrupamento: { Carros: ["Sedans", "Hatchbacks"] },
    cambios: ["Automático", "Manual", "Automatizado", "CVT"],
    combustiveis: ["Flex", "Gasolina", "Diesel", "Híbrido", "Elétrico"],
    carrocerias: ["Hatch", "Sedan", "SUV", "Pickup", "Minivan", "Utilitário"],
    km: [
      { v: "20000", r: "Até 20.000 km" },
      { v: "50000", r: "Até 50.000 km" },
      { v: "80000", r: "Até 80.000 km" },
      { v: "100000", r: "Até 100.000 km" },
      { v: "mais", r: "Mais de 100.000 km" }
    ],
    ordens: [
      { v: "relevantes", r: "Mais relevantes" },
      { v: "recentes", r: "Mais recentes" },
      { v: "preco-menor", r: "Menor preço" },
      { v: "preco-maior", r: "Maior preço" },
      { v: "km-menor", r: "Menor quilometragem" },
      { v: "km-maior", r: "Maior quilometragem" }
    ]
  };

  var estado = { q: "", ordem: "relevantes", aplicados: null };

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function opcao(nome, valor, rotulo, contagem) {
    return '<label class="opcao">' +
      '<input type="checkbox" name="' + nome + '" value="' + valor + '">' +
      "<span>" + rotulo + "</span>" +
      (typeof contagem === "number" ? '<span class="qtd">' + contagem + "</span>" : "") +
      "</label>";
  }

  function montarFiltros() {
    var base = AS.estoque();
    var contagem = function (pred) { return base.filter(pred).length; };
    var seloTipo = $("[data-filtro=tipo]");
    var seloMarca = $("[data-filtro=marca]");
    var seloCambio = $("[data-filtro=cambio]");
    var seloCombustivel = $("[data-filtro=combustivel]");
    var seloCarroceria = $("[data-filtro=carroceria]");

    if (seloTipo) seloTipo.innerHTML = CFG.tipos.map(function (t) {
      var grupo = CFG.agrupamento[t];
      var qtd = grupo
        ? contagem(function (v) { return grupo.indexOf(v.tipo) > -1; })
        : contagem(function (v) { return v.tipo === t; });
      return opcao("tipo", t, t, qtd);
    }).join("");

    if (seloMarca) {
      var marcas = {};
      base.forEach(function (v) { marcas[v.marca] = (marcas[v.marca] || 0) + 1; });
      seloMarca.innerHTML = Object.keys(marcas).sort(function (a, b) { return a.localeCompare(b, "pt-BR"); })
        .map(function (m) { return opcao("marca", m, m, marcas[m]); }).join("");
    }

    if (seloCambio) seloCambio.innerHTML = CFG.cambios.map(function (c) {
      return opcao("cambio", c, c, contagem(function (v) { return v.cambio === c; }));
    }).join("");

    if (seloCombustivel) seloCombustivel.innerHTML = CFG.combustiveis.map(function (c) {
      return opcao("combustivel", c, c, contagem(function (v) { return v.combustivel === c; }));
    }).join("");

    if (seloCarroceria) seloCarroceria.innerHTML = CFG.carrocerias.map(function (c) {
      return opcao("carroceria", c, c, contagem(function (v) { return v.carroceria === c; }));
    }).join("");

    if (seloMarca) seloMarca.addEventListener("change", montarModelos);
    montarModelos();
  }

  function montarModelos() {
    var alvo = $("[data-filtro=modelo]");
    if (!alvo) return;
    var marcasSelecionadas = $$('[name="marca"]:checked').map(function (i) { return i.value; });
    var anteriores = $$('[name="modelo"]:checked').map(function (i) { return i.value; });
    var base = AS.estoque().filter(function (v) {
      return !marcasSelecionadas.length || marcasSelecionadas.indexOf(v.marca) > -1;
    });
    var modelos = {};
    base.forEach(function (v) { modelos[v.modelo] = (modelos[v.modelo] || 0) + 1; });
    var chaves = Object.keys(modelos).sort(function (a, b) { return a.localeCompare(b, "pt-BR"); });
    alvo.innerHTML = chaves.map(function (m) {
      var marcado = anteriores.indexOf(m) > -1 ? " checked" : "";
      return '<label class="opcao"><input type="checkbox" name="modelo" value="' + m + '"' + marcado + "><span>" + m + '</span><span class="qtd">' + modelos[m] + "</span></label>";
    }).join("") || '<p class="texto-mudo" style="font-size:14px">Selecione uma marca para ver os modelos.</p>';
  }

  function lerPainel() {
    var val = function (nome) {
      return $$('input[name="' + nome + '"]:checked').map(function (i) { return i.value; });
    };
    return {
      q: estado.q,
      tipos: val("tipo"),
      marcas: val("marca"),
      modelos: val("modelo"),
      precoMin: parseFloat(($("#preco-min") || {}).value) || 0,
      precoMax: parseFloat(($("#preco-max") || {}).value) || Infinity,
      anoMin: parseInt(($("#ano-min") || {}).value, 10) || 0,
      anoMax: parseInt(($("#ano-max") || {}).value, 10) || 9999,
      km: (val("km")[0] || ""),
      cambios: val("cambio"),
      combustiveis: val("combustivel"),
      carrocerias: val("carroceria")
    };
  }

  function expandirTipos(tipos) {
    var saida = tipos.slice();
    tipos.forEach(function (t) {
      (CFG.agrupamento[t] || []).forEach(function (x) {
        if (saida.indexOf(x) === -1) saida.push(x);
      });
    });
    return saida;
  }

  function filtrar(f) {
    var termo = (f.q || "").toLowerCase().trim();
    var pesos = termo.split(/\s+/).filter(Boolean);
    var tiposSel = expandirTipos(f.tipos);
    return AS.estoque().filter(function (v) {
      var texto = (v.marca + " " + v.modelo + " " + v.versao + " " + v.ano + " " + v.anoModelo + " " + v.cambio + " " + v.combustivel + " " + v.cor + " " + v.carroceria + " " + v.tipo).toLowerCase();
      if (pesos.length && !pesos.every(function (p) { return texto.indexOf(p) > -1; })) return false;
      if (tiposSel.length && tiposSel.indexOf(v.tipo) === -1) return false;
      if (f.marcas.length && f.marcas.indexOf(v.marca) === -1) return false;
      if (f.modelos.length && f.modelos.indexOf(v.modelo) === -1) return false;
      if (v.preco < f.precoMin || v.preco > f.precoMax) return false;
      if (v.ano < f.anoMin || v.ano > f.anoMax) return false;
      if (f.km === "mais" && v.km <= 100000) return false;
      if (f.km && f.km !== "mais" && v.km > parseInt(f.km, 10)) return false;
      if (f.cambios.length && f.cambios.indexOf(v.cambio) === -1) return false;
      if (f.combustiveis.length && f.combustiveis.indexOf(v.combustivel) === -1) return false;
      if (f.carrocerias.length && f.carrocerias.indexOf(v.carroceria) === -1) return false;
      return true;
    });
  }

  function ordenar(lista, modo) {
    var l = lista.slice();
    var relevancia = function (v) {
      var s = 0;
      if ((v.selos || []).indexOf("destaque") > -1) s += 3;
      if ((v.selos || []).indexOf("oferta") > -1) s += 2;
      if ((v.selos || []).indexOf("novo") > -1) s += 1;
      return s;
    };
    switch (modo) {
      case "recentes": l.sort(function (a, b) { return (b.publicadoEm || "").localeCompare(a.publicadoEm || ""); }); break;
      case "preco-menor": l.sort(function (a, b) { return a.preco - b.preco; }); break;
      case "preco-maior": l.sort(function (a, b) { return b.preco - a.preco; }); break;
      case "km-menor": l.sort(function (a, b) { return a.km - b.km; }); break;
      case "km-maior": l.sort(function (a, b) { return b.km - a.km; }); break;
      default:
        l.sort(function (a, b) {
          var d = relevancia(b) - relevancia(a);
          return d !== 0 ? d : (b.publicadoEm || "").localeCompare(a.publicadoEm || "");
        });
    }
    return l;
  }

  function rotuloKm(valor) {
    if (!valor) return "";
    var item = CFG.km.filter(function (k) { return k.v === valor; })[0];
    return item ? item.r : "";
  }

  function chipsAtivos(f) {
    var chips = [];
    var add = function (tipo, valor, rotulo) { chips.push({ tipo: tipo, valor: valor, rotulo: rotulo || valor }); };
    if (f.q) add("q", f.q, 'Busca: "' + f.q + '"');
    f.tipos.forEach(function (t) { add("tipo", t); });
    f.marcas.forEach(function (m) { add("marca", m); });
    f.modelos.forEach(function (m) { add("modelo", m); });
    if (f.precoMin) add("precoMin", "", "Mín. " + AS.brl(f.precoMin));
    if (isFinite(f.precoMax)) add("precoMax", "", "Máx. " + AS.brl(f.precoMax));
    if (f.anoMin) add("anoMin", "", "Ano mín. " + f.anoMin);
    if (f.anoMax !== 9999) add("anoMax", "", "Ano máx. " + f.anoMax);
    if (f.km) add("km", f.km, rotuloKm(f.km));
    f.cambios.forEach(function (c) { add("cambio", c); });
    f.combustiveis.forEach(function (c) { add("combustivel", c); });
    f.carrocerias.forEach(function (c) { add("carroceria", c); });
    return chips;
  }

  function removerChip(tipo, valor) {
    if (tipo === "q") { estado.q = ""; var campo = $("#busca-estoque"); if (campo) campo.value = ""; }
    else if (tipo === "precoMin") { $("#preco-min").value = ""; }
    else if (tipo === "precoMax") { $("#preco-max").value = ""; }
    else if (tipo === "anoMin") { $("#ano-min").value = ""; }
    else if (tipo === "anoMax") { $("#ano-max").value = ""; }
    else {
      var alvo = $$('input[name="' + tipo + '"]').filter(function (i) { return i.value === valor; })[0];
      if (alvo) alvo.checked = false;
      if (tipo === "marca") montarModelos();
    }
    aplicar(true);
  }

  function pintarChips(f) {
    var alvo = $("#chips-ativos");
    if (!alvo) return;
    var chips = chipsAtivos(f);
    if (!chips.length) { alvo.innerHTML = ""; alvo.style.display = "none"; return; }
    alvo.style.display = "flex";
    alvo.innerHTML = chips.map(function (c) {
      return '<button class="chip-ativo" type="button" data-chip-tipo="' + c.tipo + '" data-chip-valor="' + c.valor + '">' +
        "<span>" + c.rotulo + "</span><i aria-hidden=\"true\">×</i></button>";
    }).join("") + '<button class="chip-limpar" type="button" data-limpar-todos>Limpar tudo</button>';
  }

  function desenhar(lista) {
    var grid = $("#grid-veiculos");
    var contagem = $("#contagem");
    if (contagem) {
      contagem.textContent = lista.length === 0
        ? "Nenhum veículo encontrado"
        : lista.length + (lista.length === 1 ? " veículo encontrado" : " veículos encontrados");
    }
    if (!grid) return;
    if (!lista.length) {
      grid.innerHTML = AS.estadoVazio(
        "Nenhum veículo com esses filtros",
        "Tente ampliar a faixa de preço, remover marcas ou buscar outro termo.",
        '<button class="btn btn-dark" type="button" data-limpar-todos>Limpar filtros</button>'
      );
      return;
    }
    AS.renderCards(grid, lista);
  }

  function comLoading(fn) {
    var grid = $("#grid-veiculos");
    if (grid) {
      grid.innerHTML = AS.skeletons(6);
      grid.setAttribute("aria-busy", "true");
    }
    setTimeout(function () {
      if (grid) grid.removeAttribute("aria-busy");
      fn();
    }, 320);
  }

  function aplicar(silencioso) {
    var f = lerPainel();
    estado.aplicados = f;
    var lista = ordenar(filtrar(f), estado.ordem);
    pintarChips(f);
    sincronizarUrl(f);
    if (silencioso) desenhar(lista);
    else comLoading(function () { desenhar(lista); });
    if (!silencioso) fecharSheet();
  }

  function limpar() {
    $$('input[type="checkbox"]', $("#filtros") || document).forEach(function (i) { i.checked = false; });
    ["preco-min", "preco-max", "ano-min", "ano-max"].forEach(function (id) { var el = $("#" + id); if (el) el.value = ""; });
    estado.q = "";
    var campo = $("#busca-estoque");
    if (campo) campo.value = "";
    montarModelos();
    aplicar(false);
  }

  function sincronizarUrl(f) {
    try {
      var p = new URLSearchParams();
      if (f.q) p.set("q", f.q);
      if (estado.ordem !== "relevantes") p.set("ordem", estado.ordem);
      if (f.tipos.length) p.set("tipo", f.tipos.join(","));
      if (f.marcas.length) p.set("marca", f.marcas.join(","));
      var qs = p.toString();
      history.replaceState(null, "", qs ? "?" + qs : location.pathname);
    } catch (e) { /* ambiente sem history */ }
  }

  function lerUrl() {
    try {
      var p = new URLSearchParams(location.search);
      if (p.get("q")) {
        estado.q = p.get("q");
        var campo = $("#busca-estoque");
        if (campo) campo.value = estado.q;
      }
      if (p.get("ordem")) {
        estado.ordem = p.get("ordem");
        var sel = $("#ordem");
        if (sel) sel.value = estado.ordem;
      }
      var marcasUrl = (p.get("marca") || "").split(",").filter(Boolean);
      var tiposUrl = (p.get("tipo") || "").split(",").filter(Boolean);
      return { marcas: marcasUrl, tipos: tiposUrl };
    } catch (e) { return { marcas: [], tipos: [] }; }
  }

  /* ---------- sheet de filtros (mobile) ---------- */
  var slotOriginal = null;
  function abrirSheet() {
    var sheet = $("#sheet-filtros");
    var painel = $("#filtros");
    if (!sheet || !painel) return;
    slotOriginal = painel.parentNode;
    $("[data-slot-sheet]", sheet).appendChild(painel);
    sheet.classList.add("aberto");
    document.body.style.overflow = "hidden";
  }
  function fecharSheet() {
    var sheet = $("#sheet-filtros");
    var painel = $("#filtros");
    if (!sheet || !painel || !sheet.classList.contains("aberto")) return;
    if (slotOriginal) slotOriginal.appendChild(painel);
    sheet.classList.remove("aberto");
    document.body.style.overflow = "";
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("#grid-veiculos")) return;

    montarFiltros();

    var url = lerUrl();
    url.marcas.forEach(function (m) {
      var i = $$('[name="marca"]').filter(function (x) { return x.value === m; })[0];
      if (i) i.checked = true;
    });
    montarModelos();
    url.tipos.forEach(function (t) {
      var i = $$('[name="tipo"]').filter(function (x) { return x.value === t; })[0];
      if (i) i.checked = true;
    });
    url.marcas.forEach(function (m) {
      var i = $$('[name="marca"]').filter(function (x) { return x.value === m; })[0];
      if (i) i.checked = true;
    });

    var selOrdem = $("#ordem");
    if (selOrdem) {
      selOrdem.innerHTML = CFG.ordens.map(function (o) {
        return '<option value="' + o.v + '">' + o.r + "</option>";
      }).join("");
      selOrdem.value = estado.ordem;
      selOrdem.addEventListener("change", function () {
        estado.ordem = selOrdem.value;
        aplicar(false);
      });
    }

    var formBusca = $("#form-busca-estoque");
    if (formBusca) {
      formBusca.addEventListener("submit", function (e) {
        e.preventDefault();
        estado.q = ($("#busca-estoque").value || "").trim();
        aplicar(false);
      });
    }

    document.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest("[data-aplicar]")) { aplicar(false); return; }
      if (t.closest("[data-limpar]")) { limpar(); return; }
      if (t.closest("[data-abrir-filtros]")) { abrirSheet(); return; }
      if (t.closest("[data-fechar-filtros]")) { fecharSheet(); return; }
      if (t.closest("[data-limpar-todos]")) { limpar(); return; }
      var chip = t.closest("[data-chip-tipo]");
      if (chip) { removerChip(chip.getAttribute("data-chip-tipo"), chip.getAttribute("data-chip-valor")); return; }
      if (t.id === "sheet-filtros") { fecharSheet(); }
    });

    document.addEventListener("keydown", function (e) { if (e.key === "Escape") fecharSheet(); });

    aplicar(true);
  });
})();
