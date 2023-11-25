import { db } from "@/src/db/db";
import { eq } from "drizzle-orm";
import { pusherServer } from "@/src/pusher/pusher";
import { NextRequest, NextResponse } from "next/server";

// import schema
import { chatSchema } from "@/drizzle/schema/chat.schema";
import { userSchema } from "@/drizzle/schema/user.schema";
import { userToChat } from "@/drizzle/schema/userToChat.join";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {

    try {
        const chatId = parseInt(params.id);

        // get chat with members
        type MemberType = { email: string }[];
        const members: MemberType = await db.select({ email: userSchema.email }).from(userSchema).innerJoin(userToChat, eq(userToChat.userId, userSchema.id)).where(eq(userToChat.chatId, chatId));

        // delete from userToChat
        await db.delete(userToChat).where(eq(userToChat.chatId, chatId));

        // delete chat
        await db.delete(chatSchema).where(eq(chatSchema.id, chatId));

        // for pusher
        members.forEach((member: { email: string }) => {
            pusherServer.trigger(member.email, 'chat:delete', { chatId });
        });

        return NextResponse.json({ success: true, message: "Chat deleted successfully" }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 })
    }
}