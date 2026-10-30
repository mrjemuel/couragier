# Couragier — konekte Worker Educator apa ak Brevo

Konfigirasyon final la itilize enfrastrikti Cloudflare ki deja egziste: sit estatik Couragier → api.couragier.com/educator/* → EDUCATOR_SERVICE → couragier-educator → Brevo. Webinar, MonCash ak Whop rete nan pwòp sèvis yo. Kòd la teste avèk sèvis simile; li poko deplwaye oswa konekte ak secrets reyèl pa asistan an.

## 1. Mete kòd nan nouvo Worker couragier-educator la

Worker la deja kreye dapre screenshot ou a. Nan Overview, klike **Edit code**. Ranplase tout Hello World la ak tout kontni fichye **cloudflare/couragier-educator.mjs**, epi klike **Deploy**. Se yon sèl fichye JavaScript Module konplè, san imports, san npm dependencies, san kle sekrè ladan l. Pa mete li nan Worker webinar la.

Lè ou klike Visit, paj rasin lan dwe retounen `ok: true`, `service: Couragier Educator`, ak `configured: false` si secrets yo poko mete. Sa nòmal. Health la pa voye email.

## 2. Mete konfigirasyon sèlman sou couragier-educator

Ouvri **couragier-educator → Settings → Variables and secrets → Add variable**, nan Production:

| Non egzak | Valè | Kalite |
| --- | --- | --- |
| BREVO_API_KEY | Yon API key Brevo nòmal ki pèmèt voye transactional email | Secret |
| BREVO_SENDER_EMAIL | partners@couragier.com | Text |
| TURNSTILE_SITE_KEY | Site key widget Turnstile ou a | Text |
| TURNSTILE_SECRET_KEY | Secret key widget Turnstile ou a | Secret |

Secret ki nan Worker webinar la pa parèt otomatikman nan yon lòt Worker. Si ou gen kle orijinal la nan yon password manager, ou kapab itilize li si permissions li yo apwopriye. Si ou pa gen valè li ankò, kreye yon lòt API key pou Educator nan menm kont Brevo a; pa efase oswa ranplase kle webinar la. Pa voye secrets yo nan chat ni nan GitHub.

Pou yon nouvo key: Brevo Settings → SMTP & API → API Keys & MCP → Generate API key. Non **Couragier Educator Form**. API key nòmal, pa SMTP/MCP. Si permissions disponib: Restricted, **Transactional email = All**, lòt resous None.

Pou Turnstile: Cloudflare → Turnstile → Add widget, non **Couragier Educator**, mode **Managed**, hostnames **couragier.com** ak **www.couragier.com**, pre-clearance dezaktive. Sèvi ak vrè kle Production yo. Widget la fè verifikasyon lè moun nan soumèt; li pa ajoute yon popup cookies.

Sove/deplwaye chanjman konfigirasyon yo. Health `configured: true` konfime kat valè yo prezan ak expéditeur a byen fòme; li pa pwouve Brevo valide kle a oswa inbox la resevwa email.

Dokiman: https://developers.cloudflare.com/workers/configuration/secrets/ ; https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/ ; https://help.brevo.com/hc/en-us/articles/40158277171474-About-API-key-permissions

## 3. Verifye partners@couragier.com

Mailbox oswa alias sa a dwe resevwa email epi pèmèt ou reponn kòm adrès sa a. Brevo pa kreye inbox li pou ou. Voye yon email tès nòmal pou li epi verifye ou resevwa l.

Nan Brevo, verifye expéditeur **Couragier Educator Partnerships <partners@couragier.com>** ak otantifikasyon domèn **couragier.com**. Si domèn lan deja otantifye, konsève konfigirasyon li; pa double dosye yo. Si Brevo mande dosye DNS, mete egzakteman sa li ba ou yo nan Cloudflare. CNAME DKIM yo dwe DNS only, san proxy. Pa efase MX ki sèvi inbox la, ni kreye yon dezyèm politik DMARC ki an konfli.

Verifye sèvis transactional email kont ou a otorize. Ou pa bezwen yon lis Contacts marketing, automation oswa template Brevo pou kòd sa a. Yon aplikasyon itilize de voye email: youn pou ekip la, youn pou kandida a.

Dokiman: https://developers.brevo.com/docs/getting-started-with-senders-and-domains ; https://help.brevo.com/hc/en-us/articles/16045394674066-Troubleshooting-Domain-authentication

## 4. Konekte Worker la ak gateway ki deja egziste a

Nan **couragier-api** (pa couragier-educator): **Bindings → Add binding → Service binding**.

| Chan | Valè |
| --- | --- |
| Variable name | EDUCATOR_SERVICE |
| Service / Worker | couragier-educator |
| Environment | Production, si meni sa a parèt |

Sove/deplwaye binding la. Apre sa, **couragier-api → Edit code**: ranplase kòd gateway la ak fichye **cloudflare/couragier-api.mjs** ki nan pake aktyèl la. Deplwaye li. Li konsève WEBINAR_SERVICE, MONCASH_SERVICE, WHOP_SERVICE epi ajoute EDUCATOR_SERVICE sèlman pou /educator/*.

Ansyen bouyon gateway ki te voye Educator sou WEBINAR_SERVICE la pa dwe itilize. Fichye aktyèl la korije sa. Pa deplwaye yon konfigirasyon Wrangler vid sou gateway la: sa ka chanje bindings li yo. Fè chanjman limite sa yo nan dashboard la pandan ou konsève tout bindings aktyèl yo.

Ou pa bezwen ajoute yon custom domain sou Educator la. Gateway la deja gen api.couragier.com; service binding lan konekte l ak nouvo Worker la.

Dokiman: https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/http/

## 5. Deplwaye sit prensipal la sou pwojè Pages ou itilize pou li

Fòm lan deja vize **https://api.couragier.com/educator/applications** epi li pran site key piblik la nan **https://api.couragier.com/educator/form-config**. CORS limite a https://couragier.com ak https://www.couragier.com. Adrès previews Sites ak lòt domèn pa otorize pou soumèt nan API Production sa a.

Build **npm run build**, output **dist**, Node **22**. Learn kontinye sèvi **dist-learn**. Pa bezwen Pages Functions, D1 oswa secrets Brevo sou pwojè Pages yo. Worker Educator la se yon deplwaman separe: mete sit la sou GitHub pa mete Worker la ajou otomatikman.

Sous modil Worker la nan server/, schema a nan src/data/educator-form.json. Chak npm run build rejenerasyon fichye sèl cloudflare/couragier-educator.mjs lan. Lè ou chanje kesyon oswa chwa yo, deplwaye Worker rejenerasyon an ak nouvo sit la ansanm.

## 6. Tès final la

Fè yon tès avèk pwòp adrès email ou sou paj Educator domèn Couragier a. Ranpli chan obligatwa yo, chwazi plizyè chwa, tcheke twa akò yo, epi klike Submit Application.

- Paj la dwe montre yon mesaj konfimasyon ak yon referans.
- partners@couragier.com dwe resevwa tout 20 gwoup repons yo ak tout chwa yo.
- Email kandida a dwe resevwa yon resi nan lang fòm lan, ki di aplikasyon an ap tann revizyon.
- Reply sou aplikasyon ekip la dwe vize email kandida a; Reply sou resi kandida a dwe vize partners@couragier.com.
- Nan Brevo Transactional → Logs, verifye **Delivered** pou tags **educator-application** ak **educator-confirmation**. Repete tès FR/HT si sa nesesè.

Yon repons API pozitif vle di Brevo aksepte demann voye a; verifye Delivered pou livrezon. Si premye email la pa aksepte, pa gen fo resi ki voye. Si premye email la aksepte men resi a echwe, sit la di kandida a aplikasyon an soumèt epi li pa bezwen aplike ankò.

Pa gen baz done Educator, lis Contacts otomatik, ni ke retry endepandan. Aplikasyon yo rive nan inbox ou. Si yon timeout fè soumisyon an ensèten, chèche referans lan nan inbox/logs anvan ou mande kandida a repete li. Brevo limite doublon menm demann lan pandan fenèt idempotency 15 minit li a.

Dokiman: https://help.brevo.com/hc/en-us/articles/360021533839-Manage-your-transactional-logs-and-email-previews

## Email konfimasyon ki deja prepare

**EN — We received your Couragier application**

Hello [name],

Thank you for applying to become a Couragier educator. We have received your application. Our team will review it and contact you once a decision has been made.

This email confirms receipt only. It does not mean your application has been accepted.

Application reference: [reference]

If you have any questions, reply to this email.

Couragier Educator Partnerships
partners@couragier.com

**FR — Nous avons reçu votre candidature Couragier**

Bonjour [nom],

Merci d’avoir proposé votre candidature pour devenir éducateur Couragier. Nous avons bien reçu votre candidature. Notre équipe l’examinera et vous contactera une fois sa décision prise.

Cet email confirme uniquement la réception de votre candidature. Il ne constitue pas une acceptation.

Référence de candidature : [référence]

Pour toute question, vous pouvez répondre à cet email.

Couragier Educator Partnerships
partners@couragier.com

**HT — Nou resevwa aplikasyon Couragier ou a**

Bonjou [non],

Mèsi paske ou aplike pou vin yon edikatè Couragier. Nou resevwa aplikasyon ou. Ekip nou an ap revize li epi kontakte ou lè nou pran yon desizyon.

Email sa a konfime nou resevwa aplikasyon ou sèlman. Li pa vle di nou aksepte aplikasyon an.

Referans aplikasyon an: [referans]

Si ou gen kesyon, ou ka reponn email sa a.

Couragier Educator Partnerships
partners@couragier.com

## Apre ou fin revize yon aplikasyon

Ouvri email aplikasyon an nan partners@couragier.com epi fè **Reply**. Ekri desizyon ou ak pwochen etap yo. Pa gen okenn desizyon ki fèt oswa voye otomatikman nan entegrasyon sa a.
