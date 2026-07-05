import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";
import { getOrderEmailTemplate } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, customerInfo, items, promoCode, paymentMethod } = body; 
    const isCod = paymentMethod === "COD";

    let finalAmount = amount;

    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase() }
      });
      if (promo && promo.isActive) {
        const discountAmount = (amount * promo.discountPercent) / 100;
        finalAmount = amount - discountAmount;
      }
    }

    const session = await getServerSession(authOptions);

    // ── Stock Validation & Cost Fetching ──────────────────────────────────────────────
    const stockErrors: string[] = [];
    const productDataMap: Record<string, { costPrice: number }> = {};

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { name: true, stock: true, costPrice: true }
      });
      if (!product) {
        stockErrors.push(`Product not found: ${item.id}`);
      } else if (product.stock < item.quantity) {
        stockErrors.push(
          `"${product.name}" only has ${product.stock} left in stock (you requested ${item.quantity}).`
        );
      } else {
        productDataMap[item.id] = { costPrice: product.costPrice };
      }
    }
    if (stockErrors.length > 0) {
      return NextResponse.json(
        { error: 'Some items are out of stock', details: stockErrors },
        { status: 409 }
      );
    }
    // ─────────────────────────────────────────────────────────────────

    if (isCod) {
      // Create COD Order directly
      const order = await prisma.order.create({
        data: {
          totalAmount: finalAmount,
          shippingAddress: customerInfo?.shippingAddress,
          customerName: customerInfo?.name || "Anonymous",
          customerEmail: customerInfo?.email || "N/A",
          customerPhone: customerInfo?.phone || "",
          userId: session?.user?.id || undefined,
          paymentMethod: "COD",
          paymentStatus: "PENDING",
          status: "PENDING",
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
              costPrice: productDataMap[item.id]?.costPrice || 0,
            })),
          },
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

        const htmlBody = getOrderEmailTemplate(order, true);

        await transporter.sendMail({
          from: `"Glaze & Gear" <${process.env.SMTP_USER}>`,
          to: order.customerEmail,
          subject: `Order Confirmation - Glaze & Gear (#${order.id.slice(-6).toUpperCase()})`,
          html: htmlBody
        });
      }

      return NextResponse.json({
        success: true,
        isCod: true,
        dbOrderId: order.id,
      });
    }

    // Razorpay Flow
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials missing in .env");
    }

    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(finalAmount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await instance.orders.create(options);

    const order = await prisma.order.create({
      data: {
        totalAmount: finalAmount,
        shippingAddress: customerInfo?.shippingAddress,
        customerName: customerInfo?.name || "Anonymous",
        customerEmail: customerInfo?.email || "N/A",
        customerPhone: customerInfo?.phone || "",
        userId: session?.user?.id || undefined,
        paymentMethod: "RAZORPAY",
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: "PENDING",
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            costPrice: productDataMap[item.id]?.costPrice || 0,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      isCod: false,
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      dbOrderId: order.id,
    });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
