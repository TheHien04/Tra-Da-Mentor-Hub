// backend/middleware/validate.js
/**
 * Validation middleware
 * Apply schemas to route handlers
 */

export function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        const formattedErrors = Object.entries(errors).map(
          ([field, messages]) => ({
            field,
            messages: messages || [],
          })
        );

        return res.status(400).json({
          success: false,
          type: "VALIDATION_ERROR",
          message: "Validation failed",
          errors: formattedErrors,
        });
      }

      // Replace req.body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }
  };
}

// Legacy validators (kept for backward compatibility)
// Basic validation middleware for mentor data
export const validateMentor = (req, res, next) => {
  const { name, email, phone, maxMentees } = req.body;

  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('Name is required');
  }

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  if (phone && !/^\d{10,}$/.test(phone.replace(/\D/g, ''))) {
    errors.push('Phone should have at least 10 digits');
  }

  if (maxMentees && (isNaN(maxMentees) || maxMentees < 1)) {
    errors.push('Max Mentees must be at least 1');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
  }

  next();
};

// Validation middleware for mentee data
export const validateMentee = (req, res, next) => {
  const { name, email, phone } = req.body;

  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('Name is required');
  }

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  if (phone && !/^\d{10,}$/.test(phone.replace(/\D/g, ''))) {
    errors.push('Phone should have at least 10 digits');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
  }

  next();
};

// Validation middleware for group data
export const validateGroup = (req, res, next) => {
  const { name, description, topic, mentorId } = req.body;

  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('Group name is required');
  }

  if (!description || description.trim() === '') {
    errors.push('Description is required');
  }

  if (!topic || topic.trim() === '') {
    errors.push('Topic is required');
  }

  if (!mentorId || mentorId.trim() === '') {
    errors.push('Mentor is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
  }

  next();
};
