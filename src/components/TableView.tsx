import React from 'react'
import { useApp } from '../lib/store'
import { copyRowsAsHTMLTable } from '../lib/export'

export default function TableView() {
  const rows = useApp(s => s.rows)
  const updateRow = useApp(s => s.updateRow)
  const deleteRow = useApp(s => s.deleteRow)
  const clearAll = useApp(s => s.clearAll)

  async function copyTable() {
    await copyRowsAsHTMLTable(rows)
    alert('Copied table to clipboard. Paste into your destination document.')
  }

  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between'}}>
        <strong>Saved rows ({rows.length})</strong>
        <div className="row">
          <button className="ghost" onClick={copyTable}>Copy HTML table</button>
          <button className="ghost" onClick={() => { if (confirm('Clear all saved rows?')) clearAll() }}>Clear all</button>
        </div>
      </div>
      <div style={{overflowX:'auto'}}>
        <table className="table">
          <thead>
            <tr>
              <th>Scanned at</th><th>Name</th><th>Code</th><th>Street</th><th>City</th><th>State</th><th>ZIP</th><th>Conf(code)</th><th>Conf(addr)</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{new Date(r.scannedAt).toLocaleString()}</td>
                <td><input value={r.name||''} onChange={e=>updateRow(r.id,{name:e.target.value})}/></td>
                <td><input value={r.code} onChange={e=>updateRow(r.id,{code:e.target.value})}/></td>
                <td><input value={r.street||''} onChange={e=>updateRow(r.id,{street:e.target.value})}/></td>
                <td><input value={r.city||''} onChange={e=>updateRow(r.id,{city:e.target.value})}/></td>
                <td><input value={r.state||''} onChange={e=>updateRow(r.id,{state:e.target.value})}/></td>
                <td><input value={r.zip||''} onChange={e=>updateRow(r.id,{zip:e.target.value})}/></td>
                <td>{(r.confCode??0).toFixed(2)}</td>
                <td>{(r.confAddr??0).toFixed(2)}</td>
                <td><button className="ghost" onClick={()=>deleteRow(r.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="badge" style={{marginTop:8}}>Rows older than 24 hours are auto-deleted on app open.</p>
    </div>
  )
}
