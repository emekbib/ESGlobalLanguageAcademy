'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, Settings, UserRound } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ProfileMenuProps = {
  fullName: string;
  avatarUrl: string | null;
};

export default function ProfileMenu({ fullName, avatarUrl }: ProfileMenuProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [signingOut, setSigningOut] = useState(false);
  const initial = fullName.trim().charAt(0).toUpperCase() || 'U';

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace('/auth');
    router.refresh();
  }

  return (
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
        <DropdownMenuItem onSelect={() => router.push('/dashboard')}>
          <UserRound className="mr-2 h-4 w-4" />
          My dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={signingOut} onSelect={() => void signOut()} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
