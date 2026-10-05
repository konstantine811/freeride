# Зображення головної сторінки

Створені вбудованим інструментом image_gen (навичка imagegen).

Промпти:

- hero.png: Photorealistic wide 16:9 editorial photo of a snowboarder in white jacket carving deep powder in the left foreground; snowy Carpathian fir forests, valley fog and open blue sky on the right; cool navy and white palette, pale golden sunlight. No text, logos or watermark.
- hiking.png: Photorealistic wide 16:9 editorial photo of three ski touring hikers with backpacks seen from behind on the center-right; snowy Carpathian forests, mountains, valley fog and warm sunrise; darker open landscape on the left for text. No text, logos or watermark.
- gear.png: Photorealistic wide 16:9 editorial photo of a black snowboard with bindings leaning against a dark expedition backpack in the right foreground; snowy Carpathian forests and rolling ridges, blue sky and pale warm sunlight. No text, logos or watermark.

Зображення ілюстративні та не є фотографіями реальних подій проєкту.

## Шари паралаксу першого екрана

Створені вбудованим `image_gen` із `hero.png`, зі збереженням полотна 1672 × 941.

- `hero-background.png` — Use case: precise-object-edit. Remove snowboarder, board, airborne powder and foreground snowbank. Reconstruct uninterrupted snowy fir forest slope and mountain panorama. Preserve sky, sun, right-side landscape, original framing and colors. Opaque background plate.
- `hero-rider.png` — Use case: background-extraction. Extract snowboarder and entire snowboard with attached fine snow spray. Preserve original pose, scale, placement and lighting on full original canvas. Remove landscape and foreground snowbank. True transparent alpha PNG.
- `hero-snow.png` — Use case: background-extraction. Extract closest bottom foreground snowbank and lower-left powder spray. Remove rider, board, sky, trees and mountains. Preserve canvas coordinates; feather upper boundary naturally. True transparent alpha PNG.
