import { NextResponse } from "next/server";
import Papa from "papaparse";
export const runtime = "nodejs";
type Row = Record<string, unknown>;
const required = ["id","name","age","city","score"];
function clean(rows:Row[]) {
  const seen = new Set<string>(); const output:Row[]=[]; let duplicates=0; let invalid=0;
  for (const original of rows) {
    const row:Row={};
    for (const [k,v] of Object.entries(original)) row[k.trim().toLowerCase().replace(/\\s+/g,"_")]=v;
    for (const k of required) if (!(k in row)) row[k]=null;
    const num=(v:unknown)=>{ if(v===null||v===undefined||String(v).trim()==="") return null; const n=Number(v); return Number.isFinite(n)?n:null; };
    const id=num(row.id), age=num(row.age), score=num(row.score);
    if (row.id!==null && id===null) invalid++;
    if (row.age!==null && row.age!==undefined && String(row.age).trim()!=="" && age===null) invalid++;
    if (row.score!==null && row.score!==undefined && String(row.score).trim()!=="" && score===null) invalid++;
    row.id=id??0; row.age=Math.max(0,age??0); row.score=Math.min(100,Math.max(0,score??0));
    row.name=String(row.name??"").trim()||"Unknown"; row.city=String(row.city??"").trim()||"Unknown";
    row.name=String(row.name).replace(/\\s+/g," ").replace(/\\b\\w/g,c=>c.toUpperCase());
    row.city=String(row.city).replace(/\\s+/g," ").replace(/\\b\\w/g,c=>c.toUpperCase());
    const key=JSON.stringify(row); if(seen.has(key)){duplicates++;continue;} seen.add(key); output.push(row);
  }
  return {output,duplicates,invalid};
}
export async function POST(request:Request){
  try {
    const form=await request.formData(); const file=form.get("file");
    if(!(file instanceof File)) return NextResponse.json({error:"Please upload a CSV or JSON file."},{status:400});
    const ext=file.name.toLowerCase().split(".").pop();
    if(!["csv","json"].includes(ext??"")) return NextResponse.json({error:"Only CSV and JSON files are supported."},{status:400});
    const text=await file.text(); let rows:Row[];
    if(ext==="json"){
      const parsed=JSON.parse(text); if(!Array.isArray(parsed)) return NextResponse.json({error:"JSON must contain an array of records."},{status:400});
      rows=parsed.filter(x=>x&&typeof x==="object") as Row[];
    } else {
      const parsed=Papa.parse<Row>(text,{header:true,skipEmptyLines:true,dynamicTyping:false});
      if(parsed.errors.length) return NextResponse.json({error:parsed.errors[0].message},{status:400}); rows=parsed.data;
    }
    const r=clean(rows);
    return NextResponse.json({success:true,fileName:file.name,inputRows:rows.length,outputRows:r.output.length,removedDuplicates:r.duplicates,convertedInvalidValues:r.invalid,rows:r.output,csv:Papa.unparse(r.output)});
  } catch(e){ return NextResponse.json({error:e instanceof Error?e.message:"Unexpected processing error."},{status:500}); }
}