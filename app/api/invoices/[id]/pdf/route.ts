import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { createSimplePdf } from "@/lib/pdf/simple-pdf";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!prisma) {
    const pdf = createSimplePdf({
      title: "Invoice NSS-DEMO",
      subtitle: "Namdhari Swaich Sweets demo invoice",
      columns: [
        { key: "product", label: "Product" },
        { key: "quantity", label: "Qty" },
        { key: "price", label: "Price" },
        { key: "total", label: "Total" }
      ],
      rows: [{ product: "Fresh Paneer", quantity: "2 KG", price: "360", total: "720" }]
    });
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf" } });
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      OR: [{ id }, { invoiceNumber: id }]
    },
    include: {
      customer: true,
      items: true
    }
  });

  if (!invoice) {
    return NextResponse.json({ ok: false, message: "Invoice not found." }, { status: 404 });
  }

  const pdf = createSimplePdf({
    title: `Invoice ${invoice.invoiceNumber}`,
    subtitle: `${invoice.customer?.name ?? "Walk-in"} | Total ${invoice.total.toString()} | Due ${invoice.dueAmount.toString()}`,
    columns: [
      { key: "productName", label: "Product" },
      { key: "quantity", label: "Qty" },
      { key: "price", label: "Price" },
      { key: "lineTotal", label: "Total" }
    ],
    rows: invoice.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity.toString(),
      price: item.price.toString(),
      lineTotal: item.lineTotal.toString()
    }))
  });

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`
    }
  });
}
