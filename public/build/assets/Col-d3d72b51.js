import{u as d,r as $,a as N,b as v}from"./ThemeProvider-cdff11a8.js";import{r as C,a as B}from"./app-d167c708.js";var y=/-(.)/g;function x(e){return e.replace(y,function(s,o){return o.toUpperCase()})}const g=e=>e[0].toUpperCase()+x(e).slice(1);function R(e,{displayName:s=g(e),Component:o,defaultProps:t}={}){const r=C.forwardRef(({className:p,bsPrefix:a,as:u=o||"div",...c},l)=>{const n={...t,...c},f=d(a,e);return B(u,{ref:l,className:$(p,f),...n})});return r.displayName=s,r}function j({as:e,bsPrefix:s,className:o,...t}){s=d(s,"col");const r=N(),p=v(),a=[],u=[];return r.forEach(c=>{const l=t[c];delete t[c];let n,f,m;typeof l=="object"&&l!=null?{span:n,offset:f,order:m}=l:n=l;const i=c!==p?`-${c}`:"";n&&a.push(n===!0?`${s}${i}`:`${s}${i}-${n}`),m!=null&&u.push(`order${i}-${m}`),f!=null&&u.push(`offset${i}-${f}`)}),[{...t,className:$(o,...a,...u)},{as:e,bsPrefix:s,spans:a}]}const h=C.forwardRef((e,s)=>{const[{className:o,...t},{as:r="div",bsPrefix:p,spans:a}]=j(e);return B(r,{...t,ref:s,className:$(o,!a.length&&p)})});h.displayName="Col";const U=h;export{U as C,R as c};
