# Our Wentworth Diaries — Makeover Studio

A mobile-first prototype for previewing a room makeover and optionally adding Helen's Touch. Built from scratch with React, TypeScript, and Vite.

## Run

```sh
npm install
npm run dev
```

Build the production bundle with `npm run build`. Vercel serves the root `dist/` output.

## Prototype behavior

- The upload entry point is hidden for the current demo. `ROOM_UPLOAD_ENABLED` in `src/App.tsx` can restore it later; uploads stay local in the browser and appear as the original room.
- Four generated demo triptychs (living room, bedroom, kitchen, bathroom) supply the prepared before, generic makeover, and Helen-inspired refinement images. They are original synthetic demo assets, not Helen's Instagram photos.
- Eight separate style-card previews show distinct directions in the same living room, making the styles easy to compare without changing room type.
- Result images use a draggable, touch-friendly before/after divider with keyboard controls. Helen's result can compare the original against either makeover stage.
- The result explicitly identifies prepared imagery, especially when a user uploads a photo. Style, level, and keep/change selections are collected for the future image service, but do not change the static demo imagery.
- `src/services/mockGeneration.ts` contains the two replaceable async functions: `generateGenericMakeover(originalImage, preferences)` and `applyCreatorStyle(genericResult)`.
- `src/data/helenStyleProfile.ts` is a separate reusable creator style configuration based on observed tendencies in the supplied research package. It does not imply Helen personally designed or approved any output.
- No photo, account, or preference data is sent to a server. No live AI API is connected.

The supplied research package informed the palette and refinement layer. Its earlier product plan was not used as an app blueprint.
