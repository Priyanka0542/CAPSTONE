/**
 * Zod validation middleware factory.
 * Takes a Zod schema and returns Express middleware that validates req.body.
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed; // Replace with parsed (cleaned) data
    next();
  } catch (error) {
    // Forward Zod errors to centralized error handler
    next(error);
  }
};

/**
 * Validates query parameters instead of body.
 */
const validateQuery = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.query);
    req.query = parsed;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { validate, validateQuery };
