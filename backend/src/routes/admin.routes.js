import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { protect } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  deleteGalleryItem,
  deleteServiceCategory,
  deleteServiceItem,
  deleteTestimonial,
  reorderGallery,
  reorderServiceItems,
  reorderTestimonials,
  upsertGalleryItem,
  upsertServiceCategory,
  upsertServiceItem,
  upsertTestimonial,
} from "../services/content.service.js";
import {
  deleteMedia,
  listMedia,
  uploadMedia,
} from "../services/media.service.js";
import { getPublishLog, publishSection } from "../services/publish.service.js";
import {
  getAdminDraftSite,
  updateLocaleDraft,
  updateSettingsDraft,
  upsertHoursDraft,
} from "../services/site.service.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const getRequestPublicBase = (req) => {
  const forwardedProto = req.get("x-forwarded-proto");
  const proto = (forwardedProto || req.protocol || "http").split(",")[0].trim();
  const host = (req.get("x-forwarded-host") || req.get("host") || "")
    .split(",")[0]
    .trim();
  if (!host) return "";
  return `${proto}://${host}`;
};

router.use(protect);

router.get("/dashboard", async (req, res, next) => {
  try {
    const draft = await getAdminDraftSite();
    const log = await getPublishLog(10);
    res.json({
      admin: req.admin,
      counts: {
        services: draft.services.items.length,
        gallery: draft.gallery.length,
        testimonials: draft.testimonials.length,
      },
      recentPublishes: log,
      updatedAt: draft.settings.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/content", async (req, res, next) => {
  try {
    res.json(await getAdminDraftSite());
  } catch (err) {
    next(err);
  }
});

router.put(
  "/settings",
  validateBody(z.record(z.any())),
  async (req, res, next) => {
    try {
      res.json(await updateSettingsDraft(req.validated));
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/locales/:locale",
  validateBody(z.record(z.any())),
  async (req, res, next) => {
    try {
      res.json(await updateLocaleDraft(req.params.locale, req.validated));
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/hours",
  validateBody(
    z.object({
      days: z.array(
        z.object({
          day: z.enum(["sat", "sun", "mon", "tue", "wed", "thu", "fri"]),
          isClosed: z.boolean(),
          opens: z.string(),
          closes: z.string(),
          displayOverride: z.string().nullable().optional(),
        }),
      ),
    }),
  ),
  async (req, res, next) => {
    try {
      res.json(await upsertHoursDraft(req.validated.days));
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/services/categories",
  validateBody(
    z.object({
      id: z.string().uuid().optional(),
      slug: z.string().min(1),
      sortOrder: z.number().int().optional(),
      isVisible: z.boolean().optional(),
      nameEn: z.string().optional(),
      nameAr: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      res.json(await upsertServiceCategory(req.validated));
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/services/categories/:id", async (req, res, next) => {
  try {
    res.json(await deleteServiceCategory(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post(
  "/services/items",
  validateBody(
    z.object({
      id: z.string().uuid().optional(),
      categoryId: z.string().uuid(),
      slug: z.string().min(1),
      price: z.string().optional(),
      currency: z.string().optional(),
      sortOrder: z.number().int().optional(),
      isVisible: z.boolean().optional(),
      nameEn: z.string().optional(),
      nameAr: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      res.json(await upsertServiceItem(req.validated));
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/services/items/:id", async (req, res, next) => {
  try {
    res.json(await deleteServiceItem(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post(
  "/services/items/reorder",
  validateBody(z.object({ orderedIds: z.array(z.string().uuid()) })),
  async (req, res, next) => {
    try {
      res.json(await reorderServiceItems(req.validated.orderedIds));
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/gallery",
  validateBody(
    z.object({
      id: z.string().uuid().optional(),
      mediaUrl: z.string().min(1),
      kind: z.enum(["image", "video"]).optional(),
      altEn: z.string().optional(),
      altAr: z.string().optional(),
      sortOrder: z.number().int().optional(),
      isVisible: z.boolean().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      res.json(await upsertGalleryItem(req.validated));
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/gallery/:id", async (req, res, next) => {
  try {
    res.json(await deleteGalleryItem(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post(
  "/gallery/reorder",
  validateBody(z.object({ orderedIds: z.array(z.string().uuid()) })),
  async (req, res, next) => {
    try {
      res.json(await reorderGallery(req.validated.orderedIds));
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/testimonials",
  validateBody(
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().optional(),
      quoteEn: z.string().optional(),
      quoteAr: z.string().optional(),
      source: z.string().optional(),
      sortOrder: z.number().int().optional(),
      isVisible: z.boolean().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      res.json(await upsertTestimonial(req.validated));
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/testimonials/:id", async (req, res, next) => {
  try {
    res.json(await deleteTestimonial(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post(
  "/testimonials/reorder",
  validateBody(z.object({ orderedIds: z.array(z.string().uuid()) })),
  async (req, res, next) => {
    try {
      res.json(await reorderTestimonials(req.validated.orderedIds));
    } catch (err) {
      next(err);
    }
  },
);

router.get("/media", async (req, res, next) => {
  try {
    res.json(await listMedia(getRequestPublicBase(req)));
  } catch (err) {
    next(err);
  }
});

router.post("/media/upload", upload.single("file"), async (req, res, next) => {
  try {
    const asset = await uploadMedia({
      file: req.file,
      alt: req.body?.alt || "",
      adminId: req.admin.id,
      publicBaseUrl: getRequestPublicBase(req),
    });
    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
});

router.delete("/media/:id", async (req, res, next) => {
  try {
    res.json(await deleteMedia(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.post(
  "/publish",
  validateBody(
    z.object({
      section: z.enum([
        "all",
        "settings",
        "locales",
        "services",
        "gallery",
        "testimonials",
        "hours",
      ]),
    }),
  ),
  async (req, res, next) => {
    try {
      res.json(await publishSection(req.validated.section, req.admin.id));
    } catch (err) {
      next(err);
    }
  },
);

router.get("/publish-log", async (req, res, next) => {
  try {
    res.json(await getPublishLog(50));
  } catch (err) {
    next(err);
  }
});

export default router;
