const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

const PYTHON_BIN = fs.existsSync('C:\\Python313\\python.exe')
  ? 'C:\\Python313\\python.exe'
  : 'python';

const STREAM_CACHE_TTL_MS = 30 * 60 * 1000;
const streamCache = new Map();
const pendingResolve = new Map();
const metaCache = new Map();

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Type');
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function extractYouTubeId(input) {
  if (!input) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
  const match = input.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
  return match ? match[1] : null;
}

function runYtDlp(args, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    execFile(
      PYTHON_BIN,
      ['-m', 'yt_dlp', ...args],
      { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024, windowsHide: true },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error((stderr || err.message || 'yt-dlp failed').trim()));
          return;
        }
        resolve(stdout);
      }
    );
  });
}

async function resolveYouTubeStreamUrl(videoId, type) {
  const mediaType = type === 'audio' ? 'audio' : 'video';
  const cacheKey = `${videoId}:${mediaType}`;
  const cached = streamCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  if (pendingResolve.has(videoId)) {
    const resolvedPair = await pendingResolve.get(videoId);
    return mediaType === 'audio' ? resolvedPair.audioUrl : resolvedPair.videoUrl;
  }

  const task = (async () => {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const stdout = await runYtDlp([
      '-g',
      '--no-playlist',
      '--no-warnings',
      '-f',
      '134+140/135+140/133+140/bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestaudio/best',
      watchUrl
    ]);

    const urls = stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith('http://') || line.startsWith('https://'));

    if (!urls.length) {
      throw new Error('Nao foi possivel resolver a URL de midia do YouTube');
    }

    const videoUrl = urls[0];
    const audioUrl = urls[1] || urls[0];
    const expiresAt = Date.now() + STREAM_CACHE_TTL_MS;

    streamCache.set(`${videoId}:video`, { url: videoUrl, expiresAt });
    streamCache.set(`${videoId}:audio`, { url: audioUrl, expiresAt });

    return { videoUrl, audioUrl };
  })();

  pendingResolve.set(videoId, task);
  try {
    const resolvedPair = await task;
    return mediaType === 'audio' ? resolvedPair.audioUrl : resolvedPair.videoUrl;
  } finally {
    pendingResolve.delete(videoId);
  }
}

function fetchJsonViaHttps(targetUrl) {
  return new Promise((resolve, reject) => {
    https
      .get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (upstreamRes) => {
        let raw = '';
        upstreamRes.on('data', (chunk) => { raw += chunk; });
        upstreamRes.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function resolveYouTubeMeta(videoId) {
  const cached = metaCache.get(videoId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let data = null;

  try {
    const stdout = await runYtDlp([
      '--dump-single-json',
      '--no-playlist',
      '--no-warnings',
      '--skip-download',
      watchUrl
    ]);
    const parsed = JSON.parse(stdout);
    data = {
      id: videoId,
      title: parsed.title || `YouTube (${videoId})`,
      artist: parsed.channel || parsed.uploader || 'YouTube',
      duration: parsed.duration || 0,
      thumbnail: parsed.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
  } catch (_) {
    try {
      const noembed = await fetchJsonViaHttps(`https://noembed.com/embed?url=${encodeURIComponent(watchUrl)}`);
      data = {
        id: videoId,
        title: noembed.title || `YouTube (${videoId})`,
        artist: noembed.author_name || 'YouTube',
        duration: 0,
        thumbnail: noembed.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      };
    } catch (_) {
      data = {
        id: videoId,
        title: `YouTube (${videoId})`,
        artist: 'YouTube',
        duration: 0,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      };
    }
  }

  metaCache.set(videoId, { data, expiresAt: Date.now() + STREAM_CACHE_TTL_MS });
  return data;
}

function proxyRemoteMedia(targetUrl, clientReq, clientRes, fallbackContentType, redirectDepth = 0) {
  if (redirectDepth > 5) {
    if (!clientRes.headersSent) sendJson(clientRes, 502, { error: 'Too many redirects' });
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (_) {
    if (!clientRes.headersSent) sendJson(clientRes, 400, { error: 'Invalid upstream URL' });
    return;
  }

  const transport = parsedUrl.protocol === 'http:' ? http : https;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Encoding': 'identity',
    'Referer': 'https://www.youtube.com/',
    'Origin': 'https://www.youtube.com'
  };

  if (clientReq.headers.range) {
    headers['Range'] = clientReq.headers.range;
  }

  const upstreamReq = transport.request(
    parsedUrl,
    { method: clientReq.method === 'HEAD' ? 'HEAD' : 'GET', headers },
    (upstreamRes) => {
      if ([301, 302, 303, 307, 308].includes(upstreamRes.statusCode) && upstreamRes.headers.location) {
        upstreamRes.resume();
        const nextUrl = new URL(upstreamRes.headers.location, parsedUrl).toString();
        proxyRemoteMedia(nextUrl, clientReq, clientRes, fallbackContentType, redirectDepth + 1);
        return;
      }

      setCorsHeaders(clientRes);
      const outHeaders = {
        'Content-Type': upstreamRes.headers['content-type'] || fallbackContentType,
        'Accept-Ranges': upstreamRes.headers['accept-ranges'] || 'bytes',
        'Cache-Control': 'no-store'
      };
      if (upstreamRes.headers['content-length']) {
        outHeaders['Content-Length'] = upstreamRes.headers['content-length'];
      }
      if (upstreamRes.headers['content-range']) {
        outHeaders['Content-Range'] = upstreamRes.headers['content-range'];
      }

      clientRes.writeHead(upstreamRes.statusCode || 200, outHeaders);
      if (clientReq.method === 'HEAD') {
        upstreamRes.resume();
        clientRes.end();
        return;
      }

      upstreamRes.pipe(clientRes);
    }
  );

  upstreamReq.on('error', (err) => {
    if (!clientRes.headersSent) {
      sendJson(clientRes, 502, { error: err.message });
    } else {
      clientRes.destroy();
    }
  });

  clientRes.on('close', () => {
    upstreamReq.destroy();
  });

  upstreamReq.end();
}

function startLocalServer(preferredPort = 3456) {
  return new Promise((resolve) => {
    let activePort = preferredPort;

    const server = http.createServer(async (req, res) => {
      if (req.method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(204);
        res.end();
        return;
      }

      let reqUrl;
      try {
        reqUrl = new URL(req.url || '/', `http://127.0.0.1:${activePort}`);
      } catch (_) {
        // Some hosting proxies can pass a non-standard request target.
        // Treat it as the site root instead of returning a blank 400 page.
        reqUrl = new URL('/');
      }

      const pathname = decodeURIComponent(reqUrl.pathname);

      // 1. Healthcheck para detectar servidor ativo a partir de file://
      if (pathname === '/api/health') {
        sendJson(res, 200, { ok: true, port: activePort });
        return;
      }

      // 2. Metadados do YouTube
      if (pathname === '/api/yt-meta') {
        const rawParam = reqUrl.searchParams.get('url') || reqUrl.searchParams.get('id') || '';
        const videoId = extractYouTubeId(rawParam);
        if (!videoId) {
          sendJson(res, 400, { error: 'ID ou URL do YouTube invalido' });
          return;
        }
        const meta = await resolveYouTubeMeta(videoId);
        sendJson(res, 200, meta);
        return;
      }

      // 3. Proxy de Stream nativo do YouTube (audio ou video)
      if (pathname === '/api/yt-stream') {
        const videoId = extractYouTubeId(reqUrl.searchParams.get('id') || reqUrl.searchParams.get('url') || '');
        const mediaType = reqUrl.searchParams.get('type') === 'audio' ? 'audio' : 'video';
        if (!videoId) {
          sendJson(res, 400, { error: 'ID do YouTube invalido' });
          return;
        }
        try {
          const mediaUrl = await resolveYouTubeStreamUrl(videoId, mediaType);
          const fallbackMime = mediaType === 'audio' ? 'audio/mp4' : 'video/mp4';
          proxyRemoteMedia(mediaUrl, req, res, fallbackMime);
        } catch (err) {
          // Limpa cache caso tenha expirado ou falhado
          streamCache.delete(`${videoId}:${mediaType}`);
          sendJson(res, 502, { error: err.message });
        }
        return;
      }

      // 4. Arquivos estaticos do iPod
      let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
      if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        setCorsHeaders(res);
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        });
        res.end(content);
      });
    });

    server.on('error', () => {
      server.listen(0, '0.0.0.0', () => {
        activePort = server.address().port;
        resolve({ server, port: activePort });
      });
    });

    server.listen(preferredPort, '0.0.0.0', () => {
      activePort = server.address().port;
      resolve({ server, port: activePort });
    });
  });
}

function getLocalLanIps() {
  const ips = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

if (require.main === module) {
  const runtimePort = Number(process.env.PORT) || 3456;
  startLocalServer(runtimePort).then(({ port }) => {
    const url = `http://localhost:${port}`;
    const lanIps = getLocalLanIps();
    console.log(`\n==================================================`);
    console.log(`  iPod Classic Virtual rodando em: ${url}`);
    lanIps.forEach((ip) => {
      console.log(`  No celular (mesmo Wi-Fi): http://${ip}:${port}`);
    });
    console.log(`  (Proxy nativo de Audio/Video do YouTube ativo!)`);
    console.log(`==================================================\n`);
    if (process.argv.includes('--open')) {
      const { exec } = require('child_process');
      exec(`start "" "${url}"`);
    }
  });
} else {
  // Hostinger loads the entry file as a module and expects the app to bind
  // to the port provided by the hosting environment.
  const hostingerPort = Number(process.env.PORT) || 3456;
  startLocalServer(hostingerPort).catch((error) => {
    console.error('Falha ao iniciar o servidor:', error);
    process.exitCode = 1;
  });
}

module.exports = { startLocalServer };
