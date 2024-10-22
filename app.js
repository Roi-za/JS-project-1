document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-todo-btn');
  const todoList = document.getElementById('todo-list');
  const errorMessage = document.getElementById('error-message');
  const prioritySelect = document.getElementById('priority');
  const openCount = document.getElementById('open-count');
  const showAllBtn = document.getElementById('show-all-btn');
  const showActiveBtn = document.getElementById('show-active-btn');
  const showCompletedBtn = document.getElementById('show-completed-btn');

  addBtn.addEventListener('click', function () {
    const taskText = input.value.trim();
    const priority = prioritySelect.value;
    if (taskText === '' || taskText.length < 3) {
      input.classList.add('error');
      errorMessage.classList.remove('hidden');
    } else {
      input.classList.remove('error');
      errorMessage.classList.add('hidden');

      const li = document.createElement('li');
      li.classList.add(`priority-${priority}`);
      li.draggable = true;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.addEventListener('change', function () {
        li.classList.toggle('completed');
        updateOpenCount();
      });

      const taskSpan = document.createElement('span');
      taskSpan.textContent = `${taskText} (${priority})`;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', function () {
        li.remove();
        saveTasks();
        updateOpenCount();
      });

      li.appendChild(checkbox);
      li.appendChild(taskSpan);
      li.appendChild(removeBtn);
      todoList.appendChild(li);

      input.value = '';
      saveTasks();
      updateOpenCount();
    }
  });

  showAllBtn.addEventListener('click', function () {
    filterTasks('all');
  });

  showActiveBtn.addEventListener('click', function () {
    filterTasks('active');
  });

  showCompletedBtn.addEventListener('click', function () {
    filterTasks('completed');
  });

  loadTasks();
  updateOpenCount();

  function updateOpenCount() {
    const openTasks = todoList.querySelectorAll('li:not(.completed)').length;
    openCount.textContent = `Open tasks: ${openTasks}`;
  }

  function saveTasks() {
    const tasks = [];
    todoList.querySelectorAll('li').forEach(task => {
      const taskObj = {
        text: task.querySelector('span').textContent,
        completed: task.classList.contains('completed'),
        priority: task.classList.contains('priority-low') ? 'low' :
                  task.classList.contains('priority-medium') ? 'medium' : 'high'
      };
      tasks.push(taskObj);
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    if (tasks) {
      tasks.forEach(taskObj => {
        const li = document.createElement('li');
        li.classList.add(`priority-${taskObj.priority}`);
        if (taskObj.completed) {
          li.classList.add('completed');
        }
        li.draggable = true;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = taskObj.completed;
        checkbox.addEventListener('change', function () {
          li.classList.toggle('completed');
          updateOpenCount();
        });

        const taskSpan = document.createElement('span');
        taskSpan.textContent = taskObj.text;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', function () {
          li.remove();
          saveTasks();
          updateOpenCount();
        });

        li.appendChild(checkbox);
        li.appendChild(taskSpan);
        li.appendChild(removeBtn);
        todoList.appendChild(li);
      });
    }
  }

  function filterTasks(filter) {
    const tasks = todoList.querySelectorAll('li');
    tasks.forEach(task => {
      switch (filter) {
        case 'all':
          task.style.display = 'block';
          break;
        case 'active':
          task.style.display = task.classList.contains('completed') ? 'none' : 'block';
          break;
        case 'completed':
          task.style.display = task.classList.contains('completed') ? 'block' : 'none';
          break;
      }
    });
  }

  todoList.addEventListener('dragstart', function (e) {
    e.target.classList.add('dragging');
  });

  todoList.addEventListener('dragend', function (e) {
    e.target.classList.remove('dragging');
  });

  todoList.addEventListener('dragover', function (e) {
    e.preventDefault();
    const draggingElement = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(todoList, e.clientY);
    if (afterElement == null) {
      todoList.appendChild(draggingElement);
    } else {
      todoList.insertBefore(draggingElement, afterElement);
    }
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
});
