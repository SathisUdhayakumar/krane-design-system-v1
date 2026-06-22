"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const VENDORS: ComboboxOption[] = [
  { value: "sterling-rebar", label: "Sterling Rebar Co." },
  { value: "granite-supply", label: "Granite Supply Ltd." },
  { value: "apex-electrical", label: "Apex Electrical" },
  { value: "coastal-concrete", label: "Coastal Concrete" },
  { value: "vantage-glazing", label: "Vantage Glazing" },
  { value: "northwind-timber", label: "Northwind Timber" },
]

const CSI_DIVISIONS = [
  { value: "03", label: "03 — Concrete" },
  { value: "04", label: "04 — Masonry" },
  { value: "07", label: "07 — Thermal & Moisture Protection" },
  { value: "23", label: "23 — HVAC" },
  { value: "26", label: "26 — Electrical" },
]

const poFormSchema = z
  .object({
    vendorId: z.string().min(1, "Vendor is required"),
    csiDivision: z.string().min(1, "CSI division is required"),
    amount: z
      .number({ message: "Amount must be a number" })
      .positive("Amount must be greater than zero"),
    notes: z.string().max(280, "Notes must be 280 characters or fewer.").optional(),
    autoApprove: z.boolean(),
    paymentTerms: z.enum(["net30", "net60"]),
    routing: z.enum(["auto", "manual", "escalate"]),
  })
  .refine((data) => data.paymentTerms !== "net60" || data.routing !== "auto", {
    message: "Net 60 payment terms require Manual review or Escalate, not Auto-approve.",
    path: ["routing"],
  })

type PoFormValues = z.infer<typeof poFormSchema>

export default function FormDemoPage() {
  const [submitted, setSubmitted] = React.useState<PoFormValues | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const form = useForm<PoFormValues>({
    resolver: zodResolver(poFormSchema),
    defaultValues: {
      vendorId: "",
      csiDivision: "",
      amount: 0,
      notes: "",
      autoApprove: false,
      paymentTerms: "net30",
      routing: "manual",
    },
  })

  async function onSubmit(values: PoFormValues) {
    setSubmitting(true)
    setSubmitted(null)
    // Simulated async server-side business-rule check — not a real network call.
    // Mirrors the same setTimeout-driven convention already used in the Input and
    // Combobox demos' own "loading" examples.
    await new Promise((resolve) => setTimeout(resolve, 900))

    if (values.vendorId === "sterling-rebar" && values.amount > 50000) {
      form.setError("amount", {
        type: "manual",
        message: "This exceeds Sterling Rebar Co.'s approved credit limit of $50,000.",
      })
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setSubmitted(values)
  }

  return (
    <div className="min-h-full bg-background p-8 text-foreground">
      <h1 className="mb-1 text-xl font-semibold">Krane Design System — Form demo</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        A purchase-order creation form composing every field primitive in this system through{" "}
        <code>Form</code>/<code>FormField</code>/<code>FormItem</code>/<code>FormLabel</code>/
        <code>FormControl</code>/<code>FormDescription</code>/<code>FormMessage</code>, validated
        by <code>zod</code> via <code>react-hook-form</code>.
      </p>

      <div className="max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Vendor</FormLabel>
                  <FormControl>
                    <Combobox
                      value={field.value}
                      onValueChange={field.onChange}
                      options={VENDORS}
                      placeholder="Select a vendor"
                      searchPlaceholder="Search vendors…"
                      emptyMessage="No vendors found."
                      status={form.formState.errors.vendorId ? "error" : "default"}
                    />
                  </FormControl>
                  <FormDescription>Search by vendor name or code.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="csiDivision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>CSI division</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} required>
                    <FormControl>
                      <SelectTrigger
                        status={form.formState.errors.csiDivision ? "error" : "default"}
                      >
                        <SelectValue placeholder="Select a division" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CSI_DIVISIONS.map((division) => (
                        <SelectItem key={division.value} value={division.value}>
                          {division.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                      status={form.formState.errors.amount ? "error" : "default"}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={Number.isNaN(field.value) ? "" : field.value}
                      onChange={(event) => field.onChange(event.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the total PO amount in USD. Try a vendor of{" "}
                    <strong>Sterling Rebar Co.</strong> with an amount over{" "}
                    <strong>50000</strong> to see a simulated server-side rejection — note the
                    description above and the error below are both referenced by{" "}
                    <code>aria-describedby</code> at once.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional instructions…"
                      status={form.formState.errors.notes ? "error" : "default"}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional — visible to the approver.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoApprove"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Auto-approve if under budget</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment terms</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      orientation="horizontal"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="net30" id="payment-terms-net30" />
                        <Label htmlFor="payment-terms-net30">Net 30</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="net60" id="payment-terms-net60" />
                        <Label htmlFor="payment-terms-net60">Net 60</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="routing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approval routing</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      status={form.formState.errors.routing ? "error" : "default"}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="auto" id="routing-auto" />
                        <Label htmlFor="routing-auto">Auto-approve</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="manual" id="routing-manual" />
                        <Label htmlFor="routing-manual">Manual review</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="escalate" id="routing-escalate" />
                        <Label htmlFor="routing-escalate">Escalate</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Net 60 payment terms require Manual review or Escalate — try Net 60 above with
                    Auto-approve here to see the cross-field rule fire on this field.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={submitting} className="self-start">
              {submitting ? "Submitting…" : "Submit PO"}
            </Button>

            {submitted && (
              <div className="rounded-lg border border-success/50 bg-background p-4">
                <p className="text-label text-success-text">Submitted successfully</p>
                <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
                  {JSON.stringify(submitted, null, 2)}
                </pre>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}
