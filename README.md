# Gym minigame

A short workout break: tap to lift, finish eight reps, then head back to your page. The last rep takes a little more effort.

[Play the game](https://nelsonfaria-dev.github.io/gym-minigame/)

Built with React, TypeScript, CSS animations and PNG sprites. Vite builds the package. Supports mouse, touch, Enter and Space, and respects reduced motion.

## Use

Requires React 18 or 19 and Node 20.19+ or 22.12+.

```sh
npm install github:nelsonfaria-dev/gym-minigame
```

```tsx
import { useRef, useState } from 'react';
import { GymExperience } from 'gym-minigame';
import 'gym-minigame/style.css';

export function Workout() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  return (
    <div style={{ position: 'relative', height: 640 }}>
      <button ref={trigger} hidden={open} onClick={() => setOpen(true)}>
        Take a break
      </button>
      <GymExperience
        open={open}
        onClose={() => setOpen(false)}
        returnFocusRef={trigger}
      />
    </div>
  );
}
```

The game fills its parent, which needs a height and `position: relative`. `onComplete` is an optional callback after the eighth rep. In Next.js, render it inside a client component.

For a ranking, create a `createLocalLeaderboard()` instance and pass it as the `leaderboard` prop. It keeps one best time per browser. Results are not shared between players.

You can also provide your own `load` and `submit` methods using the exported `GymLeaderboardAdapter` type.

## Build

```sh
npm ci
npm run build
```

Output: JavaScript, types, CSS and assets in `dist/`.

MIT license. The Anton font uses the [SIL Open Font License](src/assets/fonts/OFL.txt).
