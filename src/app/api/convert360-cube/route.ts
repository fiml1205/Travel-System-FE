import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs-extra';
import { spawnSync } from 'child_process';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('image') as File;
    const projectID = form.get('projectID')

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const sceneId = `scene_${timestamp}`;
    const uploadPath = path.resolve('./public/uploads', `${sceneId}.jpg`);
    const outputDir = path.resolve('./public/uploads');

    fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(uploadPath, Buffer.from(arrayBuffer));

    //  Gọi Krpano để tạo cube map
    const krpanoExe = path.resolve('./krpano-1.22.4/krpanotools.exe');

    const result = spawnSync(
      `"${krpanoExe}" makepano -config=templates/normal.config "${uploadPath}"`,
      {
        shell: true,
        cwd: outputDir,
        encoding: 'utf-8',
      }
    );

    if (result.status !== 0) {
      return NextResponse.json({
        error: 'Krpano processing failed',
        details: result.stderr || result.stdout || 'No output',
      }, { status: 500 });
    }

    const tilesInputDir = path.resolve(outputDir, `${sceneId}/${sceneId}.tiles`);
    const tilesTarget = path.resolve(`./public/projects/${projectID}`, sceneId);
    fs.mkdirSync(tilesTarget, { recursive: true });

    const faceMap = {
      'pano_r.jpg': 'px.jpg',
      'pano_l.jpg': 'nx.jpg',
      'pano_u.jpg': 'py.jpg',
      'pano_d.jpg': 'ny.jpg',
      'pano_f.jpg': 'pz.jpg',
      'pano_b.jpg': 'nz.jpg',
    };

    for (const [srcName, destName] of Object.entries(faceMap)) {
      const src = path.join(tilesInputDir, srcName);
      const dest = path.join(tilesTarget, destName);
      if (fs.existsSync(src)) {
        fs.moveSync(src, dest, { overwrite: true });
      } else {
        console.warn('Không tìm thấy file:', src);
      }
    }

    const originalSrc = uploadPath;
    const originalDest = path.join(tilesTarget, 'original.jpg');
    if (fs.existsSync(originalSrc)) {
      fs.moveSync(originalSrc, originalDest, { overwrite: true });
    }
    fs.removeSync(path.resolve(outputDir, sceneId));

    return NextResponse.json({
      message: '✅ Success',
      sceneId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
