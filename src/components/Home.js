import React, { Component } from 'react';
import TodoApp from './TodoApp';
import Cookies from 'js-cookie';

export default class Home extends Component {
  state = { isLogged: false, username: '', password: '', userId: null, tasks: [], errorMessage: '' };

  onRegister = () => {
    const { username, password } = this.state;
    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }

    const data = { username, password };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    };

    fetch('http://localhost:4001/register', options)
      .then(response => {
        if (!response.ok) {
          throw new Error('User already existed');
        }
        return response.json();
      })
      .then(jsonData => {
        console.log('Registration successful');
        this.setState({ errorMessage: '' }); // Reset error message
      })
      .catch(error => {
        const errorMessage = error.message || 'Registration failed';
        this.setState({ errorMessage });
        console.error('Registration Error:', error);
      });
  };

  onLogin = () => {
    const { username, password } = this.state;
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    const data = { username, password };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    };

    fetch("http://localhost:4001/login", options)
      .then(response => {
        if (!response.ok) {
          throw new Error("Login failed");
        }
        return response.json();
      })
      .then(jsonData => {
        Cookies.set('jwtToken', jsonData.jwtToken, { expires: 1 });
        this.setState({ isLogged: true, userId: jsonData.user_id });
        console.log("Login successful");
        console.log(this.state.userId)
      })
      .catch(error => {
        const errorMessage = error.message || 'Login failed';
        this.setState({ errorMessage });
        console.error("Login Error:", error);
      });
  };

  onNameChange = event => {
    this.setState({ username: event.target.value });
  };

  onPasswordChange = event => {
    this.setState({ password: event.target.value });
  };

  render() {
    const { isLogged, userId, errorMessage } = this.state;
    return (
      <div >
        <div>{isLogged && <TodoApp userId={userId} />}</div>
        <div className='container'>
        <div className="row d-flex justify-content-center">
          <div className="col-lg-6 col-md-8 col-sm-10 col-12 col-xl-4">
            
            <div className='text-center'>
              <center>
                {!isLogged && (
                  <div>
                    <input type="text" className="form-control mb-2 m-auto" placeholder="username" onChange={this.onNameChange} />
                    <input type="password" className="form-control mb-2 m-auto" placeholder="Password" onChange={this.onPasswordChange} />
                    <button type="submit" className="btn btn-primary btn-block mb-2  m-1" onClick={this.onRegister}>
                      Register
                    </button>
                    <button type="submit" className="btn btn-success btn-block mb-2  m-1" onClick={this.onLogin}>
                      Login
                    </button>
                    {errorMessage && <p className="text-danger">{errorMessage}</p>}
                  </div>
                )}
              </center>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }
}
