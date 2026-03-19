import { NextResponse } from 'next/server';
import { getLatestTagesschauVideo } from '@/lib/youtube';
import { supabase } from '@/lib/supabase';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';

// Initialize services
const resend = new Resend(process.env.RESEND_API_KEY || '');
const ai = new GoogleGenAI({}); // Automatically picks up GEMINI_API_KEY

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log('Cron job started...');
  try {
    // 1. Fetch latest video
    const video = await getLatestTagesschauVideo();
    console.log('Latest video:', video?.videoId);
    if (!video) {
      return NextResponse.json({ message: 'No current 20:00 video found.' }, { status: 404 });
    }

    // 2. Check if already processed
    const { data: existing, error: selectError } = await supabase
      .from('summaries')
      .select('id')
      .eq('video_id', video.videoId)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Video already processed.' });
    }

    // 3. Process with Gemini Video Understanding
    const prompt = `Analysiere die Tagesschau-Sendung und fülle die folgenden Sektionen aus. Nutze EXAKT diese Tags:

<themen>
(Listenbasierte Themenübersicht hier)
</themen>

<visuelles>
(Chronologische visuelle Beschreibung hier)
</visuelles>

<transkript>
(Vollständiges wörtliches Transkript hier)
</transkript>`;
    
    const contents = [
      {
        fileData: {
          fileUri: video.url,
          mimeType: "video/mp4"
        },
      },
      { text: prompt }
    ];

    const modelResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: "Du bist ein präziser News-Analyst. Antworte ausschließlich im XML-Format mit den Tags <themen>, <visuelles> und <transkript>. Vermische die Sektionen nicht. Schreibe auf Deutsch.",
        maxOutputTokens: 8192,
        temperature: 0.2,
      }
    });

    const summaryText = modelResponse.text;

    // 4. Save to Supabase
    const { error: dbError } = await supabase.from('summaries').insert({
      video_id: video.videoId,
      title: video.title,
      summary: summaryText,
      published_at: video.publishedAt
    });

    if (dbError) throw dbError;

    // 5. Send Email via Resend
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.RESEND_TO_EMAIL || 'test@example.com',
      subject: `Neue Tagesschau Zusammenfassung: ${video.title}`,
      text: summaryText || 'Zusammenfassung konnte nicht generiert werden.',
    });

    return NextResponse.json({ message: 'Success', videoId: video.videoId });
  } catch (error: any) {
    console.error('Error processing cron job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
