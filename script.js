

// --- CONFIG ---
const API_key = 'Bearer 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';
const endpoint = "https://openrouter.ai/api/v1/chat/completions";
const models = ['openai/gpt-4.1-nano-2025-04-14', 'mistralai/mistral-small-3.2-24b-instruct:free'];

// --- CHORE DETAILS CAPTURE (First Page) ---
const choreNameInput = document.getElementById("choreName");
const notesInput = document.getElementById("notes");
const previewCard = document.getElementById("previewCard");
const previewTitle = document.getElementById("previewTitle");
const previewNote = document.getElementById("previewNote");
const previewIcon = document.getElementById("previewIcon");
const icons = document.querySelectorAll(".icon-pick");

let selectedIcon = "";

// Setup preview listeners only if on chore detail page
if (choreNameInput && notesInput && previewCard) {
  icons.forEach(icon => {
    icon.addEventListener("click", () => {
      selectedIcon = icon.src;
      icons.forEach(i => i.classList.remove("selected"));
      icon.classList.add("selected");
      updatePreview();
    });
  });

  [choreNameInput, notesInput].forEach(input => {
    input.addEventListener("input", updatePreview);
  });

  function updatePreview() {
    if (choreNameInput.value.trim() !== "") {
      previewCard.style.display = "flex";
      previewTitle.textContent = choreNameInput.value;
      previewNote.textContent = notesInput.value;
      previewIcon.src = selectedIcon;
    } else {
      previewCard.style.display = "none";
    }
  }

  window.goToAssign = function () {
    const choreData = {
      name: choreNameInput.value,
      note: notesInput.value,
      icon: selectedIcon
    };
    localStorage.setItem("currentChore", JSON.stringify(choreData));
    window.location.href = "assigning-chore.html";
  };
}

// --- REWRITE PAGE ---
const choreData = JSON.parse(localStorage.getItem("currentChore"));
const note = choreData?.note?.trim() || "Please clean the bathroom.";
let selectedTone = "Friendly";

const toneButtons = document.querySelectorAll(".tone-btn");
const toneLabel = document.getElementById("toneLabel");
const originalTextSpan = document.getElementById("originalNote");
const rewriteTextSpan = document.getElementById("rewriteText");
const aiToggle = document.getElementById("aiToggle");

if (originalTextSpan) {
  originalTextSpan.textContent = note;

  async function fetchAIRewrite(note, tone) {
    const prompt = `Rewrite this instruction in a ${tone.toLowerCase()} tone. Only return the rewritten sentence:\n"${note}"`;
    let modelIndex = 0;

    while (modelIndex < models.length) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": API_key,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: models[modelIndex],
            messages: [{ role: "user", content: prompt }]
          })
        });

        const data = await response.json();
        console.log("AI raw response:", data);

        if (data.error) {
          console.warn(`Model error (${models[modelIndex]}):`, data.error.message);
          modelIndex++;
          continue;
        }

        const fullText = data.choices?.[0]?.message?.content || "No AI response.";
        const firstQuoteMatch = fullText.match(/"(.*?)"/);
        const rewritten = firstQuoteMatch ? firstQuoteMatch[1] : fullText;
        return rewritten;

      } catch (err) {
        console.error("Fetch error:", err);
        modelIndex++;
      }
    }

    return "AI could not generate a response.";
  }

  async function updateRewrite() {
    if (aiToggle?.checked) {
      rewriteTextSpan.textContent = "Loading...";
      const rewritten = await fetchAIRewrite(note, selectedTone);
      rewriteTextSpan.textContent = rewritten;
      localStorage.setItem("rewrittenNote", rewritten);
    } else {
      rewriteTextSpan.textContent = note;
      localStorage.setItem("rewrittenNote", note);
    }
  }

  updateRewrite();

  toneButtons.forEach(button => {
    button.addEventListener("click", async () => {
      toneButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      selectedTone = button.textContent.trim();
      toneLabel.textContent = selectedTone.toLowerCase();
      await updateRewrite();
    });
  });

  aiToggle?.addEventListener("change", updateRewrite);
}

// --- CONFIRMATION PAGE ---
window.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("currentChore"));
  const rewrittenNote = localStorage.getItem("rewrittenNote");

  const iconEl = document.getElementById("choreIcon");
  const nameEl = document.getElementById("choreTitle");
  const noteEl = document.getElementById("choreNote");

  if (iconEl && nameEl && noteEl && data) {
    iconEl.src = data.icon || "assets/default-icon.svg";
    nameEl.textContent = data.name || "Unnamed chore";
    noteEl.textContent = rewrittenNote || data.note || "";
  }
});