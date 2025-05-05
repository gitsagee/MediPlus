const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(require("cors")());

// Sample ailments DB
const ailments = [
  {
    ailment: "COVID-19",
    symptoms: ["fever", "cough", "fatigue", "loss of taste"],
    diet: ["stay hydrated", "vitamin C", "light meals"]
  },
  {
    ailment: "Migraine",
    symptoms: ["headache", "nausea", "sensitivity to light"],
    diet: ["avoid caffeine", "magnesium-rich foods"]
  },
  {
    ailment: "Anemia",
    symptoms: ["fatigue", "pale skin", "headache"],
    diet: ["iron-rich food", "leafy greens", "vitamin B12"]
  }
];

// Helper to normalize and extract keywords
function extractSymptoms(text) {
  const knownSymptoms = new Set([
    "fever", "cough", "fatigue", "loss of taste", "headache",
    "nausea", "sensitivity to light", "pale skin"
  ]);

  const words = text.toLowerCase().split(/[^a-zA-Z]+/);
  return new Set(words.filter(word => knownSymptoms.has(word)));
}

app.post("/chatbot", (req, res) => {
  const message = req.body.message || "";
  const userSymptoms = extractSymptoms(message);

  const results = [];

  for (const entry of ailments) {
    const match = entry.symptoms.filter(symptom => userSymptoms.has(symptom));
    if (match.length > 0) {
      results.push({
        ailment: entry.ailment,
        matchedSymptoms: match,
        matchScore: match.length,
        diet: entry.diet
      });
    }
  }

  results.sort((a, b) => b.matchScore - a.matchScore);

  if (results.length === 0) {
    return res.json({ response: "Sorry, I couldn't match any ailment based on your symptoms." });
  }

  let response = `Based on your symptoms, you may have: ${results
    .slice(0, 2)
    .map(r => r.ailment)
    .join(", ")}.\n`;

  for (const r of results.slice(0, 2)) {
    response += `\n🩺 *${r.ailment}*\nMatched symptoms: ${r.matchedSymptoms.join(", ")}\nRecommended diet: ${r.diet.join(", ")}\n`;
  }

  return res.json({ response });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
