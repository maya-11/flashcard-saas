import { loadStripe } from "@stripe/stripe-js";

let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      "pk_test_51Q5UnWP8NWh0Bku2O3huKmpbqxTBBCBr0FwshYMWks2oFOpstlo5N2XnsLzC8WBOXkx1D3QZox6Z0o1bCpg2UpPo00D6Jd9DJ3"
    );
  }
  return stripePromise;
};

export default getStripe;
