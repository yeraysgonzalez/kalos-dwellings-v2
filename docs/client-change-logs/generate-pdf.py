#!/usr/bin/env python3
"""Generate Kalos V2 Client Change Log PDF with correctly fitted table rows."""
from pathlib import Path
from fpdf import FPDF
from fpdf.fonts import FontFace
from fpdf.enums import TableCellFillMode, VAlign

out = Path(__file__).with_name('Kalos-V2-Client-Change-Log.pdf')

INK = (35, 31, 32)
GOLD = (194, 163, 84)
MUTED = (118, 113, 106)
LINE = (209, 205, 198)
HEADER_BG = (232, 227, 217)
ALT = (246, 244, 240)
DONE = (89, 115, 71)


def ascii(s):
    return (s.replace('\u2192', '->').replace('\u2014', '-')
             .replace('\u2013', '-').replace('\u2018', "'")
             .replace('\u2019', "'").replace('\u201c', '"')
             .replace('\u201d', '"').replace('\u00b7', '|')
             .replace('\u2022', '*'))


search_rows = [[ascii(c) for c in r] for r in [
    ['1', 'Support three search views from the prototype: property/list, split property + map, and map-only',
     'View toggles already existed (list / split / map), but layout behavior needed tightening to match the intended prototype experience',
     'Confirmed and refined all three modes from the results toolbar so list, split, and map-only each have a clear layout', 'Done'],
    ['2', 'Use a 3-column property grid in the property-focused / list view',
     'Desktop list view already targeted 3 columns; breakpoints still collapsed aggressively and needed reinforcement',
     'Locked list view to a 3-column grid on desktop, with 2-column / 1-column fallbacks only on smaller screens', 'Done'],
    ['3', 'In split view, keep the map fixed/locked while property results scroll',
     'Map used sticky positioning, but overall page scroll made the "locked map / scrolling list" behavior feel incomplete',
     'On scroll: header + search leave; filter bar sticks to top; map stays fixed/full-height; only the stays list scrolls; after the list ends, scroll continues into the footer', 'Done'],
    ['4', 'Allow users to move the map to update/filter visible inventory',
     'Map supported zoom only; center was fixed and moving the map did not change which stays appeared in results',
     'Added map pan/drag so relocating or zooming the map filters results to stays in the current map area, plus a Reset map control', 'Done'],
    ['5', 'Continue refining the search/filter area; keep it flexible because final filters are still pending a separate discussion',
     'Filter chips and dropdown panels existed (price, beds, type, amenities) but were not framed as an extensible filter system',
     'Kept the filter bar modular with extensible slots (primary, quick, pending) so final filters can be added later without rebuilding the page', 'Done'],
    ['6', 'In map-only view, show property details when hovering a map pin (mini card without photo)',
     'Split view highlighted the matching list card with a gold outline on pin hover; map-only had no property summary on hover',
     'Added a white/ivory mini card tooltip above the pin in map-only view with name, location, type/guests/beds/baths, nightly rate, and "View stay", matching list-card copy (no photo). Split view keeps the existing gold outline behavior', 'Done'],
    ['7', 'Fix split/list/map view toggle icon states so inactive icons stay black',
     'Split (half-and-half) icon SVG used a white stroke, so after leaving the default split view the icon stayed white while list/map toggled correctly',
     'Updated the split icon stroke to black so inactive/default states match the other view icons; active state still inverts to white on the black circle', 'Done'],
]]

property_rows = [[ascii(c) for c in r] for r in [
    ['1', 'Keep the larger gallery experience from the prototype',
     'Large mosaic gallery already existed (multi-photo grid, "Show all photos," lightbox, mobile swipe)',
     'Kept the large mosaic gallery and added a prominent Watch video control on the gallery without reducing the photo experience', 'Done'],
    ['2', 'Keep the page modular so sections/content can be reordered as needed',
     'Sections were hardcoded in a fixed order inside renderDetail',
     'Rebuilt the profile as modular section blocks with a configurable sectionOrder / defaultPropertySectionOrder so sections can be reordered per property', 'Done'],
    ['3', 'Include section navigation/tabs that jump to different areas of the property page',
     'Section nav existed for Overview, Amenities, Availability, Reviews, Location',
     'Kept section navigation and generated tabs from the modular sections (including Video, Sleep, Policies, FAQ) so anchors always match the page modules', 'Done'],
    ['4', 'Keep the booking/date/price area sticky so primary booking info stays visible while scrolling',
     'Desktop booking card was already sticky; mobile used a bottom reserve bar',
     'Kept sticky booking/date/price on desktop and the mobile reserve bar so primary booking info remains available while scrolling', 'Done'],
    ['5', 'Add property video prominently: easy-to-find play button + inline video section; no autoplay; Streamline/YouTube/Wistia later',
     'No property video treatment on the detail page',
     'Added gallery Watch video CTA plus an inline video section with click-to-play poster (no autoplay); opens in lightbox; structure ready for Streamline / YouTube / Wistia embeds', 'Done'],
    ['6', 'Keep Stay Highlights, but make highlights vary by property; Streamline custom amenity group TBD',
     'Highlights used the same four generic labels on every home',
     'Kept Stay Highlights and made them property-specific (e.g. Gulf front, rooftop views, beach access) with refined card styling; structure ready for a Streamline custom amenity group', 'Done'],
]]

pm_lightbox_rows = [[ascii(c) for c in r] for r in [
    ['1', 'Give Property Management its own dedicated page (not only a homepage section)',
     'Nav and CTAs pointed to the homepage #management section; no standalone PM page matching live Kalos content',
     'Added property-management.html with live Kalos PM content in the V2 visual language, and pointed site nav / homepage links to the dedicated page', 'Done'],
    ['2', 'Structure the PM page with Who we are, specialize, reviews, boutique, and Where can we begin sections',
     'N/A (page did not exist)',
     'Built the full PM flow with alternating copy/media layouts, guest reviews (homepage-style slider + office background), and begin CTAs wired to Contact', 'Done'],
    ['3', 'Featured properties ribbon should support drag as well as auto-scroll (homepage + PM)',
     'Ribbon auto-scrolled and paused on hover, but users could not drag to scrub',
     'Added pointer drag on the featured ribbon and resume auto-scroll from the dragged position at the same speed', 'Done'],
    ['4', 'Owner Portal should open the live Streamline owner login in a new tab',
     'Owner Portal opened an in-site preview dialog',
     'All Owner Portal links/buttons open https://ownerx.streamlinevrs.com/login in a new tab', 'Done'],
    ['5', 'Contact lightbox form should match the live Kalos contact fields/layout',
     'Contact lightbox used a simple Name / Email / Message stack',
     'Rebuilt Contact with First name, Last name, Phone, Email (two columns), full-width Comments, marketing opt-in + Privacy link, and Submit (site-wide Contact CTAs)', 'Done'],
    ['6', 'Careers lightbox should use live Careers copy and show current openings',
     'Careers showed a short placeholder message',
     'Careers lightbox now includes Company overview, Why Kalos, benefits, Positions / Current openings with role cards + Apply (opens Contact), with scroll for multiple openings', 'Done'],
    ['7', 'Privacy Policy and Cancellation Policy lightboxes should use live site policy text',
     'Both lightboxes used preview placeholder copy',
     'Privacy and Cancellation lightboxes now use the live kalosdwellings.com policy content, with scroll for longer text', 'Done'],
    ['8', 'Add Facebook and Instagram under the footer newsletter signup',
     'Footer had newsletter only',
     'Added Facebook and Instagram icons under E-newsletter signup (site-wide footers), linking to the live Kalos social profiles', 'Done'],
]]

headers = ['#', 'Client request', 'How it was in V1', 'What we did in V2', 'Status']
col_widths = (9, 58, 68, 82, 18)
table_width = sum(col_widths)


class PDF(FPDF):
    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*MUTED)
        self.cell(100, 8, 'Kalos Dwellings  |  V2 Client Change Log')
        self.cell(0, 8, f'Page {self.page_no()}', align='R')


pdf = PDF(orientation='L', unit='mm', format='Letter')
pdf.set_auto_page_break(auto=True, margin=16)
pdf.set_left_margin(12)
pdf.set_right_margin(12)
pdf.set_top_margin(12)
pdf.add_page()

heading_style = FontFace(emphasis='BOLD', color=INK, fill_color=HEADER_BG, size_pt=7.2)
body_style = FontFace(color=INK, size_pt=6.8)
done_style = FontFace(emphasis='BOLD', color=DONE, size_pt=7.2)


def section_intro(title, page_line):
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(*GOLD)
    pdf.cell(0, 5, 'KALOS DWELLINGS', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(*INK)
    pdf.cell(0, 7, 'V2 Client Change Log', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(*MUTED)
    pdf.multi_cell(0, 4, 'Comparison of client requests vs V1 baseline and V2 updates.', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(1)
    pdf.set_draw_color(*GOLD)
    pdf.set_line_width(0.5)
    y = pdf.get_y()
    pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y)
    pdf.ln(3)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(*INK)
    pdf.cell(0, 6, title, new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(*MUTED)
    pdf.cell(0, 4, page_line, new_x='LMARGIN', new_y='NEXT')
    pdf.ln(2)


def draw_table(rows):
    pdf.set_font('Helvetica', '', 7)
    pdf.set_draw_color(*LINE)
    pdf.set_text_color(*INK)
    with pdf.table(
        col_widths=col_widths,
        width=table_width,
        line_height=3.5,
        text_align=('CENTER', 'LEFT', 'LEFT', 'LEFT', 'CENTER'),
        v_align=VAlign.T,
        padding=(3.0, 2.2, 3.4, 2.2),  # top, right, bottom, left
        headings_style=heading_style,
        cell_fill_color=ALT,
        cell_fill_mode=TableCellFillMode.ROWS,
        first_row_as_headings=True,
        repeat_headings=1,
        borders_layout='ALL',
    ) as table:
        table.row(headers)
        for row in rows:
            trow = table.row()
            for i, cell in enumerate(row):
                style = done_style if i == 4 else body_style
                trow.cell(cell, style=style)


def notes(text):
    pdf.ln(3)
    pdf.set_x(pdf.l_margin)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(*MUTED)
    pdf.multi_cell(0, 4.2, ascii(text), new_x='LMARGIN', new_y='NEXT')


section_intro('1. Search Results Page (Book Now)', 'Page: Search Results / Book Now  |  Prototype reference: Client call notes')
draw_table(search_rows)
notes('Notes: Final filter definitions remain pending a separate client discussion (row 5). Review in browser via booking.html -> Search Results (List / Split / Map).')

pdf.add_page()
section_intro('2. Individual Property Page (Property Profile)', 'Page: Individual Property / Property Profile  |  Prototype reference: Client call notes')
draw_table(property_rows)
notes('Notes: Live Streamline video URLs and custom amenity-group CMS wiring remain open for later connection. Review via /v2.html -> any Property Profile link.')

pdf.add_page()
section_intro('3. Property Management Page & Site Lightboxes', 'Pages: Property Management + Contact / Careers / Privacy / Cancellation lightboxes  |  Prototype reference: Live Kalos site + client direction')
draw_table(pm_lightbox_rows)
notes('Notes: Review Property Management via /v2.html or property-management.html. Review lightboxes from footer Quick links or header Contact us. Owner Portal opens the live Streamline login in a new tab.')

pdf.ln(5)
pdf.set_draw_color(*LINE)
pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
pdf.ln(3.5)
pdf.set_font('Helvetica', '', 8)
pdf.set_text_color(*MUTED)
pdf.set_x(pdf.l_margin)
pdf.multi_cell(0, 4.2, 'Prepared for client review | Kalos Dwellings V2 | Source: docs/client-change-logs', new_x='LMARGIN', new_y='NEXT')

pdf.output(str(out))
print(out)
print('bytes', out.stat().st_size)
print('pages', pdf.page_no())
