export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFound = (req, res, next) => {
  next(new AppError(`Not found: ${req.method} ${req.path}`, 404));
};

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const payload = {
    error: {
      message: err.message || "Internal server error",
      ...(err.details ? { details: err.details } : {}),
    },
  };

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json(payload);
};
