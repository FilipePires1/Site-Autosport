/* Servidor local para visualizar o site (desenvolvimento). */
const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..");
const PORTA = process.env.PORTA || 8080;

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

http.createServer(function (req, res) {
  let caminho = decodeURIComponent(req.url.split("?")[0]);
  let arquivo = path.join(RAIZ, caminho);

  if (!path.resolve(arquivo).startsWith(RAIZ)) {
    res.writeHead(403); res.end("403"); return;
  }
  if (caminho.endsWith("/")) arquivo = path.join(arquivo, "index.html");

  fs.stat(arquivo, function (erro, st) {
    if (!erro && st.isDirectory()) arquivo = path.join(arquivo, "index.html");
    fs.readFile(arquivo, function (e, dados) {
      if (e) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>404 - página não encontrada</h1>");
        return;
      }
      res.writeHead(200, { "Content-Type": TIPOS[path.extname(arquivo)] || "application/octet-stream" });
      res.end(dados);
    });
  });
}).listen(PORTA, function () {
  console.log("Auto Sport Multimarcas rodando em http://localhost:" + PORTA);
});
