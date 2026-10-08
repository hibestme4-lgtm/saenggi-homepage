import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("./dist", import.meta.url)));
const host = process.env.HOST || "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "5173", 10);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

function resolveRequestPath(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const normalizedPath = normalize(decodedPath).replace(/^([/\\])+/, "");
  const filePath = resolve(join(root, normalizedPath));

  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
    return null;
  }

  return filePath;
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    sendText(response, 405, "Method Not Allowed");
    return;
  }

  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || host}`);
    let filePath = resolveRequestPath(url.pathname);

    if (!filePath) {
      sendText(response, 403, "Forbidden");
      return;
    }

    let fileStat;
    try {
      fileStat = await stat(filePath);
    } catch {
      sendText(response, 404, "Not Found");
      return;
    }

    if (fileStat.isDirectory()) {
      filePath = join(filePath, "index.html");
      try {
        fileStat = await stat(filePath);
      } catch {
        sendText(response, 404, "Not Found");
        return;
      }
    }

    if (!fileStat.isFile()) {
      sendText(response, 404, "Not Found");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": fileStat.size,
      "Content-Type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream"
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch (error) {
    if (error instanceof URIError) {
      sendText(response, 400, "Bad Request");
      return;
    }

    console.error(error);
    sendText(response, 500, "Internal Server Error");
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`포트 ${port}가 이미 사용 중입니다. PORT 환경변수로 다른 포트를 지정해 주세요.`);
    process.exit(1);
  }

  throw error;
});

server.listen(port, host, () => {
  console.log(`생기재가복지센터 홈페이지가 실행되었습니다.`);
  console.log(`Local: http://${host}:${port}/`);
});
