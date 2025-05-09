import fetch from 'node-fetch';

async function testDirectAccess() {
  console.log('Testing direct access to DialoGPT via Hugging Face API...');
  
  const API_KEY = process.env.HUGGING_FACE_API_KEY;
  console.log(`API Key starts with: ${API_KEY?.substring(0, 4)}...`);
  
  // Different URL format based on HF docs
  const url = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-small';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          text: "Hello, I need a business loan for my restaurant."
        }
      })
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Response:');
      console.log(JSON.stringify(data).substring(0, 300));
    } else {
      const errorText = await response.text();
      console.log('Error:');
      console.log(errorText);
    }
  } catch (error: any) {
    console.log('Exception:');
    console.log(error.message || error);
  }
}

testDirectAccess().catch(console.error);