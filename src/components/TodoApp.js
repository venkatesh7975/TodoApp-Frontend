import React, { Component } from 'react';
import Home from './Home';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';

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
    Cookies.remove('jwtToken'); // Remove JWT from cookies
    this.setState({ isLogged: false });
  };


  componentDidMount() {
    const { userId } = this.props;
    const { jwtToken } = this.state;

    if (!userId || !jwtToken) {
      return;
    }

    fetch(`http://localhost:4001/tasks/${userId}`, {
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

    fetch("http://localhost:4001/tasks", options)
      .then(response => {
        if (!response.ok) {
          throw new Error("Task creation failed");
        }
        return response.json();
      })
      .then(jsonData => {
        console.log("Task created successfully");
        const newTask = { id: jsonData.task_id, user_id: userId, task, isChecked: false };
        this.setState({ tasks: [...tasks, newTask], task: '', errorMessage: '' });
      })
      .catch(error => {
        alert("Task creation failed");
        console.error("Task creation Error:", error);
      });
  };

  onDelete = (taskId) => {
    const { tasks, jwtToken } = this.state;
  
    fetch(`http://localhost:4001/tasks/${taskId}`, {
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
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        this.setState({ tasks: updatedTasks });
      })
      .catch(error => {
        alert("Task deletion failed");
        console.error("Task deletion Error:", error);
      });
  };
  onTaskCheck = (taskId, isChecked) => {
    const { tasks ,jwtToken} = this.state;
    fetch(`http://localhost:4001/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization:`Bearer ${jwtToken}`,
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
          if (task.id === taskId) {
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
          <div className="container" style={{ maxWidth: '50%', wordWrap: 'break-word' }}>
            
            <div className='row'>
              <div  className="col-12 col-lg-12 col-md-12 col-sm-12 col-xl-12">
            <div className='d-flex justify-content-end'>
            <button onClick={this.onLogout} className="btn btn-primary mb-2">Logout</button>
            </div>
            <h1 className='m-2'>Todo List Application</h1>
            <div className="row align-items-center" >
              <div className="col">
                <input type="text" className="form-control" placeholder="Enter the task" value={task} onChange={this.onTaskChange} />
              
              </div>
              <div className="col-auto">
                <button type="submit" onClick={this.onAdd} className="btn btn-primary">Add</button>
              </div>
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
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <ul className="list-group mt-3">
              {filteredTasks.map((taskObj, index) => (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={index} style={{ cursor: 'pointer' }} data-toggle="tooltip" title="Click to delete">
                  <div style={{ maxWidth: '80%', overflow: 'hidden', wordWrap: 'break-word' }}>
                    <input
                      type="checkbox"
                      checked={taskObj.isChecked}
                      onChange={() => this.onTaskCheck(taskObj.id, !taskObj.isChecked)}
                    />
                    {taskObj.task}
                  </div>
                  <div>
                    <FontAwesomeIcon icon={faTrashAlt} onClick={() => this.onDelete(taskObj.id)} />
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
