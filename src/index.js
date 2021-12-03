const express = require('express');
const cors = require('cors');
const uuid = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

class User {
  id; // precisa ser um uuid
	name;
	username;
	todos = [];

  constructor (name, username, todos){
    if (!this.id){
      this.id = uuid.v1();
    }
    this.name = name;
    this.username = username;
    this.todos = todos;
  }
};

class ToDo {
  id;
  title;
  done;
  deadline;
  created_at;

  constructor(title, deadline, done = false){
    if (!this.id){
      this.id = uuid.v1();
    }
    this.title = title;
    this.done = done;
    this.deadline = new Date(deadline);
    this.created_at = new Date();
  }

 setDone(done) {
    this.done = done;
  }
  setDeadline(deadline) {
    this.deadline = deadline;
  }
  setTitle(title) {
    this.title = title;
  }
}

//DATABASE
const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find((user)=>(user.username === username));

  if(!user){
    return response.status(404).json({error: "User not found"});
  }
  request.user = user;
  return next();
}

function checksExistToDo(request, response, next){
  const {user} = request;
  console.log(user);
  const {id} = request.params;
  const todo = user.todos.find((element)=> (element.id == id));
  
  if(!todo){
    return response.status(404).json({error: "Task not found"});
  }
  request.todo = todo;
  return next();
}

//O objeto do usuário deve ser retornado na resposta da requisição. 
app.post('/users', (request, response) => {
  const {name, username, todos} = request.body;

  if(users.find(e => e.username === username)){
    return response.status(400).json({error: `This username: '${username}' already exist`});
  }
  const user = new User(name, username, todos);
  users.push(user);

  return response.status(201).json(user);
});

//A rota deve receber, pelo header da requisição, uma propriedade username contendo o username do usuário e retornar uma lista com todas as tarefas desse usuário.
app.get('/todos', checksExistsUserAccount, (request, response) => {
  let {user} = request;
  return response.json(user.todos);
});

//O objeto do todo deve ser retornado na resposta da requisição.
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  
  const todo = new ToDo(title,deadline);
  let {user} = request;
  user.todos.push(todo);

  console.log(user.todos);
  return response.status(201).json(todo);
});

//É preciso alterar apenas o title e o deadline da tarefa que possua o id igual ao id presente nos parâmetros da rota.
app.put('/todos/:id', checksExistsUserAccount, checksExistToDo, (request, response) => {
  const {title, deadline} = request.body;
  let {todo} = request;

  todo.setTitle(title);
  todo.setDeadline(deadline);


  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistToDo, (request, response) => {
  const {todo} = request;
  
  todo.setDone(true);

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistToDo,(request, response) => {
  const {user, todo} = request;

  user.todos.splice(todo,1);
  
  return response.status(204);
});

module.exports = app;