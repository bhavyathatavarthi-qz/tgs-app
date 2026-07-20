const Groq = require('groq-sdk');
const config = require('./config');

let clientSingleton = null;
function getClient() {
  if (!config.groqApiKey) {
    throw new Error(
      'GROQ_API_KEY is not set. Copy .env.example to .env and add your key from https://console.groq.com/keys'
    );
  }
  if (!clientSingleton) {
    clientSingleton = new Groq({
      apiKey: config.groqApiKey,
      fetch: globalThis.fetch,
    });
  }
  return clientSingleton;
}

/**
 * Sends a system + user prompt pair to Groq and returns the raw text
 * response. Requests JSON-object mode so the model is constrained to emit
 * valid JSON matching the schema described in the prompt.
 */
async function callGroqJSON({ systemPrompt, userPrompt, temperature = 0.2 }) {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: config.groqModel,
    temperature,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Groq returned an empty response.');
  }
  return content;
}

module.exports = { getClient, callGroqJSON };
