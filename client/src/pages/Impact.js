import React, { Component } from 'react';
import { Form, Button } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import ThemeContainer from './../components/ThemeContainer';
import ThemeBody from './../components/ThemeBody';
import ThemeSegment from './../components/ThemeSegment';
import ThemeSlider from './../components/ThemeSlider';
import API from './../utils/Api';

class Impact extends Component {
  constructor (props) {
    super(props);
    this.state = {
      redirect: false,
      splashRedirect: false,
      impactLoc: [3],
      shortVlongTerm: [3]
    };
  }

  componentDidMount () {
    this.checkLogin();
    API
      .get()
      .then(res => {
        const { profileData } = res.data.user;
        this.setState({
          impactLoc: [profileData.impactLoc],
          shortVlongTerm: [profileData.shortVlongTerm],
          profileData
        });
      });
  }

  checkLogin () {
    API.test()
      .then(res => {
      })
      .catch(() => {
        this.setState({ splashRedirect: true });
      });
  }

  handleChange = (key, value) => {
    this.setState({
      [key]: value
    });
  }

  handleImpacts = () => {
    const { impactLoc, shortVlongTerm, profileData } = this.state;
    const profile = { ...profileData };
    profile.impactLoc = impactLoc[0];
    profile.shortVlongTerm = shortVlongTerm[0];

    API
      .post({
        impactsSetUp: true,
        profileData: profile
      })
      .then(() => {
        this.setRedirect();
      })
      .catch(err => console.log(err));
  }

  setRedirect = () => {
    this.setState({
      redirect: true
    });
  }

  render () {
    return (
      <div>
        {this.state.redirect && <Redirect to='/causes' />}
        {this.state.splashRedirect && <Redirect push to="/" />}
        <ThemeContainer text='Your Impact'>
          <ThemeBody>
            <Form>
              <ThemeSegment title='Is it more important to make a significant impact near you or greater a global impact?'>
                <ThemeSlider stateKey='impactLoc' value={this.state.impactLoc} stateHandler={this.handleChange} leftLabel='local' rightLabel='global' />
              </ThemeSegment>
              <ThemeSegment title='Is it more important to achieve guaranteed smaller effects in the near-term or work toward potentially larger effects in the long-term?'>
                <ThemeSlider stateKey='shortVlongTerm' value={this.state.shortVlongTerm} stateHandler={this.handleChange} leftLabel='short-term' rightLabel='long-term' />
              </ThemeSegment>
              <Button basic type='submit' onClick={this.handleImpacts} content='Your Causes' icon='right arrow' labelPosition='right' fluid />
            </Form>
          </ThemeBody>
        </ThemeContainer>
      </div>
    );
  }
}

export default Impact;
