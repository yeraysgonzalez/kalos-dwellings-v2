# Search Results Page (Book Now)

**Page:** Search Results / Book Now  
**Prototype reference:** Client call notes  
**Baseline:** V1 (`v1` tag / `v1-baseline` branch)  
**Working version:** V2 (`v2` branch)  
**Hub:** [`/v2.html`](../../v2.html)

This table tracks client requests versus the V1 baseline and the V2 updates we ship. One table per page will be compiled into a client PDF later.

| # | Client request | How it was in V1 | What we did in V2 | Status |
|---|----------------|------------------|-------------------|--------|
| 1 | Support three search views from the prototype: property/list, split property + map, and map-only | View toggles already existed (`list` / `split` / `map`), but layout behavior needed tightening to match the intended prototype experience | Confirmed and refined all three modes from the results toolbar so list, split, and map-only each have a clear layout | Done |
| 2 | Use a 3-column property grid in the property-focused / list view | Desktop list view already targeted 3 columns; breakpoints still collapsed aggressively and needed reinforcement | Locked list view to a **3-column grid** on desktop, with 2-column / 1-column fallbacks only on smaller screens | Done |
| 3 | In split view, keep the map fixed/locked while property results scroll | Map used sticky positioning, but overall page scroll made the “locked map / scrolling list” behavior feel incomplete | On scroll: header + search leave; **filter bar sticks to top**; **map stays fixed/full-height**; only the stays list scrolls; after the list ends, scroll continues into the **footer** | Done |
| 4 | Allow users to move the map to update/filter visible inventory | Map supported zoom only; center was fixed and moving the map did not change which stays appeared in results | Added **map pan/drag** so relocating or zooming the map filters results to stays in the current map area, plus a Reset map control | Done |
| 5 | Continue refining the search/filter area; keep it flexible because final filters are still pending a separate discussion | Filter chips and dropdown panels existed (price, beds, type, amenities) but were not framed as an extensible filter system | Kept the filter bar **modular** with extensible slots (`primary`, `quick`, `pending`) so final filters can be added later without rebuilding the page | Done |
| 6 | In map-only view, show property details when hovering a map pin (mini card without photo) | Split view highlighted the matching list card with a gold outline on pin hover; map-only had no property summary on hover | Added a **white/ivory mini card tooltip** above the pin in map-only view with name, location, type/guests/beds/baths, nightly rate, and “View stay”, matching list-card copy (no photo). Split view keeps the existing gold outline behavior | Done |
| 7 | Fix split/list/map view toggle icon states so inactive icons stay black | Split (half-and-half) icon SVG used a white stroke, so after leaving the default split view the icon stayed white while list/map toggled correctly | Updated the split icon stroke to black so inactive/default states match the other view icons; active state still inverts to white on the black circle | Done |

## Notes for client PDF
- **V1** = baseline snapshot before Book Now Search Results changes.
- **V2** = implementation branch for these Search Results updates.
- Review in browser: `booking.html` → Search Results, then switch List / Split / Map; in Map view hover a pin; drag the map in Split or Map view.
- Final filter definitions remain pending a separate client discussion (row 5).
