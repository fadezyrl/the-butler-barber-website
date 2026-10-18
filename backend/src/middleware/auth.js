import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { loadStore } from "../db/file-store.js";
import { AppError } from "./errorHandler.js";

export const signAccessToken = (admin) =>
  jwt.sign(
    { sub: admin.id, email: admin.email, typ: "access" },
    env.JWT_SECRET,
    { expiresIn: env.ACCESS_TOKEN_TTL },
  );

export const signRefreshToken = (admin) =>
  jwt.sign(
    { sub: admin.id, email: admin.email, typ: "refresh" },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TOKEN_TTL },
  );

export const cookieOptions = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SECURE ? "none" : "lax",
  path: "/",
});

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const bearer =
      header && header.startsWith("Bearer ") ? header.slice(7) : null;
    const token = bearer || req.cookies?.access_token;

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new AppError("Invalid or expired token", 401);
    }

    if (payload.typ !== "access") {
      throw new AppError("Invalid token type", 401);
    }

    const store = loadStore();
    const admin = store.admins.find((a) => a.id === payload.sub);
    if (!admin) {
      throw new AppError("Admin not found", 401);
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      created_at: admin.created_at,
    };
    next();
  } catch (err) {
    next(err);
  }
};
