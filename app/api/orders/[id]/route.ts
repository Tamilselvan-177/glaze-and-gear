import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { getShippingEmailTemplate } from '@/lib/email-templates';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber } = body;

    if (!status && trackingNumber === undefined) {
      return NextResponse.json({ error: 'status or trackingNumber is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (status === 'SHIPPED' && order.customerEmail && process.env.SMTP_HOST && !process.env.SMTP_HOST.includes("your_email")) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const htmlBody = getShippingEmailTemplate(order);

      // Send email asynchronously in the background (non-blocking)
      transporter.sendMail({
        from: `"Glaze & Gear" <${process.env.SMTP_USER}>`,
        to: order.customerEmail,
        subject: `Your order has shipped! - Glaze & Gear (#${order.id.slice(-6).toUpperCase()})`,
        html: htmlBody
      }).catch(err => {
        console.error('Failed to send shipping email in background:', err);
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to update order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
