import React from 'react';
import PropTypes from 'prop-types';

export class DisplayField extends React.PureComponent
{
  static propTypes = {
    value: PropTypes.any,
    name: PropTypes.string,
  };

  render()
  {
    const {value, name} = this.props;
    return (
      <div className="dp-input dp-input--readonly">
        <input name={name} className="jira-input--readonly" disabled="disabled" value={value ? value.name : ''}/>
      </div>

    );

  }
}
