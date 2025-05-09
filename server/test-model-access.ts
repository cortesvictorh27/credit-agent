import fetch from 'node-fetch';

async function testHuggingFaceAccess() {
  try {
    console.log("Testing Hugging Face API access...");
    
    // A list of model IDs to check
    const modelIds = [
      "google/flan-t5-small",
      "facebook/bart-large-cnn",
      "mistralai/Mistral-7B-Instruct-v0.2",
      "meta-llama/Llama-2-7b-chat-hf",
      "microsoft/DialoGPT-medium",
      "gpt2"
    ];
    
    for (const modelId of modelIds) {
      const apiUrl = `https://api-inference.huggingface.co/models/${modelId}`;
      
      console.log(`Testing access to model: ${modelId}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`
        }
      });
      
      console.log(`Model: ${modelId}, Status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Error details: ${errorText}`);
      }
    }
  } catch (error) {
    console.error("Error testing model access:", error);
  }
}

// Run the test
testHuggingFaceAccess();