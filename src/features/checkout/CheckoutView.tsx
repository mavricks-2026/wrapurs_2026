"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { cartContent } from "@/config/cart";
import { checkoutContent, demoAccount, savedAddresses as defaultAddresses, type SavedAddress } from "@/config/checkout";
import {
  paymentsContent,
  getEnabledPaymentMethods,
  getPaymentMethod,
  type PaymentMethodId,
} from "@/config/payments";
import { features, site } from "@/config/site";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion";
import { animationConfig } from "@/config/motion";
import { useMounted } from "@/hooks/useMounted";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay-client";
import {
  selectDiscountTotal,
  selectLineCount,
  selectMrpTotal,
  selectSubtotal,
  useCartStore,
} from "@/features/cart/useCartStore";
import { useOrderStore } from "@/features/orders";
import { CheckoutStepper } from "@/features/cart/CheckoutStepper";
import { AccountCard } from "./AccountCard";
import { AddressSection } from "./AddressSection";
import { OrderItemsCard } from "./OrderItemsCard";
import { PaymentSection } from "./PaymentSection";
import { PriceAside, type PriceAsideData } from "./PriceAside";
import { useAccountStore, resolveAddresses } from "@/features/account/useAccountStore";

/** Enabled gateways (driven by feature flags), resolved once. */
const enabledMethods = getEnabledPaymentMethods({ cod: features.cod, razorpay: features.razorpay });

/**
 * CheckoutView — the client orchestrator for /checkout. Reads the persisted
 * cart, computes every amount once, holds the address/payment selection and
 * drives the whole flow: it first persists the order via POST /api/orders,
 * then (for online payments) opens a gateway order for that persisted order
 * and verifies the payment server-side, before routing to the confirmation
 * page with the persisted order id. Cash on Delivery is persisted unpaid.
 */
export function CheckoutView({ demoPayments }: { demoPayments: boolean }) {
  const mounted = useMounted();
  const router = useRouter();

  const lines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);
  const placeOrder = useOrderStore((s) => s.placeOrder);
  // Guards against double-submits (double click / re-entrancy while a request
  // is in flight), since `placing` state updates are async.
  const submittingRef = useRef(false);

  const lineCount = useCartStore(selectLineCount);
  const mrpTotal = useCartStore(selectMrpTotal);
  const discountTotal = useCartStore(selectDiscountTotal);
  const subtotal = useCartStore(selectSubtotal);

  const { data: session } = useSession();
  const accountStore = useAccountStore();
  const accountEmail = session?.user?.email;
  const accountName = session?.user?.name;
  const accountAddresses = useMemo(
    () => resolveAddresses(accountStore, accountEmail),
    [accountStore, accountEmail],
  );
  const addAddressToStore = useAccountStore((s) => s.addAddress);

  const [method, setMethod] = useState<PaymentMethodId>(enabledMethods[0]?.id ?? "cod");
  const [upiId, setUpiId] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<SavedAddress | null>(defaultAddresses[0] ?? null);

  // Prefer the account's default address once the session hydrates.
  useEffect(() => {
    if (address || !accountEmail) return;
    if (accountAddresses[0]) setAddress(accountAddresses[0]);
  }, [accountAddresses, accountEmail, address]);

  const selectedPayment = getPaymentMethod(method);
  const codFee = selectedPayment?.fee ?? 0;
  const freeDelivery = subtotal >= cartContent.freeDeliveryThreshold;
  const couponAmount = cartContent.coupon.amount;

  const totals = useMemo<PriceAsideData>(() => {
    const delivery = freeDelivery ? 0 : cartContent.deliveryFee;
    const total = Math.max(0, subtotal - couponAmount) + delivery + codFee;
    return {
      lineCount,
      mrpTotal,
      discountTotal,
      couponCode: cartContent.coupon.code,
      couponAmount,
      deliveryFee: cartContent.deliveryFee,
      freeDelivery,
      codFee,
      total,
      savings: discountTotal + couponAmount,
    };
  }, [couponAmount, codFee, discountTotal, freeDelivery, lineCount, mrpTotal, subtotal]);

  if (!mounted) return <CheckoutSkeleton />;

  if (!lines.length && !redirecting) {
    return (
      <div className="w-full bg-surface">
        <Container className="flex flex-col items-center gap-5 py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-section text-brand">
            <Icon name="shopping_bag" className="text-[32px]" />
          </span>
          <h1 className="font-display text-[32px] text-plum">Your cart is empty</h1>
          <p className="max-w-md font-body text-[15px] text-plum-muted">
            Add a personalized keepsake to your cart before checking out.
          </p>
          <ButtonLink href="/shop" size="lg">
            Explore gifts
            <Icon name="arrow_forward" className="text-[20px]" />
          </ButtonLink>
        </Container>
      </div>
    );
  }

  function handleVerifyUpi() {
    setError(null);
    if (/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
      setUpiVerified(true);
    } else {
      setUpiVerified(false);
      setError("Enter a valid UPI ID (e.g. yourname@bank).");
    }
  }

  /**
   * Create the persisted order on the server (POST /api/orders). Only slugs,
   * quantities, personalization, the address, email and payment method are sent
   * — prices/totals are recomputed server-side and are never trusted from here.
   * Returns the persisted order id, which is the single source of truth for the
   * confirmation page and for every payment call.
   */
  async function createPersistedOrder(): Promise<string> {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: accountEmail ?? demoAccount.email,
        method,
        address: {
          name: address?.name ?? accountName ?? demoAccount.name,
          mobile: address?.mobile ?? demoAccount.mobile,
          line1: address?.line1 ?? "",
          line2: address?.line2 ?? null,
          city: address?.city ?? "",
          state: address?.state ?? "",
          pincode: address?.pincode ?? "",
          type: address?.type ?? "HOME",
        },
        lines: lines.map((l) => ({
          slug: l.slug,
          qty: l.qty,
          variant: l.variant,
          personalization: l.personalization ?? null,
        })),
      }),
    });

    const data = (await response.json()) as {
      order?: { id?: string };
      error?: string;
      detail?: string;
    };
    if (!response.ok || !data.order?.id) {
      throw new Error(data.detail ?? data.error ?? "We couldn't place your order. Please try again.");
    }
    return data.order.id;
  }

  /**
   * Mirror the just-created order into the local store (so the existing
   * confirmation page can render it) using the PERSISTED server order id, then
   * empty the cart and route to the confirmation page.
   */
  function completeOrder(
    orderId: string,
    { paid, reference }: { paid: boolean; reference: string },
  ) {
    const chosen = getPaymentMethod(method);
    setRedirecting(true);
    placeOrder({
      id: orderId,
      email: accountEmail ?? demoAccount.email,
      items: lines.map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        image: l.image,
        price: l.price,
        qty: l.qty,
        variant: l.variant,
        personalization: l.personalization,
      })),
      address: {
        name: address?.name ?? accountName ?? demoAccount.name,
        mobile: address?.mobile ?? demoAccount.mobile,
        line1: address?.line1 ?? "",
        line2: address?.line2,
        city: address?.city ?? "",
        state: address?.state ?? "",
        pincode: address?.pincode ?? "",
        type: address?.type ?? "HOME",
      },
      payment: {
        method,
        label: chosen?.label ?? method,
        provider: chosen?.provider ?? "razorpay",
        paid,
        amount: totals.total,
        reference,
      },
      amounts: {
        mrp: mrpTotal,
        discount: discountTotal,
        coupon: couponAmount,
        couponCode: cartContent.coupon.code,
        delivery: freeDelivery ? 0 : cartContent.deliveryFee,
        codFee,
        total: totals.total,
      },
    });

    clearCart();
    router.push(`/order/${orderId}`);
  }

  async function handlePay() {
    if (submittingRef.current) return;
    if (!address) {
      setError("Please select a delivery address before paying.");
      return;
    }
    submittingRef.current = true;
    setError(null);
    setPlacing(true);

    try {
      // 1. Persist the order first — its server id drives every next step.
      const orderId = await createPersistedOrder();

      // 2. Cash on Delivery — the order is placed straight away and stays
      //    unpaid; Razorpay is never invoked.
      if (selectedPayment?.provider === "cod") {
        completeOrder(orderId, { paid: false, reference: `cod_${orderId.slice(0, 8)}` });
        return;
      }

      // 3. Online payment — ask the server to open a gateway order for this
      //    persisted order. The server reads the amount from the stored order;
      //    nothing about the price is sent from the browser.
      const createResponse = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const created = (await createResponse.json()) as {
        ok: boolean;
        mode?: string;
        provider?: string;
        orderId?: string;
        wrapursOrderId?: string;
        keyId?: string;
        currency?: string;
        error?: string;
      };

      if (!createResponse.ok || !created.ok || !created.orderId) {
        throw new Error(created.error ?? "Could not start the payment.");
      }

      // Razorpay mock mode — no live keys configured, simulate a capture.
      // (The verify route still refuses mock ids in production.)
      if (created.mode === "mock") {
        await new Promise((resolve) => setTimeout(resolve, 900));
        const verifyResponse = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            razorpayOrderId: created.orderId,
            paymentId: `pay_mock_${created.orderId.slice(-12)}`,
            signature: "",
          }),
        });
        const verify = (await verifyResponse.json()) as { ok: boolean; error?: string };
        if (!verify.ok) throw new Error(verify.error ?? "Payment verification failed.");
        completeOrder(orderId, { paid: true, reference: `pay_mock_${created.orderId.slice(-12)}` });
        return;
      }

      // Razorpay live mode — open Checkout and verify the signature server-side.
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Unable to load the payment gateway.");

      const success = await openRazorpayCheckout({
        key: created.keyId as string,
        amount: Math.round(totals.total * 100),
        currency: created.currency ?? site.currency.code,
        name: site.name,
        description: `WrapUrs order · ${totals.lineCount} item${totals.lineCount === 1 ? "" : "s"}`,
        order_id: created.orderId,
        prefill: {
          name: address.name,
          email: accountEmail ?? demoAccount.email,
          contact: address.mobile,
        },
        notes: { method },
        theme: {
          color:
            typeof window !== "undefined"
              ? getComputedStyle(document.documentElement).getPropertyValue("--color-brand").trim() || "#B96CB4"
              : "#B96CB4",
        },
      });

      const verifyResponse = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          razorpayOrderId: success.razorpay_order_id,
          paymentId: success.razorpay_payment_id,
          signature: success.razorpay_signature,
        }),
      });
      const verify = (await verifyResponse.json()) as { ok: boolean; error?: string };
      if (!verify.ok) throw new Error(verify.error ?? "Payment verification failed.");

      completeOrder(orderId, { paid: true, reference: success.razorpay_payment_id });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message === "payment_cancelled" ? "Payment cancelled. You can try again." : message);
      setPlacing(false);
      submittingRef.current = false;
    }
  }

  return (
    <div className="w-full bg-surface">
      <Container className="flex flex-col gap-8 py-8">
        {/* Secure badge + progress */}
        <Reveal from="none" className="flex flex-col items-center gap-4 pt-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 font-body text-[12px] font-semibold text-plum-muted">
            <Icon name="lock" filled className="text-[15px] text-brand" />
            {checkoutContent.secureBadge}
          </span>
          <CheckoutStepper current={2} markCurrentDone={false} />
        </Reveal>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Form column */}
          <div className="flex flex-col gap-5 lg:col-span-8">
            <AccountCard signedIn={Boolean(accountEmail)} name={accountName ?? demoAccount.name} email={accountEmail ?? demoAccount.email} mobile={demoAccount.mobile} />
            <AddressSection
              selected={address}
              onSelect={setAddress}
              addresses={accountAddresses}
              onAdd={(a) => accountEmail && addAddressToStore(accountEmail, a)}
            />
            <OrderItemsCard lines={lines} total={totals.total} />
            <PaymentSection
              methods={enabledMethods}
              selected={method}
              onSelect={(id) => {
                setMethod(id);
                setError(null);
              }}
              upiId={upiId}
              onUpiIdChange={(value) => {
                setUpiId(value);
                setUpiVerified(false);
              }}
              upiVerified={upiVerified}
              onVerifyUpi={handleVerifyUpi}
              total={totals.total}
              placing={placing}
              error={error}
              demoPayments={demoPayments}
              onPay={handlePay}
            />
          </div>

          {/* Price aside */}
          <aside className="lg:sticky lg:top-28 lg:col-span-4">
            <Reveal from="left">
              <PriceAside data={totals} />
            </Reveal>
          </aside>
        </div>
      </Container>

      {/* Redirect overlay */}
      {redirecting ? (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-surface/90 backdrop-blur-sm">
          <Icon name="progress_activity" className="animate-spin text-[40px] text-brand" />
          <p className="font-display text-[26px] text-plum">{paymentsContent.processingLabel}</p>
          <p className="font-body text-[13px] text-plum-muted">
            Placing your order and confirming payment…
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** Loading skeleton shown for the first client paint (persisted cart unknown). */
function CheckoutSkeleton() {
  return (
    <div className="w-full bg-surface">
      <Container className="flex flex-col gap-8 py-8">
        <div className="flex flex-col items-center gap-4 pt-2">
          <div className="h-7 w-64 animate-pulse rounded-full bg-line/50" />
          <div className="h-7 w-72 animate-pulse rounded-full bg-line/50" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-8">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }}
                className="h-36 rounded-[24px] border border-line bg-white/70"
              />
            ))}
          </div>
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="h-80 rounded-[24px] border border-line bg-white/70"
            />
          </div>
        </div>
        <motion.span
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: animationConfig.duration.base }}
          className="sr-only"
        >
          Loading secure checkout…
        </motion.span>
      </Container>
    </div>
  );
}
