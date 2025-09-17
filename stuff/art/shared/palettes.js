const RAW_PALETTES = [
    ['f94144', 'f3722c', 'f8961e', 'f9844a', 'f9c74f', '90be6d', '43aa8b', '4d908e', '577590', '277da1'],
    ['d9ed92', 'b5e48c', '99d98c', '76c893', '52b69a', '34a0a4', '168aad', '1a759f', '1e6091', '184e77'],
    ['03071e', '370617', '6a040f', '9d0208', 'd00000', 'dc2f02', 'e85d04', 'f48c06', 'faa307', 'ffba08'],
    ['f72585', 'b5179e', '7209b7', '560bad', '480ca8', '3a0ca3', '3f37c9', '4361ee', '4895ef', '4cc9f0'],
    ['edc4b3', 'e6b8a2', 'deab90', 'd69f7e', 'cd9777', 'c38e70', 'b07d62', '9d6b53', '8a5a44', '774936'],
    ['0b090a', '161a1d', '660708', 'a4161a', 'ba181b', 'e5383b', 'b1a7a6', 'd3d3d3', 'f5f3f4', 'ffffff'],
    ['ef476f', 'ffd166', '06d6a0', '118ab2', '073b4c']
];

const NORMALIZED_PALETTES = RAW_PALETTES.map((palette) =>
    palette.map((color) => (color.startsWith('#') ? color : `#${color}`))
);

export function clonePalettes() {
    return NORMALIZED_PALETTES.map((palette) => [...palette]);
}

export function getPalette(index = 0) {
    const palettes = clonePalettes();
    return palettes[index] || palettes[0];
}

export const paletteCount = NORMALIZED_PALETTES.length;
