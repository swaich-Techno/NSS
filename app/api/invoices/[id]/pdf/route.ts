import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { createInvoicePdf } from "@/lib/pdf/invoice-pdf";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!prisma) {
    const pdf = createInvoicePdf({
      settings: {
        businessName: "Namdhari Swaich Sweets",
        address: "Business address",
        phone: "Add phone",
        invoiceFooterTerms: "Thank you for your business. Please verify items and payment before leaving the counter.",
        upiPaymentDetails: "Add UPI details in Business Settings",
        currency: "INR",
        themeColor: "#145f45"
      },
      invoice: {
        invoiceNumber: "NSS-DEMO",
        issueDate: new Date(),
        subtotal: "720.00",
        discountTotal: "0.00",
        taxTotal: "36.00",
        total: "756.00",
        paidAmount: "500.00",
        dueAmount: "256.00",
        paymentMode: "CASH",
        status: "PARTIAL",
        notes: "Demo invoice generated without database connection."
      },
      customer: {
        name: "Walk-in Customer",
        phone: "-"
      },
      items: [
        {
          productName: "Fresh Paneer (PANEER-1KG)",
          quantity: "2",
          unit: "KG",
          price: "360.00",
          taxRate: "5.00",
          taxAmount: "36.00",
          lineTotal: "756.00"
        }
      ],
      cashierName: "Demo Owner"
    });
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf" } });
  }

  const [settings, invoice] = await Promise.all([
    prisma.businessSettings.findFirst(),
    prisma.invoice.findFirst({
      where: {
        OR: [{ id }, { invoiceNumber: id }]
      },
      include: {
        customer: true,
        items: {
          orderBy: { createdAt: "asc" }
        },
        cashier: {
          select: { name: true }
        }
      }
    })
  ]);

  if (!invoice) {
    return NextResponse.json({ ok: false, message: "Invoice not found." }, { status: 404 });
  }

  const pdf = createInvoicePdf({
    settings: settings ?? {
      businessName: "Namdhari Swaich Sweets",
      address: "Add business address",
      phone: "Add phone",
      invoiceFooterTerms: "Thank you for your business.",
      currency: "INR",
      themeColor: "#145f45"
    },
    invoice,
    customer: invoice.customer,
    items: invoice.items,
    cashierName: invoice.cashier?.name
  });

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`
    }
  });
}
