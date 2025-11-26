import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const peopleDir = path.join(process.cwd(), 'public', 'images', 'people');
    const files = fs.readdirSync(peopleDir);

    // Filter for image files
    const imageFiles = files.filter(file =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
    );

    // Convert to public URLs
    const images = imageFiles.map(file => `/images/people/${file}`);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error reading people images:', error);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}
