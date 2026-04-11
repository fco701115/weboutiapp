import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const [orders, reviews, messages, favorites] = await Promise.all([
            prisma.order.findMany({ 
                where: { email: user.email },
                orderBy: { createdAt: 'desc' },
                include: { items: true }
            }),
            prisma.review.findMany({ 
                where: { userEmail: user.email },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.message.findMany({ 
                where: { email: user.email },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.favorite.findMany({
                where: { userEmail: user.email },
                orderBy: { createdAt: 'desc' },
                include: { product: true }
            })
        ]);

        return NextResponse.json({
            orders,
            reviews,
            messages,
            favorites: favorites.map(f => f.product)
        });
    } catch (error) {
        console.error('Failed to fetch user activity:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
