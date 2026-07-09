import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not defined");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Call Resend API using standard fetch
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        // By default Resend provides this test email to send *from* on free tier
        from: 'Contact Form <onboarding@resend.dev>',
        to: 'abdul.rehman.tahir7377@gmail.com',
        subject: `New Contact Form Message from ${name}`,
        html: `
          <h3>You have a new message from the Raptim Contact Form</h3>
          <p><strong>Name: </strong> ${name}</p>
          <p><strong>Email: </strong> ${email}</p>
          <p><strong>Message: </strong></p>
          <p style="white-space: pre-wrap; padding: 12px; background: #f3f4f6; border-radius: 6px;">${message}</p>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API Error:", data);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Message sent successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Contact Form Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
