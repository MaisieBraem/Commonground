import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ynweuhvuggonnbmdtvyi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud2V1aHZ1Z2dvbm5ibWR0dnlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5Nzc3NDUsImV4cCI6MjA2NjU1Mzc0NX0.j4sXGBeioHZ0keLKaonS92hEiLKwXfbjg9IHP8gGMd0';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONFIG ---
const API_key = 'Bearer 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';
const endpoint = "https://openrouter.ai/api/v1/chat/completions";
const models = ['openai/gpt-4.1-nano-2025-04-14', 'mistralai/mistral-small-3.2-24b-instruct:free'];

const originalMessage = localStorage.getItem("userFeedback") || "[No message]";
const originalTextEl = document.getElementById("originalMessage");
const rewrittenTextEl = document.getElementById("rewrittenMessage");
const toneTagsEl = document.getElementById("toneTags");

const selectedTone = ["Constructive suggestions", "Friendly tone", "More encouraging"];
originalTextEl.textContent = originalMessage;
rewrittenTextEl.textContent = "Generating...";

// --- TONE TAG RENDER ---
function renderToneTags() {
  toneTagsEl.innerHTML = "";
  selectedTone.forEach(tone => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = tone;
    toneTagsEl.appendChild(tag);
  });
}

// --- FETCH AI REWRITE ---
async function fetchAIRewrite(note, toneList) {
  const tone = toneList.join(", ");
  const prompt = `Please rewrite the following feedback in a more ${tone.toLowerCase()} tone. Only return the rewritten sentence:\n\n${note}`;

  for (const model of models) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": API_key,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await res.json();
      if (data.error) {
        console.warn(`Model error (${model}):`, data.error.message);
        continue;
      }

      const content = data.choices?.[0]?.message?.content;
      return content || "No valid response from AI.";
    } catch (err) {
      console.error("Error contacting AI:", err);
    }
  }

  return "AI could not generate a response.";
}

// --- MAIN UPDATE FUNCTION ---
async function updateRewrite() {
  if (!originalMessage || originalMessage === "[No message]") {
    rewrittenTextEl.textContent = "Please go back and enter a message.";
    return;
  }

  rewrittenTextEl.textContent = "Loading...";
  const result = await fetchAIRewrite(originalMessage, selectedTone);
  rewrittenTextEl.textContent = result;
  localStorage.setItem("aiRewrittenFeedback", result);
}

// --- EVENT HANDLERS ---
document.getElementById("tryAgainBtn")?.addEventListener("click", updateRewrite);

document.getElementById("editOriginalBtn")?.addEventListener("click", () => {
  window.location.href = "edit-feedback.html";
});

document.getElementById("sendFeedbackBtn")?.addEventListener("click", async () => {
  const rewrittenText = rewrittenTextEl?.textContent;
  localStorage.setItem("finalFeedback", rewrittenText || "No message available.");

  // Save to Supabase (optional)
  const { data, error } = await supabase.from("feedback").insert([
    {
      chore: "Dishes",               // Change dynamically if needed
      message: rewrittenText,
      tone: selectedTone.join(", "),
      ai: true,
      user: "Alex"
    }
  ]);
  if (error) console.error("Supabase insert error:", error);

  window.location.href = "feedback-sent.html";
});

// --- INIT ---
renderToneTags();
updateRewrite();
