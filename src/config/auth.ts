/**
 * auth.ts (config) — AUTH copy, the demo credential, and the account-area nav.
 *
 * No UI text about signing in / registering lives in components; it is all here.
 */

export const authContent = {
  signIn: {
    eyebrow: "Welcome back",
    title: "Sign in to",
    titleHighlight: "WrapUrs",
    subtitle: "Track your orders, save addresses and check out faster.",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Your password",
    submit: "Sign in",
    submitting: "Signing in…",
    google: "Continue with Google",
    divider: "or continue with email",
    forgot: "Forgot password?",
    noAccount: "New to WrapUrs?",
    registerLink: "Create an account",
    guest: "Continue as guest",
    guestHint: "You can still check out as a guest — sign in only to track orders later.",
  },
  signUp: {
    eyebrow: "Join the boutique",
    title: "Create your",
    titleHighlight: "account",
    subtitle: "Save addresses, track every keepsake and unlock member offers.",
    nameLabel: "Full name",
    namePlaceholder: "Priya Sharma",
    phoneLabel: "Mobile number (optional)",
    phonePlaceholder: "+91 98765 43210",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 8 characters",
    confirmLabel: "Confirm password",
    confirmPlaceholder: "Repeat your password",
    submit: "Create account",
    submitting: "Creating account…",
    hasAccount: "Already have an account?",
    signInLink: "Sign in",
    terms: "By creating an account you agree to our Terms of Service and Privacy Policy.",
  },
  errors: {
    required: "Please fill in every field.",
    invalid: "Invalid email or password.",
    mismatch: "Passwords do not match.",
    weak: "Password must be at least 8 characters.",
    invalidEmail: "Enter a valid email address.",
    exists: "An account with that email already exists.",
    network: "Something went wrong. Please try again.",
  },
  /** Shown on the sign-in page so the storefront is testable without a backend. */
  demoHint: {
    title: "Demo account",
    body: "Use {email} with password {password} to explore the account area, or create your own.",
  },
} as const;

/**
 * The seeded demo credential. Registration also works (in-memory until the
 * Prisma user table lands in M10) — see `src/services/auth/user-store.ts`.
 */
export const demoCredentials = {
  email: "priya.sharma@example.com",
  password: "wrapurs123",
} as const;

/** Account-area sidebar navigation. */
export const accountNav = [
  { label: "Dashboard", href: "/account", icon: "space_dashboard" },
  { label: "My Orders", href: "/account/orders", icon: "receipt_long" },
  { label: "Addresses", href: "/account/addresses", icon: "location_on" },
  { label: "Profile", href: "/account/profile", icon: "person" },
] as const;

/** Account-area page copy (dashboard + section headings). */
export const accountContent = {
  eyebrow: "My Account",
  greeting: "Hello",
  greetingSuffix: "welcome back",
  signOut: "Sign out",
  signedInAs: "Signed in as",
  dashboard: {
    stats: {
      orders: "Orders placed",
      wishlist: "Wishlist items",
      addresses: "Saved addresses",
    },
    recentOrders: "Recent orders",
    viewAll: "View all orders",
    noOrders: "You haven't placed an order yet.",
    noOrdersCta: "Start shopping",
    quickTitle: "Quick links",
  },
  orders: {
    title: "My Orders",
    highlight: "Orders",
    subtitle: "Every keepsake you've ordered, with live delivery tracking.",
    empty: "No orders yet — your personalized keepsakes will appear here.",
    emptyCta: "Explore gifts",
    orderLabel: "Order",
    placedOn: "Placed on",
    total: "Total",
    viewDetails: "Track order",
    itemsSuffix: "items",
    itemSuffix: "item",
  },
  tracking: {
    title: "Order",
    highlight: "Tracking",
    back: "Back to orders",
    timelineTitle: "Delivery Timeline",
    packageTitle: "Items in this order",
    deliveringTo: "Delivering to",
    paymentTitle: "Payment",
    summaryTitle: "Price Details",
    notFound: "We couldn't find that order.",
  },
  addresses: {
    title: "Saved",
    highlight: "Addresses",
    subtitle: "Manage the addresses you deliver to.",
    addNew: "Add a new address",
    edit: "Edit",
    remove: "Remove",
    save: "Save address",
    cancel: "Cancel",
    default: "Default",
    setDefault: "Set as default",
    empty: "No saved addresses yet.",
    formTitleAdd: "Add a new address",
    formTitleEdit: "Edit address",
  },
  profile: {
    title: "Your",
    highlight: "Profile",
    subtitle: "Keep your details up to date for faster checkout.",
    nameLabel: "Full name",
    emailLabel: "Email address",
    phoneLabel: "Mobile number",
    save: "Save changes",
    saved: "Profile updated.",
    emailNote: "Your email is used to sign in and can't be changed here.",
  },
} as const;

/** Order fulfillment stages used by the tracking timeline. */
export const orderStages = [
  { id: "placed", label: "Order Placed", description: "We've received your order", icon: "check_circle" },
  { id: "processing", label: "Processing", description: "Being personalized by our artisans", icon: "palette" },
  { id: "shipped", label: "Shipped", description: "On its way to you", icon: "local_shipping" },
  { id: "delivered", label: "Delivered", description: "Handed over with love", icon: "home" },
] as const;

export type OrderStageId = (typeof orderStages)[number]["id"];
