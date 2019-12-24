import React, { Component } from 'react';
import API from './../utils/Api';
import { Grid, Header, Button, Form, Input, Message } from 'semantic-ui-react';
const { Row, Column } = Grid;

class Review extends Component {
  constructor (props) {
    super(props);

    this.state = {
      email: '',
      emailErr: null,
      redirect: false,
      resetSuccess: false
    };
  }

  componentDidMount () {
    // console.log(this.props.match.params.jsontoken);
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  getResetToken = () => {
    this.setState({ resetSuccess: false, emailErr: null });
    API.getResetToken({ email: this.state.email })
      .then(res => {
        // console.log(res);
        if (res.data.success) {
          this.setState({ resetSuccess: true });
          // need to add success alert before redirect
        } else {
          // add error alert
          res.data.errors.forEach(error => {
            if (error.email) {
              this.setState({ emailErr: { content: error.email, pointing: 'above' } });
            }
          });
        }
      });
  }

  render () {
    let resetSuccess;
    if (this.state.resetSuccess) {
      resetSuccess = <Message loginSuccess={true}
        success
        header='Email Sent'
        content='Please check your email for further instructions.'
      />;
    }
    return (
      <Grid verticalAlign="middle" centered stackable columns={3} style={{ height: '100vh' }}>
        <Row color='red'>
          <Column textAlign='center'>
            <Header as='h1' inverted>humun</Header>
            <p>Uh oh. Looks like you forgot your password. Please enter a valid email address below to send password reset email. Remember to check your spam.</p>
            <Form success>
              <Form.Field
                id='form-input-control-email'
                control={Input}
                label='Email'
                placeholder='name@example.com'
                required
                name='email'
                value={this.state.email}
                onChange={this.handleInputChange}
                error={this.state.emailErr}
              />
              {resetSuccess}
              <Button type='submit' onClick={this.getResetToken} primary fluid>Submit</Button>
            </Form>
          </Column>
        </Row>
      </Grid>
    );
  }
}

export default Review;
