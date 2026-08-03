# HireME Career Office redesign

## Design objective

HireME should feel like a private career advisory office: precise, discreet, and reassuring. The product avoids the generic AI-dashboard recipe of floating glass, neon gradients, and interchangeable cards. Instead, it gives every task a clear work surface, uses a formal editorial headline voice sparingly, and makes the action state unmistakable.

## Research translated into decisions

1. **Hierarchy before decoration.** Carbon's product typography guidance separates productive type for task completion from expressive type for high-impact editorial moments. HireME uses Manrope for controls, numbers, and dense content; DM Serif Display appears only in page titles and the home hero. This preserves formality without making analytical screens theatrical.
2. **Expression should reveal function.** Google’s Material 3 research found color, size, shape, and containment can direct attention more quickly, but also cautions that emotion must not compromise the task. Therefore cobalt is reserved for the current location, primary action, score progress, and operational status—not as a background for every component.
3. **Dark interfaces need layered neutrals, not pure black.** Google’s dark-theme guidance explains that deep gray layers preserve legibility and elevation better than black-on-white contrast. The app uses ink, raised ink, and soft ink as three working layers, with thin cool-gray rules to define containment.
4. **System consistency is a usability feature.** A single spacing rhythm (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px), 16px working-surface radius, and repeatable page intro make six very different workflows feel like one product. GOV.UK’s responsive spacing model informs the reduced spacing at phone widths.
5. **Premium includes accessibility.** Every control retains a visible high-contrast focus treatment, text never relies only on color for state, and animation is reduced for `prefers-reduced-motion`, aligning to WCAG focus guidance.

## System specification

| Layer | Rule |
| --- | --- |
| Canvas | Ink #0A0F1E with a faint architectural grid and two restrained cobalt/violet lights. |
| Surfaces | Raised ink panels, thin #D3DFF4/12 rules, 16px radius; shadows indicate only real grouping. |
| Type | Manrope for UI; DM Serif Display for a page’s single editorial title; never use display type in forms/tables. |
| Accent | Cobalt #6F97F4 means current, primary, or progressing. Green, gold, and red only communicate performance or outcome. |
| Navigation | A compact, squared workspace bar; active destination has a surface and rule, not a neon underline. |
| Interaction | 220ms lift on actionable cards; direct controls use a 2px focus ring. Motion is disabled for reduced-motion users. |
| Motion | A short route transition and reading-progress rule orient long workspaces. Scroll reveals occur once; only the home and Career Plan use pointer-led depth surfaces on fine-pointer devices. |
| Responsive | Page canvas keeps 16px gutters on small screens, with one-column task panels and no horizontal overflow. |

## Application plan

1. Establish the shared canvas, typography, focus behavior, navigation, surface, and control primitives in `src/index.css`.
2. Move each route onto the same page shell and restrained working surfaces; retain each existing workflow and data integration.
3. Give the landing page an editorial overview while keeping task routes denser and more productive.
4. Rework analytics metrics and charts into a clear reporting surface; align operational pages (jobs and local AI) to the same hierarchy.
5. Add the Career Plan workspace: a persistent role brief, action plan, focus block, skill roadmap, application board, follow-up drafting, question library, STAR studio, outreach note, and offer benchmark.
6. Build and visually test desktop and mobile layouts across all seven routes; correct overflow, contrast, invalid states, and reduced-motion behavior.

## Motion principles now implemented

- Motion is an orientation aid, not ambient decoration: route transitions are 280ms, scroll sections enter once, and no task control waits on animation.
- The hero and Career Plan use CSS-transform depth rather than a 3D canvas, avoiding a large rendering payload in already analytical screens.
- Tilt is enabled only for a fine pointer, resets on pointer exit, and is automatically disabled for users who prefer reduced motion.
- The fixed reading-progress rule helps users orient themselves inside longer preparation and planning workflows.

## Sources

- [Carbon Design System — Typography](https://v10.carbondesignsystem.com/guidelines/typography/overview/)
- [Google Design — Expressive Design research](https://design.google/library/expressive-material-design-google-research?pubDate=20250521)
- [Google Design — Dark theme](https://design.google/library/material-design-dark-theme)
- [GOV.UK Design System — Spacing](https://design-system.service.gov.uk/styles/spacing/)
- [W3C WCAG focus appearance guidance](https://www.w3.org/WAI/WCAG3/how-to/focus-appearance/custom-indicator/)
