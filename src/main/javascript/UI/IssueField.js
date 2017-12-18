import React from 'react';
import PropTypes from 'prop-types';

export class IssueField extends React.PureComponent
{
  static propTypes = {

    /**
     * The ui component
     */
    field:   PropTypes.object.isRequired,


    /**
     * The ui component
     */
    component:   PropTypes.func.isRequired,

    /**
     * The onchange
     */
    onChange:    PropTypes.func,
  };

  onChange = (value, fieldId) =>
  {
    const { field } = this.props;
    this.props.onChange(value, field);
  };

  render()
  {
    const { field } = this.props;
    return React.cloneElement(this.props.component, { id: field.key, onChange: this.onChange });
  }
}
