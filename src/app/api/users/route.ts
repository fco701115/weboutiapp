import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Correlate counts by email
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const [orders, reviews, messages, favorites] = await Promise.all([
                prisma.order.count({ where: { email: user.email } }),
                prisma.review.count({ where: { userEmail: user.email } }),
                prisma.message.count({ where: { email: user.email } }),
                prisma.favorite.count({ where: { userEmail: user.email } })
            ]);

            return {
                ...user,
                _count: {
                    orders,
                    reviews,
                    messages,
                    favorites
                }
            };
        }));

        return NextResponse.json(usersWithStats);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const email = data.email.toLowerCase().trim();
        
        let hashedPassword = null;
        if (data.password) {
            hashedPassword = await bcrypt.hash(data.password, 10);
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            // If user exists but has no password, allow setting one (Account Upgrade)
            if (!existingUser.password && hashedPassword) {
                const updatedUser = await prisma.user.update({
                    where: { email },
                    data: {
                        name: data.name || existingUser.name,
                        password: hashedPassword,
                        status: data.status || existingUser.status
                    }
                });
                return NextResponse.json(updatedUser, { status: 200 });
            }
            
            return NextResponse.json({ error: 'El usuario ya está registrado. Por favor, inicia sesión.' }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email,
                password: hashedPassword,
                role: data.role || 'USER',
                status: data.status || 'ACTIVE'
            }
        });
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error('Error creating/updating user:', error);
        return NextResponse.json({ error: 'Error al procesar la solicitud de usuario' }, { status: 500 });
    }
}
