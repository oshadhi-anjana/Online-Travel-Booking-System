// WhatsApp requires the country code without a leading plus or local zero.
const PAYMENT_WHATSAPP = '94762042696';
export function paymentChatUrl(booking) {
  const text = [
    'Hello Serandib Tours! I would like the bank payment details for my reservation.',
    '',
    `Booking reference: ${booking._id}`,
    `Trip: ${booking.destination}`,
    `Departure: ${booking.startDate}`,
    `Travellers: ${booking.guests}`,
    `Total: LKR ${Number(booking.total).toLocaleString('en-LK')}`,
    '',
    'Please share your bank account details, payment instructions, and how to submit the transfer receipt. Thank you!'
  ].join('\n');
  return `https://wa.me/${PAYMENT_WHATSAPP}?text=${encodeURIComponent(text)}`;
}
export function redirectToPaymentChat(booking) {
  // Same-tab navigation avoids pop-up blockers after the asynchronous save.
  window.location.assign(paymentChatUrl(booking));
}
