import { fauna } from "../../../services/fauna";
import { query as q } from "faunadb";
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false
) {
  try {
    const userRef = await fauna.query(
      q.Select(
        "ref",
        q.Get(q.Match(q.Index("user_by_stripe_custome_id"), customerId))
      )
    );

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const subscriptionData = {
      id: subscription.id,
      userId: userRef,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
    };
 console.log("Else  init create 02 subscriptionData", subscriptionData);
    if (createAction) {
      console.log("Else  init create 02");
      await fauna.query(
        q.Create(q.Collection("subscriptions"), { data: subscriptionData })
      );
    } else {
         console.log("Else  init 03");

      await fauna.query(
        q.Replace(
          q.Select(
            "ref",
            q.Get(q.Match(q.Index("subscription_by_id"), subscriptionId))
          ),
          {
            data: subscriptionData,
          }
        )
      );

         console.log("Else  finally");
    }
  } catch (error) {
    console.log("Eroor na criação da inscrição:", error);
  }
}
