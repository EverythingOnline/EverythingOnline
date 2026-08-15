import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resolveAdminUserId(adminId?: string) {
    if (!adminId) return undefined;
    const user = await prisma.user.findUnique({ where: { id: adminId } });
    return user ? adminId : undefined;
}

export async function createMpesaPayment({ orderId, amount, checkoutRequestId, rawPayload }: { orderId: string; amount: number; checkoutRequestId?: string; rawPayload?: string }) {
    return prisma.payment.create({
        data: {
            orderId,
            amount,
            checkoutRequestId,
            method: 'MPESA_DARAJA',
            status: 'PENDING',
            rawPayload,
        },
    });
}

export async function findPaymentByCheckoutRequestId(checkoutRequestId: string) {
    return prisma.payment.findUnique({ where: { checkoutRequestId } as any });
}

export async function markPaymentExpired(paymentId: string, status: string) {
    return prisma.payment.update({ where: { id: paymentId }, data: { status } });
}

export async function createManualPayment({ orderId, method, reference, amount }: { orderId: string; method: string; reference?: string; amount: number }) {
    return prisma.payment.create({
        data: {
            orderId,
            amount,
            method,
            reference,
            status: 'AWAITING_REVIEW',
        },
    });
}

export async function getPendingPayments({ method }: { method?: string } = {}) {
    const where: any = { status: 'AWAITING_REVIEW' };
    if (method) where.method = method;
    return prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' }, include: { order: true } });
}

export async function getPendingPaymentsForAdmin({ method }: { method?: string } = {}) {
    const where: any = { status: 'AWAITING_REVIEW' };
    if (method) where.method = method;
    return prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' }, include: { order: { include: { user: true } } } });
}

// resolveAdminUserId intentionally declared once above

export async function approvePayment(paymentId: string, adminId: string) {
    const resolvedAdminId = await resolveAdminUserId(adminId);
    const updateData: any = {
        status: 'CONFIRMED',
        reviewedAt: new Date(),
    };
    if (resolvedAdminId) {
        updateData.reviewedById = resolvedAdminId;
    }

    const payment = await prisma.payment.update({ where: { id: paymentId }, data: updateData });
    return payment;
}

export async function rejectPayment(paymentId: string, adminId: string, note?: string) {
    const resolvedAdminId = await resolveAdminUserId(adminId);
    const updateData: any = {
        status: 'FAILED',
        reviewedAt: new Date(),
    };
    if (resolvedAdminId) {
        updateData.reviewedById = resolvedAdminId;
    }

    const payment = await prisma.payment.update({ where: { id: paymentId }, data: updateData });
    // optionally write note somewhere — for now store in rawPayload
    if (note) {
        await prisma.payment.update({ where: { id: paymentId }, data: { rawPayload: JSON.stringify({ note }) } });
    }
    return payment;
}

export async function savePaymentCallback(callbackData: any) {
    if (!callbackData.Body || !callbackData.Body.stkCallback) {
        const error = new Error('Invalid callback payload') as Error & { status?: number };
        error.status = 400;
        throw error;
    }

    const stkCallback = callbackData.Body.stkCallback;
    const checkoutRequestId = String(stkCallback.CheckoutRequestID);
    const existing = await prisma.payment.findUnique({ where: { checkoutRequestId } as any });
    const payload = {
        merchantRequestId: stkCallback.MerchantRequestID,
        reference: (stkCallback.CallbackMetadata?.Item || []).find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value ?? null,
        callbackData: JSON.stringify(stkCallback.CallbackMetadata ?? stkCallback),
        rawPayload: JSON.stringify(callbackData),
    } as any;

    if (existing) {
        await prisma.payment.update({ where: { id: existing.id }, data: payload });
    } else {
        // Cannot create a Payment without a valid orderId (DB constraint). Log for manual inspection.
        // eslint-disable-next-line no-console
        console.warn('Received MPESA callback for unknown checkoutRequestId:', checkoutRequestId);
    }
}

export async function getPayments() {
    return prisma.payment.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });
}
