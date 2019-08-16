import * as Joi from '@hapi/joi';

export const ITestSchema = Joi.object().keys({
}).pattern(/^.*$/, Joi.any()).strict();