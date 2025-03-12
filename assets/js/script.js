// ! Variables
const listForm = document.getElementById("listForm");
const listsContainer = document.getElementById("listsContainer");
const taskForm = document.getElementById("taskForm");
const tasksContainer = document.getElementById("tasksContainer");
const listHeading = document.getElementById("listHeading");

let listsData = getListsFromLocalStorage();
let currentListName = Object.keys(listsData)[0] || "";
let firstList = false;

// ! Event Listeners
document.addEventListener("DOMContentLoaded", init);
listForm.addEventListener("submit", handleAddList);

// ! Functions
function init() {
    Object.keys(listsData).forEach(addListToDom);
}

// !! List Functions
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

  tasksContainer.innerHTML = "";
}

function refreshListBadge() {
  const list = document.querySelector(`.list-item[data-list="${currentListName}"] .badge`);
  const incompleteTasks = listsData[currentListName].filter(task => !task.completed).length;
  list.textContent = incompleteTasks;
}

function updateListsInLocalStorage() {
    localStorage.setItem("listsObj", JSON.stringify(listsData));
}

function getListsFromLocalStorage() {
    return JSON.parse(localStorage.getItem("listsObj")) || {};
}