let editingId = null;
const saveBtn = document.getElementById("saveBtn");
const editor = document.getElementById("editor");
const notesContainer = document.getElementById("notesContainer");
const titleInput = document.getElementById("titleInput");
const titleColorPicker = document.getElementById("titleColorPicker");

const boldBtn = document.getElementById("bold");
const italicBtn = document.getElementById("italic");
const underlineBtn = document.getElementById("underline");
const textColorPicker = document.getElementById("textColorPicker");
const backgroundcolorPicker = document.getElementById("backgroundcolorPicker");

function loadNotes() {
  let savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  if (!savedNotes.length) {
    notesContainer.innerHTML = `<p>Noch keine Notiz erstellt.</p>`;
    return;
  }
  savedNotes.sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));
  notesContainer.innerHTML = "";
  savedNotes.forEach((note) => {
    const noteElement = document.createElement("div");
    noteElement.classList.add("note");
    noteElement.style.backgroundColor = note.bgColor;
    noteElement.innerHTML = `
      <div class="note-header">
        <button class="pinBtn" data-id="${note.id}" title="${
      note.pinned ? "Unpin" : "Pin"
    }">
          ${note.pinned ? "📌" : "📍"}
        </button>
      </div>
      <h3 class="note-title" style="color: ${note.titleColor};">${
      note.title
    }</h3>
      <p class="note-content">${note.content}</p>
      <button class="editBtn" data-id="${note.id}">Edit</button>
      <button class="deleteBtn" data-id="${note.id}">Delete</button>
    `;
    notesContainer.appendChild(noteElement);
    noteElement
      .querySelector(".deleteBtn")
      .addEventListener("click", () => deleteNote(note.id));
    noteElement
      .querySelector(".editBtn")
      .addEventListener("click", () => editNote(note.id));
    noteElement
      .querySelector(".pinBtn")
      .addEventListener("click", () => togglePin(note.id));
  });

  addDynamicHover();
}

function addDynamicHover() {
    const notes = document.querySelectorAll(".note");
    notes.forEach((note) => {
      note.addEventListener("mouseenter", function () {
        const width = note.clientWidth;
        const height = note.clientHeight;
        let extraWidth = (400 / width) * 0.05;
        let extraHeight = (400 / height) * 0.05;
        if (extraWidth > 0.05) extraWidth = 0.05;
        if (extraWidth < 0.01) extraWidth = 0.01;
        if (extraHeight > 0.05) extraHeight = 0.05;
        if (extraHeight < 0.01) extraHeight = 0.01;
        const extra = Math.min(extraWidth, extraHeight);
        const scaleFactor = 1 + extra;
        note.style.transform = `scale(${scaleFactor})`;
        note.style.transition = "transform 0.2s ease-in-out";
      });
      note.addEventListener("mouseleave", function () {
        note.style.transform = "scale(1)";
      });
    });
  }
  
  const toggleCheckbox = document.getElementById("toggle-checkbox");

  toggleCheckbox.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", toggleCheckbox.checked);
    document.getElementById("header").classList.toggle("dark-mode", toggleCheckbox.checked);
  });

  const fullscreenToggle = document.getElementById("fullscreenToggle");

fullscreenToggle.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
    }).catch(err => {
      console.error("Error attempting to enable full-screen mode:", err);
    });
  } else {
    document.exitFullscreen().then(() => {
    });
  }
});

  
function deleteNote(id) {
  let savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  savedNotes = savedNotes.filter((note) => note.id !== id);
  localStorage.setItem("notes", JSON.stringify(savedNotes));
  loadNotes();
}

function editNote(id) {
  let savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  const note = savedNotes.find((note) => note.id === id);
  if (note) {
    editor.innerHTML = note.content;
    editor.style.backgroundColor = note.bgColor;
    backgroundcolorPicker.value = note.bgColor;
    editingId = id;
    saveBtn.textContent = "Update";
    titleInput.value = note.title;
    titleColorPicker.value = note.titleColor;
  }
}

function togglePin(id) {
  let savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
  const note = savedNotes.find((n) => n.id === id);
  if (note) {
    note.pinned = !note.pinned;
    localStorage.setItem("notes", JSON.stringify(savedNotes));
    loadNotes();
  }
}

const wordCountElem = document.getElementById("wordCount");
const charCountElem = document.getElementById("charCount");
editor.addEventListener("input", updateCounts);

function updateCounts() {
  const text = editor.innerText.trim();
  const words = text === "" ? 0 : text.split(/\s+/).length;
  const chars = text.replace(/\s/g, "").length;
  wordCountElem.innerText = words;
  charCountElem.innerText = chars;
}

boldBtn.addEventListener("click", () => {
  document.execCommand("bold", false, null);
  boldBtn.classList.toggle("active", document.queryCommandState("bold"));
});

italicBtn.addEventListener("click", () => {
  document.execCommand("italic", false, null);
  italicBtn.classList.toggle("active", document.queryCommandState("italic"));
});

underlineBtn.addEventListener("click", () => {
  document.execCommand("underline", false, null);
  underlineBtn.classList.toggle(
    "active",
    document.queryCommandState("underline")
  );
});
textColorPicker.addEventListener("input", () => {
  editor.focus();
  document.execCommand("foreColor", false, textColorPicker.value);
});
backgroundcolorPicker.addEventListener("input", () => {
  editor.style.backgroundColor = backgroundcolorPicker.value;
});

saveBtn.addEventListener("click", () => {
    const noteText = editor.innerHTML.trim();
    if (!noteText) return;
    let savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    if (editingId !== null) {
      const note = savedNotes.find(n => n.id === editingId);
      if (!note) return; 
      note.title = titleInput.value.trim();
      note.titleColor = titleColorPicker.value;
      note.bgColor = backgroundcolorPicker.value;
      note.content = noteText;
      editingId = null;
      saveBtn.textContent = "Save";
    } else {
      const title = titleInput.value.trim();
      if (!title) {
        alert("Please define a Title for your Note.");
        return;
      }
      const newNote = {
        id: Date.now(),
        title,
        titleColor: titleColorPicker.value,
        content: editor.innerHTML,
        bgColor: backgroundcolorPicker.value,
        pinned: false
      };
      savedNotes.push(newNote);
    }
    localStorage.setItem("notes", JSON.stringify(savedNotes));
    loadNotes();

    editor.innerHTML = "";
    titleInput.value = "";
    backgroundcolorPicker.value = "#ffffff";
    editor.style.backgroundColor = backgroundcolorPicker.value;
    textColorPicker.value = "#000000";  
    titleColorPicker.value = "#000000";    
  });
  

window.addEventListener("load", loadNotes);
