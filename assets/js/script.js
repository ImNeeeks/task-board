// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

const taskDisplayEl = $('#task-display');
const taskTitleInputEl = $('#task-title-input');
const taskDueDateInputEl = $('#taskDueDate');
const taskTextInputEl = $('#task-textarea-input');
const taskForm = $('#task-form');

// eventlistener to submit add task button
taskForm.on('submit', handleAddTask);


function handleAddTask(event) {
  event.preventDefault();

  const taskTitle = taskTitleInputEl.val().trim();
  const taskText = taskTextInputEl.val().trim();
  const taskDate = taskDueDateInputEl.val();

  let newTask = {
    id: generateTaskId(),
    title: taskTitle,
    text: taskText,
    dueDate: taskDate,
    status: 'to-do',
  };

  const taskList = readTasksFromStorage();
  taskList.push(newTask);

  saveTasksToStorage(taskList);
  
  renderTaskList();

  taskTitleInputEl.val('');
  taskTextInputEl.val('');
  taskDueDateInputEl.val('');

  taskForm.closest('.modal').modal('hide');
}

function generateTaskId() {
  return nextId++;
}

// Accepts an array of tasks, stringifys them, and saves them in localStorage
function saveTasksToStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}


// Parse localStorage
function readTasksFromStorage() {
  let taskList = JSON.parse(localStorage.getItem('tasks'));

    if (!taskList) {
        taskList = [];
    }
    return taskList;
}




// Todo: create a function to create a task card
function createTaskCard(task) {
  const taskCard = $('<div>')
    .addClass('card draggable my-3')
    .attr('data-task-id', task.id)
  const cardHeader = $('<h5>').addClass('card-header').text(task.title);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.text);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBt = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id)
  cardDeleteBt.on('click', handleDeleteTask);

  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBt.addClass('btn-outline-warning');
    }
  }

  cardBody.append(cardDescription, cardDueDate, cardDeleteBt);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
  
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const taskList = readTasksFromStorage();

  const todoList = $('#todo-cards');
  todoList.empty();

  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();

  const doneList = $('#done-cards');
  doneList.empty();

  for (let task of taskList) {
    if (task.status === 'to-do') {
      todoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  }
  
  $('.draggable').draggable({
    opacity: 0.5,
    zIndex: 75,

  });
};

function handleDeleteTask() {
  const taskId = $(this).data('task-id');
  let taskList = readTasksFromStorage();
  taskList = taskList.filter(task => task.id !== taskId);
  saveTasksToStorage(taskList);
  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  event.preventDefault();
  const taskList = readTasksFromStorage();
  
  const taskId = ui.helper.attr('data-task-id');
  // Update task status in taskList
  
  const newStatus = event.target.id;

  for (let task of taskList) {
    if (task.id == taskId) {
        task.status = newStatus;
    }
  }

  saveTasksToStorage(taskList);
  renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {

  renderTaskList();


  $('#taskDueDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });

  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

});

taskDisplayEl.on('click', '.delete', handleDeleteTask); 