import Joi from 'joi';

export const validateBuilding = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  next();
};
