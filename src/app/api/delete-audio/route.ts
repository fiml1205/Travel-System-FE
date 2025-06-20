import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export async function POST(req: NextRequest) {
  const { projectId, sceneId } = await req.json();
  if (!projectId || !sceneId) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  const filePath = path.resolve(`./public/uploads/projects/${projectId}/${sceneId}/audio.mp3`);
  try {
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
    return NextResponse.json({ message: '✅ Đã xoá audio' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Xoá thất bại' }, { status: 500 });
  }
}
