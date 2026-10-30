# Verification report

The current revision uses the original CouragEducator form inspected directly at https://www.couragier.com/educator on October 29, 2026.

- All 20 original field groups and all 65 original choice options are preserved, in their original order and with their original checkbox/radio types.
- French and Haitian Creole translations include every question, choice and agreement. Language names and product/platform names retain their appropriate names.
- Required text fields, profile selection, at least one preferred language and the three individual agreements are validated.
- Email serialization includes every question and all selected options. Unicode characters, multiple selections, line breaks and subject/body URL encoding are tested without sending email.
- The form now submits to a separate Couragier Educator Worker through the existing gateway. The owner notification targets partners@couragier.com; a separate, localized receipt goes to the applicant only after provider acceptance. It never accepts or rejects an applicant automatically.
- No D1 or database is needed. Production requires Brevo API credentials, a verified sender, a working mailbox, Turnstile keys and deployment of the Educator Worker and its gateway service binding. No real credentials are stored in this package.
- Cookies open only through the footer preference control; no initial-popup trigger remains.
- The courses option is removed from the hamburger menu. The two section CTAs to explore courses/start learning are removed. The hero's Our Ecosystem and Our Learning Experience buttons remain.
- The static checks cover 24 localized main-site pages, 3 localized Learn pages, the main 404, local asset/page references, and the exact supplied wordmark SVG hash.

The final Learn layout aligns source row 777 (the shirt hem) with the white section edge, measured within 0.001px at 375px and 885px content widths; the arm overlaps white by 8.1px / 13.8px. The six ecosystem illustrations remain the original assets.

No production email was sent. Browser tests use synthetic applicant details only. Production DNS and the user's email inbox are not connected or changed by this preview update.

Current responsive revision:

- Browser measurements at 320px, 390px and 430px frames verify both hero action groups follow the original art and remain in one row, without horizontal document or button-text overflow. French and Haitian Creole long labels are included.
- Computed color/background comparisons report no differences for 125 home, 140 educator and 70 Learn section/text elements between mobile and desktop.
- Educator header background is fully transparent at both widths; the hero starts at the top of the page.
- Trust strip runs horizontally on mobile and remains a grid on desktop. The duplicate strip is hidden from assistive technology. Reduced-motion users receive a stationary, horizontally scrollable strip.
- Original form hints were read directly from the live original form. All ten text inputs/areas now have localized guidance, with red required markers and pale gray placeholders.
- The supplied working mascot is included byte-for-byte on the new review invitation. Its email link targets feedback@couragier.com.
- Both Learn wordmarks link to the main homepage, preserving the active language.

Brevo integration preparation:

- Fourteen Node tests cover all 20 groups in EN/FR/HT, multiple choices, three required agreements, invalid/oversized inputs, origin restrictions, public-config secrecy, Turnstile hostname/action checks, owner failure, receipt failure, provider timeouts and idempotent retries.
- Receipts contain a reference and pending-review text, without repeating the applicant’s private answers. Reply-To reaches partners@couragier.com; owner notification Reply-To reaches the applicant.
- Brevo idempotency keys bind the full payload and receipt type, with the provider’s 15-minute duplicate window. There is no durable queue or database guarantee of exactly-once delivery.
- Tests mock provider HTTP calls; no production email, DNS or account settings were changed. Actual Cloudflare deployment, Turnstile interaction and inbox delivery remain to be verified after deployment with the owner’s credentials.
- A browser test with synthetic details and mocked providers confirmed that the client sends all 20 groups and displays the success reference plus receipt message. No real Turnstile challenge or email was triggered.
- Existing Sites design previews remain on the last published design revision; they do not activate this Cloudflare/Brevo integration.


The standalone generated Worker is syntax-checked and imported by tests. Cross-origin preflight, allowed apex/www origins, Turnstile origin hostname validation, and gateway EDUCATOR_SERVICE routing are tested with simulated providers. Existing webinar/MonCash/Whop routes retain their bindings. No production dashboard changes or emails were made by the assistant.
