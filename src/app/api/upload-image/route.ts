import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const projectId = formData.get('projectId')?.toString();

  if (!file || !projectId) {
    return NextResponse.json({ error: 'Thiếu file hoặc projectId' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), `/public/uploads/projects/${projectId}/richtext`);
  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filepath, buffer);

  const imageUrl = `/uploads/projects/${projectId}/richtext/${filename}`;
  return NextResponse.json({ url: imageUrl });
}
