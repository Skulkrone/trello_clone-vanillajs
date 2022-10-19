"use strict";
const itemsContainer = document.querySelectorAll(".items-container");
// Variables dynamiques
let actualContainer, actualBtn, actualUL, actualForm, actualTextInput, actualValidation;
// Création d'une fonction qui sert à mettre tous les listeners au même endroit
function addContainerListeners(currentContainer) {
    const currentContainerDeletionBtn = currentContainer.querySelector(".delete-container-btn");
    const currentAddItemBtn = currentContainer.querySelector(".add-item-btn");
    const currentCloseFormBtn = currentContainer.querySelector(".close-form-btn");
    const currentForm = currentContainer.querySelector("form");
    // ajour d'un event listeners
    deleteBtnListeners(currentContainerDeletionBtn);
    addItemBtnListeners(currentAddItemBtn);
    closingFormBtnListeners(currentCloseFormBtn);
    addFormSubmitListeners(currentForm);
    addDDListeners(currentContainer);
}
// Pour chaque container, on envoie la fonction où se trouve tous les listeners
itemsContainer.forEach((container) => {
    addContainerListeners(container);
});
// Fonctions correspondantes au event listeners créés plus haut
function deleteBtnListeners(btn) {
    btn.addEventListener("click", handleContainerDeletion);
}
function addItemBtnListeners(btn) {
    btn.addEventListener("click", handleAddItem);
}
function closingFormBtnListeners(btn) {
    btn.addEventListener("click", () => toggleForm(actualBtn, actualForm, false));
}
function addFormSubmitListeners(form) {
    form.addEventListener("submit", createNewItem);
}
function addDDListeners(element) {
    element.addEventListener("dragstart", handleDragStart);
    element.addEventListener("dragover", handleDragOver);
    element.addEventListener("drop", handleDrop);
    element.addEventListener("dragend", handleDragEnd);
}
// Fonctions appellée (fonctions d'actions) dans les event listeners
function handleContainerDeletion(e) {
    const btn = e.target;
    const btnsArray = [
        ...document.querySelectorAll(".delete-container-btn"),
    ];
    const containers = [
        ...document.querySelectorAll(".items-container"),
    ];
    containers[btnsArray.indexOf(btn)].remove();
}
function handleAddItem(e) {
    const btn = e.target;
    // Si un form ouvert dans un container, les autres restent fermé
    if (actualContainer)
        toggleForm(actualBtn, actualForm, false);
    setContainerItems(btn);
    toggleForm(actualBtn, actualForm, true);
}
function toggleForm(btn, form, action) {
    if (!action) {
        form.style.display = "none";
        btn.style.display = "block";
    }
    else if (action) {
        form.style.display = "block";
        btn.style.display = "none";
    }
}
// Fonction où on va remplir toutes les variables dynamiques
function setContainerItems(btn) {
    actualBtn = btn;
    actualContainer = btn.parentElement;
    actualUL = actualContainer.querySelector("ul");
    actualForm = actualContainer.querySelector("form");
    actualTextInput = actualContainer.querySelector("input");
    actualValidation = actualContainer.querySelector(".validation-msg");
}
function createNewItem(e) {
    e.preventDefault();
    // Validation
    if (actualTextInput.value.length === 0) {
        actualValidation.textContent = "Must be at least 1 character long";
        return;
    }
    else {
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
    const item = actualUL.lastElementChild;
    const liBtn = item.querySelector("button");
    handleItemDeletion(liBtn);
    addDDListeners(item);
    actualTextInput.value = "";
}
function handleItemDeletion(btn) {
    btn.addEventListener("click", () => {
        const elToRemove = btn.parentElement;
        elToRemove.remove();
    });
}
// Drag And Drop
let dragSrcEl;
// mettre tjs this en 1er
function handleDragStart(e) {
    var _a;
    // pour éviter que les éléments se propagent et déclechent des event quei seraient plus haut dans le DOM
    e.stopPropagation();
    if (actualContainer)
        toggleForm(actualBtn, actualForm, false);
    dragSrcEl = this;
    // ? = contrer le fait que l'élément peut être null
    // setData = copie de l'élément HTML qu'on vient de soulever
    (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData("text/html", this.innerHTML);
}
// Obliger de mettre cette fonction sinon le drag and drop ne fcontionnera pas
function handleDragOver(e) {
    e.preventDefault();
}
function handleDrop(e) {
    var _a, _b;
    e.stopPropagation();
    // ici this est la réception
    const receptionEl = this;
    // Si nouveau item de list, on le rejoute dans un nouveau container
    if (dragSrcEl.nodeName === "LI" &&
        receptionEl.classList.contains("items-container")) {
        // on retrouve le ? qui contre le fait que l'élément peut être null
        // appendChild = drop élément/item dans le li
        (_a = receptionEl.querySelector("ul")) === null || _a === void 0 ? void 0 : _a.appendChild(dragSrcEl);
        // Sinon on peut mettre aussi :
        // (receptionEl.querySelector('ul') as HTMLUListElement).appendChild(dragSrcEl)
        // les événements disparaissent lors d'un drag and drop donc :
        addDDListeners(dragSrcEl);
        handleItemDeletion(dragSrcEl.querySelector("button"));
    }
    // cas de swap d'un item avec un autre item ou d'un container avec un autre container
    // Si l'élément que je suis entrain de glisser est différent de l'élément où je veux le poser
    // et que les classes correspondent
    if (dragSrcEl !== this && this.classList[0] === dragSrcEl.classList[0]) {
        // élément qu'on est en train de swaper va prendre l'inner html de l'élément sur lequel on l'a posé
        dragSrcEl.innerHTML = this.innerHTML;
        // ici tjs mettre as string sinon retourne erreur
        // et l'élement que lequel on a posé va prendre l'inner html de l'élément qu'on était entrain de glisser
        this.innerHTML = (_b = e.dataTransfer) === null || _b === void 0 ? void 0 : _b.getData("text/html");
        // --- si élément est un container : ---
        if (this.classList.contains("items-container")) {
            // utilisation de la grance fonction
            addContainerListeners(this);
            // s'il y a des li à l'intérieur, leut rajouter les event
            this.querySelectorAll("li").forEach((li) => {
                handleItemDeletion(li.querySelector("button"));
                addDDListeners(li);
            });
        }
        else {
            // --- cas si j'ai des items qui se font swap ---
            addDDListeners(this);
            handleItemDeletion(this.querySelector("button"));
        }
    }
}
function handleDragEnd(e) {
    e.stopPropagation();
    // élément qui sa fait swap back
    if (this.classList.contains("items-container")) {
        addContainerListeners(this);
        if (this.querySelectorAll("li")) {
            this.querySelectorAll("li").forEach((li) => {
                handleItemDeletion(li.querySelector("button"));
                addDDListeners(li);
            });
        }
    }
    else {
        addDDListeners(this);
    }
}
// Add New Container
const addContainerBtn = document.querySelector(".add-container-btn");
const addContainerForm = document.querySelector(".add-new-container form");
const addContainerFormInput = document.querySelector(".add-new-container input");
const validationNewContainer = document.querySelector(".add-new-container .validation-msg");
const addContainerCloseBtn = document.querySelector(".close-add-list");
const addNewContainer = document.querySelector(".add-new-container");
const containersList = document.querySelector(".main-content");
addContainerBtn.addEventListener("click", () => {
    toggleForm(addContainerBtn, addContainerForm, true);
});
addContainerCloseBtn.addEventListener("click", () => {
    toggleForm(addContainerBtn, addContainerForm, false);
});
addContainerForm.addEventListener("submit", createNewContainer);
function createNewContainer(e) {
    e.preventDefault();
    if (addContainerFormInput.value.length === 0) {
        validationNewContainer.textContent = "Must be at least 1 character long";
        return;
    }
    else {
        validationNewContainer.textContent = "";
    }
    const itemsContainer = document.querySelector(".items-container");
    const newContainer = itemsContainer.cloneNode();
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
