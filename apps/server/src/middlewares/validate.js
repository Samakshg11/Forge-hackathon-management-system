import { ValidationError } from './errorHandler.js';

/**
 * Express middleware that validates req.body against a Zod schema.
 * Attaches parsed data to req.validated for use in controllers.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ValidationError('Validation failed', details));
    }
    req.validated = result.data;
    next();
  };
}
