// Select elements
const analyzeButton = document.getElementById("analyze");
const outputDiv = document.getElementById("output");

// Click handler for the Analyze button
analyzeButton.addEventListener("click", async () => {
  const urls = document.getElementById("urls").value.trim().split("\n").filter(Boolean);
  if (urls.length === 0) {
    outputDiv.innerHTML = `<p class="error">Please enter at least one URL.</p>`;
    return;
  }

  outputDiv.innerHTML = "<p>Analyzing URLs...</p>";

  try {
    // Step 1: Get Ahrefs Data
    const ahrefsData = await getAhrefsData(urls);
    // Step 2: Get ChatGPT Recommendations
    const recommendations = await getChatGPTRecommendations(ahrefsData);
    // Step 3: Display Results
    displayResults(recommendations);
  } catch (error) {
    outputDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
});

// Function to call Ahrefs API
async function getAhrefsData(urls) {
  const ahrefsApiKey = "Ckjwrkmu3-Mf0zM4pS2fU7tpuZI1fLTTG_eA9-Zx";
  const ahrefsData = [];

  for (const url of urls) {
    const response = await fetch(`https://apiv2.ahrefs.com/?token=${ahrefsApiKey}&from=metrics&target=${encodeURIComponent(url)}&mode=exact`);
    const data = await response.json();
    if (data.error) throw new Error(`Ahrefs Error for ${url}: ${data.error.message}`);
    ahrefsData.push({ url, metrics: data.metrics });
  }

  return ahrefsData;
}

// Function to call ChatGPT API
async function getChatGPTRecommendations(ahrefsData) {
  const chatGptApiKey = "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";
  const recommendations = [];

  for (const data of ahrefsData) {
    const prompt = `
      Analyze the following URL's SEO metrics and suggest actionable updates to keep its content fresh:
      URL: ${data.url}
      Metrics: ${JSON.stringify(data.metrics)}

      Suggestions:
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${chatGptApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "system", content: "You are a helpful SEO assistant." }, { role: "user", content: prompt }],
      }),
    });

    const chatGptData = await response.json();
    if (chatGptData.error) throw new Error(`ChatGPT Error: ${chatGptData.error.message}`);

    recommendations.push({ url: data.url, suggestions: chatGptData.choices[0].message.content });
  }

  return recommendations;
}

// Function to display results
function displayResults(recommendations) {
  outputDiv.innerHTML = "<h3>Analysis Report</h3>";
  recommendations.forEach(rec => {
    outputDiv.innerHTML += `
      <div>
        <h4>URL: ${rec.url}</h4>
        <p>${rec.suggestions}</p>
      </div>
    `;
  });
}
