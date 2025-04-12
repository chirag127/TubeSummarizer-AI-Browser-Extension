Here's the full **Product Requirements Document (PRD)** for your **YouTube Video Summarizer + Read Aloud Sidebar Extension**:

---

# **Product Requirements Document (PRD)**
**Product Name:** YouTube Video Summarizer + Read Aloud Sidebar
**Platform:** Browser Extension (Chrome, Edge, Firefox)
**Owner:** chirag127
**Last Updated:** April 11, 2025

---

## **1. Overview**

The **YouTube Video Summarizer + Read Aloud Sidebar Extension** is a browser extension that automatically summarizes YouTube videos and displays the summary in a sidebar on the video page. Additionally, it offers a "Read Aloud" feature that speaks the summary out loud with real-time, word-by-word highlighting.

---

## **2. Goals**

- Summarize YouTube videos using AI.
- Display summary in a non-intrusive sidebar.
- Provide a Read Aloud feature with word-level highlighting.
- Support multiple browsers: Chrome, Edge, Firefox.
- Maintain fast, smooth UX with secure AI processing.

---

## **3. Features**

### **3.1. Auto Summary Generation**
- Automatically detect when a user is on a YouTube video page.
- Extract the transcript and video title and send it to the backend for summarization.
- Send transcript to **Gemini 2.0 Flash Lite** via backend for summarization.
- Display the summary in the extension's sidebar.

### **3.2. Sidebar UI**
- Toggleable sidebar on the right of the YouTube video.
- Displays:
  - Title of video
  - AI-generated summary
  - "Read Aloud" play/pause buttons
  - Settings icon (for TTS settings)
- Resizable and draggable interface.

### **3.3. Read Aloud with Word Highlighting**
- Reads the summary using the Web Speech API (or fallback to backend TTS).
- Highlights each word as it’s spoken using bounding boxes or inline `<span>` highlights.
- Word sync based on `SpeechSynthesisUtterance.onboundary`.

### **3.4. Compatibility**
- Works on:
  - Chrome
  - Microsoft Edge
  - Firefox (polyfill for Web Speech API if needed)

### **3.5. Settings**
- Playback speed, voice selection, and pitch.
- Save user preferences to `chrome.storage.sync`.

---

## **4. Technical Architecture**

### **4.1. Frontend (extension/)**
- **Manifest V3**
- Content script:
  - Injects sidebar into YouTube pages.
  - Detects video URL change (YouTube uses SPA routing).
- Background service worker:
  - Handles messaging and API calls.
- Sidebar HTML + CSS + JS:
  - UI/UX for summary and TTS controls.
  - Calls backend for summary.
  - TTS and word-by-word highlight rendering.

### **4.2. Backend (backend/)**
- **Express.js API Server**
  - `/summarize`: Accepts YouTube video ID and video title and text(transcript) calls Gemini API to summarize.
- **Gemini 2.0 Flash Lite API Integration**
  - Used to generate AI summary.

---

## **5. Project Structure**

```
project-root/
│
├── extension/                   # Browser extension frontend
│   ├── manifest.json
│
├── backend/                     # Backend server
│   └── .env
│
├── README.md
└── package.json
```

make the code as modular and reusable as possible

---

## **6. User Flow**

1. User visits a YouTube video page.
2. Content script detects video URL.
3. Sidebar is injected into the page.
4. Request is sent to the backend with the video ID.
5. Backend fetches transcript and generates summary.
6. Summary is displayed in the sidebar.
7. User clicks “Read Aloud” → TTS starts and highlights each word as it's spoken.
8. there will be a pop up for the user to select the voice and speed of the TTS.

---

## **7. APIs**

### **Frontend → Backend**
- `POST /summarize`
  - `body: { videoId: string, transcript: string, title: string }`

### **Backend → Gemini**
- `POST /v1/generate`
  - `prompt: Transcript text`
  - `model: gemini-2.0-flash-lite`

---

## **8. Non-Functional Requirements**

- Responsive, fast-loading sidebar (under 1s for render).
- Summary returned within ~3s of transcript download.
- Secure backend with rate limiting.
- TTS support in both Chrome and Firefox.

---

## **9. Future Enhancements**

- Support multilingual transcripts and summaries.
- Add "Save Summary" to Notion/Docs.
- Export as audio (MP3).
- Summarization styles: Bullet points, TL;DR, Time-stamped.

---

## **10. Milestones**

| Milestone                     | Timeline        |
|------------------------------|-----------------|
| Project scaffolding           | Day 1           |
| Sidebar UI and TTS           | Day 2–3         |
| Backend APIs (Gemini)| Day 4–5         |
| Full integration + testing   | Day 6–7         |
| Cross-browser packaging      | Day 8           |
| Deployment and polishing     | Day 9–10        |

---


this following is example code for gemeni 2.0 flash lite api
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const fs = require("node:fs");
const mime = require("mime-types");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseModalities: [
  ],
  responseMimeType: "text/plain",
};

async function run() {
  const chatSession = model.startChat({
    generationConfig,
    history: [
    ],
  });

  const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
  // TODO: Following code needs to be updated for client-side apps.
  const candidates = result.response.candidates;
  for(let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
    for(let part_index = 0; part_index < candidates[candidate_index].content.parts.length; part_index++) {
      const part = candidates[candidate_index].content.parts[part_index];
      if(part.inlineData) {
        try {
          const filename = `output_${candidate_index}_${part_index}.${mime.extension(part.inlineData.mimeType)}`;
          fs.writeFileSync(filename, Buffer.from(part.inlineData.data, 'base64'));
          console.log(`Output written to: ${filename}`);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
  console.log(result.response.text());
}

run();

 use the sequential thinking mcp server wherever possible


Take the reference from the below following code to how to extract the transcript from youtube video. The below board have the transcript called text.

<context>
<project_tree>
d:\Downloads\Youtube-Summary-With-ChatGPT-Chrome-Web-Store
├─ _locales\ar\messages.json [0.2 KB]
├─ _locales\bg\messages.json [0.24 KB]
├─ _locales\ca\messages.json [0.17 KB]
├─ _locales\cs\messages.json [0.17 KB]
├─ _locales\da\messages.json [0.17 KB]
├─ _locales\de\messages.json [0.21 KB]
├─ _locales\el\messages.json [0.27 KB]
├─ _locales\en\messages.json [0.21 KB]
├─ _locales\en_GB\messages.json [0.17 KB]
├─ _locales\en_US\messages.json [0.17 KB]
├─ _locales\es\messages.json [0.17 KB]
├─ _locales\et\messages.json [0.16 KB]
├─ _locales\fi\messages.json [0.18 KB]
├─ _locales\fil\messages.json [0.21 KB]
├─ _locales\fr\messages.json [0.19 KB]
├─ _locales\he\messages.json [0.21 KB]
├─ _locales\hi\messages.json [0.29 KB]
├─ _locales\hu\messages.json [0.21 KB]
├─ _locales\id\messages.json [0.17 KB]
├─ _locales\it\messages.json [0.18 KB]
├─ _locales\ja\messages.json [0.2 KB]
├─ _locales\ko\messages.json [0.19 KB]
├─ _locales\lt\messages.json [0.18 KB]
├─ _locales\lv\messages.json [0.17 KB]
├─ _locales\ms\messages.json [0.18 KB]
├─ _locales\nl\messages.json [0.19 KB]
├─ _locales\no\messages.json [0.17 KB]
├─ _locales\pl\messages.json [0.17 KB]
├─ _locales\pt_BR\messages.json [0.18 KB]
├─ _locales\pt_PT\messages.json [0.18 KB]
├─ _locales\ro\messages.json [0.19 KB]
├─ _locales\ru\messages.json [0.26 KB]
├─ _locales\sk\messages.json [0.17 KB]
├─ _locales\sl\messages.json [0.18 KB]
├─ _locales\sr\messages.json [0.23 KB]
├─ _locales\sv\messages.json [0.18 KB]
├─ _locales\th\messages.json [0.28 KB]
├─ _locales\tr\messages.json [0.18 KB]
├─ _locales\uk\messages.json [0.25 KB]
├─ _locales\vi\messages.json [0.19 KB]
├─ _locales\zh_CN\messages.json [0.18 KB]
├─ _locales\zh_TW\messages.json [0.18 KB]
├─ _metadata\verified_contents.json [8.64 KB]
├─ css\bootstrap.min.css [158.46 KB]
├─ icon\128.png [2.22 KB]
├─ icon\16.png [0.28 KB]
├─ icon\32.png [0.54 KB]
├─ icon\48.png [0.7 KB]
├─ icon\96.png [1.45 KB]
├─ js\bootstrap.bundle.min.js [66.18 KB]
├─ js\jquery-3.6.1.min.js [87.58 KB]
├─ manifest.json [1.74 KB]
├─ options.css [2 KB]
├─ src\background\background.js [44 KB]
├─ src\content-scripts\prompter\index.js [4.1 KB]
├─ src\content-scripts\web-widget\index.js [1.05 MB]
├─ src\content-scripts\yt-widget\index.js [32.41 KB]
├─ src\options\options.html [9.27 KB]
├─ src\options\options.js [3.88 KB]
├─ src\vendor\pdfjs\pdf.js [319.6 KB]
└─ src\vendor\pdfjs\pdf.worker.js [966.84 KB]
</project_tree>
<project_files>
<file name="options.js" path="/src/options/options.js">
(function () {
    const e = document.createElement("link").relList;
    if (e && e.supports && e.supports("modulepreload")) return;
    for (const o of document.querySelectorAll('link[rel="modulepreload"]'))
        s(o);
    new MutationObserver((o) => {
        for (const n of o)
            if (n.type === "childList")
                for (const c of n.addedNodes)
                    c.tagName === "LINK" && c.rel === "modulepreload" && s(c);
    }).observe(document, { childList: !0, subtree: !0 });
    function a(o) {
        const n = {};
        return (
            o.integrity && (n.integrity = o.integrity),
            o.referrerPolicy && (n.referrerPolicy = o.referrerPolicy),
            o.crossOrigin === "use-credentials"
                ? (n.credentials = "include")
                : o.crossOrigin === "anonymous"
                ? (n.credentials = "omit")
                : (n.credentials = "same-origin"),
            n
        );
    }
    function s(o) {
        if (o.ep) return;
        o.ep = !0;
        const n = a(o);
        fetch(o.href, n);
    }
})();
function l(t, e) {
    console.log("[PH]", t, e),
        chrome.runtime.sendMessage({ id: "track", category: t, info: e });
}
function w(t) {
    const e = t.message,
        a = `${t.filename}:${t.lineno}:${t.colno}`;
    l("JSError", { action: e, label: a, url: window.location.href });
}
function L(t) {
    let e = "",
        a = "";
    t.reason && ((e = t.reason.message), (a += t.reason.stack)),
        l("PromiseError", { action: e, label: a, url: window.location.href });
}
function S() {
    window.addEventListener("error", w, !1),
        window.addEventListener("unhandledrejection", L, !1);
}
const i = document.getElementById("hotkey-toggle"),
    d = document.getElementById("summary-icon-toggle"),
    u = document.getElementById("copy-format"),
    m = document.getElementById("prompt-language"),
    g = document.getElementById("prompt-template"),
    p = document.getElementById("default-model"),
    f = document.getElementById("gpt-version"),
    h = document.getElementById("gemini-version"),
    y = document.getElementById("temporary-chat-toggle");
I();
i.addEventListener("click", r);
d.addEventListener("click", r);
u.addEventListener("change", r);
m.addEventListener("change", r);
g.addEventListener("change", r);
p.addEventListener("change", r);
f.addEventListener("change", r);
h.addEventListener("change", r);
y.addEventListener("change", r);
function I() {
    chrome.storage.local.get((t) => {
        const e = t.settings;
        e &&
            ((i.checked = e.hotkey),
            (d.checked = e.summaryIcon),
            (u.value = e.copyFormat),
            (m.value = e.promptLanguage),
            (g.value = e.promptTemplate),
            (p.value = e.defaultModel),
            (f.value = e.gptVersion),
            (h.value = e.geminiVersion),
            (y.checked = e.temporaryChat));
    });
}
function r() {
    const t = i.checked,
        e = d.checked,
        a = u.value,
        s = m.value,
        o = g.value.trim(),
        n = p.value,
        c = f.value,
        v = h.value,
        E = y.checked;
    chrome.storage.local.set({
        settings: {
            hotkey: t,
            summaryIcon: e,
            copyFormat: a,
            promptLanguage: s,
            promptTemplate: o,
            defaultModel: n,
            gptVersion: c,
            geminiVersion: v,
            temporaryChat: E,
        },
    });
}
async function k() {
    (await chrome.storage.local.get({ ratePopupShown: !1 })).ratePopupShown ||
        document.querySelector(".modal.show") ||
        setTimeout(() => {
            $("#rate-modal a").click(() => {
                chrome.storage.local.set({ ratePopupShown: !0 }, () => {}),
                    $("#rate-modal").modal("hide");
            }),
                $("#rate-modal").modal("show");
        }, 6e4);
}
l("$pageview", { url: window.location.href });
S();
k();
</file>
<file name="options.html" path="/src/options/options.html">
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>QuickTube Options</title>

  <link rel="stylesheet" href="/css/bootstrap.min.css">
  <script src="/js/jquery-3.6.1.min.js"></script>
  <script src="/js/bootstrap.bundle.min.js"></script>
  <style>
    .nav-links .nav-link {
      color: white;
    }
  </style>
  <script type="module" crossorigin src="/src/options/options.js"></script>
  <link rel="stylesheet" crossorigin href="/options.css">
</head>

<body>
  <div class="container">
    <header class="mt-3">
      <img src="/logo.png">
      <h1>QuickTube Options</h1>
      <div class='d-flex flex-row nav-links'>
        <a class="nav-link" target="_blank" href="https://dictanote.co/youtube-summary/getting-started/">Getting Started</a>
        <a class="nav-link" target="_blank" href="https://dictanote.co/youtube-summary/">Website</a>
        <a class="nav-link" target="_blank" href="mailto:support@dictanote.co">Support</a>
      </div>
    </header>

    <div class="row mt-5">
      <div class="col-9 content">
        <div class="setting inline">
          <span>
            Enable Hotkey:
            <span class="key">Ctrl (or ⌘)</span> +
            <span class="key">Shift</span> +
            <span class="key">S</span>
          </span>

          <label class="toggle">
            <input id="hotkey-toggle" type="checkbox">
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting inline">
          <span>Show Summary Icon:</span>

          <label class="toggle">
            <input id="summary-icon-toggle" type="checkbox">
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting inline">
          <span>Default Model:</span>

          <select id="default-model">
            <option value="gpt">Chat GPT</option>
            <option value="claude">Claude</option>
            <option value="gemini">Google Gemini</option>
            <option value="mistral">Mistral</option>
            <option value="grok">Grok</option>
          </select>
        </div>

        <div class="setting inline">
          <span>ChatGPT Version:</span>

          <select id="gpt-version">
            <option value="gpt-4o-mini">GPT 4o mini</option>
            <option value="gpt-4o">GPT 4o</option>
            <option value="gpt-4">GPT 4</option>
          </select>
        </div>

        <div class="setting inline">
          <span>ChatGPT Use Temporary Chat:</span>

          <label class="toggle">
            <input id="temporary-chat-toggle" type="checkbox">
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting inline">
          <span>Gemini Version:</span>

          <select id="gemini-version">
            <option value="standard">Standard</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div class="setting inline">
          <span>Summary Language:</span>

          <select id="prompt-language">
            <option value="en">English</option>
            <option value="zh-cn">中文</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">German</option>
            <option value="it">Italiano</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="pt">Português</option>
            <option value="ru">Русский</option>
            <option value="tr">Türkçe</option>
            <option value="ar">العربية</option>
            <option value="hi">हिन्दी</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="bn">বাংলা</option>
            <option value="vi">Tiếng Việt</option>
            <option value="uk">Українська</option>
            <option value="cs">Čeština</option>
          </select>
        </div>

        <div class="setting">
          <span>Prompt Template:</span>

          <div class="card">
            <textarea id="prompt-template" rows="5"></textarea>

            <span>
              <span class="red">{{Language}}</span> - Inject language
            </span>

            <span>
              <span class="red">{{Title}}</span> - Inject video/article title
            </span>

            <span>
              <span class="red">{{Text}}</span> - Inject transcript/article text
            </span>
          </div>
        </div>
        <div class="setting inline">
          <span>Copy Format:</span>

          <select id="copy-format">
            <option value="plain-text" selected>Plain Text</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>

        <span class="model-info">
          Rough Word Limits: GPT 4 ~25,000 | Claude ~75,000 | Gemini  ~100000 | Mistral ~ 20,000
        </span>
        <br><br><br><br>
      </div>
      <div class="col-3 bd-sidebar">
        <div class='sticky-top' style='top: 85px;'>
          <div id="referrals">
            <h4 style='font-size: 20px; font-weight: 500;'>Share the magic ✨</h4>
            <div style='font-size: 12px;'>Share the YouTube summary extension with your friends.</div>
            <div class='mt-2'>
              <a href='' data-toggle="modal" data-target="#referral-modal" class="btn btn-sm btn-primary mt-2">Share Now</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade" id="referral-modal" tabindex="-1" role="dialog" aria-hidden="true" style="color: #000">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">💚 Share the magic!</h5>

          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body" style="padding-top: 0;">
          <div>
            Share the YouTube Summary with ChatGPT extension with your friends.
          </div>
          <form class="form-inline mt-3">
            <label for="ref-link" style="font-weight: 700">Copy Link</label>
            <input id="ref-link" type="text" class="form-control" value="https://dictanote.co/youtube-summary/install/" style="width:400px; background-color: white;" readonly="readonly">
            <a href='#' id="ref-link-copy" class="btn btn-primary">Copy</a>
            <div class="share-link-copied mt-2 " style="display: none; font-size: 14px; color:#2dbe60">Link Copied</div>
          </form>
          <br>
          <a class="btn share-link btn-info btn-sm" href="https://twitter.com/intent/tweet?text=I recently started using the YouTube Summary extension and it's really awesome! It allows you to one-click summarize YouTube videos for free. Get it now at &amp;url=https://dictanote.co/youtube-summary/install/" target="_blank"><i class='fa fa-twitter'></i> Tweet</a>
          <a class="btn share-link btn-primary btn-sm" style="margin-left:10px;" href="https://www.facebook.com/sharer/sharer.php?u=https://dictanote.co/youtube-summary/install/&amp;description=I recently started using the YouTube Summary extension and it's really awesome! It allows you to one-click summarize YouTube videos for free. Get it now by visiting the link" target="_blank"><i class='fa fa-facebook'></i> &nbsp;Share on Facebook</a>
          <a class="btn share-link btn-danger btn-sm" style="margin-left:10px;" href="mailto:?subject=Try YouTube Summary Chrome Extension&amp;body=Hi,%0D%0A%0D%0AI recently started using YouTube Summary extension and it's really awesome! It allows you to one-click summarize YouTube videos for free.  %0D%0A%0D%0AYou can install it for free from https://dictanote.co/youtube-summary/install/" target="_self"><i class='fa fa-envelope'></i> Send Email</a><br>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade" id="rate-modal" tabindex="-1" role="dialog" aria-hidden="true" style="color: #000">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">💚 Rate YouTube Summary!</h5>

          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body" style="padding-top: 0;">
          <div>
            Help the world discover YouTube Summary. Take a minute to rate 5 stars or give us feedback to improve.</a>
          </div>

          <div class="mt-3">
            <a class="btn btn-primary btn-sm" target="_blank" href="https://chromewebstore.google.com/detail/youtube-summary-with-chat/leidjgpcaiceoeebkdjfcaeboidcjiea/reviews">Rate 5 stars</a>
            <a class="btn btn-outline-primary btn-sm ml-2" target='_blank' href="https://docs.google.com/forms/d/e/1FAIpQLSfOkDlVJKAUypwDwSQfTfzeYrBXm3Jc3ZtWYdaHJbsQC5SllQ/viewform?usp=sf_link">Give Feedback</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>

</html>
</file>
<file name="background.js" path="/src/background/background.js">
(function(){"use strict";var te=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},U={exports:{}};(function(g,t){(function(r,s){g.exports=s()})(typeof self<"u"?self:te,function(){return function(e){var r={};function s(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,s),o.l=!0,o.exports}return s.m=e,s.c=r,s.d=function(n,o,a){s.o(n,o)||Object.defineProperty(n,o,{configurable:!1,enumerable:!0,get:a})},s.n=function(n){var o=n&&n.__esModule?function(){return n.default}:function(){return n};return s.d(o,"a",o),o},s.o=function(n,o){return Object.prototype.hasOwnProperty.call(n,o)},s.p="",s(s.s=3)}([function(e,r,s){function n(c,v){if(!(c instanceof v))throw new TypeError("Cannot call a class as a function")}var o=s(5),a=s(1),u=a.toHex,h=a.ceilHeapSize,p=s(6),m=function(c){for(c+=9;c%64>0;c+=1);return c},f=function(c,v){var y=new Uint8Array(c.buffer),_=v%4,w=v-_;switch(_){case 0:y[w+3]=0;case 1:y[w+2]=0;case 2:y[w+1]=0;case 3:y[w+0]=0}for(var b=(v>>2)+1;b<c.length;b++)c[b]=0},l=function(c,v,y){c[v>>2]|=128<<24-(v%4<<3),c[((v>>2)+2&-16)+14]=y/(1<<29)|0,c[((v>>2)+2&-16)+15]=y<<3},i=function(c,v){var y=new Int32Array(c,v+320,5),_=new Int32Array(5),w=new DataView(_.buffer);return w.setInt32(0,y[0],!1),w.setInt32(4,y[1],!1),w.setInt32(8,y[2],!1),w.setInt32(12,y[3],!1),w.setInt32(16,y[4],!1),_},d=function(){function c(v){if(n(this,c),v=v||64*1024,v%64>0)throw new Error("Chunk size must be a multiple of 128 bit");this._offset=0,this._maxChunkLen=v,this._padMaxChunkLen=m(v),this._heap=new ArrayBuffer(h(this._padMaxChunkLen+320+20)),this._h32=new Int32Array(this._heap),this._h8=new Int8Array(this._heap),this._core=new o({Int32Array},{},this._heap)}return c.prototype._initState=function(y,_){this._offset=0;var w=new Int32Array(y,_+320,5);w[0]=1732584193,w[1]=-271733879,w[2]=-1732584194,w[3]=271733878,w[4]=-1009589776},c.prototype._padChunk=function(y,_){var w=m(y),b=new Int32Array(this._heap,0,w>>2);return f(b,y),l(b,y,_),w},c.prototype._write=function(y,_,w,b){p(y,this._h8,this._h32,_,w,b||0)},c.prototype._coreCall=function(y,_,w,b,F){var A=w;this._write(y,_,w),F&&(A=this._padChunk(w,b)),this._core.hash(A,this._padMaxChunkLen)},c.prototype.rawDigest=function(y){var _=y.byteLength||y.length||y.size||0;this._initState(this._heap,this._padMaxChunkLen);var w=0,b=this._maxChunkLen;for(w=0;_>w+b;w+=b)this._coreCall(y,w,b,_,!1);return this._coreCall(y,w,_-w,_,!0),i(this._heap,this._padMaxChunkLen)},c.prototype.digest=function(y){return u(this.rawDigest(y).buffer)},c.prototype.digestFromString=function(y){return this.digest(y)},c.prototype.digestFromBuffer=function(y){return this.digest(y)},c.prototype.digestFromArrayBuffer=function(y){return this.digest(y)},c.prototype.resetState=function(){return this._initState(this._heap,this._padMaxChunkLen),this},c.prototype.append=function(y){var _=0,w=y.byteLength||y.length||y.size||0,b=this._offset%this._maxChunkLen,F=void 0;for(this._offset+=w;_<w;)F=Math.min(w-_,this._maxChunkLen-b),this._write(y,_,F,b),b+=F,_+=F,b===this._maxChunkLen&&(this._core.hash(this._maxChunkLen,this._padMaxChunkLen),b=0);return this},c.prototype.getState=function(){var y=this._offset%this._maxChunkLen,_=void 0;if(y)_=this._heap.slice(0);else{var w=new Int32Array(this._heap,this._padMaxChunkLen+320,5);_=w.buffer.slice(w.byteOffset,w.byteOffset+w.byteLength)}return{offset:this._offset,heap:_}},c.prototype.setState=function(y){if(this._offset=y.offset,y.heap.byteLength===20){var _=new Int32Array(this._heap,this._padMaxChunkLen+320,5);_.set(new Int32Array(y.heap))}else this._h32.set(new Int32Array(y.heap));return this},c.prototype.rawEnd=function(){var y=this._offset,_=y%this._maxChunkLen,w=this._padChunk(_,y);this._core.hash(w,this._padMaxChunkLen);var b=i(this._heap,this._padMaxChunkLen);return this._initState(this._heap,this._padMaxChunkLen),b},c.prototype.end=function(){return u(this.rawEnd().buffer)},c}();e.exports=d,e.exports._core=o},function(e,r){for(var s=new Array(256),n=0;n<256;n++)s[n]=(n<16?"0":"")+n.toString(16);e.exports.toHex=function(o){for(var a=new Uint8Array(o),u=new Array(o.byteLength),h=0;h<u.length;h++)u[h]=s[a[h]];return u.join("")},e.exports.ceilHeapSize=function(o){var a=0;if(o<=65536)return 65536;if(o<16777216)for(a=1;a<o;a=a<<1);else for(a=16777216;a<o;a+=16777216);return a},e.exports.isDedicatedWorkerScope=function(o){var a="WorkerGlobalScope"in o&&o instanceof o.WorkerGlobalScope,u="SharedWorkerGlobalScope"in o&&o instanceof o.SharedWorkerGlobalScope,h="ServiceWorkerGlobalScope"in o&&o instanceof o.ServiceWorkerGlobalScope;return a&&!u&&!h}},function(e,r,s){e.exports=function(){var n=s(0),o=function(h,p,m){try{return m(null,h.digest(p))}catch(f){return m(f)}},a=function(h,p,m,f,l){var i=new self.FileReader;i.onloadend=function(){if(i.error)return l(i.error);var c=i.result;p+=i.result.byteLength;try{h.append(c)}catch(v){l(v);return}p<f.size?a(h,p,m,f,l):l(null,h.end())},i.readAsArrayBuffer(f.slice(p,p+m))},u=!0;return self.onmessage=function(h){if(u){var p=h.data.data,m=h.data.file,f=h.data.id;if(!(typeof f>"u")&&!(!m&&!p)){var l=h.data.blockSize||4*1024*1024,i=new n(l);i.resetState();var d=function(c,v){c?self.postMessage({id:f,error:c.name}):self.postMessage({id:f,hash:v})};p&&o(i,p,d),m&&a(i,0,l,m,d)}}},function(){u=!1}}},function(e,r,s){var n=s(4),o=s(0),a=s(7),u=s(2),h=s(1),p=h.isDedicatedWorkerScope,m=typeof self<"u"&&p(self);o.disableWorkerBehaviour=m?u():function(){},o.createWorker=function(){var f=n(2),l=f.terminate;return f.terminate=function(){URL.revokeObjectURL(f.objectURL),l.call(f)},f},o.createHash=a,e.exports=o},function(e,r,s){function n(f){var l={};function i(c){if(l[c])return l[c].exports;var v=l[c]={i:c,l:!1,exports:{}};return f[c].call(v.exports,v,v.exports,i),v.l=!0,v.exports}i.m=f,i.c=l,i.i=function(c){return c},i.d=function(c,v,y){i.o(c,v)||Object.defineProperty(c,v,{configurable:!1,enumerable:!0,get:y})},i.r=function(c){Object.defineProperty(c,"__esModule",{value:!0})},i.n=function(c){var v=c&&c.__esModule?function(){return c.default}:function(){return c};return i.d(v,"a",v),v},i.o=function(c,v){return Object.prototype.hasOwnProperty.call(c,v)},i.p="/",i.oe=function(c){throw console.error(c),c};var d=i(i.s=ENTRY_MODULE);return d.default||d}var o="[\\.|\\-|\\+|\\w|/|@]+",a="\\((/\\*.*?\\*/)?s?.*?("+o+").*?\\)";function u(f){return(f+"").replace(/[.?*+^$[\]\\(){}|-]/g,"\\{fileContent}")}function h(f,l,i){var d={};d[i]=[];var c=l.toString(),v=c.match(/^function\s?\(\w+,\s*\w+,\s*(\w+)\)/);if(!v)return d;for(var y=v[1],_=new RegExp("(\\\\n|\\W)"+u(y)+a,"g"),w;w=_.exec(c);)w[3]!=="dll-reference"&&d[i].push(w[3]);for(_=new RegExp("\\("+u(y)+'\\("(dll-reference\\s('+o+'))"\\)\\)'+a,"g");w=_.exec(c);)f[w[2]]||(d[i].push(w[1]),f[w[2]]=s(w[1]).m),d[w[2]]=d[w[2]]||[],d[w[2]].push(w[4]);return d}function p(f){var l=Object.keys(f);return l.reduce(function(i,d){return i||f[d].length>0},!1)}function m(f,l){for(var i={main:[l]},d={main:[]},c={main:{}};p(i);)for(var v=Object.keys(i),y=0;y<v.length;y++){var _=v[y],w=i[_],b=w.pop();if(c[_]=c[_]||{},!(c[_][b]||!f[_][b])){c[_][b]=!0,d[_]=d[_]||[],d[_].push(b);for(var F=h(f,f[_][b],_),A=Object.keys(F),x=0;x<A.length;x++)i[A[x]]=i[A[x]]||[],i[A[x]]=i[A[x]].concat(F[A[x]])}}return d}e.exports=function(f,l){l=l||{};var i={main:s.m},d=l.all?{main:Object.keys(i)}:m(i,f),c="";Object.keys(d).filter(function(b){return b!=="main"}).forEach(function(b){for(var F=0;d[b][F];)F++;d[b].push(F),i[b][F]="(function(module, exports, __webpack_require__) { module.exports = __webpack_require__; })",c=c+"var "+b+" = ("+n.toString().replace("ENTRY_MODULE",JSON.stringify(F))+")({"+d[b].map(function(A){return""+JSON.stringify(A)+": "+i[b][A].toString()}).join(",")+`});
`}),c=c+"("+n.toString().replace("ENTRY_MODULE",JSON.stringify(f))+")({"+d.main.map(function(b){return""+JSON.stringify(b)+": "+i.main[b].toString()}).join(",")+"})(self);";var v=new window.Blob([c],{type:"text/javascript"});if(l.bare)return v;var y=window.URL||window.webkitURL||window.mozURL||window.msURL,_=y.createObjectURL(v),w=new window.Worker(_);return w.objectURL=_,w}},function(e,r){e.exports=function(n,o,a){var u=new n.Int32Array(a);function h(p,m){p=p|0,m=m|0;var f=0,l=0,i=0,d=0,c=0,v=0,y=0,_=0,w=0,b=0,F=0,A=0,x=0,P=0;for(i=u[m+320>>2]|0,c=u[m+324>>2]|0,y=u[m+328>>2]|0,w=u[m+332>>2]|0,F=u[m+336>>2]|0,f=0;(f|0)<(p|0);f=f+64|0){for(d=i,v=c,_=y,b=w,A=F,l=0;(l|0)<64;l=l+4|0)P=u[f+l>>2]|0,x=((i<<5|i>>>27)+(c&y|~c&w)|0)+((P+F|0)+1518500249|0)|0,F=w,w=y,y=c<<30|c>>>2,c=i,i=x,u[p+l>>2]=P;for(l=p+64|0;(l|0)<(p+80|0);l=l+4|0)P=(u[l-12>>2]^u[l-32>>2]^u[l-56>>2]^u[l-64>>2])<<1|(u[l-12>>2]^u[l-32>>2]^u[l-56>>2]^u[l-64>>2])>>>31,x=((i<<5|i>>>27)+(c&y|~c&w)|0)+((P+F|0)+1518500249|0)|0,F=w,w=y,y=c<<30|c>>>2,c=i,i=x,u[l>>2]=P;for(l=p+80|0;(l|0)<(p+160|0);l=l+4|0)P=(u[l-12>>2]^u[l-32>>2]^u[l-56>>2]^u[l-64>>2])<<1|(u[l-12>>2]^u[l-32>>2]^u[l-56>>2]^u[l-64>>2])>>>31,x=((i<<5|i>>>27)+(c^y^w)|0)+((P+F|0)+1859775393|0)|0,F=w,w=y,y=c<<30|c>>>2,c=i,i=x,u[l>>2]=P;for(l=p+160|0;(l|0)<(p+240|0);l=l+4|0)P=(u[l-12>>2]^u[l-32>>2]^u[l-56>>2]^u[l-64>>2])<<1|(u[l-12>>2]^u[l-32>>2]^u[l-56>>2]^u[l-64>>2])>>>31,x=((i<<5|i>>>27)+(c&y|c&w|y&w)|0)+((P+F|0)-1894007588|0)|0,F=w,w=y,y=c<<30|c>>>2,c=i,i=x,u[l>>2]=P;for(l=p+240|0;(l|0)<(p+320|0);l=l+4|0)P=(u[l-12>>2]^u[l-32>>2]^u[l-56>>2]^u[l-64>>2])<<1|(u[l-12>>2]^u[l-32>>2]^u[l-56>>2]^u[l-64>>2])>>>31,x=((i<<5|i>>>27)+(c^y^w)|0)+((P+F|0)-899497514|0)|0,F=w,w=y,y=c<<30|c>>>2,c=i,i=x,u[l>>2]=P;i=i+d|0,c=c+v|0,y=y+_|0,w=w+b|0,F=F+A|0}u[m+320>>2]=i,u[m+324>>2]=c,u[m+328>>2]=y,u[m+332>>2]=w,u[m+336>>2]=F}return{hash:h}}},function(e,r){var s=this,n=void 0;typeof self<"u"&&typeof self.FileReaderSync<"u"&&(n=new self.FileReaderSync);var o=function(h,p,m,f,l,i){var d=void 0,c=i%4,v=(l+c)%4,y=l-v;switch(c){case 0:p[i]=h.charCodeAt(f+3);case 1:p[i+1-(c<<1)|0]=h.charCodeAt(f+2);case 2:p[i+2-(c<<1)|0]=h.charCodeAt(f+1);case 3:p[i+3-(c<<1)|0]=h.charCodeAt(f)}if(!(l<v+(4-c))){for(d=4-c;d<y;d=d+4|0)m[i+d>>2]=h.charCodeAt(f+d)<<24|h.charCodeAt(f+d+1)<<16|h.charCodeAt(f+d+2)<<8|h.charCodeAt(f+d+3);switch(v){case 3:p[i+y+1|0]=h.charCodeAt(f+y+2);case 2:p[i+y+2|0]=h.charCodeAt(f+y+1);case 1:p[i+y+3|0]=h.charCodeAt(f+y)}}},a=function(h,p,m,f,l,i){var d=void 0,c=i%4,v=(l+c)%4,y=l-v;switch(c){case 0:p[i]=h[f+3];case 1:p[i+1-(c<<1)|0]=h[f+2];case 2:p[i+2-(c<<1)|0]=h[f+1];case 3:p[i+3-(c<<1)|0]=h[f]}if(!(l<v+(4-c))){for(d=4-c;d<y;d=d+4|0)m[i+d>>2|0]=h[f+d]<<24|h[f+d+1]<<16|h[f+d+2]<<8|h[f+d+3];switch(v){case 3:p[i+y+1|0]=h[f+y+2];case 2:p[i+y+2|0]=h[f+y+1];case 1:p[i+y+3|0]=h[f+y]}}},u=function(h,p,m,f,l,i){var d=void 0,c=i%4,v=(l+c)%4,y=l-v,_=new Uint8Array(n.readAsArrayBuffer(h.slice(f,f+l)));switch(c){case 0:p[i]=_[3];case 1:p[i+1-(c<<1)|0]=_[2];case 2:p[i+2-(c<<1)|0]=_[1];case 3:p[i+3-(c<<1)|0]=_[0]}if(!(l<v+(4-c))){for(d=4-c;d<y;d=d+4|0)m[i+d>>2|0]=_[d]<<24|_[d+1]<<16|_[d+2]<<8|_[d+3];switch(v){case 3:p[i+y+1|0]=_[y+2];case 2:p[i+y+2|0]=_[y+1];case 1:p[i+y+3|0]=_[y]}}};e.exports=function(h,p,m,f,l,i){if(typeof h=="string")return o(h,p,m,f,l,i);if(h instanceof Array||s&&s.Buffer&&s.Buffer.isBuffer(h))return a(h,p,m,f,l,i);if(h instanceof ArrayBuffer)return a(new Uint8Array(h),p,m,f,l,i);if(h.buffer instanceof ArrayBuffer)return a(new Uint8Array(h.buffer,h.byteOffset,h.byteLength),p,m,f,l,i);if(h instanceof Blob)return u(h,p,m,f,l,i);throw new Error("Unsupported data type.")}},function(e,r,s){var n=function(){function m(f,l){for(var i=0;i<l.length;i++){var d=l[i];d.enumerable=d.enumerable||!1,d.configurable=!0,"value"in d&&(d.writable=!0),Object.defineProperty(f,d.key,d)}}return function(f,l,i){return l&&m(f.prototype,l),i&&m(f,i),f}}();function o(m,f){if(!(m instanceof f))throw new TypeError("Cannot call a class as a function")}var a=s(0),u=s(1),h=u.toHex,p=function(){function m(){o(this,m),this._rusha=new a,this._rusha.resetState()}return m.prototype.update=function(l){return this._rusha.append(l),this},m.prototype.digest=function(l){var i=this._rusha.rawEnd().buffer;if(!l)return i;if(l==="hex")return h(i);throw new Error("unsupported digest encoding")},n(m,[{key:"state",get:function(){return this._rusha.getState()},set:function(f){this._rusha.setState(f)}}]),m}();e.exports=function(){return new p}}])})})(U);var re=U.exports,ne="4.0.0",C;(function(g){g.AnonymousId="anonymous_id",g.DistinctId="distinct_id",g.Props="props",g.FeatureFlags="feature_flags",g.FeatureFlagPayloads="feature_flag_payloads",g.OverrideFeatureFlags="override_feature_flags",g.Queue="queue",g.OptedOut="opted_out",g.SessionId="session_id",g.SessionLastTimestamp="session_timestamp",g.PersonProperties="person_properties",g.GroupProperties="group_properties",g.InstalledAppBuild="installed_app_build",g.InstalledAppVersion="installed_app_version"})(C||(C={}));function ie(g,t){if(!g)throw new Error(t)}function se(g){return g==null?void 0:g.replace(/\/+$/,"")}async function ae(g,t){let e=null;for(let r=0;r<t.retryCount+1;r++){r>0&&await new Promise(s=>setTimeout(s,t.retryDelay));try{return await g()}catch(s){if(e=s,!t.retryCheck(s))throw s}}throw e}function oe(){return new Date().getTime()}function j(){return new Date().toISOString()}function G(g,t){const e=setTimeout(g,t);return e!=null&&e.unref&&(e==null||e.unref()),e}const k=String.fromCharCode,z="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",M={};function ue(g,t){if(!M[g]){M[g]={};for(let e=0;e<g.length;e++)M[g][g.charAt(e)]=e}return M[g][t]}const L={compressToBase64:function(g){if(g==null)return"";const t=L._compress(g,6,function(e){return z.charAt(e)});switch(t.length%4){default:case 0:return t;case 1:return t+"===";case 2:return t+"==";case 3:return t+"="}},decompressFromBase64:function(g){return g==null?"":g==""?null:L._decompress(g.length,32,function(t){return ue(z,g.charAt(t))})},compress:function(g){return L._compress(g,16,function(t){return k(t)})},_compress:function(g,t,e){if(g==null)return"";const r={},s={},n=[];let o,a,u="",h="",p="",m=2,f=3,l=2,i=0,d=0,c;for(c=0;c<g.length;c+=1)if(u=g.charAt(c),Object.prototype.hasOwnProperty.call(r,u)||(r[u]=f++,s[u]=!0),h=p+u,Object.prototype.hasOwnProperty.call(r,h))p=h;else{if(Object.prototype.hasOwnProperty.call(s,p)){if(p.charCodeAt(0)<256){for(o=0;o<l;o++)i=i<<1,d==t-1?(d=0,n.push(e(i)),i=0):d++;for(a=p.charCodeAt(0),o=0;o<8;o++)i=i<<1|a&1,d==t-1?(d=0,n.push(e(i)),i=0):d++,a=a>>1}else{for(a=1,o=0;o<l;o++)i=i<<1|a,d==t-1?(d=0,n.push(e(i)),i=0):d++,a=0;for(a=p.charCodeAt(0),o=0;o<16;o++)i=i<<1|a&1,d==t-1?(d=0,n.push(e(i)),i=0):d++,a=a>>1}m--,m==0&&(m=Math.pow(2,l),l++),delete s[p]}else for(a=r[p],o=0;o<l;o++)i=i<<1|a&1,d==t-1?(d=0,n.push(e(i)),i=0):d++,a=a>>1;m--,m==0&&(m=Math.pow(2,l),l++),r[h]=f++,p=String(u)}if(p!==""){if(Object.prototype.hasOwnProperty.call(s,p)){if(p.charCodeAt(0)<256){for(o=0;o<l;o++)i=i<<1,d==t-1?(d=0,n.push(e(i)),i=0):d++;for(a=p.charCodeAt(0),o=0;o<8;o++)i=i<<1|a&1,d==t-1?(d=0,n.push(e(i)),i=0):d++,a=a>>1}else{for(a=1,o=0;o<l;o++)i=i<<1|a,d==t-1?(d=0,n.push(e(i)),i=0):d++,a=0;for(a=p.charCodeAt(0),o=0;o<16;o++)i=i<<1|a&1,d==t-1?(d=0,n.push(e(i)),i=0):d++,a=a>>1}m--,m==0&&(m=Math.pow(2,l),l++),delete s[p]}else for(a=r[p],o=0;o<l;o++)i=i<<1|a&1,d==t-1?(d=0,n.push(e(i)),i=0):d++,a=a>>1;m--,m==0&&(m=Math.pow(2,l),l++)}for(a=2,o=0;o<l;o++)i=i<<1|a&1,d==t-1?(d=0,n.push(e(i)),i=0):d++,a=a>>1;for(;;)if(i=i<<1,d==t-1){n.push(e(i));break}else d++;return n.join("")},decompress:function(g){return g==null?"":g==""?null:L._decompress(g.length,32768,function(t){return g.charCodeAt(t)})},_decompress:function(g,t,e){const r=[],s=[],n={val:e(0),position:t,index:1};let o=4,a=4,u=3,h="",p,m,f,l,i,d,c;for(p=0;p<3;p+=1)r[p]=p;for(f=0,i=Math.pow(2,2),d=1;d!=i;)l=n.val&n.position,n.position>>=1,n.position==0&&(n.position=t,n.val=e(n.index++)),f|=(l>0?1:0)*d,d<<=1;switch(f){case 0:for(f=0,i=Math.pow(2,8),d=1;d!=i;)l=n.val&n.position,n.position>>=1,n.position==0&&(n.position=t,n.val=e(n.index++)),f|=(l>0?1:0)*d,d<<=1;c=k(f);break;case 1:for(f=0,i=Math.pow(2,16),d=1;d!=i;)l=n.val&n.position,n.position>>=1,n.position==0&&(n.position=t,n.val=e(n.index++)),f|=(l>0?1:0)*d,d<<=1;c=k(f);break;case 2:return""}for(r[3]=c,m=c,s.push(c);;){if(n.index>g)return"";for(f=0,i=Math.pow(2,u),d=1;d!=i;)l=n.val&n.position,n.position>>=1,n.position==0&&(n.position=t,n.val=e(n.index++)),f|=(l>0?1:0)*d,d<<=1;switch(c=f){case 0:for(f=0,i=Math.pow(2,8),d=1;d!=i;)l=n.val&n.position,n.position>>=1,n.position==0&&(n.position=t,n.val=e(n.index++)),f|=(l>0?1:0)*d,d<<=1;r[a++]=k(f),c=a-1,o--;break;case 1:for(f=0,i=Math.pow(2,16),d=1;d!=i;)l=n.val&n.position,n.position>>=1,n.position==0&&(n.position=t,n.val=e(n.index++)),f|=(l>0?1:0)*d,d<<=1;r[a++]=k(f),c=a-1,o--;break;case 2:return s.join("")}if(o==0&&(o=Math.pow(2,u),u++),r[c])h=r[c];else if(c===a)h=m+m.charAt(0);else return null;s.push(h),r[a++]=m+h.charAt(0),o--,m=h,o==0&&(o=Math.pow(2,u),u++)}}};class le{constructor(){this.events={},this.events={}}on(t,e){return this.events[t]||(this.events[t]=[]),this.events[t].push(e),()=>{this.events[t]=this.events[t].filter(r=>r!==e)}}emit(t,e){for(const r of this.events[t]||[])r(e);for(const r of this.events["*"]||[])r(t,e)}}/**
 * uuidv7: An experimental implementation of the proposed UUID Version 7
 *
 * @license Apache-2.0
 * @copyright 2021-2023 LiosK
 * @packageDocumentation
 */const T="0123456789abcdef";class O{constructor(t){this.bytes=t}static ofInner(t){if(t.length!==16)throw new TypeError("not 128-bit length");return new O(t)}static fromFieldsV7(t,e,r,s){if(!Number.isInteger(t)||!Number.isInteger(e)||!Number.isInteger(r)||!Number.isInteger(s)||t<0||e<0||r<0||s<0||t>0xffffffffffff||e>4095||r>1073741823||s>4294967295)throw new RangeError("invalid field value");const n=new Uint8Array(16);return n[0]=t/2**40,n[1]=t/2**32,n[2]=t/2**24,n[3]=t/2**16,n[4]=t/2**8,n[5]=t,n[6]=112|e>>>8,n[7]=e,n[8]=128|r>>>24,n[9]=r>>>16,n[10]=r>>>8,n[11]=r,n[12]=s>>>24,n[13]=s>>>16,n[14]=s>>>8,n[15]=s,new O(n)}static parse(t){var r,s,n,o;let e;switch(t.length){case 32:e=(r=/^[0-9a-f]{32}$/i.exec(t))==null?void 0:r[0];break;case 36:e=(s=/^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i.exec(t))==null?void 0:s.slice(1,6).join("");break;case 38:e=(n=/^\{([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})\}$/i.exec(t))==null?void 0:n.slice(1,6).join("");break;case 45:e=(o=/^urn:uuid:([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i.exec(t))==null?void 0:o.slice(1,6).join("");break}if(e){const a=new Uint8Array(16);for(let u=0;u<16;u+=4){const h=parseInt(e.substring(2*u,2*u+8),16);a[u+0]=h>>>24,a[u+1]=h>>>16,a[u+2]=h>>>8,a[u+3]=h}return new O(a)}else throw new SyntaxError("could not parse UUID string")}toString(){let t="";for(let e=0;e<this.bytes.length;e++)t+=T.charAt(this.bytes[e]>>>4),t+=T.charAt(this.bytes[e]&15),(e===3||e===5||e===7||e===9)&&(t+="-");return t}toHex(){let t="";for(let e=0;e<this.bytes.length;e++)t+=T.charAt(this.bytes[e]>>>4),t+=T.charAt(this.bytes[e]&15);return t}toJSON(){return this.toString()}getVariant(){const t=this.bytes[8]>>>4;if(t<0)throw new Error("unreachable");if(t<=7)return this.bytes.every(e=>e===0)?"NIL":"VAR_0";if(t<=11)return"VAR_10";if(t<=13)return"VAR_110";if(t<=15)return this.bytes.every(e=>e===255)?"MAX":"VAR_RESERVED";throw new Error("unreachable")}getVersion(){return this.getVariant()==="VAR_10"?this.bytes[6]>>>4:void 0}clone(){return new O(this.bytes.slice(0))}equals(t){return this.compareTo(t)===0}compareTo(t){for(let e=0;e<16;e++){const r=this.bytes[e]-t.bytes[e];if(r!==0)return Math.sign(r)}return 0}}class ce{constructor(t){this.timestamp=0,this.counter=0,this.random=t??fe()}generate(){return this.generateOrResetCore(Date.now(),1e4)}generateOrAbort(){return this.generateOrAbortCore(Date.now(),1e4)}generateOrResetCore(t,e){let r=this.generateOrAbortCore(t,e);return r===void 0&&(this.timestamp=0,r=this.generateOrAbortCore(t,e)),r}generateOrAbortCore(t,e){if(!Number.isInteger(t)||t<1||t>0xffffffffffff)throw new RangeError("`unixTsMs` must be a 48-bit positive integer");if(e<0||e>0xffffffffffff)throw new RangeError("`rollbackAllowance` out of reasonable range");if(t>this.timestamp)this.timestamp=t,this.resetCounter();else if(t+e>=this.timestamp)this.counter++,this.counter>4398046511103&&(this.timestamp++,this.resetCounter());else return;return O.fromFieldsV7(this.timestamp,Math.trunc(this.counter/2**30),this.counter&2**30-1,this.random.nextUint32())}resetCounter(){this.counter=this.random.nextUint32()*1024+(this.random.nextUint32()&1023)}generateV4(){const t=new Uint8Array(Uint32Array.of(this.random.nextUint32(),this.random.nextUint32(),this.random.nextUint32(),this.random.nextUint32()).buffer);return t[6]=64|t[6]>>>4,t[8]=128|t[8]>>>2,O.ofInner(t)}}const fe=()=>({nextUint32:()=>Math.trunc(Math.random()*65536)*65536+Math.trunc(Math.random()*65536)});let B;const W=()=>he().toString(),he=()=>(B||(B=new ce)).generate();class N extends Error{constructor(t){super("HTTP error while fetching PostHog: "+t.status),this.response=t,this.name="PostHogFetchHttpError"}}class I extends Error{constructor(t){super("Network error while fetching PostHog",t instanceof Error?{cause:t}:{}),this.error=t,this.name="PostHogFetchNetworkError"}}function Q(g){return typeof g=="object"&&(g instanceof N||g instanceof I)}class de{constructor(t,e){this.flushPromise=null,this.disableGeoip=!0,this.disabled=!1,this.defaultOptIn=!0,this.pendingPromises={},this._events=new le,this._isInitialized=!1,ie(t,"You must pass your PostHog project's api key."),this.apiKey=t,this.host=se((e==null?void 0:e.host)||"https://app.posthog.com"),this.flushAt=e!=null&&e.flushAt?Math.max(e==null?void 0:e.flushAt,1):20,this.maxBatchSize=Math.max(this.flushAt,(e==null?void 0:e.maxBatchSize)??100),this.maxQueueSize=Math.max(this.flushAt,(e==null?void 0:e.maxQueueSize)??1e3),this.flushInterval=(e==null?void 0:e.flushInterval)??1e4,this.captureMode=(e==null?void 0:e.captureMode)||"form",this.defaultOptIn=(e==null?void 0:e.defaultOptIn)??!0,this._retryOptions={retryCount:(e==null?void 0:e.fetchRetryCount)??3,retryDelay:(e==null?void 0:e.fetchRetryDelay)??3e3,retryCheck:Q},this.requestTimeout=(e==null?void 0:e.requestTimeout)??1e4,this.featureFlagsRequestTimeoutMs=(e==null?void 0:e.featureFlagsRequestTimeoutMs)??3e3,this.disableGeoip=(e==null?void 0:e.disableGeoip)??!0,this.disabled=(e==null?void 0:e.disabled)??!1,this._initPromise=Promise.resolve(),this._isInitialized=!0}wrap(t){if(this.disabled){this.isDebug&&console.warn("[PostHog] The client is disabled");return}if(this._isInitialized)return t();this._initPromise.then(()=>t())}getCommonEventProperties(){return{$lib:this.getLibraryId(),$lib_version:this.getLibraryVersion()}}get optedOut(){return this.getPersistedProperty(C.OptedOut)??!this.defaultOptIn}async optIn(){this.wrap(()=>{this.setPersistedProperty(C.OptedOut,!1)})}async optOut(){this.wrap(()=>{this.setPersistedProperty(C.OptedOut,!0)})}on(t,e){return this._events.on(t,e)}debug(t=!0){var e;if((e=this.removeDebugCallback)==null||e.call(this),t){const r=this.on("*",(s,n)=>console.log("PostHog Debug",s,n));this.removeDebugCallback=()=>{r(),this.removeDebugCallback=void 0}}}get isDebug(){return!!this.removeDebugCallback}buildPayload(t){return{distinct_id:t.distinct_id,event:t.event,properties:{...t.properties||{},...this.getCommonEventProperties()}}}addPendingPromise(t){const e=W();return this.pendingPromises[e]=t,t.catch(()=>{}).finally(()=>{delete this.pendingPromises[e]}),t}identifyStateless(t,e,r){this.wrap(()=>{const s={...this.buildPayload({distinct_id:t,event:"$identify",properties:e})};this.enqueue("identify",s,r)})}captureStateless(t,e,r,s){this.wrap(()=>{const n=this.buildPayload({distinct_id:t,event:e,properties:r});this.enqueue("capture",n,s)})}aliasStateless(t,e,r,s){this.wrap(()=>{const n=this.buildPayload({event:"$create_alias",distinct_id:e,properties:{...r||{},distinct_id:e,alias:t}});this.enqueue("alias",n,s)})}groupIdentifyStateless(t,e,r,s,n,o){this.wrap(()=>{const a=this.buildPayload({distinct_id:n||`${t}_${e}`,event:"$groupidentify",properties:{$group_type:t,$group_key:e,$group_set:r||{},...o||{}}});this.enqueue("capture",a,s)})}async getDecide(t,e={},r={},s={},n={}){await this._initPromise;const o=`${this.host}/decide/?v=3`,a={method:"POST",headers:{...this.getCustomHeaders(),"Content-Type":"application/json"},body:JSON.stringify({token:this.apiKey,distinct_id:t,groups:e,person_properties:r,group_properties:s,...n})};return this.fetchWithRetry(o,a,{retryCount:0},this.featureFlagsRequestTimeoutMs).then(u=>u.json()).catch(u=>{this._events.emit("error",u)})}async getFeatureFlagStateless(t,e,r={},s={},n={},o){await this._initPromise;const a=await this.getFeatureFlagsStateless(e,r,s,n,o);if(!a)return;let u=a[t];return u===void 0&&(u=!1),u}async getFeatureFlagPayloadStateless(t,e,r={},s={},n={},o){await this._initPromise;const a=await this.getFeatureFlagPayloadsStateless(e,r,s,n,o);if(!a)return;const u=a[t];return u===void 0?null:this._parsePayload(u)}async getFeatureFlagPayloadsStateless(t,e={},r={},s={},n){await this._initPromise;const o=(await this.getFeatureFlagsAndPayloadsStateless(t,e,r,s,n)).payloads;return o&&Object.fromEntries(Object.entries(o).map(([a,u])=>[a,this._parsePayload(u)]))}_parsePayload(t){try{return JSON.parse(t)}catch{return t}}async getFeatureFlagsStateless(t,e={},r={},s={},n){return await this._initPromise,(await this.getFeatureFlagsAndPayloadsStateless(t,e,r,s,n)).flags}async getFeatureFlagsAndPayloadsStateless(t,e={},r={},s={},n){await this._initPromise;const o={};(n??this.disableGeoip)&&(o.geoip_disable=!0);const a=await this.getDecide(t,e,r,s,o),u=a==null?void 0:a.featureFlags,h=a==null?void 0:a.featureFlagPayloads;return{flags:u,payloads:h}}enqueue(t,e,r){this.wrap(()=>{if(this.optedOut){this._events.emit(t,"Library is disabled. Not sending event. To re-enable, call posthog.optIn()");return}const s={...e,type:t,library:this.getLibraryId(),library_version:this.getLibraryVersion(),timestamp:r!=null&&r.timestamp?r==null?void 0:r.timestamp:j(),uuid:r!=null&&r.uuid?r.uuid:W()};((r==null?void 0:r.disableGeoip)??this.disableGeoip)&&(s.properties||(s.properties={}),s.properties.$geoip_disable=!0),s.distinctId&&(s.distinct_id=s.distinctId,delete s.distinctId);const o=this.getPersistedProperty(C.Queue)||[];o.length>=this.maxQueueSize&&(o.shift(),console.info("Queue is full, the oldest event is dropped.")),o.push({message:s}),this.setPersistedProperty(C.Queue,o),this._events.emit(t,s),o.length>=this.flushAt&&this.flushBackground(),this.flushInterval&&!this._flushTimer&&(this._flushTimer=G(()=>this.flushBackground(),this.flushInterval))})}clearFlushTimer(){this._flushTimer&&(clearTimeout(this._flushTimer),this._flushTimer=void 0)}flushBackground(){this.flush().catch(()=>{})}async flush(){return this.flushPromise||(this.flushPromise=this._flush().finally(()=>{this.flushPromise=null}),this.addPendingPromise(this.flushPromise)),this.flushPromise}getCustomHeaders(){const t=this.getCustomUserAgent(),e={};return t&&t!==""&&(e["User-Agent"]=t),e}async _flush(){this.clearFlushTimer(),await this._initPromise;const t=this.getPersistedProperty(C.Queue)||[];if(!t.length)return[];const e=t.slice(0,this.maxBatchSize),r=e.map(h=>h.message),s=()=>{const h=this.getPersistedProperty(C.Queue)||[];this.setPersistedProperty(C.Queue,h.slice(e.length))},n={api_key:this.apiKey,batch:r,sent_at:j()},o=JSON.stringify(n),a=this.captureMode==="form"?`${this.host}/e/?ip=1&_=${oe()}&v=${this.getLibraryVersion()}`:`${this.host}/batch/`,u=this.captureMode==="form"?{method:"POST",mode:"no-cors",credentials:"omit",headers:{...this.getCustomHeaders(),"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(L.compressToBase64(o))}&compression=lz64`}:{method:"POST",headers:{...this.getCustomHeaders(),"Content-Type":"application/json"},body:o};try{await this.fetchWithRetry(a,u)}catch(h){throw h instanceof I||s(),this._events.emit("error",h),h}return s(),this._events.emit("flush",r),r}async fetchWithRetry(t,e,r,s){var n;return(n=AbortSignal).timeout??(n.timeout=function(a){const u=new AbortController;return setTimeout(()=>u.abort(),a),u.signal}),await ae(async()=>{let o=null;try{o=await this.fetch(t,{signal:AbortSignal.timeout(s??this.requestTimeout),...e})}catch(u){throw new I(u)}if(!(e.mode==="no-cors")&&(o.status<200||o.status>=400))throw new N(o);return o},{...this._retryOptions,...r})}async shutdown(t=3e4){await this._initPromise,this.clearFlushTimer();try{await Promise.all(Object.values(this.pendingPromises));const e=Date.now()+t;for(;(this.getPersistedProperty(C.Queue)||[]).length!==0;){await this.flush();const s=Date.now();if(e<s)break}}catch(e){if(!Q(e))throw e;console.error("Error while shutting down PostHog",e)}}}class pe{constructor(){this._memoryStorage={}}getProperty(t){return this._memoryStorage[t]}setProperty(t,e){this._memoryStorage[t]=e!==null?e:void 0}}let R=typeof fetch<"u"?fetch:typeof global.fetch<"u"?global.fetch:void 0;if(!R){const g=require("axios");R=async(t,e)=>{const r=await g.request({url:t,headers:e.headers,method:e.method.toLowerCase(),data:e.body,signal:e.signal,validateStatus:()=>!0});return{status:r.status,text:async()=>r.data,json:async()=>r.data}}}var V=R;const ge=1152921504606847e3;class D extends Error{constructor(t){super(),Error.captureStackTrace(this,this.constructor),this.name="ClientError",this.message=t,Object.setPrototypeOf(this,D.prototype)}}class S extends Error{constructor(t){super(t),this.name=this.constructor.name,Error.captureStackTrace(this,this.constructor),Object.setPrototypeOf(this,S.prototype)}}class ye{constructor({pollingInterval:t,personalApiKey:e,projectApiKey:r,timeout:s,host:n,customHeaders:o,...a}){this.debugMode=!1,this.pollingInterval=t,this.personalApiKey=e,this.featureFlags=[],this.featureFlagsByKey={},this.groupTypeMapping={},this.cohorts={},this.loadedSuccessfullyOnce=!1,this.timeout=s,this.projectApiKey=r,this.host=n,this.poller=void 0,this.fetch=a.fetch||V,this.onError=a.onError,this.customHeaders=o,this.loadFeatureFlags()}debug(t=!0){this.debugMode=t}async getFeatureFlag(t,e,r={},s={},n={}){var u;await this.loadFeatureFlags();let o,a;if(!this.loadedSuccessfullyOnce)return o;for(const h of this.featureFlags)if(t===h.key){a=h;break}if(a!==void 0)try{o=this.computeFlagLocally(a,e,r,s,n),this.debugMode&&console.debug(`Successfully computed flag locally: ${t} -> ${o}`)}catch(h){h instanceof S?this.debugMode&&console.debug(`InconclusiveMatchError when computing flag locally: ${t}: ${h}`):h instanceof Error&&((u=this.onError)==null||u.call(this,new Error(`Error computing flag locally: ${t}: ${h}`)))}return o}async computeFeatureFlagPayloadLocally(t,e){var s,n,o,a,u,h,p,m;await this.loadFeatureFlags();let r;if(this.loadedSuccessfullyOnce)return typeof e=="boolean"?r=(a=(o=(n=(s=this.featureFlagsByKey)==null?void 0:s[t])==null?void 0:n.filters)==null?void 0:o.payloads)==null?void 0:a[e.toString()]:typeof e=="string"&&(r=(m=(p=(h=(u=this.featureFlagsByKey)==null?void 0:u[t])==null?void 0:h.filters)==null?void 0:p.payloads)==null?void 0:m[e]),r===void 0?null:r}async getAllFlagsAndPayloads(t,e={},r={},s={}){await this.loadFeatureFlags();const n={},o={};let a=this.featureFlags.length==0;return this.featureFlags.map(async u=>{var h;try{const p=this.computeFlagLocally(u,t,e,r,s);n[u.key]=p;const m=await this.computeFeatureFlagPayloadLocally(u.key,p);m&&(o[u.key]=m)}catch(p){p instanceof S||p instanceof Error&&((h=this.onError)==null||h.call(this,new Error(`Error computing flag locally: ${u.key}: ${p}`))),a=!0}}),{response:n,payloads:o,fallbackToDecide:a}}computeFlagLocally(t,e,r={},s={},n={}){if(t.ensure_experience_continuity)throw new S("Flag has experience continuity enabled");if(!t.active)return!1;const a=(t.filters||{}).aggregation_group_type_index;if(a!=null){const u=this.groupTypeMapping[String(a)];if(!u)throw this.debugMode&&console.warn(`[FEATURE FLAGS] Unknown group type index ${a} for feature flag ${t.key}`),new S("Flag has unknown group type index");if(!(u in r))return this.debugMode&&console.warn(`[FEATURE FLAGS] Can't compute group feature flag: ${t.key} without group names passed in`),!1;const h=n[u];return this.matchFeatureFlagProperties(t,r[u],h)}else return this.matchFeatureFlagProperties(t,e,s)}matchFeatureFlagProperties(t,e,r){var h;const s=t.filters||{},n=s.groups||[];let o=!1,a;const u=[...n].sort((p,m)=>{const f=!!p.variant,l=!!m.variant;return f&&l?0:f?-1:l?1:0});for(const p of u)try{if(this.isConditionMatch(t,e,p,r)){const m=p.variant,f=((h=s.multivariate)==null?void 0:h.variants)||[];m&&f.some(l=>l.key===m)?a=m:a=this.getMatchingVariant(t,e)||!0;break}}catch(m){if(m instanceof S)o=!0;else throw m}if(a!==void 0)return a;if(o)throw new S("Can't determine if feature flag is enabled or not with given properties");return!1}isConditionMatch(t,e,r,s){const n=r.rollout_percentage;if((r.properties||[]).length>0){for(const o of r.properties){const a=o.type;let u=!1;if(a==="cohort"?u=H(o,s,this.cohorts):u=q(o,s),!u)return!1}if(n==null)return!0}return!(n!=null&&Y(t.key,e)>n/100)}getMatchingVariant(t,e){const r=Y(t.key,e,"variant"),s=this.variantLookupTable(t).find(n=>r>=n.valueMin&&r<n.valueMax);if(s)return s.key}variantLookupTable(t){var a;const e=[];let r=0,s=0;return(((a=(t.filters||{}).multivariate)==null?void 0:a.variants)||[]).forEach(u=>{s=r+u.rollout_percentage/100,e.push({valueMin:r,valueMax:s,key:u.key}),r=s}),e}async loadFeatureFlags(t=!1){(!this.loadedSuccessfullyOnce||t)&&await this._loadFeatureFlags()}async _loadFeatureFlags(){var t,e;this.poller&&(clearTimeout(this.poller),this.poller=void 0),this.poller=setTimeout(()=>this._loadFeatureFlags(),this.pollingInterval);try{const r=await this._requestFeatureFlagDefinitions();if(r&&r.status===401)throw new D("Your personalApiKey is invalid. Are you sure you're not using your Project API key? More information: https://posthog.com/docs/api/overview");if(r&&r.status!==200)return;const s=await r.json();"flags"in s||(t=this.onError)==null||t.call(this,new Error(`Invalid response when getting feature flags: ${JSON.stringify(s)}`)),this.featureFlags=s.flags||[],this.featureFlagsByKey=this.featureFlags.reduce((n,o)=>(n[o.key]=o,n),{}),this.groupTypeMapping=s.group_type_mapping||{},this.cohorts=s.cohorts||[],this.loadedSuccessfullyOnce=!0}catch(r){r instanceof D&&((e=this.onError)==null||e.call(this,r))}}async _requestFeatureFlagDefinitions(){const t=`${this.host}/api/feature_flag/local_evaluation?token=${this.projectApiKey}&send_cohorts`,e={method:"GET",headers:{...this.customHeaders,"Content-Type":"application/json",Authorization:`Bearer ${this.personalApiKey}`}};let r=null;if(this.timeout&&typeof this.timeout=="number"){const s=new AbortController;r=G(()=>{s.abort()},this.timeout),e.signal=s.signal}try{return await this.fetch(t,e)}finally{clearTimeout(r)}}stopPoller(){clearTimeout(this.poller)}}function Y(g,t,e=""){const r=re.createHash();return r.update(`${g}.${t}${e}`),parseInt(r.digest("hex").slice(0,15),16)/ge}function q(g,t){const e=g.key,r=g.value,s=g.operator||"exact";if(e in t){if(s==="is_not_set")throw new S("Operator is_not_set is not supported")}else throw new S(`Property ${e} not found in propertyValues`);const n=t[e];function o(u,h){return Array.isArray(u)?u.map(p=>String(p).toLowerCase()).includes(String(h).toLowerCase()):String(u).toLowerCase()===String(h).toLowerCase()}function a(u,h,p){if(p==="gt")return u>h;if(p==="gte")return u>=h;if(p==="lt")return u<h;if(p==="lte")return u<=h;throw new Error(`Invalid operator: ${p}`)}switch(s){case"exact":return o(r,n);case"is_not":return!o(r,n);case"is_set":return e in t;case"icontains":return String(n).toLowerCase().includes(String(r).toLowerCase());case"not_icontains":return!String(n).toLowerCase().includes(String(r).toLowerCase());case"regex":return K(String(r))&&String(n).match(String(r))!==null;case"not_regex":return K(String(r))&&String(n).match(String(r))===null;case"gt":case"gte":case"lt":case"lte":{let u=typeof r=="number"?r:null;if(typeof r=="string")try{u=parseFloat(r)}catch{}return u!=null&&n!=null?typeof n=="string"?a(n,String(r),s):a(n,u,s):a(String(n),String(r),s)}case"is_date_after":case"is_date_before":{let u=me(String(r));if(u==null&&(u=X(r)),u==null)throw new S(`Invalid date: ${r}`);const h=X(n);return["is_date_before"].includes(s)?h<u:h>u}default:throw new S(`Unknown operator: ${s}`)}}function H(g,t,e){const r=String(g.value);if(!(r in e))throw new S("can't match cohort without a given cohort property value");const s=e[r];return J(s,t,e)}function J(g,t,e){if(!g)return!0;const r=g.type,s=g.values;if(!s||s.length===0)return!0;let n=!1;if("values"in s[0]){for(const o of s)try{const a=J(o,t,e);if(r==="AND"){if(!a)return!1}else if(a)return!0}catch(a){if(a instanceof S)console.debug(`Failed to compute property ${o} locally: ${a}`),n=!0;else throw a}if(n)throw new S("Can't match cohort without a given cohort property value");return r==="AND"}else{for(const o of s)try{let a;o.type==="cohort"?a=H(o,t,e):a=q(o,t);const u=o.negation||!1;if(r==="AND"){if(!a&&!u||a&&u)return!1}else if(a&&!u||!a&&u)return!0}catch(a){if(a instanceof S)console.debug(`Failed to compute property ${o} locally: ${a}`),n=!0;else throw a}if(n)throw new S("can't match cohort without a given cohort property value");return r==="AND"}}function K(g){try{return new RegExp(g),!0}catch{return!1}}function X(g){if(g instanceof Date)return g;if(typeof g=="string"||typeof g=="number"){const t=new Date(g);if(!isNaN(t.valueOf()))return t;throw new S(`${g} is in an invalid date format`)}else throw new S(`The date provided ${g} must be a string, number, or date object`)}function me(g){const t=/^-?(?<number>[0-9]+)(?<interval>[a-z])$/,e=g.match(t),r=new Date(new Date().toISOString());if(e){if(!e.groups)return null;const s=parseInt(e.groups.number);if(s>=1e4)return null;const n=e.groups.interval;if(n=="h")r.setUTCHours(r.getUTCHours()-s);else if(n=="d")r.setUTCDate(r.getUTCDate()-s);else if(n=="w")r.setUTCDate(r.getUTCDate()-s*7);else if(n=="m")r.setUTCMonth(r.getUTCMonth()-s);else if(n=="y")r.setUTCFullYear(r.getUTCFullYear()-s);else return null;return r}else return null}const we=30*1e3,ve=50*1e3;class _e extends de{constructor(t,e={}){e.captureMode=(e==null?void 0:e.captureMode)||"json",super(t,e),this._memoryStorage=new pe,this.options=e,e.personalApiKey&&(this.featureFlagsPoller=new ye({pollingInterval:typeof e.featureFlagsPollingInterval=="number"?e.featureFlagsPollingInterval:we,personalApiKey:e.personalApiKey,projectApiKey:t,timeout:e.requestTimeout??1e4,host:this.host,fetch:e.fetch,onError:r=>{this._events.emit("error",r)},customHeaders:this.getCustomHeaders()})),this.distinctIdHasSentFlagCalls={},this.maxCacheSize=e.maxCacheSize||ve}getPersistedProperty(t){return this._memoryStorage.getProperty(t)}setPersistedProperty(t,e){return this._memoryStorage.setProperty(t,e)}fetch(t,e){return this.options.fetch?this.options.fetch(t,e):V(t,e)}getLibraryId(){return"posthog-node"}getLibraryVersion(){return ne}getCustomUserAgent(){return`${this.getLibraryId()}/${this.getLibraryVersion()}`}enable(){return super.optIn()}disable(){return super.optOut()}debug(t=!0){var e;super.debug(t),(e=this.featureFlagsPoller)==null||e.debug(t)}capture({distinctId:t,event:e,properties:r,groups:s,sendFeatureFlags:n,timestamp:o,disableGeoip:a,uuid:u}){const h=f=>{super.captureStateless(t,e,f,{timestamp:o,disableGeoip:a,uuid:u})},p=(f,l,i)=>super.getFeatureFlagsStateless(f,l,void 0,void 0,i),m=Promise.resolve().then(async()=>{var f,l;if(n)return await p(t,s,a);if((((l=(f=this.featureFlagsPoller)==null?void 0:f.featureFlags)==null?void 0:l.length)||0)>0){const i={};for(const[d,c]of Object.entries(s||{}))i[d]=String(c);return await this.getAllFlags(t,{groups:i,disableGeoip:a,onlyEvaluateLocally:!0})}return{}}).then(f=>{const l={};if(f)for(const[d,c]of Object.entries(f))l[`$feature/${d}`]=c;const i=Object.keys(f||{}).filter(d=>(f==null?void 0:f[d])!==!1);return i.length>0&&(l.$active_feature_flags=i),l}).catch(()=>({})).then(f=>{h({...f,...r,$groups:s})});this.addPendingPromise(m)}identify({distinctId:t,properties:e,disableGeoip:r}){const s=(e==null?void 0:e.$set)||e;super.identifyStateless(t,{$set:s},{disableGeoip:r})}alias(t){super.aliasStateless(t.alias,t.distinctId,void 0,{disableGeoip:t.disableGeoip})}async getFeatureFlag(t,e,r){var i;const{groups:s,disableGeoip:n}=r||{};let{onlyEvaluateLocally:o,sendFeatureFlagEvents:a,personProperties:u,groupProperties:h}=r||{};const p=this.addLocalPersonAndGroupProperties(e,s,u,h);u=p.allPersonProperties,h=p.allGroupProperties,o==null&&(o=!1),a==null&&(a=!0);let m=await((i=this.featureFlagsPoller)==null?void 0:i.getFeatureFlag(t,e,s,u,h));const f=m!==void 0;!f&&!o&&(m=await super.getFeatureFlagStateless(t,e,s,u,h,n));const l=`${t}_${m}`;return a&&(!(e in this.distinctIdHasSentFlagCalls)||!this.distinctIdHasSentFlagCalls[e].includes(l))&&(Object.keys(this.distinctIdHasSentFlagCalls).length>=this.maxCacheSize&&(this.distinctIdHasSentFlagCalls={}),Array.isArray(this.distinctIdHasSentFlagCalls[e])?this.distinctIdHasSentFlagCalls[e].push(l):this.distinctIdHasSentFlagCalls[e]=[l],this.capture({distinctId:e,event:"$feature_flag_called",properties:{$feature_flag:t,$feature_flag_response:m,locally_evaluated:f,[`$feature/${t}`]:m},groups:s,disableGeoip:n})),m}async getFeatureFlagPayload(t,e,r,s){var i;const{groups:n,disableGeoip:o}=s||{};let{onlyEvaluateLocally:a,sendFeatureFlagEvents:u,personProperties:h,groupProperties:p}=s||{};const m=this.addLocalPersonAndGroupProperties(e,n,h,p);h=m.allPersonProperties,p=m.allGroupProperties;let f;r||(r=await this.getFeatureFlag(t,e,{...s,onlyEvaluateLocally:!0})),r&&(f=await((i=this.featureFlagsPoller)==null?void 0:i.computeFeatureFlagPayloadLocally(t,r))),a==null&&(a=!1),u==null&&(u=!0),a==null&&(a=!1),!(f!==void 0)&&!a&&(f=await super.getFeatureFlagPayloadStateless(t,e,n,h,p,o));try{return JSON.parse(f)}catch{return f}}async isFeatureEnabled(t,e,r){const s=await this.getFeatureFlag(t,e,r);if(s!==void 0)return!!s||!1}async getAllFlags(t,e){return(await this.getAllFlagsAndPayloads(t,e)).featureFlags}async getAllFlagsAndPayloads(t,e){var l;const{groups:r,disableGeoip:s}=e||{};let{onlyEvaluateLocally:n,personProperties:o,groupProperties:a}=e||{};const u=this.addLocalPersonAndGroupProperties(t,r,o,a);o=u.allPersonProperties,a=u.allGroupProperties,n==null&&(n=!1);const h=await((l=this.featureFlagsPoller)==null?void 0:l.getAllFlagsAndPayloads(t,r,o,a));let p={},m={},f=!0;if(h&&(p=h.response,m=h.payloads,f=h.fallbackToDecide),f&&!n){const i=await super.getFeatureFlagsAndPayloadsStateless(t,r,o,a,s);p={...p,...i.flags||{}},m={...m,...i.payloads||{}}}return{featureFlags:p,featureFlagPayloads:m}}groupIdentify({groupType:t,groupKey:e,properties:r,distinctId:s,disableGeoip:n}){super.groupIdentifyStateless(t,e,r,{disableGeoip:n},s)}async reloadFeatureFlags(){var t;await((t=this.featureFlagsPoller)==null?void 0:t.loadFeatureFlags(!0))}async shutdown(t){var e;return(e=this.featureFlagsPoller)==null||e.stopPoller(),super.shutdown(t)}addLocalPersonAndGroupProperties(t,e,r,s){const n={distinct_id:t,...r||{}},o={};if(e)for(const a of Object.keys(e))o[a]={$group_key:e[a],...(s==null?void 0:s[a])||{}};return{allPersonProperties:n,allGroupProperties:o}}}const be="phc_LecQvgC7jUQ4GKugFV9Qs1Yf95bFvdDUdVWG9fmpCuY";let $=null,E=null;async function Fe(){function g(t){let e="";const r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let s=0;s<t;s+=1)e+=r.charAt(Math.floor(Math.random()*r.length));return e}if(!E){const t=await chrome.storage.local.get("clientID");t.clientID?E=t.clientID:(E=g(8),await chrome.storage.local.set({clientID:E}))}}async function Z(g,t){$||($=new _e(be,{disableGeoip:!1})),E||await Fe(),$.capture({distinctId:E,event:g,properties:t}),console.log("[PH]",g,t)}const Se={hotkey:!1,summaryIcon:!1,copyFormat:"plain-text",promptLanguage:"en",promptTemplate:`You are provided the title and transcript of a Youtube video in triple quotes.
Summarize the video transcript in 5 bullet points in {{Language}}.
Title: """{{Title}}"""
Transcript: """{{Text}}"""`,defaultModel:"gpt",gptVersion:"gpt-4o-mini",geminiVersion:"standard",temporaryChat:!1};async function xe(){console.log("init"),chrome.runtime.setUninstallURL("https://dictanote.co/youtube-summary/feedback/");try{const{settings:g}=await chrome.storage.local.get({settings:Se});await chrome.storage.local.set({settings:g})}catch(g){console.error("Error initializing settings:",g)}}chrome.runtime.onInstalled.addListener(Pe),chrome.runtime.onMessage.addListener(Ce),chrome.runtime.onMessageExternal.addListener(Ae),chrome.action.onClicked.addListener(()=>{ee()});function ee(){chrome.runtime.openOptionsPage()}function Ae(g,t,e){g&&g.message&&g.message==="version"&&e({version:1})}async function Pe(g){if(console.log("onInstalled"),g.reason==chrome.runtime.OnInstalledReason.INSTALL){chrome.tabs.create({url:"https://dictanote.co/youtube-summary/getting-started/"}),Z("install",{version:chrome.runtime.getManifest().version});return}}function Ce(g,t){console.log("Background",g,t),g.id=="open-settings"?ee():g.id=="track"&&Z(g.category,g.info)}xe()})();
</file>
<file name="index.js" path="/src/content-scripts/yt-widget/index.js">
var R=Object.defineProperty;var U=(u,g,p)=>g in u?R(u,g,{enumerable:!0,configurable:!0,writable:!0,value:p}):u[g]=p;var d=(u,g,p)=>(U(u,typeof g!="symbol"?g+"":g,p),p);(function(){"use strict";const u=`.qt-widget {
  --foreground: var(--yt-spec-text-primary);
  --foreground-hover: var(--yt-spec-text-primary-inverse);
  --background: var(--yt-spec-badge-chip-background);
  --background-hover: rgba(0, 0, 0, 0.1);
}

html[dark] .qt-widget {
  --background-hover: rgba(255, 255, 255, 0.2);
}

.qt-widget {
  width: calc(100% - 2rem);
  padding: 1rem 1rem;
  margin-bottom: 8px;

  font-size: 1.5rem;
  font-weight: 500;

  color: var(--foreground);
  background: var(--background);

  border-radius: 8px;

  cursor: pointer;

  transition: background ease 0.15s;
}

.qt-widget:not(.qt-collapsed) {
  padding-bottom: 1.5rem;
}

.qt-widget.qt-collapsed:hover {
  background: var(--background-hover);
}

.qt-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  height: 34px;
  overflow: visible;
  user-select: none;
}

.qt-header img {
  width: 24px;
  height: 24px;
}

.qt-icon-row {
  display: flex;
  height: 34px;
  align-items: flex-start;
  overflow: visible;
  justify-content: center;
  gap: 0.25rem;
}

.qt-icon {
  all: unset;

  display: block;

  width: 24px;
  height: 24px;

  padding: 4px;
  border-radius: 12px;

  color: var(--foreground);

  cursor: pointer;

  transition: background ease 0.25s;
}

.qt-icon:nth-of-type(3) svg {
  border-radius: 24px;
  overflow: hidden;
}

.qt-widget.qt-collapsed .qt-icon.qt-hide-on-collapse {
  visibility: hidden;
  pointer-events: none;
}

.qt-icon-row .qt-icon:not(.qt-dropdown-option):hover {
  background: var(--background-hover);
}

.qt-icon-row .qt-icon:active {
  background: transparent;
}

.qt-icon svg {
  width: 24px;
  height: 24px;
}

.qt-icon-dropdown {
  z-index: 1000;
  height: unset;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: center;
  background: var(--background-hover);
  backdrop-filter: blur(4px) brightness(50%);
  box-shadow: 0 0 10px -5px black;
}

.qt-dropdown-option {
  display: grid;
  cursor: pointer;
  padding: 0;
  border-radius: 24px;
  overflow: hidden;
  background: none;
  outline: none;
  border: none;
}

.qt-content {
  cursor: default;
  margin-top: 1rem;
}

.qt-widget.qt-collapsed .qt-content {
  height: 0px;
  visibility: hidden;
  pointer-events: none;
}

.qt-content hr {
  margin: 1rem 0;
  height: 1px;
  background: var(--background-hover);
}

.qt-language-row {
  margin-bottom: 1rem;

  display: flex;
  align-items: center;
  gap: 0.5rem;

  overflow-x: scroll;
  overflow-y: hidden;

  scrollbar-width: thin;
  scrollbar-color: var(--background-hover) transparent;
}

.qt-language {
  all: unset;

  display: flex;
  white-space: nowrap;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  padding: 0.5rem 1rem;
  border-radius: 8px;

  color: var(--foreground);

  transition: color ease 0.15s, background ease 0.15s;
}

.qt-language:not(.qt-selected):hover {
  background: var(--background-hover);
}

.qt-language.qt-selected {
  background: var(--foreground);
  color: var(--foreground-hover);
}

.qt-content>span {
  display: grid;
  justify-content: center;
  font-weight: 400;
}

.qt-spinner {
  display: grid;
  justify-content: center;
}

.qt-spinner::after {
  content: "";
  border: 5px solid transparent;
  border-top: 5px solid var(--background-hover);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.qt-transcript-container {
  position: relative;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  max-height: 500px;
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--background-hover) transparent;

  font-size: 1.5rem;
  font-weight: 400;
}

.qt-transcript-segment {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
}

.qt-timestamp {
  all: unset;

  color: #3ea6ff;
  cursor: pointer;
}

.qt-transcript-text {
  margin: 0;
}
`,g=`<svg fill="currentColor" version="1.1" id="Capa_1" width="24px" height="24px" viewBox="0 0 97 97" xmlns="http://www.w3.org/2000/svg">\r
  <g style="" transform="matrix(0.844125, 0, 0, 0.844125, 7.559933, 7.559933)">\r
    <path d="M95,44.312h-7.518C85.54,26.094,70.906,11.46,52.688,9.517V2c0-1.104-0.896-2-2-2h-4.376c-1.104,0-2,0.896-2,2v7.517l0,0 C26.094,11.46,11.46,26.094,9.517,44.312H2c-1.104,0-2,0.896-2,2v4.377c0,1.104,0.896,2,2,2h7.517 C11.46,70.906,26.094,85.54,44.312,87.482V95c0,1.104,0.896,2,2,2h4.377c1.104,0,2-0.896,2-2v-7.518l0,0 C70.906,85.54,85.54,70.906,87.482,52.688H95c1.104,0,2-0.896,2-2v-4.376C97,45.207,96.104,44.312,95,44.312z M24.896,52.688 c1.104,0,2-0.896,2-2v-4.376c0-1.104-0.896-2-2-2h-6.492c1.856-13.397,12.51-24.052,25.907-25.908v6.492c0,1.104,0.896,2,2,2h4.376 c1.104,0,2-0.896,2-2v-6.492C66.086,20.26,76.74,30.914,78.596,44.312h-6.492c-1.104,0-2,0.896-2,2v4.377c0,1.104,0.896,2,2,2 h6.492C76.74,66.086,66.086,76.74,52.689,78.598v-6.492c0-1.104-0.896-2-2-2h-4.377c-1.104,0-2,0.896-2,2v6.492 C30.914,76.74,20.26,66.086,18.404,52.688H24.896z"/>\r
  </g>\r
</svg>\r
`,p=`<?xml version="1.0" encoding="utf-8"?>
<svg fill="currentColor" width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <path d="M 13.096 3.525 L 10.573 1.113 C 10.362 0.895 10.07 0.773 9.767 0.774 L 6.099 0.774 C 5.476 0.789 4.979 1.298 4.98 1.921 L 4.98 12.008 C 4.98 12.642 5.493 13.154 6.126 13.154 L 12.288 13.154 C 12.922 13.154 13.435 12.642 13.435 12.008 L 13.435 4.333 C 13.436 4.028 13.314 3.737 13.096 3.525 Z M 12.288 12.008 L 6.126 12.008 L 6.126 1.921 L 8.62 1.921 L 8.62 4.333 C 8.62 4.966 9.134 5.479 9.767 5.479 L 12.288 5.479 L 12.288 12.008 Z M 12.288 4.333 L 9.767 4.333 L 9.767 1.921 L 12.288 4.333 Z" style=""/>
  <path d="M 10.412 13.852 L 4.246 13.852 L 4.246 3.759 L 4.805 3.759 L 4.805 2.612 L 4.246 2.612 C 3.613 2.612 3.099 3.126 3.099 3.759 L 3.099 13.852 C 3.099 14.486 3.613 14.999 4.246 14.999 L 10.412 14.999 C 11.045 14.999 11.559 14.486 11.559 13.852 L 11.559 13.274 L 10.412 13.274 L 10.412 13.852 Z" style=""/>
</svg>`,V=`<svg width="24px" height="24px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <g id="Layer_2" data-name="Layer 2">
    <g id="invisible_box" data-name="invisible box">
      <rect width="48" height="48" fill="none"/>
    </g>
    <g id="Q3_icons" data-name="Q3 icons">
      <g>
        <path fill="currentColor" d="M45.6,18.7,41,14.9V7.5a1,1,0,0,0-.6-.9L30.5,2.1h-.4l-.6.2L24,5.9,18.5,2.2,17.9,2h-.4L7.6,6.6a1,1,0,0,0-.6.9v7.4L2.4,18.7a.8.8,0,0,0-.4.8v9H2a.8.8,0,0,0,.4.8L7,33.1v7.4a1,1,0,0,0,.6.9l9.9,4.5h.4l.6-.2L24,42.1l5.5,3.7.6.2h.4l9.9-4.5a1,1,0,0,0,.6-.9V33.1l4.6-3.8a.8.8,0,0,0,.4-.7V19.4h0A.8.8,0,0,0,45.6,18.7Zm-5.1,6.8H42v1.6l-3.5,2.8-.4.3-.4-.2a1.4,1.4,0,0,0-2,.7,1.5,1.5,0,0,0,.6,2l.7.3h0v5.4l-6.6,3.1-4.2-2.8-.7-.5V25.5H27a1.5,1.5,0,0,0,0-3H25.5V9.7l.7-.5,4.2-2.8L37,9.5v5.4h0l-.7.3a1.5,1.5,0,0,0-.6,2,1.4,1.4,0,0,0,1.3.9l.7-.2.4-.2.4.3L42,20.9v1.6H40.5a1.5,1.5,0,0,0,0,3ZM21,25.5h1.5V38.3l-.7.5-4.2,2.8L11,38.5V33.1h0l.7-.3a1.5,1.5,0,0,0,.6-2,1.4,1.4,0,0,0-2-.7l-.4.2-.4-.3L6,27.1V25.5H7.5a1.5,1.5,0,0,0,0-3H6V20.9l3.5-2.8.4-.3.4.2.7.2a1.4,1.4,0,0,0,1.3-.9,1.5,1.5,0,0,0-.6-2L11,15h0V9.5l6.6-3.1,4.2,2.8.7.5V22.5H21a1.5,1.5,0,0,0,0,3Z"/>
        <path fill="currentColor" d="M13.9,9.9a1.8,1.8,0,0,0,0,2.2l2.6,2.5v2.8l-4,4v5.2l4,4v2.8l-2.6,2.5a1.8,1.8,0,0,0,0,2.2,1.5,1.5,0,0,0,1.1.4,1.5,1.5,0,0,0,1.1-.4l3.4-3.5V29.4l-4-4V22.6l4-4V13.4L16.1,9.9A1.8,1.8,0,0,0,13.9,9.9Z"/>
        <path fill="currentColor" d="M31.5,14.6l2.6-2.5a1.8,1.8,0,0,0,0-2.2,1.8,1.8,0,0,0-2.2,0l-3.4,3.5v5.2l4,4v2.8l-4,4v5.2l3.4,3.5a1.7,1.7,0,0,0,2.2,0,1.8,1.8,0,0,0,0-2.2l-2.6-2.5V30.6l4-4V21.4l-4-4Z"/>
      </g>
    </g>
  </g>
</svg>
`,y=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 2406 2406">
	<path d="M1 578.4C1 259.5 259.5 1 578.4 1h1249.1c319 0 577.5 258.5 577.5 577.4V2406H578.4C259.5 2406 1 2147.5 1 1828.6V578.4z" fill="#74aa9c"/>
	<path id="a" d="M1107.3 299.1c-197.999 0-373.9 127.3-435.2 315.3L650 743.5v427.9c0 21.4 11 40.4 29.4 51.4l344.5 198.515V833.3h.1v-27.9L1372.7 604c33.715-19.52 70.44-32.857 108.47-39.828L1447.6 450.3C1361 353.5 1237.1 298.5 1107.3 299.1zm0 117.5-.6.6c79.699 0 156.3 27.5 217.6 78.4-2.5 1.2-7.4 4.3-11 6.1L952.8 709.3c-18.4 10.4-29.4 30-29.4 51.4V1248l-155.1-89.4V755.8c-.1-187.099 151.601-338.9 339-339.2z" fill="#fff"/>
	<use xlink:href="#a" transform="rotate(60 1203 1203)"/>
  	<use xlink:href="#a" transform="rotate(120 1203 1203)"/>
	<use xlink:href="#a" transform="rotate(180 1203 1203)"/>
	<use xlink:href="#a" transform="rotate(240 1203 1203)"/>
	<use xlink:href="#a" transform="rotate(300 1203 1203)"/>
</svg>
`,M=`<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 512">
  <rect fill="#CC9B7A" width="512" height="512" rx="104.187" ry="105.042"/>
  <path fill="#1F1F1E" fill-rule="nonzero" d="M318.663 149.787h-43.368l78.952 212.423 43.368.004-78.952-212.427zm-125.326 0l-78.952 212.427h44.255l15.932-44.608 82.846-.004 16.107 44.612h44.255l-79.126-212.427h-45.317zm-4.251 128.341l26.91-74.701 27.083 74.701h-53.993z"/>
</svg>
`,b=`<svg width="24px" height="24px" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="paint0_radial_2525_777" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(670.447 474.006) rotate(78.858) scale(665.5 665.824)">
      <stop stop-color="#1BA1E3"/>
      <stop offset="0.0001" stop-color="#1BA1E3"/>
      <stop offset="0.300221" stop-color="#5489D6"/>
      <stop offset="0.545524" stop-color="#9B72CB"/>
      <stop offset="0.825372" stop-color="#D96570"/>
      <stop offset="1" stop-color="#F49C46"/>
    </radialGradient>
    <radialGradient id="paint1_radial_2525_777" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(670.447 474.006) rotate(78.858) scale(665.5 665.824)">
      <stop stop-color="#1BA1E3"/>
      <stop offset="0.0001" stop-color="#1BA1E3"/>
      <stop offset="0.300221" stop-color="#5489D6"/>
      <stop offset="0.545524" stop-color="#9B72CB"/>
      <stop offset="0.825372" stop-color="#D96570"/>
      <stop offset="1" stop-color="#F49C46"/>
    </radialGradient>
  </defs>
  <path d="M515.09 725.824L472.006 824.503C455.444 862.434 402.954 862.434 386.393 824.503L343.308 725.824C304.966 638.006 235.953 568.104 149.868 529.892L31.2779 477.251C-6.42601 460.515 -6.42594 405.665 31.2779 388.929L146.164 337.932C234.463 298.737 304.714 226.244 342.401 135.431L386.044 30.2693C402.239 -8.75637 456.159 -8.75646 472.355 30.2692L515.998 135.432C553.685 226.244 623.935 298.737 712.234 337.932L827.121 388.929C864.825 405.665 864.825 460.515 827.121 477.251L708.53 529.892C622.446 568.104 553.433 638.006 515.09 725.824Z" fill="url(#paint0_radial_2525_777)"/>
  <path d="M915.485 1036.98L903.367 1064.75C894.499 1085.08 866.349 1085.08 857.481 1064.75L845.364 1036.98C823.765 987.465 784.862 948.042 736.318 926.475L698.987 909.889C678.802 900.921 678.802 871.578 698.987 862.61L734.231 846.951C784.023 824.829 823.623 783.947 844.851 732.75L857.294 702.741C865.966 681.826 894.882 681.826 903.554 702.741L915.997 732.75C937.225 783.947 976.826 824.829 1026.62 846.951L1061.86 862.61C1082.05 871.578 1082.05 900.921 1061.86 909.889L1024.53 926.475C975.987 948.042 937.083 987.465 915.485 1036.98Z" fill="url(#paint1_radial_2525_777)"/>
</svg>
`,q=`<?xml version="1.0" encoding="UTF-8"?>
<svg width="256px" height="233px" viewBox="0 0 256 233" version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
    <title>Mistral AI</title>
    <g>
        <rect fill="#000000" x="186.181818" y="0" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#F7D046" x="209.454545" y="0" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#000000" x="0" y="0" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#000000" x="0" y="46.5454545" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#000000" x="0" y="93.0909091" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#000000" x="0" y="139.636364" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#000000" x="0" y="186.181818" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#F7D046" x="23.2727273" y="0" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#F2A73B" x="209.454545" y="46.5454545" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#F2A73B" x="23.2727273" y="46.5454545" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#000000" x="139.636364" y="46.5454545" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#F2A73B" x="162.909091" y="46.5454545" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#F2A73B" x="69.8181818" y="46.5454545" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#EE792F" x="116.363636" y="93.0909091" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#EE792F" x="162.909091" y="93.0909091" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#EE792F" x="69.8181818" y="93.0909091" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#000000" x="93.0909091" y="139.636364" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#EB5829" x="116.363636" y="139.636364" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#EE792F" x="209.454545" y="93.0909091" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#EE792F" x="23.2727273" y="93.0909091" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#000000" x="186.181818" y="139.636364" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#EB5829" x="209.454545" y="139.636364" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#000000" x="186.181818" y="186.181818" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#EB5829" x="23.2727273" y="139.636364" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#EA3326" x="209.454545" y="186.181818" width="46.5454545" height="46.5454545"></rect>
        <rect fill="#EA3326" x="23.2727273" y="186.181818" width="46.5454545" height="46.5454545"></rect>
    </g>
</svg>
`,H=`<?xml version="1.0" encoding="utf-8"?>\r
<svg width="24px" height="24px" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">\r
  <path fill="currentColor" d="M 78.602 22.36 L 72.057 21.58 L 78.602 22.361 L 78.602 22.36 Z M 113.4 22.36 L 106.856 23.141 L 113.4 22.36 Z M 150.985 44.091 L 148.388 38.025 L 150.985 44.09 L 150.985 44.091 Z M 162.059 47.779 L 167.766 44.479 L 162.059 47.779 Z M 170.732 62.822 L 176.439 59.522 L 170.732 62.822 Z M 168.385 74.27 L 164.437 68.984 L 168.385 74.27 Z M 168.385 117.731 L 172.331 112.445 L 168.385 117.731 Z M 170.732 129.179 L 176.439 132.479 L 170.732 129.179 Z M 162.059 144.222 L 156.351 140.922 L 162.059 144.222 Z M 150.985 147.91 L 153.582 141.844 L 150.985 147.91 Z M 113.4 169.641 L 119.945 170.421 L 113.4 169.641 Z M 78.602 169.641 L 72.057 170.421 L 78.602 169.641 Z M 41.016 147.91 L 38.42 141.844 L 41.016 147.91 Z M 29.944 144.222 L 24.236 147.522 L 29.943 144.222 L 29.944 144.222 Z M 21.27 129.179 L 26.977 125.879 L 21.27 129.179 Z M 23.617 117.731 L 27.565 123.016 L 23.617 117.731 Z M 23.617 74.27 L 19.67 79.555 L 23.617 74.27 Z M 21.27 62.822 L 26.977 66.122 L 21.27 62.822 Z M 29.943 47.779 L 24.236 44.479 L 29.943 47.779 Z M 41.016 44.091 L 38.42 50.157 L 41.016 44.091 Z M 49.639 47.793 L 47.041 53.859 L 49.638 47.793 L 49.639 47.793 Z M 49.639 144.208 L 52.236 150.273 L 49.638 144.208 L 49.639 144.208 Z M 30.353 112.687 L 26.405 107.402 L 30.353 112.687 Z M 114.738 158.376 L 121.282 159.157 L 114.738 158.376 Z M 158.515 81.66 L 154.568 76.374 L 158.515 81.66 Z M 140.535 48.578 L 143.131 54.644 L 140.535 48.578 Z M 114.738 33.625 L 108.194 34.405 L 114.738 33.624 L 114.738 33.625 Z M 87.328 8 C 79.537 8 72.978 13.834 72.057 21.58 L 85.146 23.141 C 85.278 22.034 86.215 21.2 87.328 21.2 L 87.328 8 Z M 104.674 8 L 87.328 8 L 87.328 21.2 L 104.674 21.2 L 104.674 8 Z M 119.945 21.58 C 119.024 13.834 112.464 8 104.674 8 L 104.674 21.2 C 105.787 21.2 106.724 22.034 106.856 23.141 L 119.945 21.58 Z M 121.284 32.844 L 119.945 21.58 L 106.856 23.141 L 108.195 34.405 L 121.284 32.844 Z M 148.388 38.025 L 137.938 42.513 L 143.133 54.644 L 153.582 50.156 L 148.388 38.025 Z M 167.766 44.479 C 163.871 37.722 155.547 34.95 148.388 38.025 L 153.582 50.157 C 154.605 49.717 155.794 50.113 156.351 51.079 L 167.766 44.479 Z M 176.439 59.522 L 167.766 44.479 L 156.351 51.079 L 165.024 66.122 L 176.439 59.522 Z M 172.331 79.555 C 178.569 74.884 180.334 66.278 176.439 59.522 L 165.024 66.122 C 165.581 67.088 165.329 68.317 164.437 68.984 L 172.331 79.555 Z M 162.463 86.945 L 172.331 79.555 L 164.437 68.984 L 154.57 76.374 L 162.463 86.945 Z M 172.331 112.445 L 162.463 105.056 L 154.57 115.627 L 164.437 123.016 L 172.331 112.445 Z M 176.439 132.479 C 180.334 125.722 178.569 117.117 172.331 112.445 L 164.437 123.016 C 165.329 123.684 165.581 124.913 165.024 125.879 L 176.439 132.479 Z M 167.766 147.522 L 176.439 132.479 L 165.024 125.879 L 156.351 140.922 L 167.766 147.522 Z M 148.388 153.976 C 155.547 157.05 163.871 154.278 167.766 147.522 L 156.351 140.922 C 155.794 141.887 154.605 142.283 153.582 141.844 L 148.388 153.976 Z M 137.938 149.488 L 148.388 153.976 L 153.582 141.844 L 143.134 137.357 L 137.938 149.488 Z M 119.945 170.421 L 121.284 159.157 L 108.195 157.596 L 106.856 168.86 L 119.945 170.421 Z M 104.674 184 C 112.464 184 119.024 178.167 119.945 170.421 L 106.856 168.86 C 106.724 169.967 105.787 170.8 104.674 170.8 L 104.674 184 Z M 87.328 184 L 104.674 184 L 104.674 170.8 L 87.328 170.8 L 87.328 184 Z M 72.057 170.421 C 72.978 178.167 79.537 184 87.328 184 L 87.328 170.8 C 86.215 170.8 85.278 169.967 85.146 168.86 L 72.057 170.421 Z M 70.946 161.066 L 72.057 170.421 L 85.146 168.86 L 84.034 159.506 L 70.946 161.066 Z M 47.041 138.141 L 38.419 141.844 L 43.614 153.976 L 52.236 150.273 L 47.04 138.141 L 47.041 138.141 Z M 38.419 141.844 C 37.396 142.283 36.207 141.887 35.651 140.922 L 24.236 147.522 C 28.131 154.278 36.455 157.05 43.614 153.976 L 38.419 141.844 Z M 35.651 140.922 L 26.977 125.879 L 15.562 132.479 L 24.236 147.522 L 35.651 140.922 Z M 26.977 125.879 C 26.42 124.913 26.673 123.684 27.565 123.016 L 19.67 112.445 C 13.432 117.117 11.667 125.722 15.562 132.479 L 26.977 125.879 Z M 27.565 123.016 L 34.301 117.973 L 26.406 107.402 L 19.67 112.445 L 27.565 123.016 Z M 19.67 79.555 L 26.406 84.6 L 34.301 74.029 L 27.565 68.984 L 19.67 79.555 Z M 15.562 59.522 C 11.667 66.278 13.432 74.884 19.67 79.555 L 27.565 68.984 C 26.673 68.317 26.42 67.088 26.977 66.122 L 15.562 59.522 Z M 24.236 44.479 L 15.562 59.522 L 26.977 66.122 L 35.651 51.079 L 24.236 44.479 Z M 43.614 38.025 C 36.455 34.95 28.131 37.722 24.236 44.479 L 35.651 51.079 C 36.207 50.114 37.396 49.718 38.419 50.157 L 43.614 38.025 Z M 52.236 41.727 L 43.613 38.025 L 38.419 50.157 L 47.041 53.859 L 52.236 41.727 Z M 72.057 21.58 L 70.946 30.934 L 84.034 32.495 L 85.146 23.141 L 72.057 21.58 Z M 70.13 51.887 C 76.807 48.118 82.971 41.435 84.034 32.494 L 70.946 30.935 C 70.526 34.465 67.904 37.992 63.657 40.39 L 70.13 51.888 L 70.13 51.887 Z M 47.041 53.859 C 55.042 57.296 63.578 55.586 70.13 51.887 L 63.657 40.389 C 59.589 42.686 55.44 43.104 52.236 41.727 L 47.04 53.859 L 47.041 53.859 Z M 44.374 96 C 44.374 88.19 41.576 79.476 34.301 74.028 L 26.406 84.599 C 29.392 86.835 31.193 90.982 31.193 96 L 44.374 96 Z M 70.13 140.114 C 63.578 136.414 55.042 134.705 47.041 138.141 L 52.236 150.273 C 55.44 148.897 59.589 149.315 63.657 151.613 L 70.13 140.114 Z M 34.299 117.973 C 41.576 112.525 44.374 103.81 44.374 96 L 31.193 96 C 31.193 101.02 29.392 105.167 26.406 107.402 L 34.301 117.973 L 34.299 117.973 Z M 120.723 139.505 C 114.642 143.133 109.171 149.386 108.195 157.596 L 121.284 159.157 C 121.645 156.115 123.83 153.017 127.47 150.844 L 120.723 139.505 Z M 143.134 137.357 C 135.341 134.011 127.021 135.748 120.723 139.505 L 127.47 150.844 C 131.185 148.628 135.018 148.235 137.938 149.488 L 143.134 137.357 Z M 84.034 159.506 C 82.971 150.566 76.807 143.883 70.13 140.114 L 63.657 151.613 C 67.904 154.01 70.526 157.537 70.946 161.066 L 84.034 159.506 Z M 145.431 96 C 145.431 103.028 148.065 110.756 154.57 115.627 L 162.463 105.056 C 160.121 103.302 158.612 100.035 158.612 96 L 145.431 96 Z M 154.57 76.374 C 148.065 81.245 145.431 88.971 145.431 96 L 158.612 96 C 158.612 91.966 160.121 88.699 162.463 86.945 L 154.57 76.374 Z M 120.723 52.495 C 127.021 56.253 135.341 57.99 143.133 54.644 L 137.938 42.512 C 135.018 43.766 131.185 43.372 127.47 41.155 L 120.723 52.496 L 120.723 52.495 Z M 108.195 34.405 C 109.171 42.615 114.642 48.868 120.723 52.495 L 127.47 41.155 C 123.83 38.984 121.645 35.886 121.284 32.844 L 108.195 34.405 Z" style="transform-box: fill-box; transform-origin: 50% 50%;"/>\r
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="12" d="M96 120c13.255 0 24-10.745 24-24s-10.745-24-24-24-24 10.745-24 24 10.745 24 24 24Z"/>\r
</svg>\r
`,k=`<?xml version="1.0" encoding="UTF-8"?>
<svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M13.2371 21.0407L24.3186 12.8506C24.8619 12.4491 25.6384 12.6057 25.8973 13.2294C27.2597 16.5185 26.651 20.4712 23.9403 23.1851C21.2297 25.8989 17.4581 26.4941 14.0108 25.1386L10.2449 26.8843C15.6463 30.5806 22.2053 29.6665 26.304 25.5601C29.5551 22.3051 30.562 17.8683 29.6205 13.8673L29.629 13.8758C28.2637 7.99809 29.9647 5.64871 33.449 0.844576C33.5314 0.730667 33.6139 0.616757 33.6964 0.5L29.1113 5.09055V5.07631L13.2343 21.0436" fill="currentColor"/>
  <path d="M10.9503 23.0313C7.07343 19.3235 7.74185 13.5853 11.0498 10.2763C13.4959 7.82722 17.5036 6.82767 21.0021 8.2971L24.7595 6.55998C24.0826 6.07017 23.215 5.54334 22.2195 5.17313C17.7198 3.31926 12.3326 4.24192 8.67479 7.90126C5.15635 11.4239 4.0499 16.8403 5.94992 21.4622C7.36924 24.9165 5.04257 27.3598 2.69884 29.826C1.86829 30.7002 1.0349 31.5745 0.36364 32.5L10.9474 23.0341" fill="currentColor"/>
</svg>`;let f={videoDetails:{author:"",title:"",videoId:""},captions:{playerCaptionsTracklistRenderer:{captionTracks:[]}}};function Z(i){f=i}function B(){if(!f.captions)return[];const i=[];for(const t of f.captions.playerCaptionsTracklistRenderer.captionTracks)i.push({url:t.baseUrl,name:t.name.simpleText,code:t.languageCode});return i}function T(){return f.videoDetails.videoId}function E(){return f.videoDetails.author}function A(){return f.videoDetails.title}function D(){return document.querySelector(".html5-main-video").currentTime}function F(i){history.pushState(null,"",`/watch?v=${T()}&t=${i}s`),document.querySelector(".html5-main-video").currentTime=i}async function v(i){const t=await fetch(i);if(t.status!=200)throw new Error("Bad response fetching transcript:"+t.status);const n=await t.text(),e=new DOMParser().parseFromString(n,"text/xml").getElementsByTagName("text");if(e.length==0)return[];const r=[{timestamp:parseInt(e[0].getAttribute("start")),text:""}];let a=0;for(const c of e){const l=c.innerHTML.replace(/\r?\n|\r/g," ").trim(),h=parseInt(c.getAttribute("start")),L=r[r.length-1],x=L.text.length,C=L.text.split(" ").length;if(x>=500||C>=100||a>=3){r.push({timestamp:h,text:l}),a=0;continue}L.text+=" "+l,l[l.length-1]=="."&&a++}for(const c of r)c.text=new DOMParser().parseFromString(c.text,"text/html").documentElement.textContent||"",c.text=new DOMParser().parseFromString(c.text,"text/html").documentElement.textContent||"";return r}function z(i){return async t=>{await m("hotkey")&&(t.ctrlKey||t.metaKey)&&t.shiftKey&&t.key=="S"&&(t.stopPropagation(),i())}}async function m(i){return(await chrome.storage.local.get("settings")).settings[i]}function o(i,t="",n=""){const e=document.createElement(i);return e.className=t,e.innerHTML=n,e}function s(i,t,n="after"){t.insertBefore(i,n=="before"?t.childNodes[0]:null)}function I(i,t){console.log("[PH]",i,t),chrome.runtime.sendMessage({id:"track",category:i,info:t})}function S(i){const t=Math.floor(i/60),n=i-t*60;return`${("00"+t).slice(-2)}:${("00"+n).slice(-2)}`}class j{constructor(){d(this,"element");d(this,"collapsed");d(this,"aiOptionsCollapsed");d(this,"jumpToTimeButton");d(this,"copyButton");d(this,"defaultAiButton");d(this,"defaultAiButtonHandler");d(this,"aiButton");d(this,"settingsButton");d(this,"content");d(this,"creator");d(this,"title");d(this,"languages");d(this,"transcript");this.element=o("div","qt-widget qt-collapsed"),this.collapsed=!0,this.aiOptionsCollapsed=!0,this.jumpToTimeButton=o("button","qt-icon qt-hide-on-collapse",g),this.copyButton=o("button","qt-icon qt-hide-on-collapse",p),this.defaultAiButton=o("button","qt-icon"),this.defaultAiButtonHandler=()=>{},this.updateDefaultModel(),this.aiButton=o("button","qt-icon",V),this.settingsButton=o("button","qt-icon",H),s(this.createHeader(),this.element),this.content=o("div"),this.creator=E(),this.title=A(),this.languages=B(),this.transcript=[],document.body.addEventListener("keydown",z(()=>this.defaultAiButton.click())),this.element.addEventListener("click",t=>this.widgetClicked(t)),this.jumpToTimeButton.addEventListener("click",()=>this.jumpToTime()),this.copyButton.addEventListener("click",()=>this.copyTrancript()),this.aiButton.addEventListener("click",t=>this.dropdownAiOptions(t)),this.settingsButton.addEventListener("click",()=>this.openSettings())}remove(){this.element.remove()}reload(){this.creator=E(),this.title=A(),this.languages=B(),this.transcript=[],this.updateDefaultModel(),this.collapsed||(this.content.remove(),this.loadContent())}createHeader(){const t=o("div","qt-header"),n=o("img");n.src=chrome.runtime.getURL("/logo.png");const e=o("span","","Transcript & Summary"),r=o("div","qt-icon-row");return s(n,t),s(e,t),s(this.jumpToTimeButton,r),s(this.copyButton,r),s(this.defaultAiButton,r),s(this.aiButton,r),s(this.settingsButton,r),s(r,t),t}async updateDefaultModel(){this.defaultAiButton.removeEventListener("click",this.defaultAiButtonHandler);const t=await m("defaultModel");switch(t){case"gpt":{this.defaultAiButton.innerHTML=y;break}case"claude":{this.defaultAiButton.innerHTML=M;break}case"gemini":{this.defaultAiButton.innerHTML=b;break}case"mistral":{this.defaultAiButton.innerHTML=q;break}case"grok":{this.defaultAiButton.innerHTML=k;break}}this.defaultAiButtonHandler=()=>this.summarize(t),this.defaultAiButton.addEventListener("click",this.defaultAiButtonHandler)}widgetClicked(t){this.content.contains(t.target)||this.jumpToTimeButton.contains(t.target)||this.copyButton.contains(t.target)||this.defaultAiButton.contains(t.target)||this.aiButton.contains(t.target)||this.settingsButton.contains(t.target)||this.widgetClickedInner()}widgetClickedInner(){this.collapsed=!this.collapsed,this.collapsed?(this.element.classList.add("qt-collapsed"),this.content.remove()):(this.element.classList.remove("qt-collapsed"),this.loadContent())}jumpToTime(){if(this.collapsed||this.transcript.length==0)return;const t=D();let n=0;for(let a=0;a<this.transcript.length;a++){const c=this.transcript[a],l=this.transcript[a+1];if(c.timestamp<=t&&t<=((l==null?void 0:l.timestamp)||c.timestamp)){n=a;break}}const e=this.content.querySelectorAll(".qt-transcript-segment")[n],r=this.content.querySelector(".qt-transcript-container");!e||!r||r.scrollTo({top:e.offsetTop,behavior:"smooth"})}async copyTrancript(){if(this.collapsed||this.transcript.length==0)return;const t=await m("copyFormat"),n=this.transcript.map(e=>{const r=S(e.timestamp);return t=="markdown"?`- [${r}](https://www.youtube.com/watch?v=${T()}&t=${e.timestamp}s) ${e.text}`:`(${r}) ${e.text}`}).join(`
`);await navigator.clipboard.writeText(n)}dropdownAiOptions(t){const n=this.aiButton.querySelectorAll(".qt-dropdown-option");for(const h of n)if(h.contains(t.target))return;if(this.aiOptionsCollapsed=!this.aiOptionsCollapsed,this.aiOptionsCollapsed){this.aiButton.className="qt-icon",n.forEach(h=>h.remove());return}this.aiButton.classList.add("qt-icon-dropdown");const e=o("button","qt-icon qt-dropdown-option",y),r=o("button","qt-icon qt-dropdown-option",M),a=o("button","qt-icon qt-dropdown-option",b),c=o("button","qt-icon qt-dropdown-option",q),l=o("button","qt-icon qt-dropdown-option",k);s(e,this.aiButton),s(r,this.aiButton),s(a,this.aiButton),s(c,this.aiButton),s(l,this.aiButton),e.addEventListener("click",()=>this.summarize("gpt")),r.addEventListener("click",()=>this.summarize("claude")),a.addEventListener("click",()=>this.summarize("gemini")),c.addEventListener("click",()=>this.summarize("mistral")),l.addEventListener("click",()=>this.summarize("grok"))}async summarize(t){if(this.transcript.length==0){for(const e of this.languages)if(navigator.languages.includes(e.code)){this.transcript=await v(e.url);break}}if(this.transcript.length==0){const e=this.languages.find(r=>r.code=="en");if(e)this.transcript=await v(e.url);else{if(this.languages.length==0){this.collapsed&&this.widgetClickedInner(),alert("Sorry! No captions available for this video.");return}this.transcript=await v(this.languages[0].url)}}const n=this.transcript.map(e=>e.text).join(" ");switch(await chrome.storage.local.set({prompt:{title:`${this.creator}: ${this.title}`,text:n}}),t){case"gpt":{const e=await m("gptVersion"),a=await m("temporaryChat")?"&temporary-chat=true":"";open(`https://chatgpt.com/?model=${e}${a}&quicktube`);break}case"claude":{open("https://claude.ai/chats?quicktube");break}case"gemini":{open("https://gemini.google.com/app?quicktube");break}case"mistral":{open("https://chat.mistral.ai/chat?quicktube");break}case"grok":{open("https://grok.com/?quicktube");break}}I("summarize",{model:t,widget:"yt",page:window.location.href})}openSettings(){chrome.runtime.sendMessage({id:"open-settings"})}async loadContent(){if(this.content=o("div","qt-content"),s(this.content,this.element),s(o("hr"),this.content),this.languages.length==0){const n=o("span","qt-error","No captions available for this video");s(n,this.content);return}const t=o("div","qt-language-row");t.addEventListener("wheel",n=>{n.preventDefault(),t.scrollLeft+=n.deltaY+n.deltaX});for(const n of this.languages){const e=o("button","qt-language",n.name);e.setAttribute("data-language-name",n.name),e.addEventListener("click",()=>this.selectLanguage(n)),s(e,t)}s(t,this.content),await this.selectDefaultLanguage()}async selectDefaultLanguage(){for(const n of this.languages)if(navigator.languages.includes(n.code)){await this.selectLanguage(n);return}const t=this.languages.find(n=>n.code=="en");t?await this.selectLanguage(t):await this.selectLanguage(this.languages[0])}async selectLanguage(t){var n;for(const e of this.content.querySelectorAll(".qt-language")||[])e.classList.remove("qt-selected");(n=this.content.querySelector(`[data-language-name="${t.name}"`))==null||n.classList.add("qt-selected"),await this.loadTranscript(t)}async loadTranscript(t){var r,a,c;(r=this.content.querySelector(".qt-transcript-container"))==null||r.remove(),(a=this.content.querySelector(".qt-spinner"))==null||a.remove(),(c=this.content.querySelector(".qt-error"))==null||c.remove();const n=o("div","qt-transcript-container"),e=o("div","qt-spinner");s(e,this.content);try{this.transcript=await v(t.url)}catch{e.remove();const h=o("span","qt-error","Failed to load transcript");s(h,this.content);return}for(const l of this.transcript){const h=o("div","qt-transcript-segment"),L=o("a","qt-timestamp",S(l.timestamp));L.href="#",L.addEventListener("click",C=>{C.preventDefault(),F(l.timestamp)});const x=o("p","qt-transcript-text",l.text);s(L,h),s(x,h),s(h,n)}e.remove(),s(n,this.content)}}let w=[];O(),_(),new MutationObserver(P).observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("yt-navigate-finish",i=>$(i));function _(){for(const i of document.querySelectorAll("script")){const t=i.innerText;if(t.includes("ytInitialPlayerResponse =")){try{const n=JSON.parse(t.split("ytInitialPlayerResponse =")[1].split(";var meta")[0].trim());Z(n)}catch(n){console.error("Error parsing initial response: "+n)}break}}}function $(i){var t,n;if(!location.pathname.includes("watch")){for(const e of w)e.remove();w=[];return}if((n=(t=i.detail)==null?void 0:t.response)!=null&&n.playerResponse){Z(i.detail.response.playerResponse);for(const e of w)e.reload()}}function O(){s(o("style","",u),document.head)}function P(){if(!location.pathname.includes("watch"))return;const i=document.querySelectorAll("#secondary");for(const t of i){let n=!1;for(const r of w)if(t.contains(r.element)){n=!0;break}if(n)continue;const e=new j;s(e.element,t,"before"),w.push(e)}}})();
</file>
</project_files>
</context>