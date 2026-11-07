(() => {
  const assistant = document.createElement('div');
  assistant.className = 'cg-ai';
  assistant.innerHTML = `<button class="cg-ai-launcher" id="cg-ai-launcher" type="button" aria-controls="cg-ai-chat" aria-expanded="false"><span id="cg-ai-launchText"></span><span class="cg-ai-avatar cg-ai-online"><img src="/assets/couragier-ai-avatar.webp" alt="" width="48" height="48"></span></button>
<dialog class="cg-ai-intro" id="cg-ai-intro" aria-labelledby="cg-ai-title" aria-describedby="cg-ai-description">
<button id="cg-ai-intro-close" class="cg-ai-dismiss" type="button">×</button>
<div class="cg-ai-stage"><img id="cg-ai-poster" src="/assets/couragier-lion-welcome.webp" width="480" height="480" alt="" fetchpriority="high"><video id="cg-ai-video" width="480" height="480" muted playsinline loop preload="none" aria-hidden="true"></video></div>
<div class="cg-ai-callout"><span class="cg-ai-avatar" id="cg-ai-origin"><img src="/assets/couragier-ai-avatar.webp" alt="" width="48" height="48"></span><div><h2 id="cg-ai-title"></h2><p id="cg-ai-description"></p></div></div>
</dialog>
<section class="cg-ai-chat" id="cg-ai-chat" aria-labelledby="cg-ai-chat-title" hidden>
<header><span class="cg-ai-avatar cg-ai-online"><img src="/assets/couragier-ai-avatar.webp" alt="" width="48" height="48"></span><div><h2 id="cg-ai-chat-title">Couragier</h2><p id="cg-ai-status">Online</p></div><button id="cg-ai-close" type="button">×</button></header>
<div class="cg-ai-tools"><div><button type="button" data-lang="ht" aria-label="Kreyòl ayisyen">HT</button><button type="button" data-lang="en" aria-label="English">EN</button><button type="button" data-lang="fr" aria-label="Français">FR</button></div></div>
<div id="cg-ai-log" class="cg-ai-log" role="log"></div>
<div id="cg-ai-suggestions" class="cg-ai-suggestions"></div>
<form id="cg-ai-form"><input id="cg-ai-message" maxlength="400" autocomplete="off"><button type="submit" id="cg-ai-send"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg></button></form>
</section>`;
  document.body.append(assistant);

const content = {
  ht: {
    launch: 'Pale ak Couragier',
    close: 'Fèmen chat', send: 'Voye', placeholder: 'Ekri kesyon w lan…',
    questions: ['Ki sa Couragier ye?', 'Ki resous mwen ka jwenn?', 'Mwen vle anseye'],
  },
  en: {
    launch: 'Talk to Couragier',
    close: 'Close chat', send: 'Send', placeholder: 'Type your question…',
    questions: ['What is Couragier?', 'What resources can I find?', 'I want to teach'],
  },
  fr: {
    launch: 'Parler à Couragier',
    close: 'Fermer le chat', send: 'Envoyer', placeholder: 'Écrivez votre question…',
    questions: ['Qu’est-ce que Couragier ?', 'Quelles ressources puis-je trouver ?', 'Je veux enseigner'],
  }
};
const learningUrl = 'https://learn.couragier.com/';
const get = id => assistant.querySelector('#cg-ai-' + id);
const chat = get('chat');
const launcher = get('launcher');
const log = get('log');
const input = get('message');
let language = content[document.documentElement.lang] ? document.documentElement.lang : 'ht';

function bubble(message, user = false, link) {
  const item = document.createElement('p');
  item.className = user ? 'bubble you' : 'bubble';
  item.textContent = message;
  if (link) {
    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.textContent = link.label + ' ↗';
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    item.append(anchor);
  }
  log.append(item);
  log.scrollTop = log.scrollHeight;
}

const supportEmail = 'support@couragier.com';
const guidance = {
  ht: {
    hello: 'Bonjou 👋 Mwen se Couragier. M ap ede w jwenn paj ak opsyon w bezwen sou platfòm nan.',
    support: 'Pou plis detay sou sa, ekip Couragier la disponib nan support@couragier.com.',
    pages: ['Ale nan Akèy', 'Gade Ecosystem nan', 'Gade kesyon moun poze souvan yo', 'Gade temwayaj yo', 'Ale nan espas sètifika yo', 'Gade eksperyans aprantisaj la', 'Konsènan Couragier', 'Ale nan boutik la'],
  },
  en: {
    hello: "Hi👋 I'm Couragier. I can help you find your way around the platform.",
    support: 'For more details, please contact the Couragier team at support@couragier.com.',
    pages: ['Go to Home', 'Explore Our Ecosystem', 'Read the FAQ', 'Read learner reviews', 'Open Credentials', 'Explore Our Learning Experience', 'About Couragier', 'Open the shop'],
  },
  fr: {
    hello: 'Bonjour 👋 Je suis Couragier. Je peux vous aider à trouver les pages et les options de la plateforme.',
    support: 'Pour plus de détails, contactez notre équipe à support@couragier.com.',
    pages: ['Retour à l’accueil', 'Découvrir notre écosystème', 'Consulter la FAQ', 'Lire les avis', 'Voir les diplômes et certificats', 'Découvrir notre expérience d’apprentissage', 'À propos de Couragier', 'Ouvrir la boutique'],
  }
};

const pages = [
  { match: /^(home|accueil|akey)$|\b(home page|homepage|page d accueil|paj akey)\b/, path: '' },
  { match: /\b(ecosystem\w*|ekosistem)\b/, path: '#ecosystem' },
  { match: /\b(faq|frequently asked|kesyon moun poze|questions frequentes)\b/, path: '#faq' },
  { match: /\b(reviews?|avis|temwayaj|testimonials?)\b/, path: 'reviews' },
  { match: /\b(credentials|certificates?|certificats?|setifika|diplom\w*)\b/, url: 'https://credentials.couragier.com/' },
  { match: /\b(learning experience|experyans aprantisaj|experience d apprentissage|catalog\w*|katalog)\b/, url: learningUrl },
  { match: /\b(about|a propos|konsenan)\b/, path: 'about' },
  { match: /\b(shop|boutik|boutique)\b/, url: 'https://shop.couragier.com/' },
];

const knowledge = [
  {
    match: /\b(credentials|certificates?|certificats?|setifika)\b/,
    url: 'https://credentials.couragier.com/',
    label: ['Open Credentials', 'Ouvrir Credentials', 'Ale nan espas sètifika yo'],
    text: [
      'You can claim your certificate in Couragier Credentials once you meet the requirements for an eligible program. Select Credentials in the header to open the portal.',
      'Vous pouvez réclamer votre certificat dans Couragier Credentials lorsque vous remplissez les conditions d’un programme admissible. Sélectionnez Diplômes et certificats dans le menu supérieur.',
      'Ou ka reklame sètifika w nan Couragier Credentials lè w fin ranpli kondisyon yon pwogram ki bay sètifika. Chwazi Diplòm ak sètifika nan tèt paj la pou w ouvri espas la.',
    ],
  },
  {
    match: /\b(practice|pratike|pratique|exercis\w*|egzesis|demonstrat\w*|demonstrasyon|learning method|metod aprantisaj|comment apprend\w*|kijan m ap aprann)\b/,
    path: '#learning-journey', label: ['Your Learning Journey', 'Parcours d’apprentissage', 'Chemen aprantisaj ou'],
    text: [
      'Start with an explanation, see how it works in a demonstration, then try it yourself. An exercise or checklist can help you spot what you understand and what to revisit.',
      'Commencez par une explication, observez une démonstration, puis essayez par vous-même. Un exercice ou une liste de vérification vous aide à voir ce que vous maîtrisez et ce qu’il faut revoir.',
      'Kòmanse ak yon eksplikasyon, gade kijan sa mache nan yon demonstrasyon, epi eseye l poukont ou. Yon egzèsis oswa yon lis verifikasyon ede w wè sa w konprann ak sa w bezwen revize.',
    ],
  },
  {
    match: /\b(beginners?|debutant\w*|beginner friendly|fe[kq] komanse|fe[kq] ap aprann|first time|premiere fois)\b/,
    path: '#faq', label: ['Read the FAQ', 'Consulter la FAQ', 'Gade kesyon moun poze souvan yo'],
    text: [
      'Yes. Couragier is designed to help beginners start with clear explanations and examples. You can revisit a lesson and practise at your own pace.',
      'Oui. Couragier aide les débutants à démarrer avec des explications et des exemples clairs. Vous pouvez revoir une leçon et pratiquer à votre rythme.',
      'Wi. Couragier ede moun ki fèk kòmanse ak eksplikasyon ak egzanp ki klè. Ou ka repran yon leson epi pratike nan ritm pa w.',
    ],
  },
  {
    match: /\b(language\w*|langue\w*|lang|creole|kreyol|french|francais|english|angle|angl[eè])\b/,
    text: [
      'You can explore the website in English, French or Haitian Creole. Use EN, FR or HT in the header. For the language of a particular course, contact support@couragier.com.',
      'Vous pouvez explorer le site en anglais, en français ou en créole haïtien. Utilisez EN, FR ou HT dans le menu supérieur. Pour connaître la langue d’un cours précis, écrivez à support@couragier.com.',
      'Ou ka eksplore sit la an anglè, an fransè oswa an kreyòl ayisyen. Chwazi EN, FR oswa HT nan tèt paj la. Pou konnen nan ki lang yon kou presi disponib, ekri support@couragier.com.',
    ],
  },
  {
    match: /\b(mascot\w*|mascot|maskot|lion|lyon|companion|konpayon|compagnon|krinye|mane|who are you|kiyes ou ye|qui es tu)\b/,
    text: [
      'I’m Couragier, your learning companion. You’ll meet me in courses, books, videos and practice materials. I help illustrate ideas, point out details during demonstrations and encourage you to try what you’ve learned. Here on the website, I can help you find the right page or resource.',
      'Je suis Couragier, votre compagnon d’apprentissage. Vous me retrouverez dans les cours, les livres, les vidéos et les fiches pratiques. J’illustre les idées, j’attire votre attention sur les détails pendant les démonstrations et je vous invite à mettre en pratique vos acquis. Sur ce site, je peux aussi vous orienter vers la bonne page.',
      'Mwen se Couragier, konpayon aprantisaj ou. W ap rankontre m nan kou, liv, videyo ak fich pratik. M ap ede w wè lide yo pi klè, remake detay nan demonstrasyon yo epi eseye sa w sot aprann nan. Sou sit la, mwen ka montre w tou ki kote pou w jwenn paj oswa resous w bezwen an.',
    ],
  },
  {
    match: /\b(ecosystem\w*|ekosistem|resources?|resous|ressources?|books?|liv|livres?|audio|videos?|videyo|toolkits?|checklists?|templates?|modeles?|mod[eè]l)\b/,
    path: '#ecosystem', label: ['Explore Our Ecosystem', 'Découvrir notre écosystème', 'Gade ekosistèm nan'],
    text: [
      'Our Ecosystem brings together courses, books, videos, audio and practical tools. Use a course to follow a topic step by step, a video to see a process, or a template or checklist when you’re ready to apply it.',
      'Notre écosystème réunit des cours, des livres, des vidéos, des contenus audio et des outils pratiques. Suivez un cours pour avancer étape par étape, une vidéo pour voir un processus, ou un modèle pour passer à la pratique.',
      'Ekosistèm nan rasanble kou, liv, videyo, kontni odyo ak zouti pratik. Ou ka suiv yon kou etap pa etap, gade yon videyo pou wè kijan yon pwosesis mache, oswa sèvi ak yon modèl oswa yon lis verifikasyon lè w pare pou pratike.',
    ],
  },
  {
    match: /\b(what is couragier|ki ?sa couragier ye|qu est ce que couragier|mission|misyon|why couragier|poukisa couragier|pourquoi couragier|platform|platfom|plateforme)\b/,
    url: learningUrl, label: ['Explore Our Learning Experience', 'Découvrir notre expérience d’apprentissage', 'Gade eksperyans aprantisaj la'],
    text: [
      'Couragier is an online learning platform for practical skills. Lessons connect clear explanations with demonstrations and exercises so you can apply what you learn in your work or projects.',
      'Couragier est une plateforme d’apprentissage en ligne axée sur les compétences pratiques. Les leçons combinent explications, démonstrations et exercices pour vous aider à appliquer vos acquis dans vos projets ou votre travail.',
      'Couragier se yon platfòm aprantisaj sou entènèt pou devlope konpetans pratik. Leson yo mete eksplikasyon, demonstrasyon ak egzèsis ansanm pou w ka itilize sa w aprann nan travay ou oswa nan pwojè w.',
    ],
  },
];

const conversation = [
  {
    match: /\b(how are (you|u)|how r (you|u)|how are you doing|how s it going|how do you feel|what s up|whats up|sup|wsg|koman (ou|w) ye|kouman (ou|w) ye|kijan (ou|w) ye|koman sa ye|koman sa ap mache|sak pase|sa k pase|ou anfom|ou byen|tout bagay anfom|comment (vas tu|allez vous|ca va|tu vas)|ca va|tu vas bien|vous allez bien|la forme|quoi de neuf)\b/,
    text: ['I’m doing well, thanks for asking! How can I help you explore Couragier today?', 'Ça va bien, merci ! Qu’aimeriez-vous découvrir sur Couragier aujourd’hui ?', 'Mwen byen, mèsi dèske w mande! Ki sa ou ta renmen dekouvri sou Couragier jodi a?'],
  },
  {
    match: /\b(what (is|s) (your|ur) name|your name|who (am i talking to|are you)|tell me about (yourself|you)|tell me who you are|introduce yourself|what should i call you|ki non (ou|w)|nonw|kijan (ou|w) rele|kijanw rele|koman (ou|w) rele|komanw rele|kiyes (ou|w) ye|pale m de ou|palem de ou|prezante tet ou|quel est (ton|votre) nom|comment (tu t appelles|t appelles tu|vous appelez vous)|tu t appelles comment|qui (es tu|etes vous)|parle moi de toi|parlez moi de vous|presente toi)\b/,
    text: [
      'I’m Couragier, your learning companion 🦁. You’ll see me in courses, books, videos and practice materials, helping you follow examples and put ideas into practice. Here in the chat, I can help you explore the platform.',
      'Je m’appelle Couragier, votre compagnon d’apprentissage 🦁. Vous me retrouverez dans les cours, les livres, les vidéos et les fiches pratiques pour suivre les exemples et mettre vos acquis en pratique. Ici, je vous aide à explorer la plateforme.',
      'Mwen rele Couragier, konpayon aprantisaj ou 🦁. W ap rankontre m nan kou, liv, videyo ak fich pratik, kote m ap ede w suiv egzanp yo epi pratike sa w aprann. Isit la nan chat la, mwen ka gide w sou platfòm nan.',
    ],
  },
  {
    match: /\b(satisf\w*|recommend\w*|happy with|student feedback|learner feedback|what (do|did) (students|learners) (say|think)|moun (yo )?(renmen|kontan)|elev (yo )?(renmen|kontan)|etidyan (yo )?(renmen|kontan|satisf[eè])|aprenan (yo )?kontan|rekomand\w*|apprecient|retours des apprenants|avis des (eleves|etudiants))\b/,
    path: 'reviews',
    label: ['Read learner reviews', 'Lire les avis', 'Li temwayaj elèv yo'],
    text: [
      'You can read what learners have shared on the Reviews page. Each review reflects an individual experience. Take a look at their comments to see what they found useful and whether it matches what you’re looking for.',
      'Vous pouvez lire les retours des apprenants sur la page Avis. Chaque avis reflète une expérience individuelle. Leurs commentaires vous aideront à voir ce qui leur a été utile et si cela correspond à vos attentes.',
      'Ou ka li sa elèv yo pataje sou paj Temwayaj la. Chak temwayaj rakonte eksperyans yon moun. Gade sa yo di ki te itil yo pou w wè si sa koresponn ak sa w ap chèche a.',
    ],
  },
  {
    match: /\b(understand\w*|follow along|too (hard|difficult)|easy to (follow|read|understand)|keep up|slow learner|learning pace|assurance|rasirans|rasire|asirans|konprann|tw[oò] difisil|pe m|p[eè] m|mwen pe|m pe|comprendre|compris|comprehension|facile a suivre|trop difficile|suivre le rythme|a mon rythme|rassur\w*)\b/,
    path: '#learning-journey',
    label: ['See how learning works', 'Voir le parcours d’apprentissage', 'Gade kijan aprantisaj la mache'],
    text: [
      'It’s normal to wonder whether you’ll be able to follow. Couragier breaks ideas into clear explanations, examples and practice. You can revisit a lesson or reread a passage, then try an exercise to see what’s clear and what needs more time. Your progress will depend on your pace and practice.',
      'C’est normal de se demander si l’on pourra suivre. Couragier présente les idées avec des explications claires, des exemples et de la pratique. Vous pouvez revoir une leçon, relire un passage, puis faire un exercice pour repérer ce qui est acquis et ce qui demande encore du temps. Votre progression dépendra de votre rythme et de votre pratique.',
      'Li nòmal pou w mande tèt ou si w ap ka suiv. Couragier prezante lide yo ak eksplikasyon klè, egzanp ak pratik. Ou ka repran yon leson oswa reli yon pasaj nan yon liv, epi fè yon egzèsis pou w wè sa w konprann ak sa ki bezwen plis tan. Pwogrè w ap depann de ritm ou ak pratik ou.',
    ],
  },
  {
    match: /\b(what can you (do|help)|how can you help|help me (navigate|explore|find)|ak kisa ou ka ede|kijan ou ka edem|ki sa ou ka fe|kisa ou ka fe|sa ou ka fe|ou ka edem|kijan ou ka ede m|comment (peux tu|pouvez vous) m aider|que (peux tu|pouvez vous) faire|a quoi sers tu)\b/,
    text: [
      'I can show you how learning works, help you explore resources and point you to Credentials, learner reviews or the Educator page. Tell me what you’d like to find.',
      'Je peux vous expliquer le parcours d’apprentissage, vous aider à découvrir les ressources ou vous orienter vers les avis, les certificats ou la page des éducateurs. Dites-moi ce que vous cherchez.',
      'Mwen ka esplike kijan aprantisaj la mache, ede w dekouvri resous yo oswa montre w ki kote pou w jwenn sètifika, temwayaj ak paj edikatè yo. Di m sa w ta renmen jwenn.',
    ],
  },
];

const socialReplies = [
  {
    match: /^(hi+|hey+|hello+|yo|salut|coucou|slt|bjr|bsr|bonjour|bonsoir|bonjou|bonswa|alo|allo|good morning|good afternoon|good evening|bon maten)( (there|couragier|tout moun|everyone|a toi))?$/,
    text: ['Hey 👋 What would you like to explore on Couragier?', 'Salut 👋 Qu’aimeriez-vous découvrir sur Couragier ?', 'Hey 👋 Ki sa ou ta renmen dekouvri sou Couragier?'],
  },
  {
    match: /\b(thank(s| you)|thx|tysm|ty|m[eè]si|mrc|merci|mille mercis|appreciate it|much appreciated|je te remercie|je vous remercie)\b/,
    text: ['You’re welcome! I’m here if you’d like to explore anything else.', 'Avec plaisir ! Je suis là si vous souhaitez découvrir autre chose.', 'Avèk plezi! Mwen la si w vle dekouvri yon lòt bagay.'],
  },
  {
    match: /\b(congrats|congratulations|well done|good job|great job|nice work|love (it|this|your (site|website))|proud of you|awesome|amazing|impressive|bravo|felicitasyon|felicitations|chapo|bel travay|bon travay|m renmen (sa|sit la)|mwen renmen (sa|sit la)|c est (super|genial|excellent)|j adore|beau travail|tres bien)\b/,
    text: ['Thank you, that’s kind of you! I’m glad you’re enjoying Couragier.', 'Merci, c’est gentil ! Je suis ravi que Couragier vous plaise.', 'Mèsi anpil, sa fè m plezi! Mwen kontan ou renmen eksperyans lan.'],
  },
  {
    match: /^(ok+|okay|oke|dako|d accord|dac|parfait|perfect|got it|understood|compris( merci)?|m konprann|mwen konprann|se bon|sounds good)$/,
    text: ['Got it! What else would you like to explore?', 'Parfait ! Que souhaitez-vous explorer ensuite ?', 'Dakò! Ki lòt bagay ou ta renmen dekouvri?'],
  },
  {
    match: /^(bye|goodbye|see you( later)?|good night|au revoir|a bientot|bonne nuit|n a we|na we|orevwa|bon nwit|pita)( (couragier|tout moun))?$/,
    text: ['See you soon 👋 Enjoy your learning journey!', 'À bientôt 👋 Bon apprentissage !', 'N a wè 👋 Bon aprantisaj!'],
  },
];

const encouragement = [
  {
    match: /\b(failed|failure|echwe|echek|ech[eè]k|echec|echoue|rate|setback|rekomanse|recommencer|start over)\b/,
    en: 'A setback can be painful. Give yourself a little space, then choose one lesson from what happened and one small change to try next.',
    fr: 'Un échec peut faire mal. Accordez-vous un peu de recul, puis retenez une leçon et choisissez un petit changement à essayer.',
    ht: [
      'Sa fè mal lè yon bagay ou te espere pa mache. Bay tèt ou yon ti tan, epi chwazi yon sèl leson ou vle pote nan pwochen tantativ ou.',
      'Ou ka desi epi toujou gen kapasite pou w avanse. Pran yon ti poz anvan ou deside ki pati ou vle eseye ankò.',
      'Rezilta jodi a pa di tout sa ou kapab fè. Li ka ede w wè ki detay ou bezwen chanje nan pwochen esè a.',
      'Lè w pare, ekri sa ou te eseye, sa ki te rive ak sa ou ta fè yon lòt jan. Twa ti liy sa yo ka ede w reprann chemen an.',
      'Rekòmanse pa efase eksperyans ou. Ou pote avè w tout sa premye tantativ la te aprann ou.',
      'Chèche yon pati nan sa w te fè a ki te mache. Ou ka kenbe pati sa a epi ajiste rès la piti piti.',
      'Si w ap repase menm erè a nan tèt ou, eseye ekri sa ou te aprann ladan l. Sa ka ede w prepare pwochen desizyon an.',
      'Ou gen dwa chanje metòd ou lè li pa bay rezilta. Chwazi yon ti esè ou ka fè san w pa mete twòp presyon sou tèt ou.',
      'Pale ak yon moun ou fè konfyans sou sa ki te rive a. Yon lòt pèspektiv ka ede w wè yon opsyon ki te chape w.',
      'Pwochen tantativ ou ka pi piti pase premye a. Yon ti esè ba w chans pou w aprann san w pa oblije refè tout bagay.',
    ],
  },
  {
    match: /\b(tired|exhausted|burnt out|burnout|fatigue|epuise|bouke|fatige|overwhelmed|deborde|stress\w*|estres[eè]?)\b/,
    en: 'It sounds like you’ve been carrying a lot. Take a break if you can, then decide what needs your attention today and what can wait.',
    fr: 'Vous semblez porter beaucoup en ce moment. Prenez une pause si vous le pouvez, puis distinguez ce qui demande votre attention aujourd’hui de ce qui peut attendre.',
    ht: [
      'Si w bouke, pran yon ti poz si sa posib. Lè w retounen, chwazi yon sèl bagay ki bezwen atansyon w jodi a.',
      'Lè tout bagay sanble ijan, ekri sa ki sou tèt ou. Chwazi sa ki gen pi gwo konsekans si li tann, epi kòmanse la.',
      'Ou ka mande yon moun ede w ak yon travay byen presi. Yon ti èd sou yon bagay ka soulaje tout rès jounen an.',
      'Si jounen an chaje, gade si gen yon travay ou ka ranvwaye oswa senplifye. Sa ka ba w ase espas pou w reprann souf.',
      'Pran yon ti moman pou w manje, bwè dlo oswa mache si w kapab. Apre sa, deside ki travay ou gen enèji pou w fè.',
      'Si w pa gen menm enèji ak yè, ajiste plan jodi a. Chwazi yon objektif ou ka rive fini ak fòs ou genyen kounye a.',
      'Eseye fè yon sèl bagay alafwa pandan kèk minit. Lè w fin fè l, ou ka deside si w kontinye oswa si w bezwen repo.',
      'Gen travay ou ka remèt, gen lòt ou ka mande èd pou yo. Gade kiyès ou kapab retire sou zepòl ou jodi a.',
      'Apre yon jounen lou, menm yon ti moman trankil ka ede w reprann tèt ou. Ou ka kite gwo desizyon yo pou lè w gen plis enèji.',
      'Si w gen anpil bagay pou w kenbe nan tèt ou, mete yo sou papye. Se yon fason pou w bay tèt ou yon ti repo pandan w ap òganize yo.',
    ],
  },
  {
    match: /\b(compar\w*|behind|too late|en retard|an reta|two ta|pi devan|jalou|envie|everyone else)\b/,
    en: 'It’s easy to compare your progress with someone else’s. Look at what you can do today that was harder for you a month ago, then build on that.',
    fr: 'On se compare facilement aux autres. Regardez ce que vous savez faire aujourd’hui et qui vous semblait plus difficile il y a un mois, puis appuyez-vous sur ce progrès.',
    ht: [
      'Lè w wè yon lòt moun avanse, sonje sa w wè a se yon pati nan chemen li. Pran yon ti tan pou w gade pwogrè pa w tou.',
      'Konpare sa w kapab fè jodi a ak sa ki te difisil pou ou mwa pase. Ou ka dekouvri yon pwogrè ou pa t remake.',
      'Ou ka aprann nan sa lòt moun fè epi adapte l ak mwayen ou. Chwazi yon sèl lide ki itil pou etap kote ou ye a.',
      'Ritm ou ka chanje selon sa k ap pase nan lavi w. Chwazi yon etap ki antre nan tan ak resous ou genyen kounye a.',
      'Lè w santi w an reta, ekri sa ou ta renmen reyalize ak premye aksyon ou ka pran. Kòmanse ak aksyon an.',
      'Mete yon objektif ou ka mezire pou tèt ou. Pa egzanp, fini yon egzèsis oswa pale ak yon premye kliyan.',
      'Kite siksè yon lòt moun ba w yon lide pou w eseye. Kenbe sa ki itil epi fè l nan fason ki mache pou ou.',
      'Si rezo sosyal yo fè w santi w anba presyon, pran yon ti distans epi retounen sou plan pa w la pou jounen an.',
      'Ou ka remake pwogrè w nan yon bagay ou rezoud pi vit oswa yon kesyon ou konprann pi byen. Note l pou w sonje li.',
      'Chwazi yon objektif ki gen sans pou lavi pa w. Sa ede w deside ki opòtinite pou w pran ak kiyès pou w kite pase.',
    ],
  },
  {
    match: /\b(no sales|low sales|clients?|customers?|kliyan|lavant|lavan|sales|ventes|vann|biznis|business|entreprise)\b/,
    en: 'When business feels slow, start with what you can observe. Ask one potential customer what they need, then use their answer to improve one part of your offer.',
    fr: 'Quand les affaires ralentissent, partez de ce que vous pouvez observer. Demandez à un client potentiel ce dont il a besoin, puis améliorez un élément de votre offre à partir de sa réponse.',
    ht: [
      'Lè lavant yo dousman, pale ak yon kliyan potansyèl. Mande l ki pwoblèm li vle rezoud epi koute mo li itilize yo.',
      'Ou ka teste yon ti chanjman nan fason ou prezante òf ou a. Note sa w chanje pou w ka konpare reyaksyon moun yo.',
      'Si w santi tout bagay nan biznis la mande atansyon, chwazi yon sèl pati pou w gade jodi a, tankou fason kliyan dekouvri òf la.',
      'Yon kliyan ki poze anpil kesyon ka montre w ki enfòmasyon ki manke. Sèvi ak kesyon li yo pou fè òf la pi klè.',
      'Lè yon moun pa achte, ou ka mande l avèk respè ki sa ki te fè l ezite. Repons li ka ba w yon detay pou w verifye.',
      'Fè yon ti bilan sou sa w aprann semèn sa a sou kliyan yo. Chwazi yon sèl lide ou ka teste anvan w pran yon gwo desizyon.',
      'Si w ap kòmanse, eseye esplike òf ou a nan yon fraz. Di pou kiyès li ye ak pwoblèm li ede rezoud.',
      'Lè w santi w bloke, tounen sou sa kliyan yo deja di w. Gen dwa gen yon kesyon ki repete ou ka sèvi avè l pou amelyore òf ou.',
      'Yon jounen san lavant ka lou. Chwazi yon aksyon ki depann de ou, tankou amelyore yon deskripsyon oswa mande yon moun opinyon li.',
      'Ou ka aprann nan ti esè anvan w depanse plis. Ekri sa w espere obsève epi gade ki reyaksyon ou jwenn.',
    ],
  },
  {
    match: /\b(fear|scared|afraid|peur|p[eè] |doute|doubt|confidence|confiance|konfyans|ens[eè]ten|imposter)\b/,
    en: 'You can feel uncertain and still take a small step. Pick something you can try safely, then use what you learn to decide what comes next.',
    fr: 'Vous pouvez douter et avancer par une petite étape. Choisissez un essai à votre portée, puis utilisez ce que vous apprenez pour décider de la suite.',
    ht: [
      'Ou ka gen dout epi fè yon ti pa kanmenm. Chwazi yon bagay ou ka eseye san twòp presyon, epi gade sa w aprann.',
      'Konfyans ka grandi pandan w ap pratike. Kòmanse ak yon egzèsis ou ka fè nan yon kote ou santi w alèz.',
      'Si yon desizyon fè w pè, ekri ki enfòmasyon ou bezwen pou pran li. Chèche youn nan enfòmasyon sa yo an premye.',
      'Ou gen dwa mande yon moun montre w yon egzanp. Sa ka ede w wè ki kote pou w kòmanse.',
      'Si w ap tann moman ou santi w pare nèt la, eseye yon vèsyon pi piti nan sa ou vle fè a.',
      'Pran yon moman pou w sonje yon bagay ki te difisil pou ou e ou rive aprann li. Ki sa ki te ede w lè sa a?',
      'Si w pè fè yon erè, chwazi yon kote pou w pratike kote ou ka korije erè a fasil.',
      'Lè w pa sèten, di sa w konnen ak sa w bezwen verifye. Sa ka fè pwochen aksyon an vin pi klè.',
      'Kòmanse ak yon bagay ou kapab fini jodi a. Lè w wè li fini, ou gen yon prèv konkrè ou ka bati sou li.',
      'Ou ka mande yon moun ou fè konfyans gade premye esè w la. Mande l yon sèl bagay ki klè ak yon sèl bagay ou ka amelyore.',
    ],
  },
  {
    match: /\b(stuck|blocked|bloke|blok[eè]|bloque|perdu|pedi|lost|don t know where|pa konn ki kote|pa konn kijan|demarrer|komanse)\b/,
    en: 'When the whole goal feels too big, make the next action small enough to finish. Write down what you’ll do and give yourself a short window to try it.',
    fr: 'Si l’objectif vous paraît trop grand, choisissez une première action assez petite pour la terminer. Notez-la et accordez-vous un court moment pour l’essayer.',
    ht: [
      'Si objektif la sanble gwo, koupe l an yon aksyon ou ka fini jodi a. Ekri aksyon sa a epi ba li yon ti plas nan jounen w.',
      'Si w pa konnen ki kote pou w kòmanse, eseye esplike sa w vle fè nan yon sèl fraz. Sa ka ede w wè premye etap la.',
      'Lè w bloke sou yon detay, retounen kote bagay yo te kòmanse vin konfizyon. Mande yon kesyon sou pati sa a.',
      'Bay tèt ou dis minit pou w eseye yon ti bagay. Apre dis minit sa yo, deside si w bezwen plis enfòmasyon oswa plis pratik.',
      'Chwazi yon bagay ki depann de ou jodi a. Sa ka yon apèl, yon egzèsis oswa yon paj pou w li.',
      'Si w gen twòp opsyon, konpare de nan yo sèlman. Gade kiyès ou ka eseye pi fasil ak sa ou deja genyen.',
      'Ekri sa w deja fè anvan ou ekri sa ki rete. Li ka ede w wè ki kote pou w reprann travay la.',
      'Ou ka eseye esplike pwoblèm nan byen fò. Pafwa, lè w tande l ak pwòp mo pa w, ou remake detay ki bloke w la.',
      'Si premye chemen ou te chwazi a fèmen, chèche yon lòt fason pou rive nan menm ti objektif la.',
      'Mande yon moun ki pase nan menm etap la ki premye bagay li te fè. Pran sa ki itil epi adapte l ak sitiyasyon w.',
    ],
  },
  {
    match: /\b(habit\w*|abitid|disciplin\w*|disiplin|consisten\w*|regilarite|regularite|rut[in]+\w*|woutin|procrastin\w*|ranvwaye)\b/,
    en: 'Choose a habit small enough to repeat on a busy day. Tie it to something you already do, and return to it the next day if you miss one.',
    fr: 'Choisissez une habitude assez petite pour les journées chargées. Associez-la à une action que vous faites déjà et reprenez le lendemain si vous manquez un jour.',
    ht: [
      'Chwazi yon abitid ou ka fè menm lè jounen an chaje. Mare l ak yon bagay ou deja fè, tankou bwè premye kafe w.',
      'Si w rate yon jou, reprann nan pwochen okazyon an. Yon ti aksyon regilye ka ede w reprann ritm ou.',
      'Mete materyèl ou bezwen an pare davans. Sa ka fè l pi fasil pou w kòmanse lè moman an rive.',
      'Eseye pratike nan menm lè a pandan kèk jou. Apre sa, gade si lè sa a vrèman mache ak orè w.',
      'Si dis minit twòp jodi a, eseye senk. Sa ba w yon fason pou w kontinye pandan w ap adapte plan an.',
      'Note chak fwa ou fin fè ti travay la. Gade nòt yo nan fen semèn nan pou w wè ki jou ou jwenn pi bon moman pou w pratike.',
      'Divize travay la an ti pati ou ka fini separeman. Chak fwa ou retounen, w ap konnen egzakteman ki pati pou w pran.',
      'Retire yon distraksyon anvan w kòmanse. Mete telefòn nan yon lòt kote si se li ki souvan entèwonp ou.',
      'Si yon abitid pa kenbe, gade kisa ki fè l difisil pou w repete. Eseye chanje lè a, kote a oswa kantite tan an.',
      'Chwazi yon ti aksyon pou w repete semèn sa a. Lè l vin pi fasil, deside si w vle ajoute yon lòt.',
    ],
  },
  {
    match: /\b(sad|lonely|alone|tris|triste|seul\w*|poukont mwen|pou kont mwen|solitid|solitude|hard day|jou difisil|reconfort\w*|rekonfo\w*|comfort\w*)\b/,
    en: 'I’m sorry today feels hard. You can take a moment for yourself and reach out to someone you trust if you’d like company or a listening ear.',
    fr: 'Cette journée semble difficile. Prenez un moment pour vous et, si vous avez besoin d’être écouté, parlez à une personne de confiance.',
    ht: [
      'Sa sanble yon moman difisil. Pran yon ti tan pou tèt ou, epi si w bezwen pale, chèche yon moun ou fè konfyans.',
      'Ou gen dwa santi w tris menm si w ap fè tout sa w kapab. Chwazi yon ti bagay ki ka rann moman sa a pi dous pou ou.',
      'Si w santi w poukont ou, ou ka voye yon mesaj senp bay yon moun ki pwòch ou. Di l ou ta renmen pale yon ti moman.',
      'Pran moman an youn apre lòt. Chèche sa ki ka fè pwochen kèk minit yo vin yon ti jan pi fasil.',
      'Pafwa sa ede w di byen fò sa k ap peze sou ou. Chwazi yon moun ou santi ou alèz pou w pale avè l.',
      'Ou ka bay tèt ou pèmisyon pou w reprann pi dousman jodi a. Yon ti moman trankil ka ede w pran swen tèt ou.',
      'Si w pa jwenn bon mo pou w esplike sa w santi a, ou ka jis di yon moun ou bezwen li koute w.',
      'Lè w bezwen yon poz, chwazi yon bagay ki abitye epi ki fè w byen. Sa ka mizik, yon ti mache oswa pale ak yon moun.',
      'Yon jounen difisil merite pasyans. Eseye pale ak tèt ou ak menm jantiyès ou ta sèvi pou pale ak yon zanmi.',
      'Ou ka mande konpayi menm lè w poko vle rakonte sa k ap pase a. Pafwa chita bò kote yon moun ka ede.',
    ],
  },
  {
    match: /\b(want to quit|give up|giving up|abandon\w*|lage sa|lage tout|bay legen|sispann eseye|discourag\w*|dekouraj\w*|decourag\w*|no progress|pa fe pwogre)\b/,
    en: 'Feeling discouraged makes sense when progress is slow. Take a breath, revisit why this matters to you, and decide whether a smaller goal or a different approach would help.',
    fr: 'Quand les progrès tardent, le découragement est compréhensible. Prenez du recul et voyez si un objectif plus petit ou une autre méthode vous aiderait.',
    ht: [
      'Lè rezilta yo pran tan, li nòmal pou w dekouraje. Pran yon ti distans epi gade si yon objektif pi piti ta ede w kontinye.',
      'Anvan ou pran yon gwo desizyon sou pwojè a, bay tèt ou tan pou w repoze. Lè w pare, ekri sa ki toujou enpòtan pou ou.',
      'Si menm metòd la ap fatige w, chèche yon lòt fason pou w eseye. Yon chanjman nan metòd ka rann travay la pi posib.',
      'Gade yon ti bagay ou deja aprann nan chemen an. Sa ka ede w konnen sa ou vle kenbe, menm si w ajiste objektif la.',
      'Si w bezwen pran yon poz, chwazi yon moman pou w revize sitiyasyon an. Sa ka ede w pran desizyon an ak plis kalm.',
      'Pale ak yon moun ki konprann objektif ou. Mande l ede w separe sa ki difisil pou yon ti tan ak sa ki merite yon chanjman.',
      'Ou ka redwi kantite travay ou te planifye pou semèn sa a. Chwazi yon bagay ou kapab fini pou w wè kijan ou santi w apre.',
      'Si w santi w ap vire an won, note sa ou te eseye deja. Konsa, pwochen esè a ka pote yon nouvo enfòmasyon.',
      'Bay tèt ou kredi pou efò ou te fè yo. Gade sa yo aprann ou sou pwojè a ak sou fason ou renmen travay.',
      'Lè w pare pou w rekòmanse, reprann ak pati ki pi fasil pou w antre ladan l. Apre sa, deside sa w gen fòs pou w fè ankò.',
    ],
  },
  {
    match: /\b(motiv\w*|ankouraj\w*|encourag\w*|inspir\w*|support me|need support|sip[oò]|soutyen|soutien|ban m fos|banm fos|ban m kouraj|banm kouraj|persever\w*)\b/,
    en: 'Think of one thing you’d like to move forward today. Make the first step small enough to start now and give yourself credit when you complete it.',
    fr: 'Pensez à une chose que vous aimeriez faire avancer aujourd’hui. Choisissez une première étape à votre portée et reconnaissez l’effort une fois qu’elle est faite.',
    ht: [
      'Chwazi yon bagay ou ta renmen fè avanse jodi a. Fè premye etap la piti ase pou w kòmanse, epi rekonèt efò w lè w fini l.',
      'Ou ka kòmanse ak sa ou genyen jodi a. Yon ti pratik oswa yon ti desizyon ka prepare w pou pwochen etap la.',
      'Sonje poukisa objektif sa a gen valè pou ou. Chwazi yon aksyon jodi a ki konekte ak rezon sa a.',
      'Si w bezwen yon siy ou ap avanse, gade yon bagay ou te konn evite e kounye a ou ka eseye.',
      'Ou ka pran dis minit pou w travay sou objektif la jodi a. Lè tan an fini, ekri yon bagay ou rive fè.',
      'Fè yon aksyon ou ka wè rezilta l, tankou fini yon ti egzèsis. Sa ba w yon bagay konkrè pou w bati sou li demen.',
      'Chèche yon moun ki ka ankouraje w pandan w ap travay sou pwojè a. Pataje yon ti objektif ou vle atenn semèn sa a.',
      'Bay tèt ou yon objektif pou jounen an ou ka esplike nan yon fraz. Lè li klè, li pi fasil pou w konnen ki kote pou w mete enèji w.',
      'Chwazi yon ti travay ou te repouse epi kòmanse premye pati a. Ou ka deside konbyen pou w kontinye apre sa.',
      'Nan fen jounen an, note yon bagay ou aprann ak yon bagay ou vle reprann demen. Sa ba w yon kote klè pou w rekòmanse.',
    ],
  },
];

const encouragementPositions = new Map();

function encouragementFor(question, lang) {
  const category = encouragement.find(item => item.match.test(question));
  if (!category) return undefined;
  if (lang !== 'ht') return { text: category[lang] };

  const position = encouragementPositions.get(category) ?? 0;
  encouragementPositions.set(category, (position + 1) % category.ht.length);
  return { text: category.ht[position] };
}

function normalizeQuestion(question) {
  return question.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/^(please|svp|silvouple|si vou ple|s il vous plait) /, '')
    .replace(/ (please|svp|silvouple|si vou ple|s il vous plait)$/, '')
    .trim();
}

function findAnswer(question, lang, shortcut) {
  const guide = guidance[lang];
  const normalized = normalizeQuestion(question);
  const home = lang === 'en' ? '/' : '/' + lang + '/';
  const support = { text: guide.support, link: { url: 'mailto:' + supportEmail, label: supportEmail } };
  const localized = { en: 0, fr: 1, ht: 2 }[lang];
  const toKnowledge = item => {
    const origin = item.path === 'reviews' && lang !== 'en' ? 'https://www.couragier.com' : '';
    const url = item.url || (item.path && origin + home + item.path);
    return { text: item.text[localized], link: url ? { url, label: item.label[localized] } : undefined };
  };
  const educator = {
    text: [
      'The Educator page explains how to collaborate with Couragier and where to start your application.',
      'La page Devenir éducateur explique comment collaborer avec Couragier et où commencer votre candidature.',
      'Paj Vin yon edikatè a esplike kijan pou w kolabore ak Couragier epi kote pou w kòmanse aplikasyon w lan.',
    ][localized],
    link: { url: home + 'educator/', label: ['Become an Educator', 'Devenir éducateur', 'Vin yon edikatè'][localized] },
  };
  if (shortcut === 0) return toKnowledge(knowledge.at(-1));
  if (shortcut === 1) return toKnowledge(knowledge.at(-2));
  if (shortcut === 2) return educator;


  const navigation = /^(where|ou|kote|ki kote|ki kot|go to|open|visit|show me|ale|ouvre|ouvrir|voir|acceder)\b|\b(link|lien|lyen|menu|paj|page|find|trouve|jwenn)\b/.test(normalized);
  const specificCourse = /\b(amazon|ebay|walmart|masterclass|webin\w*)\b/.test(normalized);
  const privateDetails = /\b(price|cost|pri|prix|tarif|refund|ranbousman|remboursement|password|modpas|schedule|date|duree|duration|how much|syllabus|modules?|accredit\w*|payment|peman|paiement)\b/.test(normalized);
  if (specificCourse || privateDetails) return support;

  const acknowledgement = /^(m konprann|mwen konprann|i understand|j ai compris)$/.test(normalized);
  if (acknowledgement) return { text: ['Got it! What else would you like to explore?', 'Très bien ! Que souhaitez-vous explorer ensuite ?', 'Dakò! Ki lòt bagay ou ta renmen dekouvri?'][localized] };
  const conversationalTopic = conversation.find(item => item.match.test(normalized));
  const seekingEncouragement = /\b(motiv\w*|ankouraj\w*|encourag\w*|reconfort\w*|rekonfo\w*|dekouraj\w*|decourag\w*|discourag\w*|i feel|i am|i m|mwen (santi|bezwen|bouke|fatige|tris|bloke|pe|echwe)|m (santi|bezwen|bouke|fatige|tris|bloke|pe|echwe)|je (me sens|suis|n arrive|veux abandonner)|j ai (peur|besoin|echoue)|no sales|pa gen (kliyan|lavant)|pa fe lavant|m bezwen sip[oò]|mwen bezwen sip[oò]|biznis (m|mwen) pa mache|want to quit|give up|bay legen)\b/.test(normalized);
  const learningConcern = /\b(course\w*|kou|liv|lesson\w*|leson|learn\w*|aprann|apprentissage|cours|livre\w*)\b/.test(normalized);
  if (seekingEncouragement && !learningConcern) {
    const response = encouragementFor(normalized, lang);
    if (response) return response;
  }
  if (/\b(educator|edikate|educateur|formateur|i want to teach|mwen vle anseye|je veux enseigner)\b/.test(normalized)) return educator;

  const topic = conversationalTopic || knowledge.find(item => item.match.test(normalized));
  if (topic && !/\b(tutorial|tutoriel|teach me|apran[nm] mwen|montre m kijan pou m vann)\b/.test(normalized)) {
    return toKnowledge(topic);
  }

  const index = pages.findIndex(page => page.match.test(normalized));
  const shortLabel = normalized.replace(/[?.!]/g, '').trim().split(/\s+/).length <= 3;
  if (index !== -1 && (navigation || shortLabel)) {
    const page = pages[index];
    const lead = { ht: 'Men paj ou ka konsilte a.', en: 'You can find that here.', fr: 'Vous pouvez consulter cette page.' };
    const url = page.url || (['reviews', 'about'].includes(page.path) && lang !== 'en' ? 'https://www.couragier.com' + home + page.path : home + page.path);
    return { text: lead[lang], link: { url, label: guide.pages[index] } };
  }
  const social = socialReplies.find(item => item.match.test(normalized));
  if (social) return { text: social.text[localized] };
  return support;
}

const languageSignals = {
  ht: /\b(mwen|kijan|koman|sak pase|sa w|m bezwen|m santi|banm|ban m|konprann|kou|biznis|dekouraje|ede m|kote|reyisi|m fin|m fek|m pedi|mesi|bonjou|wi|epi|fr[eè] m|komik)\b/g,
  fr: /\b(je|vous|nous|bonjour|merci|comment|pourquoi|est ce que|pouvez|voudrais|cours|apprendre|au revoir|expliquez|compris|reussi|perdu)\b/g,
  en: /\b(i|you|your|what|where|how|hello|thanks|please|would|could|course|learning|understand|explain|lost|finished|did)\b/g,
};

function detectReplyLanguage(question, fallback) {
  const normalized = normalizeQuestion(question);
  const ranked = Object.entries(languageSignals)
    .map(([lang, signals]) => [lang, [...normalized.matchAll(signals)].length])
    .sort((a, b) => b[1] - a[1]);
  return ranked[0][1] > ranked[1][1] ? ranked[0][0] : fallback;
}

const followups = [
  {
    topic: /\b(practice|pratike|pratique|learn\w*|aprann|apprent\w*|konprann|understand|comprendre|egzesis|exercis\w*)\b/,
    replies: [
      'For example, read one short section, close it, and explain the main idea in your own words. Then try one exercise. If you get stuck, revisit the example that covers that step.',
      'Par exemple, lisez un court passage, fermez-le, puis reformulez l’idée principale avec vos mots. Essayez ensuite un exercice et revenez à l’exemple si une étape vous bloque.',
      'Pa egzanp, li yon ti pati, fèmen l, epi esplike lide prensipal la ak pwòp mo pa w. Apre sa, eseye yon egzèsis. Si w bloke, tounen sou egzanp ki montre etap sa a.',
    ],
  },
  {
    topic: /\b(resources?|resous|ressources?|ecosystem\w*|ekosistem|books?|liv|livres?|toolkits?)\b/,
    replies: [
      'Pick the format that fits what you need right now. Read a book to take your time with an idea, watch a demonstration to see it in action, or use a checklist when you’re ready to try.',
      'Choisissez selon votre besoin. Un livre permet de prendre le temps de comprendre, une démonstration de voir la méthode et une liste de vérification de passer à la pratique.',
      'Chwazi resous ki mache ak sa w bezwen kounye a. Li yon liv pou w pran tan w sou yon lide, gade yon demonstrasyon pou w wè kijan li mache, oswa sèvi ak yon lis verifikasyon lè w pare pou eseye.',
    ],
  },
  {
    topic: /\b(credentials|certificat\w*|setifika|diplom\w*)\b/,
    replies: [
      'Open Credentials from the site menu and use the email tied to your Whop account. If you’ve met the requirements for an eligible program, you can claim your certificate there.',
      'Ouvrez Diplômes et certificats dans le menu, puis utilisez l’adresse e-mail de votre compte Whop. Vous pourrez réclamer votre certificat si vous remplissez les conditions d’un programme admissible.',
      'Ouvri Diplòm ak sètifika nan meni an epi sèvi ak imel kont Whop ou. Si w ranpli kondisyon yon pwogram ki bay sètifika, ou ka reklame sètifika w la.',
    ],
  },
];

function conversationalAnswer(question, lang, shortcut, previous) {
  const index = { en: 0, fr: 1, ht: 2 }[lang];
  const localized = (...texts) => ({ text: texts[index] });
  const normalized = normalizeQuestion(question);
  if (/\b(kill myself|end my life|want to die|suicide|tue tet mwen|touye tet mwen|vle mouri|me suicider|mettre fin a mes jours)\b/.test(normalized)) {
    return localized(
      'I’m concerned about your safety. If you might hurt yourself now, call your local emergency services or ask someone nearby to call. If you can, tell a trusted person what’s happening and ask them to stay with you.',
      'Je m’inquiète pour votre sécurité. Si vous risquez de vous faire du mal maintenant, appelez les urgences locales ou demandez à quelqu’un près de vous de le faire. Si vous le pouvez, parlez à une personne de confiance et demandez-lui de rester avec vous.',
      'Mwen enkyete pou sekirite w. Si w ka fè tèt ou mal kounye a, rele sèvis ijans kote w ye a oswa mande yon moun toupre w rele. Si w kapab, di yon moun ou fè konfyans sa k ap pase epi mande l rete avè w.'
    );
  }
  const loss = /\b(pedi tout (kob|lajan)|pedi tout sa m|lost all (my |our )?(money|savings)|perdu tout mon argent|pedi travay mwen|lost my job|perdu mon emploi)\b/.test(normalized);
  if (loss) return localized(
    'That sounds hard to carry. Is there someone you trust you can talk to today? You can give yourself time before making any big decisions.',
    'Ça semble difficile à vivre. Y a-t-il une personne de confiance à qui vous pourriez en parler aujourd’hui ? Prenez le temps qu’il vous faut avant une grande décision.',
    'Sa lou anpil. Èske gen yon moun ou fè konfyans ou ka pale avè l jodi a? Ou ka pran tan w anvan ou pran yon gwo desizyon.'
  );

  const isFollowup = /^(e apre|epi apre|e kounye a|e sa|ki jan|kijan|bay yon egzanp|ban m yon egzanp|banm yon egzanp|esplike pi senp|eksplike pi senp|m pa konprann|mwen pa konprann|di m plis|palem plis|tell me more|what next|what now|how so|how|can you explain|explain that|explain more simply|give me an example|i don t understand|et ensuite|et apres|comment ca|un exemple|explique plus simplement|je ne comprends pas|dis m en plus)$/.test(normalized);
  if (isFollowup) {
    const lastTopic = previous && normalizeQuestion(previous.question);
    const topic = lastTopic && followups.find(item => item.topic.test(lastTopic));
    if (topic && previous.response.link?.url !== 'mailto:' + supportEmail) {
      return { text: topic.replies[index], link: previous.response.link, topicQuestion: previous.question };
    }
    return localized('Which part would you like me to explain?', 'Quelle partie souhaitez-vous que je précise ?', 'Ki pati ou ta renmen m esplike pi byen?');
  }

  if (/\b(are you (human|real|a robot|ai)|ou se moun|ou se robo|ou se ai|es tu (humain|un robot)|etes vous humain)\b/.test(normalized)) {
    return localized('I’m Couragier’s automated learning companion. I can help you find your way around the platform.', 'Je suis le compagnon d’apprentissage automatisé de Couragier. Je peux vous orienter sur la plateforme.', 'Mwen se konpayon aprantisaj otomatik Couragier. Mwen ka ede w jwenn sa w bezwen sou platfòm nan.');
  }

  const isCelebration = /\b(i (did it|passed|finished|succeeded)|m(we?n)? (reyisi|fin kou a|fek reyisi|fek fini)|j ai (reussi|termine|fini))\b/.test(normalized);
  const isSerious = /\b(tris|sad|dekouraj\w*|discourag\w*|frustrat\w*|fristre|fache|stress\w*|pe|peur|afraid|pedi|perdu|lost|failed|echwe|bouke|tris|triste|fatige|exhausted|mouri|mourir|die|suicid\w*)\b/.test(normalized);
  const negative = /\b(pa|not|didn t|n ai pas|pas)\b/.test(normalized);
  if (isCelebration && !isSerious && !negative && !question.includes('?')) {
    return localized('Well done! That’s a milestone worth celebrating.', 'Bravo ! Prenez un moment pour savourer cette réussite.', 'Bravo! Pran yon ti moman pou w selebre etap sa a.');
  }

  const answer = findAnswer(question, lang, shortcut);
  const laughter = /\b(lol+|lmao|rofl|mdr+|ha(ha)+|he(he)+)\b|😂|🤣/i.test(question);
  const banter = normalized === '' || /^(bro+|fre m|ou fou|ou komik wi|ou komik|you re funny|t es drole|sa w ap fe la|sa wap fe la|lol+|lmao|mdr+|ha(ha)+|he(he)+)( (bro+|fre m|ou komik wi|you re funny|sa w ap fe la|sa wap fe la|lol+|mdr+|ha(ha)+))?$/.test(normalized);
  if (laughter && banter && !isSerious) {
    const choices = [
      ['Haha, I’ll take that as a compliment 😄', 'Haha, je prends ça comme un compliment 😄', 'Haha, m ap pran sa kòm yon konpliman 😄'],
      ['You got me 😄 I’ll keep the jokes short so we can get back to learning.', 'Vous m’avez eu 😄 Promis, je laisse un peu de place à l’apprentissage.', 'Ou kenbe m la 😄 M ap kite yon ti plas pou aprann tou.'],
    ];
    return { text: choices[previous?.response.text === choices[0][index] ? 1 : 0][index] };
  }
  return answer;
}

let replyTimer;
let previousExchange;
let chosenLanguage;
const onlineLabels = { ht: 'Sou entènèt', en: 'Online', fr: 'En ligne' };
const typingStatus = { ht: 'Ap tape…', en: 'Typing…', fr: 'Écrit…' };
const typingLabels = { ht: 'Couragier ap tape', en: 'Couragier is typing', fr: 'Couragier est en train d’écrire' };

function reply(question, shortcut) {
  if (replyTimer !== undefined) return;

  const replyLanguage = chosenLanguage || (shortcut === undefined
    ? detectReplyLanguage(question, previousExchange?.language || language)
    : language);
  const response = conversationalAnswer(question, replyLanguage, shortcut, previousExchange);
  bubble(question, true);
  get('send').disabled = true;
  replyTimer = setTimeout(() => {
    const typing = document.createElement('div');
    typing.className = 'cg-ai-typing';
    typing.setAttribute('role', 'status');
    typing.setAttribute('aria-label', typingLabels[replyLanguage]);
    typing.innerHTML = '<span class="cg-ai-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="cg-ai-avatar" aria-hidden="true"><img src="/assets/couragier-ai-avatar.webp" alt="" width="48" height="48"></span>';
    get('status').textContent = typingStatus[replyLanguage];
    log.append(typing);
    log.scrollTop = log.scrollHeight;
    replyTimer = setTimeout(() => {
      replyTimer = undefined;
      get('send').disabled = false;
      typing.remove();
      get('status').textContent = onlineLabels[language];
      previousExchange = { question: response.topicQuestion || question, response, language: replyLanguage };
      bubble(response.text, false, response.link);
    }, 4000);
  }, 2000);
}

function setLanguage(next) {
  language = next;
  previousExchange = undefined;
  const words = content[language];
  chat.lang = language;
  get('status').textContent = onlineLabels[language];
  clearTimeout(replyTimer);
  replyTimer = undefined;
  get('send').disabled = false;
  get('launchText').textContent = words.launch;
  launcher.setAttribute('aria-label', words.launch);
  get('close').setAttribute('aria-label', words.close);
  get('send').setAttribute('aria-label', words.send);
  input.placeholder = words.placeholder;
  input.setAttribute('aria-label', words.placeholder);
  assistant.querySelectorAll('[data-lang]').forEach(button => {
    button.setAttribute('aria-pressed', button.dataset.lang === language);
  });
  const suggestions = get('suggestions');
  suggestions.replaceChildren();
  words.questions.forEach((question, topic) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = question;
    button.addEventListener('click', () => reply(question, topic));
    suggestions.append(button);
  });
  log.replaceChildren();
  bubble(guidance[language].hello);
}

function toggle(open) {
  chat.hidden = !open;
  if (open) markSeen();
  launcher.hidden = open;
  launcher.setAttribute('aria-expanded', String(open));
  (open ? get('close') : launcher).focus();
}

launcher.addEventListener('click', () => toggle(true));
get('close').addEventListener('click', () => toggle(false));
chat.addEventListener('keydown', event => {
  if (event.key === 'Escape') toggle(false);
});
assistant.querySelectorAll('[data-lang]').forEach(button => {
  button.addEventListener('click', () => {
    chosenLanguage = button.dataset.lang;
    if (chosenLanguage !== language) setLanguage(chosenLanguage);
  });
});
get('form').addEventListener('submit', event => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question || replyTimer !== undefined) return;
  reply(question);
  input.value = '';
});
setLanguage(language);


const intro = get('intro');
const video = get('video');
const poster = get('poster');
const origin = get('origin');
const target = launcher.querySelector('.cg-ai-avatar');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const welcome = {
  ht: ['Bonjou 👋 Mwen se Couragier.', 'M ap ede w eksplore platfòm nan. W ap jwenn mwen anba adwat.', 'Fèmen prezantasyon an'],
  en: ["Hi👋 I'm Couragier.", 'I can help you explore the platform. You’ll find me in the bottom-right corner.' , 'Close the introduction'],
  fr: ['Bonjour, je suis Couragier !', 'Je vous aide à explorer la plateforme. Retrouvez-moi en bas à droite.', 'Fermer la présentation']
};
const [title, description, closeLabel] = welcome[language];
get('title').textContent = title;
get('description').textContent = description;
get('intro-close').setAttribute('aria-label', closeLabel);
const seenKey = 'cg-ai-welcome-seen';
let timer;
let seen = false;
try { seen = sessionStorage.getItem(seenKey) === '1'; } catch {}

function markSeen() {
  seen = true;
  try { sessionStorage.setItem(seenKey, '1'); } catch {}
}

function dismiss() {
  if (!intro.open) return;
  clearTimeout(timer);
  video.pause();
  const from = origin.getBoundingClientRect();
  intro.close();
  launcher.focus({ preventScroll: true });
  if (motion.matches) return;
  const to = target.getBoundingClientRect();
  const flyer = origin.cloneNode(true);
  flyer.removeAttribute('id');
  flyer.classList.add('cg-ai-flyer');
  flyer.setAttribute('aria-hidden', 'true');
  Object.assign(flyer.style, { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px' });
  assistant.append(flyer);
  launcher.classList.add('cg-ai-in-flight');
  const flight = flyer.animate([
    { transform: 'translate(0,0) scale(1)' },
    { transform: `translate(${to.left - from.left}px,${to.top - from.top}px) scale(${to.width / from.width})` }
  ], { duration: 630, easing: 'cubic-bezier(.25,.78,.3,1)' });
  const finish = bounce => {
    flyer.remove();
    launcher.classList.remove('cg-ai-in-flight');
    if (bounce && !launcher.hidden) launcher.classList.add('cg-ai-arrived');
  };
  flight.onfinish = () => finish(true);
  flight.oncancel = () => finish(false);
}

get('intro-close').addEventListener('click', dismiss);
intro.addEventListener('cancel', event => {
  event.preventDefault();
  dismiss();
});

const posterReady = seen ? Promise.resolve(false) : poster.decode().then(() => true, () => false);
if (!seen && !motion.matches) {
  video.preload = 'auto';
  video.src = '/assets/couragier-lion-welcome.mp4';
  video.addEventListener('playing', () => video.classList.add('is-playing'));
  for (const event of ['waiting', 'stalled', 'error', 'pause']) {
    video.addEventListener(event, () => video.classList.remove('is-playing'));
  }
}

function scheduleWelcome() {
  setTimeout(async () => {
    if (!(await posterReady)) return;
    if (seen || !chat.hidden || document.documentElement.classList.contains('cg-route-active')) return;
    markSeen();
    intro.showModal();
    if (!motion.matches && video.src) video.play().catch(() => {});
    timer = setTimeout(dismiss, 4000);
  }, 2000);
}

if (!seen && document.documentElement.classList.contains('cg-intro-active')) {
  const splash = new MutationObserver(() => {
    if (document.documentElement.classList.contains('cg-intro-active')) return;
    splash.disconnect();
    scheduleWelcome();
  });
  splash.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
} else if (!seen) {
  scheduleWelcome();
}

})();
