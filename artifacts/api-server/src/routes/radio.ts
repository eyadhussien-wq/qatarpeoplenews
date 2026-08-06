import { Router } from "express";
import { Readable } from "node:stream";

const RADIO_STREAMS: Record<string, string> = {
  "quran-qatar": "https://backup.quranalkarim.com:8443/quran",
  "sout-al-khaleej": "https://skr.out.airtime.pro/skr_a",
  "qatar-radio": "https://stream.zeno.fm/f3wvbbqmdg8uv",
  "rayyan": "https://stream.zeno.fm/0388y681bf9uv",
};

const RADIO_PROXY_STREAMS: Record<string, string[]> = {
  qur: [
    "https://qmcconnect.qa/v1/live/qur/master.m3u8",
    "https://stream.radiojar.com/quran_qatar",
  ],
  skfm: [
    "https://qmcconnect.qa/v1/live/skfm/master.m3u8",
    "https://skfm.out.airtime.pro/skfm_a",
  ],
  qr: [
    "https://qmcconnect.qa/v1/live/qr/master.m3u8",
    "https://stream.radiojar.com/qatar_radio",
  ],
  alrayyanfm: [
    "https://qmcconnect.qa/v1/live/alrayyanfm/master.m3u8",
    "https://stream.zeno.fm/alrayyan",
  ],
};

const radioRouter = Router();

radioRouter.get("/radio-proxy/:station", async (req, res) => {
  const targetUrls = RADIO_PROXY_STREAMS[req.params.station];
  if (!targetUrls) {
    res.status(404).send("Station not found");
    return;
  }

  for (const targetUrl of targetUrls) {
    try {
      const upstream = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "*/*",
          Referer: "https://tabie.net/",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });
      if (!upstream.ok || !upstream.body) {
        console.warn(`Failed to fetch ${targetUrl}: ${upstream.status}`);
        continue;
      }

      const contentType = upstream.headers.get("content-type") ?? "";
      const isPlaylist = targetUrl.toLowerCase().endsWith(".m3u8")
        || contentType.includes("mpegurl")
        || contentType.includes("vnd.apple");
      res.setHeader("Content-Type", isPlaylist ? "application/vnd.apple.mpegurl" : (contentType || "audio/mpeg"));
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

      if (isPlaylist) {
        const playlistText = await upstream.text();
        const baseUrl = new URL(targetUrl);
        const rewrittenPlaylist = playlistText.split("\n").map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#") || /^https?:\/\//i.test(trimmed)) return line;
          try { return new URL(trimmed, baseUrl).toString(); } catch { return line; }
        }).join("\n");
        res.send(rewrittenPlaylist);
      } else {
        const stream = Readable.fromWeb(upstream.body as Parameters<typeof Readable.fromWeb>[0]);
        stream.on("error", (error) => res.destroy(error));
        req.on("close", () => stream.destroy());
        stream.pipe(res);
      }
      return;
    } catch (error) {
      console.warn(`Failed to fetch ${targetUrl}, trying next stream...`, error);
    }
  }
  res.status(502).send("All stream sources failed");
});

radioRouter.get("/radio/stream/:stationId", async (req, res) => {
  const targetUrl = RADIO_STREAMS[req.params.stationId];
  if (!targetUrl) {
    res.status(404).json({ error: "Station stream not found" });
    return;
  }

  let upstream: Response | undefined;
  try {
    upstream = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Icy-MetaData": "1",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if ((!upstream.ok && upstream.status !== 206) || !upstream.body) {
      console.error(`Upstream failure for ${req.params.stationId}: Status ${upstream.status}`);
      res.status(502).json({ error: `Upstream station returned ${upstream.status}` });
      return;
    }

    res.status(200);
    res.setHeader("Content-Type", upstream.headers.get("content-type") ?? "audio/mpeg");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const stream = Readable.fromWeb(upstream.body as Parameters<typeof Readable.fromWeb>[0]);
    stream.on("error", (error) => {
      if (!res.headersSent) res.status(502);
      res.destroy(error);
    });
    req.on("close", () => stream.destroy());
    stream.pipe(res);
  } catch (error) {
    console.error(`Stream Proxy Error [${req.params.stationId}]:`, error);
    if (!res.headersSent) res.status(502).send("Audio Stream Unavailable");
  }
});

export default radioRouter;