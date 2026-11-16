# Individual Property Page (Property Profile)

**Page:** Individual Property / Property Profile  
**Prototype reference:** Client call notes  
**Baseline:** V1 (`v1` tag / `v1-baseline` branch)  
**Working version:** V2 (`v2` branch)  
**Hub:** [`/v2.html`](../../v2.html)

This table tracks client requests versus the V1 baseline and the V2 updates we ship. One table per page will be compiled into a client PDF later.

| # | Client request | How it was in V1 | What we did in V2 | Status |
|---|----------------|------------------|-------------------|--------|
| 1 | Keep the larger gallery experience from the prototype | Large mosaic gallery already existed (multi-photo grid, “Show all photos,” lightbox, mobile swipe) | Kept the **large mosaic gallery** and added a prominent **Watch video** control on the gallery without reducing the photo experience | Done |
| 2 | Keep the page modular so sections/content can be reordered as needed | Sections were hardcoded in a fixed order inside `renderDetail` | Rebuilt the profile as **modular section blocks** with a configurable `sectionOrder` / `defaultPropertySectionOrder` so sections can be reordered per property | Done |
| 3 | Include section navigation/tabs that jump to different areas of the property page | Section nav existed for Overview, Amenities, Availability, Reviews, Location | Kept section navigation and **generated tabs from the modular sections** (including Video, Sleep, Policies, FAQ) so anchors always match the page modules | Done |
| 4 | Keep the booking/date/price area sticky so primary booking info stays visible while scrolling | Desktop booking card was already sticky; mobile used a bottom reserve bar | Kept **sticky booking/date/price** on desktop and the mobile reserve bar so primary booking info remains available while scrolling | Done |
| 5 | Add property video prominently: easy-to-find play button + inline video section; no autoplay; Streamline/YouTube/Wistia later | No property video treatment on the detail page | Added gallery **Watch video** CTA plus an **inline video section** with click-to-play poster (no autoplay); structure ready for Streamline / YouTube / Wistia embeds | Done |
| 6 | Keep Stay Highlights, but make highlights vary by property; Streamline custom amenity group TBD | Highlights used the same four generic labels on every home | Kept Stay Highlights and made them **property-specific** (e.g. Gulf front, rooftop views, beach access); structure ready for a Streamline custom amenity group | Done |

## Notes for client PDF
- **V1** = property profile before these Individual Property Page updates.
- **V2** = implementation on the `v2` branch; review via the V2 hub.
- Review: open `/v2.html`, then any Property Profile link.
- Live Streamline video URLs and custom amenity-group CMS wiring remain open for later connection.
