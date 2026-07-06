import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code, cartTotal, userEmail } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive promo code' }, { status: 400 });
    }

    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 });
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 });
    }

    if (promo.minOrderValue && cartTotal !== undefined && cartTotal < promo.minOrderValue) {
      return NextResponse.json({ error: `Minimum order value of ₹${promo.minOrderValue} required` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      discountType: promo.discountType,
      discountPercent: promo.discountPercent,
      flatDiscountAmount: promo.flatDiscountAmount,
      maxDiscountAmount: promo.maxDiscountAmount || null
    });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
