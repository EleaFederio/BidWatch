import{r,a,j as C,F as Q}from"./app-21e62153.js";import{r as i,u as p}from"./ThemeProvider-25793322.js";import{P as y}from"./index-2daebd08.js";import{c as X,C as Y}from"./Col-a6787ee3.js";import{B as Z}from"./Button-3524e064.js";import"./Button-c35f5561.js";function P(e,o){return r.Children.toArray(e).some(t=>r.isValidElement(t)&&t.type===o)}const ee={type:y.string,tooltip:y.bool,as:y.elementType},L=r.forwardRef(({as:e="div",className:o,type:t="valid",tooltip:s=!1,...l},n)=>a(e,{...l,ref:n,className:i(o,`${t}-${s?"tooltip":"feedback"}`)}));L.displayName="Feedback";L.propTypes=ee;const S=L,oe=r.createContext({}),u=oe,j=r.forwardRef(({id:e,bsPrefix:o,className:t,type:s="checkbox",isValid:l=!1,isInvalid:n=!1,as:m="input",...d},f)=>{const{controlId:c}=r.useContext(u);return o=p(o,"form-check-input"),a(m,{...d,ref:f,type:s,id:e||c,className:i(t,o,l&&"is-valid",n&&"is-invalid")})});j.displayName="FormCheckInput";const x=j,O=r.forwardRef(({bsPrefix:e,className:o,htmlFor:t,...s},l)=>{const{controlId:n}=r.useContext(u);return e=p(e,"form-check-label"),a("label",{...s,ref:l,htmlFor:t||n,className:i(o,e)})});O.displayName="FormCheckLabel";const R=O,G=r.forwardRef(({id:e,bsPrefix:o,bsSwitchPrefix:t,inline:s=!1,reverse:l=!1,disabled:n=!1,isValid:m=!1,isInvalid:d=!1,feedbackTooltip:f=!1,feedback:c,feedbackType:h,className:N,style:g,title:k="",type:F="checkbox",label:v,children:w,as:_="input",...q},z)=>{o=p(o,"form-check"),t=p(t,"form-switch");const{controlId:T}=r.useContext(u),H=r.useMemo(()=>({controlId:e||T}),[T,e]),b=!w&&v!=null&&v!==!1||P(w,R),J=a(x,{...q,type:F==="switch"?"checkbox":F,ref:z,isValid:m,isInvalid:d,disabled:n,as:_});return a(u.Provider,{value:H,children:a("div",{style:g,className:i(N,b&&o,s&&`${o}-inline`,l&&`${o}-reverse`,F==="switch"&&t),children:w||C(Q,{children:[J,b&&a(R,{title:k,children:v}),c&&a(S,{type:h,tooltip:f,children:c})]})})})});G.displayName="FormCheck";const $=Object.assign(G,{Input:x,Label:R}),B=r.forwardRef(({bsPrefix:e,type:o,size:t,htmlSize:s,id:l,className:n,isValid:m=!1,isInvalid:d=!1,plaintext:f,readOnly:c,as:h="input",...N},g)=>{const{controlId:k}=r.useContext(u);e=p(e,"form-control");let F;return f?F={[`${e}-plaintext`]:!0}:F={[e]:!0,[`${e}-${t}`]:t},a(h,{...N,type:o,size:s,ref:g,readOnly:c,id:l||k,className:i(n,F,m&&"is-valid",d&&"is-invalid",o==="color"&&`${e}-color`)})});B.displayName="FormControl";const te=Object.assign(B,{Feedback:S}),ae=X("form-floating"),U=r.forwardRef(({controlId:e,as:o="div",...t},s)=>{const l=r.useMemo(()=>({controlId:e}),[e]);return a(u.Provider,{value:l,children:a(o,{...t,ref:s})})});U.displayName="FormGroup";const E=U,M=r.forwardRef(({as:e="label",bsPrefix:o,column:t=!1,visuallyHidden:s=!1,className:l,htmlFor:n,...m},d)=>{const{controlId:f}=r.useContext(u);o=p(o,"form-label");let c="col-form-label";typeof t=="string"&&(c=`${c} ${c}-${t}`);const h=i(l,o,s&&"visually-hidden",t&&c);return n=n||f,t?a(Y,{ref:d,as:"label",className:h,htmlFor:n,...m}):a(e,{ref:d,className:h,htmlFor:n,...m})});M.displayName="FormLabel";const re=M,V=r.forwardRef(({bsPrefix:e,className:o,id:t,...s},l)=>{const{controlId:n}=r.useContext(u);return e=p(e,"form-range"),a("input",{...s,type:"range",ref:l,className:i(o,e),id:t||n})});V.displayName="FormRange";const se=V,A=r.forwardRef(({bsPrefix:e,size:o,htmlSize:t,className:s,isValid:l=!1,isInvalid:n=!1,id:m,...d},f)=>{const{controlId:c}=r.useContext(u);return e=p(e,"form-select"),a("select",{...d,size:t,ref:f,className:i(s,e,o&&`${e}-${o}`,l&&"is-valid",n&&"is-invalid"),id:m||c})});A.displayName="FormSelect";const le=A,D=r.forwardRef(({bsPrefix:e,className:o,as:t="small",muted:s,...l},n)=>(e=p(e,"form-text"),a(t,{...l,ref:n,className:i(o,e,s&&"text-muted")})));D.displayName="FormText";const ne=D,K=r.forwardRef((e,o)=>a($,{...e,ref:o,type:"switch"}));K.displayName="Switch";const ce=Object.assign(K,{Input:$.Input,Label:$.Label}),W=r.forwardRef(({bsPrefix:e,className:o,children:t,controlId:s,label:l,...n},m)=>(e=p(e,"form-floating"),C(E,{ref:m,className:i(o,e),controlId:s,...n,children:[t,a("label",{htmlFor:s,children:l})]})));W.displayName="FloatingLabel";const me=W,ie={_ref:y.any,validated:y.bool,as:y.elementType},I=r.forwardRef(({className:e,validated:o,as:t="form",...s},l)=>a(t,{...s,ref:l,className:i(e,o&&"was-validated")}));I.displayName="Form";I.propTypes=ie;const de=Object.assign(I,{Group:E,Control:te,Floating:ae,Check:$,Switch:ce,Label:re,Text:ne,Range:se,Select:le,FloatingLabel:me});function Ce({className:e=""}){return a("section",{className:e,children:C("header",{children:[a("h2",{className:"text-lg font-medium text-gray-900",children:"Update Signatory"}),C(de.Select,{children:[a("option",{children:"Levi D. Pura"}),a("option",{children:"Kenneth G. Rabulan"})]}),a("p",{className:"mt-1 text-sm text-gray-600"}),a(Z,{children:"Update"})]})})}export{Ce as default};
