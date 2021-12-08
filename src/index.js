const express = require("express");
const cors = require("cors");

const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAlreadyExists = users.find((user) => user.username === username);

  if (!userAlreadyExists) {
    return response.status(404).json({ error: "User does not exists." });
  }

  request.user = userAlreadyExists;

  return next();
}

function checksTodoExists(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const toDoAlreadyExists = user.todos.find((todo) => todo.id === id);
  if (!toDoAlreadyExists) {
    return response.status(404).json({ error: "To-do not found" });
  }

  request.todo = toDoAlreadyExists;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const verifyIfUserExists = users.find((user) => user.username === username);
  if (verifyIfUserExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: uuid(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  // if (!user.to_dos.length) {
  //     return response.status(200).json({ message: "No to-dos found." });
  // }

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const Todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline), // irá transformar a data passada em um objeto Date
    created_at: new Date(),
  };

  user.todos.push(Todo);

  return response.status(201).json(Todo); // quero retornar apenas a tarefa adicionada, e não todos os to-dos
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksTodoExists,
  (request, response) => {
    const { title, deadline } = request.body;
    const { todo } = request;

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.status(200).json(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksTodoExists,
  (request, response) => {
    const { todo } = request;

    todo.done = !todo.done; // faz um toggle

    return response.status(200).json(todo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksTodoExists,
  (request, response) => {
    const { user, todo } = request;

    user.todos.splice(todo, 1); // users.splice(users.indexOf(toDo), 1);

    // if (!user.to_dos.length) {
    //     return response
    //         .status(204)
    //         .json({ message: "No more to-dos found." });
    // }

    return response.status(204).json(); //json(user.to_dos)
  }
);

module.exports = app;
