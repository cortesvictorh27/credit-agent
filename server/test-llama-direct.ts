import fetch from "node-fetch";

async function testLlamaApiAccess() {
  console.log("Testing Llama API access...");
  
  const API_KEY = process.env.LLAMA_API_KEY;
  if (!API_KEY) {
    console.error("❌ LLAMA_API_KEY environment variable is not set.");
    return;
  }
  
  console.log(`API Key starts with: ${API_KEY.substring(0, 4)}...`);
  
  const url = "https://api.llama-api.com/chat/completions";
  
  const payload = {
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "You are a helpful AI assistant that helps with business loan qualification."
      },
      {
        role: "user",
        content: "I need a $50,000 loan for my restaurant business that's been operating for 3 years."
      }
    ],
    temperature: 0.7,
    max_tokens: 200
  };
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Llama API request successful!");
      console.log("Response:", data.choices[0].message.content.substring(0, 200) + "...");
    } else {
      const errorText = await response.text();
      console.log("❌ Llama API request failed:");
      console.log(errorText);
    }
  } catch (error: any) {
    console.error("❌ Error connecting to Llama API:", error.message);
  }
}

testLlamaApiAccess().catch(console.error);