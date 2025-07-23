// app/api/jarvis/route.ts
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message,launguage } = await request.json();

    // Ollama API को कॉल करें
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llava:latest', // यहां आपके इंस्टॉल किए मॉडल का नाम डालें 
        messages: [{ role: 'user', content: message }],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ response: data.message.content });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}