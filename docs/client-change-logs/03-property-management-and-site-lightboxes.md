# Property Management Page & Site Lightboxes

**Page:** Property Management + global Contact / Careers / Privacy / Cancellation lightboxes  
**Working version:** V2 (`v2` branch)  
**Hub:** [`/v2.html`](../../v2.html)

This table tracks client requests versus the V1 baseline and the V2 updates we ship.

| # | Client request | How it was in V1 | What we did in V2 | Status |
|---|----------------|------------------|-------------------|--------|
| 1 | Give Property Management its own dedicated page (not only a homepage section) | Nav and CTAs pointed to the homepage `#management` section; no standalone PM page matching live Kalos content | Added `property-management.html` with live Kalos PM content in the V2 visual language, and pointed site nav / homepage links to the dedicated page | Done |
| 2 | Structure the PM page with Who we are, specialize, reviews, boutique, and “Where can we begin” sections | N/A (page did not exist) | Built the full PM flow with alternating copy/media layouts, guest reviews (homepage-style slider + office background), and begin CTAs wired to Contact | Done |
| 3 | Featured properties ribbon should support drag as well as auto-scroll (homepage + PM) | Ribbon auto-scrolled and paused on hover, but users could not drag to scrub | Added pointer drag on the featured ribbon and resume auto-scroll from the dragged position at the same speed | Done |
| 4 | Owner Portal should open the live Streamline owner login in a new tab | Owner Portal opened an in-site preview dialog | All Owner Portal links/buttons open `https://ownerx.streamlinevrs.com/login` in a new tab | Done |
| 5 | Contact lightbox form should match the live Kalos contact fields/layout | Contact lightbox used a simple Name / Email / Message stack | Rebuilt Contact with First name, Last name, Phone, Email (two columns), full-width Comments, marketing opt-in + Privacy link, and Submit (site-wide Contact CTAs) | Done |
| 6 | Careers lightbox should use live Careers copy and show current openings | Careers showed a short placeholder (“Make extraordinary happen…”) | Careers lightbox now includes Company overview, Why Kalos, benefits, Positions / Current openings with role cards + Apply (opens Contact), with scroll for multiple openings | Done |
| 7 | Privacy Policy and Cancellation Policy lightboxes should use live site policy text | Both lightboxes used preview placeholder copy | Privacy and Cancellation lightboxes now use the live kalosdwellings.com policy content, with scroll for longer text | Done |
| 8 | Add Facebook and Instagram under the footer newsletter signup | Footer had newsletter only | Added Facebook and Instagram icons under E-newsletter signup (site-wide footers), linking to the live Kalos social profiles | Done |

## Notes for client PDF
- Review Property Management via `/v2.html` or `property-management.html`.
- Review lightboxes from footer Quick links (Contact, Privacy, Cancellation, Careers) or header Contact us.
- Owner Portal opens the live Streamline login in a new tab.
