import fetch from 'node-fetch';

async function testHuggingFaceEndpoint() {
  console.log('Testing Hugging Face Inference API general access...');
  
  try {
    // Basic test to see if we can connect to the Hugging Face API
    const API_KEY = process.env.HUGGING_FACE_API_KEY;
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    if (response.ok) {
      // If the response is successful, we at least have basic API access
      console.log('✅ Successfully connected to Hugging Face API');
      console.log(`Response status: ${response.status}`);
      
      try {
        const data = await response.json();
        console.log('Available models:', JSON.stringify(data, null, 2).substring(0, 1000));
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API connection failed');
      console.log(`Status: ${response.status}, Error: ${errorText}`);
    }
    
    // Let's test with a simple text generation endpoint that should be available to everyone
    console.log('\nTesting text generation with default model...');
    const completionResponse = await fetch(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'Hello, I need a business loan for my restaurant because',
          parameters: {
            max_new_tokens: 50,
            temperature: 0.7,
            return_full_text: false
          }
        })
      }
    );
    
    if (completionResponse.ok) {
      const completionData = await completionResponse.json();
      console.log('✅ Text generation successful:');
      console.log(JSON.stringify(completionData).substring(0, 300) + '...');
      
      // If we can access GPT-2, let's implement it
      console.log('\n✅ GPT-2 is accessible, we can use this as a fallback model.');
    } else {
      const errorText = await completionResponse.text();
      console.log('❌ Text generation failed:');
      console.log(`Status: ${completionResponse.status}, Error: ${errorText}`);
    }
    
  } catch (error: any) {
    console.log('❌ Error during test:');
    console.log(error.message || error);
  }
}

// Run the test
testHuggingFaceEndpoint().catch(console.error);