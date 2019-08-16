import * as Joi from '@hapi/joi';

import { TypeCSchema } from './imports-child-c-schema';
export { TypeCSchema };
export { TypeDSchema } from './imports-child-d-schema';

export const TypeBSchema = Joi.object().keys({
}).strict();