const itemsContainer = document.querySelectorAll(
  ".items-container"
) as NodeListOf<HTMLDivElement>;

// Variables dynamiques
let actualContainer: HTMLDivElement,
  actualBtn: HTMLButtonElement,
  actualUL: HTMLUListElement,
  actualForm: HTMLFormElement,
  actualTextInput: HTMLInputElement,
  actualValidation: HTMLSpanElement;

// Création d'une fonction qui sert à mettre tous les listeners au même endroit
function addContainerListeners(currentContainer: HTMLDivElement) {
  const currentContainerDeletionBtn = currentContainer.querySelector(
    ".delete-container-btn"
  ) as HTMLButtonElement;
  const currentAddItemBtn = currentContainer.querySelector(
    ".add-item-btn"
  ) as HTMLButtonElement;
  const currentCloseFormBtn = currentContainer.querySelector(
    ".close-form-btn"
  ) as HTMLButtonElement;
  const currentForm = currentContainer.querySelector("form") as HTMLFormElement;

  // ajour d'un event listeners
  deleteBtnListeners(currentContainerDeletionBtn);
  addItemBtnListeners(currentAddItemBtn);
  closingFormBtnListeners(currentCloseFormBtn);
  addFormSubmitListeners(currentForm);
  addDDListeners(currentContainer);
}

// Pour chaque container, on envoie la fonction où se trouve tous les listeners
itemsContainer.forEach((container: HTMLDivElement) => {
  addContainerListeners(container);
});

// Fonctions correspondantes au event listeners créés plus haut
function deleteBtnListeners(btn: HTMLButtonElement) {
  btn.addEventListener("click", handleContainerDeletion);
}
function addItemBtnListeners(btn: HTMLButtonElement) {
  btn.addEventListener("click", handleAddItem);
}
function closingFormBtnListeners(btn: HTMLButtonElement) {
  btn.addEventListener("click", () => toggleForm(actualBtn, actualForm, false));
}
function addFormSubmitListeners(form: HTMLFormElement) {
  form.addEventListener("submit", createNewItem);
}
function addDDListeners(element: HTMLElement) {
  element.addEventListener("dragstart", handleDragStart);
  element.addEventListener("dragover", handleDragOver);
  element.addEventListener("drop", handleDrop);
  element.addEventListener("dragend", handleDragEnd);
}

// Fonctions appellée (fonctions d'actions) dans les event listeners
function handleContainerDeletion(e: MouseEvent) {
  const btn = e.target as HTMLButtonElement;
  const btnsArray = [
    ...document.querySelectorAll(".delete-container-btn"),
  ] as HTMLButtonElement[];
  const containers = [
    ...document.querySelectorAll(".items-container"),
  ] as HTMLDivElement[];
  containers[btnsArray.indexOf(btn)].remove();
}

function handleAddItem(e: MouseEvent) {
  const btn = e.target as HTMLButtonElement;
  // Si un form ouvert dans un container, les autres restent fermé
  if (actualContainer) toggleForm(actualBtn, actualForm, false);
  setContainerItems(btn);
  toggleForm(actualBtn, actualForm, true);
}

function toggleForm(
  btn: HTMLButtonElement,
  form: HTMLFormElement,
  action: Boolean
) {
  if (!action) {
    form.style.display = "none";
    btn.style.display = "block";
  } else if (action) {
    form.style.display = "block";
    btn.style.display = "none";
  }
}

// Fonction où on va remplir toutes les variables dynamiques
function setContainerItems(btn: HTMLButtonElement) {
  actualBtn = btn;
  actualContainer = btn.parentElement as HTMLDivElement;
  actualUL = actualContainer.querySelector("ul") as HTMLUListElement;
  actualForm = actualContainer.querySelector("form") as HTMLFormElement;
  actualTextInput = actualContainer.querySelector("input") as HTMLInputElement;
  actualValidation = actualContainer.querySelector(
    ".validation-msg"
  ) as HTMLSpanElement;
}

function createNewItem(e: Event) {
  e.preventDefault();
  // Validation
  if (actualTextInput.value.length === 0) {
    actualValidation.textContent = "Must be at least 1 character long";
    return;
  } else {
    actualValidation.textContent = "";
  }
  // Creation Item
  const itemContent = actualTextInput.value;
  const li = `
  <li class="item" draggable="true">
  <p>${itemContent}</p>
  <button>X</button>
  </li>
  `;
  actualUL.insertAdjacentHTML("beforeend", li);
  const item = actualUL.lastElementChild as HTMLLIElement;
  const liBtn = item.querySelector("button") as HTMLButtonElement;
  handleItemDeletion(liBtn);
  addDDListeners(item);
  actualTextInput.value = "";
}

function handleItemDeletion(btn: HTMLButtonElement) {
  btn.addEventListener("click", () => {
    const elToRemove = btn.parentElement as HTMLLIElement;
    elToRemove.remove();
  });
}

// Drag And Drop

let dragSrcEl: HTMLElement;
// mettre tjs this en 1er
function handleDragStart(this: HTMLElement, e: DragEvent) {
  // pour éviter que les éléments se propagent et déclechent des event quei seraient plus haut dans le DOM
  e.stopPropagation();

  if (actualContainer) toggleForm(actualBtn, actualForm, false);
  dragSrcEl = this;
  // ? = contrer le fait que l'élément peut être null
  // setData = copie de l'élément HTML qu'on vient de soulever
  e.dataTransfer?.setData("text/html", this.innerHTML);
}

// Obliger de mettre cette fonction sinon le drag and drop ne fcontionnera pas
function handleDragOver(e: DragEvent) {
  e.preventDefault();
}
function handleDrop(this: HTMLElement, e: DragEvent) {
  e.stopPropagation();
  // ici this est la réception
  const receptionEl = this;

  // Si nouveau item de list, on le rejoute dans un nouveau container
  if (
    dragSrcEl.nodeName === "LI" &&
    receptionEl.classList.contains("items-container")
  ) {
    // on retrouve le ? qui contre le fait que l'élément peut être null
    // appendChild = drop élément/item dans le li
    receptionEl.querySelector("ul")?.appendChild(dragSrcEl);
    // Sinon on peut mettre aussi :
    // (receptionEl.querySelector('ul') as HTMLUListElement).appendChild(dragSrcEl)

    // les événements disparaissent lors d'un drag and drop donc :
    addDDListeners(dragSrcEl);
    handleItemDeletion(dragSrcEl.querySelector("button") as HTMLButtonElement);
  }

  // cas de swap d'un item avec un autre item ou d'un container avec un autre container
  // Si l'élément que je suis entrain de glisser est différent de l'élément où je veux le poser
  // et que les classes correspondent
  if (dragSrcEl !== this && this.classList[0] === dragSrcEl.classList[0]) {
    // élément qu'on est en train de swaper va prendre l'inner html de l'élément sur lequel on l'a posé
    dragSrcEl.innerHTML = this.innerHTML;
    // ici tjs mettre as string sinon retourne erreur
    // et l'élement que lequel on a posé va prendre l'inner html de l'élément qu'on était entrain de glisser
    this.innerHTML = e.dataTransfer?.getData("text/html") as string;

    // --- si élément est un container : ---
    if (this.classList.contains("items-container")) {
      // utilisation de la grance fonction
      addContainerListeners(this as HTMLDivElement);

      // s'il y a des li à l'intérieur, leut rajouter les event
      this.querySelectorAll("li").forEach((li: HTMLLIElement) => {
        handleItemDeletion(li.querySelector("button") as HTMLButtonElement);
        addDDListeners(li);
      });
    } else {
      // --- cas si j'ai des items qui se font swap ---
      addDDListeners(this);
      handleItemDeletion(this.querySelector("button") as HTMLButtonElement);
    }
  }
}

function handleDragEnd(this: HTMLElement, e: DragEvent) {
  e.stopPropagation();
  // élément qui sa fait swap back
  if (this.classList.contains("items-container")) {
    addContainerListeners(this as HTMLDivElement);
    if (this.querySelectorAll("li")) {
      this.querySelectorAll("li").forEach((li: HTMLLIElement) => {
        handleItemDeletion(li.querySelector("button") as HTMLButtonElement);
        addDDListeners(li);
      });
    }
  } else {
    addDDListeners(this);
  }
}

// Add New Container

const addContainerBtn = document.querySelector(
  ".add-container-btn"
) as HTMLButtonElement;
const addContainerForm = document.querySelector(
  ".add-new-container form"
) as HTMLFormElement;
const addContainerFormInput = document.querySelector(
  ".add-new-container input"
) as HTMLInputElement;
const validationNewContainer = document.querySelector(
  ".add-new-container .validation-msg"
) as HTMLSpanElement;
const addContainerCloseBtn = document.querySelector(
  ".close-add-list"
) as HTMLButtonElement;
const addNewContainer = document.querySelector(
  ".add-new-container"
) as HTMLDivElement;
const containersList = document.querySelector(
  ".main-content"
) as HTMLDivElement;

addContainerBtn.addEventListener("click", () => {
  toggleForm(addContainerBtn, addContainerForm, true);
});
addContainerCloseBtn.addEventListener("click", () => {
  toggleForm(addContainerBtn, addContainerForm, false);
});
addContainerForm.addEventListener("submit", createNewContainer);

function createNewContainer(e: Event) {
  e.preventDefault();
  if (addContainerFormInput.value.length === 0) {
    validationNewContainer.textContent = "Must be at least 1 character long";
    return;
  } else {
    validationNewContainer.textContent = "";
  }

  const itemsContainer = document.querySelector(
    ".items-container"
  ) as HTMLDivElement;
  const newContainer = itemsContainer.cloneNode() as HTMLDivElement;

  const newContainerContent = `
    <div class="top-container">
      <h2>${addContainerFormInput.value}</h2>
      <button class="delete-container-btn">X</button>
    </div>
    <ul></ul>
    <button class="add-item-btn">Add an item</button>
    <form autocomplete="off">
      <div class="top-form-container">
        <label for="item">Add a new item</label>
        <button type="button" class="close-form-btn">X</button>
      </div>
      <input type="text" id="item" />
      <span class="validation-msg"></span>
      <button type="submit">Submit</button>
    </form>`;
  newContainer.innerHTML = newContainerContent;
  containersList.insertBefore(newContainer, addNewContainer);
  addContainerFormInput.value = "";
  addContainerListeners(newContainer);
}
