import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs-extra';
import { spawnSync } from 'child_process';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('image') as File;
    const projectId = form.get('projectId');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const sceneId = `${timestamp}`;
    const uploadPath = path.resolve(`./public/uploads/${projectId}`, `${sceneId}.jpg`);
    const outputDir = path.resolve(`./public/uploads/${projectId}`);
    const finalDir = path.resolve(`./public/uploads/projects/${projectId}/${sceneId}`);

    fs.mkdirpSync(path.dirname(uploadPath));
    fs.mkdirpSync(outputDir);
    fs.mkdirpSync(finalDir);

    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(uploadPath, Buffer.from(arrayBuffer));

    // Call Krpano
    const krpanoExe = path.resolve('./krpano-1.22.4/krpanotools.exe');
    const result = spawnSync(
      `"${krpanoExe}" makepano -config=templates/normal.config "${uploadPath}"`,
      { shell: true, cwd: outputDir, encoding: 'utf-8' }
    );


    if (result.status !== 0) {
      return NextResponse.json({ error: 'Krpano failed', details: result.stderr || result.stdout }, { status: 500 });
    }

    // Copy tiles to finalDir
    const tilesInputDir = path.resolve(outputDir, `${sceneId}/${sceneId}.tiles`);
    const faceMap = {
      'pano_r.jpg': 'px.jpg',
      'pano_l.jpg': 'nx.jpg',
      'pano_u.jpg': 'py.jpg',
      'pano_d.jpg': 'ny.jpg',
      'pano_f.jpg': 'pz.jpg',
      'pano_b.jpg': 'nz.jpg',
    };

    const publicFacePaths: string[] = [];

    for (const [srcName, destName] of Object.entries(faceMap)) {
      const src = path.join(tilesInputDir, srcName);
      const dest = path.join(finalDir, destName);
      if (fs.existsSync(src)) {
        fs.moveSync(src, dest, { overwrite: true });
        publicFacePaths.push(`http://localhost:3000/uploads/projects/${projectId}/${sceneId}/${destName}`);
      } else {
        console.warn('❗ Missing tile:', src);
      }
    }

    // Move original
    const originalDest = path.join(finalDir, 'original.jpg');
    fs.moveSync(uploadPath, originalDest, { overwrite: true });

    // Cleanup
    fs.removeSync(outputDir);

    return NextResponse.json({
      message: '✅ Success',
      sceneId,
      original: `http://localhost:3000/uploads/projects/${projectId}/${sceneId}/original.jpg`,
      paths: publicFacePaths,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
