import React, { Component } from 'react';
import Home from './Home';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import './TodoApp.css'

export default class TodoApp extends Component {
  state = {
    task: '',
    tasks: [],
    isLogged: true,
    errorMessage: '',
    filter: 'All',
    searchQuery: '',
    jwtToken: Cookies.get('jwtToken') || null,
  };

  onLogout = () => {
    Cookies.remove('jwtToken'); 
    this.setState({ isLogged: false });
  };

  componentDidMount() {
    const { userId } = this.props;
    const { jwtToken } = this.state;

    if (!userId || !jwtToken) {
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/tasks/${userId}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        return response.json();
      })
      .then(taskArray => {
        this.setState({ tasks: taskArray });
      })
      .catch(error => {
        console.error("Fetch tasks error:", error);
      });
  }

  onTaskChange = (event) => {
    this.setState({ task: event.target.value, errorMessage: '' });
  };

  onAdd = () => {
    const { task, tasks } = this.state;
    const { userId } = this.props;

    if (!userId) {
      alert("User not logged in");
      return;
    }

    if (!task.trim()) {
      this.setState({ errorMessage: 'Task cannot be empty' });
      return;
    }

    const jwtToken = Cookies.get('jwtToken');
    if (!jwtToken) {
      alert("User not logged in");
      return;
    }

    const data = { user_id: userId, task };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(data),
    };

    fetch(`${process.env.REACT_APP_API_URL}/tasks`, options)
      .then(response => {
        if (!response.ok) {
          throw new Error("Task creation failed");
        }
        return response.json();
      })
      .then(jsonData => {
        console.log("Task created successfully");
        const newTask = { _id: jsonData.task_id, user_id: userId, task, isChecked: false };
        this.setState({ tasks: [...tasks, newTask], task: '', errorMessage: '' });
      })
      .catch(error => {
        alert("Task creation failed");
        console.error("Task creation Error:", error);
      });
  };

  onDelete = (taskId) => {
    const { tasks, jwtToken } = this.state;
  
    fetch(`${process.env.REACT_APP_API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Task deletion failed");
        }
        return response.json();
      })
      .then(() => {
        console.log("Task deleted successfully");
        const updatedTasks = tasks.filter(task => task._id !== taskId);
        this.setState({ tasks: updatedTasks });
      })
      .catch(error => {
        alert("Task deletion failed");
        console.error("Task deletion Error:", error);
      });
  };

  onTaskCheck = (taskId, isChecked) => {
    const { tasks, jwtToken } = this.state;
    fetch(`${process.env.REACT_APP_API_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ isChecked }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update task status');
        }
        return response.json();
      })
      .then(() => {
        const updatedTasks = tasks.map(task => {
          if (task._id === taskId) {
            return { ...task, isChecked };
          }
          return task;
        });
        this.setState({ tasks: updatedTasks });
      })
      .catch(error => {
        console.error('Update task status error:', error);
      });
  };

  onFilterChange = (event) => {
    this.setState({ filter: event.target.value });
  };

  onSearchChange = (event) => {
    this.setState({ searchQuery: event.target.value });
  };

  render() {
    const { task, tasks, isLogged, errorMessage, filter, searchQuery } = this.state;
    let filteredTasks = tasks;
    const { username } = this.props;

    if (filter === 'Checked') {
      filteredTasks = tasks.filter(task => task.isChecked);
    } else if (filter === 'Unchecked') {
      filteredTasks = tasks.filter(task => !task.isChecked);
    }

    if (searchQuery.trim() !== '') {
      filteredTasks = filteredTasks.filter(task => task.task.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return (
      <div>
        {!isLogged && <Home />}
        {isLogged && (
          <div className="TodoContainer">
            <div>
              <div className='d-flex justify-content-end'>
                <h1 className="text-center message" >Welcome <em>{username}</em></h1>
                <button onClick={this.onLogout} className="btn btn-primary ml-2">Logout</button>
              </div>
              <div className="container TodoCard" >
                <h2 className='Heading'>Todo List Application</h2>
                <div className="row align-items-center">
                  <div className="col">
                    <input type="text" className="form-control" placeholder="Enter the task" value={task} onChange={this.onTaskChange} />
                  </div>
                  <div className="col-auto">
                    <button type="submit" onClick={this.onAdd} className="btn btn-primary">Add</button>
                  </div>
                </div>
                <div className='row align-items-center mt-2'>
                  <div className="col">
                    <select onChange={this.onFilterChange} className="form-select">
                      <option value="All">All</option>
                      <option value="Checked">Checked</option>
                      <option value="Unchecked">Unchecked</option>
                    </select>
                  </div>
                  <div className="col">
                    <div className="input-group">
                      <input type="text" className="form-control" placeholder="Search tasks" onChange={this.onSearchChange} />
                      <button className="btn btn-outline-secondary" type="button">
                        <FontAwesomeIcon icon={faSearch} />
                      </button>
                    </div>
                  </div>
                </div>
                {errorMessage && <p className='error'>{errorMessage}</p>}
                <ul className="list-group mt-3 list-card" >
                  {filteredTasks.map((taskObj, index) => (
                    <li className="list-group-item d-flex justify-content-between align-items-center list-card-container" key={index}>
                      <div className='task'>
                        <input
                          type="checkbox"
                          checked={taskObj.isChecked}
                          onChange={() => this.onTaskCheck(taskObj._id, !taskObj.isChecked)}
                          style={{ marginRight: '10px' }}
                        />
                        <span style={{ textDecoration: taskObj.isChecked ? 'line-through' : 'none' }}>{taskObj.task}</span>
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faTrashAlt} onClick={() => this.onDelete(taskObj._id)} style={{ cursor: 'pointer' }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
