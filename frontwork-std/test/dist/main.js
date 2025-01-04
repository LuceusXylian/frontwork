function G(s){let e=s.split("://");if(e.length<2)throw new Error("Invalid URL: "+s);let t=e[0],n=e[1].split("?"),r=n[0].split("/"),o=r[0],i;if(r.length<2)i="/";else{i="";for(let d=1;d<r.length;d++)i+="/"+r[d]}let a,l;if(n.length>1){let d=n[1].split("#");a=d[0],l=d.length>1?d[1]:""}else a="",l="";return{protocol:t,host:o,path:i,query_string:a,fragment:l}}function C(s,e,t){let n={},r=s.split(e);for(let o=0;o<r.length;o++){let a=r[o].split(t);a[0]!==""&&(a.length===2?n[a[0]]=a[1]:n[a[0]]="")}return n}function H(s,e){for(let t=0;t<e.length;t++){let n=e[t];s.setAttribute(n.name,n.value)}}var c={is_client_side:!0,reporter_client_to_server:!0,verbose_logging:!1,reporter:function(s,e,t,n,r){c.reporter_client_to_server&&c.is_client_side&&fetch(location.protocol+"//"+location.host+"//dr",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({report_text:t})}),s===2?r===null?console.error(t):console.error(t,r):s===1?console.warn(t):s===0&&console.log(t)}},h=class{element;created_element;constructor(e,t){this.element=e,this.created_element=t}append_to(e){return this.created_element&&e.element.appendChild(this.element),this}add_event(e,t,n){this.created_element&&this.element.addEventListener(e,t,n)}replace_text(e,t){this.created_element&&(this.element.innerText=this.element.innerText.split(e).join(t))}replace_html(e,t){this.created_element&&(this.element.innerHTML=this.element.innerHTML.split(e).join(t))}then(e){this.created_element&&e()}},v=class extends h{constructor(e,t,n,r){super(e.ensure_element("form",t,{action:n,method:r}).element,e.do_building),this.element.setAttribute("fw-form","1")}};var F=class{locales;selected_locale;constructor(e){if(e.length===0)throw new Error("I18n: No locales provided");this.locales=e,this.selected_locale=e[0]}set_locale(e){c.verbose_logging&&c.reporter(0,"I18n",'    Setting locale to "'+e+'"',null,null);let t=this.locales.find(n=>n.locale===e);return t===void 0?(c.reporter(2,"I18n","Locale '"+e+"' does not exist",null,null),!1):(this.selected_locale=t,!0)}get_translation(e){return this.selected_locale.get_translation(e)}get_translation_with_replace(e,t,n){return this.get_translation(e).split(t).join(n)}},y=class{locale;translations;constructor(e,t){this.locale=e,this.translations=t}get_translation(e){let t=this.translations[e];return t===void 0?(c.reporter(2,"I18n","    Missing translation for the locale '"+this.locale+`': ,"`+e+'": "translated_text"',null,null),""):t}},x=class{items;constructor(e){this.items=e}get(e){let t=this.items[e];return t===void 0?null:t}forEach(e){Object.entries(this.items).forEach(([t,n])=>{e(t,n)})}},D=class extends x{constructor(e){super(e)}},g=class extends x{constructor(e){super(e)}async from_request(e){let t=e.headers.get("content-type");if(t!==null&&(t=t.split(";")[0],e.body!==null)){if(t==="application/x-www-form-urlencoded"){let n=e.body.getReader();n!==null&&await n.read().then(r=>{if(r.value!==null){let o=new TextDecoder().decode(r.value);this.items=C(o,"&","=")}})}else if(t==="application/json"){let n=e.body.getReader();n!==null&&await n.read().then(r=>{if(r.value!==null){let o=new TextDecoder().decode(r.value);this.items=JSON.parse(o)}})}}return this}},q=class extends x{constructor(e){super(e)}};var f=class{headers;method;url;protocol;host;path;path_dirs;query_string;fragment;GET;POST;COOKIES;constructor(e,t,n,r){let o=G(t);this.headers=n,this.method=e,this.url=t,this.protocol=o.protocol,this.host=o.host,this.path=o.path,this.path_dirs=decodeURIComponent(o.path.replace(/\+/g,"%20")).split("/"),this.query_string=o.query_string,this.fragment=o.fragment,this.GET=new D(C(o.query_string,"&","=")),this.POST=r;let i=this.headers.get("cookie");this.COOKIES=new q(i===null?{}:C(i,"; ","="))}__request_text(e){let t=this.method+" "+this.path;this.query_string!==""&&(t+="?"+this.query_string),t+=" ["+e+"]";let n=Object.keys(this.POST.items);return n.length!==0&&(t+=`
    Scope POST: `,n.forEach(r=>{t+=`
        `+r+' = "'+this.POST.items[r]+'"'})),t}log(e,t){c.verbose_logging&&c.reporter(0,e,this.__request_text(e),t,null)}error(e,t,n){c.reporter(2,e,this.__request_text(e),t,n)}},_=class{status_code;mime_type="text/html";content;headers=[];cookies=[];constructor(e,t){this.status_code=e,this.content=t}set_mime_type(e){return this.mime_type=e,this}add_header(e,t){return this.headers.push([e,t]),this}get_header(e){for(let t of this.headers)if(t[0]===e)return t[1];return null}set_cookie(e){for(let t=0;t<this.cookies.length;t++)if(this.cookies[t].name===e.name)return this.cookies[t]=e,this;return this.cookies.push(e),this}into_response(){let e=new Response(this.content.toString(),{status:this.status_code});e.headers.set("content-type",this.mime_type);for(let t=0;t<this.headers.length;t++){let n=this.headers[t];e.headers.set(n[0],n[1])}for(let t=0;t<this.cookies.length;t++){let n=this.cookies[t];e.headers.append("set-cookie",n.to_string())}return e}},E=class{context;doctype;constructor(e){this.context=e,this.doctype="<!DOCTYPE html>",this.set_html_lang(e.i18n.selected_locale.locale)}head_append_tag(e,t){let n=document.createElement(e);if(t)for(let r in t)n.setAttribute(r,t[r]);return this.context.document_head.append(n),this}add_head_meta_data(e,t,n){this.context.document_head.appendChild(document.createElement("meta")).setAttribute("charset","UTF-8");let o=this.context.document_head.appendChild(document.createElement("meta"));o.setAttribute("http-equiv","X-UA-Compatible"),o.setAttribute("content","IE=edge");let i=this.context.document_head.appendChild(document.createElement("meta"));i.setAttribute("name","viewport"),i.setAttribute("content","width=device-width, initial-scale=1, maximum-scale=1");let a=this.context.document_head.appendChild(document.createElement("title"));a.innerHTML=e;let l=this.context.document_head.appendChild(document.createElement("meta"));l.setAttribute("name","description"),l.setAttribute("content",t);let d=this.context.document_head.appendChild(document.createElement("meta"));return d.setAttribute("name","robots"),d.setAttribute("content",n),this}add_head_meta_opengraph_website(e,t,n,r){let o=this.context.document_head.appendChild(document.createElement("meta"));o.setAttribute("property","og:type"),o.setAttribute("content","website");let i=this.context.document_head.appendChild(document.createElement("meta"));i.setAttribute("property","og:url"),i.setAttribute("content",n);let a=this.context.document_head.appendChild(document.createElement("meta"));a.setAttribute("property","og:title"),a.setAttribute("content",e);let l=this.context.document_head.appendChild(document.createElement("meta"));l.setAttribute("property","og:description"),l.setAttribute("content",t);let d=this.context.document_head.appendChild(document.createElement("meta"));return d.setAttribute("property","og:image"),d.setAttribute("content",r),this}set_html_lang(e){return this.context.document_html.setAttribute("lang",e),this}body_append(e){return this.context.document_body.append(e.element),e}html(){let e=this.context.document_head.appendChild(document.createElement("link"));e.setAttribute("id","fw-style"),e.setAttribute("rel","stylesheet"),e.setAttribute("href","/assets/style.css"),e.setAttribute("type","text/css");let t=this.context.document_body.appendChild(document.createElement("script"));return t.setAttribute("id","fw-script"),t.setAttribute("src","/assets/main.js"),t.setAttribute("type","text/javascript"),this.context.document_html}toString(){let e=this.html();return this.doctype+`
`+e.outerHTML}},L=class extends _{constructor(e,t){c.verbose_logging&&c.reporter(0,"REDIRECT","    ["+t+" REDIRECT]-> "+e,null,null),super(t,"redirecting..."),this.add_header("Location",e)}},J=0,m=class{id;path;component;constructor(e,t){this.path=e,this.component=t,this.id=J,J+=1}};var R=class{platform;stage;client_ip;api_protocol_address;api_protocol_address_ssr;i18n;request;do_building;document_html;document_head;document_body;set_cookies=[];constructor(e,t,n,r,o,i,a,l){this.platform=e,this.stage=t,this.client_ip=n,this.api_protocol_address=r,this.api_protocol_address_ssr=o,this.i18n=i,this.request=a,this.do_building=l,this.document_html=document.createElement("html"),this.document_head=this.document_html.appendChild(document.createElement("head")),this.document_body=this.document_html.appendChild(document.createElement("body"))}create_element(e,t){let n=document.createElement(e);if(t)for(let r in t)n.setAttribute(r,t[r]);return new h(n,this.do_building)}ensure_element(e,t,n){let r=this.do_building?this.document_html.querySelector("#"+t):document.getElementById(t);if(r!==null)return new h(r,this.do_building);let o=document.createElement(e);if(o.id=t,n)for(let i in n)o.setAttribute(i,n[i]);return new h(o,!0)}ensure_text_element(e,t,n){let r=this.do_building?this.document_html.querySelector("#"+t):document.getElementById(t);if(r!==null)return new h(r,this.do_building);let o=document.createElement(e);if(o.id=t,o.innerText=this.i18n.get_translation(t),n)for(let i in n)o.setAttribute(i,n[i]);return new h(o,!0)}async api_request(e,t,n,r={}){let o=(c.is_client_side?this.api_protocol_address:this.api_protocol_address_ssr)+t,i=r;i.method=e,i.headers=r.headers?r.headers:new Headers;let a="",l=Object.entries(n);if(l.length>0){a+=l[0][0]+"="+l[0][1];for(let u=1;u<l.length;u++)a+="&"+l[u][0]+"="+l[u][1]}if(e==="GET"?a.length>0&&(o+="?"+a):(i.body=a,i.headers.set("Content-Type","application/x-www-form-urlencoded")),!c.is_client_side){let u="";this.request.COOKIES.forEach((b,V)=>{u+=b+"="+V+"; "}),i.headers.set("Cookie",u),i.headers.set("X-Forwarded-For",this.client_ip)}let d=await fetch(o,i);if(c.is_client_side||d.headers.getSetCookie().forEach(b=>this.set_cookies.push(b)),!d.ok){console.error("ERROR executing api_request(",e,t,`)
`,d);try{let u=await d.json();return u.status=d.status,{ok:!1,err:u}}catch{return console.error("Could not parse ApiErrorResponse for api_request("+e+" "+t+")"),{ok:!1,err:{status:501,error_message:"API did not returned parsable JSON"}}}}return{ok:!0,val:await d.json()}}},S=class{platform;stage;port;api_protocol_address;api_protocol_address_ssr;domain_to_route_selector;middleware;i18n;constructor(e){this.platform=e.platform,this.stage=e.stage,this.port=e.port,this.api_protocol_address=e.api_protocol_address,this.api_protocol_address_ssr=e.api_protocol_address_ssr,this.domain_to_route_selector=e.domain_to_route_selector,this.middleware=e.middleware,this.i18n=e.i18n,this.stage===0&&(c.verbose_logging=!0)}async route_resolver(e){let t=await this.domain_to_route_selector(e);for(let n=0;n<t.length;n++){let r=t[n],o=r.path.split("/");if(e.request.path_dirs.length===o.length){for(let i=0;i<o.length;i++)if(e.request.path_dirs.length===o.length){let a=!0;for(let l=0;l<o.length;l++){let d=o[l];if(d!=="*"&&d!==e.request.path_dirs[l]){a=!1;break}}if(a)return c.verbose_logging&&e.request.log("ROUTE #"+r.id+" ("+r.path+")",e),r}}}return null}async route_execute_build(e,t){if(t)try{let n=new t.component(e);return{reponse:await n.build(e),component:n}}catch(n){return e.request.error("ROUTE #"+t.id+" ("+t.path+")",e,n),{reponse:await this.middleware.error_handler_component.build(e),component:this.middleware.error_handler_component}}c.verbose_logging&&e.request.log("NOT_FOUND",e);try{let n=new this.middleware.not_found_handler(e);return{reponse:await n.build(e),component:n}}catch(n){return e.request.error("NOT_FOUND",e,n),{reponse:await this.middleware.error_handler_component.build(e),component:this.middleware.error_handler_component}}}},A=class{error_handler;error_handler_component;not_found_handler;before_route;redirect_lonely_slash;constructor(e){this.error_handler=e.error_handler,this.error_handler_component={async build(t){return t.document_head.innerHTML="",t.document_body.innerHTML="",e.error_handler(t)},dom_ready(){}},this.not_found_handler=e.not_found_handler,this.before_route=e.before_route,this.redirect_lonely_slash=e&&e.redirect_lonely_slash?e.redirect_lonely_slash:!0}};var M=class extends S{build_on_page_load;page_change_ready=!0;page_change_previous_abort_controller=null;is_page_change_ready(){return this.page_change_ready}constructor(e){if(super(e),typeof e.build_on_page_load=="boolean"?this.build_on_page_load=e.build_on_page_load:this.build_on_page_load=!1,document.addEventListener("DOMContentLoaded",()=>{let t=new f("GET",location.toString(),new Headers,new g({}));this.page_change(t,this.build_on_page_load,!1)}),document.addEventListener("click",async t=>{let n=t.target;n.tagName==="A"&&(this.page_change_ready?await this.page_change_to(n.href,!1)&&t.preventDefault():t.preventDefault())},!1),document.addEventListener("click",async t=>{let n=t.target;if(n.tagName==="A"&&(n.target===""||n.target==="_self")){let r=new URL(n.href);if(r.hostname!==""&&r.hostname!==window.location.hostname)return;this.page_change_ready?await this.page_change_to(n.href,!1)&&t.preventDefault():t.preventDefault()}},!1),document.addEventListener("submit",async t=>{let n=t.target;if(console.log("FrontworkClientTEST target",n),console.log("FrontworkClientTEST target.tagName === FORM",n.tagName==="FORM"),console.log("FrontworkClientTEST fw-form",n.getAttribute("fw-form")!==null),console.log("FrontworkClientTEST fw-form",n.getAttribute("fw-form")),n.tagName==="FORM"&&n.getAttribute("fw-form")!==null){let r=t.submitter;r=r&&r.name?r:null;let o=await this.page_change_form(n,r);console.log("page_change_form result",o),o&&t.preventDefault()}}),addEventListener("popstate",t=>{if(this.page_change_ready){let n=t.state;if(n&&n.url){let r=new f("GET",n.url,new Headers,new g({}));this.page_change(r,!0,!0)}}else history.pushState(null,"",window.location.pathname)}),this.stage===0){console.info("hot-reloading is enabled; Make sure this is the development environment");let t=0,n=()=>{let r=new WebSocket("ws://"+location.host+"//ws");r.onopen=function(){r.send("REQUEST::SERVICE_STARTED"),t===2?location.reload():t=1},r.onclose=function(){t=2,setTimeout(n,1e3)},r.onerror=function(){r.close()}};n()}}async page_change(e,t,n){if(this.page_change_ready||n){this.page_change_previous_abort_controller!==null&&this.page_change_previous_abort_controller.abort();let r=new AbortController;this.page_change_previous_abort_controller=r;let o=new R(this.platform,this.stage,"127.0.0.1",this.api_protocol_address,this.api_protocol_address_ssr,this.i18n,e,t),i=await this.route_resolver(o);try{this.middleware.before_route.build(o),this.middleware.before_route.dom_ready(o,this)}catch(a){o.request.error("before_route",o,a)}if(t){let a=await this.route_execute_build(o,i);if(r.signal.aborted)return this.page_change_ready=!0,null;if(a.reponse.cookies.forEach(d=>{d.http_only===!1&&(document.cookie=d.toString())}),a.reponse.status_code===301||a.reponse.status_code===302){let d=a.reponse.get_header("Location");return d===null?(c.reporter(2,"REDIRECT","Tried to redirect: Status Code is 301, but Location header is null",o,null),this.page_change_ready=!0,null):(c.verbose_logging&&c.reporter(0,"REDIRECT","Redirect to: "+d,o,null),this.page_change_to(d,!0),this.page_change_ready=!0,{method:e.method,url:o.request.url,is_redirect:!0,status_code:a.reponse.status_code})}let l=a.reponse.content;if(typeof l.context.document_html<"u"){l.html(),H(document.children[0],l.context.document_html.attributes),H(document.head,l.context.document_head.attributes),document.head.innerHTML=l.context.document_head.innerHTML;let d=document.body.parentElement;if(document.body!==null&&document.body.remove(),d!==null){for(let p=0;p<o.document_body.children.length;p++){let u=o.document_body.children[p];u.tagName==="SCRIPT"&&u.remove()}d.append(o.document_body)}return a.component.dom_ready(o,this),this.page_change_ready=!0,{method:e.method,url:e.url,is_redirect:!1,status_code:a.reponse.status_code}}}else i?new i.component(o).dom_ready(o,this):new this.middleware.not_found_handler(o).dom_ready(o,this);this.page_change_ready=!0}return null}async page_change_to(e,t){c.verbose_logging&&c.reporter(0,"PageChange","    page_change_to: "+e,null,null);let n,r=e.indexOf("//");r===0||r===5||r===6?n=e:n=location.protocol+"//"+location.host+e;let o=new f("GET",n,new Headers,new g({})),i=await this.page_change(o,!0,t===!0);return i!==null?(i.is_redirect||history.pushState(i,document.title,n),!0):!1}async page_change_form(e,t){this.page_change_ready=!1,c.verbose_logging&&c.reporter(0,"PageChange","page_change_form",null,null);let n=e.getAttribute("method");n===null&&(n="POST");let r,o=e.getAttribute("action");o===""?r=location.protocol+"//"+location.host+window.location.pathname.toString():r=location.protocol+"//"+location.host+o,this.middleware.redirect_lonely_slash&&r.substring(r.length-1)==="/"&&(r=r.substring(0,r.length-1));let i=new FormData(e),a=new g({});if(n==="GET"){let p=!0;i.forEach((u,b)=>{p?(p=!1,r+="?"):r+="&",r+=b+"="+encodeURIComponent(u.toString())}),t!==null&&(r+=(p?"?":"&")+t.name+"="+t.value)}else i.forEach((p,u)=>a.items[u]=p.toString()),t!==null&&(a.items[t.name]=t.value);let l=new f(n,r,new Headers,a),d=await this.page_change(l,!0,!0);return console.log("page_change_form result inner",d),d!==null?(d.is_redirect||history.pushState(d,document.title,r),!0):!1}};var X={title1:"Frontwork Test Page",text1:"This is a test page for the Frontwork framework.",title2:"Test Form","test-page2":"Test Page 2",another_title1:"Hello from 127.0.0.1",another_text1:"Yes you can have different domains :)","a-home":"Home","a-test2":"Test2","a-test3":"Test3","a-german":"German","a-crash":"Crash",event_button_tester:"Event Button Tester",formtest_title_fail:"This form test was sent to the Deno server!",formtest_title_ok:"This form test was not sent to the Deno server :)",submit_button:"Submit"};var Y={title1:"Frontwork Test Seite",text1:"Dies ist eine deutsche Test Seite f\xFCr das Frontwork framework.",title2:"Test Formular","a-home":"Startseite","a-test2":"Testseite2","a-test3":"Testseite3","a-german":"Deutsch","a-crash":"Absturz",event_button_tester:"Ereignistastentester",formtest_title_fail:"Dieser Formtest wurde an den Deno Server gesendet!",formtest_title_ok:"Dieser Formtest wurde nicht an den Deno Server gesendet :)",submit_button:"Senden"};var z=new F([new y("en",X),new y("de",Y)]);var w=class extends E{main;constructor(e){super(e);let t=this.body_append(e.create_element("header"));e.ensure_text_element("a","a-home",{href:"/"}).append_to(t),e.ensure_text_element("a","a-test2",{href:"/test2"}).append_to(t),e.ensure_text_element("a","a-test3",{href:"/test3"}).append_to(t),e.ensure_text_element("a","a-german",{href:"/german"}).append_to(t),e.ensure_text_element("a","a-crash",{href:"/crash"}).append_to(t),this.main=this.body_append(e.create_element("main"))}},O=class{async build(e){let t=new E(e),n=t.body_append(e.create_element("main"));return e.ensure_text_element("h1","another_title1").append_to(n),e.ensure_text_element("p","another_text1").append_to(n),new _(200,t)}async dom_ready(){}},I=class{button_event;constructor(e){this.button_event=e.ensure_text_element("button","event_button_tester",{type:"button"})}async build(e){let t=new w(e),n=e.ensure_text_element("h1","title1").append_to(t.main),r=e.ensure_text_element("p","text1").append_to(t.main);this.button_event.append_to(t.main);let o=e.create_element("section").append_to(t.main);if(e.ensure_text_element("h2","title2").append_to(o),e.request.GET.get("action")!==null){e.ensure_text_element("h3","formtest_title_"+(c.is_client_side?"ok":"fail")).append_to(o);for(let l=0;l<3;l++){let d=e.create_element("div").append_to(o);d.element.innerHTML="text"+l+": "+e.request.GET.get("text"+l)}}let a=new v(e,"test_form","","GET").append_to(o);for(let l=0;l<3;l++)e.ensure_element("input","input"+l,{type:"text",name:"text"+l,value:"asdsad"+l}).append_to(a);return e.ensure_text_element("button","submit_button",{type:"submit",name:"action",value:"sent"}).append_to(a),new _(200,t.add_head_meta_data(n.element.innerText,r.element.innerText,"noindex,nofollow"))}async dom_ready(e,t){try{let n=0;this.button_event.add_event("click",()=>{n++,this.button_event.element.innerHTML="Changed "+n+" times"})}catch(n){console.error(n)}}},N=class extends I{constructor(e){e.i18n.set_locale("de"),super(e)}async build(e){return await super.build(e)}async dom_ready(e,t){super.dom_ready(e,t)}},P=class{async build(e){let t=new w(e),n=e.ensure_text_element("h1","test-page2").append_to(t.main),r=e.ensure_element("p","description").append_to(t.main);return r.element.innerHTML="This is a test page <b>2</b> for the Frontwork framework. I will redirect you with js to the home page in 1 second.",c.reporter(1,"TEST","Warn counter test for Testworker",e,null),new _(200,t.add_head_meta_data(n.element.innerText,r.element.innerText,"noindex,nofollow"))}async dom_ready(e,t){setTimeout(()=>{t.page_change_to("/",!1)},1e3)}},B=class{async build(){return new L("/",301)}async dom_ready(){}},j=class{async build(e){let t=new w(e);return new _(200,t.add_head_meta_data("element_test","element_test","noindex,nofollow"))}async dom_ready(){}},T=class{async build(e){let t="Hello this is indeed first come, first served basis";return new _(200,t)}async dom_ready(e){}},k=class{async build(e){let t="Hello "+e.request.path_dirs[2];return new _(200,t)}async dom_ready(e){}},U=class{async build(e){return e.request.path_dirs[2]==="first-come-first-served"?new T().build(e):new k().build(e)}async dom_ready(e){e.request.path_dirs[2]==="first-come-first-served"&&new T().dom_ready(e),new k().dom_ready(e)}},K=class{async build(){throw new Error("Crash Test")}async dom_ready(){}},W=class{async build(e){let t=new w(e),n=e.document_body.appendChild(document.createElement("h1"));return n.innerText="ERROR 404 - Not found",new _(404,t.add_head_meta_data(n.innerText,n.innerText,"noindex,nofollow"))}async dom_ready(){}},ne=[new m("/",I),new m("/test2",P),new m("/test3",B),new m("/german",N),new m("/crash",K),new m("/element_test",j),new m("/hello/first-come-first-served",T),new m("/hello/*",k),new m("/hi/*",U)],re=[new m("/",O)];function oe(s,e,t){return console.log("login"),new Promise(function(n,r){s.api_request("POST","/api/v1/account/login",{username:e,password:t}).then(function(o){o.ok&&(console.log("LOGIN SUCCESS"),console.log("Hello, "+o.val)),n(o)}).catch(function(o){r(o)})})}var se=new A({before_route:{build:async s=>{s.i18n.set_locale("en"),await oe(s,"TestUser","doesNotExist")},dom_ready:async()=>{console.log("ASDAAAAAAAAA")}},error_handler:async s=>{let e=new w(s),t=s.document_body.appendChild(document.createElement("h1"));return t.innerText="ERROR 500 - Internal server error",new _(500,e.add_head_meta_data(t.innerText,t.innerText,"noindex,nofollow"))},not_found_handler:W}),Q={platform:0,stage:0,port:8080,api_protocol_address:"",api_protocol_address_ssr:"http://localhost:40201",domain_to_route_selector:async s=>s.request.host.split(":")[0]==="127.0.0.1"?re:ne,middleware:se,i18n:z,build_on_page_load:!1};new M(Q);
