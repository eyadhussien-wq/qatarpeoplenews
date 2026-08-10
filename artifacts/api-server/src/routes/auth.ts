import { Router, type IRouter, type Request } from "express";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db, userSessions, users } from "@workspace/db";

const router: IRouter = Router();
const SESSION_DAYS = 30;
const MIN_PASSWORD_LENGTH = 8;

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeName(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getBearerToken(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(userSessions).values({ userId, tokenHash: hashToken(token), expiresAt });
  return { token, expiresAt };
}

router.post("/auth/register", async (req, res) => {
  const name = normalizeName(req.body?.name);
  const email = normalizeEmail(req.body?.email);
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const language = req.body?.language === "en" ? "en" : "ar";

  if (name.length < 2 || name.length > 100) {
    res.status(400).json({ message: "الاسم يجب أن يكون بين حرفين و100 حرف." });
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400).json({ message: "البريد الإلكتروني غير صالح." });
    return;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    res.status(400).json({ message: `كلمة المرور يجب أن تكون ${MIN_PASSWORD_LENGTH} أحرف على الأقل.` });
    return;
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, email), columns: { id: true } });
  if (existing) {
    res.status(409).json({ message: "هذا البريد الإلكتروني مسجل بالفعل." });
    return;
  }

  const [user] = await db.insert(users).values({ name, email, passwordHash: hashPassword(password), language }).returning({ id: users.id, name: users.name, email: users.email, language: users.language });
  if (!user) {
    res.status(500).json({ message: "تعذر إنشاء الحساب حالياً." });
    return;
  }

  const session = await createSession(user.id);
  res.status(201).json({ user, ...session });
});

router.post("/auth/login", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
    return;
  }

  const session = await createSession(user.id);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, language: user.language },
    ...session,
  });
});

router.get("/auth/me", async (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ message: "غير مسجل الدخول." });
    return;
  }

  const session = await db.query.userSessions.findFirst({
    where: and(eq(userSessions.tokenHash, hashToken(token)), gt(userSessions.expiresAt, new Date())),
  });
  if (!session) {
    res.status(401).json({ message: "انتهت جلسة الدخول." });
    return;
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) {
    res.status(401).json({ message: "الحساب غير موجود." });
    return;
  }

  res.json({ user: { id: user.id, name: user.name, email: user.email, language: user.language } });
});

router.post("/auth/logout", async (req, res) => {
  const token = getBearerToken(req);
  if (token) await db.delete(userSessions).where(eq(userSessions.tokenHash, hashToken(token)));
  res.status(204).send();
});

export default router;
