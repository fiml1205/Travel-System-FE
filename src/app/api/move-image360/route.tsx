import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export async function POST(req: NextRequest) {
  const { userId, projectId } = await req.json();

  const fromDir = path.resolve(`./public/uploads/${userId}`);
  const toDir = path.resolve(`./public/projects/${projectId}`);

  try {
    await fs.move(fromDir, toDir, { overwrite: true });
    return NextResponse.json({ message: '✅ Di chuyển thư mục thành công' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi di chuyển' }, { status: 500 });
  }
}
