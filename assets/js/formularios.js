/* Auto Sport — formulários de captação de leads */
(function () {
  "use strict";
  if (!window.AS) return;

  var CHAVE_LEADS = "autosport:leads";

  function salvarLead(lead) {
    var lista = [];
    try { lista = JSON.parse(localStorage.getItem(CHAVE_LEADS) || "[]"); } catch (e) { lista = []; }
    lista.push(lead);
    try { localStorage.setItem(CHAVE_LEADS, JSON.stringify(lista)); } catch (e) { /* modo privado */ }
    if (window.console) console.info("[Auto Sport] Lead capturado:", lead);
    return lead;
  }

  function valor(form, nome) {
    var campo = form.querySelector('[name="' + nome + '"]');
    return campo ? String(campo.value || "").trim() : "";
  }

  function marcarInvalido(campo, invalido) {
    if (!campo) return;
    var grupo = campo.closest(".campo-form");
    if (grupo) grupo.classList.toggle("invalido", invalido);
  }

  function validar(form) {
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (campo) {
      var vazio = !String(campo.value || "").trim();
      var ruim = vazio;
      if (!ruim && campo.type === "email") ruim = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campo.value);
      if (!ruim && campo.hasAttribute("data-telefone")) {
        var digitos = campo.value.replace(/\D/g, "").length;
        ruim = digitos < 10 || digitos > 13;
      }
      marcarInvalido(campo, ruim);
      if (ruim) ok = false;
    });
    return ok;
  }

  function mascaraTelefone(campo) {
    var d = campo.value.replace(/\D/g, "").slice(0, 11);
    if (d.length === 0) { campo.value = ""; return; }
    if (d.length <= 2) campo.value = "(" + d;
    else if (d.length <= 6) campo.value = "(" + d.slice(0, 2) + ") " + d.slice(2);
    else if (d.length <= 10) campo.value = "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    else campo.value = "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  function mensagemZap(form, tipo) {
    var nome = valor(form, "nome");
    if (tipo === "venda") {
      var marca = valor(form, "marca");
      var modelo = valor(form, "modelo");
      var ano = valor(form, "ano");
      var km = valor(form, "km");
      var cidade = valor(form, "cidade");
      var linha = [marca && "Marca: " + marca, modelo && "Modelo: " + modelo, ano && "Ano: " + ano,
        km && "Km: " + km, cidade && "Cidade: " + cidade].filter(Boolean).join(" | ");
      return "Olá! Quero vender meu veículo na Auto Sport. " + (linha || "") +
        (nome ? " Meu nome é " + nome + "." : "");
    }
    if (tipo === "financiamento") {
      return "Olá! Gostaria de consultar financiamento para o veículo: " +
        (valor(form, "veiculo") || "a definir") +
        (valor(form, "entrada") ? " (entrada estimada: " + valor(form, "entrada") + ")" : "") +
        (nome ? " Meu nome é " + nome + "." : "");
    }
    if (tipo === "trabalhe-conosco") {
      return "Olá! Quero trabalhar na Auto Sport. " +
        "Área de interesse: " + (valor(form, "area") || "a definir") +
        (valor(form, "cidade") ? " | Cidade: " + valor(form, "cidade") : "") +
        (valor(form, "email") ? " | E-mail: " + valor(form, "email") : "") +
        (valor(form, "mensagem") ? " | Mensagem: " + valor(form, "mensagem") : "") +
        (nome ? " Meu nome é " + nome + "." : "");
    }
    var veiculo = valor(form, "veiculo");
    return "Olá! Vim pelo site da Auto Sport Multimarcas." +
      (veiculo ? " Tenho interesse no veículo: " + veiculo + "." : "") +
      (valor(form, "mensagem") ? " Mensagem: " + valor(form, "mensagem") : "") +
      (nome ? " Meu nome é " + nome + "." : "");
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-datalist-veiculos]").forEach(function (campo) {
      var lista = campo.getAttribute("list");
      var dl = lista ? document.getElementById(lista) : null;
      if (!dl) return;
      dl.innerHTML = AS.estoque().map(function (v) {
        return '<option value="' + AS.titulo(v).replace(/"/g, "&quot;") + " " + v.anoModelo + '"></option>';
      }).join("");
    });

    document.querySelectorAll("input[data-telefone]").forEach(function (campo) {
      campo.addEventListener("input", function () { mascaraTelefone(campo); });
    });

    document.querySelectorAll("[data-dropzone]").forEach(function (zone) {
      var input = zone.querySelector('input[type="file"]');
      var lista = zone.parentNode.querySelector("[data-lista-arquivos]");
      if (!input) return;
      zone.addEventListener("click", function () { input.click(); });
      zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("arrastando"); });
      zone.addEventListener("dragleave", function () { zone.classList.remove("arrastando"); });
      zone.addEventListener("drop", function (e) {
        e.preventDefault();
        zone.classList.remove("arrastando");
        if (e.dataTransfer && e.dataTransfer.files) {
          input.files = e.dataTransfer.files;
          mostrarArquivos();
        }
      });
      input.addEventListener("change", mostrarArquivos);

      function mostrarArquivos() {
        if (!lista) return;
        var arquivos = Array.prototype.slice.call(input.files || []);
        lista.innerHTML = arquivos.map(function (f) {
          return "<span>" + f.name.replace(/[<>]/g, "") + "</span>";
        }).join("");
      }
    });

    document.querySelectorAll("form[data-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validar(form)) {
          AS.toast("Confira os campos destacados");
          var primeiro = form.querySelector(".campo-form.invalido input, .campo-form.invalido select, .campo-form.invalido textarea");
          if (primeiro) primeiro.focus();
          return;
        }

        var tipo = form.getAttribute("data-form");
        var lead = {
          nome: valor(form, "nome"),
          whatsapp: valor(form, "whatsapp"),
          veiculo: valor(form, "veiculo") || valor(form, "marca") + " " + valor(form, "modelo"),
          origem: tipo,
          data: new Date().toISOString(),
          mensagem: valor(form, "mensagem") || valor(form, "observacoes") || ""
        };
        salvarLead(lead);

        var sucesso = document.querySelector("[data-sucesso='" + tipo + "']");
        var linkZap = sucesso ? sucesso.querySelector("[data-sucesso-zap]") : null;
        if (linkZap) linkZap.href = AS.zapLink(mensagemZap(form, tipo));

        form.style.display = "none";
        if (sucesso) {
          sucesso.classList.add("visivel");
          sucesso.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        AS.toast("Mensagem enviada com sucesso!");
      });

      form.querySelectorAll("input, select, textarea").forEach(function (campo) {
        campo.addEventListener("input", function () { marcarInvalido(campo, false); });
      });
    });
  });
})();
