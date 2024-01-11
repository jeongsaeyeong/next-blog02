import { connectDB } from "@/utils/database";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

import NextAuth from "next-auth/next";
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcrypt'

export const authOptions = {
    providers: [
        GithubProvider({
            clientId: '3ed0f2a6dee6f9e88a9a',
            clientSecret: '874e581c6c8d647d67c79d0c7ad1d80a871d237b',
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "email", type: "text" },
                password: { label: "password", type: "password" }
            },

            // 로그인 요청 시 실행되는 코드, DB에서 아이디, 비밀번호를 비교 
            async authorize(credentials) {
                let db = (await connectDB).db('forum');
                let user = await db.collection('user_local').findOne({ email: credentials.email })
                if (!user) {
                    console.log('해당 이메일은 없음');
                    return null
                }
                const pwcheck = await bcrypt.compare(credentials.password, user.password);
                if (!pwcheck) {
                    console.log('비번틀림');
                    return null
                }
                return user
            }

        })
    ],

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60 //30일
    },

    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.user = {};
                token.user.name = user.name
                token.user.email = user.email
            }
            return token;
        },
        session: async ({ session, token }) => {
            session.user = token.user;
            return session;
        },
    },

    secret: 'jeong0516',
    adapter: MongoDBAdapter(connectDB)
}

export default NextAuth(authOptions)