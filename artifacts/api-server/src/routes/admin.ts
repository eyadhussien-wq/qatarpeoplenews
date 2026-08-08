import { createHmac, timingSafeEqual } from "node:crypto";
import { Router, type Request, type Response } from "express";

const router = Router();
const SESSION_COOKIE = "qpn_admin_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const ADMIN_EMAIL = (process.env.QPN_ADMIN_EMAIL ?? "admin@qpn.com").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.QPN_ADMIN_PASSWORD;
const SESSION_SECRET = process.env.QPN_ADMIN_SESSION_SECRET;

type SessionPayload = { sub: "admin"; exp: number };
const attempts = new Map<string, { count: number; resetAt: number }>();

function sign(value: string) {
  return createHmac("sha256", SESSION_SECRET ?? "").update(value).digest("base64url");
}

function createSession() {
  const payload: SessionPayload = {
    sub: "admin",
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function getCookie(req: Request, name: string) {
  const prefix = `${name}=`;
  const value = (req.headers.cookie?.split(";") ?? []).find((part) => part.trim().startsWith(prefix));
  return value ? decodeURIComponent(value.trim().slice(prefix.length)) : undefined;
}

function verifySession(token?: string) {
  if (!token || !SESSION_SECRET) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    return payload.sub === "admin" && payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch {
    return null;
  }
}

function isAuthenticated(req: Request) {
  return Boolean(verifySession(getCookie(req, SESSION_COOKIE)));
}

function setSessionCookie(res: Response, value: string) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
}

function clearSessionCookie(res: Response) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
}

function allowLoginAttempt(req: Request) {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }

  if (current.count >= 10) return false;
  current.count += 1;
  return true;
}

router.post("/admin/login", (req, res) => {
  if (!ADMIN_PASSWORD || !SESSION_SECRET) {
    return res.status(503).json({ error: "Admin authentication is not configured" });
  }
  if (!allowLoginAttempt(req)) {
    return res.status(429).json({ error: "Too many login attempts. Try again later." });
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  setSessionCookie(res, createSession());
  return res.json({ ok: true, email: ADMIN_EMAIL });
});

router.get("/admin/me", (req, res) => {
  if (!isAuthenticated(req)) return res.status(401).json({ authenticated: false });
  return res.json({ authenticated: true, email: ADMIN_EMAIL });
});

router.post("/admin/logout", (_req, res) => {
  clearSessionCookie(res);
  return res.json({ ok: true });
});

router.get("/admin", (req, res) => {
  res.type("html").send(isAuthenticated(req) ? dashboardHtml(ADMIN_EMAIL) : loginHtml());
});

function shell(title: string, body: string, script = "") {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | QPN Admin</title><style>
  :root{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#172033;background:#f5f7fb}*{box-sizing:border-box}body{margin:0}.wrap{min-height:100vh;display:grid;place-items:center;padding:24px}.card{width:min(430px,100%);background:#fff;border:1px solid #e6eaf0;border-radius:20px;padding:28px;box-shadow:0 18px 50px rgba(20,30,50,.08)}.brand{font-weight:800;font-size:26px;margin-bottom:6px}.muted{color:#667085;font-size:14px}.label{display:block;font-size:14px;font-weight:700;margin:18px 0 7px}input{width:100%;padding:13px 14px;border:1px solid #d8dee8;border-radius:10px;font-size:15px;outline:none}button{border:0;border-radius:10px;padding:13px 16px;font-weight:800;cursor:pointer}.primary{background:#172033;color:#fff;width:100%;margin-top:20px}.error{background:#fff1f2;color:#b42318;padding:10px;border-radius:10px;margin-top:14px;display:none}.dashboard{width:min(1100px,100%);margin:0 auto;padding:30px}.top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:28px}.logout{background:#fff;border:1px solid #d8dee8}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}.tile,.note{background:#fff;border:1px solid #e6eaf0;border-radius:16px;padding:20px}.tile h3{margin:10px 0 8px}.badge{display:inline-block;background:#ecfdf3;color:#067647;padding:5px 9px;border-radius:999px;font-size:12px;font-weight:800}.note{margin-top:22px;line-height:1.8}</style></head><body>${body}${script}</body></html>`;
}

function loginHtml() {
  return shell("تسجيل الدخول", `<div class="wrap"><div class="card"><div class="brand">Qatar People News</div><div class="muted">لوحة التحكم الإدارية</div><form id="login"><label class="label">البريد الإلكتروني</label><input id="email" type="email" autocomplete="username" required><label class="label">كلمة المرور</label><input id="password" type="password" autocomplete="current-password" required><button class="primary">دخول لوحة التحكم</button><div id="error" class="error"></div></form></div></div>`, `<script>document.getElementById('login').addEventListener('submit',async e=>{e.preventDefault();const x=document.getElementById('error');x.style.display='none';try{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:document.getElementById('email').value,password:document.getElementById('password').value})});const d=await r.json().catch(()=>({}));if(!r.ok){x.textContent=d.error||'تعذر تسجيل الدخول';x.style.display='block';return}location.reload()}catch{ x.textContent='تعذر الاتصال بالخادم';x.style.display='block';}});</script>`);
}

function dashboardHtml(email: string) {
  return shell("لوحة التحكم", `<main class="dashboard"><div class="top"><div><div class="brand">لوحة تحكم QPN</div><div class="muted">${email}</div></div><button id="logout" class="logout">تسجيل الخروج</button></div><div class="grid"><section class="tile"><span class="badge">قادم</span><h3>الأخبار</h3><div class="muted">إدارة الأخبار، المسودات، النشر والعاجل.</div></section><section class="tile"><span class="badge">محمي</span><h3>التلفزيون</h3><div class="muted">مصادر YouTube الحالية لن تتغير.</div></section><section class="tile"><span class="badge">محمي</span><h3>الراديو</h3><div class="muted">مصادر QMC HLS الحالية لن تتغير.</div></section><section class="tile"><span class="badge">قادم</span><h3>الإحصائيات</h3><div class="muted">المشاهدات والتفاعل وTrending.</div></section></div><section class="note"><strong>الأساس الإداري جاهز.</strong><br>الخطوة التالية هي ربط إدارة الأخبار بقاعدة البيانات وإضافة التصنيفات والوسائط والمسودة والنشر والعاجل.</section></main>`, `<script>document.getElementById('logout').onclick=async()=>{await fetch('/api/admin/logout',{method:'POST'});location.reload()};</script>`);
}

export default router;
