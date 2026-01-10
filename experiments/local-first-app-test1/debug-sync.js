import{isChangeMessage as se,isControlMessage as ae}from"@electric-sql/client";import{MultiShapeStream as oe}from"@electric-sql/experimental";var ne="subscriptions_metadata";async function Y({pg:n,metadataSchema:o,subscriptionKey:e}){let a=await n.query(`
      SELECT key, shape_metadata, last_lsn
      FROM ${B(o)}
      WHERE key = $1
    `,[e]);if(a.rows.length===0)return null;if(a.rows.length>1)throw new Error(`Multiple subscriptions found for key: ${e}`);let p=a.rows[0];if(typeof p.last_lsn=="string")return{...p,last_lsn:BigInt(p.last_lsn)};throw new Error(`Invalid last_lsn type: ${typeof p.last_lsn}`)}async function V({pg:n,metadataSchema:o,subscriptionKey:e,shapeMetadata:a,lastLsn:p,debug:b}){b&&console.log("updating subscription state",e,a,p),await n.query(`
      INSERT INTO ${B(o)}
        (key, shape_metadata, last_lsn)
      VALUES
        ($1, $2, $3)
      ON CONFLICT(key)
      DO UPDATE SET
        shape_metadata = EXCLUDED.shape_metadata,
        last_lsn = EXCLUDED.last_lsn;
    `,[e,a,p.toString()])}async function J({pg:n,metadataSchema:o,subscriptionKey:e}){await n.query(`DELETE FROM ${B(o)} WHERE key = $1`,[e])}async function Q({pg:n,metadataSchema:o}){await n.exec(`
      SET ${o}.syncing = false;
      CREATE SCHEMA IF NOT EXISTS "${o}";
      CREATE TABLE IF NOT EXISTS ${B(o)} (
        key TEXT PRIMARY KEY,
        shape_metadata JSONB NOT NULL,
        last_lsn TEXT NOT NULL
      );
    `)}function B(n){return`"${n}"."${ne}"`}async function z({pg:n,table:o,schema:e="public",message:a,mapColumns:p,primaryKey:b,debug:m}){let u=p?U(p,a):a.value;switch(a.headers.operation){case"insert":{m&&console.log("inserting",u);let f=Object.keys(u);return await n.query(`
            INSERT INTO "${e}"."${o}"
            (${f.map(s=>'"'+s+'"').join(", ")})
            VALUES
            (${f.map((s,y)=>"$"+(y+1)).join(", ")})
          `,f.map(s=>u[s]))}case"update":{m&&console.log("updating",u);let f=Object.keys(u).filter(s=>!b.includes(s));return f.length===0?void 0:await n.query(`
            UPDATE "${e}"."${o}"
            SET ${f.map((s,y)=>'"'+s+'" = $'+(y+1)).join(", ")}
            WHERE ${b.map((s,y)=>'"'+s+'" = $'+(f.length+y+1)).join(" AND ")}
          `,[...f.map(s=>u[s]),...b.map(s=>u[s])])}case"delete":return m&&console.log("deleting",u),await n.query(`
            DELETE FROM "${e}"."${o}"
            WHERE ${b.map((f,s)=>'"'+f+'" = $'+(s+1)).join(" AND ")}
          `,[...b.map(f=>u[f])])}}async function G({pg:n,table:o,schema:e="public",messages:a,mapColumns:p,debug:b}){let m=a.map(t=>p?U(p,t):t.value);b&&console.log("inserting",m);let u=Object.keys(m[0]),f=t=>{if(t===null)return 0;if(t instanceof ArrayBuffer)return t.byteLength;if(t instanceof Blob)return t.size;if(t instanceof Uint8Array||t instanceof DataView||ArrayBuffer.isView(t))return t.byteLength;switch(typeof t){case"string":return t.length;case"number":return 8;case"boolean":return 1;default:return t instanceof Date?8:t?.toString()?.length||0}},s=t=>u.reduce((d,_)=>{let g=t[_];if(g===null)return d;if(Array.isArray(g)){if(g.length===0)return d;let w=g[0];switch(typeof w){case"number":return d+g.length*8;case"string":return d+g.reduce((P,$)=>P+$.length,0);case"boolean":return d+g.length;default:return w instanceof Date?d+g.length*8:d+g.reduce((P,$)=>P+f($),0)}}return d+f(g)},0),y=32e3,I=50*1024*1024,O=async t=>{let d=`
      INSERT INTO "${e}"."${o}"
      (${u.map(g=>`"${g}"`).join(", ")})
      VALUES
      ${t.map((g,w)=>`(${u.map((P,$)=>"$"+(w*u.length+$+1)).join(", ")})`).join(", ")}
    `,_=t.flatMap(g=>u.map(w=>g[w]));await n.query(d,_)},r=[],h=0,N=0;for(let t=0;t<m.length;t++){let d=m[t],_=s(d),g=u.length;r.length>0&&(h+_>I||N+g>y)&&(b&&h+_>I&&console.log("batch size limit exceeded, executing batch"),b&&N+g>y&&console.log("batch params limit exceeded, executing batch"),await O(r),r=[],h=0,N=0),r.push(d),h+=_,N+=g}r.length>0&&await O(r),b&&console.log(`Inserted ${a.length} rows using INSERT`)}async function Z({pg:n,table:o,schema:e="public",messages:a,mapColumns:p,debug:b}){b&&console.log("applying messages with json_to_recordset");let m=a.map(s=>p?U(p,s):s.value),u=(await n.query(`
        SELECT column_name, udt_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = $2
      `,[o,e])).rows.filter(s=>Object.prototype.hasOwnProperty.call(m[0],s.column_name)),f=1e4;for(let s=0;s<m.length;s+=f){let y=m.slice(s,s+f);await n.query(`
        INSERT INTO "${e}"."${o}"
        SELECT x.* from json_to_recordset($1) as x(${u.map(I=>`${I.column_name} ${I.udt_name.replace(/^_/,"")}`+(I.data_type==="ARRAY"?"[]":"")).join(", ")})
      `,[y])}b&&console.log(`Inserted ${a.length} rows using json_to_recordset`)}async function F({pg:n,table:o,schema:e="public",messages:a,mapColumns:p,debug:b}){b&&console.log("applying messages with COPY");let m=a.map(y=>p?U(p,y):y.value),u=Object.keys(m[0]),f=m.map(y=>u.map(I=>{let O=y[I];return typeof O=="string"&&(O.includes(",")||O.includes('"')||O.includes(`
`))?`"${O.replace(/"/g,'""')}"`:O===null?"\\N":O}).join(",")).join(`
`),s=new Blob([f],{type:"text/csv"});await n.query(`
      COPY "${e}"."${o}" (${u.map(y=>`"${y}"`).join(", ")})
      FROM '/dev/blob'
      WITH (FORMAT csv, NULL '\\N')
    `,[],{blob:s}),b&&console.log(`Inserted ${a.length} rows using COPY`)}function U(n,o){if(typeof n=="function")return n(o);let e={};for(let[a,p]of Object.entries(n))e[a]=o.value[p];return e}async function re(n,o){let e=o?.debug??!1,a=o?.metadataSchema??"electric",p=[],b=new Map,m=!1,u=async()=>{m||(m=!0,await Q({pg:n,metadataSchema:a}))},f=async({key:r,shapes:h,useCopy:N=!1,initialInsertMethod:t="insert",onInitialSync:d,onError:_})=>{let g=!1;await u(),Object.values(h).filter(i=>!i.onMustRefetch).forEach(i=>{if(b.has(i.table))throw new Error("Already syncing shape for table "+i.table);b.set(i.table)});let w=null;r!==null&&(w=await Y({pg:n,metadataSchema:a,subscriptionKey:r}),e&&w&&console.log("resuming from subscription state",w));let P=w===null;N&&t==="insert"&&(t="csv",console.warn("The useCopy option is deprecated and will be removed in a future version. Use initialInsertMethod instead."));let $=!P||t==="insert",K=!1,v=new Map(Object.keys(h).map(i=>[i,new Map])),k=new Map(Object.keys(h).map(i=>[i,BigInt(-1)])),x=new Set,W=w?.last_lsn??BigInt(-1),D=new AbortController;Object.values(h).filter(i=>!!i.shape.signal).forEach(i=>{i.shape.signal.addEventListener("abort",()=>D.abort(),{once:!0})});let R=new oe({shapes:Object.fromEntries(Object.entries(h).map(([i,L])=>{let S=w?.shape_metadata[i];return[i,{...L.shape,...S?{offset:S.offset,handle:S.handle}:{},signal:D.signal}]}))}),ee={json:Z,csv:F,useCopy:F,insert:G},te=async i=>{let L=new Map(Object.keys(h).map(S=>[S,[]]));for(let[S,M]of v.entries()){let c=L.get(S);for(let l of M.keys())if(l<=i){for(let T of M.get(l))c.push(T);M.delete(l)}}await n.transaction(async S=>{e&&console.time("commit"),await S.exec(`SET LOCAL ${a}.syncing = true;`);for(let[M,c]of L.entries()){let l=h[M],T=c;if(x.has(M)){if(e&&console.log("truncating table",l.table),l.onMustRefetch)await l.onMustRefetch(S);else{let E=l.schema||"public";await S.exec(`DELETE FROM "${E}"."${l.table}";`)}x.delete(M)}if(!$){let E=[],A=[],H=!1;for(let q of T)!H&&q.headers.operation==="insert"?E.push(q):(H=!0,A.push(q));E.length>0&&t==="csv"&&A.unshift(E.pop()),T=A,E.length>0&&(await ee[t]({pg:S,table:l.table,schema:l.schema,messages:E,mapColumns:l.mapColumns,debug:e}),$=!0)}let C=[],j=null,X=T.length;for(let E=0;E<X;E++){let A=T[E];A.headers.operation==="insert"?C.push(A):j=A,(j||E===X-1)&&(C.length>0&&(await G({pg:S,table:l.table,schema:l.schema,messages:C,mapColumns:l.mapColumns,debug:e}),C.length=0),j&&(await z({pg:S,table:l.table,schema:l.schema,message:j,mapColumns:l.mapColumns,primaryKey:l.primaryKey,debug:e}),j=null))}}r&&await V({pg:S,metadataSchema:a,subscriptionKey:r,shapeMetadata:Object.fromEntries(Object.keys(h).map(M=>[M,{handle:R.shapes[M].shapeHandle,offset:R.shapes[M].lastOffset}])),lastLsn:i,debug:e}),g&&await S.rollback()}),e&&console.timeEnd("commit"),d&&!K&&R.isUpToDate&&(d(),K=!0)};return R.subscribe(async i=>{if(g)return;e&&console.log("received messages",i.length),i.forEach(c=>{let l=k.get(c.shape)??BigInt(-1);if(se(c)){let T=v.get(c.shape),C=typeof c.headers.lsn=="string"?BigInt(c.headers.lsn):BigInt(0);if(C<=l)return;let j=c.headers.last??!1;T.has(C)||T.set(C,[]),T.get(C).push(c),j&&k.set(c.shape,C)}else if(ae(c))switch(c.headers.control){case"up-to-date":{if(e&&console.log("received up-to-date",c),typeof c.headers.global_last_seen_lsn!="string")throw new Error("global_last_seen_lsn is not a string");let T=BigInt(c.headers.global_last_seen_lsn);if(T<=l)return;k.set(c.shape,T);break}case"must-refetch":{e&&console.log("received must-refetch",c),v.get(c.shape).clear(),k.set(c.shape,BigInt(-1)),x.add(c.shape);break}}});let L=Array.from(k.values()).reduce((c,l)=>l<c?l:c),S=L>W,M=L>=W&&x.size>0;(S||M)&&(te(L),await new Promise(c=>setTimeout(c)))},_),p.push({stream:R,aborter:D}),{unsubscribe:()=>{e&&console.log("unsubscribing"),g=!0,R.unsubscribeAll(),D.abort();for(let i of Object.values(h))b.delete(i.table)},get isUpToDate(){return R.isUpToDate},streams:Object.fromEntries(Object.keys(h).map(i=>[i,R.shapes[i]]))}};return{namespaceObj:{initMetadataTables:u,syncShapesToTables:f,syncShapeToTable:async r=>{let h=await f({shapes:{shape:{shape:r.shape,table:r.table,schema:r.schema,mapColumns:r.mapColumns,primaryKey:r.primaryKey,onMustRefetch:r.onMustRefetch}},key:r.shapeKey,useCopy:r.useCopy,initialInsertMethod:r.initialInsertMethod,onInitialSync:r.onInitialSync,onError:r.onError});return{unsubscribe:h.unsubscribe,get isUpToDate(){return h.isUpToDate},stream:h.streams.shape}},deleteSubscription:async r=>{await J({pg:n,metadataSchema:a,subscriptionKey:r})}},close:async()=>{for(let{stream:r,aborter:h}of p)r.unsubscribeAll(),h.abort()}}}function ye(n){return{name:"ElectricSQL Sync",setup:async o=>{let{namespaceObj:e,close:a}=await re(o,n);return{namespaceObj:e,close:a}}}}export{ye as electricSync};
//# sourceMappingURL=index.js.map