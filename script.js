const nameInput = document.getElementById("choreName");
const notesInput = document.getElementById("notes");
const icons = document.querySelectorAll(".icon-pick");

const preview = document.getElementById("previewCard");
const previewTitle = document.getElementById("previewTitle");
const previewNote = document.getElementById("previewNote");
const previewIcon = document.getElementById("previewIcon");

let selectedIconSrc = "";

icons.forEach(icon => {
  icon.addEventListener("click", () => {
    selectedIconSrc = icon.src;
    updatePreview();
  });
});

[nameInput, notesInput].forEach(input => {
  input.addEventListener("input", updatePreview);
});

function updatePreview() {
  const name = nameInput.value.trim();
  const note = notesInput.value.trim();

  if (name && selectedIconSrc) {
    preview.style.display = "flex";
    previewIcon.src = selectedIconSrc;
    previewTitle.textContent = name;
    previewNote.textContent = note || "";
  } else {
    preview.style.display = "none";
  }
}