'use client'

import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes";
import Auth from '@/app/auth/page'
import Link from 'next/link'


const Navbar = () => {

    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <nav className="flex justify-between items-center p-4 sticky bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <span className="font-bold text-2xl text-gray-900 dark:text-white">
                    <Link href="/">
                        ShareThoughts
                    </Link>
                </span>

                <div className="relative ml-8">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 4a7 7 0 017 7c0 1.65-.56 3.17-1.5 4.38l4.12 4.12a1 1 0 01-1.42 1.42l-4.12-4.12A7 7 0 1111 4z" />
                        </svg>
                    </span>

                    <Input
                        className="pl-10 pr-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full border border-gray-300 dark:border-gray-600 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Search..."
                    />
                </div>
            </div>


            <div className="flex items-center gap-3">
                {/* dark mode */}
                <Button variant="outline" size="icon" className="cursor-pointer" onClick={toggleTheme}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                <Auth />

            </div>
        </nav>

    )
}

export default Navbar   