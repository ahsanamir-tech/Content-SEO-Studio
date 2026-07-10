import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic, style, size } = await req.json();

    // Simulate image generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Determine dimensions for placeholder
    const [width, height] = (size || "1200x630").split('x');

    const pexelsKey = process.env.PEXELS_API_KEY;

    if (!pexelsKey) {
      return NextResponse.json(
        { error: 'PEXELS_API_KEY is not configured in .env.local' },
        { status: 500 }
      );
    }

    // Use Pexels API for real, highly-relevant stock photography
    const query = encodeURIComponent(topic || 'technology');
    
    // Determine orientation based on aspect ratio
    const isSquare = size === "1024x1024";
    const orientation = isSquare ? "square" : "landscape";
    
    const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=4&orientation=${orientation}`, {
      headers: {
        'Authorization': pexelsKey
      }
    });

    if (!pexelsRes.ok) {
      throw new Error(`Pexels API Error: ${pexelsRes.status}`);
    }

    const pexelsData = await pexelsRes.json();
    
    if (!pexelsData.photos || pexelsData.photos.length === 0) {
      throw new Error(`No images found on Pexels for "${topic}"`);
    }

    const mockImages = pexelsData.photos.map((photo: any, idx: number) => ({
      id: `img_${idx + 1}`,
      // Use the 'large2x' or 'large' image size from Pexels for high quality
      url: photo.src.large2x || photo.src.large,
      prompt: `Stock photo by ${photo.photographer} from Pexels`
    }));

    // If Pexels returned fewer than 4 images, duplicate the last one to fill the array
    while (mockImages.length < 4) {
      mockImages.push({...mockImages[mockImages.length - 1], id: `img_${mockImages.length + 1}`});
    }

    const metadata = {
      filename: `${(topic || 'feature-image').toLowerCase().replace(/\s+/g, '-')}-${style.toLowerCase()}.jpg`,
      altText: `Feature image for ${topic || 'article'} in ${style} style`,
      caption: `Generated using AI for ${topic || 'content strategy'}`,
    }

    return NextResponse.json({ images: mockImages, metadata });
  } catch (error: any) {
    console.error("Failed to generate image:", error);
    return NextResponse.json({ error: error.message || 'Failed to generate images' }, { status: 500 });
  }
}
