(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[185],{9018:function(e,t,n){Promise.resolve().then(n.bind(n,8341))},8341:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return D}});var o,i=n(7437),r=n(2265),a=n(5035),s=n(3621),l=n(6621),c=n(6721),d=n(1504),u=n(6248),h=n(3890),p=n(1396),m=n.n(p),f=n(6468),b=n(3397),g=n(6250),x=n(4033),y=n(3806);function k(){let{colorMode:e,toggleColorMode:t}=(0,a.If)(),{onToggle:n}=(0,r.useContext)(g.rf),o=(0,x.usePathname)();return(0,i.jsx)(s.xu,{bg:(0,a.ff)("gray.100","gray.900"),px:4,children:(0,i.jsxs)(l.k,{h:16,alignItems:"center",justifyContent:"space-between",children:[(0,i.jsxs)(c.K,{direction:"row",spacing:3,children:[(0,i.jsx)(d.z,{onClick:n,display:o===y.Z.GENERATOR?{xl:"none"}:"none",children:(0,i.jsx)(u.J,{as:f.pLT,boxSize:6})}),(0,i.jsx)(h.r,{href:y.Z.HOME,as:m(),fontFamily:"mono",children:(0,i.jsx)(d.z,{fontSize:"xl",as:"span",children:"[TTG]"})})]}),(0,i.jsx)(l.k,{alignItems:"center",children:(0,i.jsxs)(c.K,{direction:"row",spacing:3,children:[(0,i.jsx)(d.z,{onClick:t,children:"light"===e?(0,i.jsx)(u.J,{as:f.tjP,boxSize:6}):(0,i.jsx)(u.J,{as:f.LxM,boxSize:6})}),(0,i.jsx)(h.r,{href:b.Kd,target:"_blank",children:(0,i.jsx)(d.z,{children:(0,i.jsx)(u.J,{as:f.JOq,boxSize:6})})})]})})]})})}var v=n(6335),w=null!=(o=v.Z.default)?o:v.Z,j=n(5673);function T({children:e,...t}){return(0,i.jsx)(j.C,{value:function(e){let t=(0,r.useMemo)(()=>{let t=w({key:"css",prepend:!0,...e});return t.compat=!0,t},[e]);return(0,x.useServerInsertedHTML)(()=>(0,r.createElement)("style",{key:t.key,"data-emotion":`${t.key} ${Object.keys(t.inserted).join(" ")}`,dangerouslySetInnerHTML:{__html:Object.values(t.inserted).join(" ")}})),t}(t),children:e})}var z="undefined"!=typeof window&&window.document&&window.document.createElement?r.useLayoutEffect:r.useEffect;function $(e,t=[]){let n=(0,r.useRef)(e);return z(()=>{n.current=e}),(0,r.useCallback)((...e)=>{var t;return null==(t=n.current)?void 0:t.call(n,...e)},t)}var C=n(9546),S=n(9538),M=String.raw,E=M`
  :root,
  :host {
    --chakra-vh: 100vh;
  }

  @supports (height: -webkit-fill-available) {
    :root,
    :host {
      --chakra-vh: -webkit-fill-available;
    }
  }

  @supports (height: -moz-fill-available) {
    :root,
    :host {
      --chakra-vh: -moz-fill-available;
    }
  }

  @supports (height: 100dvh) {
    :root,
    :host {
      --chakra-vh: 100dvh;
    }
  }
`,O=()=>(0,i.jsx)(S.xB,{styles:E}),G=({scope:e=""})=>(0,i.jsx)(S.xB,{styles:M`
      html {
        line-height: 1.5;
        -webkit-text-size-adjust: 100%;
        font-family: system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
        -moz-osx-font-smoothing: grayscale;
        touch-action: manipulation;
      }

      body {
        position: relative;
        min-height: 100%;
        margin: 0;
        font-feature-settings: "kern";
      }

      ${e} :where(*, *::before, *::after) {
        border-width: 0;
        border-style: solid;
        box-sizing: border-box;
        word-wrap: break-word;
      }

      main {
        display: block;
      }

      ${e} hr {
        border-top-width: 1px;
        box-sizing: content-box;
        height: 0;
        overflow: visible;
      }

      ${e} :where(pre, code, kbd,samp) {
        font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 1em;
      }

      ${e} a {
        background-color: transparent;
        color: inherit;
        text-decoration: inherit;
      }

      ${e} abbr[title] {
        border-bottom: none;
        text-decoration: underline;
        -webkit-text-decoration: underline dotted;
        text-decoration: underline dotted;
      }

      ${e} :where(b, strong) {
        font-weight: bold;
      }

      ${e} small {
        font-size: 80%;
      }

      ${e} :where(sub,sup) {
        font-size: 75%;
        line-height: 0;
        position: relative;
        vertical-align: baseline;
      }

      ${e} sub {
        bottom: -0.25em;
      }

      ${e} sup {
        top: -0.5em;
      }

      ${e} img {
        border-style: none;
      }

      ${e} :where(button, input, optgroup, select, textarea) {
        font-family: inherit;
        font-size: 100%;
        line-height: 1.15;
        margin: 0;
      }

      ${e} :where(button, input) {
        overflow: visible;
      }

      ${e} :where(button, select) {
        text-transform: none;
      }

      ${e} :where(
          button::-moz-focus-inner,
          [type="button"]::-moz-focus-inner,
          [type="reset"]::-moz-focus-inner,
          [type="submit"]::-moz-focus-inner
        ) {
        border-style: none;
        padding: 0;
      }

      ${e} fieldset {
        padding: 0.35em 0.75em 0.625em;
      }

      ${e} legend {
        box-sizing: border-box;
        color: inherit;
        display: table;
        max-width: 100%;
        padding: 0;
        white-space: normal;
      }

      ${e} progress {
        vertical-align: baseline;
      }

      ${e} textarea {
        overflow: auto;
      }

      ${e} :where([type="checkbox"], [type="radio"]) {
        box-sizing: border-box;
        padding: 0;
      }

      ${e} input[type="number"]::-webkit-inner-spin-button,
      ${e} input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none !important;
      }

      ${e} input[type="number"] {
        -moz-appearance: textfield;
      }

      ${e} input[type="search"] {
        -webkit-appearance: textfield;
        outline-offset: -2px;
      }

      ${e} input[type="search"]::-webkit-search-decoration {
        -webkit-appearance: none !important;
      }

      ${e} ::-webkit-file-upload-button {
        -webkit-appearance: button;
        font: inherit;
      }

      ${e} details {
        display: block;
      }

      ${e} summary {
        display: list-item;
      }

      template {
        display: none;
      }

      [hidden] {
        display: none !important;
      }

      ${e} :where(
          blockquote,
          dl,
          dd,
          h1,
          h2,
          h3,
          h4,
          h5,
          h6,
          hr,
          figure,
          p,
          pre
        ) {
        margin: 0;
      }

      ${e} button {
        background: transparent;
        padding: 0;
      }

      ${e} fieldset {
        margin: 0;
        padding: 0;
      }

      ${e} :where(ol, ul) {
        margin: 0;
        padding: 0;
      }

      ${e} textarea {
        resize: vertical;
      }

      ${e} :where(button, [role="button"]) {
        cursor: pointer;
      }

      ${e} button::-moz-focus-inner {
        border: 0 !important;
      }

      ${e} table {
        border-collapse: collapse;
      }

      ${e} :where(h1, h2, h3, h4, h5, h6) {
        font-size: inherit;
        font-weight: inherit;
      }

      ${e} :where(button, input, optgroup, select, textarea) {
        padding: 0;
        line-height: inherit;
        color: inherit;
      }

      ${e} :where(img, svg, video, canvas, audio, iframe, embed, object) {
        display: block;
      }

      ${e} :where(img, video) {
        max-width: 100%;
        height: auto;
      }

      [data-js-focus-visible]
        :focus:not([data-focus-visible-added]):not(
          [data-focus-visible-disabled]
        ) {
        outline: none;
        box-shadow: none;
      }

      ${e} select::-ms-expand {
        display: none;
      }

      ${E}
    `}),L=n(9782),U=n(4844),I={light:"chakra-ui-light",dark:"chakra-ui-dark"},N="chakra-ui-color-mode",_={ssr:!1,type:"localStorage",get(e){let t;if(!(null==globalThis?void 0:globalThis.document))return e;try{t=localStorage.getItem(N)||e}catch(e){}return t||e},set(e){try{localStorage.setItem(N,e)}catch(e){}}},B=n(7673),P=()=>{};function q(e,t){return"cookie"===e.type&&e.ssr?e.get(t):t}function J(e){let{value:t,children:n,options:{useSystemColorMode:o,initialColorMode:s,disableTransitionOnChange:l}={},colorModeManager:c=_}=e,d="dark"===s?"dark":"light",[u,h]=(0,r.useState)(()=>q(c,d)),[p,m]=(0,r.useState)(()=>q(c)),{getSystemTheme:f,setClassName:b,setDataset:g,addListener:x}=(0,r.useMemo)(()=>(function(e={}){let{preventTransition:t=!0}=e,n={setDataset:e=>{let o=t?n.preventTransition():void 0;document.documentElement.dataset.theme=e,document.documentElement.style.colorScheme=e,null==o||o()},setClassName(e){document.body.classList.add(e?I.dark:I.light),document.body.classList.remove(e?I.light:I.dark)},query:()=>window.matchMedia("(prefers-color-scheme: dark)"),getSystemTheme(e){var t;let o=null!=(t=n.query().matches)?t:"dark"===e;return o?"dark":"light"},addListener(e){let t=n.query(),o=t=>{e(t.matches?"dark":"light")};return"function"==typeof t.addListener?t.addListener(o):t.addEventListener("change",o),()=>{"function"==typeof t.removeListener?t.removeListener(o):t.removeEventListener("change",o)}},preventTransition(){let e=document.createElement("style");return e.appendChild(document.createTextNode("*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),document.head.appendChild(e),()=>{window.getComputedStyle(document.body),requestAnimationFrame(()=>{requestAnimationFrame(()=>{document.head.removeChild(e)})})}}};return n})({preventTransition:l}),[l]),y="system"!==s||u?u:p,k=(0,r.useCallback)(e=>{let t="system"===e?f():e;h(t),b("dark"===t),g(t),c.set(t)},[c,f,b,g]);(0,B.G)(()=>{"system"===s&&m(f())},[]),(0,r.useEffect)(()=>{let e=c.get();if(e){k(e);return}if("system"===s){k("system");return}k(d)},[c,d,s,k]);let v=(0,r.useCallback)(()=>{k("dark"===y?"light":"dark")},[y,k]);(0,r.useEffect)(()=>{if(o)return x(k)},[o,x,k]);let w=(0,r.useMemo)(()=>({colorMode:null!=t?t:y,toggleColorMode:t?P:v,setColorMode:t?P:k,forced:void 0!==t}),[y,v,k,t]);return(0,i.jsx)(a.kc.Provider,{value:w,children:n})}J.displayName="ColorModeProvider";var R=n(2733),A=e=>{let{children:t,colorModeManager:n,portalZIndex:o,resetScope:r,resetCSS:a=!0,theme:s={},environment:l,cssVarsRoot:c,disableEnvironment:d,disableGlobalStyle:u}=e,h=(0,i.jsx)(R.u,{environment:l,disabled:d,children:t});return(0,i.jsx)(U.f6,{theme:s,cssVarsRoot:c,children:(0,i.jsxs)(J,{colorModeManager:n,options:s.config,children:[a?(0,i.jsx)(G,{scope:r}):(0,i.jsx)(O,{}),!u&&(0,i.jsx)(U.ZL,{}),o?(0,i.jsx)(L.h,{zIndex:o,children:h}):h]})})},F=n(7400),H=n(9491),Z=e=>function({children:t,theme:n=e,toastOptions:o,...r}){return(0,i.jsxs)(A,{theme:n,...r,children:[(0,i.jsx)(H.Qi,{value:null==o?void 0:o.defaultOptions,children:t}),(0,i.jsx)(H.VW,{...o})]})},K=Z(F.rS);function V(e){let{children:t}=e,n=function(e={}){let{onClose:t,onOpen:n,isOpen:o,id:i}=e,a=$(n),s=$(t),[l,c]=(0,r.useState)(e.defaultIsOpen||!1),[d,u]=function(e,t){let n=void 0!==e;return[n,n&&void 0!==e?e:t]}(o,l),h=function(e,t){let n=(0,r.useId)();return(0,r.useMemo)(()=>e||[t,n].filter(Boolean).join("-"),[e,t,n])}(i,"disclosure"),p=(0,r.useCallback)(()=>{d||c(!1),null==s||s()},[d,s]),m=(0,r.useCallback)(()=>{d||c(!0),null==a||a()},[d,a]),f=(0,r.useCallback)(()=>{let e=u?p:m;e()},[u,m,p]);return{isOpen:!!u,onOpen:m,onClose:p,onToggle:f,isControlled:d,getButtonProps:(e={})=>({...e,"aria-expanded":u,"aria-controls":h,onClick:(0,C.v0)(e.onClick,f)}),getDisclosureProps:(e={})=>({...e,hidden:!u,id:h})}}();return(0,i.jsx)(T,{children:(0,i.jsx)(K,{theme:g.rS,children:(0,i.jsx)(g.rf.Provider,{value:n,children:t})})})}function D(e){let{children:t}=e;return(0,i.jsxs)("html",{lang:"cs",children:[(0,i.jsxs)("head",{children:[(0,i.jsx)("meta",{charSet:"utf-8"}),(0,i.jsx)("meta",{name:"viewport",content:"viewport-fit=cover, width=device-width, height=device-height, initial-scale=1.0"}),(0,i.jsx)("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),(0,i.jsx)("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"}),(0,i.jsx)("link",{href:"https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;400;700;800&family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300;1,400;1,600;1,700;1,800&display=swap",rel:"stylesheet"}),(0,i.jsx)("title",{children:"Vytvoř si rozvrh | TTG"}),(0,i.jsx)("meta",{name:"description",content:"Najdi svůj optim\xe1ln\xed rozvrh bez složit\xe9ho hled\xe1n\xed vhodn\xfdch paralelek, předn\xe1šek, cvičen\xed a předmětů."}),(0,i.jsx)("link",{rel:"canonical",href:"https://antoninkriz.github.io/CTU-TimeTable-Generator/"}),(0,i.jsx)("link",{rel:"apple-touch-icon",sizes:"180x180",href:"/CTU-TimeTable-Generator/apple-touch-icon.png"}),(0,i.jsx)("link",{rel:"icon",type:"image/png",sizes:"512x512",href:"/CTU-TimeTable-Generator/favicon-512x512.png"}),(0,i.jsx)("link",{rel:"icon",type:"image/png",sizes:"32x32",href:"/CTU-TimeTable-Generator/favicon-32x32.png"}),(0,i.jsx)("link",{rel:"icon",type:"image/png",sizes:"16x16",href:"/CTU-TimeTable-Generator/favicon-16x16.png"}),(0,i.jsx)("link",{rel:"manifest",href:"/CTU-TimeTable-Generator/site.webmanifest"}),(0,i.jsx)("link",{rel:"mask-icon",href:"/CTU-TimeTable-Generator/safari-pinned-tab.svg",color:"#000000"}),(0,i.jsx)("meta",{name:"twitter:card",content:"summary"}),(0,i.jsx)("meta",{property:"og:title",content:"Vytvoř si rozvrh | TTG"}),(0,i.jsx)("meta",{property:"og:description",content:"Najdi svůj optim\xe1ln\xed rozvrh bez složit\xe9ho hled\xe1n\xed vhodn\xfdch paralelek, předn\xe1šek, cvičen\xed a předmětů."}),(0,i.jsx)("meta",{property:"og:url",content:"https://antoninkriz.github.io/CTU-TimeTable-Generator/"}),(0,i.jsx)("meta",{property:"og:type",content:"website"}),(0,i.jsx)("meta",{property:"og:image",content:`${b._n}/CTU-TimeTable-Generator/favicon-512x512.png`}),(0,i.jsx)("meta",{property:"og:image:alt",content:"Logo for CTU TimeTable Generator"}),(0,i.jsx)("meta",{property:"og:image:width",content:"512"}),(0,i.jsx)("meta",{property:"og:image:height",content:"512"}),(0,i.jsx)("meta",{property:"og:locale",content:"cz_CS"})]}),(0,i.jsx)(l.k,{as:"body",direction:"column",minH:"100dvh",children:(0,i.jsxs)(V,{children:[(0,i.jsx)(k,{}),(0,i.jsx)(l.k,{as:"main",direction:"row",w:"full",flex:"1",children:t})]})})]})}Z(F.wE)},3397:function(e,t,n){"use strict";n.d(t,{Kd:function(){return i},NK:function(){return r},_n:function(){return o},ow:function(){return a}});let o="https://antoninkriz.github.io/CTU-TimeTable-Generator",i="https://github.com/antoninkriz/CTU-TimeTable-Generator",r="https://www.antoninkriz.eu",a="https://raw.githubusercontent.com/antoninkriz/CTU-TimeTable-Generator/data/data.json"},6250:function(e,t,n){"use strict";n.d(t,{rS:function(){return a},rf:function(){return s}});var o=n(2265),i=n(9624);let r='-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',a=(0,i.B1)({colors:{},fonts:{heading:`"Open Sans",${r}`,body:`"Open Sans",${r}`,mono:'"JetBrains Mono",SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace'}}),s=(0,o.createContext)({isOpen:!1,onOpen:()=>{},onClose:()=>{},onToggle:()=>{}})},3806:function(e,t){"use strict";var n,o;(o=n||(n={})).HOME="/",o.GENERATOR="/generator",t.Z=n},4033:function(e,t,n){e.exports=n(8165)}},function(e){e.O(0,[190,263,127,971,596,744],function(){return e(e.s=9018)}),_N_E=e.O()}]);
//# sourceMappingURL=layout-37190c65d8c02bd4.js.map