import { db } from "@/src/db/db";
import { sql } from "drizzle-orm";
import getCurrentUser from "@/src/actions/getCurrentUser";
import { MySqlRawQueryResult } from "drizzle-orm/mysql2";
import { NextRequest, NextResponse } from "next/server";
import { chatSchema } from "../../../../drizzle/schema/chat.schema";
import { userToChat } from "../../../../drizzle/schema/userToChat.join";


export async function POST(req: NextRequest) {
    const body = await req.json();
    const { userId, isGroup, members, name } = body;

    const currentUser = await getCurrentUser();

    try {
        if (!currentUser?.id || !currentUser?.email) {
            return NextResponse.json({ success: false, message: "Unauthorized request." }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID not provided." }, { status: 400 });
        }

        if (isGroup && (!members || !name)) {
            return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
        }

        if (isGroup) {
            // create new group chat
            // insert members into userToChat
        }

        const query_result: MySqlRawQueryResult = await db.execute(
            sql` 
                SELECT UC1.chat_id
                FROM ${userToChat} AS UC1
                JOIN ${userToChat} AS UC2 
                ON UC1.chat_id = UC2.chat_id
                WHERE UC1.user_id = ${userId}
                AND UC2.user_id = ${currentUser.id}
                AND UC1.user_id != UC2.user_id;
            `
        );

        const query_result_array: any[] = query_result; // to remove ts error
        const existing_chat = query_result_array[0][0]; // get the first array of the result, and get the first element of that array

        if (query_result_array[0].length === 0) {
            // create new chat 
            const newChat = await db.insert(chatSchema).values({ isGroupChat: false });

            const insertedChatId = newChat[0].insertId;

            [currentUser.id, userId].forEach(async (id) => {
                await db.insert(userToChat).values({
                    chatId: insertedChatId,
                    userId: id,
                })
            });

            return NextResponse.json({ success: true, message: "Chat created successfully.", chatId: insertedChatId }, { status: 201 });
        } else {
            return NextResponse.json({ success: true, message: "Chat already exists!", chatId: existing_chat.chat_id }, { status: 200 })
        }

    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: err.status || 500 });
    }
}