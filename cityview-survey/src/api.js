/** Same-origin endpoint. The backend must authenticate the buyer and authorize the allocation. */
export async function submitAllocation(payload) {
  const response = await fetch('/api/allocation-notifications', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': payload.idempotencyKey },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('Unable to save allocation notification.');
  return response.json();
}
