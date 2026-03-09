# SwipeMRR V2 — Implementation Plan

## Current Architecture Summary

- All swipe state lives in `CardStack.tsx` (startups array, currentIndex, swiping lock)
- API proxy at `/api/startups/route.ts` already supports filter params: `category`, `minMrr`, `maxMrr`, `minPrice`, `maxPrice`, `minGrowth`, `maxGrowth`, `sort`
- localStorage: `swipemrr_saved` (saved startups), `swipemrr_cache_v2` (12h cache), `swipemrr_seen` (swiped slugs)
- Framer Motion `useMotionValue` + `animate()` for swipe mechanics
- No global state manager — CardStack is self-contained

---

## Feature 1: Filter Drawer

**Goal**: Slide-up drawer with MRR range, price range, category picker, growth filter.

### New files
- `src/components/FilterDrawer.tsx` — the drawer UI

### Changes
- `src/lib/types.ts` — add `Filters` interface
- `src/lib/storage.ts` — persist filters to localStorage (`swipemrr_filters`)
- `src/components/CardStack.tsx` — accept filters prop, include them in fetch URL
- `src/app/page.tsx` — filter button in header, manage filter state, pass to CardStack

### Implementation details

**`Filters` interface:**
```typescript
interface Filters {
  category?: string;
  minMrr?: number;
  maxMrr?: number;
  minPrice?: number;
  maxPrice?: number;
  minGrowth?: number;
  sort?: string; // feeds into Feature 3 too
}
```

**FilterDrawer component:**
- Framer Motion `motion.div` sliding up from bottom with backdrop overlay
- Category: horizontal scrolling pill selector (multi-select or single)
- MRR range: two number inputs with presets ($0-$1K, $1K-$10K, $10K+)
- Price range: two number inputs with presets ($0-$50K, $50K-$500K, $500K+)
- Growth: minimum growth % input
- "Apply" button clears cache + seen slugs and refetches with new params
- "Reset" button clears all filters

**Integration:**
- `page.tsx` holds `filters` state, passes to both `CardStack` and `FilterDrawer`
- When filters change: clear cache, clear seen, reset currentIndex, fetch page 1 with new params
- Filter button in header shows active filter count badge
- The API proxy already whitelists all needed params — no backend changes needed

---

## Feature 2: MRR Trend Sparkline

**Goal**: Replace the generic profile photo area with a mini chart showing estimated MRR trend based on `growth30d`.

### New files
- `src/components/MrrSparkline.tsx` — inline SVG sparkline component

### Changes
- `src/components/StartupCard.tsx` — add sparkline between description and metrics grid

### Implementation details

**Approach**: We only have `mrr` and `growth30d` — not historical data. Generate a synthetic 6-month trend line by working backwards from current MRR using the growth rate.

```typescript
// Generate 6 data points: months -5 to 0
function generateTrend(currentMrr: number, growth30d: number): number[] {
  const monthlyGrowth = 1 + growth30d / 100;
  const points = [currentMrr];
  for (let i = 1; i < 6; i++) {
    points.unshift(currentMrr / Math.pow(monthlyGrowth, i));
  }
  return points;
}
```

**MrrSparkline component:**
- Pure SVG, ~60px tall, full card width
- Polyline for the trend, filled area below with gradient
- Green stroke/fill for positive growth, red for negative
- No dependencies needed — just SVG path math
- Shows "(estimated)" label in tiny text below

**Fallback**: If `mrr` or `growth30d` is null, don't render the sparkline.

---

## Feature 3: "Hot Deals" Sort

**Goal**: Quick toggle to sort by lowest multiple first.

### Changes
- `src/app/page.tsx` — add sort toggle button in header
- `src/components/CardStack.tsx` — accept `sort` prop, use in fetch URL

### Implementation details

- Two-state toggle in the header: "Best Deal" (default, `sort=best-deal`) vs "Hot Deals" (`sort=multiple-asc`)
- Small pill/toggle next to the filter button
- Changing sort: clear cache + seen, refetch page 1
- This naturally integrates with the Filter Drawer (sort becomes part of `Filters`)
- Could also add sort options inside the filter drawer as radio buttons

---

## Feature 4: Daily Digest

**Goal**: Show top 10 new listings from the last 24 hours.

### New files
- `src/app/digest/page.tsx` — daily digest page
- `src/components/DigestList.tsx` — renders the digest cards

### Changes
- `src/app/page.tsx` — add digest link in header
- `src/lib/types.ts` — add `DigestCache` interface
- `src/lib/storage.ts` — add digest cache helpers (24h TTL)

### Implementation details

**Fetching:**
- Call `/api/startups?onSale=true&sort=listed-desc&limit=10` to get the 10 most recently listed
- Cache in localStorage with 24-hour TTL (`swipemrr_digest`)
- No new API route needed — the proxy already supports `sort=listed-desc`

**DigestList component:**
- Compact card list (not swipeable — just a scrollable list)
- Each card: icon, name, category, MRR, price, multiple, sparkline, link
- "Save" button on each card (adds to saved list)
- Date header: "Today's Hot Listings — March 9, 2026"

**Navigation:**
- Small "Daily" or calendar icon in the header
- Could also be a tab alongside Saved

---

## Feature 5: Share Card as Image

**Goal**: Generate a shareable image of a startup card for social media.

### New dependencies
- `html-to-image` (or `html2canvas`) — captures DOM to PNG/JPEG

### New files
- `src/components/ShareButton.tsx` — share trigger + logic

### Changes
- `src/components/StartupCard.tsx` — add share button, forward ref for capture
- `package.json` — add `html-to-image`

### Implementation details

**Approach**: Use `html-to-image` to capture the StartupCard DOM node as a PNG, then use the Web Share API (with image fallback to download).

**ShareButton component:**
```typescript
import { toPng } from 'html-to-image';

async function handleShare(cardRef: HTMLElement, startup: TrustMRRStartup) {
  const dataUrl = await toPng(cardRef, { pixelRatio: 2 });
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], `${startup.slug}.png`, { type: 'image/png' });

  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: `${startup.name} — ${formatCurrency(startup.askingPrice)}`,
      text: `Check out ${startup.name} on SwipeMRR`,
      files: [file],
    });
  } else {
    // Fallback: download the image
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${startup.slug}.png`;
    a.click();
  }
}
```

**Card changes:**
- Add a small share icon button (top-right corner or next to "View on TrustMRR")
- Use `useRef` on the card container and pass to `toPng()`
- Add "swipemrr.com" watermark/branding to the captured image (via a hidden element that's only visible during capture)

---

## Feature 6: Keyboard Shortcuts

**Goal**: Arrow keys to skip (←) and save (→).

### Changes
- `src/components/CardStack.tsx` — add `useEffect` with keydown listener

### Implementation details

```typescript
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (swiping) return;
    if (e.key === 'ArrowLeft') {
      handleSwipe('left');
    } else if (e.key === 'ArrowRight') {
      handleSwipe('right');
    }
  }
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [swiping, handleSwipe]);
```

- The `swiping` lock already prevents double-fires
- Update the "Swipe or tap" helper text to "Swipe, tap, or use ← → keys"
- No new files needed — purely additive to CardStack

---

## Feature 7: Undo Last Swipe

**Goal**: Button to undo the most recent swipe and bring the card back.

### Changes
- `src/lib/storage.ts` — add undo history helpers
- `src/lib/types.ts` — add `SwipeHistoryEntry` interface
- `src/components/CardStack.tsx` — undo button, history stack, reverse animation

### Implementation details

**SwipeHistoryEntry:**
```typescript
interface SwipeHistoryEntry {
  slug: string;
  direction: 'left' | 'right';
  index: number;
}
```

**Storage:**
- Keep a stack in memory (not localStorage) — max depth of 5
- `swipeHistory: SwipeHistoryEntry[]` state in CardStack

**In `advanceCard()`:**
- Before advancing, push `{ slug, direction, index: currentIndex }` onto the history stack

**Undo logic:**
```typescript
function handleUndo() {
  const last = swipeHistory.pop();
  if (!last) return;

  // Remove from seen slugs
  removeSeenSlug(last.slug);

  // If it was a save, remove from saved
  if (last.direction === 'right') {
    removeStartup(last.slug);
    setSavedCount(getSavedStartups().length);
  }

  // Move index back
  setCurrentIndex(last.index);
  setSwipeHistory([...swipeHistory]);
}
```

**New storage helper:**
```typescript
function removeSeenSlug(slug: string): void {
  const seen = getSeenSlugs();
  seen.delete(slug);
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
}
```

**UI:**
- Undo button (↩) between Skip and Save buttons, smaller and more subtle
- Only visible when history is non-empty
- Animate the card back in from the direction it left (reverse fly-in)
- Keyboard shortcut: `Ctrl+Z` or `Z`

---

## Implementation Order (recommended)

Priority by impact and dependency:

1. **Keyboard Shortcuts** (Feature 6) — 15 min, zero risk, improves UX immediately
2. **Undo Last Swipe** (Feature 7) — 30 min, high user value, standalone
3. **Hot Deals Sort** (Feature 3) — 20 min, simple toggle, uses existing API params
4. **Filter Drawer** (Feature 1) — 1-2 hours, biggest feature, needs careful UX
5. **MRR Sparkline** (Feature 2) — 30 min, visual polish, no external deps
6. **Daily Digest** (Feature 4) — 45 min, new page, reuses existing components
7. **Share Card** (Feature 5) — 45 min, needs new dependency, platform-specific behavior

Features 1-3 can share filter/sort state. Features 6-7 are independent of everything else. Feature 5 is standalone. Feature 4 is standalone.

**Parallel tracks:**
- Track A: Features 6 → 7 → 3 → 1 (interaction improvements)
- Track B: Features 2 → 5 (visual/sharing)
- Track C: Feature 4 (new page)

---

## Files to Create

| Feature | New Files |
|---------|-----------|
| 1. Filter Drawer | `src/components/FilterDrawer.tsx` |
| 2. MRR Sparkline | `src/components/MrrSparkline.tsx` |
| 4. Daily Digest | `src/app/digest/page.tsx`, `src/components/DigestList.tsx` |
| 5. Share Card | `src/components/ShareButton.tsx` |

## Files to Modify

| File | Features |
|------|----------|
| `src/lib/types.ts` | 1, 4, 7 |
| `src/lib/storage.ts` | 1, 4, 7 |
| `src/components/CardStack.tsx` | 1, 3, 6, 7 |
| `src/components/StartupCard.tsx` | 2, 5 |
| `src/app/page.tsx` | 1, 3, 4 |
| `package.json` | 5 |

## New Dependencies

| Package | Feature | Size |
|---------|---------|------|
| `html-to-image` | 5 (Share) | ~15KB |
