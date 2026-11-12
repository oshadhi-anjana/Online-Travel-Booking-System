const MAX_SLIP_BYTES = 5 * 1024 * 1024;
function slipType(buffer) {
  if (!Buffer.isBuffer(buffer) || !buffer.length || buffer.length > MAX_SLIP_BYTES) return null;
  if (buffer.length >= 8 && buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return { mime: 'image/png', extension: 'png' };
  if (buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return { mime: 'image/jpeg', extension: 'jpg' };
  if (buffer.length >= 5 && buffer.subarray(0,5).toString() === '%PDF-') return { mime: 'application/pdf', extension: 'pdf' };
  return null;
}
module.exports = { MAX_SLIP_BYTES, slipType };
