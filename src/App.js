/* src/App.js */
import React, { useEffect, useState } from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { createTodo, deleteTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: "", description: "" };

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log("error fetching todos");
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await API.graphql(graphqlOperation(createTodo, { input: todo }));
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  async function deleteMyTodo(id) {
    try {
      const filteredTodos = todos.filter((item) => item.id !== id);
      setTodos(filteredTodos);
      await API.graphql(graphqlOperation(deleteTodo, { input: { id } }));
    } catch (err) {
      console.log("error deleting todo:", err.msg);
    }
  }

  return (
    <div style={styles.container}>
      <h2>Todos</h2>
      <input
        onChange={(event) => setInput("name", event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={(event) => setInput("description", event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} onClick={addTodo}>
        Create Todo
      </button>
      {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} style={styles.todo}>
          <p style={styles.todoName}>{todo.name}</p>
          <p style={styles.todoDescription}>{todo.description}</p>
          <button
            style={styles.deleteButton}
            onClick={() => deleteMyTodo(todo.id)}
          >
            Delete Todo
          </button>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  todo: {
    marginBottom: 15,
    display: "flex",
    background: "#ffffff",
    height: "50px",
    padding: "5px 10px",
    borderRadius: "0px",
    marginTop: "10px",
    borderBottom: "2px solid #d1d3d4",
  },
  input: {
    border: "1px solid grey",
    backgroundColor: "white",
    borderRadius: "3px",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 10 },
  button: {
    backgroundColor: "#ff9900",
    color: "white",
    outline: "none",
    border: "none",
    fontSize: 18,
    padding: "12px 0px",
    minWidth: "120px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#ff9900",
    color: "white",
    outline: "none",
    border: "none",
    fontSize: 18,
    padding: "12px 0px",
    minWidth: "120px",
    marginLeft: "auto",
    order: "2",
    cursor: "pointer",
  },
};

export default withAuthenticator(App);
