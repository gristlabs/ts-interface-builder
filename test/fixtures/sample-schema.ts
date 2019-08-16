import * as Joi from '@hapi/joi';

export const SomeEnumSchemaFoo = Joi.valid(0);
export const SomeEnumSchemaBar = Joi.valid(1);
export const SomeEnumSchema = Joi.alternatives(SomeEnumSchemaFoo, SomeEnumSchemaBar)

export const DirectionSchemaUp = Joi.valid(1);
export const DirectionSchemaDown = Joi.valid(2);
export const DirectionSchemaLeft = Joi.valid(17);
export const DirectionSchemaRight = Joi.valid(18);
export const DirectionSchema = Joi.alternatives(DirectionSchemaUp, DirectionSchemaDown, DirectionSchemaLeft, DirectionSchemaRight)

export const DirectionStrSchemaUp = Joi.valid("UP");
export const DirectionStrSchemaDown = Joi.valid("DOWN");
export const DirectionStrSchemaLeft = Joi.valid("LEFT");
export const DirectionStrSchemaRight = Joi.valid("RIGHT");
export const DirectionStrSchema = Joi.alternatives(DirectionStrSchemaUp, DirectionStrSchemaDown, DirectionStrSchemaLeft, DirectionStrSchemaRight)

export const BooleanLikeHeterogeneousEnumSchemaNo = Joi.valid(0);
export const BooleanLikeHeterogeneousEnumSchemaYes = Joi.valid("YES");
export const BooleanLikeHeterogeneousEnumSchema = Joi.alternatives(BooleanLikeHeterogeneousEnumSchemaNo, BooleanLikeHeterogeneousEnumSchemaYes)

export const EnumComputedSchemaFoo = Joi.valid(0);
export const EnumComputedSchemaBar = Joi.valid(17);
export const EnumComputedSchemaBaz = Joi.valid(16);
export const EnumComputedSchema = Joi.alternatives(EnumComputedSchemaFoo, EnumComputedSchemaBar, EnumComputedSchemaBaz)

export const AnimalFlagsSchemaNone = Joi.valid(0);
export const AnimalFlagsSchemaHasClaws = Joi.valid(1);
export const AnimalFlagsSchemaCanFly = Joi.valid(2);
export const AnimalFlagsSchemaEatsFish = Joi.valid(4);
export const AnimalFlagsSchemaEndangered = Joi.valid(8);
export const AnimalFlagsSchema = Joi.alternatives(AnimalFlagsSchemaNone, AnimalFlagsSchemaHasClaws, AnimalFlagsSchemaCanFly, AnimalFlagsSchemaEatsFish, AnimalFlagsSchemaEndangered)

export const ICacheItemSchema = Joi.object().keys({
  key: Joi.alternatives(
    Joi.string().regex(/^key-\d+$/),
    Joi.valid(null)
  ).required(),
  value: Joi.any().required(),
  size: Joi.number().required(),
  tag: Joi.string(),
}).strict();

export const ILRUCacheSchema = Joi.object().keys({
  capacity: Joi.number().integer().required(),
  set: Joi.func().required(),
  get: Joi.func().required(),
}).strict();

export const ISamplingSchema = Joi.object().concat(ICacheItemSchema).keys({
  xstring: Joi.string().required(),
  xstring2: Joi.string().required(),
  xany: Joi.any().required(),
  xnumber: Joi.number().required(),
  xnumber2: Joi.number(),
  xnumber3: Joi.number().integer().min(0).max(2).required(),
  xnumber4: Joi.number().max(10).required(),
  xNumberAlias: Joi.lazy(() => NumberAliasSchema).required(),
  xNumberAlias2: Joi.lazy(() => NumberAlias2Schema).required(),
  xnull: Joi.valid(null).required(),
  xMyType: Joi.lazy(() => MyTypeSchema).required(),
  xarray: Joi.array().items(Joi.string()).required(),
  xarray2: Joi.array().items(Joi.lazy(() => MyTypeSchema)).required(),
  xtuple: Joi.array().ordered(
    Joi.string(),
    Joi.number()
  ).required(),
  xunion: Joi.alternatives(
    Joi.number(),
    Joi.valid(null)
  ).required(),
  xparen: Joi.alternatives(
    Joi.number(),
    Joi.string()
  ).required(),
  xiface: Joi.object().keys({
    foo: Joi.string().required(),
    bar: Joi.number().required(),
  }).required(),
  xliteral: Joi.alternatives(
    Joi.valid('foo'),
    Joi.valid('ba\'r'),
    Joi.valid(3)
  ).required(),
  xfunc: Joi.func().required(),
  xfunc2: Joi.func().required(),
  xDirection: Joi.lazy(() => DirectionSchema).required(),
  xDirectionStr: Joi.lazy(() => DirectionStrSchema).required(),
  xDirUp: Joi.alternatives(
    Joi.lazy(() => DirectionSchemaUp),
    Joi.lazy(() => DirectionSchemaLeft)
  ).required(),
  xDirStrLeft: Joi.lazy(() => DirectionStrSchemaLeft).required(),
  ximplicit: Joi.any().required(),
  ximplicitFunc: Joi.func().required(),
  ximplicitFunc2: Joi.func().required(),
}).strict();

export const MyTypeSchema = Joi.alternatives(
  Joi.boolean(),
  Joi.number(),
  Joi.lazy(() => ILRUCacheSchema)
).strict();

export const NumberAliasSchema = Joi.number().strict();

export const NumberAlias2Schema = Joi.lazy(() => NumberAliasSchema).strict();