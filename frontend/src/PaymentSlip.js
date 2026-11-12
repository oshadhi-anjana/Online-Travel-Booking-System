import React, {useState} from 'react';
import API from './apiConfig';
export default function PaymentSlip({booking,token,onUpdated,allowUpload=false}) {
  const [file,setFile]=useState(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const active=['Reserved','Confirmed'].includes(booking.status)&&booking.paymentStatus!=='Paid';
  async function responseError(response){let data;try{data=await response.json();}catch{}throw new Error(data?.message||'Unable to process the payment slip.');}
  async function upload(e){e.preventDefault();setError('');setMessage('');if(!file||!['image/png','image/jpeg','application/pdf'].includes(file.type)||file.size>4*1024*1024||file.size===0){setError('Choose a PNG, JPEG, or PDF file up to 4 MB.');return;}setBusy(true);const form=e.currentTarget;try{const response=await fetch(`${API}/bookings/${booking._id}/payment-slip`,{method:'PUT',headers:{Authorization:`Bearer ${token}`,'Content-Type':file.type},body:file});if(!response.ok)await responseError(response);const updated=await response.json();onUpdated?.(updated);setFile(null);form.reset();setMessage('Payment slip submitted. Your bank payment is awaiting admin review.');}catch(e){setError(e.message||'Upload failed. Please try again.');}finally{setBusy(false);}}
  async function download(){setBusy(true);setError('');try{const response=await fetch(`${API}/bookings/${booking._id}/payment-slip`,{headers:{Authorization:`Bearer ${token}`}});if(!response.ok)await responseError(response);const blob=await response.blob();const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=booking.paymentSlip?.name||'payment-slip';document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){setError(e.message||'Download failed. Please try again.');}finally{setBusy(false);}}
  return <div className="payment-slip"><h3>Bank payment slip</h3>{booking.paymentSlip?.name?<><p className="muted">Attached {booking.paymentSlip.uploadedAt?new Date(booking.paymentSlip.uploadedAt).toLocaleDateString():''} · Awaiting verification unless marked paid.</p><button className="inline-link text-button" disabled={busy} onClick={download}>Download payment slip ↧</button><p className="fine">Your uploaded payment slip is locked and cannot be edited or replaced.</p></>:<p className="muted">No payment slip attached yet.</p>}
    {allowUpload&&active&&!booking.paymentSlip&&<form onSubmit={upload}><label>Attach payment slip<input name="paymentSlip" type="file" accept="image/png,image/jpeg,application/pdf" required onChange={e=>{setFile(e.target.files?.[0]||null);setMessage('');setError('');}}/></label><p className="fine">PNG, JPEG, or PDF · Maximum 4 MB. Uploading a slip does not confirm payment.</p><button className="button small" disabled={busy}>{busy?'Uploading…':'Submit payment slip'}</button></form>}
    {error&&<div className="notice error" role="alert">{error}</div>}{message&&<div className="notice success" role="status">{message}</div>}
  </div>;
}
