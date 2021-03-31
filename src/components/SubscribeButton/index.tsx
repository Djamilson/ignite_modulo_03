import { User } from "next-auth";
import { useSession, signIn } from "next-auth/client";
import { WithAdditionalParams } from "next-auth/_utils";
import { useRouter } from "next/router";

import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe-js";
import styles from "./styles.module.scss";

interface SubscribeButtonProps {
  priceId: string;
}

export function SubScribeButton({ priceId }: SubscribeButtonProps) {
  const router = useRouter();

  const [session] = useSession();

  console.log("session SubScriber:::", session);

  async function handleSubScribe() {
    if (!session) {
      signIn("github");
      return;
    }
/*
    if (session.activeSubscription) {
      router.push("/posts");
      return;
    }
*/
    try {
      console.log("subscribe:::: Vai chamar a rota");
      const response = await api.post("/subscribe");
      console.log("Chegou onde eu queria subscribe:::: passou do banckend", response.data);
      const { sessionId } = response.data;

      const stripe = await getStripeJs();
        console.log("stripe", stripe);

      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.log("Myyroo suuuuu:", error)
      alert(error.message);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSubScribe}
      className={styles.subscribeButton}
    >
      Subscribe now
    </button>
  );
}
