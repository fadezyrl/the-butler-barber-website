import { AppError } from "./errorHandler.js";

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(
      new AppError("Validation failed", 400, result.error.flatten()),
    );
  }
  req.validated = result.data;
  next();
};
