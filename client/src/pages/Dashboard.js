import React, { Component } from 'react';
import { StyleSheet, css } from 'aphrodite';
import { Header, Segment, Grid, Button, Message } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import ThemeContainer from '../components/ThemeContainer';
import ThemeSegment from './../components/ThemeSegment';
import ThemeBody from '../components/ThemeBody';
import AllocationsChart from './../components/AllocationsChart';
import AllocationsCard from './../components/AllocationsCard';
import API from '../utils/Api';
import Payment from '../components/Paypal/payment';
const { Row, Column } = Grid;

class Dashboard extends Component {
  constructor (props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.confirmationEmail = this.confirmationEmail.bind(this);
    this.state = {
      userInfo: null,
      splashRedirect: false,
      emailConfirmationMessage: false,
      activeIndex: -1,
      allocationsArr: [],
      allocations: false,
      emailButton: true,
      emailButtonText: 'Send Confirmation Email'
    };
  }

  componentDidMount () {
    this.checkLogin();
    API
      .get()
      .then(res => {
        if (res.data.user.allocations) {
          const arr = Object.values(res.data.user.allocations);
          const allocationsArr = [...arr].sort((a, b) => {
            return b.portion - a.portion;
          });
          this.setState({
            userInfo: res.data.user,
            allocations: res.data.user.allocations,
            allocationsArr: allocationsArr
          });
        }
        this.setState({
          userInfo: res.data.user
        });
        if (!this.state.userInfo.emailSetUp) {
          this.setState({ emailConfirmationMessage: true });
        }
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

  confirmationEmail () {
    API.getEmailToken({ email: this.state.userInfo.email })
      .then(res => {
        if (res.data.success) {
          this.setState({ emailButton: false, emailButtonText: 'Email Sent! Check your inbox.' });
        }
      });
  }

  logout () {
    API.logout();
    this.checkLogin();
  }

  render () {
    const {
      firstName,
      causesSetUp,
      impactsSetUp
    } = { ...this.state.userInfo };

    if (this.state.splashRedirect) {
      return <Redirect push to="/" />;
    }

    const isSetUp = () => {
      if (causesSetUp && impactsSetUp) {
        return true;
      }
      return false;
    };

    return (
      <ThemeContainer>
        <Grid textAlign='center'>
          <Row>
            <Column className={css(styles.pt)}>
              <Header as='h6' className={css(styles.white)}>
              </Header>
            </Column>
          </Row>
        </Grid>
        <ThemeBody>
          <div>
            <Segment vertical>
              <Header as='h2' textAlign='center'>
                <Header.Content>Welcome {firstName}!</Header.Content>
              </Header>
            </Segment>
            <Segment vertical></Segment>
          </div>

          { !isSetUp() &&
            <div style={{ marginBottom: '1.25em' }}>
              <Message icon='exclamation' header='Finish Account Set Up' info attached='top' />
              <Message info attached='bottom'>
                <Button.Group fluid>
                  {!impactsSetUp && <Button basic color='teal' href='/impact'>Set Your Impacts</Button>}
                  {!causesSetUp && <Button basic color='teal' href='/causes'>Choose Your Causes</Button>}
                </Button.Group>
              </Message>
            </div>
          }
          {this.state.emailConfirmationMessage && <Message info>
            <p>You haven't confirmed your email yet.</p>
            <p><Button basic={this.state.emailButton} color='teal' fluid onClick={this.confirmationEmail}>{this.state.emailButtonText}</Button></p>
          </Message>}
          <ThemeSegment title='Allocations'>
            {this.state.allocations && <AllocationsChart allocations={this.state.allocations} />}
            <Button style={{ marginTop: '1em' }} basic color='blue' fluid href='/impact'>Adjust Allocations</Button>
          </ThemeSegment>
          <ThemeSegment title='Your Charities'>
            {
              this.state.allocationsArr.map((charity, i) => {
                return (
                  <AllocationsCard charity={charity} key={i} />
                );
              })
            }
            <Message info>
              {this.state.allocations.userSelected && <p>You currently have chosen {this.state.allocations.userSelected.name} to receive a portion of your contribution. You may select one custom charity at a time. If you would like to change your charity, click the button below:</p>}
              {!this.state.allocations.userSelected && <p>If you would like, you can specify one charity to receive a portion of your contribution.</p>}
              <Button basic fluid color='teal' href='/search'>Search Charities</Button>
            </Message>
          </ThemeSegment>
          <ThemeSegment title='Contributions'>
            <Payment />
          </ThemeSegment>

        </ThemeBody>
      </ThemeContainer>
    );
  }
}

const styles = StyleSheet.create({
  white: {
    color: 'white'
  },
  pt: {
    paddingTop: '2em'
  }
});

export default Dashboard;
