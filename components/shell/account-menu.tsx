"use client"

import * as React from "react"
import { Bell, LogOut, Settings, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface AccountMenuUser {
  name: string
  email: string
  avatarUrl?: string
  initials: string
}

interface AccountMenuProps {
  user: AccountMenuUser
  organizationLabel: string
  onProfile?: () => void
  onSettings?: () => void
  onNotificationPreferences?: () => void
  onSignOut: () => void
}

function AccountMenu({
  user,
  organizationLabel,
  onProfile,
  onSettings,
  onNotificationPreferences,
  onSignOut,
}: AccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="account-menu-trigger"
        aria-label={`Account menu for ${user.name}`}
        className="rounded-full p-0.5 outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-sidebar-ring"
      >
        <Avatar>
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={`${user.name}'s profile`} />}
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="truncate text-sm font-medium text-foreground">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onProfile}>
            <User />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onSettings}>
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onNotificationPreferences}>
            <Bell />
            Notification Preferences
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal">
          Signed in as <span className="font-medium text-foreground">{organizationLabel}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onSignOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { AccountMenu }
