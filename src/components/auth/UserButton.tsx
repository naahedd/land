"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export function UserButton() {
  const { data: session, status } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()
  
  if (status === "loading") {
    return (
      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
    )
  }

  if (!session) {
    return (
      <>
      <button

        onClick={() => router.push("/auth/signin")}
        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Sign in
      </button>

      <button
        onClick={() => router.push("/auth/signup")}
        className="bg-white text-black px-4 py-2 rounded-lg border border-gray-300 transition-colors"
      >
        Sign up
      </button>

      </>
      
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
      >
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full"
          />
        )}
        <span className="text-sm font-medium text-gray-700">
          {session.user?.name || session.user?.email}
        </span>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-sm text-gray-500 border-b">
            {session.user?.email}
          </div>
          <button
            onClick={() => {
              setIsDropdownOpen(false)
              // Navigate to profile page when created
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Profile
          </button>
          <a
            href="/dashboard"
            onClick={() => setIsDropdownOpen(false)}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </a>
          <hr className="my-1" />
          <button
            onClick={() => {
              setIsDropdownOpen(false)
              signOut()
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
