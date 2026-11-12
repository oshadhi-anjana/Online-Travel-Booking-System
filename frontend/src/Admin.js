import React, {useEffect, useState} from 'react';
export default function Admin({token,request}) {
  const [data,setData]=useState({users:[],bookings:[],reviews:[]});
  const [tab,setTab]=useState('bookings');
  const [query,setQuery]=useState('');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState('');
  const [reload,setReload]=useState(0);
  useEffect(()=>{let live=true;setLoading(true);setError('');request('/admin/dashboard',{token}).then(d=>{if(live)setData(d);}).catch(e=>{if(live)setError(e.message);}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[token,request,reload]);
  async function updateBooking(e,b) {
    e.preventDefault();
    const body=Object.fromEntries(new FormData(e.currentTarget));
    if(body.paymentStatus==='Paid'&&b.paymentStatus!=='Paid'&&!window.confirm('Have you verified that the bank transfer was received? Mark this reservation as paid?'))return;
    setBusy(b._id);setError('');setMessage('');
    try{const updated=await request(`/admin/bookings/${b._id}`,{method:'PATCH',token,body});setData(d=>({...d,bookings:d.bookings.map(i=>i._id===updated._id?updated:i)}));setMessage('Booking updated. The traveller can see the new status in My bookings.');}catch(e){setError(e.message);}finally{setBusy('');}
  }
  async function removeReview(id){if(!window.confirm('Permanently remove this review?'))return;setBusy(id);setError('');setMessage('');try{await request(`/admin/reviews/${id}`,{method:'DELETE',token});setData(d=>({...d,reviews:d.reviews.filter(r=>r._id!==id)}));setMessage('Review removed.');}catch(e){setError(e.message);}finally{setBusy('');}}
  const money=n=>'LKR '+Number(n).toLocaleString('en-LK');
  const filtered=data[tab].filter(item=>[item._id,item.destination,item.startDate,item.status,item.paymentStatus||'Pending',item.username,item.email,item.location,item.feedback,item.userID?.username,item.userID?.email].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase()));
  const paid=data.bookings.filter(b=>b.paymentStatus==='Paid').reduce((sum,b)=>sum+b.total,0);
  return <main className="container section admin-page"><p className="eyebrow">SERANDIB OPERATIONS</p><h1>Your admin <em>workspace.</em></h1><p className="intro">Manage reservations, verify bank payments, and look after your travellers.</p>
    <div className="admin-stats"><div><small>Registered users</small><strong>{data.users.length}</strong></div><div><small>Active reservations</small><strong>{data.bookings.filter(b=>['Reserved','Confirmed'].includes(b.status)).length}</strong></div><div><small>Marked paid · includes cancelled</small><strong>{money(paid)}</strong></div><div><small>Traveller reviews</small><strong>{data.reviews.length}</strong></div></div>
    <div className="filters"><div className="chips">{['bookings','users','reviews'].map(t=><button key={t} className={tab===t?'selected':''} onClick={()=>{setTab(t);setQuery('');}}>{t[0].toUpperCase()+t.slice(1)} ({data[t].length})</button>)}</div><label className="filter-search"><input aria-label="Search admin records" placeholder="Search records…" value={query} onChange={e=>setQuery(e.target.value)}/></label><button className="text-button" disabled={loading||!!busy} onClick={()=>setReload(n=>n+1)}>Refresh</button></div>
    {error&&<div role="alert" className="notice error">{error}</div>}{message&&<div role="status" className="notice success">{message}</div>}
    {loading?<p role="status">Loading admin records…</p>:<><p className="muted">{filtered.length} {tab} shown</p>{!filtered.length&&<div className="empty"><h3>No matching records</h3><p>Try a different search or refresh the dashboard.</p></div>}
    {tab==='bookings'&&<div className="booking-list">{filtered.map(b=><article className="booking-card admin-booking" key={b._id}><div className="booking-info"><span className={`status ${b.status==='Cancelled'?'cancelled':''}`}>{b.status}</span><h2>{b.destination}</h2><p>{b.userID?.username||'Deleted account'} · {b.userID?.email||'Email unavailable'} · {b.userID?.contact||'Phone unavailable'}</p><p>{b.startDate} · {b.guests} travellers · {money(b.total)}</p><small>Booking reference: {b._id}</small></div><form className="admin-booking-form" onSubmit={e=>updateBooking(e,b)}><label>Booking status<select name="status" defaultValue={b.status} key={b.status}>{['Reserved','Confirmed','Completed','Cancelled'].map(s=><option key={s}>{s}</option>)}</select></label><label>Bank payment<select name="paymentStatus" defaultValue={b.paymentStatus||'Pending'} key={b.paymentStatus||'Pending'}><option>Pending</option><option>Paid</option></select></label><button disabled={!!busy} className="button small">{busy===b._id?'Saving…':'Save booking'}</button></form></article>)}</div>}
    {tab==='users'&&!!filtered.length&&<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Location</th><th>Role</th><th>Joined</th></tr></thead><tbody>{filtered.map(u=><tr key={u._id}><td>{u.username}</td><td>{u.email}</td><td>{u.contact}</td><td>{u.location}</td><td><span className="status">{u.role||'user'}</span></td><td>{u.createdAt?new Date(u.createdAt).toLocaleDateString():'—'}</td></tr>)}</tbody></table></div>}
    {tab==='reviews'&&filtered.map(r=><article className="review-card" key={r._id}><div className="review-top"><div><strong>{r.userID?.username||'Deleted account'}</strong><small>{r.location} · {r.userID?.email}</small></div><span className="stars">{r.rating||5} / 5</span></div><p>{r.feedback}</p><button disabled={!!busy} className="text-button danger-text" onClick={()=>removeReview(r._id)}>{busy===r._id?'Removing…':'Remove review'}</button></article>)}</>}
    <p className="fine">Verify bank transfers before marking payments as paid. Cancelling a paid booking does not issue a refund; arrange refunds separately.</p>
  </main>;
}
