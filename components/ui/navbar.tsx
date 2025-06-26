import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { MessageCircle, MapPin } from "lucide-react";

export default async function Navbar() {
  const { userId } = await auth();

  return (
    <nav className='bg-white shadow-sm border-b'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex'>
            <Link href='/' className='flex items-center'>
              <span className='text-xl font-bold text-indigo-600'>
                MoodSong
              </span>
            </Link>
          </div>

          <div className='flex items-center space-x-4'>
            {userId ? (
              <>
                <Link
                  href='/home'
                  className='text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium'>
                  Dashboard
                </Link>
                <Link
                  href='/mood'
                  className='text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium'>
                  Mood Tracker
                </Link>
                <Link
                  href='/chat'
                  className='text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium'>
                  AI Chat
                </Link>
                <Link
                  href='/community'
                  className='text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1'>
                  <MessageCircle className='w-4 h-4' />
                  Community
                </Link>
                <Link
                  href='/resources'
                  className='text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1'>
                  <MapPin className='w-4 h-4' />
                  Resources
                </Link>
                <UserButton afterSignOutUrl='/' />
              </>
            ) : (
              <>
                <Link
                  href='/sign-in'
                  className='text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium'>
                  Sign In
                </Link>
                <Link
                  href='/sign-up'
                  className='bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium'>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
