# RADIONICS Design System

## Brand Identity
RADIONICS is a professional therapeutic session platform. Part of the ByElamor ecosystem.
It must feel like a **digital therapeutic workspace** — calm, focused, professional, and visual.

## Personality
- Calm and focused, not clinical
- Visual and intuitive, not form-heavy
- Professional and trustworthy, not corporate
- Spiritual/energetic undertones without being mystical-kitsch

## Typography
- **Primary Font**: Cinzel (headers, methodology names — has a sacred/professional feel)
- **Body Font**: Inter (clean, readable for dense information)
- **Accent**: Cinzel Decorative for logo/brand marks
- Scale: Display 48px | H1 36px | H2 28px | H3 22px | H4 18px | Body 15px | Small 13px | Caption 11px

## Color Palette
```
--color-void: #0A0B0E         (deepest background)
--color-surface-0: #0F1117    (primary background)
--color-surface-1: #161820    (card backgrounds)
--color-surface-2: #1E2130    (elevated cards)
--color-surface-3: #252840    (hover states)
--color-border: #2A2D42       (borders)
--color-border-light: #363955  (subtle borders)

--color-gold: #C9A84C         (primary accent — sacred/methodological)
--color-gold-light: #E8C97A   (lighter gold)
--color-gold-dim: #8A6A28     (dim gold)
--color-teal: #4ECDC4         (session active / progress)
--color-teal-dim: #2A7A75     (dim teal)
--color-violet: #8B5CF6       (methodology cards / MAP)
--color-violet-dim: #5B3FA8   (dim violet)
--color-amber: #F59E0B        (Hawkins / energy levels)
--color-rose: #F43F5E         (alerts / important)
--color-emerald: #10B981      (completed / success)
--color-sky: #38BDF8          (info / in progress)

--color-text-primary: #F0EDE8   (warm white)
--color-text-secondary: #A8A4B8 (muted)
--color-text-tertiary: #6B6880  (very muted)
```

## Hawkins Scale Colors
- 20-50 (Shame/Fear): #8B0000 deep crimson
- 75-100 (Grief/Apathy): #4A4060 muted violet
- 125-150 (Desire/Anger): #C0392B red-orange
- 175 (Pride): #E67E22 orange
- 200 (Courage): #3498DB blue
- 250-310 (Neutrality/Willingness): #27AE60 green
- 350-400 (Acceptance/Reason): #1ABC9C teal
- 500-540 (Love/Joy): #F1C40F gold
- 600-700 (Peace/Enlightenment): #FFFFFF white/light

## Layout Principles
- Dark theme throughout (therapeutic focus environment)
- Left sidebar navigation (collapsible)
- Session workspace: 3-column desktop layout
- Generous whitespace within cards
- Full-bleed gradient headers per page
- Micro-borders using gradient strokes on cards

## Component Patterns
- Cards with glassmorphism surface + subtle gold border on hover
- Status badges with colored dot + label
- Progress bars with gradient fill
- Tool cards: image-dominant with overlay label
- Voice note: floating mic button, pulsing when recording
- Auto-save: subtle bottom-left indicator

## Motion
- Page transitions: fade + slight upward drift (150ms)
- Card hover: scale(1.01) + border glow
- Session progress: smooth step transitions
- Workspace tool selection: ring pulse on select

## Spacing
- Base unit: 4px
- Component padding: 16px / 24px
- Card gap: 12px / 16px
- Section gap: 32px / 48px
