import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import { getOrderEmailTemplate } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Missing Razorpay Secret");

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Mark as PAID
    const order = await prisma.order.update({
      where: { id: dbOrderId },
      data: {
        paymentStatus: "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    // Stock Decrement Logic
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    // Send Order Confirmation Email
    if (order.customerEmail && process.env.SMTP_HOST && !process.env.SMTP_HOST.includes("your_email")) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const htmlBody = getOrderEmailTemplate(order, false);

      await transporter.sendMail({
        from: `"Glaze & Gear" <${process.env.SMTP_USER}>`,
        to: order.customerEmail,
        subject: `Order Confirmation - Glaze & Gear (#${order.id.slice(-6).toUpperCase()})`,
        html: htmlBody
      });
      console.log(`[ORDER CONFIRMATION SENT TO] ${order.customerEmail}`);
    } else {
      console.log(`[MOCK ORDER CONFIRMATION SENT TO] ${order.customerEmail}`);
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Failed to verify payment:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
