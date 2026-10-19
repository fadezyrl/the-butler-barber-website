import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { getStoreMode, initStore } from "./db/file-store.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import publicRoutes from "./routes/public.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const start = async () => {
  await initStore();

  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
    }),
  );
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "../uploads"), {
      fallthrough: false,
      setHeaders: (res, filePath) => {
        if (/\.mp4$/i.test(filePath)) {
          res.setHeader("Content-Type", "video/mp4");
        } else if (/\.webm$/i.test(filePath)) {
          res.setHeader("Content-Type", "video/webm");
        } else if (/\.mov$/i.test(filePath)) {
          res.setHeader("Content-Type", "video/quicktime");
        }
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      },
    }),
  );

  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      service: "butler-cms-api",
      store: getStoreMode(),
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/public", publicRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(env.PORT, () => {
    console.log(`CMS API listening on http://localhost:${env.PORT}`);
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
