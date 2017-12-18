const ACTION_UPDATE_ISSUE = 'update-issues';
const ACTION_CREATE_ISSUE = 'create-issues';

export function reducer(state, action)
{
  const { type } = action;
  if (type === ACTION_UPDATE_ISSUE) {
    const { foundIssues } = action;
    return { ...state, foundIssues: foundIssues || [] };
  }

  return state;
}

export function createCreateJiraIssueAction(fields)
{
  /**
   * @param {function} dispatch
   * @param {JiraService} jiraService
   * @return {*}
   */
  const action = ({ dispatch, jiraService }) => {
    return jiraService.createIssue(fields)
      .then(({ key }) => jiraService.readIssue(key))
      .then(issue => {
        dispatch({
          type: ACTION_CREATE_ISSUE,
          issue: issue,
        });
        return issue;
      });
  };

  return action;
}

export function createUpdateJiraIssueAction(issue, fields)
{
  /**
   * @param {function} dispatch
   * @param {JiraService} jiraService
   * @return {*}
   */
  const action = ({ dispatch, jiraService }) => {
    return jiraService.updateIssue(issue, fields).then(issue => {
      dispatch({
        type: ACTION_UPDATE_ISSUE,
        issue: issue,
      })

    });
  };

  return action;
}
