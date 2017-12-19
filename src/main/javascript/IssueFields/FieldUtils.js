export class FieldUtils
{
  static hasPrimitiveValue(field)
  {
    return -1 !== ['string', 'boolean', 'number'].indexOf(field.schema.type);
  }

  static hasSingleValue(field)
  {
    return field.schema.type !== 'array';
  }
}
