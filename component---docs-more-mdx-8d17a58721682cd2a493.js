(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{"c2/g":function(e,t,n){"use strict";n.r(t),n.d(t,"_frontmatter",(function(){return i})),n.d(t,"default",(function(){return s}));n("5hJT"),n("W1QL"),n("K/PF"),n("t91x"),n("75LO"),n("PJhk");var o=n("SAVP"),a=n("TjRS");n("aD51");function r(){return(r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e}).apply(this,arguments)}var i={};void 0!==i&&i&&i===Object(i)&&Object.isExtensible(i)&&!i.hasOwnProperty("__filemeta")&&Object.defineProperty(i,"__filemeta",{configurable:!0,value:{name:"_frontmatter",filename:"docs/more.mdx"}});var l={_frontmatter:i},c=a.a;function s(e){var t=e.components,n=function(e,t){if(null==e)return{};var n,o,a={},r=Object.keys(e);for(o=0;o<r.length;o++)n=r[o],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,["components"]);return Object(o.b)(c,r({},l,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("h2",{id:"devtool"},"Devtool"),Object(o.b)("p",null,"Debug ",Object(o.b)("inlineCode",{parentName:"p"},"reactive")," store with ",Object(o.b)("a",r({parentName:"p"},{href:"http://extension.remotedev.io/"}),"Redux devtools extension")),Object(o.b)("pre",null,Object(o.b)("code",r({parentName:"pre"},{className:"language-js"}),'import { addReduxDevTool } from "@hadeeb/reactive/enhance";\nconst store = createStore();\n\naddReduxDevTool(store, options);\n')),Object(o.b)("h2",{id:"codesplitting"},"CodeSplitting"),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},"events")," is a plain object. New event handlers can be added at any time"),Object(o.b)("pre",null,Object(o.b)("code",r({parentName:"pre"},{className:"language-js"}),'import StaticModule from "...";\n\nconst events = {\n  Initialize_Module({ state }, payload) {\n    Object.assign(state, payload);\n  }\n};\n\nObject.assign(events, StaticModule.events);\n\nconst initialState = StaticModule.initialState;\n\nconst store = createStore(events, initialState);\n\nfunction addModule(lazyModule) {\n  Object.assign(events, lazyModule.events);\n  store.dispatch("Initialize_Module", lazyModule.initialState);\n}\n')),Object(o.b)("h2",{id:"customizing-store"},"Customizing store"),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},"store.$")," can be used to override how the events are handled."),Object(o.b)("p",null,"Refer : ",Object(o.b)("a",r({parentName:"p"},{href:"https://github.com/hadeeb/reactive/blob/96c9f93b8b4d0cea936bab361b1de8b96b0c07ce/enhance/src/devtool.ts#L44"}),"Redux devtool integration")),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},"store.$")," : (store, event, payload):void"),Object(o.b)("p",null,"eg: Event logger"),Object(o.b)("pre",null,Object(o.b)("code",r({parentName:"pre"},{className:"language-js"}),'const store = createStore();\n\nconst originalHook = store.$;\nstore.$ = function(store, event, payload) {\n  console.log({ event, payload });\n  console.log("Before", store.getState());\n  originalHook(store, event, payload);\n  console.log("After", store.getState());\n};\n')))}s&&s===Object(s)&&Object.isExtensible(s)&&!s.hasOwnProperty("__filemeta")&&Object.defineProperty(s,"__filemeta",{configurable:!0,value:{name:"MDXContent",filename:"docs/more.mdx"}}),s.isMDXComponent=!0}}]);
//# sourceMappingURL=component---docs-more-mdx-8d17a58721682cd2a493.js.map