import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatKes } from '../utils/currency';
import { useCart } from '../hooks/useCart';
import { createCheckoutDraft, finalizeCheckout, getMpesaPaymentStatus, initiateMpesaCheckout, updateCheckoutContact, updateCheckoutShipping } from '../services/orderService';

type Step = 1 | 2 | 3 | 4;
type Contact = { firstName: string; lastName: string; email: string; phone: string; address: string; city: string; county: string; notes: string };
const emptyContact: Contact = { firstName: '', lastName: '', email: '', phone: '', address: '', city: '', county: '', notes: '' };
const shipping = [
    { id: 'STANDARD', name: 'Standard Delivery', fee: 150, detail: '1-2 business days' },
    { id: 'EXPRESS', name: 'Express Delivery', fee: 300, detail: 'Same day if ordered before 12pm' },
    { id: 'PICKUP', name: 'Pick-up at Store', fee: 0, detail: 'Ready in 2 hours' },
];

function CheckoutPage() {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>(1);
    const [contact, setContact] = useState(emptyContact);
    const [shippingId, setShippingId] = useState('STANDARD');
    const [orderId, setOrderId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [mpesaPhone, setMpesaPhone] = useState('');
    const [mpesaPolling, setMpesaPolling] = useState(false);
    const [mpesaPaid, setMpesaPaid] = useState(false);
    const [mpesaTimedOut, setMpesaTimedOut] = useState(false);
    const selectedShipping = shipping.find((method) => method.id === shippingId) ?? shipping[0];
    const deliveryFee = selectedShipping.id === 'STANDARD' && cart.subtotal >= 500 ? 0 : selectedShipping.fee;
    const total = cart.subtotal + deliveryFee;
    const contactError = useMemo(() => {
        if (!contact.firstName || !contact.lastName || !contact.phone) return 'Please complete all required fields.';
        if (contact.email && !/^\S+@\S+\.\S+$/.test(contact.email)) return 'Enter a valid email address.';
        if (!/^(?:\+254|254|0)7\d{8}$/.test(contact.phone.replace(/[\s-]/g, ''))) return 'Enter a valid Kenyan mobile number.';
        return '';
    }, [contact]);

    useEffect(() => {
        if (!mpesaPolling || !orderId) return;
        const poll = async () => {
            try {
                const result = await getMpesaPaymentStatus(orderId);
                const status = result.data?.status;
                if (status === 'paid') {
                    setMpesaPolling(false);
                    setMpesaPaid(true);
                    setMpesaTimedOut(false);
                    setStep(4);
                } else if (status === 'failed') {
                    setMpesaPolling(false);
                    setMpesaTimedOut(true);
                    setError(result.data?.reason || 'M-Pesa payment failed.');
                }
            } catch (err: any) {
                setMpesaPolling(false);
                setError(err.message ?? 'Unable to check M-Pesa payment status.');
            }
        };
        poll();
        const interval = window.setInterval(poll, 3500);
        const timeout = window.setTimeout(() => {
            setMpesaPolling(false);
            setMpesaTimedOut(true);
        }, 90_000);
        return () => {
            window.clearInterval(interval);
            window.clearTimeout(timeout);
        };
    }, [mpesaPolling, orderId]);

    async function continueFromInfo() {
        if (contactError) { setError(contactError); return; }
        setSaving(true); setError('');
        try {
            const draft = await createCheckoutDraft({ items: cart.items.map((item) => ({ productId: item.product.id, quantity: item.quantity })), deliveryFee, shippingMethod: shippingId, paymentMethod: 'MPESA' });
            const id = draft.data.id;
            setOrderId(id);
            setMpesaPhone(contact.phone);
            await updateCheckoutContact(id, contact);
            setStep(2);
        } catch (err: any) { setError(err.message ?? 'Unable to save your details.'); } finally { setSaving(false); }
    }

    async function startMpesaPayment() {
        if (!orderId) return;
        const normalizedPhone = mpesaPhone.replace(/[\s-]/g, '');
        if (!/^(?:\+254|254|0)7\d{8}$/.test(normalizedPhone)) {
            setError('Enter a valid Kenyan mobile number.');
            return;
        }
        setSaving(true);
        setError('');
        setMpesaTimedOut(false);
        try {
            await initiateMpesaCheckout({ orderId, phoneNumber: normalizedPhone });
            setMpesaPolling(true);
        } catch (err: any) {
            setError(err.message ?? 'Unable to send the M-Pesa prompt.');
        } finally {
            setSaving(false);
        }
    }

    async function chooseShipping(id: string) {
        setShippingId(id); setError('');
        if (!orderId) return;
        const method = shipping.find((item) => item.id === id) ?? shipping[0];
        try { await updateCheckoutShipping(orderId, id, method.id === 'STANDARD' && cart.subtotal >= 500 ? 0 : method.fee); } catch (err: any) { setError(err.message ?? 'Unable to update delivery.'); }
    }

    async function placeOrder() {
        if (!orderId) return;
        setSaving(true); setError('');
        try {
            if (!mpesaPaid) throw new Error('Complete the M-Pesa payment before placing the order.');
            await finalizeCheckout(orderId);
            navigate('/checkout-success', { state: { message: 'Order created. Approve the M-Pesa prompt on your phone.', orders: [{ id: orderId, total }] } });
            clearCart();
        } catch (err: any) { setError(err.message ?? 'Unable to place order.'); } finally { setSaving(false); }
    }

    if (!cart.items.length) return <div className="mx-auto max-w-5xl px-6 py-20 text-center"><h1 className="text-3xl font-semibold text-[#16332b]">Your cart is empty</h1><Link className="mt-6 inline-block rounded-full bg-[#16332b] px-6 py-3 text-sm font-semibold text-white" to="/products">Browse products</Link></div>;

    return <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <Link to="/cart" className="text-sm font-semibold text-[#28704b]">← Back to cart</Link>
        <div className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
            <main>
                <div className="mb-8 flex items-start justify-between gap-2">{['Your Info', 'Delivery', 'Payment', 'Confirm'].map((label, index) => { const number = index + 1; return <div key={label} className="flex flex-1 items-center"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step === number ? 'bg-[#28704b] text-white' : step > number ? 'bg-[#d8efdf] text-[#28704b]' : 'bg-[#edf0ed] text-[#829087]'}`}>{step > number ? '✓' : number}</div><span className={`ml-2 hidden text-xs font-semibold sm:block ${step >= number ? 'text-[#28704b]' : 'text-[#829087]'}`}>{label}</span>{number < 4 && <div className={`mx-2 h-px flex-1 ${step > number ? 'bg-[#8bcea0]' : 'bg-[#dfe6df]'}`} />}</div>; })}</div>
                <section className="rounded-[2rem] border border-[#e3e2da] bg-white p-6 shadow-sm lg:p-8">
                    {step === 1 && <><h1 className="text-2xl font-semibold text-[#16332b]">Your information</h1><div className="mt-6 grid gap-4 sm:grid-cols-2">{([['firstName', 'First Name'], ['lastName', 'Last Name'], ['email', 'Email Address (optional)'], ['phone', 'Phone Number'], ['address', 'Delivery Address (optional)'], ['city', 'City (optional)'], ['county', 'County (optional)']] as const).map(([key, label]) => <label key={key} className="text-sm font-medium text-[#465b51]">{label}<input value={contact[key]} onChange={(event) => setContact({ ...contact, [key]: event.target.value })} placeholder={key === 'phone' ? '+254 7XX XXX XXX' : ''} className="mt-2 w-full rounded-xl border border-[#dfe6df] bg-[#f8faf7] px-4 py-3 outline-none focus:border-[#28704b]" /></label>)}<label className="text-sm font-medium text-[#465b51] sm:col-span-2">Delivery Notes (optional)<textarea value={contact.notes} onChange={(event) => setContact({ ...contact, notes: event.target.value })} className="mt-2 min-h-24 w-full rounded-xl border border-[#dfe6df] bg-[#f8faf7] px-4 py-3 outline-none focus:border-[#28704b]" /></label></div><button onClick={continueFromInfo} disabled={saving} className="mt-8 w-full rounded-full bg-[#28704b] px-6 py-4 font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Continue'}</button></>}
                    {step === 2 && <><h1 className="text-2xl font-semibold text-[#16332b]">Choose delivery</h1><div className="mt-6 space-y-3">{shipping.map((method) => <label key={method.id} className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 ${shippingId === method.id ? 'border-[#28704b] bg-[#f1faf3]' : 'border-[#dfe6df]'}`}><span className="flex items-center gap-3"><input type="radio" checked={shippingId === method.id} onChange={() => chooseShipping(method.id)} /><span><b className="block text-[#16332b]">{method.name}</b><small className="text-[#718078]">{method.detail}</small></span></span><b>{method.id === 'STANDARD' && deliveryFee === 0 ? 'Free' : formatKes(method.fee)}</b></label>)}</div><div className="mt-8 flex gap-3"><button onClick={() => setStep(1)} className="flex-1 rounded-full border border-[#dfe6df] px-6 py-3 font-semibold">Back</button><button onClick={() => setStep(3)} className="flex-1 rounded-full bg-[#28704b] px-6 py-3 font-semibold text-white">Continue</button></div></>}
                    {step === 3 && <><h1 className="text-2xl font-semibold text-[#16332b]">Payment with M-Pesa</h1><div className="mt-6 rounded-2xl border border-[#dfe6df] bg-[#f5f9f4] p-4"><p className="font-medium text-[#16332b]">M-Pesa STK push</p><p className="mt-1 text-sm text-[#718078]">We'll send a payment prompt to your Kenyan mobile number.</p><label className="mt-4 block text-sm font-medium text-[#465b51]">M-Pesa phone number<input value={mpesaPhone} onChange={(event) => setMpesaPhone(event.target.value)} placeholder="+254 7XX XXX XXX" className="mt-2 w-full rounded-xl border border-[#dfe6df] bg-white px-4 py-3 outline-none focus:border-[#28704b]" /></label>{mpesaPolling && <p className="mt-3 text-sm text-[#28704b]">Check your phone to complete payment... <span className="inline-block animate-spin">⟳</span></p>}{mpesaTimedOut && !mpesaPolling && <p className="mt-3 text-sm text-amber-700">Didn't get the prompt? Try again.</p>}{!mpesaPolling && !mpesaPaid && <button onClick={startMpesaPayment} disabled={saving} className="mt-4 w-full rounded-full bg-[#28704b] px-6 py-3 font-semibold text-white disabled:opacity-50">{saving ? 'Sending...' : mpesaTimedOut ? 'Try again' : 'Pay with M-Pesa'}</button>}{mpesaPaid && <p className="mt-3 text-sm font-semibold text-[#28704b]">Payment received. Continue to review.</p>}</div><div className="mt-8 flex gap-3"><button onClick={() => setStep(2)} className="flex-1 rounded-full border border-[#dfe6df] px-6 py-3 font-semibold">Back</button>{mpesaPaid && <button onClick={() => setStep(4)} className="flex-1 rounded-full bg-[#28704b] px-6 py-3 font-semibold text-white">Continue</button>}</div></>}
                    {step === 4 && <><h1 className="text-2xl font-semibold text-[#16332b]">Review your order</h1><div className="mt-6 space-y-4">{cart.items.map((item) => <div key={item.product.id} className="flex items-center gap-3"><img src={item.product.images[0]} className="h-14 w-14 rounded-xl object-cover" alt="" /><div className="flex-1"><p className="font-medium text-[#16332b]">{item.product.name}</p><p className="text-xs text-[#718078]">{item.quantity} × {formatKes(item.product.price)}</p></div><b>{formatKes(item.product.price * item.quantity)}</b></div>)}</div><div className="mt-6 rounded-2xl bg-[#f5f9f4] p-4 text-sm text-[#465b51]"><p><b>Delivery To:</b> {[contact.address, contact.city, contact.county].filter(Boolean).join(', ') || 'Not provided'}</p><p className="mt-2"><b>Shipping:</b> {selectedShipping.name}</p><p className="mt-2"><b>Payment:</b> M-Pesa STK push</p></div><div className="mt-8 flex gap-3"><button onClick={() => setStep(3)} className="flex-1 rounded-full border border-[#dfe6df] px-6 py-3 font-semibold">Back</button><button onClick={placeOrder} disabled={saving} className="flex-1 rounded-full bg-[#28704b] px-6 py-3 font-semibold text-white disabled:opacity-50">{saving ? 'Placing...' : `Place Order · ${formatKes(total)}`}</button></div></>}
                    {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
                </section>
            </main>
            <aside className="h-fit rounded-[2rem] border border-[#e3e2da] bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold text-[#16332b]">Order Summary</h2><div className="mt-5 space-y-3">{cart.items.map((item) => <div key={item.product.id} className="flex justify-between gap-3 text-sm"><span className="text-[#5a645d]">{item.product.name} × {item.quantity}</span><span>{formatKes(item.product.price * item.quantity)}</span></div>)}<div className="border-t border-[#edf0ed] pt-4 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatKes(cart.subtotal)}</span></div><div className="mt-2 flex justify-between"><span>Delivery</span><span>{deliveryFee ? formatKes(deliveryFee) : 'Free'}</span></div></div><div className="flex justify-between rounded-xl bg-[#16332b] p-4 font-semibold text-white"><span>Total</span><span>{formatKes(total)}</span></div></div></aside>
        </div>
    </div>;
}

export default CheckoutPage;
