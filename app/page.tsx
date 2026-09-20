'use client';
import { ChangeEvent, useMemo, useState } from "react";
type Row=Record<string,unknown>;
type Result={fileName:string;inputRows:number;outputRows:number;removedDuplicates:number;convertedInvalidValues:number;rows:Row[];csv:string};
export default function Home(){
 const [file,setFile]=useState<File|null>(null),[result,setResult]=useState<Result|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const columns=useMemo(()=>result?.rows.length?Object.keys(result.rows[0]):[],[result]);
 const handleFile=(e:ChangeEvent<HTMLInputElement>)=>{setFile(e.target.files?.[0]??null);setResult(null);setError("")};
 async function processFile(){if(!file)return;setLoading(true);setError("");setResult(null);try{const f=new FormData();f.append("file",file);const r=await fetch("/api/process",{method:"POST",body:f});const d=await r.json();if(!r.ok)throw new Error(d.error||"Processing failed.");setResult(d)}catch(e){setError(e instanceof Error?e.message:"Something went wrong.")}finally{setLoading(false)}}
 function download(){if(!result)return;const url=URL.createObjectURL(new Blob([result.csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="processed_data.csv";a.click();URL.revokeObjectURL(url)}
 return <main>
  <section className="hero"><div className="badge">PYTHON DATA PROCESSING PIPELINE</div><h1>Turn messy data into <span>clean data.</span></h1><p>Upload a CSV or JSON file. The pipeline normalizes fields, handles missing values, converts types, removes duplicates, validates ranges and gives you structured output.</p></section>
  <section className="workspace">
   <div className="card"><div className="card-heading"><div><p className="eyebrow">01 · INPUT</p><h2>Upload raw data</h2></div><span className="format-pill">CSV / JSON</span></div>
    <label className="dropzone"><input type="file" accept=".csv,.json,text/csv,application/json" onChange={handleFile}/><div className="upload-icon">↑</div><strong>{file?file.name:"Choose a CSV or JSON file"}</strong><small>{file?((file.size/1024).toFixed(1)+" KB selected"):"Click here to browse your files"}</small></label>
    <button className="primary" onClick={processFile} disabled={!file||loading}>{loading?"Processing…":"Run Data Pipeline →"}</button>{error&&<div className="error">{error}</div>}
   </div>
   <div className="card"><p className="eyebrow">02 · PIPELINE</p><h2>What happens to your data?</h2><div className="steps">{["Read CSV / JSON","Normalize columns","Handle missing values","Convert data types","Remove duplicates","Validate & transform","Generate structured output"].map((s,i)=><div className="step" key={s}><span>{String(i+1).padStart(2,"0")}</span><div>{s}</div></div>)}</div></div>
  </section>
  {result&&<section className="results"><div className="results-header"><div><p className="eyebrow">03 · OUTPUT</p><h2>Processed results</h2><p className="muted">{result.fileName} · {result.outputRows} clean records</p></div><button className="secondary" onClick={download}>↓ Download CSV</button></div>
   <div className="stats"><div><strong>{result.inputRows}</strong><span>Input rows</span></div><div><strong>{result.outputRows}</strong><span>Clean rows</span></div><div><strong>{result.removedDuplicates}</strong><span>Duplicates removed</span></div><div><strong>{result.convertedInvalidValues}</strong><span>Invalid values handled</span></div></div>
   <div className="table-wrap"><table><thead><tr>{columns.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{result.rows.map((row,i)=><tr key={i}>{columns.map(c=><td key={c}>{String(row[c]??"")}</td>)}</tr>)}</tbody></table></div>
  </section>}
  <footer><span>DataFlow · Full-stack demo</span><span>Cleaning · Validation · Transformation</span></footer>
 </main>
}