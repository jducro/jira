import { Select } from '@deskpro/react-components';

import React from 'react';
import PropTypes from 'prop-types';
import {FieldUtils} from '../IssueFields';

const mapOptions = allowedValues => {
  if (! allowedValues instanceof Array) {
    return [];
  }

  return allowedValues.map(({ id, name }) => ({ label: name, value: id }));
};

const mapValues = (selected, allowedValues) => {

  const ids = selected.map(({ value }) => value);
  return allowedValues.filter(o => -1 !== ids.indexOf(o.id));
};

export class SelectAdapter extends React.PureComponent
{
  static propTypes = {
    mapOptions: PropTypes.func,
    mapValues: PropTypes.func,
  };

  static defaultProps = { mapOptions, mapValues };

  onChange = (value, fieldId) =>
  {
    if (this.props.onChange) {
      let mappedValue = null;
      if (value instanceof Array) {
        mappedValue = mapValues(value, this.props.options);
      } else {
        mappedValue = mapValues([value], this.props.options).pop();
      }
      this.props.onChange(mappedValue, fieldId);
    }
  };

  render()
  {
    const {value, options, ...rest} = this.props;

    let fieldValue = null;
    if (value instanceof Array) {
      fieldValue = mapOptions(value);
    } else if (value) {
      fieldValue = mapOptions([value]).pop();
    }

    return (
      <Select {...rest}
        //validate={false}
        options={ mapOptions(options) }
        value={fieldValue}
        onChange={this.onChange}
      />);
  }
}
