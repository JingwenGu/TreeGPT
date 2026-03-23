require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    console.log("messages", messages);

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'message'." });
    }

    const response = await client.responses.create({
      model: "gpt-5.2",
      input: [
        {
          role: "system",
          content: `
    You are a helpful assistant.
    When writing mathematics:
    - use inline LaTeX wrapped in single dollar signs, like $a^2+b^2=c^2$
    - use display equations wrapped in double dollar signs, like $$\\int_0^1 x^2 dx = \\frac{1}{3}$$
    - do not put math inside code blocks unless the user explicitly asks for LaTeX source code
          `,
        },
        ...messages,
      ],
    });

    res.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({
      error: "Failed to get response from OpenAI.",
    });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on ${port}`));