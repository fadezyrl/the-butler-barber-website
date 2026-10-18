import { Router } from "express";
import { getPublishedSite } from "../services/site.service.js";

const router = Router();

router.get("/site", async (req, res, next) => {
  try {
    const site = await getPublishedSite();
    const locale = req.query.locale;
    if (locale && site.dictionaries[locale]) {
      return res.json({
        ...site,
        dictionary: site.dictionaries[locale],
      });
    }
    res.json(site);
  } catch (err) {
    next(err);
  }
});

export default router;
