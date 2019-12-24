import React, { Component } from 'react';
import { Form, Button } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import ThemeSegment from './../components/ThemeSegment';
import ThemeContainer from './../components/ThemeContainer';
import ThemeBody from './../components/ThemeBody';
import ThemeSlider from './../components/ThemeSlider';
import ThemeSliderGroup from './../components/ThemeSliderGroup';
import ThemeSliderGroupContainer from './../components/ThemeSliderGroup/ThemeSliderGroupContainer';
import API from './../utils/Api';

const sliderSteps = 120;

class Causes extends Component {
  constructor (props) {
    super(props);

    this.state = {
      redirect: false,
      splashRedirect: false,
      environment: false,
      social: false,
      user: false,
      socialVenvironmental: [3]
    };
  }

  componentDidMount () {
    this.checkLogin();
    API
      .get()
      .then(res => {
        const { socialVenvironmental } = res.data.user.profileData;
        this.setState({
          socialVenvironmental: [socialVenvironmental],
          user: res.data.user.profileData
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

  handleChange = (key, result) => {
    this.setState({
      [key]: result
    });
  }

  addToObj = (obj, location, objToAdd) => {
    const keys = Object.keys(objToAdd);
    for (const x of keys) {
      obj[location][x] = objToAdd[x];
    }
    return obj;
  }

  handleCauses = () => {
    const { environment, social, socialVenvironmental, user } = this.state;
    const dataToAdd = {
      ...environment,
      ...social,
      socialVenvironmental: socialVenvironmental[0]
    };

    const originalObj = {
      profileData: {
        ...user
      },
      causesSetUp: true
    };

    const obj = this.addToObj(originalObj, 'profileData', dataToAdd);

    API
      .post(obj)
      .then(() => this.setRedirect())
      .catch(err => console.log(err));
  }

  setRedirect = () => {
    this.setState({
      redirect: true
    });
  }

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to='/matches' />;
    }
  }

  render () {
    if (this.state.splashRedirect) {
      return <Redirect push to="/" />;
    }
    return (
      <div>
        {this.renderRedirect()}
        <ThemeContainer text='Your Causes'>
          <ThemeBody>
            <Form>
              <ThemeSegment title='Are social or environmental issues more important to you?'>
                <ThemeSlider stateKey='socialVenvironmental' value={this.state.socialVenvironmental} stateHandler={this.handleChange} leftLabel='social' rightLabel='environmental' />
              </ThemeSegment>

              <ThemeSegment title='Which environmental issues do you care most about?'>
                <ThemeSliderGroupContainer>
                  <ThemeSliderGroup values={['pollution', 'habitat', 'climateChange']} userValues={this.state.user} titles={['Pollution Prevention & Clean-up', 'Habitat Preservation & Biodiversity', 'Climate Change Mitigation']} stateKey='environment' stateHandler={this.handleChange} steps={sliderSteps}/>
                </ThemeSliderGroupContainer>
              </ThemeSegment>

              <ThemeSegment title='Which social issues do you care most about?'>
                <ThemeSliderGroupContainer>
                  <ThemeSliderGroup values={['basicNeeds', 'education', 'globalHealth']} userValues={this.state.user} titles={['Basic Needs (Nutrition, Shelter, Safety, Water)', 'Education & Opportunity', 'Global Health']} stateKey='social' stateHandler={this.handleChange} steps={sliderSteps}/>
                </ThemeSliderGroupContainer>
              </ThemeSegment>
              <Button basic type='submit' onClick={this.handleCauses} content='View Your Matches' icon='right arrow' labelPosition='right' fluid />
            </Form>
          </ThemeBody>
        </ThemeContainer>
      </div>
    );
  }
}

export default Causes;
