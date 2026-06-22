"use client"

import { AccountMenu } from "@/components/shell/account-menu"

export default function AccountMenuDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Account Menu demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Composed entirely from already-shipped primitives — <code>Avatar</code> as the trigger,{" "}
        <code>DropdownMenu</code> for the menu itself. No workspace switching, no theme
        switching, no billing/team management — all explicitly out of scope.
      </p>

      <div className="flex max-w-2xl flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Default — click the avatar
          </h2>
          <div className="rounded-lg bg-sidebar p-6">
            <AccountMenu
              user={{ name: "Jordan Lee", email: "jordan.lee@brigadegroup.com", initials: "JL" }}
              organizationLabel="Brigade Group"
              onProfile={() => {}}
              onSettings={() => {}}
              onNotificationPreferences={() => {}}
              onSignOut={() => {}}
            />
          </div>
          <p className="mt-2 text-caption text-muted-foreground">
            Shown on the navy shell background it actually lives on — the trigger&apos;s hover
            and focus treatment is tuned for that surface, not a plain page background.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Image avatar, no fallback needed
          </h2>
          <div className="rounded-lg bg-sidebar p-6">
            <AccountMenu
              user={{
                name: "Alex Kim",
                email: "alex.kim@brigadegroup.com",
                avatarUrl: "https://i.pravatar.cc/64?img=33",
                initials: "AK",
              }}
              organizationLabel="Brigade Group"
              onSignOut={() => {}}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Long name/email — truncation
          </h2>
          <div className="rounded-lg bg-sidebar p-6">
            <AccountMenu
              user={{
                name: "Samira Patel-Worthington",
                email: "samira.patel-worthington@meridian-construction-group.com",
                initials: "SP",
              }}
              organizationLabel="Meridian Construction Group International"
              onSignOut={() => {}}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            No action handlers wired — only Sign out is required
          </h2>
          <div className="rounded-lg bg-sidebar p-6">
            <AccountMenu
              user={{ name: "Nora Tran", email: "nora.tran@brigadegroup.com", initials: "NT" }}
              organizationLabel="Brigade Group"
              onSignOut={() => {}}
            />
          </div>
          <p className="mt-2 text-caption text-muted-foreground">
            Profile, Settings, and Notification Preferences still render — the structure is
            fixed; only their handlers are optional.
          </p>
        </section>
      </div>
    </div>
  )
}
