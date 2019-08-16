import * as Joi from '@hapi/joi';

import { TypeASchema } from './imports-child-a-schema';
import { TypeBSchema, TypeCSchema, TypeDSchema } from './imports-child-b-schema';

export const TypeAllSchema = Joi.object().keys({
  a: Joi.lazy(() => TypeASchema).required(),
  b: Joi.lazy(() => TypeBSchema).required(),
  c: Joi.lazy(() => TypeCSchema).required(),
  d: Joi.lazy(() => TypeDSchema).required(),
}).strict();