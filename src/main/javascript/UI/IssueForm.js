import React from 'react';
import PropTypes from 'prop-types';

import { Form, Container, Group, Label, Input, HiddenFields  } from '@deskpro/react-components';

import { SelectAdapter, SubmitButton, IssueField, DisplayField } from '../UI';
import { IssueFieldMapper } from '../IssueFields';

export class IssueForm  extends React.Component
{

  static get ACTIONTYPE_EDIT() { return 'edit'; }

  static get ACTIONTYPE_CREATE() { return 'create'; }

  static createRenderDisplay()
  {
    return function({ value, name }) {
      return (<DisplayField value={ value } name={name} />);
    }
  }

  static createRenderSelect(options)
  {
    return function({ name, value, onChange }) {
      return (<SelectAdapter
        id={name}
        name={name}
        value={ value }
        options={ options }
        onChange={ onChange }
      />);
    }
  }

  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,

    values: PropTypes.object.isRequired,

    primaryFields: PropTypes.array.isRequired,
    secondaryFields: PropTypes.array.isRequired,

    renderProject: PropTypes.func.isRequired,
    renderIssueType: PropTypes.func.isRequired,

    actionType: PropTypes.string.isRequired
  };

  static defaultProps = { actionType: IssueForm.ACTIONTYPE_CREATE };

  render()
  {
    const { primaryFields, secondaryFields, onSubmit, onChange, values } = this.props;

    return (

      <Form name="create_issue" onSubmit={onSubmit}>

        <Group label="Project" >
          {
            this.props.renderProject({
              name: "project",
              value: values.project,
              onChange
            })
          }
        </Group>

        <Group label="Issue Type" >
          {
            this.props.renderIssueType({
              name: "issuetype",
              value: values.issuetype,
              onChange
            })
          }
        </Group>

        {
          primaryFields.filter(({ key }) => -1 === ['project', 'issuetype'].indexOf(key))
            .map(field => this.renderField(field))
        }

        <HiddenFields opened={false} labelShow={"Show all fields"} labelHide={"Show only required fields"}>
          {
            secondaryFields.filter(({ key }) => -1 === ['project', 'issuetype'].indexOf(key))
              .map(field => this.renderField(field))
          }
        </HiddenFields>
        <br/>
        { this.renderFormControls() }

      </Form>

    );
  }

  renderFormControls()
  {
    return (
      <SubmitButton> {  this.props.actionType === IssueForm.ACTIONTYPE_CREATE ? 'Create' : 'Edit'  } </SubmitButton>
    );
  }

  renderField(field)
  {
    const { key: id, name: label } = field;
    const { values, onChange } = this.props;

    const formComponent = IssueFieldMapper.toFormComponent(field, values[field.key]);
    if (!formComponent) {
      return null;
    }

    return (
      <Group key={`field-group-${id}`} label={label} >
        <IssueField component={formComponent} field={field} onChange={onChange} />
      </Group>
    );
  }

}
