import Link from "next/link"
import {
  AlignLeft,
  Bell,
  Boxes,
  CheckSquare,
  CircleDot,
  CircleUserRound,
  ClipboardCheck,
  ClipboardList,
  Database,
  FileCheck2,
  Info,
  Layers,
  Layers3,
  LayoutDashboard,
  ListFilter,
  ListOrdered,
  Megaphone,
  Menu,
  MessageSquare,
  PanelsTopLeft,
  PanelTop,
  Palette,
  Search,
  Signpost,
  SquareMousePointer,
  SunMoon,
  Table as TableIcon,
  TableProperties,
  Tag,
  TextCursorInput,
  ToggleRight,
  Type,
  User,
  Zap,
} from "lucide-react"

const FOUNDATIONS = [
  {
    title: "Color",
    description:
      "Brand, status, risk, and chart token families — calibrated for contrast in both light and dark mode.",
    icon: Palette,
  },
  {
    title: "Typography",
    description:
      "Geist, self-hosted, with a six-role scale: Display, Heading, Title, Body, Caption, Label.",
    icon: Type,
  },
  {
    title: "Motion",
    description:
      "Three duration tiers and four easing curves, with a deliberate enter/exit split for floating UI.",
    icon: Zap,
  },
  {
    title: "Elevation & layering",
    description:
      "Mode-aware shadow tiers and an explicit z-index scale — sticky, dropdown, popover, tooltip, dialog, toast.",
    icon: Layers3,
  },
]

const DEMOS = [
  {
    href: "/demo",
    title: "Status & Risk",
    description:
      "Badge and RiskIndicator — operational state vs. severity, distinguished by form, not color.",
    icon: Layers,
  },
  {
    href: "/demo/checkbox",
    title: "Checkbox",
    description: "Single, table row selection, and a tri-state bulk-select header.",
    icon: CheckSquare,
  },
  {
    href: "/demo/popover",
    title: "Popover",
    description: "Basic, action, and information popovers with full placement control.",
    icon: MessageSquare,
  },
  {
    href: "/demo/input",
    title: "Input",
    description: "Sizes, icon composition, validation states, and a password-toggle example.",
    icon: TextCursorInput,
  },
  {
    href: "/demo/label",
    title: "Label",
    description: "Required/disabled/read-only states and RadioGroup's aria-labelledby pattern.",
    icon: Tag,
  },
  {
    href: "/demo/textarea",
    title: "Textarea",
    description: "Status states, disabled vs. read-only resize behavior, and a mixed-form example.",
    icon: AlignLeft,
  },
  {
    href: "/demo/select",
    title: "Select",
    description: "Grouped CSI divisions, sizes, disabled vs. read-only, and validation states.",
    icon: ListFilter,
  },
  {
    href: "/demo/combobox",
    title: "Combobox",
    description: "Searchable vendor, manufacturer, user, project, and material pickers.",
    icon: Search,
  },
  {
    href: "/demo/radio-group",
    title: "Radio Group",
    description: "Vertical/horizontal layouts, group labeling, status states, and controlled selection.",
    icon: CircleDot,
  },
  {
    href: "/demo/switch",
    title: "Switch",
    description: "Off/on states, an interactive toggle, disabled, and the four status values.",
    icon: ToggleRight,
  },
  {
    href: "/demo/form",
    title: "Form",
    description: "A schema-validated PO creation form composing every field primitive in this system.",
    icon: ClipboardCheck,
  },
  {
    href: "/demo/alert",
    title: "Alert",
    description: "Page-level status messages — variants, dismissible behavior, and actions.",
    icon: Megaphone,
  },
  {
    href: "/demo/theme",
    title: "Theme",
    description: "Light, Dark, and System — persisted, no-flash, and live OS preference tracking.",
    icon: SunMoon,
  },
  {
    href: "/demo/avatar",
    title: "Avatar",
    description: "Image with graceful fallback, sizes, status dot, and square non-human entities.",
    icon: User,
  },
  {
    href: "/demo/account-menu",
    title: "Account Menu",
    description: "Identity, actions, organization context, and sign out — Avatar as the trigger.",
    icon: CircleUserRound,
  },
  {
    href: "/demo/dropdown-menu",
    title: "Dropdown Menu",
    description: "Items, checkboxes, radio groups, and nested submenus.",
    icon: Menu,
  },
  {
    href: "/demo/dialog",
    title: "Dialog",
    description: "Confirmations, destructive actions, and scrollable content.",
    icon: PanelTop,
  },
  {
    href: "/demo/toast",
    title: "Toast",
    description: "Stacked, dismissible notifications across four semantic variants.",
    icon: Bell,
  },
  {
    href: "/demo/tooltip",
    title: "Tooltip",
    description: "Hover and focus explanations for icons, badges, and risk indicators.",
    icon: Info,
  },
  {
    href: "/demo/table",
    title: "Table",
    description: "Sticky headers, density modes, and selection-aware rows.",
    icon: TableIcon,
  },
  {
    href: "/demo/data-table",
    title: "DataTable",
    description: "Sorting, search, bulk actions, and column visibility on top of TanStack Table.",
    icon: Database,
  },
  {
    href: "/demo/data-table-advanced",
    title: "DataTable Advanced",
    description: "Pagination, row actions, filters, sticky columns, and dual empty states.",
    icon: TableProperties,
  },
  {
    href: "/demo/app-shell",
    title: "App Shell",
    description: "The full Krane navigation shell — sidebar, header, switchers, and collapse.",
    icon: LayoutDashboard,
  },
  {
    href: "/demo/procurement-log",
    title: "Procurement Log",
    description: "A real composed page — Shell, DataTable Advanced, and Form, built from only what already exists.",
    icon: ClipboardList,
  },
  {
    href: "/demo/submittal-log",
    title: "Submittal Log",
    description: "The same process as Procurement Log, applied to submittal review — Shell, DataTable Advanced, Form.",
    icon: FileCheck2,
  },
  {
    href: "/demo/materials-inventory",
    title: "Materials Inventory",
    description: "The same process a fourth time, for stock tracking — derived risk levels, and new evidence for two previously-open gaps.",
    icon: Boxes,
  },
  {
    href: "/demo/button",
    title: "Button",
    description: "Six variants, eight sizes, asChild composition, and icon placement.",
    icon: SquareMousePointer,
  },
  {
    href: "/demo/tabs",
    title: "Tabs",
    description: "Underline indicator, disabled tabs, icon labels, and activation modes.",
    icon: PanelsTopLeft,
  },
  {
    href: "/demo/breadcrumb",
    title: "Breadcrumb",
    description: "Location-based trail with an automatically-derived current-page segment.",
    icon: Signpost,
  },
  {
    href: "/demo/stepper",
    title: "Stepper",
    description: "Interactive wizard and read-only tracker, sharing one step-indicator core.",
    icon: ListOrdered,
  },
]

export default function Home() {
  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path d="M12 3 2 19h20L12 3z" />
              </svg>
            </span>
            <span className="text-display text-foreground">Krane Design System</span>
          </div>
          <p className="max-w-2xl text-body text-muted-foreground">
            Enterprise design system for Krane products — tokens, primitives, and the
            application shell, built for dense, data-heavy procurement workflows.
          </p>
        </header>

        <section className="mt-14">
          <h2 className="text-title text-foreground">Foundations</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FOUNDATIONS.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-lg border border-border bg-card p-5">
                <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                <h3 className="mt-3 text-label text-foreground">{title}</h3>
                <p className="mt-1 text-caption text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-title text-foreground">Components &amp; demos</h2>
          <p className="mt-1 text-caption text-muted-foreground">
            Each demo is a living reference — built from the same primitives a real module
            would consume, not a static mockup.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEMOS.map(({ href, title, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-lg border border-border bg-card p-5 outline-none transition-colors hover:border-ring focus-visible:ring-3 focus-visible:ring-ring"
              >
                <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                <h3 className="mt-3 text-label text-foreground">{title}</h3>
                <p className="mt-1 text-caption text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
