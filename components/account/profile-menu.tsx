'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, Settings, UserRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LogoutModal from '@/components/dashboard/logout-modal';

type ProfileMenuProps = {
  fullName: string;
  avatarUrl: string | null;
  role?: string | null;
};

export default function ProfileMenu({ fullName, avatarUrl, role }: ProfileMenuProps) {
  const router = useRouter();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="relative z-10 flex h-10 shrink-0 items-center gap-2 rounded-xl border bg-background px-3 text-foreground transition hover:border-primary/40 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label={`Open ${fullName}'s profile menu`}
            title="Open profile menu"
          >
            <Menu className="h-5 w-5" />
            <span className="text-sm font-semibold">Menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="truncate">{fullName}</p>
            <p className="mt-1 font-normal text-muted-foreground">Your account</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push('/account')}>
            <Settings className="mr-2 h-4 w-4" />
            Profile and settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push(role === 'teacher' ? '/teacher/dashboard' : role === 'admin' ? '/admin' : '/dashboard')}>
            <UserRound className="mr-2 h-4 w-4" />
            My dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              setLogoutModalOpen(true);
            }}
            className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </>
  );
}
