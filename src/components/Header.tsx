"use client"

import { House } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Marquee from './Marquee';

const Header = () => {
    const router = useRouter();

    return (
        <header className="py-4 bg-[#0068A9] relative">
            <nav className="flex-col flex justify-center items-center gap-4 relative">
                <button
                    onClick={() => router.push("/results")}
                    className="cursor-pointer absolute top-1/2 left-8 flex -translate-y-1/2 bg-white rounded-full p-3"
                >
                    <House className='text-[#0068A9]' />
                </button>
                <div className="bg-white p-3 w-fit rounded">
                    <Image
                        src="https://www.vishalmegamart.com/on/demandware.static/Sites-vishalmegamart-Site/-/default/dw1ad1d6fd/images/logo.svg"
                        alt="Vishal Mega Mart"
                        width={180}
                        height={37}
                        style={{
                            height: 'auto',
                            width: 'auto',
                            maxWidth: '180px'
                        }}
                        priority
                    />
                </div>
                <h1 className='w-fit text-2xl text-white text-center px-4 justify-center'>
                    VMM Security Guard Entrance Exam Results 2025
                </h1>
            </nav>
            <div className="absolute w-full top-full overflow-hidden bg-yellow-300 rounded-lg">
                <Marquee
                    speed={40}
                    className="py-2"
                >
                    <span className="font-bold text-red-600 text-lg px-4">
                        🔥🔥 VMMSGEE RESULTS 2025 OUT NOW!! BEST OF LUCK!!! 🎉🎊
                    </span>
                </Marquee>
            </div>
        </header>
    );
};

export default Header;