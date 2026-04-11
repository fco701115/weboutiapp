import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const client = prisma as any;
        const reviews = await client.review.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(reviews);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const client = prisma as any;
        
        const review = await client.review.create({
            data: {
                productId: body.productId,
                productName: body.productName,
                rating: body.rating,
                comment: body.comment,
                userEmail: body.userEmail,
                userName: body.userName,
                status: 'APPROVED'
            }
        });

        return NextResponse.json(review);
    } catch (error: any) {
        console.error('Create review error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
