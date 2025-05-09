import fetch from 'node-fetch';

const API_KEY = process.env.HUGGING_FACE_API_KEY;

// Test DialoGPT models specifically designed for conversational AI
const MODELS_TO_TEST = [
  'microsoft/DialoGPT-small',
  'microsoft/DialoGPT-medium',
  'microsoft/DialoGPT-large'
];

async function testModelAccess(modelId: string) {
  console.log(`Testing access to model: ${modelId}`);
  
  try {
    // Set up abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'Hello, I need a business loan for my restaurant.',
          parameters: {
            max_new_tokens: 50,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true
          }
        }),
        signal: controller.signal
      }
    );
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Access granted! Sample response:');
      console.log(JSON.stringify(data).substring(0, 200) + '...');
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Access denied or error:');
      console.log(response.status, error);
      return false;
    }
  } catch (error: any) {
    console.log('❌ Error testing access:');
    console.log(error.message || error);
    return false;
  }
}

async function testAllModels() {
  console.log('=== Testing Hugging Face API Key Access to Conversational Models ===');
  console.log(`API Key starts with: ${API_KEY?.substring(0, 4)}...`);
  
  for (const model of MODELS_TO_TEST) {
    console.log('\n-----------------------------------');
    await testModelAccess(model);
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testAllModels().catch(console.error);