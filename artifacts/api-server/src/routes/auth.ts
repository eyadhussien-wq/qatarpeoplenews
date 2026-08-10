import { Router, type IRouter } from "express";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { eq, gt } from "drizzle-orm";
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

async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(userSessions).values({ userId, tokenHash: hashToken(token), expiresAt });
  return { token, expiresAt };
}

function bearerToken(req: Parameters<IRouter["get"]>[1] extends never ? never : any) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
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
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ message: "غير مسجل الدخول." });
    return;
  }

  const session = await db.query.userSessions.findFirst({
    where: (table, { and, eq, gt }) => and(eq(table.tokenHash, hashToken(token)), gt(table.expiresAt, new Date())),
    with: { user: true },
  });
  if (!session?.user) {
    res.status(401).json({ message: "انتهت جلسة الدخول." });
    return;
  }

  res.json({ user: { id: session.user.id, name: session.user.name, email: session.user.email, language: session.user.language } });
});

router.post("/auth/logout", async (req, res) => {
  const token = bearerToken(req);
  if (token) await db.delete(userSessions).where(eq(userSessions.tokenHash, hashToken(token)));
  res.status(204).send();
});

export default router;
