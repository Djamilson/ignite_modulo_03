import { NextApiRequest, NextApiResponse } from "next";

import { query as q } from "faunadb";
import { getSession, useSession } from "next-auth/client";

import { fauna } from "../../services/fauna";

import { stripe } from "../../services/stripe";

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
 const session = await getSession({ req });

 console.log("cheogu:::: Entrou no if::", session);

  if (req.method === "POST") {
   
    console.log("=>", req);
    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index("user_by_email"), q.Casefold(session.user.email)))
    );
    console.log("===>>>Passou:: 000");
    let customerId = user.data.stripe_customer_id;

    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      });
      console.log("===>>>Passou:: 0");
      await fauna.query(
        q.Update(q.Ref(q.Collection("users"), user.ref.id), {
          data: {
            stripe_customer_id: stripeCustomer.id,
          },
        })
      );

      customerId = stripeCustomer.id;
    }
    console.log("===>>>Passou::2");
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [
        {
          price: "price_1IaSjVHz4MB8xBZfzflYPigY",
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    console.log("===>>>Passou::");
    return res.status(200).json({ sessionId: stripeCheckoutSession.id });

   // return res.status(200).json({ te: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};
