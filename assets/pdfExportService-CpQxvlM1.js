const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/pdfmake-C49klq0x.js","assets/index-CkYn1GFl.js","assets/index-Bu9hBU-6.css","assets/buildDocDefinition-Bqw4p6Ta.js"])))=>i.map(i=>d[i]);
import{t as mt,g as ft,a as ht,_ as N}from"./index-CkYn1GFl.js";function gt(t,e){const n=t.categories||[],r={categories:n.length,items:n.reduce((a,o)=>{var i;return a+(((i=o.items)==null?void 0:i.length)||0)},0)};return{schemaVersion:"1.0",documentId:t.id||crypto.randomUUID(),createdAtISO:new Date().toISOString(),locale:e,data:{project:t,totals:r}}}const J=6048e5,bt=864e5,B=Symbol.for("constructDateFrom");function M(t,e){return typeof t=="function"?t(e):t&&typeof t=="object"&&B in t?t[B](e):t instanceof Date?new t.constructor(e):new Date(e)}function P(t,e){return M(e||t,t)}let wt={};function F(){return wt}function C(t,e){var s,c,u,d;const n=F(),r=(e==null?void 0:e.weekStartsOn)??((c=(s=e==null?void 0:e.locale)==null?void 0:s.options)==null?void 0:c.weekStartsOn)??n.weekStartsOn??((d=(u=n.locale)==null?void 0:u.options)==null?void 0:d.weekStartsOn)??0,a=P(t,e==null?void 0:e.in),o=a.getDay(),i=(o<r?7:0)+o-r;return a.setDate(a.getDate()-i),a.setHours(0,0,0,0),a}function _(t,e){return C(t,{...e,weekStartsOn:1})}function K(t,e){const n=P(t,e==null?void 0:e.in),r=n.getFullYear(),a=M(n,0);a.setFullYear(r+1,0,4),a.setHours(0,0,0,0);const o=_(a),i=M(n,0);i.setFullYear(r,0,4),i.setHours(0,0,0,0);const s=_(i);return n.getTime()>=o.getTime()?r+1:n.getTime()>=s.getTime()?r:r-1}function I(t){const e=P(t),n=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds(),e.getMilliseconds()));return n.setUTCFullYear(e.getFullYear()),+t-+n}function pt(t,...e){const n=M.bind(null,e.find(r=>typeof r=="object"));return e.map(n)}function V(t,e){const n=P(t,e==null?void 0:e.in);return n.setHours(0,0,0,0),n}function yt(t,e,n){const[r,a]=pt(n==null?void 0:n.in,t,e),o=V(r),i=V(a),s=+o-I(o),c=+i-I(i);return Math.round((s-c)/bt)}function xt(t,e){const n=K(t,e),r=M(t,0);return r.setFullYear(n,0,4),r.setHours(0,0,0,0),_(r)}function Pt(t){return t instanceof Date||typeof t=="object"&&Object.prototype.toString.call(t)==="[object Date]"}function vt(t){return!(!Pt(t)&&typeof t!="number"||isNaN(+P(t)))}function Ot(t,e){const n=P(t,e==null?void 0:e.in);return n.setFullYear(n.getFullYear(),0,1),n.setHours(0,0,0,0),n}const Mt={lessThanXSeconds:{one:"less than a second",other:"less than {{count}} seconds"},xSeconds:{one:"1 second",other:"{{count}} seconds"},halfAMinute:"half a minute",lessThanXMinutes:{one:"less than a minute",other:"less than {{count}} minutes"},xMinutes:{one:"1 minute",other:"{{count}} minutes"},aboutXHours:{one:"about 1 hour",other:"about {{count}} hours"},xHours:{one:"1 hour",other:"{{count}} hours"},xDays:{one:"1 day",other:"{{count}} days"},aboutXWeeks:{one:"about 1 week",other:"about {{count}} weeks"},xWeeks:{one:"1 week",other:"{{count}} weeks"},aboutXMonths:{one:"about 1 month",other:"about {{count}} months"},xMonths:{one:"1 month",other:"{{count}} months"},aboutXYears:{one:"about 1 year",other:"about {{count}} years"},xYears:{one:"1 year",other:"{{count}} years"},overXYears:{one:"over 1 year",other:"over {{count}} years"},almostXYears:{one:"almost 1 year",other:"almost {{count}} years"}},kt=(t,e,n)=>{let r;const a=Mt[t];return typeof a=="string"?r=a:e===1?r=a.one:r=a.other.replace("{{count}}",e.toString()),n!=null&&n.addSuffix?n.comparison&&n.comparison>0?"in "+r:r+" ago":r};function q(t){return(e={})=>{const n=e.width?String(e.width):t.defaultWidth;return t.formats[n]||t.formats[t.defaultWidth]}}const Dt={full:"EEEE, MMMM do, y",long:"MMMM do, y",medium:"MMM d, y",short:"MM/dd/yyyy"},St={full:"h:mm:ss a zzzz",long:"h:mm:ss a z",medium:"h:mm:ss a",short:"h:mm a"},Wt={full:"{{date}} 'at' {{time}}",long:"{{date}} 'at' {{time}}",medium:"{{date}}, {{time}}",short:"{{date}}, {{time}}"},Et={date:q({formats:Dt,defaultWidth:"full"}),time:q({formats:St,defaultWidth:"full"}),dateTime:q({formats:Wt,defaultWidth:"full"})},Tt={lastWeek:"'last' eeee 'at' p",yesterday:"'yesterday at' p",today:"'today at' p",tomorrow:"'tomorrow at' p",nextWeek:"eeee 'at' p",other:"P"},Ct=(t,e,n,r)=>Tt[t];function E(t){return(e,n)=>{const r=n!=null&&n.context?String(n.context):"standalone";let a;if(r==="formatting"&&t.formattingValues){const i=t.defaultFormattingWidth||t.defaultWidth,s=n!=null&&n.width?String(n.width):i;a=t.formattingValues[s]||t.formattingValues[i]}else{const i=t.defaultWidth,s=n!=null&&n.width?String(n.width):t.defaultWidth;a=t.values[s]||t.values[i]}const o=t.argumentCallback?t.argumentCallback(e):e;return a[o]}}const Yt={narrow:["B","A"],abbreviated:["BC","AD"],wide:["Before Christ","Anno Domini"]},jt={narrow:["1","2","3","4"],abbreviated:["Q1","Q2","Q3","Q4"],wide:["1st quarter","2nd quarter","3rd quarter","4th quarter"]},_t={narrow:["J","F","M","A","M","J","J","A","S","O","N","D"],abbreviated:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],wide:["January","February","March","April","May","June","July","August","September","October","November","December"]},Ft={narrow:["S","M","T","W","T","F","S"],short:["Su","Mo","Tu","We","Th","Fr","Sa"],abbreviated:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],wide:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},$t={narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"}},Lt={narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"}},Nt=(t,e)=>{const n=Number(t),r=n%100;if(r>20||r<10)switch(r%10){case 1:return n+"st";case 2:return n+"nd";case 3:return n+"rd"}return n+"th"},qt={ordinalNumber:Nt,era:E({values:Yt,defaultWidth:"wide"}),quarter:E({values:jt,defaultWidth:"wide",argumentCallback:t=>t-1}),month:E({values:_t,defaultWidth:"wide"}),day:E({values:Ft,defaultWidth:"wide"}),dayPeriod:E({values:$t,defaultWidth:"wide",formattingValues:Lt,defaultFormattingWidth:"wide"})};function T(t){return(e,n={})=>{const r=n.width,a=r&&t.matchPatterns[r]||t.matchPatterns[t.defaultMatchWidth],o=e.match(a);if(!o)return null;const i=o[0],s=r&&t.parsePatterns[r]||t.parsePatterns[t.defaultParseWidth],c=Array.isArray(s)?At(s,p=>p.test(i)):Rt(s,p=>p.test(i));let u;u=t.valueCallback?t.valueCallback(c):c,u=n.valueCallback?n.valueCallback(u):u;const d=e.slice(i.length);return{value:u,rest:d}}}function Rt(t,e){for(const n in t)if(Object.prototype.hasOwnProperty.call(t,n)&&e(t[n]))return n}function At(t,e){for(let n=0;n<t.length;n++)if(e(t[n]))return n}function Ht(t){return(e,n={})=>{const r=e.match(t.matchPattern);if(!r)return null;const a=r[0],o=e.match(t.parsePattern);if(!o)return null;let i=t.valueCallback?t.valueCallback(o[0]):o[0];i=n.valueCallback?n.valueCallback(i):i;const s=e.slice(a.length);return{value:i,rest:s}}}const Bt=/^(\d+)(th|st|nd|rd)?/i,It=/\d+/i,Vt={narrow:/^(b|a)/i,abbreviated:/^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,wide:/^(before christ|before common era|anno domini|common era)/i},Ut={any:[/^b/i,/^(a|c)/i]},Gt={narrow:/^[1234]/i,abbreviated:/^q[1234]/i,wide:/^[1234](th|st|nd|rd)? quarter/i},Qt={any:[/1/i,/2/i,/3/i,/4/i]},Xt={narrow:/^[jfmasond]/i,abbreviated:/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,wide:/^(january|february|march|april|may|june|july|august|september|october|november|december)/i},zt={narrow:[/^j/i,/^f/i,/^m/i,/^a/i,/^m/i,/^j/i,/^j/i,/^a/i,/^s/i,/^o/i,/^n/i,/^d/i],any:[/^ja/i,/^f/i,/^mar/i,/^ap/i,/^may/i,/^jun/i,/^jul/i,/^au/i,/^s/i,/^o/i,/^n/i,/^d/i]},Jt={narrow:/^[smtwf]/i,short:/^(su|mo|tu|we|th|fr|sa)/i,abbreviated:/^(sun|mon|tue|wed|thu|fri|sat)/i,wide:/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i},Kt={narrow:[/^s/i,/^m/i,/^t/i,/^w/i,/^t/i,/^f/i,/^s/i],any:[/^su/i,/^m/i,/^tu/i,/^w/i,/^th/i,/^f/i,/^sa/i]},Zt={narrow:/^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,any:/^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i},te={any:{am:/^a/i,pm:/^p/i,midnight:/^mi/i,noon:/^no/i,morning:/morning/i,afternoon:/afternoon/i,evening:/evening/i,night:/night/i}},ee={ordinalNumber:Ht({matchPattern:Bt,parsePattern:It,valueCallback:t=>parseInt(t,10)}),era:T({matchPatterns:Vt,defaultMatchWidth:"wide",parsePatterns:Ut,defaultParseWidth:"any"}),quarter:T({matchPatterns:Gt,defaultMatchWidth:"wide",parsePatterns:Qt,defaultParseWidth:"any",valueCallback:t=>t+1}),month:T({matchPatterns:Xt,defaultMatchWidth:"wide",parsePatterns:zt,defaultParseWidth:"any"}),day:T({matchPatterns:Jt,defaultMatchWidth:"wide",parsePatterns:Kt,defaultParseWidth:"any"}),dayPeriod:T({matchPatterns:Zt,defaultMatchWidth:"any",parsePatterns:te,defaultParseWidth:"any"})},ne={code:"en-US",formatDistance:kt,formatLong:Et,formatRelative:Ct,localize:qt,match:ee,options:{weekStartsOn:0,firstWeekContainsDate:1}};function re(t,e){const n=P(t,e==null?void 0:e.in);return yt(n,Ot(n))+1}function ae(t,e){const n=P(t,e==null?void 0:e.in),r=+_(n)-+xt(n);return Math.round(r/J)+1}function Z(t,e){var d,p,y,x;const n=P(t,e==null?void 0:e.in),r=n.getFullYear(),a=F(),o=(e==null?void 0:e.firstWeekContainsDate)??((p=(d=e==null?void 0:e.locale)==null?void 0:d.options)==null?void 0:p.firstWeekContainsDate)??a.firstWeekContainsDate??((x=(y=a.locale)==null?void 0:y.options)==null?void 0:x.firstWeekContainsDate)??1,i=M((e==null?void 0:e.in)||t,0);i.setFullYear(r+1,0,o),i.setHours(0,0,0,0);const s=C(i,e),c=M((e==null?void 0:e.in)||t,0);c.setFullYear(r,0,o),c.setHours(0,0,0,0);const u=C(c,e);return+n>=+s?r+1:+n>=+u?r:r-1}function oe(t,e){var s,c,u,d;const n=F(),r=(e==null?void 0:e.firstWeekContainsDate)??((c=(s=e==null?void 0:e.locale)==null?void 0:s.options)==null?void 0:c.firstWeekContainsDate)??n.firstWeekContainsDate??((d=(u=n.locale)==null?void 0:u.options)==null?void 0:d.firstWeekContainsDate)??1,a=Z(t,e),o=M((e==null?void 0:e.in)||t,0);return o.setFullYear(a,0,r),o.setHours(0,0,0,0),C(o,e)}function ie(t,e){const n=P(t,e==null?void 0:e.in),r=+C(n,e)-+oe(n,e);return Math.round(r/J)+1}function l(t,e){const n=t<0?"-":"",r=Math.abs(t).toString().padStart(e,"0");return n+r}const O={y(t,e){const n=t.getFullYear(),r=n>0?n:1-n;return l(e==="yy"?r%100:r,e.length)},M(t,e){const n=t.getMonth();return e==="M"?String(n+1):l(n+1,2)},d(t,e){return l(t.getDate(),e.length)},a(t,e){const n=t.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return n.toUpperCase();case"aaa":return n;case"aaaaa":return n[0];case"aaaa":default:return n==="am"?"a.m.":"p.m."}},h(t,e){return l(t.getHours()%12||12,e.length)},H(t,e){return l(t.getHours(),e.length)},m(t,e){return l(t.getMinutes(),e.length)},s(t,e){return l(t.getSeconds(),e.length)},S(t,e){const n=e.length,r=t.getMilliseconds(),a=Math.trunc(r*Math.pow(10,n-3));return l(a,e.length)}},S={midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},U={G:function(t,e,n){const r=t.getFullYear()>0?1:0;switch(e){case"G":case"GG":case"GGG":return n.era(r,{width:"abbreviated"});case"GGGGG":return n.era(r,{width:"narrow"});case"GGGG":default:return n.era(r,{width:"wide"})}},y:function(t,e,n){if(e==="yo"){const r=t.getFullYear(),a=r>0?r:1-r;return n.ordinalNumber(a,{unit:"year"})}return O.y(t,e)},Y:function(t,e,n,r){const a=Z(t,r),o=a>0?a:1-a;if(e==="YY"){const i=o%100;return l(i,2)}return e==="Yo"?n.ordinalNumber(o,{unit:"year"}):l(o,e.length)},R:function(t,e){const n=K(t);return l(n,e.length)},u:function(t,e){const n=t.getFullYear();return l(n,e.length)},Q:function(t,e,n){const r=Math.ceil((t.getMonth()+1)/3);switch(e){case"Q":return String(r);case"QQ":return l(r,2);case"Qo":return n.ordinalNumber(r,{unit:"quarter"});case"QQQ":return n.quarter(r,{width:"abbreviated",context:"formatting"});case"QQQQQ":return n.quarter(r,{width:"narrow",context:"formatting"});case"QQQQ":default:return n.quarter(r,{width:"wide",context:"formatting"})}},q:function(t,e,n){const r=Math.ceil((t.getMonth()+1)/3);switch(e){case"q":return String(r);case"qq":return l(r,2);case"qo":return n.ordinalNumber(r,{unit:"quarter"});case"qqq":return n.quarter(r,{width:"abbreviated",context:"standalone"});case"qqqqq":return n.quarter(r,{width:"narrow",context:"standalone"});case"qqqq":default:return n.quarter(r,{width:"wide",context:"standalone"})}},M:function(t,e,n){const r=t.getMonth();switch(e){case"M":case"MM":return O.M(t,e);case"Mo":return n.ordinalNumber(r+1,{unit:"month"});case"MMM":return n.month(r,{width:"abbreviated",context:"formatting"});case"MMMMM":return n.month(r,{width:"narrow",context:"formatting"});case"MMMM":default:return n.month(r,{width:"wide",context:"formatting"})}},L:function(t,e,n){const r=t.getMonth();switch(e){case"L":return String(r+1);case"LL":return l(r+1,2);case"Lo":return n.ordinalNumber(r+1,{unit:"month"});case"LLL":return n.month(r,{width:"abbreviated",context:"standalone"});case"LLLLL":return n.month(r,{width:"narrow",context:"standalone"});case"LLLL":default:return n.month(r,{width:"wide",context:"standalone"})}},w:function(t,e,n,r){const a=ie(t,r);return e==="wo"?n.ordinalNumber(a,{unit:"week"}):l(a,e.length)},I:function(t,e,n){const r=ae(t);return e==="Io"?n.ordinalNumber(r,{unit:"week"}):l(r,e.length)},d:function(t,e,n){return e==="do"?n.ordinalNumber(t.getDate(),{unit:"date"}):O.d(t,e)},D:function(t,e,n){const r=re(t);return e==="Do"?n.ordinalNumber(r,{unit:"dayOfYear"}):l(r,e.length)},E:function(t,e,n){const r=t.getDay();switch(e){case"E":case"EE":case"EEE":return n.day(r,{width:"abbreviated",context:"formatting"});case"EEEEE":return n.day(r,{width:"narrow",context:"formatting"});case"EEEEEE":return n.day(r,{width:"short",context:"formatting"});case"EEEE":default:return n.day(r,{width:"wide",context:"formatting"})}},e:function(t,e,n,r){const a=t.getDay(),o=(a-r.weekStartsOn+8)%7||7;switch(e){case"e":return String(o);case"ee":return l(o,2);case"eo":return n.ordinalNumber(o,{unit:"day"});case"eee":return n.day(a,{width:"abbreviated",context:"formatting"});case"eeeee":return n.day(a,{width:"narrow",context:"formatting"});case"eeeeee":return n.day(a,{width:"short",context:"formatting"});case"eeee":default:return n.day(a,{width:"wide",context:"formatting"})}},c:function(t,e,n,r){const a=t.getDay(),o=(a-r.weekStartsOn+8)%7||7;switch(e){case"c":return String(o);case"cc":return l(o,e.length);case"co":return n.ordinalNumber(o,{unit:"day"});case"ccc":return n.day(a,{width:"abbreviated",context:"standalone"});case"ccccc":return n.day(a,{width:"narrow",context:"standalone"});case"cccccc":return n.day(a,{width:"short",context:"standalone"});case"cccc":default:return n.day(a,{width:"wide",context:"standalone"})}},i:function(t,e,n){const r=t.getDay(),a=r===0?7:r;switch(e){case"i":return String(a);case"ii":return l(a,e.length);case"io":return n.ordinalNumber(a,{unit:"day"});case"iii":return n.day(r,{width:"abbreviated",context:"formatting"});case"iiiii":return n.day(r,{width:"narrow",context:"formatting"});case"iiiiii":return n.day(r,{width:"short",context:"formatting"});case"iiii":default:return n.day(r,{width:"wide",context:"formatting"})}},a:function(t,e,n){const a=t.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return n.dayPeriod(a,{width:"abbreviated",context:"formatting"});case"aaa":return n.dayPeriod(a,{width:"abbreviated",context:"formatting"}).toLowerCase();case"aaaaa":return n.dayPeriod(a,{width:"narrow",context:"formatting"});case"aaaa":default:return n.dayPeriod(a,{width:"wide",context:"formatting"})}},b:function(t,e,n){const r=t.getHours();let a;switch(r===12?a=S.noon:r===0?a=S.midnight:a=r/12>=1?"pm":"am",e){case"b":case"bb":return n.dayPeriod(a,{width:"abbreviated",context:"formatting"});case"bbb":return n.dayPeriod(a,{width:"abbreviated",context:"formatting"}).toLowerCase();case"bbbbb":return n.dayPeriod(a,{width:"narrow",context:"formatting"});case"bbbb":default:return n.dayPeriod(a,{width:"wide",context:"formatting"})}},B:function(t,e,n){const r=t.getHours();let a;switch(r>=17?a=S.evening:r>=12?a=S.afternoon:r>=4?a=S.morning:a=S.night,e){case"B":case"BB":case"BBB":return n.dayPeriod(a,{width:"abbreviated",context:"formatting"});case"BBBBB":return n.dayPeriod(a,{width:"narrow",context:"formatting"});case"BBBB":default:return n.dayPeriod(a,{width:"wide",context:"formatting"})}},h:function(t,e,n){if(e==="ho"){let r=t.getHours()%12;return r===0&&(r=12),n.ordinalNumber(r,{unit:"hour"})}return O.h(t,e)},H:function(t,e,n){return e==="Ho"?n.ordinalNumber(t.getHours(),{unit:"hour"}):O.H(t,e)},K:function(t,e,n){const r=t.getHours()%12;return e==="Ko"?n.ordinalNumber(r,{unit:"hour"}):l(r,e.length)},k:function(t,e,n){let r=t.getHours();return r===0&&(r=24),e==="ko"?n.ordinalNumber(r,{unit:"hour"}):l(r,e.length)},m:function(t,e,n){return e==="mo"?n.ordinalNumber(t.getMinutes(),{unit:"minute"}):O.m(t,e)},s:function(t,e,n){return e==="so"?n.ordinalNumber(t.getSeconds(),{unit:"second"}):O.s(t,e)},S:function(t,e){return O.S(t,e)},X:function(t,e,n){const r=t.getTimezoneOffset();if(r===0)return"Z";switch(e){case"X":return Q(r);case"XXXX":case"XX":return k(r);case"XXXXX":case"XXX":default:return k(r,":")}},x:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"x":return Q(r);case"xxxx":case"xx":return k(r);case"xxxxx":case"xxx":default:return k(r,":")}},O:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"O":case"OO":case"OOO":return"GMT"+G(r,":");case"OOOO":default:return"GMT"+k(r,":")}},z:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"z":case"zz":case"zzz":return"GMT"+G(r,":");case"zzzz":default:return"GMT"+k(r,":")}},t:function(t,e,n){const r=Math.trunc(+t/1e3);return l(r,e.length)},T:function(t,e,n){return l(+t,e.length)}};function G(t,e=""){const n=t>0?"-":"+",r=Math.abs(t),a=Math.trunc(r/60),o=r%60;return o===0?n+String(a):n+String(a)+e+l(o,2)}function Q(t,e){return t%60===0?(t>0?"-":"+")+l(Math.abs(t)/60,2):k(t,e)}function k(t,e=""){const n=t>0?"-":"+",r=Math.abs(t),a=l(Math.trunc(r/60),2),o=l(r%60,2);return n+a+e+o}const X=(t,e)=>{switch(t){case"P":return e.date({width:"short"});case"PP":return e.date({width:"medium"});case"PPP":return e.date({width:"long"});case"PPPP":default:return e.date({width:"full"})}},tt=(t,e)=>{switch(t){case"p":return e.time({width:"short"});case"pp":return e.time({width:"medium"});case"ppp":return e.time({width:"long"});case"pppp":default:return e.time({width:"full"})}},se=(t,e)=>{const n=t.match(/(P+)(p+)?/)||[],r=n[1],a=n[2];if(!a)return X(t,e);let o;switch(r){case"P":o=e.dateTime({width:"short"});break;case"PP":o=e.dateTime({width:"medium"});break;case"PPP":o=e.dateTime({width:"long"});break;case"PPPP":default:o=e.dateTime({width:"full"});break}return o.replace("{{date}}",X(r,e)).replace("{{time}}",tt(a,e))},ce={p:tt,P:se},ue=/^D+$/,le=/^Y+$/,de=["D","DD","YY","YYYY"];function me(t){return ue.test(t)}function fe(t){return le.test(t)}function he(t,e,n){const r=ge(t,e,n);if(console.warn(r),de.includes(t))throw new RangeError(r)}function ge(t,e,n){const r=t[0]==="Y"?"years":"days of the month";return`Use \`${t.toLowerCase()}\` instead of \`${t}\` (in \`${e}\`) for formatting ${r} to the input \`${n}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`}const be=/[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,we=/P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,pe=/^'([^]*?)'?$/,ye=/''/g,xe=/[a-zA-Z]/;function Pe(t,e,n){var d,p,y,x;const r=F(),a=r.locale??ne,o=r.firstWeekContainsDate??((p=(d=r.locale)==null?void 0:d.options)==null?void 0:p.firstWeekContainsDate)??1,i=r.weekStartsOn??((x=(y=r.locale)==null?void 0:y.options)==null?void 0:x.weekStartsOn)??0,s=P(t,n==null?void 0:n.in);if(!vt(s))throw new RangeError("Invalid time value");let c=e.match(we).map(g=>{const w=g[0];if(w==="p"||w==="P"){const W=ce[w];return W(g,a.formatLong)}return g}).join("").match(be).map(g=>{if(g==="''")return{isToken:!1,value:"'"};const w=g[0];if(w==="'")return{isToken:!1,value:ve(g)};if(U[w])return{isToken:!0,value:g};if(w.match(xe))throw new RangeError("Format string contains an unescaped latin alphabet character `"+w+"`");return{isToken:!1,value:g}});a.localize.preprocessor&&(c=a.localize.preprocessor(s,c));const u={firstWeekContainsDate:o,weekStartsOn:i,locale:a};return c.map(g=>{if(!g.isToken)return g.value;const w=g.value;(fe(w)||me(w))&&he(w,e,String(t));const W=U[w[0]];return W(s,w,a.localize,u)}).join("")}function ve(t){const e=t.match(pe);return e?e[1].replace(ye,"'"):t}const Oe="#E10078",Y="#9CA3AF",b=t=>String(t).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;"),h=t=>t!=null&&t!==""?String(t).trim():"",z=t=>{if(!t)return"";try{return Pe(new Date(t),"P")}catch{return t}},Me=t=>{const e=t!=null&&t.start?z(t.start):"",n=t!=null&&t.end?z(t.end):"";return e&&n?`${e} - ${n}`:e||n||""},j=(t,e)=>{const n=t.map(Me).filter(Boolean);return n.length?n.join(", "):e},ke=(t,e)=>{const n=h(t);if(!n)return{main:e,aside:""};const r=n.split("|").map(a=>a.trim()).filter(Boolean);return r.length<=1?{main:n,aside:""}:{main:r.slice(0,-1).join(" | "),aside:r[r.length-1]}},De=t=>{const e=h(t);return e?e.replace(/\s*\|\s*/g," - "):""},Se=t=>{const e=h(t).toLowerCase();return e?e==="camera"||e==="kamera"?!0:e.startsWith("camera ")||e.startsWith("kamera ")?!e.includes("support")&&!e.includes("zubehoer"):!1:!1},We=t=>{var n;const e=h(t).match(/\b(?:camera|kamera)\s*([a-z])\b/i);return((n=e==null?void 0:e[1])==null?void 0:n.toUpperCase())||"A"},Ee=(t,e)=>{const n=t.find(c=>Se(c.name)&&(c.items||[]).length>0);if(!n)return null;const r=n.items[0],a=h(r.details),o=a.includes("|")?a.split("|").map(c=>c.trim()).filter(Boolean):[],s=[e?e(r.name,0):h(r.name),...o].filter(c=>c!=="");for(;s.length<5;)s.push("");return{label:h(n.name)||"Camera",letter:We(n.name),values:s.slice(0,5)}},Te=t=>{if(!t)return"";const e=h(t.name),r=[h(t.phone),h(t.email)].filter(Boolean).join(" / ");return[e,r].filter(Boolean).join(" | ")},Ce=(t,e,n=0,r="light")=>{const a=typeof e=="function"?e:(m,f,v)=>mt(e||ht("en"),m,f,v),o=a("ui.emptyValue","—"),i=r==="pink",s=i?"#E10078":"#001589",c=i?"#F06292":"#5C6BC0",u=(m,f)=>typeof m=="string"&&m.startsWith("defaults.")?a(m,void 0,f):h(m),d=(m,f)=>u(m,{index:f+1})||a("defaults.untitled_category",`Category ${f+1}`,{index:f+1}),p=(m,f)=>u(m,{index:f+1})||a("defaults.untitled_item",`Item ${f+1}`,{index:f+1}),y=u(t.name,{index:n+1})||a("defaults.untitled_project",`Untitled project ${n+1}`,{index:n+1}),x=ft(t.shootSchedule??t.shootDate),g=x.shootingPeriods.length?j(x.shootingPeriods,o):"",W=(Array.isArray(t.crew)?t.crew:[]).map(m=>{const f=h(m.role)||a("project.print.labels.crew","Crew"),v=Te(m);return v?{label:f,value:v}:null}).filter(Boolean),nt=[{label:a("project.print.labels.client","Client"),value:h(t.client)||o},{label:a("project.print.labels.location","Location"),value:h(t.location)||o},{label:a("project.print.labels.contact","Rental house"),value:h(t.contact)||o},...W,{label:a("project.print.labels.prep","Prep"),value:j(x.prepPeriods,o)},{label:a("project.print.labels.shooting","Shoot"),value:j(x.shootingPeriods,o)},{label:a("project.print.labels.return","Return"),value:j(x.returnDays,o)}].map(({label:m,value:f})=>{const{main:v,aside:$}=ke(f,o);return`
        <tr>
          <td class="meta-main">
            <span class="meta-label">${b(m)}</span>
            <span class="meta-value">${b(v)}</span>
          </td>
          <td class="meta-aside">${b($)}</td>
        </tr>
      `}).join(""),D=Ee(t.categories||[],p),rt=D?D.label.replace(/\s+[a-z]$/i,"").trim()||D.label||"Camera":"",at=D?`
        <table class="camera-spec">
          <tr>
            <td class="camera-label">
              <strong>${b(rt)}</strong>
              <strong class="camera-badge">${b(D.letter)}</strong>
            </td>
            ${D.values.map(m=>`<td>${b(m)}</td>`).join("")}
          </tr>
        </table>
      `:'<div class="divider"></div>',ot=(t.categories||[]).map((m,f)=>{const v=Array.isArray(m.items)?m.items:[];if(v.length===0)return"";const $=d(m.name,f),ct=v.map((L,ut)=>{const lt=h(L.quantity)||"1",A=p(L.name,ut),H=De(L.details),dt=H?`${A} - ${H}`:A;return`
            <div class="item">
              <span class="item-qty">${b(`${lt}x`)}</span>
              <span>${b(dt)}</span>
            </div>
          `}).join("");return`
        <section class="category">
          <div class="divider"></div>
          <h3>${b($)}</h3>
          <div class="divider"></div>
          ${ct}
        </section>
      `}).join(""),R=h(t.notes),it=R?`
        <section class="notes">
          <div class="divider"></div>
          <h3>${b(a("project.print.notes.title","Project notes"))}</h3>
          <div class="divider"></div>
          <div class="notes-body">${b(R)}</div>
        </section>
      `:"",st=`${a("ui.gearList","Gear list")} | ${y}`;return`
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${b(y)} - ${b(a("ui.gearList","Gear list"))}</title>
        <style>
          @page {
            margin: 40px 40px 60px;
          }
          body {
            margin: 0;
            color: #111;
            font-family: 'Ubuntu', 'Arial', sans-serif;
          }
          main {
            padding: 0;
          }
          h1 {
            font-size: 22px;
            margin: 0 0 4px;
            color: ${s};
          }
          .subtitle {
            font-size: 11px;
            letter-spacing: 1px;
            font-weight: 700;
            color: ${c};
            margin-bottom: 14px;
            text-transform: uppercase;
          }
          .meta {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-bottom: 12px;
          }
          .meta td {
            padding: 2px 0;
            vertical-align: top;
          }
          .meta-main {
            width: 75%;
          }
          .meta-label {
            font-weight: 700;
            margin-right: 4px;
          }
          .meta-aside {
            text-align: right;
            white-space: nowrap;
            color: #444;
          }
          .camera-spec {
            width: 100%;
            border-collapse: collapse;
            border-top: 1px solid ${Y};
            border-bottom: 1px solid ${Y};
            margin: 8px 0 12px;
            font-size: 10px;
          }
          .camera-spec td {
            padding: 4px 6px;
          }
          .camera-spec td + td {
            border-left: 1px solid ${Y};
            text-align: center;
          }
          .camera-badge {
            color: ${Oe};
            margin-left: 4px;
          }
          .divider {
            border-top: 1px solid ${Y};
            margin: 8px 0 6px;
          }
          .category h3,
          .notes h3 {
            margin: 0 0 4px;
            font-size: 11px;
            font-weight: 700;
            color: ${s};
          }
          .item {
            font-size: 10px;
            margin-bottom: 2px;
          }
          .item-qty {
            font-weight: 700;
            margin-right: 4px;
          }
          .notes {
            margin-top: 10px;
          }
          .notes-body {
            font-size: 10px;
            white-space: pre-wrap;
          }
          .footer {
            position: fixed;
            bottom: 20px;
            left: 40px;
            right: 40px;
            text-align: center;
            font-size: 9px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>${b(y)}</h1>
          ${g?`<div class="subtitle">${b(g)}</div>`:""}
          <table class="meta">
            <tbody>
              ${nt}
            </tbody>
          </table>
          ${at}
          ${ot}
          ${it}
        </main>
        <div class="footer">${b(st)}</div>
      </body>
    </html>
  `};async function Ye(t,e,n,r){let a;try{const o=gt(t,e);a=Le(),a===null&&et();const i={"project.category.defaultName":n("project.category.defaultName","Category"),"project.untitled":n("project.untitled","Untitled Project"),"ui.emptyValue":n("ui.emptyValue","—"),"ui.gearList":n("ui.gearList","Gear list"),"items.print.headers.item":n("items.print.headers.item","Item"),"project.print.labels.client":n("project.print.labels.client","Client"),"project.print.labels.prep":n("project.print.labels.prep","Prep"),"project.print.labels.shooting":n("project.print.labels.shooting","Shoot"),"project.print.labels.return":n("project.print.labels.return","Return"),"project.print.labels.location":n("project.print.labels.location","Location"),"project.print.labels.contact":n("project.print.labels.contact","Rental house"),"project.print.labels.crew":n("project.print.labels.crew","Crew"),"project.print.labels.resolution":n("project.print.labels.resolution","Resolution"),"project.print.labels.aspectRatio":n("project.print.labels.aspectRatio","Aspect ratio"),"project.print.labels.codec":n("project.print.labels.codec","Codec"),"project.print.labels.framerate":n("project.print.labels.framerate","Framerate"),"project.print.notes.title":n("project.print.notes.title","Project notes")};let s;try{s=await je(o,i,r)}catch(p){console.warn("PDF export worker failed, retrying on main thread.",p);try{s=await _e(o,i,r)}catch(y){return console.error("PDF export failed on main thread, falling back to print.",y),await $e(o,i,r,a),"print"}}const c=typeof t.name=="string"?t.name.trim():"",d=`${c&&!c.startsWith("defaults.")?c:"gear-list"}.pdf`;return Fe(s,d,a),"download"}catch(o){throw a&&!a.closed&&a.close(),console.error("PDF Export failed:",o),o}}function je(t,e,n){return new Promise((r,a)=>{let o,i;try{o=new Worker(new URL("/Gear-list-editor/assets/pdf.worker-COiceLPU.js",import.meta.url),{type:"module"})}catch(s){a(s);return}i=setTimeout(()=>{o.terminate(),a(new Error("worker-timeout"))},15e3),o.onmessage=s=>{clearTimeout(i),o.terminate(),s.data.success?r(s.data.blob):a(new Error(s.data.error||"Unknown worker error"))},o.onerror=s=>{clearTimeout(i),o.terminate(),a(s)},o.postMessage({snapshot:t,translations:e,theme:n})})}async function _e(t,e,n){const[{default:r},{ubuntuVfs:a},{buildDocDefinition:o}]=await Promise.all([N(()=>import("./pdfmake-C49klq0x.js").then(u=>u.p),__vite__mapDeps([0,1,2])),N(()=>import("./ubuntu-vfs-ByJEVHrx.js"),[]),N(()=>import("./buildDocDefinition-Bqw4p6Ta.js"),__vite__mapDeps([3,1,2]))]);r.vfs=a,r.fonts={Ubuntu:{normal:"Ubuntu-Regular.ttf",bold:"Ubuntu-Bold.ttf",italics:"Ubuntu-Italic.ttf",bolditalics:"Ubuntu-BoldItalic.ttf"}};const s=o(t,(u,d)=>e[u]||d||u,n);return s.defaultStyle||(s.defaultStyle={}),s.defaultStyle.font||(s.defaultStyle.font="Ubuntu"),r.createPdf(s).getBlob()}function Fe(t,e,n){const r=URL.createObjectURL(t);if(n){n.location.href=r,n.focus(),setTimeout(()=>URL.revokeObjectURL(r),1e4);return}const a=document.createElement("a");a.href=r,"download"in a?(a.download=e,document.body.appendChild(a),a.click(),a.remove()):window.open(r,"_blank"),setTimeout(()=>URL.revokeObjectURL(r),1e4)}async function $e(t,e,n,r){var c;const a=(u,d)=>e[u]||d||u,o=Ce(t.data.project,a,0,n);if(r&&!r.closed){r.document.open(),r.document.write(o),r.document.close(),r.focus(),setTimeout(()=>r.print(),250);return}if(typeof document>"u")throw new Error("print-unavailable");const i=document.createElement("iframe");i.title="pdf-print-fallback",i.style.position="fixed",i.style.right="0",i.style.bottom="0",i.style.width="0",i.style.height="0",i.style.border="0",i.onload=()=>{const u=i.contentWindow;u&&(u.focus(),u.print()),setTimeout(()=>i.remove(),1e3)},document.body.appendChild(i);const s=i.contentDocument||((c=i.contentWindow)==null?void 0:c.document);if(!s)throw i.remove(),new Error("print-unavailable");s.open(),s.write(o),s.close()}function et(){if(typeof document>"u")return!1;const t=document.createElement("a");return typeof navigator<"u"&&/iP(ad|hone|od)/.test(navigator.userAgent||"")||!("download"in t)}function Le(){return typeof window>"u"||!et()?null:window.open("","_blank")}const Re=Object.freeze(Object.defineProperty({__proto__:null,exportPdf:Ye},Symbol.toStringTag,{value:"Module"}));export{Pe as f,Re as p};
