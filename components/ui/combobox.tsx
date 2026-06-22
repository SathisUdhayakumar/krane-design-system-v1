"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { type VariantProps } from "class-variance-authority"
import { Check, ChevronDown, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { selectTriggerVariants } from "@/components/ui/select"

type ComboboxOption = {
  value: string
  label: string
  keywords?: string[]
  group?: string
  disabled?: boolean
}

type ComboboxProps = VariantProps<typeof selectTriggerVariants> & {
  id?: string
  className?: string
  value?: string
  onValueChange?: (value: string | undefined) => void
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  readOnly?: boolean
  loading?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  "aria-labelledby"?: string
}

function ComboboxItemRow({
  option,
  selected,
  onSelect,
}: {
  option: ComboboxOption
  selected: boolean
  onSelect: (value: string) => void
}) {
  return (
    <CommandPrimitive.Item
      value={option.value}
      keywords={option.keywords}
      disabled={option.disabled}
      onSelect={onSelect}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-none select-none",
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
      )}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        {selected && <Check className="size-4" />}
      </span>
      {option.label}
    </CommandPrimitive.Item>
  )
}

function Combobox({
  id,
  className,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  searchPlaceholder = "Search…",
  emptyMessage = "No results found.",
  disabled = false,
  readOnly = false,
  loading = false,
  open: openProp,
  onOpenChange,
  size,
  status = "default",
  "aria-invalid": ariaInvalidProp,
  "aria-describedby": ariaDescribedby,
  "aria-labelledby": ariaLabelledby,
}: ComboboxProps) {
  const ariaInvalid = ariaInvalidProp ?? (status === "error" ? true : undefined)
  const [openState, setOpenState] = React.useState(false)
  const open = openProp ?? openState
  const isInteractive = !disabled && !readOnly

  function setOpen(next: boolean) {
    setOpenState(next)
    onOpenChange?.(next)
  }

  const selected = options.find((option) => option.value === value)

  const { ungrouped, groups } = React.useMemo(() => {
    const groupMap = new Map<string, ComboboxOption[]>()
    const ungroupedList: ComboboxOption[] = []
    for (const option of options) {
      if (option.group) {
        const list = groupMap.get(option.group) ?? []
        list.push(option)
        groupMap.set(option.group, list)
      } else {
        ungroupedList.push(option)
      }
    }
    return { ungrouped: ungroupedList, groups: Array.from(groupMap.entries()) }
  }, [options])

  function handleSelect(optionValue: string) {
    onValueChange?.(optionValue === value ? undefined : optionValue)
    setOpen(false)
  }

  return (
    <Popover open={isInteractive ? open : false} onOpenChange={isInteractive ? setOpen : undefined}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled || readOnly}
          data-readonly={readOnly || undefined}
          data-invalid={ariaInvalid || undefined}
          aria-describedby={ariaDescribedby}
          aria-labelledby={ariaLabelledby}
          aria-haspopup="listbox"
          className={cn(
            selectTriggerVariants({ size, status }),
            readOnly
              ? "cursor-default bg-muted"
              : "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.label : placeholder}
          </span>
          {/* A `div`, not a `span` — `selectTriggerVariants` truncates direct-child spans (the
              value text above); this icon group must not inherit that. */}
          <div className="flex shrink-0 items-center gap-1">
            {selected && isInteractive && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Clear selection"
                onClick={(event) => {
                  event.stopPropagation()
                  onValueChange?.(undefined)
                }}
                className="rounded-sm text-muted-foreground outline-none transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
              </span>
            )}
            {!readOnly && (
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            )}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <CommandPrimitive label={placeholder} loop shouldFilter={!loading}>
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <CommandPrimitive.Input
              placeholder={searchPlaceholder}
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <CommandPrimitive.List className="max-h-64 overflow-y-auto overflow-x-hidden p-1">
            {loading ? (
              <CommandPrimitive.Loading label={`Loading ${placeholder.toLowerCase()}`}>
                <div className="flex flex-col gap-1 p-1">
                  <Skeleton className="h-8 w-full rounded-md" />
                  <Skeleton className="h-8 w-full rounded-md" />
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              </CommandPrimitive.Loading>
            ) : (
              <>
                <CommandPrimitive.Empty className="py-6 text-center text-caption text-muted-foreground">
                  {emptyMessage}
                </CommandPrimitive.Empty>
                {ungrouped.map((option) => (
                  <ComboboxItemRow
                    key={option.value}
                    option={option}
                    selected={option.value === value}
                    onSelect={handleSelect}
                  />
                ))}
                {groups.map(([groupName, groupOptions]) => (
                  <CommandPrimitive.Group
                    key={groupName}
                    heading={groupName}
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {groupOptions.map((option) => (
                      <ComboboxItemRow
                        key={option.value}
                        option={option}
                        selected={option.value === value}
                        onSelect={handleSelect}
                      />
                    ))}
                  </CommandPrimitive.Group>
                ))}
              </>
            )}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox }
export type { ComboboxOption }
