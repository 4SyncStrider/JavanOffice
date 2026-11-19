/**
 * To-do list app for JavanOffice.
 *
 * The page stores multiple independent lists in localStorage, so a user can
 * keep separate projects or categories without tasks bleeding into one another.
 */
const STORAGE_KEY = "javanoffice.todo.lists.v1";

const state = {
  lists: loadLists(),
  selectedId: null,
  editingListId: null,
};

const listTabsElement = document.querySelector("#listTabs");
const currentListTitle = document.querySelector("#currentListTitle");
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const emptyState = document.querySelector("#emptyState");
const newListButton = document.querySelector("#newListButton");
const renameListButton = document.querySelector("#renameListButton");
const deleteListButton = document.querySelector("#deleteListButton");
const listDeleteConfirmModal = document.querySelector("#listDeleteConfirmModal");
const listDeleteConfirmTitle = document.querySelector("#listDeleteConfirmTitle");
const listDeleteConfirmMessage = document.querySelector("#listDeleteConfirmMessage");
const cancelListDeleteButton = document.querySelector("#cancelListDeleteButton");
const confirmListDeleteButton = document.querySelector("#confirmListDeleteButton");
let pendingDeleteListId = null;
let deleteConfirmationTrigger = null;

function generateId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function createList(name = "My list") {
  return {
    id: generateId("list"),
    name: name.trim() || "My list",
    tasks: [],
  };
}

function loadLists() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [createList("My list")];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [createList("My list")];
    }

    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        id: typeof item.id === "string" ? item.id : generateId("list"),
        name: typeof item.name === "string" && item.name.trim() ? item.name.trim() : "My list",
        tasks: Array.isArray(item.tasks)
          ? item.tasks
              .map((task) => ({
                id: typeof task.id === "string" ? task.id : generateId("task"),
                text: typeof task.text === "string" ? task.text : "",
                done: Boolean(task.done),
              }))
              .filter((task) => task.text.trim())
          : [],
      }));
  } catch {
    return [createList("My list")];
  }
}

function saveLists() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lists));
}

function selectList(listId) {
  state.selectedId = listId;
  render();
}

function getSelectedList() {
  return state.lists.find((list) => list.id === state.selectedId) || state.lists[0];
}

function createListTab(list) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `list-tab${list.id === state.selectedId ? " active" : ""}`;
  button.textContent = list.name;
  button.setAttribute("aria-pressed", String(list.id === state.selectedId));
  button.addEventListener("click", () => selectList(list.id));
  return button;
}

function finishListNameEdit(list, input) {
  if (state.editingListId !== list.id) return;
  list.name = input.value.trim() || input.dataset.originalName;
  state.editingListId = null;
  saveLists();
  if (list.id === state.selectedId) currentListTitle.textContent = list.name;
  input.replaceWith(createListTab(list));
}

function renderListTabs() {
  listTabsElement.innerHTML = "";

  state.lists.forEach((list) => {
    if (list.id !== state.editingListId) {
      listTabsElement.appendChild(createListTab(list));
      return;
    }

    const input = document.createElement("input");
    input.type = "text";
    input.className = `list-tab list-tab-editor${list.id === state.selectedId ? " active" : ""}`;
    input.value = list.name;
    input.maxLength = 80;
    input.dataset.originalName = list.name;
    input.setAttribute("aria-label", `List name: ${list.name}`);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        input.blur();
      } else if (event.key === "Escape") {
        event.preventDefault();
        input.value = input.dataset.originalName;
        input.blur();
      }
    });
    input.addEventListener("blur", () => finishListNameEdit(list, input));
    listTabsElement.appendChild(input);
  });
}

function beginListNameEdit(listId) {
  state.editingListId = listId;
  renderListTabs();
  const input = listTabsElement.querySelector(".list-tab-editor");
  input.focus();
  input.select();
}

function renderTasks() {
  const list = getSelectedList();
  currentListTitle.textContent = list.name;
  taskList.innerHTML = "";

  if (!list.tasks.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  list.tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.done ? " completed" : ""}`;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = `task-toggle${task.done ? " done" : ""}`;
    toggle.setAttribute("aria-label", task.done ? "Mark as incomplete" : "Mark as complete");
    toggle.addEventListener("click", () => {
      task.done = !task.done;
      saveLists();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      const nextText = window.prompt("Edit task:", task.text);
      if (nextText === null) return;
      const cleaned = nextText.trim();
      if (!cleaned) {
        window.alert("Task cannot be empty.");
        return;
      }
      task.text = cleaned;
      saveLists();
      renderTasks();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      list.tasks = list.tasks.filter((entry) => entry.id !== task.id);
      saveLists();
      renderTasks();
    });

    actions.append(editButton, deleteButton);
    item.append(toggle, text, actions);
    taskList.appendChild(item);
  });
}

function render() {
  if (!state.lists.length) {
    state.lists = [createList("My list")];
  }

  if (!state.selectedId || !state.lists.some((list) => list.id === state.selectedId)) {
    state.selectedId = state.lists[0].id;
  }

  renderListTabs();
  renderTasks();
}

newListButton.addEventListener("click", () => {
  const newList = createList(`List ${state.lists.length + 1}`);
  state.lists.push(newList);
  state.selectedId = newList.id;
  state.editingListId = newList.id;
  saveLists();
  render();
  const input = listTabsElement.querySelector(".list-tab-editor");
  input.focus();
  input.select();
});

renameListButton.addEventListener("click", () => {
  beginListNameEdit(getSelectedList().id);
});

function closeListDeleteConfirmation(returnFocus = true) {
  listDeleteConfirmModal.hidden = true;
  pendingDeleteListId = null;
  document.removeEventListener("keydown", handleListDeleteDialogKeydown);
  if (returnFocus) deleteConfirmationTrigger?.focus();
  deleteConfirmationTrigger = null;
}

function handleListDeleteDialogKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeListDeleteConfirmation();
    return;
  }

  if (event.key === "Tab") {
    event.preventDefault();
    const nextButton = event.shiftKey
      ? document.activeElement === cancelListDeleteButton
        ? confirmListDeleteButton
        : cancelListDeleteButton
      : document.activeElement === confirmListDeleteButton
        ? cancelListDeleteButton
        : confirmListDeleteButton;
    nextButton.focus();
  }
}

deleteListButton.addEventListener("click", () => {
  const list = getSelectedList();
  pendingDeleteListId = list.id;
  deleteConfirmationTrigger = deleteListButton;
  const isOnlyList = state.lists.length === 1;
  listDeleteConfirmTitle.textContent = isOnlyList
    ? "Delete the only list?"
    : `Delete "${list.name}"?`;
  listDeleteConfirmMessage.textContent = isOnlyList
    ? `Deleting "${list.name}" will remove its tasks and create a fresh empty list.`
    : "This list and its tasks will be permanently deleted.";
  confirmListDeleteButton.textContent = isOnlyList ? "Delete and replace" : "Delete list";
  listDeleteConfirmModal.hidden = false;
  cancelListDeleteButton.focus();
  document.addEventListener("keydown", handleListDeleteDialogKeydown);
});

cancelListDeleteButton.addEventListener("click", () => closeListDeleteConfirmation());
confirmListDeleteButton.addEventListener("click", () => {
  const list = state.lists.find((entry) => entry.id === pendingDeleteListId);
  const isOnlyList = state.lists.length === 1;
  closeListDeleteConfirmation(false);
  if (!list) return;

  if (isOnlyList) {
    state.lists = [createList("My list")];
    state.selectedId = state.lists[0].id;
  } else {
    state.lists = state.lists.filter((entry) => entry.id !== list.id);
    state.selectedId = state.lists[0].id;
  }
  saveLists();
  render();
  listTabsElement.querySelector(".active")?.focus();
});

listDeleteConfirmModal.addEventListener("click", (event) => {
  if (event.target === listDeleteConfirmModal) closeListDeleteConfirmation();
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = taskInput.value.trim();
  if (!value) {
    window.alert("Please enter a task first.");
    return;
  }

  const list = getSelectedList();
  list.tasks.push({
    id: generateId("task"),
    text: value,
    done: false,
  });

  taskInput.value = "";
  saveLists();
  renderTasks();
});

render();
