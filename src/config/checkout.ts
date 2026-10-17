/**
 * checkout.ts — every string and constant used by the Checkout page and the
 * Order Confirmation page, plus the demo address book and address-form fields.
 */

import { site } from "@/config/site";

export const checkoutContent = {
  secureBadge: "100% Secure 256-bit Checkout",

  /** Collapsed account row at the top of the form column */
  account: {
    step: "1. LOGIN / ACCOUNT",
    change: "Change",
  },

  /** Delivery address section */
  address: {
    step: "Step 2 of 3",
    title: "Delivery",
    titleHighlight: "Address",
    useAddress: "Deliver to this Address",
    addNew: "Add a New Address",
    save: "Save and Deliver Here",
    cancel: "Cancel",
    typeHome: "Home (All Day Delivery)",
    typeWork: "Work (10 AM - 6 PM)",
    typeLabel: "Address Type",
  },

  /** Address form fields — `name` maps to the form model, `required` shows a `*` */
  addressFields: [
    { name: "fullName", label: "Full Name", required: true, span: 1 },
    { name: "mobile", label: "10-Digit Mobile", required: true, span: 1, inputMode: "numeric" },
    { name: "pincode", label: "Pincode", required: true, span: 1, inputMode: "numeric" },
    { name: "city", label: "City", required: true, span: 1 },
    { name: "line1", label: "Flat, House no., Building, Company, Apartment", required: true, span: 2 },
    { name: "line2", label: "Area, Colony, Street, Sector, Village", required: false, span: 2 },
  ],

  /** Order items section */
  orderSummary: {
    step: "3. Order",
    title: "Order",
    titleHighlight: "Summary",
    /** "{n} personalized boutique gifts • Delivery by {date}" */
    subtitleTemplate: "{count} personalized boutique gifts • Delivery by {date}",
    subtitleSingle: "1 personalized boutique gift • Delivery by {date}",
    totalLabel: "Total",
  },

  /** Price-details aside */
  priceDetails: {
    title: "Price",
    titleHighlight: "Details",
    itemsSuffix: "Items",
    totalMrp: "Total MRP",
    productDiscount: "Product Discount",
    couponLabel: "Boutique Coupon",
    delivery: "Delivery Charges",
    freeLabel: "FREE",
    codFee: "COD Fee",
    total: "Total Amount",
    /** "✨ You will save ₹898 on this order!" */
    savingsTemplate: "You will save {amount} on this order!",
    noteSecure:
      "Safe and secure 256-bit encrypted payments. 100% Money-back guarantee if damaged in transit.",
    noteDeliveryPrefix: "Estimated Delivery:",
    noteDeliverySuffix: "with live tracking & SMS updates.",
  },

  /** Order confirmation page */
  confirmation: {
    eyebrow: "Order Confirmation",
    thanksPrefix: "Thank you,",
    /** "Your order is placed" with "placed" highlighted */
    placedTitle: "Your order is",
    placedHighlight: "placed",
    orderIdLabel: "Order ID",
    emailPrefix: "Confirmation sent to",
    timelineTitle: "Delivery Timeline",
    timelinePrefix: "Expected Delivery by",
    packageTitle: "Package Details",
    deliveringTo: "Delivering to",
    paidVia: "Paid via",
    codDue: "Payable on delivery",
    track: "Track Your Parcel",
    continueShopping: "Continue Shopping",
    emptyTitle: "Order not found",
    emptyDescription:
      "We couldn't find that order on this device. Orders are stored locally until you sign in — check your confirmation email, or contact our concierge.",
  },
} as const;

export type AddressType = "HOME" | "WORK";

export type SavedAddress = {
  id: string;
  name: string;
  mobile: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  type: AddressType;
};

/** Demo address book (replaced by the account's saved addresses in M7). */
export const savedAddresses: SavedAddress[] = [
  {
    id: "addr-home",
    name: "Priya Sharma",
    mobile: "+91 98765 43210",
    line1: "Flat 402, Rosewood Heights, 14th Main Rd, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    type: "HOME",
  },
  {
    id: "addr-work",
    name: "Priya Sharma",
    mobile: "+91 98765 43210",
    line1: "Indiranagar Tech Park, 3rd Floor, Tower B, 100ft Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    type: "WORK",
  },
];

/** Demo account shown in the collapsed login row (real auth arrives in M7). */
export const demoAccount = {
  name: "Priya Sharma",
  mobile: "+91 98765 43210",
  email: "priya.sharma@example.com",
} as const;

/** Footer links shown under the confirmation card. */
export const confirmationFooterLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Return Policy", href: "/shipping-returns" },
  // No dedicated contact screen exists in the design; the concierge WhatsApp
  // link is the real "Help & Support" destination.
  { label: "Help & Support", href: site.contact.whatsappLink },
] as const;
