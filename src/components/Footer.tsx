import { Facebook, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white pt-12">
            <div className="max-w-[1200px] mx-auto px-4 pb-12">
                <div className="flex flex-col items-center">

                    {/* Brand Section - Centered on mobile */}
                    <div className="flex flex-col items-center text-center gap-4 mb-10 lg:mb-0 lg:w-full lg:grid lg:grid-cols-4 lg:text-left lg:items-start">

                        <div className="flex flex-col items-center lg:items-start gap-3">
                            <Link href="/" className="flex items-center gap-3 justify-center lg:justify-start">
                                <Image
                                    src="/Logo-joye.png"
                                    alt="Logo"
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 lg:w-16 lg:h-16 object-contain"
                                    priority
                                />
                            </Link>
                            <div className="text-[15px] md:text-[13px] text-[#bea55b] font-medium max-w-[280px] lg:max-w-[200px] leading-relaxed">
                                Kalala Bondor Bauphal Patuakhali
                            </div>
                            <div className="text-[16px] md:text-[15px] font-bold text-black">
                                +8809638365975
                            </div>
                        </div>

                        {/* Middle sections - 2 columns on mobile, direct children on PC */}
                        <div className="grid grid-cols-2 w-full mt-10 lg:mt-0 gap-8 lg:gap-0 lg:contents">

                            {/* Useful Links */}
                            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 lg:pl-10">
                                <h3 className="text-[14px] md:text-[14px] font-bold text-[#bea55b] uppercase tracking-wide">Useful Link</h3>
                                <ul className="flex flex-col gap-3 text-[13px] text-gray-700 font-medium">
                                    <li className="hover:text-[#f15922] cursor-pointer transition-colors">Contact Us</li>
                                    <li className="hover:text-[#f15922] cursor-pointer transition-colors">Order Procedure</li>
                                    <li className="hover:text-[#f15922] cursor-pointer transition-colors">Delivery Rules</li>
                                    <li className="hover:text-[#f15922] cursor-pointer transition-colors">Return Policy</li>
                                </ul>
                            </div>

                            {/* Links */}
                            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 lg:pl-4">
                                <h3 className="text-[14px] md:text-[14px] font-bold text-[#bea55b] uppercase tracking-wide">Link</h3>
                                <ul className="flex flex-col gap-3 text-[13px] text-gray-700 font-medium">
                                    <li className="hover:text-[#f15922] cursor-pointer transition-colors">Terms & Conditions</li>
                                    <li className="hover:text-[#f15922] cursor-pointer transition-colors">Privacy Policy</li>
                                    <li className="hover:text-[#f15922] cursor-pointer transition-colors">Expected Time</li>
                                    <li className="hover:text-[#f15922] cursor-pointer transition-colors">Refunds Policy</li>
                                </ul>
                            </div>

                        </div>

                        {/* Social & App - Centered on mobile */}
                        <div className="flex flex-col items-center lg:items-start gap-4 mt-12 lg:mt-0">
                            <h3 className="text-[14px] font-bold text-[#bea55b] uppercase tracking-wide">Stay Connected</h3>
                            <div className="flex items-center gap-6 md:gap-4 text-black">
                                <Facebook size={24} className="hover:text-[#f15922] cursor-pointer sm:size-[20px]" />
                                {/* Google G icon mock */}
                                <span className="text-[22px] md:text-[18px] font-black hover:text-[#f15922] cursor-pointer">G</span>
                                <Youtube size={26} className="hover:text-[#f15922] cursor-pointer sm:size-[22px]" />
                            </div>

                            <div className="mt-4 lg:mt-2 flex flex-col items-center lg:items-start gap-4 lg:gap-2">
                                <h3 className="text-[14px] font-bold text-black uppercase tracking-wide font-bold">DOWNLOAD APP</h3>
                                <div className="bg-black text-white px-2 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer border border-gray-700 hover:scale-105 transition-transform w-[180px] lg:w-[160px] h-[55px] lg:h-auto">
                                    <Image
                                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                        alt="Get it on Google Play"
                                        width={160}
                                        height={45}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-black py-4 border-t border-gray-800">
                <div className="max-w-[1200px] mx-auto px-4 flex flex-col items-center text-center gap-1 text-[11px] md:text-[12px] text-gray-400">
                    <span>Copyright © 2026 Khaled.shop. All rights reserved. Design & Developed By <span className="text-[#bea55b] hover:underline cursor-pointer">khaleditsolution</span></span>
                </div>
            </div>
        </footer>
    );
}

