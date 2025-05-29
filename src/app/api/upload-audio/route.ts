import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('audio') as File;
  const projectId = form.get('projectId') as string;
  const sceneId = form.get('sceneId') as string;

  if (!file || !projectId || !sceneId) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  const audioDir = path.resolve(`./public/uploads/projects/${projectId}/${sceneId}`);
  await fs.mkdirp(audioDir);
  const filePath = path.join(audioDir, 'audio.mp3');

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return NextResponse.json({
    message: '✅ Upload thành công',
    audio: `/uploads/projects/${projectId}/${sceneId}/audio.mp3`,
  });
}
