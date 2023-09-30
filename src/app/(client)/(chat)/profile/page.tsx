// import hooks
import getCurrentUser from "@/actions/getCurrentUser"

// import components
import Image from "next/image";
import { Button } from "@/components/ui/button";

// import assets
import userPic from '@/assets/images/user.jpg'

const Profile = async () => {

    const currentUser = await getCurrentUser();

    return (
        <section className='max-h-[100vh] w-full p-[1rem] flex flex-col overflow-hidden'>
            <div className='flex items-center text-[2rem]'>Profile</div>

            <hr className='my-[1rem]' />

            <div className="flex flex-col items-center">

                <div className="mb-[1rem] text-[1.5rem] flex flex-col items-center gap-[1.5rem]">    
                    <Image
                        src={userPic}
                        width={150}
                        height={150}
                        alt="Picture of the current user"
                        className="rounded-full"
                    />

                    <p>{currentUser?.name}</p>
                </div>

                <div className="text-[1.5rem] flex items-center gap-[1.5rem]">
                    <i className="fa-regular fa-envelope"></i>
                    <span className="text-[1.25rem]">{currentUser?.email}</span>
                </div>

                <Button variant="secondary" className="mt-[1.5rem] p-[2rem] text-[1.25rem] rounded-full">Edit Profile</Button>
            </div>

        </section>
    )
}

export default Profile