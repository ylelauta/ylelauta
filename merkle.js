// Lasketaan SHA-256 hash annetulle datalle
async function hashData(data) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Rakentaa Merkle-puun annetuista lehdistä
export async function buildMerkleTree(leaves) {
  // Hashataan kaikki lehdet
  const hashedLeaves = await Promise.all(leaves.map((leaf) => hashData(leaf)));

  // Rakennetaan puu
  let currentLevel = hashedLeaves;

  while (currentLevel.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1] || left; // Jos paria ei ole, käytä yksittäistä solmua
      const combined = await hashData(left + right);
      nextLevel.push(combined);
    }
    currentLevel = nextLevel;
  }

  // Palautetaan juuri ja kaikki tasot
  return {
    root: currentLevel[0],
    levels: [hashedLeaves, ...currentLevel],
  };
}

// Validoi tietyn lehden osana Merkle-puuta
export async function validateMerkleProof(leaf, proof, root) {
  let computedHash = await hashData(leaf);

  for (const { hash, position } of proof) {
    if (position === 'left') {
      computedHash = await hashData(hash + computedHash);
    } else if (position === 'right') {
      computedHash = await hashData(computedHash + hash);
    }
  }

  return computedHash === root;
}

// Esimerkki käyttö
(async () => {
  const leaves = ['data1', 'data2', 'data3', 'data4'];

  // Rakennetaan Merkle-puu
  const merkleTree = await buildMerkleTree(leaves);
  console.log('Merkle-puun juuri:', merkleTree.root);

  // Validoidaan yksi lehti
  const proof = [
    { hash: await hashData('data2'), position: 'right' },
    { hash: await hashData(await hashData('data3') + await hashData('data4')), position: 'right' },
  ];
  const isValid = await validateMerkleProof('data1', proof, merkleTree.root);
  console.log(`Validointi ${isValid ? 'onnistui' : 'epäonnistui'}`);
})();
