if(!self.define){let e,s={};const t=(t,i)=>(t=new URL(t+".js",i).href,s[t]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=t,e.onload=s,document.head.appendChild(e)}else e=t,importScripts(t),s()})).then((()=>{let e=s[t];if(!e)throw new Error(`Module ${t} didn’t register its module`);return e})));self.define=(i,n)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(s[c])return;let o={};const r=e=>t(e,c),l={module:{uri:c},exports:o,require:r};s[c]=Promise.all(i.map((e=>l[e]||r(e)))).then((e=>(n(...e),o)))}}define(["./workbox-e1f63b81"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"./index.html",revision:"49088221d3be833c8c493b29e50121c3"},{url:"images/fallback/user.jpg",revision:"074b78a4c5ddef5a0bcaf18f3402e6f9"},{url:"main.css",revision:"be8de3caa5e423c89d24b489801218c9"},{url:"main.js",revision:"6c40388ec7c41498694cb15657823b30"}],{}),e.registerRoute(/\/\?method=allArticles/,new e.NetworkFirst({cacheName:"my-best-cache",networkTimeoutSeconds:10,plugins:[]}),"GET"),e.registerRoute(/^https:\/\/fastly\.picsum\.photos\/.*$/,new e.CacheFirst({cacheName:"external-images",plugins:[new e.ExpirationPlugin({maxEntries:100,maxAgeSeconds:2592e3}),new e.CacheableResponsePlugin({statuses:[0,200]})]}),"GET")}));
