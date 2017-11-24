import React from 'react';
import PropTypes from 'prop-types';

export class ScreenSettings extends React.Component
{
  static propTypes = {
    finishInstall: PropTypes.func.isRequired,
    installType: PropTypes.string.isRequired,
    settings: PropTypes.array.isRequired,
    values: PropTypes.array.isRequired,
    settingsForm: PropTypes.func.isRequired,
    dpapp: PropTypes.object.isRequired
  };

  onSettings(settings)
  {
    const { oauth } = this.props.dpapp;
    const { finishInstall } = this.props;
    const providerName = 'jira';

    // retrieve the oauth proxy settings for jira
    oauth.settings(providerName, { protocolVersion: '1.0' })
      .then(oauthSettings => {
        const connectionProps = {
          providerName,
          urlRedirect: oauthSettings.urlRedirect,
          urlAuthorize: `${settings.jiraInstanceUrl}/plugins/servlet/oauth/authorize`,
          urlAccessToken: `${settings.jiraInstanceUrl}/plugins/servlet/oauth/access-token`,
          urlTemporaryCredentials: `${settings.jiraInstanceUrl}/plugins/servlet/oauth/request-token`,
          urlResourceOwnerDetails: '',
          clientId: `${settings.jiraClientId}`,
          clientSecret: '',
          rsaPrivateKey: settings.rsaPrivateKey,
          rsaPublicKey: settings.rsaPublicKey
        };
        return oauth.register(providerName, connectionProps).then(() => connectionProps);
      })
      .then((connectionProps) => {
        return oauth.access(providerName, { protocolVersion: '1.0' })
          .then(({oauth_token, oauth_token_secret}) => ({ ...connectionProps, token: oauth_token, tokenSecret: oauth_token_secret}))
        ;
      })
      .then(connectionProps => {
        // register again the connection, this time with the token
        return oauth.register('jira', connectionProps);
      })
      .then(() => {
        return finishInstall(settings).then(({ onStatus }) => onStatus());
      })
      .catch(err => {}) // TODO display errors
  ;
  }

  render()
  {
    const { settings, values, finishInstall, settingsForm: SettingsForm } = this.props;

    if (settings.length) {
      let formRef;
      return (
        <div className={'settings'}>
          <SettingsForm settings={settings} values={values} ref={ref => formRef = ref} onSubmit={this.onSettings.bind(this)} />
          <button className={'btn-action'} onClick={() => formRef.submit()}>Update Settings</button>
        </div>
      );
    }

    finishInstall(null).then(({ onStatus }) => onStatus());
    return null;
  }
}

