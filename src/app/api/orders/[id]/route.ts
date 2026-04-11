import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        
        // Use spread to update any provided fields (status, isRead, etc)
        const order = await (prisma.order as any).update({
            where: { id },
            data: {
                ...body
            }
        });

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // We can delete order items manually if cascade is not on, but Prisma handles relation if specified or by deleting parent.
        await prisma.orderItem.deleteMany({
            where: { orderId: id }
        });
        await prisma.order.delete({
            where: { id }
        });
        return NextResponse.json({ message: 'Order deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
