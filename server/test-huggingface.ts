import fetch from 'node-fetch';

// Endpoint for the Hugging Face API (using BART which we know works)
const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

// Helper function to delay execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to test the Hugging Face API with a simple prompt and timeout
async function testHuggingFaceAPI() {
  try {
    console.log("Testing Hugging Face API...");
    
    // Simple prompt using the BART summarization style
    const prompt = "Summarize this: The financial technology sector has seen tremendous growth in recent years, with companies developing innovative solutions for lending, payments, and investment management. These advancements are making financial services more accessible to small businesses and consumers alike.";
    
    console.log("Sending prompt:", prompt);
    
    // Create an AbortController to handle timeout
    const controller = new AbortController();
    const timeoutMs = 10000; // 10 seconds
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 75,  // Shorter output for faster response
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
            return_full_text: false
          }
        }),
        signal: controller.signal
      });
      
      // Clear the timeout once we get a response
      clearTimeout(timeoutId);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error from Hugging Face API: ${response.status} ${errorText}`);
        return;
      }
      
      const data = await response.json();
      console.log("Response data:", JSON.stringify(data, null, 2));
      
      if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
        console.log("Generated text:", data[0].generated_text.trim());
      } else {
        console.error("Unexpected response format:", data);
      }
    } catch (err: any) {
      // Clear timeout if there's an error
      clearTimeout(timeoutId);
      
      if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
        console.error("Request timed out after", timeoutMs / 1000, "seconds");
      } else {
        console.error("Error during API request:", err);
      }
    }
  } catch (error) {
    console.error("Error in test function:", error);
  }
}

// Run the test
testHuggingFaceAPI();