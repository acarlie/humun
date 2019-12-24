import React, { Component } from 'react';
import { Header, Button, Accordion, Icon } from 'semantic-ui-react';
import bg from './../assets/images/bg.jpeg';
import SplashTemplate from './../components/SplashTemplate';

class Splash extends Component {
  constructor (props) {
    super(props);

    this.state = {
      showMore: true,
      activeIndex: -1
    };
  }

  handleAccordion = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  }

  render () {
    return (
      <SplashTemplate
        title='humun'
        titleSize='large'
        bgImage={bg}
        blendMode='hard-light'
      >
        <p style={{ color: 'white' }}>Humun is an app that empowers you to contribute in the most effective ways to the causes you care about, and makes it easier than ever to maintain and enhance your positive impact over time.</p>

        <Accordion fluid inverted style={{ marginBottom: '1em', color: 'white' }}>
          <Accordion.Title
            active={this.state.activeIndex === 0}
            index={0}
            onClick={this.handleAccordion}
          >
            <Icon name='dropdown' />
            About Humun
          </Accordion.Title>
          <Accordion.Content active={this.state.activeIndex === 0}>
            <p>
              By automating the process of finding and donating to quaility charities that match your values, you can ensure you are doing the most good that you can, while saving time and effort.
            </p>
            <p>
              After answering some basic questions about your values, you will be paired with charities in different impact areas that match your priorities.
            </p>
            <p>
              Charities are vetted for efficicacy and will be updated over time if either more effective charities, or charities that better match your prioirities, are added.
            </p>
            <p>
              If there is an organization you would particularly like to support, you can also select a charity to donate to alongside the automatic recommendations.
            </p>
            <p>
              Click 'Create an Account' below to get started!
            </p>
          </Accordion.Content>
        </Accordion>
        <Button href='/create' fluid basic inverted>Create an Account</Button>
        <Header as='h6' floated='right' style={{ marginTop: '1em' }}>
          <a href='/login' style={{ color: 'white' }}>Already a member? Login →</a>
        </Header>
      </SplashTemplate>
    );
  }
}

export default Splash;
