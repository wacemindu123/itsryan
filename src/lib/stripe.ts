import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}

/**
 * Create a Stripe Product + Price for a how-to guide.
 * Returns { productId, priceId } or null if Stripe is not configured.
 */
export async function createStripeProduct(guide: {
  title: string;
  description?: string | null;
  price: number;
}): Promise<{ productId: string; priceId: string } | null> {
  const stripe = getStripe();
  if (!stripe || guide.price <= 0) return null;

  const product = await stripe.products.create({
    name: guide.title,
    description: guide.description || 'How-To Guide by ItsRyan.ai',
    metadata: { source: 'howto_guide' },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(guide.price * 100),
    currency: 'usd',
  });

  return { productId: product.id, priceId: price.id };
}

/**
 * Update a Stripe Product's name/description and optionally create a new Price
 * if the dollar amount changed. Archives the old price.
 */
export async function updateStripeProduct(opts: {
  stripeProductId: string;
  stripePriceId: string | null;
  title: string;
  description?: string | null;
  price: number;
}): Promise<{ productId: string; priceId: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  // If price is now free, archive the product
  if (opts.price <= 0) {
    await stripe.products.update(opts.stripeProductId, { active: false });
    if (opts.stripePriceId) {
      await stripe.prices.update(opts.stripePriceId, { active: false });
    }
    return null;
  }

  // Update product metadata
  await stripe.products.update(opts.stripeProductId, {
    name: opts.title,
    description: opts.description || 'How-To Guide by ItsRyan.ai',
  });

  // Check if price changed
  let newPriceId = opts.stripePriceId;
  if (opts.stripePriceId) {
    const existingPrice = await stripe.prices.retrieve(opts.stripePriceId);
    const currentAmount = existingPrice.unit_amount ?? 0;
    const newAmount = Math.round(opts.price * 100);

    if (currentAmount !== newAmount) {
      // Archive old price, create new one
      await stripe.prices.update(opts.stripePriceId, { active: false });
      const price = await stripe.prices.create({
        product: opts.stripeProductId,
        unit_amount: newAmount,
        currency: 'usd',
      });
      newPriceId = price.id;
    }
  } else {
    // No existing price — create one
    const price = await stripe.prices.create({
      product: opts.stripeProductId,
      unit_amount: Math.round(opts.price * 100),
      currency: 'usd',
    });
    newPriceId = price.id;
  }

  return { productId: opts.stripeProductId, priceId: newPriceId! };
}
