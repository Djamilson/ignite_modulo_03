import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { fauna } from "../../../services/fauna";
import { query as q } from "faunadb";

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: "read:user",
    }),
  ],
  callbacks: {
    async signIn(user, account, profile) {
      const { email } = user;
      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(q.Index("user_by_email"), q.Casefold(user.email))
              )
            ),

            q.Create(q.Collection("users"), {
              data: { email },
            }),
            q.Get(q.Match(q.Index("user_by_email"), q.Casefold(user.email)))
          )
        );

        return true;
      } catch {
        return false;
      }
    },

    async session(session) {
      try {

     const userActiveSubscription = await fauna.query(
       q.Paginate(
         q.Intersection(
           q.Match(
             q.Index("subscription_by_user_ref"),
             q.Select(
               "ref",
               q.Get(
                 q.Match(
                   q.Index("user_by_email"),
                   q.Casefold(session.user.email)
                 )
               )
             )
           ),
           q.Match(q.Index("subscription_by_status"), "active")
         )
       )
     );
          
        
       /* const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index("subscription_by_user_ref"),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index("user_by_email"),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(q.Index("subscription_by_status"), "active"),
            ])
          )
        );*/
console.log("userActiveSubscription if::", userActiveSubscription);
        console.log("Sesssion if::", session);
        
        return { ...session, activeSubscription: userActiveSubscription };
        //return session
      } catch (error) {
        console.log("Error na sessão::::", error);
        console.log("Entrou no else");
        return { ...session, activeSubscription: null };
      }
    },
  },
});
