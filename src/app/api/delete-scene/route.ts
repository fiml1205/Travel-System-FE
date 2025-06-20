import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export async function POST(req: NextRequest) {
  const { projectId, sceneId } = await req.json();

  if (!projectId || !sceneId) {
    return NextResponse.json({ error: 'Missing projectId or sceneId' }, { status: 400 });
  }

  try {
    const sceneFolder = path.resolve(`./public/uploads/projects/${projectId}/${sceneId}`);
    await fs.remove(sceneFolder);
    return NextResponse.json({ message: '✅ Xoá thành công' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Xoá thất bại' }, { status: 500 });
  }
}
