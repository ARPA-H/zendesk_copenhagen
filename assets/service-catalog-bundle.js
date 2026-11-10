import{r as e,p as t,aN as n,s,M as a,aO as r,j as o,aP as i,aQ as l,N as c,u,aR as d,Q as h,aS as m,aT as p,aU as g,ai as f,c as j,d as b,aV as v,O as x,S as w,au as y,A as _,aL as k,aG as $,aH as C,aJ as S,aF as q,aW as L,aX as E,aY as T,am as I,n as A,x as R,y as z,z as F,B as N,G as P,H as U,J as M,K as O,g as H,aZ as D,a_ as V,L as B,a$ as G,t as J,k as W,b0 as K,b1 as Z,ap as Q,o as X,F as Y,a as ee,f as te,aM as ne,b2 as se,b3 as ae}from"shared";import{h as re,g as oe,b as ie,u as le,A as ce,R as ue,t as de}from"ticket-fields";const he={"www.youtube.com":"/embed/","www.youtube-nocookie.com":"/embed/","player.vimeo.com":"/video/"};function me(e){return t.sanitize(e,{ADD_ATTR:["target"]})}function pe(e){if(!e)return"";const t=document.createElement("template");return t.innerHTML=e,t.content.textContent??""}t.addHook("uponSanitizeElement",(e,t)=>{if("iframe"===t.tagName){(function(e){const t=e?.trim();if(!t)return!1;try{const e=new URL(t,window.location.origin);if(e.origin===window.location.origin)return!0;const n=he[e.hostname];return"https:"===e.protocol&&""===e.port&&void 0!==n&&e.pathname.startsWith(n)}catch{return!1}})(e instanceof Element?e.getAttribute("src"):null)||e.parentNode?.removeChild(e)}});const ge="attachments",fe="zen:custom_object:standard::itam_asset_type",je="zen:custom_object:standard::itam_asset",be="is-service-catalog-preview",ve="preview",xe="true",we=["true","false"],ye=["pre","strong","b","p","blockquote","ul","ol","li","h2","h3","h4","i","em","br"],_e={priority:["priority","basic_priority"],type:["tickettype"]},ke=/^\d{4}-\d{2}-\d{2}$/,$e=/^[0-9A-HJKMNP-TV-Z]{26}$/i;function Ce(e,t){const n=e.trim();if(""!==n&&!Number.isNaN(Number(n))){const e=Number(n);return t.find(t=>t.id===e)}const s=_e[n];if(s)return t.find(e=>s.includes(e.type))}function Se(e,n){const s=t.sanitize(n,{ALLOWED_TAGS:ye});switch(e.type){case"partialcreditcard":{const e=s.replace(/\D/g,"");return e?e.slice(-4):void 0}case"multiselect":return s.split(",").filter(t=>e.options.some(e=>e.value===t));case"checkbox":if(!we.includes(s))return;return"true"===s;case"date":return function(e){if(!ke.test(e))return!1;const t=new Date(e),[n,s,a]=e.split("-").map(Number);return t.getUTCFullYear()===n&&t.getUTCMonth()+1===s&&t.getUTCDate()===a}(s)?s:void 0;case"lookup":if(function(e){return e.relationship_target_type===je||e.relationship_target_type===fe}(e))return;if(!$e.test(s))return;return s;default:return s}}function qe(){return e.useMemo(()=>"undefined"==typeof window?new Map:function(e,t=e.length){const n=new Map;if(t>2048)return n;const s=new URLSearchParams(e);for(const[e,t]of s){if(!e.startsWith("tf_"))continue;const s=e.substring(3);0!==s.length&&n.set(s,t)}return n}(window.location.search,window.location.href.length),[])}const Le=e=>"tagger"===e.type?e.custom_field_options.find(e=>e.default)?.value??null:null,Ee=["standard::service_catalog_item","standard::service_catalog_category"],Te=async(e,t)=>{const[s,a]=await Promise.all([fetch(`/api/v2/ticket_forms/${e}`),fetch(`/api/v2/ticket_fields?locale=${t}`)]);if(!s.ok)throw new Error("Error fetching form data");if(!a.ok)throw new Error("Error fetching fields data");const r=await s.json(),o=await a.json();if(!r.ticket_form.active)throw new Error("Associated ticket form is not active");const i=r.ticket_form,l=i.ticket_field_ids,c=i.end_user_conditions||[],u=o.ticket_fields;let d=null,h=null;const m=l.map(e=>{const t=u.find(t=>t.id===e);return t&&"subject"!==t.type&&"description"!==t.type&&t.active&&t.editable_in_portal?"lookup"===t.type&&(e=>{const t=ie(e.relationship_target_type);return Ee.includes(t)})(t)?("standard::service_catalog_item"===ie(t.relationship_target_type)?d=t:(e=>"standard::service_catalog_category"===ie(e.relationship_target_type))(t)&&(h=t),null):(e=>{const{id:t,type:s,description:a,title_in_portal:r,custom_field_options:o,required_in_portal:i,relationship_target_type:l,relationship_filter:c}=e;return{id:t,type:s,name:`custom_fields_${t}`,description:me(n(a)),label:r,options:o,required:i,relationship_target_type:l,relationship_filter:c,error:null,value:Le(e)}})(t):null}).filter(Boolean);if(!d)throw new Error("Associated lookup field not found");return{requestFields:m,associatedLookupField:d,categoryLookupField:h,endUserConditions:c}};function Ie(t,n){const[s,a]=e.useState([]),[r,o]=e.useState([]),[i,l]=e.useState(),[c,u]=e.useState(null),[d,h]=e.useState(null),[m,p]=e.useState(!1),[g,f]=e.useState({assetTypeIds:[],assetIds:[],isAssetTypeHidden:!1,assetTypeHiddenValue:"",assetTypeIsRequired:!1,assetIsRequired:!1}),j=t?.custom_object_fields?.["standard::asset_option"],b=t?.custom_object_fields?.["standard::asset_type_option"],{fetchAssets:v,fetchAssetTypes:x}=((t,n)=>({fetchAssets:e.useCallback(async()=>{if(!t)return;const e=await fetch(`/api/v2/custom_objects/standard::service_catalog_asset_option/records/${t}`);if(!e.ok)throw new Error("Error fetching asset data");const n=await e.json();if(!n?.custom_object_record)throw new Error("Missing custom_object_record in asset response");const{name:s,custom_object_fields:a}=n.custom_object_record,r=a??{};return{assetIds:r["standard::asset_filter_ids"],assetDescription:r["standard::description"],assetName:s,isRequired:r["standard::is_required"]}},[t]),fetchAssetTypes:e.useCallback(async()=>{if(!n)return;const e=await fetch(`/api/v2/custom_objects/standard::service_catalog_asset_type_option/records/${n}`);if(!e.ok)throw new Error("Error fetching asset type data");const t=await e.json();if(!t?.custom_object_record)throw new Error("Missing custom_object_record in asset type response");const{name:s,custom_object_fields:a}=t.custom_object_record,r=a??{};return{assetTypeIds:r["standard::asset_type_ids"],isHiddenAssetsType:!!r["standard::is_hidden"],assetTypeDescription:r["standard::description"],assetTypeName:s,isRequired:r["standard::is_required"]}},[n])}))(j??"",b??""),w=qe();e.useEffect(()=>{if(!t?.form_id)return;let e=!0;return(async()=>{p(!0),h(null);try{const[s,r,i]=await Promise.all([Te(t.form_id,n),x(),v()]);if(!e)return;const{requestFields:c,associatedLookupField:d,categoryLookupField:h,endUserConditions:m}=s,p=((e,t)=>{let n=[];if(e?.assetTypeIds){const t=e.assetTypeIds;Array.isArray(t)?n=t.map(String):"string"==typeof t&&(n=t.split(",")),n=n.map(e=>e.trim()).filter(Boolean)}let s=[];if(t?.assetIds){const e=t.assetIds;"string"==typeof e?s=e.split(","):Array.isArray(e)&&(s=e.map(String)),s=s.map(e=>e.trim()).filter(Boolean)}const a=!!e?.isHiddenAssetsType;return{assetTypeIds:n,assetIds:s,isAssetTypeHidden:a,assetTypeHiddenValue:a&&n[0]?n[0]:"",assetTypeLabel:e?.assetTypeName,assetTypeDescription:e?.assetTypeDescription,assetTypeIsRequired:e?.isRequired||!1,assetLabel:t?.assetName,assetDescription:t?.assetDescription,assetIsRequired:t?.isRequired||!1}})(r,i);f(p),l(d),u(h),o(m);const g=((e,t)=>e.map(e=>"zen:custom_object:standard::itam_asset_type"===e.relationship_target_type?{...e,label:t.assetTypeLabel||e.label,description:me(t.assetTypeDescription||e.description),required:t.assetTypeIsRequired||e.required}:"zen:custom_object:standard::itam_asset"===e.relationship_target_type?{...e,label:t.assetLabel||e.label,description:me(t.assetDescription||e.description),required:t.assetIsRequired||e.required}:e))(c,p),j=function(e,t){if(0===t.size)return e;const n=new Set;let s=e;for(const[e,a]of t){const t=Ce(e,s);if(!t||n.has(t.id))continue;const r=Se(t,a);void 0!==r&&(n.add(t.id),s=s.map(e=>e.id===t.id?{...e,value:r}:e))}return s}(g,w);a(j)}catch(t){e&&h(t)}finally{e&&p(!1)}})(),()=>{e=!1}},[n,t?.form_id,v,x,w]);const y=e.useCallback((e,t)=>{const n=re({...e,value:t}),r=s.map(s=>s.name===e.name?{...s,value:t,error:n?null:s.error}:s);a(r)},[s]);return{requestFields:oe(s,r),associatedLookupField:i,categoryLookupField:c,error:d,setRequestFields:a,handleChange:y,isRequestFieldsLoading:m,assetTypeHiddenValue:g.assetTypeHiddenValue,isAssetTypeHidden:g.isAssetTypeHidden,assetTypeIds:g.assetTypeIds,assetIds:g.assetIds}}const Ae=a(c)`
  background-color: ${({theme:e})=>s({theme:e,hue:"grey",shade:100})};
  width: ${e=>"large"===e.size?72:40}px !important;
  height: ${e=>"large"===e.size?72:40}px !important;

  /* Iconify sets (uil, mdi, etc.) bake their own padding into the 24x24
     viewBox, so shrinking the svg box further on top of that made icons look
     much smaller than uploaded PNGs, which are full-bleed. Fill the avatar
     the same way img does (Garden's default "& > img { width/height: 100% }")
     instead of applying an extra size reduction.
     !important needed: Garden's own "&& > svg { width: 1em; height: 1em }"
     rule has identical specificity, so cascade order alone can't be trusted. */
  && > svg {
    width: 100% !important;
    height: 100% !important;
    color: ${({theme:e})=>s({theme:e,hue:"grey",shade:600})};
  }
`,Re=({size:e,name:t,description:n,url:s})=>{const a=r({name:t,description:n,thumbnailUrl:s}),c=s&&s.trim()?o.jsx("img",{src:s,alt:""}):o.jsx(i,{"aria-hidden":"true"});return o.jsx(Ae,{size:e,isSystem:!0,children:"iconify"===a.kind?o.jsx(l,{icon:a.name,"aria-hidden":"true",fallback:c}):"image"===a.kind?o.jsx("img",{src:a.url,alt:""}):o.jsx(i,{"aria-hidden":"true"})})},ze=a.div`
  border-bottom: ${e=>e.theme.borders.sm}
    ${({theme:e})=>s({theme:e,hue:"grey",shade:300})};
  padding-bottom: ${e=>e.theme.space.lg};
  margin-inline-end: ${e=>e.theme.space.xl};

  @media (max-width: ${e=>e.theme.breakpoints.md}) {
    margin-inline-end: 0;
  }
`,Fe=a(g)`
  font-weight: ${e=>e.theme.fontWeights.semibold};
  margin-bottom: 0;
  min-width: 0;
  overflow-wrap: break-word;
  max-width: 100%;
`,Ne=a.div`
  font-size: var(--font-size-xs, 1rem);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${e=>e.isCollapsed?3:"none"};
  overflow: hidden;
  margin-top: ${e=>e.theme.space.md};
  padding-inline-end: ${e=>e.theme.space.xl};
  overflow-wrap: break-word;

  @media (max-width: ${e=>e.theme.breakpoints.md}) {
    padding-inline-end: 0;
  }
`,Pe=a(h)`
  margin-top: ${e=>e.theme.space.sm};
  font-size: var(--font-size-2xs, 0.875rem);
  &:hover {
    text-decoration: none;
  }
`,Ue=a.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${e=>e.theme.space.md};

  /* A long service name wraps; it never squeezes the icon. */
  > :first-child {
    flex-shrink: 0;
  }
`,Me=({title:n,description:s,thumbnailUrl:a})=>{const[r,i]=e.useState(!0),[l,c]=e.useState(!1),{t:g}=u(),f=e.useRef(null),j=e.useMemo(()=>{return e=d(s),t.sanitize(e,{ADD_TAGS:["iframe"],ADD_ATTR:["allow","allowfullscreen","frameborder","scrolling","target","title"]});var e},[s]);e.useEffect(()=>{const e=f.current;if(!e||!r)return;const t=()=>{const t=e.getBoundingClientRect().height,n=e.scrollHeight;c(n-t>1)},n=requestAnimationFrame(t),s=document.fonts;s?.addEventListener("loadingdone",t);const a="undefined"==typeof ResizeObserver?null:new ResizeObserver(t);return a?.observe(e),()=>{cancelAnimationFrame(n),s?.removeEventListener("loadingdone",t),a?.disconnect()}},[j,r]);return o.jsxs(ze,{children:[o.jsxs(Ue,{children:[o.jsx(Re,{size:"large",name:n,description:s,url:a}),o.jsx(Fe,{tag:"h1",children:n})]}),j&&o.jsx(Ne,{ref:f,className:"service-catalog-description",isCollapsed:r,dangerouslySetInnerHTML:{__html:j}}),l&&o.jsxs(Pe,{isLink:!0,onClick:()=>{i(!r)},children:[r?g("service-catalog.item.read-more","Read more"):g("service-catalog.item.read-less","Read less"),o.jsx(h.EndIcon,{children:r?o.jsx(p,{}):o.jsx(m,{})})]})]})},Oe=a(f.Header)`
  color: ${({theme:e})=>s({theme:e,hue:"successHue",shade:700})};
`,He=a.div`
  display: flex;
  flex-direction: column;
  gap: ${e=>e.theme.space.md};
`,De=a(f.Body)`
  padding-bottom: 48px;
`,Ve=a(x)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${e=>e.theme.space.sm};
`,Be=a.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${e=>e.theme.space.sm};
`,Ge=a.div`
  display: flex;
  gap: ${e=>e.theme.space.xs};
`,Je=a.div`
  display: flex;
  flex-direction: column;
`,We=a(f.Footer)`
  padding: 32px 40px;
  border-top: 1px solid
    ${({theme:e})=>s({theme:e,variable:"border.subtle"})};
`,Ke=({onCancel:t,onCreate:n,selectedUser:s,setSelectedUser:a})=>{const{t:r}=u(),[i,l]=e.useState(!1),c=e.useRef(null),[d,m]=e.useState(s),[p,g]=e.useState(s?.name??""),[y,_]=e.useState(!1),k=e.useRef(!1),{options:$,isLoadingOptions:C,searchUsers:S,clearOptions:q}=le(d,()=>{k.current=!1}),L=(e,t)=>{if(!t.trim())return e;const n=e.toLowerCase().indexOf(t.toLowerCase());if(-1===n)return e;const s=e.slice(0,n),a=e.slice(n,n+t.length),r=e.slice(n+t.length);return o.jsxs(o.Fragment,{children:[s,o.jsx("strong",{children:a}),r]})},E={id:"loading",name:r("service-catalog.change-user-modal.loading-users","Loading users..."),email:""},T={id:"no-results",name:r("service-catalog.change-user-modal.no-matches-found","Type to search"),email:""},I=e.useCallback(({type:e,inputValue:t,selectionValue:n})=>{if(void 0!==n){const e=$.find(e=>e.id===n);e&&"loading"!==e.id&&"no-results"!==e.id&&(m(e),g(e.name),l(!1),k.current=!1)}"input:change"===e&&void 0!==t&&(g(t),k.current=!0,t.trim().length>=3?S(t.trim()):(q(),m(null),k.current=!1))},[$,S,q]),A=e.useCallback(()=>{if(!p.trim())return void(d&&(m(null),l(!1)));if(d&&(d.name.toLowerCase()===p.toLowerCase()||d.email.toLowerCase()===p.toLowerCase()))return;const e=$.find(e=>e.name.toLowerCase()===p.toLowerCase());e&&(m(e),g(e.name),l(!1))},[p,$,d]),R=e.useCallback(()=>{k.current||A()},[A]),z=e.useCallback(e=>{"Enter"!==e.key||k.current||C||A()},[C,A]),F=C?[E]:0===$.length?[T]:$;return o.jsxs(o.Fragment,{children:[o.jsx(Oe,{tag:"h2",children:r("service-catalog.change-user-modal.requester-title","Change requester")}),o.jsx(De,{children:o.jsx(He,{children:o.jsx(o.Fragment,{children:o.jsxs(j,{children:[o.jsx(j.Label,{children:r("service-catalog.change-user-modal.select-requester-label","Select requester* (required)")}),o.jsx(b,{ref:c,inputValue:p,selectionValue:d?.id,onChange:I,validation:i?"error":void 0,"data-test-id":"user-autocomplete-input",isAutocomplete:!0,placeholder:r("service-catalog.change-user-modal.requester-search-placeholder","Search requesters..."),renderValue:()=>d?.name||"",inputProps:{onBlur:R,onKeyDown:z},children:F.length>0?F.map(e=>o.jsx(Ve,{value:e.id,label:e.name,isDisabled:"loading"===e.id||"no-results"===e.id,children:e.email?o.jsxs(Ge,{children:[o.jsx(v,{}),o.jsxs(Je,{children:[o.jsx("span",{children:L(e.name,p)}),o.jsx(x.Meta,{children:o.jsx(w,{hue:"grey",children:e.email})})]})]}):o.jsx(Be,{children:o.jsx("span",{children:e.name})})},e.id)):null}),i&&o.jsx(j.Message,{validation:"error",validationLabel:r("service-catalog.validation.error.aria.label","Error"),children:r("service-catalog.change-user-modal.requester-required","Select a requester")})]})})})}),o.jsxs(We,{children:[o.jsx(f.FooterItem,{children:o.jsx(h,{onClick:t,isBasic:!0,"data-test-id":"cancel-button",children:r("service-catalog.change-user-modal.cancel","Cancel")})}),o.jsx(f.FooterItem,{children:o.jsx(h,{isPrimary:!0,onClick:async()=>{if(d){_(!0);try{await n(d.name,d.id),a(d)}catch(e){console.error("Error changing user:",e)}finally{_(!1)}}else l(!0)},disabled:y||!d,"data-test-id":"change-user-button",children:r("service-catalog.change-user-modal.change-user","Save")})})]})]})},Ze=({onClose:e,onCreate:t,selectedUser:n,setSelectedUser:s})=>{const{t:a}=u();return o.jsxs(f,{onClose:e,focusOnMount:!1,children:[o.jsx(Ke,{onCancel:e,onCreate:async(e,n)=>{await t(e,n)},selectedUser:n,setSelectedUser:s}),o.jsx(y,{"aria-label":a("service-catalog.change-user-modal.close","Close dialog")})]})},Qe=a.form`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${e=>e.theme.space.md};

  @media (max-width: ${e=>e.theme.breakpoints.md}) {
    flex-direction: column;
  }
`,Xe=a.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: ${e=>e.theme.space.md};
  margin-inline-end: ${e=>e.theme.space.xl};

  @media (max-width: ${e=>e.theme.breakpoints.md}) {
    margin-inline-end: 0;
  }
`,Ye=a.div`
  flex: 1;
  padding: ${e=>e.theme.space.lg};
  border: ${e=>e.theme.borders.sm}
    ${({theme:e})=>s({theme:e,hue:"grey",shade:300})};
  height: fit-content;
  max-width: 360px;

  @media (max-width: ${e=>e.theme.breakpoints.md}) {
    position: sticky;
    top: 0;
    background: ${({theme:e})=>s({theme:e,variable:"background.default"})};
    padding: ${e=>e.theme.space.lg};
    border: none;
    border-top: ${e=>e.theme.borders.sm}
      ${({theme:e})=>s({theme:e,hue:"grey",shade:300})};
    width: 100vw;
    margin-inline-start: 0;
  }
`,et=a.div`
  flex: 1;
  margin-inline-start: ${e=>e.theme.space.xl};

  @media (max-width: ${e=>e.theme.breakpoints.md}) {
    position: sticky;
    bottom: 0;
    margin-inline-start: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`,tt=a.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: ${e=>e.theme.space.lg};
  margin-inline-end: ${e=>e.theme.space.xl};
  min-width: 0;

  @media (max-width: ${e=>e.theme.breakpoints.md}) {
    margin-inline-end: 0;
  }
`,nt=a(k)`
  width: 100%;
  height: 48px;
  display: block;
`,st=a.div`
  margin-bottom: 16px;
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: ${e=>e.theme.space.xxs};
`,at=a.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`,rt=a.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,ot=e=>e.relationship_target_type===je,it=e=>e.relationship_target_type===fe;function lt({requestFields:t,serviceCatalogItem:n,baseLocale:s,hasAtMentions:a,userRole:r,requesterId:i,requestOnBehalfEnabled:l,userName:c,selectedUser:d,setSelectedUser:m,brandId:p,defaultOrganizationId:g,handleChange:f,onSubmit:j,attachmentsOption:b,attachmentsRequiredError:v,setAttachmentsRequiredError:y,isRequestFieldsLoading:k,isLoadingAttachmentsOption:$,assetTypeError:C,assetError:S,assetTypeHiddenValue:q,isAssetTypeHidden:L,assetTypeIds:E,assetIds:T,onAttachmentUploadingChange:I,isFormInitializing:A,isPreviewMode:R=!1,isSubmitting:z=!1}){const{t:F}=u(),[N,P]=e.useState(!1),[U,M]=e.useState(c),O=()=>{P(!1)},H=async(e,t)=>{if(!Array.isArray(e)||0===e.length)return[];const n=e.map(e=>{const t={name:e.name,value:e.id,serialNumber:e.custom_object_fields["standard::serial_number"]};if("standard::itam_asset"===e.custom_object_key){const n=e.custom_object_fields??{};return{...t,item_asset_type_id:n["standard::asset_type"]??""}}return{...t,item_asset_type_id:""}});if(it(t))return L?[]:E?.length?n.filter(e=>E.includes(e.value)):[];if(ot(t)){let e=n;return T?.length&&(e=e.filter(e=>T.includes(e.item_asset_type_id??""))),e}return n.map(({name:e,value:t,serialNumber:n})=>({name:e,value:t,serialNumber:n}))},D=e=>e.serialNumber?o.jsxs(o.Fragment,{children:[e.name,o.jsx(x.Meta,{children:o.jsx(w,{hue:"grey",children:F("service-catalog.item.serial-number-label","SN: {{serialNumber}}",{serialNumber:e.serialNumber})})})]}):e.name,V=e.useCallback(e=>{y(null),I(e)},[y,I]);return o.jsxs(o.Fragment,{children:[o.jsxs(Qe,{onSubmit:j,noValidate:!0,children:[o.jsxs(tt,{children:[o.jsx(Me,{title:n.name,description:n.description,thumbnailUrl:n.thumbnail_url}),o.jsx(Xe,{children:(()=>{if(k||$)return null;const n=b?.custom_object_fields?.["standard::position_in_portal"],l=b?o.jsx(ce,{field:{name:ge,label:F("service-catalog.item.attachments-label","Upload a file"),description:b.custom_object_fields["standard::description"]??"",error:v,attachments:[],isRequired:b.custom_object_fields["standard::is_required"]??!1},baseLocale:s,onUploadingChange:V},"attachments"):null,c=[];return t.forEach((u,d)=>{if(l&&"number"==typeof n&&d===n&&c.push(l),it(u)&&L)return void c.push(o.jsxs(e.Fragment,{children:[o.jsx("input",{type:"hidden",name:u.name,value:q}),o.jsx("input",{type:"hidden",name:"isAssetTypeHidden",value:"true"})]},u.id));const h={...u,error:ot(u)?S||u.error:it(u)&&C||u.error};c.push(o.jsx(ue,{field:h,baseLocale:s,hasAtMentions:a,userRole:r,userId:i,brandId:p,defaultOrganizationId:g,handleChange:f,visibleFields:t,buildLookupFieldOptions:H,renderLookupFieldOption:D},u.id))}),l&&"number"==typeof n&&n>=t.length&&c.push(l),c})()})]}),o.jsx(et,{children:o.jsxs(Ye,{children:[o.jsxs(at,{children:[o.jsxs(st,{children:[o.jsx(w,{isBold:!0,children:F("service-catalog.item.requester","Requester")}),o.jsx(rt,{children:U})]}),l&&o.jsx(o.Fragment,{children:o.jsx(_,{isUnderlined:!1,onClick:()=>{P(!0)},children:F("service-catalog.item.change-user-requesting-on-behalf","Change")})})]}),A?o.jsx(nt,{}):o.jsx(h,{isPrimary:!0,size:"large",isStretched:!0,type:"submit","data-svc-native-submit":!0,disabled:R||z,title:R?F("service-catalog.item.preview-mode.submit-disabled-tooltip","Submitting requests is disabled while previewing a draft"):void 0,children:F("service-catalog.item.submit-button","Submit request")})]})})]}),N&&o.jsx(Ze,{onClose:O,onCreate:async e=>{M(e),O()},setSelectedUser:m,selectedUser:d})]})}const ct=a(q)`
  max-width: min(420px, calc(100vw - 32px));

  [data-garden-id="dropdowns.menu.item.content"] {
    min-width: 0;
    flex: 1 1 auto;
    overflow: hidden;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow-wrap: anywhere;
  }
`,ut=a(C)`
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
`;function dt({categories:e,selectedCategoryId:t,onCategoryChange:n}){const{t:s}=u();return e.length<2?null:o.jsx(ct,{button:e=>o.jsxs(h,{...e,isBasic:!0,children:[s("service-catalog.item.change-category","Change category"),o.jsx(h.EndIcon,{children:o.jsx(S,{})})]}),onChange:({value:e})=>{e&&n(e)},children:o.jsx($,{type:"radio",children:e.map(e=>o.jsxs(ut,{value:e.id,isSelected:e.id===t,children:[e.name,e.path?.length>0&&o.jsx(C.Meta,{children:e.path.join(" > ")})]},e.id))})})}const ht=a(L)`
  background: ${({theme:e})=>s({theme:e,hue:"blue",shade:200})};
  border-bottom: 1px solid
    ${({theme:e})=>s({theme:e,hue:"blue",shade:300})};
  color: ${({theme:e})=>s({theme:e,hue:"blue",shade:700})};
  box-shadow: none;

  svg {
    color: ${({theme:e})=>s({theme:e,hue:"blue",shade:600})};
  }
`,mt=a(L.Title)`
  color: ${({theme:e})=>s({theme:e,hue:"blue",shade:800})};
`;function pt(){const{t:t}=u(),[n,s]=e.useState(null),a=e.useRef("");return e.useEffect(()=>{const e=document.createElement("div");return e.setAttribute("data-preview-mode-banner-host","true"),e.style.position="fixed",e.style.top="0",e.style.left="0",e.style.right="0",e.style.zIndex=String(E),a.current=document.body.style.paddingTop,document.body.prepend(e),s(e),()=>{e.remove(),document.body.style.paddingTop=a.current,s(null)}},[]),e.useEffect(()=>{if(!n)return;let e="",t=null;const s=()=>{t=null;const s=`${n.offsetHeight}px`;s!==e&&(document.body.style.paddingTop=s,e=s)},r=()=>{null===t&&(t=window.requestAnimationFrame(s))};let o;return s(),"undefined"!=typeof ResizeObserver&&(o=new ResizeObserver(r),o.observe(n)),window.addEventListener("resize",r),()=>{null!==t&&window.cancelAnimationFrame(t),o?.disconnect(),window.removeEventListener("resize",r),document.body.style.paddingTop=a.current}},[n]),n?T.createPortal(o.jsx("div",{"data-testid":"preview-mode-banner",children:o.jsx(ht,{type:"info",children:o.jsxs(L.Content,{children:[o.jsx(mt,{children:t("service-catalog.item.preview-mode.title","Preview mode")}),t("service-catalog.item.preview-mode.message","If you navigate away from this page or click on anything outside of this preview, you'll exit the preview mode.")]})})}),n):null}const gt=(e,t,n)=>{const s=document.createElement("a");if(s.setAttribute("href",`${window.location.origin}${t}/services/${e.id}`),s.setAttribute("style","text-decoration: underline"),s.setAttribute("target","_blank"),s.setAttribute("rel","noopener noreferrer"),s.textContent=e.name,!n)return s.outerHTML;const a=document.createElement("p");a.setAttribute("style","margin:0;padding:0"),a.textContent=n.submitterLabel;const r=document.createElement("p");return r.setAttribute("style","margin:0;padding:0"),r.textContent=n.requesterLabel,`${s.outerHTML}${a.outerHTML}${r.outerHTML}`};async function ft(e,t,n,s,a,r,o,i,l){try{const c=await(async()=>{try{const e=await fetch("/api/v2/users/me.json");if(!e.ok)throw new Error("Error fetching current user data");return await e.json()}catch{throw new Error("Error fetching current user data")}})(),u=s.map(e=>e.id),d=t.map(e=>({id:e.id,value:e.value})),h=[{id:n.id,value:e.id}];r&&o&&h.push({id:r.id,value:o});const m=c.user.id,p=null!=i&&i!==m;return await fetch("/hc/api/v2/service_catalog/requests",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-Token":c.user.authenticity_token},body:JSON.stringify({request:{item_id:e.id,subject:`${e.name}`,comment:{html_body:gt(e,a,l),uploads:u},custom_fields:[...d,...h],via:{channel:"web form",source:50},...p?{requester_id:i,collaborators:[m]}:{}}})})}catch(e){return void console.error("Error submitting service request:",e)}}function jt(e){const t=Array.from(e.querySelectorAll('[role="alert"]'));for(const e of t){if(!e.textContent?.trim())continue;const t=e.closest('[data-garden-id$="field"]'),n=Array.from(t?.querySelectorAll('input, textarea, select, button, [role="combobox"], [tabindex]')??[]).find(e=>!e.matches('[type="hidden"], [disabled], [hidden], [aria-hidden="true"], [tabindex="-1"]'));if(n)return n.focus(),!0}return!1}function bt(e){return e.relationship_target_type===fe}function vt(e){return e.relationship_target_type===je}const xt=a.div`
  display: flex;
  flex-direction: column;
`,wt=a(_)`
  text-decoration: underline;
  display: block;
  margin-top: ${e=>e.theme.space.xxs}px;
`,yt=e=>e.relationship_target_type===fe;function _t({serviceCatalogItemId:t,baseLocale:n,hasAtMentions:s,userRole:a,organizations:r,userId:i,brandId:l,userName:c,helpCenterPath:d}){const{serviceCatalogItem:h,errorFetchingItem:m}=function(t){const[n,s]=e.useState(),[a,r]=e.useState(null);return e.useEffect(()=>{(async()=>{try{const e=await fetch(`/api/v2/help_center/service_catalog/items/${t}`);if(!e.ok)throw new Error("Error fetching service catalog item");{const t=await e.json();s(t.service_catalog_item)}}catch(e){r(e)}})()},[t]),{serviceCatalogItem:n,errorFetchingItem:a}}(t),{requestFields:p,associatedLookupField:g,categoryLookupField:f,error:j,setRequestFields:b,handleChange:v,isRequestFieldsLoading:x,assetTypeHiddenValue:w,isAssetTypeHidden:y,assetTypeIds:_,assetIds:k}=Ie(h,n),{t:$}=u(),[C,S]=e.useState(null),[q,L]=e.useState(null);e.useEffect(()=>{if(!h?.categories?.length)return;const e=new URLSearchParams(window.location.search).get("category_id"),t=h.categories.find(t=>t.id===e);S(t?t.id:h.categories[0]?.id??null)},[h]);const E=e.useCallback(e=>{S(e);const t=new URLSearchParams(window.location.search);t.set("category_id",e),window.history.replaceState({},"",`${window.location.pathname}?${t.toString()}`)},[]),R=h?.custom_object_fields?.["standard::attachment_option"],z=h?.is_request_on_behalf,F=q?Number(q.id):i,{attachmentsOption:N,errorAttachmentsOption:P,isLoadingAttachmentsOption:U}=function(t){const[n,s]=e.useState(),[a,r]=e.useState(!1),[o,i]=e.useState(null);return e.useEffect(()=>{if(!t)return s(void 0),i(null),void r(!1);(async()=>{i(null),r(!1);try{const e=await fetch(`/api/v2/custom_objects/standard::service_catalog_attachment_option/records/${t}`);if(!e.ok)throw new Error("Error fetching service catalog item");{const t=await e.json();s(t.custom_object_record)}}catch(e){i(e)}finally{r(!1)}})()},[t]),{attachmentsOption:n,errorAttachmentsOption:o,isLoadingAttachmentsOption:a}}(R),{validate:M}=function(t){const{t:n}=u();return{validate:e.useCallback((e,s)=>{const a={attachments:null,assetType:null,asset:null,fields:{}},r={};t&&t.custom_object_fields["standard::is_required"]&&0===s.length&&(a.attachments=n("service-catalog.attachments-required-error","Upload a file to continue."));const o=n("service-catalog.field-required-error","This field is required.");for(const t of e)t.required&&!re(t)&&(bt(t)?a.assetType=n("service-catalog.asset-type-required-error","Select an asset type"):vt(t)?a.asset=n("service-catalog.asset-required-error","Select an asset"):r[t.id]=o);return{hasError:Boolean(a.attachments||a.assetType||a.asset||Object.keys(r).length>0),errors:a,fieldErrors:r}},[t,n])}}(N),[O,H]=e.useState(null),[D,V]=e.useState(null),[B,G]=e.useState(null),[J,W]=e.useState(!1),[K,Z]=e.useState(!1);e.useEffect(()=>{const e=e=>{e.persisted&&W(!1)};return window.addEventListener("pageshow",e),()=>window.removeEventListener("pageshow",e)},[]);const Q=!h||x||U||!(!((h?.categories?.length??0)>0)||!!C),X="undefined"!=typeof window&&new URLSearchParams(window.location.search).get(ve)===xe,Y=h?null===h.published_at:X;e.useEffect(()=>{if("undefined"!=typeof document&&Y)return document.documentElement.classList.add(be),()=>{document.documentElement.classList.remove(be)}},[Y]),e.useEffect(()=>{if("undefined"==typeof window||!h)return;const e=new URL(window.location.href),t=null===h.published_at,n=e.searchParams.get(ve)===xe;t&&!n?(e.searchParams.set(ve,xe),window.history.replaceState(null,"",e.toString())):!t&&n&&(e.searchParams.delete(ve),window.history.replaceState(null,"",e.toString()))},[h]);const ee=!(Y||Q||J||K||!h||!g);if(j)throw j;if(m)throw m;if(P)throw P;function te(e){A({type:"error",title:$("service-catalog.item.service-request-error-title","Service couldn't be submitted"),message:e??$("service-catalog.item.service-request-error-message","Give it a moment and try it again")})}async function ne(e){if(422===e?.status)try{await async function(e){const t=await e.json(),n=t?.details?.base??[];n.filter(e=>null!=e.field_id&&!p.some(t=>t.id===e.field_id)).length>0?te(o.jsxs(o.Fragment,{children:[$("service-catalog.item.service-request-refresh-message","Refresh the page and try again in a few seconds.")," ",o.jsx(wt,{href:`${d}/services/${h.id}`,children:$("service-catalog.item.service-request-refresh-link-text","Refresh the page")})]})):n.length>0&&te($("service-catalog.item.service-request-form-errors-message","Check the form for errors and try again.")),T.flushSync(()=>b(e=>e.map(e=>{const t=n.find(t=>t.field_id===e.id);return{...e,error:t?.description||null}})))}(e)}catch{te()}else te()}const se=r.length>0&&r[0]?.id?r[0]?.id?.toString():null,[ae,oe]=e.useState(null);return e.useEffect(()=>{oe(document.getElementById("category-selector"))},[]),o.jsxs(xt,{children:[Y&&o.jsx(pt,{}),ae&&h&&C&&h.categories.length>0&&T.createPortal(o.jsx(dt,{categories:h.categories,selectedCategoryId:C,onCategoryChange:E}),ae),h&&o.jsx(lt,{requestFields:p,isRequestFieldsLoading:x,isLoadingAttachmentsOption:U,serviceCatalogItem:h,baseLocale:n,hasAtMentions:s,userRole:a,requesterId:F,requestOnBehalfEnabled:z,userName:c,selectedUser:q,setSelectedUser:L,brandId:l,defaultOrganizationId:se,handleChange:(e,t)=>{yt(e)&&t?V(null):(e=>e.relationship_target_type===je)(e)&&t&&G(null),v(e,t)},onSubmit:async e=>{if(e.preventDefault(),Y)return;if(!ee)return void te();const t=e.currentTarget,n=new FormData(t),s="true"===n.get("isAssetTypeHidden"),a=function(e){return e.getAll(ge).filter(e=>"string"==typeof e).map(e=>JSON.parse(e))}(n),r=p.map(e=>yt(e)&&s?{...e,value:n.get(e.name)}:e);if(T.flushSync(()=>W(!0)),function(e,t){const{hasError:n,errors:s,fieldErrors:a}=M(e,t);return H(s.attachments),V(s.assetType),G(s.asset),b(t=>t.map(t=>{const n=e.find(e=>e.id===t.id);return n?{...n,error:a[t.id]??null}:t})),n}(r,a))return T.flushSync(()=>W(!1)),void jt(t);if(h&&g){try{const e=null!=q&&Number(q.id)!==i,n=e?Number(q.id):null,s=e&&q?{submitterLabel:$("service-catalog.item.submitter-label","Submitter: {{name}}",{name:c}),requesterLabel:$("service-catalog.item.requester-label","Requester: {{name}}",{name:q.name})}:null,o=await ft(h,r,g,a,d,f,C,n,s);if(o?.ok){I({type:"success",message:$("service-catalog.item.service-request-submitted","Service request submitted")});const e=await o.json();return void(window.location.href=`${d}/requests/${e.request.id}`)}await ne(o),422===o?.status&&(T.flushSync(()=>W(!1)),jt(t))}catch{}W(!1)}else T.flushSync(()=>W(!1))},attachmentsOption:N,attachmentsRequiredError:O,setAttachmentsRequiredError:H,assetTypeError:D,assetError:B,assetTypeHiddenValue:w,isAssetTypeHidden:y,assetTypeIds:_,assetIds:k,onAttachmentUploadingChange:Z,isFormInitializing:Q,isPreviewMode:Y,isSubmitting:J})]})}async function kt(e,t,n){const{baseLocale:s,locale:a,helpCenterPath:r}=n,i=R(r);z(s),await F(a,s,[H("service-catalog",e=>function(e){switch(e){case"./translations/locales/af.json":return import("service-catalog-translations").then(function(e){return e.a});case"./translations/locales/ar-x-pseudo.json":return import("service-catalog-translations").then(function(e){return e.b});case"./translations/locales/ar.json":return import("service-catalog-translations").then(function(e){return e.c});case"./translations/locales/az.json":return import("service-catalog-translations").then(function(e){return e.d});case"./translations/locales/be.json":return import("service-catalog-translations").then(function(e){return e.e});case"./translations/locales/bg.json":return import("service-catalog-translations").then(function(e){return e.f});case"./translations/locales/bn.json":return import("service-catalog-translations").then(function(e){return e.g});case"./translations/locales/bs.json":return import("service-catalog-translations").then(function(e){return e.h});case"./translations/locales/ca.json":return import("service-catalog-translations").then(function(e){return e.i});case"./translations/locales/cs.json":return import("service-catalog-translations").then(function(e){return e.j});case"./translations/locales/cy.json":return import("service-catalog-translations").then(function(e){return e.k});case"./translations/locales/da.json":return import("service-catalog-translations").then(function(e){return e.l});case"./translations/locales/de-de.json":return import("service-catalog-translations").then(function(e){return e.m});case"./translations/locales/de-x-informal.json":return import("service-catalog-translations").then(function(e){return e.n});case"./translations/locales/de.json":return import("service-catalog-translations").then(function(e){return e.o});case"./translations/locales/el.json":return import("service-catalog-translations").then(function(e){return e.p});case"./translations/locales/en-001.json":return import("service-catalog-translations").then(function(e){return e.q});case"./translations/locales/en-150.json":return import("service-catalog-translations").then(function(e){return e.r});case"./translations/locales/en-au.json":return import("service-catalog-translations").then(function(e){return e.s});case"./translations/locales/en-ca.json":return import("service-catalog-translations").then(function(e){return e.t});case"./translations/locales/en-gb.json":return import("service-catalog-translations").then(function(e){return e.u});case"./translations/locales/en-my.json":return import("service-catalog-translations").then(function(e){return e.v});case"./translations/locales/en-ph.json":return import("service-catalog-translations").then(function(e){return e.w});case"./translations/locales/en-se.json":return import("service-catalog-translations").then(function(e){return e.x});case"./translations/locales/en-us.json":return import("service-catalog-translations").then(function(e){return e.y});case"./translations/locales/en-x-dev.json":return import("service-catalog-translations").then(function(e){return e.z});case"./translations/locales/en-x-keys.json":return import("service-catalog-translations").then(function(e){return e.A});case"./translations/locales/en-x-obsolete.json":return import("service-catalog-translations").then(function(e){return e.B});case"./translations/locales/en-x-pseudo.json":return import("service-catalog-translations").then(function(e){return e.C});case"./translations/locales/en-x-test.json":return import("service-catalog-translations").then(function(e){return e.D});case"./translations/locales/es-419.json":return import("service-catalog-translations").then(function(e){return e.E});case"./translations/locales/es-ar.json":return import("service-catalog-translations").then(function(e){return e.F});case"./translations/locales/es-cl.json":return import("service-catalog-translations").then(function(e){return e.G});case"./translations/locales/es-es.json":return import("service-catalog-translations").then(function(e){return e.H});case"./translations/locales/es-mx.json":return import("service-catalog-translations").then(function(e){return e.I});case"./translations/locales/es-pe.json":return import("service-catalog-translations").then(function(e){return e.J});case"./translations/locales/es.json":return import("service-catalog-translations").then(function(e){return e.K});case"./translations/locales/et.json":return import("service-catalog-translations").then(function(e){return e.L});case"./translations/locales/eu.json":return import("service-catalog-translations").then(function(e){return e.M});case"./translations/locales/fa-af.json":return import("service-catalog-translations").then(function(e){return e.N});case"./translations/locales/fa.json":return import("service-catalog-translations").then(function(e){return e.O});case"./translations/locales/fi.json":return import("service-catalog-translations").then(function(e){return e.P});case"./translations/locales/fil.json":return import("service-catalog-translations").then(function(e){return e.Q});case"./translations/locales/fo.json":return import("service-catalog-translations").then(function(e){return e.R});case"./translations/locales/fr-ca.json":return import("service-catalog-translations").then(function(e){return e.S});case"./translations/locales/fr-dz.json":return import("service-catalog-translations").then(function(e){return e.T});case"./translations/locales/fr-mu.json":return import("service-catalog-translations").then(function(e){return e.U});case"./translations/locales/fr.json":return import("service-catalog-translations").then(function(e){return e.V});case"./translations/locales/ga.json":return import("service-catalog-translations").then(function(e){return e.W});case"./translations/locales/gl.json":return import("service-catalog-translations").then(function(e){return e.X});case"./translations/locales/he.json":return import("service-catalog-translations").then(function(e){return e.Y});case"./translations/locales/hi.json":return import("service-catalog-translations").then(function(e){return e.Z});case"./translations/locales/hr.json":return import("service-catalog-translations").then(function(e){return e._});case"./translations/locales/hu.json":return import("service-catalog-translations").then(function(e){return e.$});case"./translations/locales/hy.json":return import("service-catalog-translations").then(function(e){return e.a0});case"./translations/locales/id.json":return import("service-catalog-translations").then(function(e){return e.a1});case"./translations/locales/is.json":return import("service-catalog-translations").then(function(e){return e.a2});case"./translations/locales/it-ch.json":return import("service-catalog-translations").then(function(e){return e.a3});case"./translations/locales/it.json":return import("service-catalog-translations").then(function(e){return e.a4});case"./translations/locales/ja.json":return import("service-catalog-translations").then(function(e){return e.a5});case"./translations/locales/ka.json":return import("service-catalog-translations").then(function(e){return e.a6});case"./translations/locales/kk.json":return import("service-catalog-translations").then(function(e){return e.a7});case"./translations/locales/kl-dk.json":return import("service-catalog-translations").then(function(e){return e.a8});case"./translations/locales/km.json":return import("service-catalog-translations").then(function(e){return e.a9});case"./translations/locales/ko.json":return import("service-catalog-translations").then(function(e){return e.aa});case"./translations/locales/ku.json":return import("service-catalog-translations").then(function(e){return e.ab});case"./translations/locales/ky.json":return import("service-catalog-translations").then(function(e){return e.ac});case"./translations/locales/lt.json":return import("service-catalog-translations").then(function(e){return e.ad});case"./translations/locales/lv.json":return import("service-catalog-translations").then(function(e){return e.ae});case"./translations/locales/mk.json":return import("service-catalog-translations").then(function(e){return e.af});case"./translations/locales/mn.json":return import("service-catalog-translations").then(function(e){return e.ag});case"./translations/locales/ms.json":return import("service-catalog-translations").then(function(e){return e.ah});case"./translations/locales/mt.json":return import("service-catalog-translations").then(function(e){return e.ai});case"./translations/locales/my.json":return import("service-catalog-translations").then(function(e){return e.aj});case"./translations/locales/ne.json":return import("service-catalog-translations").then(function(e){return e.ak});case"./translations/locales/nl-be.json":return import("service-catalog-translations").then(function(e){return e.al});case"./translations/locales/nl.json":return import("service-catalog-translations").then(function(e){return e.am});case"./translations/locales/no.json":return import("service-catalog-translations").then(function(e){return e.an});case"./translations/locales/oc-es.json":return import("service-catalog-translations").then(function(e){return e.ao});case"./translations/locales/oc.json":return import("service-catalog-translations").then(function(e){return e.ap});case"./translations/locales/pl.json":return import("service-catalog-translations").then(function(e){return e.aq});case"./translations/locales/pt-br.json":return import("service-catalog-translations").then(function(e){return e.ar});case"./translations/locales/pt.json":return import("service-catalog-translations").then(function(e){return e.as});case"./translations/locales/ro-md.json":return import("service-catalog-translations").then(function(e){return e.at});case"./translations/locales/ro.json":return import("service-catalog-translations").then(function(e){return e.au});case"./translations/locales/ru.json":return import("service-catalog-translations").then(function(e){return e.av});case"./translations/locales/si.json":return import("service-catalog-translations").then(function(e){return e.aw});case"./translations/locales/sk.json":return import("service-catalog-translations").then(function(e){return e.ax});case"./translations/locales/sl.json":return import("service-catalog-translations").then(function(e){return e.ay});case"./translations/locales/sq.json":return import("service-catalog-translations").then(function(e){return e.az});case"./translations/locales/sr-me.json":return import("service-catalog-translations").then(function(e){return e.aA});case"./translations/locales/sr.json":return import("service-catalog-translations").then(function(e){return e.aB});case"./translations/locales/sv.json":return import("service-catalog-translations").then(function(e){return e.aC});case"./translations/locales/sw-ke.json":return import("service-catalog-translations").then(function(e){return e.aD});case"./translations/locales/ta.json":return import("service-catalog-translations").then(function(e){return e.aE});case"./translations/locales/th.json":return import("service-catalog-translations").then(function(e){return e.aF});case"./translations/locales/tr.json":return import("service-catalog-translations").then(function(e){return e.aG});case"./translations/locales/uk.json":return import("service-catalog-translations").then(function(e){return e.aH});case"./translations/locales/ur-pk.json":return import("service-catalog-translations").then(function(e){return e.aI});case"./translations/locales/ur.json":return import("service-catalog-translations").then(function(e){return e.aJ});case"./translations/locales/uz.json":return import("service-catalog-translations").then(function(e){return e.aK});case"./translations/locales/vi.json":return import("service-catalog-translations").then(function(e){return e.aL});case"./translations/locales/zh-cn.json":return import("service-catalog-translations").then(function(e){return e.aM});case"./translations/locales/zh-tw.json":return import("service-catalog-translations").then(function(e){return e.aN});default:return new Promise(function(t,n){("function"==typeof queueMicrotask?queueMicrotask:setTimeout)(n.bind(null,new Error("Unknown variable dynamic import: "+e)))})}}(`./translations/locales/${e}.json`)),de,O]),N.createRoot(e).render(o.jsx(P,{theme:M(),children:o.jsx(U,{helpCenterPath:i,children:o.jsx(_t,{...n,helpCenterPath:i})})}))}const $t="all-categories-virtual-id",Ct="uncategorized-virtual-id";function St(e){return"all_services"===e.built_in||e.id===$t}function qt(e){return"uncategorized"===e.built_in||e.id===Ct}function Lt(e,t){for(const n of e){if(n.id===t)return n;if(n.children?.length){const e=Lt(n.children,t);if(e)return e}}return null}function Et(e,t){for(const n of e){if(n.id===t)return[];if(n.children?.length){const e=Et(n.children,t);if(null!==e)return[n.id,...e]}}return null}const Tt=a.div`
  width: 100%;
`,It=a.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding-left: ${e=>20*Math.min(e.$nestingLevel,6)+"px"};
`,At=a.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 40px;
  padding-right: 12px;
  padding-left: ${e=>{const t=32+20*Math.min(e.$nestingLevel,6);return e.$hasChildren?"12px":`${t}px`}};
  cursor: pointer;
  background-color: ${e=>e.$active?s({theme:e.theme,hue:"blue",shade:100}):"transparent"};
  border-radius: 4px;

  &:hover {
    background-color: ${e=>e.$active?s({theme:e.theme,hue:"blue",shade:200}):s({theme:e.theme,hue:"grey",shade:100})};
  }
`,Rt=a.button`
  position: relative;
  /* Above the select button's overlay, so the toggle takes its own clicks. */
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  /* A 24px hit area around the 12px chevron (WCAG 2.5.8 target size); the
     negative margins keep the chevron exactly where it was. */
  width: 24px;
  height: 24px;
  margin-block: -6px;
  margin-inline: -6px 2px;
  color: ${({theme:e})=>s({theme:e,hue:"grey",shade:600})};
  flex-shrink: 0;

  &:hover {
    color: ${({theme:e})=>s({theme:e,hue:"grey",shade:800})};
  }

  svg {
    width: 12px;
    height: 12px;
  }
`,zt=a.button`
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 4px;
  }

  &:focus-visible {
    /* The row-wide ring below replaces the theme's own ring on the button. */
    outline: none;
    box-shadow: none;
  }

  &:focus-visible::after {
    /* The transparent outline is repainted in forced-colors mode, where the
       box-shadow ring is dropped. */
    outline: 2px solid transparent;
    outline-offset: -2px;
    box-shadow: inset 0 0 0 2px
      ${e=>s({theme:e.theme,variable:"border.primaryEmphasis"})};
  }
`,Ft=a.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,Nt=a.span`
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  color: ${({theme:e})=>s({theme:e,variable:"foreground.subtle"})};
`,Pt=({category:t,nestingLevel:n,expandedCategories:s,onToggleExpand:a,selectedCategoryId:r,onSelect:i})=>{const l=(t.children?.length??0)>0,c=s.has(t.id),d=St(t),h=qt(t),m=r===t.id,{t:p,i18n:g}=u(),f=e.useId(),j=e.useId(),b=e.useId(),v="number"==typeof t.items_count,x=d?p("service-catalog-sidebar.all-services","All services"):h?p("service-catalog-sidebar.uncategorized","Uncategorized"):t.name,w=g.exists("service-catalog-sidebar.subcategories-named")?p("service-catalog-sidebar.subcategories-named","{{name}} subcategories",{name:x}):`${c?p("service-catalog-sidebar.collapse-category","Collapse"):p("service-catalog-sidebar.expand-category","Expand")} ${x}`;return o.jsxs(o.Fragment,{children:[o.jsx(Tt,{children:o.jsx(At,{$active:m,$nestingLevel:n,$hasChildren:l,"data-test-id":d?"sidebar-all-services":`sidebar-category-${t.id}`,children:o.jsxs(It,{$nestingLevel:l?n:0,children:[l&&o.jsx(Rt,{onClick:()=>a(t.id),"aria-label":w,"aria-expanded":c,"aria-controls":c?b:void 0,type:"button",children:c?o.jsx(D,{}):o.jsx(V,{})}),o.jsxs(zt,{onClick:()=>i(t.id),"aria-current":m?"true":void 0,"aria-labelledby":v?`${f} ${j}`:f,type:"button",children:[o.jsx(Ft,{id:f,children:x}),v&&o.jsx(Nt,{id:j,children:t.items_count})]})]})})}),l&&c&&o.jsx("div",{id:b,children:t.children?.map(e=>o.jsx(Pt,{category:e,nestingLevel:n+1,selectedCategoryId:r,onSelect:i,expandedCategories:s,onToggleExpand:a},e.id))})]})},Ut=a.div`
  width: ${250}px;

  @media (max-width: 768px) {
    width: 100%;
  }
`,Mt=a.button`
  display: none;

  svg {
    transform: rotate(${e=>e.$isOpen?"180deg":"0deg"});
    transition: transform var(--motion-fast) ease;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`,Ot=a.div`
  @media (max-width: 768px) {
    display: ${e=>e.$isOpen?"block":"none"};
  }
`,Ht=({categories:t,selectedCategoryId:n,onSelect:s})=>{const{t:a}=u(),[r,i]=e.useState(new Set),[l,c]=e.useState(!1),d=e.useCallback(e=>{i(t=>{const n=new Set(t);return n.has(e)?n.delete(e):n.add(e),n})},[]),h=e.useCallback(e=>{const n=new URLSearchParams(window.location.search);n.set("category_id",e),window.history.pushState({},"",`${window.location.pathname}?${n.toString()}`);const a=Et(t,e);a?.length&&i(e=>{const t=new Set(e);for(const e of a)t.add(e);return t}),s(e),c(!1)},[t,s]),m=e.useMemo(()=>n&&n!==$t?n===Ct?a("service-catalog-sidebar.uncategorized","Uncategorized"):Lt(t,n)?.name??a("service-catalog-sidebar.all-services","All services"):a("service-catalog-sidebar.all-services","All services"),[t,n,a]);return e.useEffect(()=>{if(n){const e=Et(t,n);return void(e?.length&&i(t=>{const n=new Set(t);for(const t of e)n.add(t);return n}))}const e=t[0];e&&s(e.id)},[t,n,s]),o.jsxs(Ut,{children:[o.jsxs(Mt,{type:"button",className:"svc-cat-sidebar-toggle",$isOpen:l,"aria-expanded":l,onClick:()=>c(e=>!e),children:[o.jsxs("span",{className:"svc-cat-sidebar-toggle-label",children:[a("service-catalog-sidebar.categories","Categories"),":"," ",m]}),o.jsx(V,{"aria-hidden":"true"})]}),o.jsx(Ot,{className:"svc-cat-sidebar-list",$isOpen:l,children:t.map(e=>o.jsx(Pt,{category:e,nestingLevel:0,selectedCategoryId:n,onSelect:h,expandedCategories:r,onToggleExpand:d},e.id))})]})},Dt=a.div`
  height: 100%;
`,Vt=a.a`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: ${e=>e.theme.borderRadii.md};
  padding: ${e=>e.theme.space.md};
  border: ${e=>e.theme.borders.sm}
    ${({theme:e})=>s({theme:e,hue:"grey",shade:300})};
  color: ${({theme:e})=>s({theme:e,variable:"foreground.default"})};

  &:hover {
    border-color: ${({theme:e})=>s({theme:e,variable:"border.primaryEmphasis"})};
  }

  &:hover,
  &:visited {
    text-decoration: none;
  }
`,Bt=a.div`
  font-size: var(--font-size-xs, 1rem);
  font-weight: ${e=>e.theme.fontWeights.semibold};
  word-break: break-word;
`,Gt=a.div`
  font-size: var(--font-size-2xs, 0.875rem);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  word-break: break-word;
`,Jt=a.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${e=>e.theme.space.xxs};
  color: ${({theme:e})=>s({theme:e,variable:"foreground.default"})};
  margin-top: ${e=>e.theme.space.sm};
`,Wt=({serviceItem:t,helpCenterPath:n,selectedCategoryId:s})=>{const a=s?`${n}/services/${t.id}?category_id=${s}`:`${n}/services/${t.id}`,r=e.useMemo(()=>pe(t.name||""),[t.name]),i=e.useMemo(()=>pe(d(t.description||"")),[t.description]);return o.jsx(Dt,{"data-testid":"service-catalog-list-item-container",children:o.jsxs(Vt,{href:a,children:[o.jsx(Re,{size:"medium",name:t.name,description:t.description,url:t.thumbnail_url}),o.jsxs(Jt,{children:[o.jsx(Bt,{children:r}),o.jsx(Gt,{children:i})]})]})})},Kt=a.div`
  display: flex;
  flex-direction: column;
  background-color: ${({theme:e})=>s({theme:e,hue:"grey",shade:300})};
  height: 100%;
  border-radius: ${e=>e.theme.borderRadii.md};
  padding: ${e=>e.theme.space.md};
  border: ${e=>e.theme.borders.sm}
    ${({theme:e})=>s({theme:e,hue:"grey",shade:300})};
`,Zt=()=>o.jsx(Kt,{"aria-hidden":"true","data-testid":"service-catalog-list-item-skeleton",children:o.jsx(k,{width:"100%",height:"140px"})}),Qt=a(B)`
  padding: 0;
`,Xt=a(B.Col)`
  @media (min-width: 0px) {
    margin-bottom: ${e=>e.theme.space.md};
  }
`,Yt=({count:e=8})=>{const t=Math.max(1,e);return o.jsx(Qt,{children:o.jsx(B.Row,{wrap:"wrap",children:Array.from({length:t},(e,t)=>o.jsx(Xt,{xs:12,sm:6,md:4,lg:3,children:o.jsx(Zt,{})},t))})})},en=a.div`
  padding: ${e=>e.theme.space.xl} 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${e=>e.theme.space.md};
`,tn=a.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${e=>e.theme.space.xxs};
`,nn=({helpCenterPath:e,searchInputValue:t})=>{const{t:n}=u();return o.jsxs(en,{children:[o.jsxs(tn,{children:[o.jsx(G,{children:n("service-catalog.empty-state.no-services","No services in sight")}),""===t?o.jsx(J,{children:n("service-catalog.empty-state.description","Once services are added to catalog, you'll find them here.")}):o.jsx(J,{children:n("service-catalog.empty-state.search-description","Try a different keyword, or clear the search to see all services.")})]}),""===t&&o.jsx(h,{isPrimary:!0,onClick:()=>{window.location.href=e},children:n("service-catalog.empty-state.go-to-homepage","Go to the homepage")})]})},sn=a(Z)`
  position: absolute;
  top: 4px;
  inset-inline-end: 4px;
`,an=({onChange:e})=>{const{t:t}=u();return o.jsx(W,{content:t("service-catalog.clear-search","Clear search"),placement:"bottom",size:"small",children:o.jsx(sn,{"aria-label":t("service-catalog.clear-search","Clear search"),size:"small",focusInset:!0,onClick:()=>e(""),children:o.jsx(K,{})})})},rn=a(Y)`
  align-items: center;
  width: 320px;
  @media (max-width: 768px) {
    width: 100%;
    display: flex;
  }
`,on=a(ee)`
  padding-inline-end: ${e=>7*e.theme.space.base}px;
`,ln=({searchInputValue:e,isLoading:t,onChange:n})=>{const{t:s}=u();return o.jsxs(rn,{className:"service-catalog-search",children:[o.jsx(rn.Label,{hidden:!0,children:s("service-catalog.search-services","Search for services")}),o.jsx(on,{start:o.jsx(X,{}),type:"search",autoComplete:"off",end:t&&e?o.jsx(Q,{}):void 0,value:e,placeholder:s("service-catalog.search-services","Search for services"),onChange:e=>n(e.target.value)}),!t&&e&&o.jsx(an,{onChange:n})]})};const cn="name_asc",un="sort",dn=new Set(["name_asc","name_desc","created_at_desc"]);function hn(e=window.location.search){const t=new URLSearchParams(e).get(un);return function(e){return"string"==typeof e&&dn.has(e)}(t)?t:cn}function mn(e){switch(e){case"name_asc":return{sort_by:"name",sort_order:"asc"};case"name_desc":return{sort_by:"name",sort_order:"desc"};case"created_at_desc":return{sort_by:"created_at",sort_order:"desc"}}}const pn=a(h)`
  white-space: nowrap;
  font-size: var(--font-size-2xs, 0.875rem);
`;function gn({selectedOption:e,onChange:t}){const{t:n}=u(),s={name_asc:n("service-catalog.sort.name-asc","A-Z"),name_desc:n("service-catalog.sort.name-desc","Z-A"),created_at_desc:n("service-catalog.sort.newest","Newest")},a=n("service-catalog.sort.aria-label","Sort services"),r=`${a}: ${s[e]}`;return o.jsx(q,{button:t=>o.jsxs(pn,{...t,className:"service-catalog-sort",isBasic:!0,size:"small","aria-label":r,children:[s[e],o.jsx(h.EndIcon,{children:o.jsx(S,{})})]}),onChange:({value:e})=>{e&&t(e)},children:o.jsxs($,{type:"radio","aria-label":a,children:[o.jsx(C,{value:"name_asc",isSelected:"name_asc"===e,children:s.name_asc}),o.jsx(C,{value:"name_desc",isSelected:"name_desc"===e,children:s.name_desc}),o.jsx(C,{value:"created_at_desc",isSelected:"created_at_desc"===e,children:s.created_at_desc})]})})}const fn=a(B.Col)`
  margin-bottom: ${e=>e.theme.space.md};
`,jn=a.div`
  gap: ${e=>6*e.theme.space.base+"px"};
  display: flex;
  flex-direction: column;
`,bn=a(B)`
  padding: 0;
`,vn=a(se).attrs({tag:"h2",isBold:!0})`
  margin-bottom: 8px;
  max-width: 100%;
  overflow-wrap: anywhere;
`,xn=a.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${e=>e.theme.space.sm};
  flex-wrap: wrap;
`,wn=a.span`
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;function yn({helpCenterPath:t,selectedCategoryId:n,selectedCategoryName:s}){const[a,r]=e.useState(""),i=e.useRef(a);i.current=a;const[l,c]=e.useState(hn),d=e.useRef(l);d.current=l,e.useEffect(()=>{const e=()=>{const e=hn();e!==d.current&&c(e)};return window.addEventListener("popstate",e),()=>window.removeEventListener("popstate",e)},[]);const{t:h}=u(),{serviceCatalogItems:m,meta:p,count:g,isLoading:f,errorFetchingItems:j,fetchServiceCatalogItems:b}=function(){const[t,n]=e.useState(null),[s,a]=e.useState(0),[r,o]=e.useState(!0),[i,l]=e.useState(null),[c,u]=e.useState([]),d=e.useCallback(async(e,t,s,r)=>{o(!0);const i=new URLSearchParams;if(i.set("page[size]",16..toString()),t){const[e,n]=t.split("=");e&&n&&i.set(e,n)}e&&i.set("query",e),s&&i.set("category_id",String(s)),r&&(i.set("sort_by",r.sort_by),i.set("sort_order",r.sort_order));try{const e=await fetch(`/api/v2/help_center/service_catalog/items/search?${i.toString()}`);if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);const t=await e.json();n(t.meta),u(t.service_catalog_items),a(t.count)}catch(e){l(e)}finally{o(!1)}},[]);return{serviceCatalogItems:c,meta:t,count:s,isLoading:r,errorFetchingItems:i,fetchServiceCatalogItems:d}}();if(e.useEffect(()=>{j&&A({title:h("service-catalog.service-list-error-title","Services couldn't be loaded"),message:h("service-catalog.service-list-error-message","Give it a moment and try it again"),type:"error"})},[j,h]),j)throw j;const v=e.useMemo(()=>te((e,t,n,s)=>b(e,t,n,mn(s)),300),[b]),x=function(e){return e?e===$t?null:e:null}(n),w=e.useRef(x),y=w.current!==x,_=e.useRef(0);f||(_.current=m.length);const k=y?void 0:_.current||void 0;e.useEffect(()=>{v.cancel(),w.current=x,b(i.current,null,x,mn(l))},[b,x,l,v]),e.useEffect(()=>()=>v.cancel(),[v]);const $=s===$t?h("service-catalog-sidebar.all-services","All services"):s===Ct?h("service-catalog-sidebar.uncategorized","Uncategorized"):s,C=h("service-catalog.service-count","{{count}} services",{"defaultValue.one":"{{count}} service",count:g}),S=!f&&!y;return o.jsxs(jn,{children:[$&&o.jsx(vn,{children:$}),o.jsx(ln,{searchInputValue:a,isLoading:f,onChange:e=>{r(e),v(e,null,x,l)}}),o.jsx(wn,{role:"status","data-service-count":!0,children:S?C:""}),!y&&o.jsxs(xn,{children:[o.jsx("span",{"aria-hidden":"true",children:C}),o.jsx(gn,{selectedOption:l,onChange:e=>{e!==l&&(!function(e){const t=new URLSearchParams(window.location.search);e===cn?t.delete(un):t.set(un,e);const n=t.toString(),s=n?`${window.location.pathname}?${n}`:window.location.pathname;window.history.pushState({},"",s)}(e),c(e))}})]}),f||y?o.jsx(Yt,{count:k}):o.jsxs(o.Fragment,{children:[o.jsx(bn,{children:o.jsx(B.Row,{wrap:"wrap",children:m.map(e=>o.jsx(fn,{xs:12,sm:6,md:4,lg:3,children:o.jsx(Wt,{serviceItem:e,helpCenterPath:t,selectedCategoryId:x})},e.id))})}),0===m.length&&o.jsx(nn,{helpCenterPath:t,searchInputValue:a}),p&&(p.before_cursor||p.after_cursor)&&o.jsxs(ne,{children:[o.jsx(ne.Previous,{onClick:()=>{p?.before_cursor&&b(a,"page[before]="+p.before_cursor,x,mn(l))},disabled:null===p.before_cursor,children:h("service-catalog.pagination.previous","Previous")}),o.jsx(ne.Next,{onClick:()=>{p?.after_cursor&&b(a,"page[after]="+p.after_cursor,x,mn(l))},disabled:null===p.after_cursor,children:h("service-catalog.pagination.next","Next")})]})]})]})}function _n(){return new URLSearchParams(window.location.search).get("category_id")}const kn=({helpCenterPath:t,categoryTree:n})=>{const s=n.length>0,[a,r]=e.useState(_n);e.useEffect(()=>{const e=()=>{r(_n())};return window.addEventListener("popstate",e),()=>window.removeEventListener("popstate",e)},[]);const i=e.useMemo(()=>{if(!a||!s)return null;if(a===$t)return $t;if(a===Ct)return Ct;const e=Lt(n,a);return e?St(e)?$t:qt(e)?Ct:e.name:null},[a,n,s]),l=e.useCallback(e=>{r(e)},[]);return o.jsxs(o.Fragment,{children:[s&&o.jsx("aside",{className:"service-catalog-sidebar",children:o.jsx(Ht,{categories:(c=n,c.filter(e=>!qt(e))),selectedCategoryId:a,onSelect:l})}),o.jsx("div",{className:"service-catalog-list",children:o.jsx(yn,{helpCenterPath:t,selectedCategoryId:s?a:null,selectedCategoryName:i})})]});var c},$n=a.div`
  width: ${250}px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`,Cn=a.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${e=>6*e.theme.space.base+"px"};
`,Sn=a(B)`
  padding: 0;
`,qn=a(B.Col)`
  @media (min-width: 0px) {
    margin-bottom: ${e=>e.theme.space.md};
  }
`,Ln=()=>o.jsxs($n,{children:[o.jsx(k,{width:"100%",height:"40px"}),o.jsx(k,{width:"100%",height:"40px"}),o.jsx(k,{width:"100%",height:"40px"}),o.jsx(k,{width:"80%",height:"40px"}),o.jsx(k,{width:"80%",height:"40px"}),o.jsx(k,{width:"100%",height:"40px"})]}),En=()=>o.jsxs(Cn,{children:[o.jsx(k,{width:"200px",height:"28px"}),o.jsx(k,{width:"320px",height:"40px"}),o.jsx(k,{width:"120px",height:"20px"}),o.jsx(Sn,{children:o.jsxs(B.Row,{wrap:"wrap",children:[o.jsx(qn,{xs:12,sm:6,md:4,lg:3,children:o.jsx(k,{width:"100%",height:"140px"})}),o.jsx(qn,{xs:12,sm:6,md:4,lg:3,children:o.jsx(k,{width:"100%",height:"140px"})}),o.jsx(qn,{xs:12,sm:6,md:4,lg:3,children:o.jsx(k,{width:"100%",height:"140px"})}),o.jsx(qn,{xs:12,sm:6,md:4,lg:3,children:o.jsx(k,{width:"100%",height:"140px"})})]})})]}),Tn=()=>o.jsxs(o.Fragment,{children:[o.jsx("aside",{className:"service-catalog-sidebar",children:o.jsx(Ln,{})}),o.jsx("div",{className:"service-catalog-list",children:o.jsx(En,{})})]});async function In({publishedOnly:e}){try{const t=new URLSearchParams({published_only:String(e)}),n=await fetch(`/api/v2/help_center/service_catalog/categories?${t.toString()}`);if(n.ok){const e=await n.json();return Array.isArray(e.service_catalog_categories)?e.service_catalog_categories:[]}return[]}catch{return[]}}async function An(e,t,n,s,a){const r=R(s);z(n);const i=M(),l=N.createRoot(e);l.render(o.jsx(P,{theme:i,children:o.jsx(Tn,{})}));const[,c]=await Promise.all([F(a,n,[H("service-catalog",e=>function(e){switch(e){case"./translations/locales/af.json":return import("service-catalog-translations").then(function(e){return e.a});case"./translations/locales/ar-x-pseudo.json":return import("service-catalog-translations").then(function(e){return e.b});case"./translations/locales/ar.json":return import("service-catalog-translations").then(function(e){return e.c});case"./translations/locales/az.json":return import("service-catalog-translations").then(function(e){return e.d});case"./translations/locales/be.json":return import("service-catalog-translations").then(function(e){return e.e});case"./translations/locales/bg.json":return import("service-catalog-translations").then(function(e){return e.f});case"./translations/locales/bn.json":return import("service-catalog-translations").then(function(e){return e.g});case"./translations/locales/bs.json":return import("service-catalog-translations").then(function(e){return e.h});case"./translations/locales/ca.json":return import("service-catalog-translations").then(function(e){return e.i});case"./translations/locales/cs.json":return import("service-catalog-translations").then(function(e){return e.j});case"./translations/locales/cy.json":return import("service-catalog-translations").then(function(e){return e.k});case"./translations/locales/da.json":return import("service-catalog-translations").then(function(e){return e.l});case"./translations/locales/de-de.json":return import("service-catalog-translations").then(function(e){return e.m});case"./translations/locales/de-x-informal.json":return import("service-catalog-translations").then(function(e){return e.n});case"./translations/locales/de.json":return import("service-catalog-translations").then(function(e){return e.o});case"./translations/locales/el.json":return import("service-catalog-translations").then(function(e){return e.p});case"./translations/locales/en-001.json":return import("service-catalog-translations").then(function(e){return e.q});case"./translations/locales/en-150.json":return import("service-catalog-translations").then(function(e){return e.r});case"./translations/locales/en-au.json":return import("service-catalog-translations").then(function(e){return e.s});case"./translations/locales/en-ca.json":return import("service-catalog-translations").then(function(e){return e.t});case"./translations/locales/en-gb.json":return import("service-catalog-translations").then(function(e){return e.u});case"./translations/locales/en-my.json":return import("service-catalog-translations").then(function(e){return e.v});case"./translations/locales/en-ph.json":return import("service-catalog-translations").then(function(e){return e.w});case"./translations/locales/en-se.json":return import("service-catalog-translations").then(function(e){return e.x});case"./translations/locales/en-us.json":return import("service-catalog-translations").then(function(e){return e.y});case"./translations/locales/en-x-dev.json":return import("service-catalog-translations").then(function(e){return e.z});case"./translations/locales/en-x-keys.json":return import("service-catalog-translations").then(function(e){return e.A});case"./translations/locales/en-x-obsolete.json":return import("service-catalog-translations").then(function(e){return e.B});case"./translations/locales/en-x-pseudo.json":return import("service-catalog-translations").then(function(e){return e.C});case"./translations/locales/en-x-test.json":return import("service-catalog-translations").then(function(e){return e.D});case"./translations/locales/es-419.json":return import("service-catalog-translations").then(function(e){return e.E});case"./translations/locales/es-ar.json":return import("service-catalog-translations").then(function(e){return e.F});case"./translations/locales/es-cl.json":return import("service-catalog-translations").then(function(e){return e.G});case"./translations/locales/es-es.json":return import("service-catalog-translations").then(function(e){return e.H});case"./translations/locales/es-mx.json":return import("service-catalog-translations").then(function(e){return e.I});case"./translations/locales/es-pe.json":return import("service-catalog-translations").then(function(e){return e.J});case"./translations/locales/es.json":return import("service-catalog-translations").then(function(e){return e.K});case"./translations/locales/et.json":return import("service-catalog-translations").then(function(e){return e.L});case"./translations/locales/eu.json":return import("service-catalog-translations").then(function(e){return e.M});case"./translations/locales/fa-af.json":return import("service-catalog-translations").then(function(e){return e.N});case"./translations/locales/fa.json":return import("service-catalog-translations").then(function(e){return e.O});case"./translations/locales/fi.json":return import("service-catalog-translations").then(function(e){return e.P});case"./translations/locales/fil.json":return import("service-catalog-translations").then(function(e){return e.Q});case"./translations/locales/fo.json":return import("service-catalog-translations").then(function(e){return e.R});case"./translations/locales/fr-ca.json":return import("service-catalog-translations").then(function(e){return e.S});case"./translations/locales/fr-dz.json":return import("service-catalog-translations").then(function(e){return e.T});case"./translations/locales/fr-mu.json":return import("service-catalog-translations").then(function(e){return e.U});case"./translations/locales/fr.json":return import("service-catalog-translations").then(function(e){return e.V});case"./translations/locales/ga.json":return import("service-catalog-translations").then(function(e){return e.W});case"./translations/locales/gl.json":return import("service-catalog-translations").then(function(e){return e.X});case"./translations/locales/he.json":return import("service-catalog-translations").then(function(e){return e.Y});case"./translations/locales/hi.json":return import("service-catalog-translations").then(function(e){return e.Z});case"./translations/locales/hr.json":return import("service-catalog-translations").then(function(e){return e._});case"./translations/locales/hu.json":return import("service-catalog-translations").then(function(e){return e.$});case"./translations/locales/hy.json":return import("service-catalog-translations").then(function(e){return e.a0});case"./translations/locales/id.json":return import("service-catalog-translations").then(function(e){return e.a1});case"./translations/locales/is.json":return import("service-catalog-translations").then(function(e){return e.a2});case"./translations/locales/it-ch.json":return import("service-catalog-translations").then(function(e){return e.a3});case"./translations/locales/it.json":return import("service-catalog-translations").then(function(e){return e.a4});case"./translations/locales/ja.json":return import("service-catalog-translations").then(function(e){return e.a5});case"./translations/locales/ka.json":return import("service-catalog-translations").then(function(e){return e.a6});case"./translations/locales/kk.json":return import("service-catalog-translations").then(function(e){return e.a7});case"./translations/locales/kl-dk.json":return import("service-catalog-translations").then(function(e){return e.a8});case"./translations/locales/km.json":return import("service-catalog-translations").then(function(e){return e.a9});case"./translations/locales/ko.json":return import("service-catalog-translations").then(function(e){return e.aa});case"./translations/locales/ku.json":return import("service-catalog-translations").then(function(e){return e.ab});case"./translations/locales/ky.json":return import("service-catalog-translations").then(function(e){return e.ac});case"./translations/locales/lt.json":return import("service-catalog-translations").then(function(e){return e.ad});case"./translations/locales/lv.json":return import("service-catalog-translations").then(function(e){return e.ae});case"./translations/locales/mk.json":return import("service-catalog-translations").then(function(e){return e.af});case"./translations/locales/mn.json":return import("service-catalog-translations").then(function(e){return e.ag});case"./translations/locales/ms.json":return import("service-catalog-translations").then(function(e){return e.ah});case"./translations/locales/mt.json":return import("service-catalog-translations").then(function(e){return e.ai});case"./translations/locales/my.json":return import("service-catalog-translations").then(function(e){return e.aj});case"./translations/locales/ne.json":return import("service-catalog-translations").then(function(e){return e.ak});case"./translations/locales/nl-be.json":return import("service-catalog-translations").then(function(e){return e.al});case"./translations/locales/nl.json":return import("service-catalog-translations").then(function(e){return e.am});case"./translations/locales/no.json":return import("service-catalog-translations").then(function(e){return e.an});case"./translations/locales/oc-es.json":return import("service-catalog-translations").then(function(e){return e.ao});case"./translations/locales/oc.json":return import("service-catalog-translations").then(function(e){return e.ap});case"./translations/locales/pl.json":return import("service-catalog-translations").then(function(e){return e.aq});case"./translations/locales/pt-br.json":return import("service-catalog-translations").then(function(e){return e.ar});case"./translations/locales/pt.json":return import("service-catalog-translations").then(function(e){return e.as});case"./translations/locales/ro-md.json":return import("service-catalog-translations").then(function(e){return e.at});case"./translations/locales/ro.json":return import("service-catalog-translations").then(function(e){return e.au});case"./translations/locales/ru.json":return import("service-catalog-translations").then(function(e){return e.av});case"./translations/locales/si.json":return import("service-catalog-translations").then(function(e){return e.aw});case"./translations/locales/sk.json":return import("service-catalog-translations").then(function(e){return e.ax});case"./translations/locales/sl.json":return import("service-catalog-translations").then(function(e){return e.ay});case"./translations/locales/sq.json":return import("service-catalog-translations").then(function(e){return e.az});case"./translations/locales/sr-me.json":return import("service-catalog-translations").then(function(e){return e.aA});case"./translations/locales/sr.json":return import("service-catalog-translations").then(function(e){return e.aB});case"./translations/locales/sv.json":return import("service-catalog-translations").then(function(e){return e.aC});case"./translations/locales/sw-ke.json":return import("service-catalog-translations").then(function(e){return e.aD});case"./translations/locales/ta.json":return import("service-catalog-translations").then(function(e){return e.aE});case"./translations/locales/th.json":return import("service-catalog-translations").then(function(e){return e.aF});case"./translations/locales/tr.json":return import("service-catalog-translations").then(function(e){return e.aG});case"./translations/locales/uk.json":return import("service-catalog-translations").then(function(e){return e.aH});case"./translations/locales/ur-pk.json":return import("service-catalog-translations").then(function(e){return e.aI});case"./translations/locales/ur.json":return import("service-catalog-translations").then(function(e){return e.aJ});case"./translations/locales/uz.json":return import("service-catalog-translations").then(function(e){return e.aK});case"./translations/locales/vi.json":return import("service-catalog-translations").then(function(e){return e.aL});case"./translations/locales/zh-cn.json":return import("service-catalog-translations").then(function(e){return e.aM});case"./translations/locales/zh-tw.json":return import("service-catalog-translations").then(function(e){return e.aN});default:return new Promise(function(t,n){("function"==typeof queueMicrotask?queueMicrotask:setTimeout)(n.bind(null,new Error("Unknown variable dynamic import: "+e)))})}}(`./translations/locales/${e}.json`)),de,O]),In({publishedOnly:!("undefined"!=typeof window&&new URLSearchParams(window.location.search).get(ve)===xe)})]);l.render(o.jsx(P,{theme:i,children:o.jsx(U,{helpCenterPath:r,fallback:o.jsx("div",{className:"service-catalog-list",children:o.jsx(ae,{helpCenterPath:r})}),children:o.jsx(kn,{helpCenterPath:r,categoryTree:c})})}))}export{kt as renderServiceCatalogItem,An as renderServiceCatalogPage};
