import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function savePaymentCallback(callbackData: any) {
    if (!callbackData.Body || !callbackData.Body.stkCallback) {
        const error = new Error('Invalid callback payload') as Error & { status?: number };
        error.status = 400;
        throw error;
    }

    const stkCallback = callbackData.Body.stkCallback;
    await prisma.payment.create({
        data: {
            merchantRequestId: stkCallback.MerchantRequestID,
            checkoutRequestId: stkCallback.CheckoutRequestID,
            resultCode: stkCallback.ResultCode,
            resultDesc: stkCallback.ResultDesc,
            callbackData: JSON.stringify(stkCallback.CallbackMetadata ?? stkCallback),
            rawPayload: JSON.stringify(callbackData),
        },
    });
}

export async function getPayments() {
    return prisma.payment.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });
}
