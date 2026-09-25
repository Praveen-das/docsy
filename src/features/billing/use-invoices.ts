"use client";

import { useQuery } from "@tanstack/react-query";

export interface InvoiceItem {
  id: string;
  number: string | null;
  created: number;
  amountPaid: number;
  currency: string;
  status: string | null;
  pdfUrl: string | null;
  hostedInvoiceUrl: string | null;
}

export interface PaymentMethodInfo {
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  email: string | null;
}

export interface InvoicesResponse {
  invoices: InvoiceItem[];
  paymentMethod: PaymentMethodInfo | null;
}

async function fetchInvoices(): Promise<InvoicesResponse> {
  const res = await fetch("/api/stripe/invoices");
  if (!res.ok) {
    throw new Error("Failed to load invoices");
  }
  return res.json() as Promise<InvoicesResponse>;
}

export function useInvoices() {
  return useQuery<InvoicesResponse>({
    queryKey: ["billing-invoices"],
    queryFn: fetchInvoices,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
