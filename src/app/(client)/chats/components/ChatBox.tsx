"use client"

import axios from 'axios'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import { pusherClient } from '@/src/pusher/pusher'
import React, { useEffect, useState } from 'react'


// components
import Link from 'next/link'


// types
import { ChatType } from '@/drizzle/schema/chat.schema'
import { UserType } from '@/drizzle/schema/user.schema'

// prop types
interface ChatBoxProps {
    chat: ChatType,
    currentUser: UserType | null
}


const ChatBox: React.FC<ChatBoxProps> = ({ chat, currentUser }) => {
    const session = useSession();
    const email = session?.data?.user?.email;

    const [lastMessage, setLastMessage] = useState<any>(null);
    const [otherUser, setOtherUser] = useState<UserType | null>(null);

    useEffect(() => {
        async function getOtherUserOfChat() {
            const res = await axios.get(`/api/chats/other-user?chatId=${chat?.id}`);
            setOtherUser(res.data.user);
        }

        async function getLastMessageOfChat() {
            const res = await axios.get(`/api/chats/last-message?chatId=${chat?.id}`);
            setLastMessage(res.data.message);
        }

        getLastMessageOfChat()
        getOtherUserOfChat();
    }, [chat?.id])
    
    // for pusher subscription
    useEffect(() => {
        const chatUpdateHandler = (data: any) => {
            if (chat?.id === data?.newMessage?.chatId){
                setLastMessage(data.newMessage);
            }
        }

        if (email) {
            pusherClient.subscribe(email).bind("chat:update", chatUpdateHandler)
        }


        // clean up
        return () => {
            pusherClient.unsubscribe(email!)
            pusherClient.unbind("chat:update", chatUpdateHandler)
        }
    }, [email, chat?.id])

    const lastMessageText = () => {
        if (lastMessage?.text !== null && lastMessage?.image === null) {
            if (lastMessage?.senderId === currentUser?.id) {
                return `You: ${lastMessage.text.slice(0, 25)}` + '...';
            } else {
                return lastMessage.text.slice(0, 25) + '...';
            }
        } else if (lastMessage?.image !== null && lastMessage?.text === null) {
            if (lastMessage?.senderId === currentUser?.id) {
                return 'You sent a photo';
            } else {
                return 'Sent a photo';
            }
        } else {
            return 'No messages yet...';
        }
    }

    return (
        <div className='group duration-200 pr-[1rem] mb-[1rem] last-child:mb-0 last:mb-0'>
            <Link href={`/chats/${chat.id}`} className='flex'>
                <div 
                    className='
                        h-[4rem] w-[4rem] 
                        mr-[1rem] 
                        grid place-items-center 
                        border-[0.25rem] border-gray-100 
                        group-hover:border-gray-300 
                        relative 
                        rounded-full 
                        duration-150
                    '
                >
                    <span>{ }</span>
                    <span className='absolute h-[1.25rem] w-[1.25rem] right-[-0.2rem] bottom-[-0.2rem] border-[0.25rem] border-white rounded-full bg-[var(--main-green)]' />
                </div>

                <div className='flex flex-col justify-center flex-1'>
                    <div className='flex justify-between items-center'>
                        <div className='text-[1.25rem] font-bold capitalize'>{chat?.name || otherUser?.name}</div>
                    </div>

                    <div className='flex justify-between items-center'>
                        <p className='text-gray-400 text-[1.25rem]'>
                            {lastMessageText()}
                        </p>
                        <div className='text-gray-400 text-[1.25rem]'>
                            {
                                lastMessage?.createdAt && format(new Date(lastMessage.createdAt), 'h:mm a')
                            }
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default ChatBox;