const payload = { items: [{ productId: 'nonexistent', quantity: 1 }], customerPhone: '+254700000000' };

fetch('http://localhost:4000/api/orders/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
})
    .then(async (r) => {
        console.log('status', r.status);
        const text = await r.text();
        console.log(text);
    })
    .catch((e) => {
        console.error('error', e);
        process.exit(1);
    });
