/**
 * payments.ts — payment method catalogue + all payment-section copy.
 *
 * Each method maps to a `provider` (a gateway implementation in
 * `src/services/payment/`). Adding a new gateway is two steps: implement the
 * `PaymentGateway` interface, then register a method here.
 */

export type PaymentProviderId = "razorpay" | "cod";
export type PaymentMethodId = "upi" | "card" | "netbanking" | "cod";

export type PaymentMethod = {
  id: PaymentMethodId;
  /** Which gateway fulfils this method */
  provider: PaymentProviderId;
  label: string;
  description?: string;
  /** Small pill shown next to the label (e.g. "FASTEST") */
  tag?: string;
  /** Material Symbols icon name */
  icon: string;
  /** Net-banking bank shortcuts */
  banks?: string[];
  /** UPI-only: the inline VPA verification UI */
  upi?: {
    prompt: string;
    placeholder: string;
    verifyLabel: string;
    verifiedTemplate: string;
  };
  /** Extra fee (₹) added to the total when this method is chosen */
  fee?: number;
};

export const paymentMethods: PaymentMethod[] = [
  {
    id: "upi",
    provider: "razorpay",
    label: "UPI",
    description: "Google Pay, PhonePe, Paytm, BHIM",
    tag: "FASTEST",
    icon: "qr_code_2",
    upi: {
      prompt: "Enter your UPI ID or VPA:",
      placeholder: "yourname@bank",
      verifyLabel: "Verify",
      verifiedTemplate:
        "Verified: {name}. You will receive a collect request on your UPI app.",
    },
  },
  {
    id: "card",
    provider: "razorpay",
    label: "Credit / Debit / ATM Card",
    description: "Visa, Mastercard, RuPay",
    icon: "credit_card",
  },
  {
    id: "netbanking",
    provider: "razorpay",
    label: "Net Banking",
    banks: ["HDFC", "ICICI", "SBI", "Axis"],
    icon: "account_balance",
  },
  {
    id: "cod",
    provider: "cod",
    label: "Cash on Delivery (COD)",
    description: "₹49 nominal fee",
    icon: "payments",
    fee: 49,
  },
];

/** Payment-section copy (titles, CTA templates, legal note, help link). */
export const paymentsContent = {
  title: "Select",
  titleHighlight: "Payment",
  stepNumber: 4,
  payCtaTemplate: "Pay {amount} & Place Order",
  codCtaTemplate: "Place Order · {amount} on Delivery",
  processingLabel: "Processing…",
  mockNotice:
    "Demo mode — no live gateway keys are configured, so payment is simulated. Add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to enable real UPI, Card & Net Banking.",
  terms: "By clicking Pay, you agree to WrapUrs Terms of Gifting and Return Policy.",
  helpTitle: "Need help with personalization?",
  helpLink: "Chat with our gifting concierge on WhatsApp",
  secureNote: "100% Secure 256-bit Checkout",
} as const;

/** Resolve a single method by id. */
export function getPaymentMethod(id: string): PaymentMethod | undefined {
  return paymentMethods.find((m) => m.id === id);
}

/**
 * Methods filtered by feature flags — a disabled gateway is hidden from the UI.
 * (COD via `NEXT_PUBLIC_ENABLE_COD`, card/UPI/net-banking via `NEXT_PUBLIC_ENABLE_RAZORPAY`.)
 */
export function getEnabledPaymentMethods({
  cod,
  razorpay,
}: {
  cod: boolean;
  razorpay: boolean;
}): PaymentMethod[] {
  return paymentMethods.filter((m) =>
    m.provider === "cod" ? cod : razorpay,
  );
}
