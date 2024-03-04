import{r as l,f as y}from"./app-21e62153.js";var Te=Object.defineProperty,Fe=(e,t,n)=>t in e?Te(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,X=(e,t,n)=>(Fe(e,typeof t!="symbol"?t+"":t,n),n);let we=class{constructor(){X(this,"current",this.detect()),X(this,"handoffState","pending"),X(this,"currentId",0)}set(t){this.current!==t&&(this.handoffState="pending",this.currentId=0,this.current=t)}reset(){this.set(this.detect())}nextId(){return++this.currentId}get isServer(){return this.current==="server"}get isClient(){return this.current==="client"}detect(){return typeof window>"u"||typeof document>"u"?"server":"client"}handoff(){this.handoffState==="pending"&&(this.handoffState="complete")}get isHandoffComplete(){return this.handoffState==="complete"}},A=new we,D=(e,t)=>{A.isServer?l.useEffect(e,t):l.useLayoutEffect(e,t)};function N(e){let t=l.useRef(e);return D(()=>{t.current=e},[e]),t}function Ce(e){typeof queueMicrotask=="function"?queueMicrotask(e):Promise.resolve().then(e).catch(t=>setTimeout(()=>{throw t}))}function R(){let e=[],t={addEventListener(n,r,i,f){return n.addEventListener(r,i,f),t.add(()=>n.removeEventListener(r,i,f))},requestAnimationFrame(...n){let r=requestAnimationFrame(...n);return t.add(()=>cancelAnimationFrame(r))},nextFrame(...n){return t.requestAnimationFrame(()=>t.requestAnimationFrame(...n))},setTimeout(...n){let r=setTimeout(...n);return t.add(()=>clearTimeout(r))},microTask(...n){let r={current:!0};return Ce(()=>{r.current&&n[0]()}),t.add(()=>{r.current=!1})},style(n,r,i){let f=n.style.getPropertyValue(r);return Object.assign(n.style,{[r]:i}),this.add(()=>{Object.assign(n.style,{[r]:f})})},group(n){let r=R();return n(r),this.add(()=>r.dispose())},add(n){return e.push(n),()=>{let r=e.indexOf(n);if(r>=0)for(let i of e.splice(r,1))i()}},dispose(){for(let n of e.splice(0))n()}};return t}function le(){let[e]=l.useState(R);return l.useEffect(()=>()=>e.dispose(),[e]),e}let $=function(e){let t=N(e);return y.useCallback((...n)=>t.current(...n),[t])};function ae(){let[e,t]=l.useState(A.isHandoffComplete);return e&&A.isHandoffComplete===!1&&t(!1),l.useEffect(()=>{e!==!0&&t(!0)},[e]),l.useEffect(()=>A.handoff(),[]),e}function E(e,t,...n){if(e in t){let i=t[e];return typeof i=="function"?i(...n):i}let r=new Error(`Tried to handle "${e}" but there is no handler defined. Only defined handlers are: ${Object.keys(t).map(i=>`"${i}"`).join(", ")}.`);throw Error.captureStackTrace&&Error.captureStackTrace(r,E),r}let se=Symbol();function Ge(e,t=!0){return Object.assign(e,{[se]:t})}function oe(...e){let t=l.useRef(e);l.useEffect(()=>{t.current=e},[e]);let n=$(r=>{for(let i of t.current)i!=null&&(typeof i=="function"?i(r):i.current=r)});return e.every(r=>r==null||(r==null?void 0:r[se]))?void 0:n}function K(...e){return e.filter(Boolean).join(" ")}var ue=(e=>(e[e.None=0]="None",e[e.RenderStrategy=1]="RenderStrategy",e[e.Static=2]="Static",e))(ue||{}),w=(e=>(e[e.Unmount=0]="Unmount",e[e.Hidden=1]="Hidden",e))(w||{});function ce({ourProps:e,theirProps:t,slot:n,defaultTag:r,features:i,visible:f=!0,name:d}){let o=fe(t,e);if(f)return H(o,n,r,d);let u=i??0;if(u&2){let{static:s=!1,...c}=o;if(s)return H(c,n,r,d)}if(u&1){let{unmount:s=!0,...c}=o;return E(s?0:1,{[0](){return null},[1](){return H({...c,hidden:!0,style:{display:"none"}},n,r,d)}})}return H(o,n,r,d)}function H(e,t={},n,r){let{as:i=n,children:f,refName:d="ref",...o}=Y(e,["unmount","static"]),u=e.ref!==void 0?{[d]:e.ref}:{},s=typeof f=="function"?f(t):f;"className"in o&&o.className&&typeof o.className=="function"&&(o.className=o.className(t));let c={};if(t){let p=!1,v=[];for(let[h,a]of Object.entries(t))typeof a=="boolean"&&(p=!0),a===!0&&v.push(h);p&&(c["data-headlessui-state"]=v.join(" "))}if(i===l.Fragment&&Object.keys(re(o)).length>0){if(!l.isValidElement(s)||Array.isArray(s)&&s.length>1)throw new Error(['Passing props on "Fragment"!',"",`The current component <${r} /> is rendering a "Fragment".`,"However we need to passthrough the following props:",Object.keys(o).map(a=>`  - ${a}`).join(`
`),"","You can apply a few solutions:",['Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".',"Render a single element as the child so that we can forward the props onto that element."].map(a=>`  - ${a}`).join(`
`)].join(`
`));let p=s.props,v=typeof(p==null?void 0:p.className)=="function"?(...a)=>K(p==null?void 0:p.className(...a),o.className):K(p==null?void 0:p.className,o.className),h=v?{className:v}:{};return l.cloneElement(s,Object.assign({},fe(s.props,re(Y(o,["ref"]))),c,u,Se(s.ref,u.ref),h))}return l.createElement(i,Object.assign({},Y(o,["ref"]),i!==l.Fragment&&u,i!==l.Fragment&&c),s)}function Se(...e){return{ref:e.every(t=>t==null)?void 0:t=>{for(let n of e)n!=null&&(typeof n=="function"?n(t):n.current=t)}}}function fe(...e){if(e.length===0)return{};if(e.length===1)return e[0];let t={},n={};for(let r of e)for(let i in r)i.startsWith("on")&&typeof r[i]=="function"?(n[i]!=null||(n[i]=[]),n[i].push(r[i])):t[i]=r[i];if(t.disabled||t["aria-disabled"])return Object.assign(t,Object.fromEntries(Object.keys(n).map(r=>[r,void 0])));for(let r in n)Object.assign(t,{[r](i,...f){let d=n[r];for(let o of d){if((i instanceof Event||(i==null?void 0:i.nativeEvent)instanceof Event)&&i.defaultPrevented)return;o(i,...f)}}});return t}function Z(e){var t;return Object.assign(l.forwardRef(e),{displayName:(t=e.displayName)!=null?t:e.name})}function re(e){let t=Object.assign({},e);for(let n in t)t[n]===void 0&&delete t[n];return t}function Y(e,t=[]){let n=Object.assign({},e);for(let r of t)r in n&&delete n[r];return n}let ee=l.createContext(null);ee.displayName="OpenClosedContext";var F=(e=>(e[e.Open=1]="Open",e[e.Closed=2]="Closed",e[e.Closing=4]="Closing",e[e.Opening=8]="Opening",e))(F||{});function de(){return l.useContext(ee)}function Oe({value:e,children:t}){return y.createElement(ee.Provider,{value:e},t)}function te(){let e=l.useRef(!1);return D(()=>(e.current=!0,()=>{e.current=!1}),[]),e}function $e(e=0){let[t,n]=l.useState(e),r=te(),i=l.useCallback(u=>{r.current&&n(s=>s|u)},[t,r]),f=l.useCallback(u=>!!(t&u),[t]),d=l.useCallback(u=>{r.current&&n(s=>s&~u)},[n,r]),o=l.useCallback(u=>{r.current&&n(s=>s^u)},[n]);return{flags:t,addFlag:i,hasFlag:f,removeFlag:d,toggleFlag:o}}function Ne(e){let t={called:!1};return(...n)=>{if(!t.called)return t.called=!0,e(...n)}}function _(e,...t){e&&t.length>0&&e.classList.add(...t)}function J(e,...t){e&&t.length>0&&e.classList.remove(...t)}function je(e,t){let n=R();if(!e)return n.dispose;let{transitionDuration:r,transitionDelay:i}=getComputedStyle(e),[f,d]=[r,i].map(u=>{let[s=0]=u.split(",").filter(Boolean).map(c=>c.includes("ms")?parseFloat(c):parseFloat(c)*1e3).sort((c,p)=>p-c);return s}),o=f+d;if(o!==0){n.group(s=>{s.setTimeout(()=>{t(),s.dispose()},o),s.addEventListener(e,"transitionrun",c=>{c.target===c.currentTarget&&s.dispose()})});let u=n.addEventListener(e,"transitionend",s=>{s.target===s.currentTarget&&(t(),u())})}else t();return n.add(()=>t()),n.dispose}function Re(e,t,n,r){let i=n?"enter":"leave",f=R(),d=r!==void 0?Ne(r):()=>{};i==="enter"&&(e.removeAttribute("hidden"),e.style.display="");let o=E(i,{enter:()=>t.enter,leave:()=>t.leave}),u=E(i,{enter:()=>t.enterTo,leave:()=>t.leaveTo}),s=E(i,{enter:()=>t.enterFrom,leave:()=>t.leaveFrom});return J(e,...t.enter,...t.enterTo,...t.enterFrom,...t.leave,...t.leaveFrom,...t.leaveTo,...t.entered),_(e,...o,...s),f.nextFrame(()=>{J(e,...s),_(e,...u),je(e,()=>(J(e,...o),_(e,...t.entered),d()))}),f.dispose}function xe({container:e,direction:t,classes:n,onStart:r,onStop:i}){let f=te(),d=le(),o=N(t);D(()=>{let u=R();d.add(u.dispose);let s=e.current;if(s&&o.current!=="idle"&&f.current)return u.dispose(),r.current(o.current),u.add(Re(s,n.current,o.current==="enter",()=>{u.dispose(),i.current(o.current)})),u.dispose},[t])}function O(e=""){return e.split(" ").filter(t=>t.trim().length>1)}let q=l.createContext(null);q.displayName="TransitionContext";var Pe=(e=>(e.Visible="visible",e.Hidden="hidden",e))(Pe||{});function Le(){let e=l.useContext(q);if(e===null)throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");return e}function ke(){let e=l.useContext(I);if(e===null)throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");return e}let I=l.createContext(null);I.displayName="NestingContext";function M(e){return"children"in e?M(e.children):e.current.filter(({el:t})=>t.current!==null).filter(({state:t})=>t==="visible").length>0}function me(e,t){let n=N(e),r=l.useRef([]),i=te(),f=le(),d=$((h,a=w.Hidden)=>{let g=r.current.findIndex(({el:m})=>m===h);g!==-1&&(E(a,{[w.Unmount](){r.current.splice(g,1)},[w.Hidden](){r.current[g].state="hidden"}}),f.microTask(()=>{var m;!M(r)&&i.current&&((m=n.current)==null||m.call(n))}))}),o=$(h=>{let a=r.current.find(({el:g})=>g===h);return a?a.state!=="visible"&&(a.state="visible"):r.current.push({el:h,state:"visible"}),()=>d(h,w.Unmount)}),u=l.useRef([]),s=l.useRef(Promise.resolve()),c=l.useRef({enter:[],leave:[],idle:[]}),p=$((h,a,g)=>{u.current.splice(0),t&&(t.chains.current[a]=t.chains.current[a].filter(([m])=>m!==h)),t==null||t.chains.current[a].push([h,new Promise(m=>{u.current.push(m)})]),t==null||t.chains.current[a].push([h,new Promise(m=>{Promise.all(c.current[a].map(([b,T])=>T)).then(()=>m())})]),a==="enter"?s.current=s.current.then(()=>t==null?void 0:t.wait.current).then(()=>g(a)):g(a)}),v=$((h,a,g)=>{Promise.all(c.current[a].splice(0).map(([m,b])=>b)).then(()=>{var m;(m=u.current.shift())==null||m()}).then(()=>g(a))});return l.useMemo(()=>({children:r,register:o,unregister:d,onStart:p,onStop:v,wait:s,chains:c}),[o,d,r,p,v,c,s])}function He(){}let Ae=["beforeEnter","afterEnter","beforeLeave","afterLeave"];function ie(e){var t;let n={};for(let r of Ae)n[r]=(t=e[r])!=null?t:He;return n}function De(e){let t=l.useRef(ie(e));return l.useEffect(()=>{t.current=ie(e)},[e]),t}let qe="div",pe=ue.RenderStrategy;function Ie(e,t){let{beforeEnter:n,afterEnter:r,beforeLeave:i,afterLeave:f,enter:d,enterFrom:o,enterTo:u,entered:s,leave:c,leaveFrom:p,leaveTo:v,...h}=e,a=l.useRef(null),g=oe(a,t),m=h.unmount?w.Unmount:w.Hidden,{show:b,appear:T,initial:ve}=Le(),[C,U]=l.useState(b?"visible":"hidden"),ne=ke(),{register:x,unregister:P}=ne,B=l.useRef(null);l.useEffect(()=>x(a),[x,a]),l.useEffect(()=>{if(m===w.Hidden&&a.current){if(b&&C!=="visible"){U("visible");return}return E(C,{hidden:()=>P(a),visible:()=>x(a)})}},[C,a,x,P,b,m]);let V=N({enter:O(d),enterFrom:O(o),enterTo:O(u),entered:O(s),leave:O(c),leaveFrom:O(p),leaveTo:O(v)}),L=De({beforeEnter:n,afterEnter:r,beforeLeave:i,afterLeave:f}),z=ae();l.useEffect(()=>{if(z&&C==="visible"&&a.current===null)throw new Error("Did you forget to passthrough the `ref` to the actual DOM node?")},[a,C,z]);let G=ve&&!T,ge=(()=>!z||G||B.current===b?"idle":b?"enter":"leave")(),j=$e(0),be=$(S=>E(S,{enter:()=>{j.addFlag(F.Opening),L.current.beforeEnter()},leave:()=>{j.addFlag(F.Closing),L.current.beforeLeave()},idle:()=>{}})),ye=$(S=>E(S,{enter:()=>{j.removeFlag(F.Opening),L.current.afterEnter()},leave:()=>{j.removeFlag(F.Closing),L.current.afterLeave()},idle:()=>{}})),k=me(()=>{U("hidden"),P(a)},ne);xe({container:a,classes:V,direction:ge,onStart:N(S=>{k.onStart(a,S,be)}),onStop:N(S=>{k.onStop(a,S,ye),S==="leave"&&!M(k)&&(U("hidden"),P(a))})}),l.useEffect(()=>{G&&(m===w.Hidden?B.current=null:B.current=b)},[b,G,C]);let W=h,Ee={ref:g};return T&&b&&(W={...W,className:K(h.className,...V.current.enter,...V.current.enterFrom)}),y.createElement(I.Provider,{value:k},y.createElement(Oe,{value:E(C,{visible:F.Open,hidden:F.Closed})|j.flags},ce({ourProps:Ee,theirProps:W,defaultTag:qe,features:pe,visible:C==="visible",name:"Transition.Child"})))}function Me(e,t){let{show:n,appear:r=!1,unmount:i,...f}=e,d=l.useRef(null),o=oe(d,t);ae();let u=de();if(n===void 0&&u!==null&&(n=(u&F.Open)===F.Open),![!0,!1].includes(n))throw new Error("A <Transition /> is used but it is missing a `show={true | false}` prop.");let[s,c]=l.useState(n?"visible":"hidden"),p=me(()=>{c("hidden")}),[v,h]=l.useState(!0),a=l.useRef([n]);D(()=>{v!==!1&&a.current[a.current.length-1]!==n&&(a.current.push(n),h(!1))},[a,n]);let g=l.useMemo(()=>({show:n,appear:r,initial:v}),[n,r,v]);l.useEffect(()=>{if(n)c("visible");else if(!M(p))c("hidden");else{let b=d.current;if(!b)return;let T=b.getBoundingClientRect();T.x===0&&T.y===0&&T.width===0&&T.height===0&&c("hidden")}},[n,p]);let m={unmount:i};return y.createElement(I.Provider,{value:p},y.createElement(q.Provider,{value:g},ce({ourProps:{...m,as:l.Fragment,children:y.createElement(he,{ref:o,...m,...f})},theirProps:{},defaultTag:l.Fragment,features:pe,visible:s==="visible",name:"Transition"})))}function Ue(e,t){let n=l.useContext(q)!==null,r=de()!==null;return y.createElement(y.Fragment,null,!n&&r?y.createElement(Q,{ref:t,...e}):y.createElement(he,{ref:t,...e}))}let Q=Z(Me),he=Z(Ie),Be=Z(Ue),We=Object.assign(Q,{Child:Be,Root:Q});export{de as C,Z as D,ue as S,Ge as T,ce as X,D as a,N as b,R as c,F as d,We as e,te as f,ae as l,$ as o,le as p,A as s,Ce as t,E as u,oe as y};
