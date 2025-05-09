import fetch from 'node-fetch';

async function testHuggingFaceGPT2() {
  console.log('Testing Hugging Face Inference API with GPT-2 model...');
  
  try {
    const API_KEY = process.env.HUGGING_FACE_API_KEY;
    console.log(`API Key starts with: ${API_KEY?.substring(0, 4)}...`);
    
    // Test with GPT-2 which should be universally available
    const response = await fetch(
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
    
    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ GPT-2 response successful:');
      console.log(JSON.stringify(data).substring(0, 300) + '...');
    } else {
      const errorText = await response.text();
      console.log('❌ GPT-2 request failed:');
      console.log(errorText);
    }
    
    // Try with text-classification instead
    console.log('\nTesting text classification...');
    const classificationResponse = await fetch(
      'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'I love this business loan service! They were very helpful.'
        })
      }
    );
    
    console.log(`Classification response status: ${classificationResponse.status}`);
    
    if (classificationResponse.ok) {
      const classData = await classificationResponse.json();
      console.log('✅ Classification response successful:');
      console.log(JSON.stringify(classData).substring(0, 300));
    } else {
      const errorText = await classificationResponse.text();
      console.log('❌ Classification request failed:');
      console.log(errorText);
    }
    
    // Try a different text generation model - BERT
    console.log('\nTesting BERT masked word prediction...');
    const bertResponse = await fetch(
      'https://api-inference.huggingface.co/models/bert-base-uncased',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'The restaurant business [MASK] a loan for expansion.'
        })
      }
    );
    
    console.log(`BERT response status: ${bertResponse.status}`);
    
    if (bertResponse.ok) {
      const bertData = await bertResponse.json();
      console.log('✅ BERT response successful:');
      console.log(JSON.stringify(bertData).substring(0, 300));
    } else {
      const errorText = await bertResponse.text();
      console.log('❌ BERT request failed:');
      console.log(errorText);
    }
    
  } catch (error: any) {
    console.log('❌ Error during test:');
    console.log(error.message || error);
  }
}

// Run the test
testHuggingFaceGPT2().catch(console.error);