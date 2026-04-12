export async function startStripeCheckout(credits) {
  const normalizedCredits = Number(credits);

  if (!Number.isFinite(normalizedCredits) || normalizedCredits <= 0) {
    throw new Error("Invalid credits amount");
  }

  const res = await fetch("http://localhost:4242/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      credits: normalizedCredits,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || "Stripe checkout session failed");
  }

  if (!data?.url) {
    throw new Error("Stripe checkout URL not received");
  }

  window.location.href = data.url;
}