/* Catálogo de opcionais — cadastrados individualmente por veículo.
   Compartilhado entre o navegador e o gerador de páginas (Node). */
(function (root) {
  "use strict";

  var MAPA = {
    "ar-condicionado": {
      rotulo: "Ar-condicionado",
      svg: '<path d="M12 2.5v19M4 7.3l16 9.4M20 7.3L4 16.7" stroke-linecap="round"/><path d="M9.4 5L12 6.7 14.6 5M9.4 19L12 17.3 14.6 19" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    "direcao-eletrica": {
      rotulo: "Direção elétrica",
      svg: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.4"/><path d="M3.6 10.6h5M15.4 10.6h5M12 15.4V21" stroke-linecap="round"/>'
    },
    "vidros-eletricos": {
      rotulo: "Vidros elétricos",
      svg: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M12 7.5v6M9.4 11l2.6 2.6L14.6 11" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    "travas-eletricas": {
      rotulo: "Travas elétricas",
      svg: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.2a4 4 0 0 1 8 0v3.3"/><circle cx="12" cy="15.4" r="1.7"/>'
    },
    "central-multimidia": {
      rotulo: "Central multimídia",
      svg: '<rect x="3" y="4.5" width="18" height="12.5" rx="2.5"/><path d="M9 21h6M12 17v4" stroke-linecap="round"/><path d="M10.4 8.4l4.2 2.3-4.2 2.3z" stroke-linejoin="round"/>'
    },
    "camera-re": {
      rotulo: "Câmera de ré",
      svg: '<path d="M4 7.6h3.2l1.6-2.2h6.4l1.6 2.2H20a1.6 1.6 0 0 1 1.6 1.6v8.6A1.6 1.6 0 0 1 20 20H4a1.6 1.6 0 0 1-1.6-1.6V9.2A1.6 1.6 0 0 1 4 7.6z"/><circle cx="12" cy="13.4" r="3.3"/>'
    },
    "sensor-estacionamento": {
      rotulo: "Sensor de estacionamento",
      svg: '<path d="M9 19.5V4.5h4.3a3.5 3.5 0 0 1 0 7H9" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.8 8.6a5 5 0 0 1 0 6.8M19.4 6.4a8.4 8.4 0 0 1 0 11.2" stroke-linecap="round"/>'
    },
    "controle-estabilidade": {
      rotulo: "Controle de estabilidade",
      svg: '<path d="M6.4 16.5l1.3-4.2A2.2 2.2 0 0 1 9.8 10.7h4.4a2.2 2.2 0 0 1 2.1 1.6l1.3 4.2" stroke-linecap="round"/><circle cx="8.2" cy="18.4" r="1.7"/><circle cx="15.8" cy="18.4" r="1.7"/><path d="M3 7.6c1.7 0 1.7 2.2 3.4 2.2s1.7-2.2 3.4-2.2" stroke-linecap="round"/>'
    },
    "bancos-couro": {
      rotulo: "Bancos de couro",
      svg: '<path d="M7.5 4.5h5.8A2.7 2.7 0 0 1 16 7.2V14H8.9A2.9 2.9 0 0 1 6 11.1z" stroke-linejoin="round"/><path d="M6 14h11.1A2.9 2.9 0 0 1 20 16.9V19.5H8.4A2.4 2.4 0 0 1 6 17.1z" stroke-linejoin="round"/>'
    },
    "piloto-automatico": {
      rotulo: "Piloto automático",
      svg: '<path d="M4 17.6a9 9 0 1 1 16 0" stroke-linecap="round"/><path d="M12 17.6l4.6-5.1" stroke-linecap="round"/><circle cx="12" cy="17.6" r="1.5"/>'
    },
    "rodas-liga": {
      rotulo: "Rodas de liga leve",
      svg: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.6"/><path d="M12 3.2v5.2M12 15.6v5.2M3.2 12h5.2M15.6 12h5.2" stroke-linecap="round"/>'
    },
    "farois-led": {
      rotulo: "Faróis LED",
      svg: '<path d="M9.2 17h5.6M10.2 20h3.6" stroke-linecap="round"/><path d="M12 3.2a6.2 6.2 0 0 0-3.7 11.2c.6.5 1 1.2 1 2h5.4c0-.8.4-1.5 1-2A6.2 6.2 0 0 0 12 3.2z" stroke-linejoin="round"/>'
    },
    "chave-presenca": {
      rotulo: "Chave de presença",
      svg: '<circle cx="8.2" cy="15.8" r="4.6"/><path d="M11.5 12.5L20 4M16.4 7.6l2.1 2.1M14 10l2.1 2.1" stroke-linecap="round"/>'
    },
    "start-stop": {
      rotulo: "Start & Stop",
      svg: '<path d="M12 3v7.6" stroke-linecap="round"/><path d="M7.6 6.6a7 7 0 1 0 8.8 0" stroke-linecap="round"/>'
    }
  };

  root.AS_OPCIONAIS = MAPA;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = MAPA;
  }
})(typeof window !== "undefined" ? window : globalThis);
