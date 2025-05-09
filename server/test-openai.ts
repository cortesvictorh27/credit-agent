import OpenAI from "openai";

async function testOpenAIConnection() {
  console.log("Testing OpenAI API connection...");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ OPENAI_API_KEY environment variable is not set.");
    return;
  }

  console.log(`API Key starts with: ${apiKey.substring(0, 4)}...`);

  const openai = new OpenAI({ apiKey });

  try {
    // Testing with a simple completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, I need a business loan for my restaurant." }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    console.log("✅ OpenAI API connection successful!");
    console.log("Sample response:", completion.choices[0].message.content?.substring(0, 100) + "...");

    // Testing with structured output via json_object
    console.log("\nTesting structured JSON output...");
    const jsonCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "Extract business loan information into JSON. Include fields: businessType, yearsInBusiness, creditScore if mentioned."
        },
        { 
          role: "user", 
          content: "I run a restaurant that's been open for 3 years. We have good credit around 720."
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    console.log("✅ JSON response successful!");
    console.log("JSON structure:", jsonCompletion.choices[0].message.content);
  } catch (error: any) {
    console.error("❌ Error connecting to OpenAI API:", error.message);
    console.error("Status:", error.status);
    console.error("Details:", error.response?.data || error);
  }
}

testOpenAIConnection().catch(console.error);