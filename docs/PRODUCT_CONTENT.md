# Product content source of truth

Public program copy in the Hub must stay aligned with the official Trà Đá
Mentor website. This document records the source and the interpretation used by
the application so placeholder SaaS copy does not return later.

## Canonical sources

- Organization overview: <https://www.tradamentor.com/>
- Programs and application process: <https://www.tradamentor.com/dich-vu>
- Current mentee application: <https://forms.gle/WNNDMoiHvf7oMGPq7>

The application keeps this content in `src/content/officialProgram.ts`. UI
components consume that typed catalogue instead of duplicating prices and
program details across locale files.

## Program catalogue

| Program | Published fee | Duration | Format |
| --- | ---: | --- | --- |
| Mentoring 8 tuần | 1.299.000₫ / người | 8 tuần | 1:1 |
| Mentoring 4 tuần | 899.000₫ / người | 4 tuần | 1:1 |
| Mentoring theo nhóm | 399.000₫ / người | 3 buổi, 1 giờ 30 phút/buổi | 1:2 |
| Mentee Community | 499.000₫ / người | Vĩnh viễn | Nhóm 5 mentees |

Published financial-aid allocation: 3 full scholarships, 5 at 75%, 5 at
50%, and 7 at 25%.

## Content rules

1. `/programs` is an information and application page, not a monthly SaaS
   subscription page.
2. The primary CTA opens the official application form. Payment must not occur
   before the organization approves a post-application billing workflow.
3. `/pricing` remains a redirect only, preserving old bookmarks.
4. Prices, scholarship counts, contact details, application URL, and process
   steps require re-verification against the canonical source before release.
5. When the source contains duplicated responsive text with inconsistent values,
   use the coherent desktop/mobile set that agrees across the page: 8 weeks,
   4 weeks, 3 × 90-minute group sessions, and lifetime community access.

Last verified: 19 October 2026.
