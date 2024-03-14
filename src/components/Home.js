import React, { Component } from 'react';
import TodoApp from './TodoApp';
import Cookies from 'js-cookie';
import './Home.css'

export default class Home extends Component {
  state = { isLogged: false, username: '', password: '', userId: null, errorMessage: '', successMessage: '' };

  onRegister = () => {
    const { username, password } = this.state;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/; 
    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }
  
    let errorMessage = '';
    if (!passwordRegex.test(password)) {
      errorMessage = 'Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character';
      if (password.length >= 8) {
        errorMessage = 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character';
      }
    }
  
    if (errorMessage) {
      this.setState({ errorMessage, successMessage: '' }); 
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
  
    fetch(`${process.env.REACT_APP_API_URL}/register`, options)
      .then(response => {
        if (!response.ok) {
          throw new Error('User already exists');
        }
        return response.json();
      })
      .then(jsonData => {
        console.log('Registration successful');
        this.setState({ errorMessage: '', successMessage: 'Registration successful. Please login.' });
      })
      .catch(error => {
        const errorMessage = error.message || 'Registration failed';
        this.setState({ errorMessage, successMessage: '' }); 
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

    fetch(`${process.env.REACT_APP_API_URL}/login`, options)
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
    const { isLogged, userId, errorMessage, username ,successMessage} = this.state;
  
    return (
      <div>
        {isLogged && <TodoApp userId={userId} username={username} />}
        {!isLogged && (
          <div className="HomeContainer">
            <div className='container'>
              <div className="row d-flex justify-content-center">
                <div className="col-lg-6 col-md-8 col-sm-10 col-12 col-xl-4">
                  <div className='card' >
                    <div className='text-center'>
                      {!isLogged && (
                        <div>
                          <input type="text" className="form-control mb-2" placeholder="Username" onChange={this.onNameChange} />
                          <input type="password" className="form-control mb-2" placeholder="Password" onChange={this.onPasswordChange} />
                          <button type="submit" className="btn btn-primary btn-block mb-2 m-1" onClick={this.onRegister}>
                            Register
                          </button>
                          <button type="submit" className="btn btn-success btn-block mb-2 m-1" onClick={this.onLogin}>
                            Login
                          </button>
                          {errorMessage && <p className="text-danger">{errorMessage}</p>}
                          {successMessage && <p className="text-success">{successMessage}</p>}

                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

