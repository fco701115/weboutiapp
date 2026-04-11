import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const data = await req.json();
        const { productId, action, userEmail: bodyEmail } = data; // action: 'add' or 'remove'
        
        const userEmail = session?.user?.email || bodyEmail;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        if (action === 'add') {
            await prisma.favorite.upsert({
                where: {
                    userEmail_productId: {
                        userEmail: userEmail,
                        productId: productId,
                    }
                },
                update: {},
                create: {
                    userEmail: userEmail,
                    productId: productId,
                }
            });
        } else if (action === 'remove') {
            await prisma.favorite.delete({
                where: {
                    userEmail_productId: {
                        userEmail: userEmail,
                        productId: productId,
                    }
                }
            }).catch(() => {}); // Ignore if doesn't exist
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Favorites API Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
