# Couragier website

Sit prensipal la ak Learn se de deplwaman separe. Tout kontni, tradiksyon ak imaj yo nan pwojè a. Pa gen depandans Hostinger. Fòm Educator itilize yon Worker Cloudflare apa + Brevo + Turnstile; li pa bezwen D1.

## Fichye prensipal yo

- `src/data/home.json`, `about.json`, `educator.json`: tèks EN / FR / HT ak imaj yo.
- `src/data/educator-form.json`: tout 20 gwoup kesyon ak 65 chwa ki nan fòm CouragEducator orijinal la, ansanm ak tradiksyon yo ak adrès destinasyon email la.
- `src/templates/application.mjs`: HTML fòm konplè a.
- `public/assets/js/application-email.mjs`: soumèt fòm lan bay endpoint la; kenbe repons yo disponib si gen erè.
- `src/templates/shell.mjs`: header, switch lang ak footer komen.
- `src/styles/shared.css`: tipografi, responsive ak animasyon.
- `src/styles/learn.css`: Learn ak mascot sou liy seksyon an.
- `legal-source/`: tèks legal EN / FR / HT ak tèks Kreyòl orijinal yo.
- `public/assets/images/`: WebP lokal ak SVG wordmark orijinal la.
- `dist/`: sit prensipal pare pou sèvi.
- `dist-learn/`: Learn pare pou sèvi.

## Fòm Educator — Worker apa + Brevo

Tout 20 gwoup ak 65 chwa orijinal yo konsève. Fòm lan kontakte `https://api.couragier.com/educator/*`. Gateway `couragier-api` voye wout sa yo nan **EDUCATOR_SERVICE → couragier-educator**. Webinar la rete apa. Pa bezwen D1 ni Pages Functions.

- `server/application.mjs`: validation ak de email yo.
- `server/submit.mjs`: Turnstile + soumisyon Brevo.
- `server/educator-worker.mjs`: routing ak CORS pou de domèn Couragier yo.
- `cloudflare/couragier-educator.mjs`: yon sèl fichye pare pou kole nan Edit code nouvo Worker la.
- `cloudflare/couragier-api.mjs`: gateway adapte; ajoute binding EDUCATOR_SERVICE anvan deplwaye.
- `scripts/build-educator-worker.mjs`: rejenerasyon fichye Worker la apati schema ak sous yo.

**Li [gid konfigirasyon an](docs/brevo-setup.ht.md).** Kat valè BREVO_API_KEY, BREVO_SENDER_EMAIL, TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY yo ale sou Worker Educator la sèlman. Secrets lòt Workers yo pa pataje otomatikman. Kòd la pa gen okenn secret reyèl; aktivasyon ak livrezon reyèl rete pou verifye nan kont pwopriyetè a.

Brevo voye tout repons yo bay **partners@couragier.com**, epi yon resi bay kandida a nan lang fòm lan. Akseptasyon/refi rete manyèl. Pa gen lis marketing oswa abònman ki ajoute.

## GitHub ak Cloudflare

Sit prensipal: Build `npm run build`, Output `dist`, Node 22. Learn: menm build, Output `dist-learn`. Sèvi ak pwojè Pages ou yo. Pa bezwen secrets Brevo sou Pages. Worker Educator ak gateway la se deplwaman separe nan dashboard; push sit la sou GitHub pa deplwaye yo otomatikman. Si schema kesyon/chwa yo chanje, deplwaye nouvo Worker la ansanm ak sit la.

## Kontni ak lang

Modifye `src/`, `legal-source/` oswa `public/`, epi kouri `npm run build`. Build la pa mande `npm install`; li sèvi ak modil Node estanda. Pa modifye `dist/` dirèkteman paske build la rejenerel.

Angle: `/`, `/about`, `/educator`, `/reviews`, `/terms-and-conditions`, `/privacy-policy`, `/cookies`, `/write-a-review`. Franse itilize `/fr/…`; Kreyòl itilize `/ht/…`. Chanje lang kenbe menm paj la. Learn gen `/`, `/fr/`, `/ht/` sou subdomain li.

Tout paj gen HTML pou SEO menm si JavaScript dezaktive. JavaScript nesesè pou soumèt fòm lan. Poppins soti nan Google Fonts; li kapab self-hosted pita si ou vle retire demann ekstèn font yo.

## Cookies ak animasyon

Preferans cookies yo ouvri **sèlman** lè vizitè a klike lyen footer la. Pa gen popup ki ouvri otomatikman lè paj la lanse. Pa gen Meta Pixel, CAPI, analytics oswa lòt tracking opsyonèl nan pake sa a. Si ou ajoute tracking pita, li dwe respekte preferans yo.

Animasyon sou scroll, hover ak antre hero yo respekte `prefers-reduced-motion`. Switch FR / EN / HT rete sou yon sèl liy ak drapo bò kote tèks la.

## Verifikasyon

`npm run check` verifye paj yo, referans lokal yo, SVG orijinal la, tout kesyon/chwa fòm yo nan twa lang yo ak konpozisyon email la. Tès yo pa voye okenn email. `npm test` verifye endpoint la ak sèvis simile; li pa voye email reyèl. Gade `docs/verification.md`.

Tèks legal ou te voye yo rete vèsyon pou revizyon. Nòt prive pou pwopriyetè a rete nan `docs/legal-owner-notes.md`; yo pa parèt sou paj piblik yo.

## Mobile et avis — mise à jour

Les deux boutons du hero sont placés après l’image sur mobile, côte à côte. Le bandeau de confiance défile sur mobile ; il s’arrête au survol/au focus et respecte la réduction des animations. Le header Educator est transparent sur le même fond que son hero. Les palettes des sections restent identiques aux palettes desktop.

Les astérisques du formulaire sont rouges et les exemples de saisie sont gris clair, traduits en trois langues. Les exemples du formulaire original ont été récupérés ; des indications claires complètent les champs dont l’exemple était vide ou générique.

La page `write-a-review` utilise le mascot WebP fourni et ouvre un email vers **feedback@couragier.com**. Cette adresse doit exister comme boîte ou alias pour recevoir les avis. Le logo du header et celui du footer Learn renvoient à la page d’accueil principale dans la langue active.

Le destinataire du formulaire Educator est **partners@couragier.com**. Le code Brevo est prêt pour le Worker couragier-educator ; son activation et la vérification de livraison réelle restent à effectuer dans les comptes du propriétaire suivant le guide.
