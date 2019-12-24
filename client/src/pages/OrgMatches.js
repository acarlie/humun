import React, { Component } from 'react';
import { Button, Header, Message } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import ThemeContainer from './../components/ThemeContainer';
import ThemeBody from './../components/ThemeBody';
import AllocationsCard from './../components/AllocationsCard';
import API from './../utils/Api';

class OrgMatches extends Component {
  constructor (props) {
    super(props);

    this.state = {
      redirect: false,
      redirectLoc: '',
      allocationsArr: false,
      allocations: false
    };
  }

  componentDidMount () {
    this.checkLogin();
    API
      .allocation()
      .then(res => {
        const allocationsArr = Object.values(res.data.user.allocations).filter((x) => x.category !== 'userSelected');
        this.setState({
          allocations: res.data.user.allocations,
          allocationsArr
        });
      });
  }

  checkLogin () {
    API
      .test()
      .then(res => {
      })
      .catch(() => {
        this.setState({ splashRedirect: true });
      });
  }

    handleOrgMatches = (redirect) => {
      // if OrgMatches is approved redirect to matches page
      this.setRedirect(redirect);
    }

    setRedirect = (redirect) => {
      this.setState({
        redirect: true,
        redirectLoc: redirect
      });
    }

    renderRedirect = () => {
      if (this.state.redirect) {
        return <Redirect to={this.state.redirectLoc} />;
      }
    }

    render () {
      if (this.state.splashRedirect) {
        return <Redirect push to="/" />;
      }
      return (
        <div>
          { this.renderRedirect() }
          <ThemeContainer text='Congratulations!'>

            <ThemeBody>
              <Header as='h3' dividing>
                We’ve matched you to these organizations:
              </Header>
              {/* Map through all of charities in the state and display them onto the page */}
              <div>
                {
                  this.state.allocationsArr &&
                  this.state.allocationsArr.map((charity, i) => {
                    return (
                      <AllocationsCard charity={charity} key={i} />
                    );
                  })
                }
              </div>
              <Header as='h3' dividing>
                Custom Charity Allocation
              </Header>
              {
                this.state.allocations.userSelected &&
                <AllocationsCard charity={this.state.allocations.userSelected} key={this.state.allocations.userSelected.ein} />
              }
              <Message info>
                {this.state.allocations.userSelected && <p>You currently have chosen {this.state.allocations.userSelected.name} to receive a portion of your contribution. You may select one custom charity at a time. If you would like to change your charity, click the button below:</p>}
                {!this.state.allocations.userSelected && <p>If you would like, you can specify one charity to receive a portion of your contribution.</p>}
                <Button basic fluid color='teal' href='/search'>Search Charities</Button>
              </Message>
              <Button basic type='submit' onClick={() => this.handleOrgMatches('/review')} content='To Review' icon='right arrow' labelPosition='right' fluid />
            </ThemeBody>
          </ThemeContainer>
        </div>
      );
    }
}

export default OrgMatches;
