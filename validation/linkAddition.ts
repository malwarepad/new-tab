import Joi from "joi";

export const LinkAdditionValidator = Joi.object({
  label: Joi.string().required().label("Link label"),
  uri: Joi.string().uri().required().label("Link target URI"),

  // allow
  file: Joi.any(),
});

export const LinkEditValidator = Joi.object({
  id: Joi.number().required().label("Link identifier"),
  label: Joi.string().required().label("Link label"),
  uri: Joi.string().uri().required().label("Link target URI"),

  // allow
  file: Joi.any(),
});
