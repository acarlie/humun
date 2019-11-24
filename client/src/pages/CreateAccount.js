import React, { Component } from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import ThemeHeader from './../components/ThemeHeader';
import ThemeBody from './../components/ThemeBody';
import API from '../utils/Api';

class CreateAccount extends Component {
  constructor (props) {
    super(props);

    this.state = {
      redirect: false,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      password2: '',
      email2: '',
      password3: '',
      fNameErr: null,
      lNameErr: null,
      emailErr: null,
      pwErr: null,
      pw2Err: null,
      createAccountSuccess: false
    };
  }

    handleCreate = () => {
      this.setState({ fNameErr: null, lNameErr: null, emailErr: null, pwErr: null, pw2Err: null });
      const { firstName, lastName, email, password, password2 } = this.state;
      API.register({ firstName, lastName, email, password, password2 })
        .then(res => {
          if (res.data.errors) {
            res.data.errors.forEach(error => {
              if (error.firstName) {
                this.setState({ fNameErr: { content: error.firstName, pointing: 'below' } });
              }
              if (error.lastName) {
                this.setState({ lNameErr: { content: error.lastName, pointing: 'below' } });
              }
              if (error.email) {
                this.setState({ emailErr: { content: error.email, pointing: 'below' } });
              }
              if (error.password) {
                this.setState({ pwErr: { content: error.password, pointing: 'below' } });
              }
              if (error.password2) {
                this.setState({ pw2Err: { content: error.password2, pointing: 'below' } });
              }
            });
          } else if (res.data.success) {
            this.setState({ createAccountSuccess: true });
            const that = this;
            setTimeout(function () {
              that.setRedirect();
            }, 200);
            // this.props.history.push('/impact')
          } else {
            console.log(res.data);
          }
        })
        .catch(err => console.log(err));
      // if successfully created redirect to impacts page
    }

    handleInputChange = event => {
      const { name, value } = event.target;
      this.setState({
        [name]: value
      });
    };

    setRedirect = () => {
      this.setState({
        redirect: true
      });
    }

    renderRedirect = () => {
      if (this.state.redirect) {
        return <Redirect to='/login' />;
      }
    }

    render () {
      let createAccountSuccess;
      if (this.state.success) {
        createAccountSuccess = <Form success createAccountSuccess={true}>
          <Message
            success
            header='Account created successfully'
            content="You will now be redirected"
          />
        </Form>;
      }
      return (
        <div>
          { this.renderRedirect() }
          <ThemeHeader text='Create an Account' />
          <ThemeBody>
            <Form>
              <Form.Field
                id='form-input-control-first-name'
                control={Input}
                label='First name'
                placeholder='First name'
                name='firstName'
                value={this.state.firstName}
                onChange={this.handleInputChange}
                error={this.state.fNameErr}
                // required
              />
              <Form.Field
                id='form-input-control-last-name'
                control={Input}
                label='Last name'
                placeholder='Last name'
                name='lastName'
                value={this.state.lastName}
                onChange={this.handleInputChange}
                error={this.state.lNameErr}
                // required
              />
              <Form.Field
                id='form-input-control-email'
                control={Input}
                label='Email'
                placeholder='name@example.com'
                name='email'
                value={this.state.email}
                onChange={this.handleInputChange}
                error={this.state.emailErr}
                // required
              />
              <Form.Field
                id='form-input-control-pw'
                control={Input}
                label='Password'
                placeholder='******'
                name='password'
                type='password'
                value={this.state.password}
                onChange={this.handleInputChange}
                error={this.state.pwErr}
                // required
              />
              <Form.Field
                id='form-input-control-pw2'
                control={Input}
                label='Confirm Password'
                placeholder='******'
                name='password2'
                type='password'
                value={this.state.password2}
                onChange={this.handleInputChange}
                error={this.state.pw2Err}
                // required
              />
              {createAccountSuccess}
              <Button type='submit' onClick={this.handleCreate} primary fluid>Submit</Button>
            </Form>
          </ThemeBody>
        </div>
      );
    }
}

export default CreateAccount;
