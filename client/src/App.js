import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import Causes from './pages/Causes';
import CreateAccount from './pages/CreateAccount';
// import Donation from './pages/Donation';
import Impact from './pages/Impact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Review from './pages/Review';
import Splash from './pages/Splash';
import NoMatch from './pages/NoMatch';
import PasswordReset from './pages/PasswordReset';
import GetResetToken from './pages/GetResetToken';
import Search from './pages/Search';
import ConfirmEmail from './pages/ConfirmEmail';
import Matches from './pages/OrgMatches';
import ThankYou from './pages/ThankYou';
class App extends Component {
  constructor (props) {
    super(props);

    this.state = {
      authenticated: true
    };
  }
  ProtectedRoute = ({ auth, ...props }) => {
    // API.test()
    //   .then(res => {
    //     this.setState({ authenticated: true });
    //   })
    //   .catch(() => {
    //     this.setState({ authenticated: false });
    //   });
    return this.state.authenticated
      ? (<Route {...props} />)
      : (<Redirect to="/login" />);
  };

  render () {
    return (
      <Router>
        <div>
          <Switch>
            {/* After we create logout ability, we can use the code below to render the splash page only if the user is logged out */}
            {/* { API.test() && <Route exact path="/" component={Dashboard} /> }
            { !API.test() && <Route exact path="/" component={Splash} /> } */}

            {/* Get rid of route below, uncomment routes above after we create logout ability */}
            <Route exact path="/" component={Splash} />
            <Route exact path="/login">
              <Login authHandler={this.authHandler} />
            </Route>

            <Route exact path="/create" component={CreateAccount} />

            {/* Test authentication before rendering Dashboard */}
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/impact" component={Impact} />
            <Route exact path="/causes" component={Causes} />
            <Route exact path="/search" component={Search} />
            <Route exact path="/matches" component={Matches} />
            <Route exact path="/review" component={Review} />
            {/* <Route exact path="/donation" component={Donation} /> */}
            <Route exact path="/thank-you" component={ThankYou} />
            <Route exact path='/reset' component={GetResetToken} />
            <Route path="/reset/:jsontoken" component={PasswordReset}/>
            <Route path='/emailConfirm/:jsontoken' component={ConfirmEmail} />

            <Route component={NoMatch} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
