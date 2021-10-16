import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import {verifyPassword} from "../../../lib/auth";
import {connectToDatabase} from "../../../lib/db";

export default NextAuth({
  session: {
    jwt: true,
  },

  providers: [
    Providers.Credentials({
      async authorize(credentials) {
        const client = await connectToDatabase();

        const usersCollection = client.db().collection("users");
        const user = await usersCollection.findOne({email: credentials.email});

        console.log("user", user);

        if (!user) {
          client.close();
          throw new Error("No user found");
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          client.close();
          throw Error("Could not log you in!");
        }
        client.close();
        return {email: user.email}; // if you return object, next knows that it is valid
      },
    }),
  ],
});
