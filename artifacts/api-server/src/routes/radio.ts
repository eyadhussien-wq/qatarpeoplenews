import { Router } from "express";
import { Readable } from "node:stream";

const RADIO_STREAMS: Record<string, string> = {
  "quran-qatar": "https://stream.radiojar.com/8s4s0snqh3duv.mp3",
  "sout-al-khaleej": "https://radio.garden/api/ara/content/listen/4q3cuwiv/channel.mp3",
  "qatar-radio": "https://stream.zeno.fm/f3wvbbqmdg8uv",
  "rayyan": "https://stream.zeno.fm/0388y681bf9uv",
};

const radioRouter = Router();

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
        "User-Agent": "Mozilla/5.0 (compatible; AhlQatarRadio/1.0)",
        Accept: "*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok || !upstream.body) {
      res.status(502).send("Audio Stream Unavailable");
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