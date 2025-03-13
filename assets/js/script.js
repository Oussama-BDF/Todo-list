// ! Variables
const listForm = document.getElementById("listForm");
const listsContainer = document.getElementById("listsContainer");
const taskForm = document.getElementById("taskForm");
const tasksContainer = document.getElementById("tasksContainer");
const listHeading = document.getElementById("listHeading");
const deleteList = document.getElementById("deleteList");

let listsData = getListsFromLocalStorage();
let currentListName = Object.keys(listsData)[0] || "";
let firstList = false;

// ! Event Listeners
document.addEventListener("DOMContentLoaded", init);
listForm.addEventListener("submit", handleAddList);
deleteList.addEventListener("click", handleDeleteList)
taskForm.addEventListener("submit", handleAddTask);
tasksContainer.addEventListener("change", handleTaskCheck);
tasksContainer.addEventListener("click", handleDeleteTask);
tasksContainer.addEventListener("focusout", handleEditTask);
tasksContainer.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    handleEditTask(e);
    e.target.blur();
  }
});

// ! Functions
function init() {
    Object.keys(listsData).forEach(addListToDom);
}

// * List Functions
function handleAddList(e) {
    e.preventDefault();
    const listName = this.listInput.value.trim();
    if (!listName || listsData[listName]) return;

    // Add new list to the lists data object and update local storage
    listsData[listName] = [];
    updateListsInLocalStorage();

    // Add list to DOM and clear the input field
    addListToDom(listName);
    this.reset();
}

function addListToDom(listName) {
    const incompleteTasks = listsData[listName].filter(task => !task.completed).length;

    const li = document.createElement("li");
    li.className = "list-item list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-1 border-0 rounded bg-transparent text-light";
    li.setAttribute("role", "button");
    li.setAttribute("data-list", listName);
    li.innerHTML = `<span class="text text-truncate">${listName}</span><span class="circle badge text-bg-secondary rounded-pill">${incompleteTasks}</span>`;
    li.addEventListener("click", () => updateActiveList(li));

    listsContainer.appendChild(li);

    // Activate the first list
    if (!firstList) {
      firstList = true;
      updateActiveList(li);
    }
}

function updateActiveList(listElement) {
  // Remove "active" class from any currently active list item and add it to the clicked list item
  document.querySelectorAll(".list-item").forEach(li => li.classList.remove("active"));
  listElement.classList.add("active");

  // Update the current list name and the list heading
  currentListName = listElement.getAttribute("data-list");
  listHeading.value = currentListName;

  // Clear the current task container and add tasks for the selected list
  tasksContainer.innerHTML = "";
  listsData[currentListName].forEach(addTaskToDom);
}

// !Many things to fix here
function handleEditList() {
  const oldName = currentListName;
  const newName = listHeading.value;

  if (listsData.hasOwnProperty(newName)) return;

  // Rename the key while preserving its value (tasks)
  listsData[newName] = listsData[oldName];
  delete listsData[oldName];

  // Update local storage
  updateListsInLocalStorage();
}

function handleDeleteList() {
  if (confirm("Are you sure you want to delete this list?")) {
    delete listsData[currentListName];
    updateListsInLocalStorage();
    document.querySelector(`.list-item[data-list="${currentListName}"]`).remove();

    // Activate the first list
    updateActiveList(document.querySelector(".list-item"))
  }
}

function refreshListBadge() {
  const list = document.querySelector(`.list-item[data-list="${currentListName}"] .badge`);
  const incompleteTasks = listsData[currentListName].filter(task => !task.completed).length;
  list.textContent = incompleteTasks;
}

// * Tasks Fcuntions
function handleAddTask(e) {
    e.preventDefault();
    const taskName = this.taskInput.value.trim();
    const taskPriority = this.taskPre.value.trim();
    const taskNotes = this.taskNotes.value.trim();
    if (!taskName || !taskPriority || !taskNotes) return;

    // Add new task to the lists data object and update local storage
    const task = {id: Date.now(), taskName, completed: false, added: new Date().toLocaleString(), priority: taskPriority, notes: taskNotes}
    listsData[currentListName].push(task);
    updateListsInLocalStorage();

    // Add task to DOM and clear the input field
    addTaskToDom(task);
    this.reset();

    // Close the modal
    bootstrap.Modal.getInstance(document.getElementById("taskModal"))?.hide();

}

function addTaskToDom(task) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.setAttribute("data-id", task.id);

    li.innerHTML = 
    `<div class="task-box input-group shadow rounded">
      <div class="input-group-text">
        <input class="form-check-input mt-0 task-checkbox" type="checkbox" data-id="${task.id}" role="button" ${task.completed ? "checked" : ""}>
      </div>
      <input type="text" class="form-control fw-semibold task-name" value="${task.taskName}" data-id="${task.id}">
      <button class="btn border" type="button" data-bs-toggle="collapse" data-bs-target="#task-${task.id}">
        <i class="fa-solid fa-chevron-down"></i>
      </button>
    </div>
    <div class="collapse mt-2" id="task-${task.id}" data-bs-parent="#tasksContainer">
      <div class="card border-0 shadow">
        <div class="card-body small">
          <div class="d-flex align-items-center justify-content-between">
            <p class="mb-1 text-muted"><i class="fa-regular fa-calendar-alt"></i> Added: ${task["added"]}</p>
            <span class="badge bg-secondary task-status">
              ${task.completed ? "Completed" : "Uncompleted"}
            </span>
          </div>
          <hr class="my-2">
          <p class="mb-1 fw-semibold">Notes : ${task.notes}</p>
          <hr class="my-2">
          <div class="d-flex align-items-center justify-content-between">
            <p class="mb-1 fw-semibold">
              <i class="fa-regular fa-flag"></i> 
              Priority: 
              <span class="badge ${task.priority === "high" ? "bg-danger" : task.priority === "medium" ? "bg-warning" : "bg-success"}">
                ${task.priority}
              </span>
            </p>
            <button class="btn btn-outline-danger btn-sm mt-2 delete-task small" data-id="${task.id}">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>`;

    tasksContainer.appendChild(li);

    refreshListBadge();
}

function handleTaskCheck(e) {
  if (!e.target.classList.contains("task-checkbox")) return;

  const taskId = parseInt(e.target.dataset.id);
  const task = listsData[currentListName].find(task => task.id == taskId);
  if (task) {
    task.completed = e.target.checked;
    updateListsInLocalStorage();
    updateTaskStatus(taskId, task.completed);
    refreshListBadge();
  }
}

function updateTaskStatus(taskId, isCompleted) {
  const taskElement = document.querySelector(`#task-${taskId} .task-status`);
  if (taskElement) {
      taskElement.textContent = isCompleted ? "Completed" : "Uncompleted";
  }
}

function handleDeleteTask(e) {
  if (!e.target.classList.contains("delete-task")) return;

  if (confirm("Are you sure you want to delete this task?")) {
    const taskId = parseInt(e.target.closest(".delete-task").dataset.id);
    deleteTask(taskId);
    refreshListBadge();
  }
}

function deleteTask(taskId) {
  listsData[currentListName] = listsData[currentListName].filter(task => task.id !== taskId);
  updateListsInLocalStorage();
  document.querySelector(`.task-item[data-id="${taskId}"]`).remove();
}

function handleEditTask(e) {
  if (!e.target.classList.contains("task-name")) return;

  const taskId = parseInt(e.target.dataset.id);
  const task = listsData[currentListName].find(task => task.id == taskId);

  if (task) {
    task.taskName = e.target.value;
    updateListsInLocalStorage();
  }
}

// * Global Functions
function updateListsInLocalStorage() {
    localStorage.setItem("listsObj", JSON.stringify(listsData));
}

function getListsFromLocalStorage() {
    return JSON.parse(localStorage.getItem("listsObj")) || {};
}