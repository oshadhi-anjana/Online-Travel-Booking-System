import React, {useState} from 'react';
export default function DestinationForm({token,request,onCreated,destination,onCancel}) {
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  async function submit(e){e.preventDefault();setBusy(true);setError('');setMessage('');const form=e.currentTarget;const values=Object.fromEntries(new FormData(form));try{const saved=await request(destination?`/admin/destinations/${destination.id}`:'/admin/destinations',{method:destination?'PUT':'POST',token,body:{...values,days:Number(values.days),price:Number(values.price),highlights:values.highlights.split('\n').map(h=>h.trim()).filter(Boolean)}});onCreated(saved);if(!destination)form.reset();setMessage(destination?'Destination updated.':'Destination published. Travellers can now browse and reserve it.');}catch(e){setError(e.message);}finally{setBusy(false);}}
  return <section className="destination-editor"><h2>{destination?'Edit destination':'Add a new destination'}</h2><p className="muted">Publish a trip with its itinerary, photograph, and price per traveller.</p><form onSubmit={submit}>
    <div className="form-row"><label>Destination name<input name="name" defaultValue={destination?.name} required maxLength="120" placeholder="A weekend in Nuwara Eliya"/></label><label>URL ID<input name="id" aria-label="URL ID" defaultValue={destination?.id} readOnly={!!destination} required maxLength="100" pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="nuwara-eliya"/><small className="muted">Unique lowercase words separated by hyphens.</small></label></div>
    <div className="form-row"><label>Region<input name="region" defaultValue={destination?.region} required maxLength="120" placeholder="Central Province"/></label><label>Category<select name="category" defaultValue={destination?.category||'Nature'}>{['Nature','Beach','Culture','Adventure'].map(c=><option key={c}>{c}</option>)}</select></label></div>
    <div className="form-row"><label>Duration in days<input name="days" type="number" min="1" max="60" step="1" required defaultValue={destination?.days||2}/></label><label>Price per traveller (LKR)<input name="price" defaultValue={destination?.price} type="number" min="1" max="10000000" step="0.01" required placeholder="25000"/></label></div>
    <label>Photo URL (HTTPS)<input name="image" defaultValue={destination?.image} type="text" pattern="https://.*|/images/feedbackIMG[.]jpeg" required maxLength="2000" placeholder="https://example.com/destination.jpg"/></label>
    <label>Description<textarea name="description" defaultValue={destination?.description} required maxLength="2000" rows="3" placeholder="What makes this escape special?"/></label>
    <label>Highlights (one per line, up to 10)<textarea name="highlights" defaultValue={destination?.highlights?.join('\n')} required rows="4" placeholder={'Tea estate walk\nLakeside picnic\nScenic train journey'}/></label>
    {error&&<div role="alert" className="notice error">{error}</div>}{message&&<div role="status" className="notice success">{message}</div>}
    <button className="button" disabled={busy}>{busy?'Saving…':destination?'Save destination changes':'Publish destination'}</button>{destination&&<button type="button" className="text-button" disabled={busy} onClick={onCancel}>Cancel editing</button>}
  </form></section>;
}
