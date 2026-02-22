#!/bin/bash
# Скрипт генерации PNG-иконок для PWA из SVG-источника
# Требует: imagemagick (apt install imagemagick)

set -e

ICONS_DIR="public/icons"
mkdir -p "$ICONS_DIR"

# Создаём SVG-иконку (фиолетовый круг с таблеткой)
cat > /tmp/icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#7e57c2"/>
  <text x="256" y="320" font-size="280" text-anchor="middle" fill="white">💊</text>
</svg>
EOF

SIZES=(72 96 128 144 152 192 384 512)

for SIZE in "${SIZES[@]}"; do
  echo "Генерация иконки ${SIZE}x${SIZE}..."
  convert -background none -resize "${SIZE}x${SIZE}" /tmp/icon.svg \
    "${ICONS_DIR}/icon-${SIZE}x${SIZE}.png" 2>/dev/null || \
    # Если convert недоступен — создаём заглушку
    python3 -c "
import struct, zlib

def create_png(size, color=(126, 87, 194, 255)):
    width = height = size
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'
        for x in range(width):
            raw_data += bytes(color)
    
    def make_chunk(chunk_type, data):
        chunk_len = len(data)
        chunk_data = chunk_type + data
        crc = zlib.crc32(chunk_data) & 0xffffffff
        return struct.pack('>I', chunk_len) + chunk_data + struct.pack('>I', crc)
    
    png = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    png += make_chunk(b'IHDR', ihdr_data)
    compressed = zlib.compress(raw_data)
    png += make_chunk(b'IDAT', compressed)
    png += make_chunk(b'IEND', b'')
    return png

with open('${ICONS_DIR}/icon-${SIZE}x${SIZE}.png', 'wb') as f:
    f.write(create_png($SIZE))
print('  Создана заглушка ${SIZE}x${SIZE}')
"
done

echo "Готово! Иконки в ${ICONS_DIR}/"
