import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { env } from "../config/env.js";
import { loadStore } from "../db/file-store.js";
import {
  cookieOptions,
  protect,
  signAccessToken,
  signRefreshToken,
} from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { validateBody } from "../middleware/validate.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  "/login",
  loginLimiter,
  validateBody(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.validated;
      const store = loadStore();
      const admin = store.admins.find(
        (a) => a.email === email.toLowerCase(),
      );
      if (!admin) {
        throw new AppError("Invalid email or password", 401);
      }

      const ok = await bcrypt.compare(password, admin.password_hash);
      if (!ok) {
        throw new AppError("Invalid email or password", 401);
      }

      const accessToken = signAccessToken(admin);
      const refreshToken = signRefreshToken(admin);
      const opts = cookieOptions();

      res.cookie("access_token", accessToken, {
        ...opts,
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refresh_token", refreshToken, {
        ...opts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.post("/logout", (req, res) => {
  const opts = cookieOptions();
  res.clearCookie("access_token", opts);
  res.clearCookie("refresh_token", opts);
  res.json({ ok: true });
});

router.get("/me", protect, (req, res) => {
  res.json({ admin: req.admin });
});

router.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) throw new AppError("Refresh token required", 401);

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }

    if (payload.typ !== "refresh") {
      throw new AppError("Invalid token type", 401);
    }

    const store = loadStore();
    const admin = store.admins.find((a) => a.id === payload.sub);
    if (!admin) throw new AppError("Admin not found", 401);

    const accessToken = signAccessToken(admin);
    res.cookie("access_token", accessToken, {
      ...cookieOptions(),
      maxAge: 15 * 60 * 1000,
    });
    res.json({
      accessToken,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
