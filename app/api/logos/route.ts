import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logosDir = path.join(process.cwd(), 'public', 'images', 'logos');

    // Create directory if it doesn't exist
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }

    const files = fs.readdirSync(logosDir);

    // Filter for image files
    const imageFiles = files.filter(file =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
    );

    // Convert to public URLs
    const images = imageFiles.map(file => `/images/logos/${file}`);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error reading logo images:', error);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}
