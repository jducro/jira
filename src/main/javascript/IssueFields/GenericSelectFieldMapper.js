import { SelectAdapter } from '../UI';


export class GenericSelectFieldMapper
{
  /**
   * @param {object} field
   * @return {*|boolean}
   */
  canMap(field)
  {
    const { schema } = field;

    if (schema && typeof schema === 'object' && field.allowedValues) {
      // exception: can not handle attachements
      return !(schema.items && schema.items === 'attachement');
    }

    return false;
  }

  /**
   * @param {{}} field
   * @param {FieldMapperSpecificityCalculator} calculator
   * @return {FieldMapperSpecificityCalculator}
   */
  computeSpecificity(field, calculator)
  {
    if (! this.canMap(field)) {
      return calculator;
    }

    return calculator.matchedByType();
  }

  /**
   * @param {object} field
   * @param value
   * @return {XML}
   */
  map(field, value)
  {
    const allowedValues = field.allowedValues instanceof Array ? field.allowedValues : [];
    return (
      <SelectAdapter
        name={ field.key }
        //validate={false}
        options= {allowedValues}
        value={value}
        multi={field.schema.type === 'array'}
      />);
  }
}
