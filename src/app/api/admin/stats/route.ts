import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const client = prisma as any;
        
        // Basic counts with error handling for Review table if not yet migrated
        let reviewCount = 0;
        let unreadMessages = 0;
        let orderCount = 0;
        let userCount = 0;
        let productCount = 0;
        let pendingOrders = 0;

        try { unreadMessages = await client.message.count({ where: { status: 'UNREAD' } }); } catch(e) {}
        try { orderCount = await client.order.count(); } catch(e) {}
        try { userCount = await client.user.count(); } catch(e) {}
        try { productCount = await client.product.count(); } catch(e) {}
        try { pendingOrders = await client.order.count({ where: { status: 'PENDING' } }); } catch(e) {}
        
        // Try to get review count if table exists
        try {
            reviewCount = await client.review.count();
        } catch (e) {
            console.log('Review table might not exist yet');
        }

        // Total revenue
        const orders = await client.order.findMany({
            select: { total: true }
        });
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

        // Recent orders
        const recentOrders = await client.order.findMany({
            take: 6,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                customer: true,
                total: true,
                status: true,
                createdAt: true
            }
        });

        // Revenue by month (last 6 months)
        const revenueByMonth = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

            const monthOrders = await client.order.findMany({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextMonth
                    }
                },
                select: { total: true }
            });

            const revenue = monthOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
            
            revenueByMonth.push({
                month: date.toLocaleString('default', { month: 'short' }),
                revenue: revenue
            });
        }

        return NextResponse.json({
            stats: {
                revenue: totalRevenue,
                orders: orderCount,
                users: userCount,
                products: productCount,
                unreadMessages,
                reviews: reviewCount,
                pendingOrders
            },
            recentOrders,
            revenueByMonth
        });
    } catch (error: any) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch stats' }, { status: 500 });
    }
}
