"use client";

import { Search, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black text-white border-b border-neutral-800">
            <div className="max-w-full px-6 sm:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="text-mega-bold text-2xl tracking-wider">
                        JOB AGENT
                    </Link>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        <Link href="/#explore">
                            <Button
                                className="bg-white text-black hover:bg-yellow-300 text-base px-6 py-3 rounded-full font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                SEARCH JOBS
                            </Button>
                        </Link>
                        <Link href="/onboard">
                            <Button
                                className="bg-white text-black hover:bg-yellow-300 text-base px-6 py-3 rounded-full font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                UPLOAD YOUR CV
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
