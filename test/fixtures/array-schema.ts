import * as Joi from '@hapi/joi';

export const IMyArrayContainerSchema = Joi.object().keys({
  myArray: Joi.array().items(Joi.number()).required(),
  myArray2: Joi.array().items(Joi.object().keys({
    foo: Joi.string().required(),
    bar: Joi.number().required(),
  })).required(),
}).strict();