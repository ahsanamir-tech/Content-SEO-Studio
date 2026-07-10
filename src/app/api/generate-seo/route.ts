import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { content, keyword, country, type } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    // Handle summary requests from HTML Cleaner
    if (type === 'summary') {
      const summaryPrompt = `Summarize the following content in exactly 2-3 concise sentences for SEO purposes. Focus on the main topic, key points, and target audience. Return ONLY the summary text, nothing else.\n\nContent:\n${content.substring(0, 3000)}`;

      const summaryRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: summaryPrompt }] }],
        })
      });

      if (!summaryRes.ok) {
        const errJson = await summaryRes.json().catch(() => null);
        throw new Error(errJson?.error?.message || "Failed to generate summary");
      }

      const summaryData = await summaryRes.json();
      const summaryText = summaryData.candidates?.[0]?.content?.parts?.[0]?.text;
      return NextResponse.json({ summary: summaryText?.trim() || '' });
    }

    const prompt = `
You are an expert SEO specialist. Analyze the following content and generate highly optimized SEO metadata.
Target Keyword: ${keyword || 'Automatically extract the best keyword'}
Target Country/Audience: ${country || 'Global'}

Content:
${content.substring(0, 15000)}

Return ONLY a valid JSON object with the following exact structure. Ensure valid JSON without any markdown formatting or comments.
{
  "primaryKeyword": "string",
  "intent": "Informational | Transactional | Navigational | Commercial",
  "secondaryKeywords": ["string", "string"],
  "titles": [
    { "text": "string (50-60 chars)", "score": 95, "length": 55, "width": 450 }
  ],
  "descriptions": [
    { "text": "string (140-160 chars)", "score": 95, "length": 150 }
  ],
  "slug": "string (lowercase with hyphens)",
  "ogMetadata": {
    "title": "string",
    "description": "string"
  },
  "twitterMetadata": {
    "title": "string",
    "description": "string"
  },
  "schema": {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "string",
    "description": "string",
    "author": { "@type": "Person", "name": "Content Studio" },
    "datePublished": "2024-01-01"
  },
  "insights": {
    "readingTime": 5,
    "wordCount": 1000,
    "keywordDensity": "2.5%",
    "readabilityScore": 80,
    "entities": ["string"]
  },
  "checklist": [
    { "task": "Keyword in title", "passed": true },
    { "task": "Keyword in meta description", "passed": true },
    { "task": "Keyword in URL", "passed": true },
    { "task": "Heading structure good", "passed": true },
    { "task": "Internal linking opportunities", "passed": false }
  ]
}
Make sure to provide 5 items for titles, 5 items for descriptions, and exactly the structure shown.
`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error?.message || "Failed to generate SEO from Gemini");
    }

    const data = await res.json();
    const textRes = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textRes) {
      throw new Error("Invalid response format from Gemini");
    }

    let seoData;
    try {
      seoData = JSON.parse(textRes);
    } catch (e) {
      // Fallback manual parsing if Gemini accidentally includes markdown codeblocks
      const cleanedText = textRes.replace(/```json/g, '').replace(/```/g, '').trim();
      seoData = JSON.parse(cleanedText);
    }

    return NextResponse.json(seoData);
  } catch (error: any) {
    console.error("SEO Generation Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to generate SEO metadata' }, { status: 500 });
  }
}
