import React from 'react';
import PropTypes from 'prop-types';

import { IssueForm } from '../UI';
import { Routes } from '../App';
import { createLinkJiraIssueAction } from '../LinkIssues';
import { createCreateJiraIssueAction } from '../CreateIssue';
import { FieldUtils } from '../IssueFields';

export class TabCreateIssue  extends React.Component
{
  static get className() {  return TabCreateIssue.prototype.constructor.name }

  static propTypes = {

    comment: PropTypes.string,

    route:   PropTypes.object.isRequired,

    dispatch:   PropTypes.func.isRequired
  };

  static contextTypes = {

    loadJiraCreateMeta: PropTypes.func.isRequired,

    ticket: PropTypes.func.isRequired
  };

  constructor(props)
  {
    super(props);
    this.init();
  }

  init()
  {
    this.state = {
      projects: [],
      issueTypes: [],
      primaryFields: [],
      secondaryFields: [],
      values: {}
    }
  }

  componentDidMount()
  {
    const {
      /** @type {function():Promise} */ loadJiraCreateMeta
    } = this.context;

    loadJiraCreateMeta()
      .then(createMeta => {

        const projects = createMeta.getProjectList();
        const issueTypes = createMeta.getIssueTypeList(projects[0]);
        const values = { project: projects[0], issuetype: issueTypes[0], summary: this.props.comment || "" };

        return { projects, issueTypes, values };
      })
      .then(state => {
        const { project, issueType } = state.values;
        return this.loadFieldDefinitions(project, issueType).then(fields => ({ ...state, ...fields }));
      })
      .then(this.setState.bind(this))
      .catch(e => { console.log('error loading jira createMeta ', e); })
    ;
  }

  /**
   * @param {*} value
   * @param {Object} field
   */
  onFieldChange(value, field)
  {
    let setStatePromise;

    if ('project' === field) {
      setStatePromise = this.loadFieldDefinitions(value).then(state => {
        const values = { project: value, issuetype: state.issueTypes.length ? state.issueTypes[0] : null };
        return { ...state, values };
      });
    } else if ('issuetype' === field) {
      const { project } = this.state.values;
      setStatePromise = this.loadFieldDefinitions(project, value).then(state => {
        const values = { project, issuetype: value };
        return { ...state, values };
      });
    } else {

      const values = { ...this.state.values, [field.key]: value };
      setStatePromise = Promise.resolve({ values })
    }

    setStatePromise.then(state => {
      this.setState({...this.state, ...state })
    });
  }

  loadFieldDefinitions(project, issueType)
  {
    const {
      /** @type {function():Promise} */ loadJiraCreateMeta
    } = this.context;

    return loadJiraCreateMeta()
      .then(createMeta => {

        const issueTypes = issueType ? null : createMeta.getIssueTypeList(project);
        const nextIssueType = issueType || issueTypes[0];
        const fields = createMeta.getFieldLists(project, nextIssueType);

        const primaryFields = fields.filter(({ required }) => required );
        const secondaryFields = fields.filter(({ required }) => !required );

        return { primaryFields, secondaryFields };
      })
    ;
  }

  onSubmit()
  {
    const { values } = this.state;
    let model = JSON.parse(JSON.stringify(values));

    const {
      /** @type {function} */ ticket,
    } = this.context;

    const { /** @type {{to:function}} */ route, dispatch } = this.props;

    dispatch(createCreateJiraIssueAction(model))
      .then(issue => dispatch(createLinkJiraIssueAction(issue, ticket())))
      .then(() => route.to(Routes.linkedIssues));
  }

  render()
  {
    const { projects, issueTypes, primaryFields, secondaryFields, values } = this.state;

    return (<IssueForm
      onChange = { TabCreateIssue.prototype.onFieldChange.bind(this) }
      onSubmit = { TabCreateIssue.prototype.onSubmit.bind(this) }

      renderProject={IssueForm.createRenderSelect(projects)}
      renderIssueType={IssueForm.createRenderSelect(issueTypes)}

      primaryFields = { primaryFields }
      secondaryFields = { secondaryFields }
      values = {values}
    />);
  }
}
