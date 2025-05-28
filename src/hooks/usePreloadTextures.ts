import * as THREE from "three";

const faceNames = ["px", "nx", "py", "ny", "pz", "nz"];

export async function preloadCubeTextures(sceneId: string, projectId: number): Promise<THREE.Texture[]> {
  const loader = new THREE.TextureLoader();
  const faces = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];

  const textures = await Promise.all(
    faces.map(face =>
      loader.loadAsync(`/projects/${projectId}/${sceneId}/${face}.jpg`)
    )
  );

  return textures;
}
