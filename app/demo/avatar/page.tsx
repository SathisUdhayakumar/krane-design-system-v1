import { Bot, Building2, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AvatarDemoPage() {
  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Avatar demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Built on <code>@radix-ui/react-avatar</code> — image with graceful fallback, three
        sizes, an optional status dot reusing the existing success/warning/error/info
        vocabulary, and a square shape reserved for non-human entities.
      </p>

      <div className="flex max-w-2xl flex-col gap-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Image avatar</h2>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/64?img=12" alt="Jordan Lee's profile" />
              <AvatarFallback delayMs={300}>JL</AvatarFallback>
            </Avatar>
            <p className="text-caption text-muted-foreground">
              Loads successfully — no fallback shown.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Broken image → falls back to initials
          </h2>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://example.invalid/missing.jpg" alt="Alex Kim's profile" />
              <AvatarFallback delayMs={300}>AK</AvatarFallback>
            </Avatar>
            <p className="text-caption text-muted-foreground">
              The <code>src</code> 404s — <code>AvatarFallback</code> renders after Radix&apos;s
              load-status check, not instantly, so a fast-loading image never flashes initials
              first.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Initials avatar (no image at all)
          </h2>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>SP</AvatarFallback>
            </Avatar>
            <p className="text-caption text-muted-foreground">Sam Patel — no photo on file.</p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Icon avatar (unknown user)
          </h2>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>
                <User aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <p className="text-caption text-muted-foreground">No name on record at all.</p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Sizes</h2>
          <div className="flex items-center gap-4">
            <Avatar size="sm">
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
            <Avatar size="default">
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Status — approval chain on a PO
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1.5">
              <Avatar status="success" statusLabel="Approved">
                <AvatarFallback>JL</AvatarFallback>
              </Avatar>
              <span className="text-caption text-muted-foreground">Approved</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Avatar status="warning" statusLabel="Pending">
                <AvatarFallback>AK</AvatarFallback>
              </Avatar>
              <span className="text-caption text-muted-foreground">Pending</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Avatar status="error" statusLabel="Declined">
                <AvatarFallback>SP</AvatarFallback>
              </Avatar>
              <span className="text-caption text-muted-foreground">Declined</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Avatar status="info" statusLabel="Delegated">
                <AvatarFallback>NT</AvatarFallback>
              </Avatar>
              <span className="text-caption text-muted-foreground">Delegated</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Vendor logo — square, non-human entity
          </h2>
          <div className="flex items-center gap-4">
            <Avatar shape="square" size="lg">
              <AvatarFallback>
                <Building2 aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <p className="text-caption text-muted-foreground">
              Sterling Rebar Co. — no logo image on file, so the fallback is a building icon, not
              initials, to keep &quot;this is an organization, not a person&quot; legible at a
              glance.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            KAI Agent — square, non-human entity
          </h2>
          <div className="flex items-center gap-4">
            <Avatar shape="square" size="lg">
              <AvatarFallback>
                <Bot aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <p className="text-caption text-muted-foreground">
              The same square treatment as the vendor logo above — Primer&apos;s convention,
              circle for people, square for bots/agents/organizations.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
