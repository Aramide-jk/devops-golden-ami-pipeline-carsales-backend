import { body, ValidationChain, validationResult, ValidationError } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Validation rules for creating/updating a car
export const carValidationRules = (): ValidationChain[] => [
  body("brand").notEmpty().withMessage("Brand is required"),
  body("make").notEmpty().withMessage("Make is required"),
  body("model").notEmpty().withMessage("Model is required"),
  body("year")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("Year must be a valid number"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  body("fuelType").notEmpty().withMessage("Fuel type is required"),
  body("mileage").isInt({ min: 0 }).withMessage("Mileage must be a valid number"),
  body("transmission").notEmpty().withMessage("Transmission is required"),
  body("condition").notEmpty().withMessage("Condition is required"),
  body("engine").notEmpty().withMessage("Engine is required"),
  body("features")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Features must be an array with max 20 items"),
  body("status")
    .optional()
    .isIn(["available", "sold", "pending"])
    .withMessage('Status must be one of "available", "sold", or "pending"'),
  body("location").optional().isString().withMessage("Location must be a string"),
  body("images")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Images must be an array with max 10 URLs"),
];

// Middleware to check validation results
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // TypeScript-safe access to 'param'
    const formattedErrors = errors.array().map((err) => ({
      field: (err as any).param,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      errors: formattedErrors,
    });
  }

  next();
};
