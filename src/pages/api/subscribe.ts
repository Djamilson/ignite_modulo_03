import { NextApiRequest, NextApiResponse } from 'next'

import { query as q } from 'faunadb'
import { getSession} from 'next-auth/client'

import { fauna } from '../../services/fauna'

import { stripe } from "../../services/stripe";

type User = {
  ref: {
    id: string;
  }
  data: {
    stripe_customer_id: string
  }
}


export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const session = await getSession({ req })
    
    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    )

    let customerId = user.data.stripe_customer_id
  }
}