"use client"

import * as React from "react"
import { AlertTriangle, Check } from "lucide-react"

import { cn } from "@/lib/utils"

type StepState = "upcoming" | "current" | "completed" | "error"

type StepperContextValue = {
  currentStep: number
  onStepChange?: (index: number) => void
}

const StepperContext = React.createContext<StepperContextValue | null>(null)

interface StepperProps extends React.ComponentProps<"div"> {
  currentStep: number
  onStepChange?: (index: number) => void
}

function Stepper({ currentStep, onStepChange, children, className, ...props }: StepperProps) {
  const isFirstRender = React.useRef(true)
  const activeHeadingRef = React.useRef<HTMLHeadingElement>(null)

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    // The one hard accessibility requirement this component exists to satisfy
    // (STEPPER_FOUNDATION.md, sourced from W3C's multi-step-forms guidance):
    // advancing a step must move focus to the new step's content, the same way
    // a real page navigation would — never on initial mount, only on change.
    activeHeadingRef.current?.focus()
  }, [currentStep])

  // Step labels live on <StepperStep> inside <StepperList>, a sibling of the
  // <StepperContent> elements here — read once so each StepperContent can
  // render its own "Step X of Y: {label}" heading without the consumer having
  // to duplicate the label string in two places and risk the two drifting apart.
  const stepLabels: string[] = []
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === StepperList) {
      const listProps = child.props as { children?: React.ReactNode }
      React.Children.forEach(listProps.children, (stepChild) => {
        if (React.isValidElement(stepChild) && stepChild.type === StepperStep) {
          stepLabels.push((stepChild.props as StepperStepProps).label)
        }
      })
    }
  })
  const totalSteps = stepLabels.length

  let contentIndex = 0
  const processedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === StepperContent) {
      const index = contentIndex++
      return React.cloneElement(child as React.ReactElement<StepperContentProps>, {
        index,
        currentStep,
        label: stepLabels[index],
        totalSteps,
        headingRef: activeHeadingRef,
      })
    }
    return child
  })

  return (
    <StepperContext.Provider value={{ currentStep, onStepChange }}>
      <div data-slot="stepper" className={cn("flex flex-col gap-6", className)} {...props}>
        {processedChildren}
      </div>
    </StepperContext.Provider>
  )
}

interface StepperListProps extends React.ComponentProps<"ol"> {
  currentStep?: number
}

function StepperList({
  currentStep: currentStepProp,
  children,
  className,
  ...props
}: StepperListProps) {
  const context = React.useContext(StepperContext)
  const currentStep = context?.currentStep ?? currentStepProp ?? 0
  const onStepChange = context?.onStepChange

  const items = React.Children.toArray(children)

  return (
    <nav aria-label="Progress">
      <ol data-slot="stepper-list" className={cn("flex items-center", className)} {...props}>
        {items.map((child, index) => {
          if (!React.isValidElement(child)) return child
          const isLast = index === items.length - 1
          return (
            <React.Fragment key={index}>
              {React.cloneElement(child as React.ReactElement<StepperStepProps>, {
                index,
                currentStep,
                onStepChange,
                isLast,
              })}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

interface StepperStepProps {
  label: string
  optional?: boolean
  hasError?: boolean
  index?: number
  currentStep?: number
  onStepChange?: (index: number) => void
  isLast?: boolean
  className?: string
}

function StepperStep({
  label,
  optional,
  hasError,
  index = 0,
  currentStep = 0,
  onStepChange,
  isLast,
  className,
}: StepperStepProps) {
  const state: StepState = hasError
    ? "error"
    : index === currentStep
      ? "current"
      : index < currentStep
        ? "completed"
        : "upcoming"

  const clickable = Boolean(onStepChange) && index <= currentStep

  return (
    <li
      data-slot="stepper-step"
      data-state={state}
      className={cn("flex flex-1 items-center last:flex-none", className)}
    >
      <button
        type="button"
        disabled={!clickable}
        onClick={() => clickable && onStepChange?.(index)}
        aria-current={state === "current" ? "step" : undefined}
        className={cn(
          "flex items-center gap-2 rounded-md outline-none",
          "focus-visible:ring-3 focus-visible:ring-ring",
          clickable ? "cursor-pointer" : "cursor-default"
        )}
      >
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
            state === "completed" && "border-primary bg-primary text-primary-foreground",
            state === "current" && "border-primary text-primary",
            state === "upcoming" && "border-border text-muted-foreground",
            state === "error" && "border-destructive text-destructive"
          )}
        >
          {state === "completed" ? (
            <Check className="size-4" aria-hidden="true" />
          ) : state === "error" ? (
            <AlertTriangle className="size-4" aria-hidden="true" />
          ) : (
            index + 1
          )}
        </span>
        <span
          className={cn(
            "hidden text-sm font-medium sm:inline",
            state === "upcoming" ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {label}
          {optional && <span className="ml-1 text-muted-foreground">(optional)</span>}
          {state === "error" && <span className="sr-only"> (error)</span>}
        </span>
      </button>
      {!isLast && (
        <div
          aria-hidden="true"
          className={cn("mx-3 h-0.5 flex-1", state === "completed" ? "bg-primary" : "bg-border")}
        />
      )}
    </li>
  )
}

interface StepperContentProps extends React.ComponentProps<"div"> {
  index?: number
  currentStep?: number
  label?: string
  totalSteps?: number
  headingRef?: React.RefObject<HTMLHeadingElement | null>
}

function StepperContent({
  index = 0,
  currentStep = 0,
  label,
  totalSteps,
  headingRef,
  children,
  className,
  ...props
}: StepperContentProps) {
  const isActive = index === currentStep

  if (!isActive) return null

  return (
    <div data-slot="stepper-content" className={cn("flex flex-col gap-4", className)} {...props}>
      <h2 ref={headingRef} tabIndex={-1} className="text-heading text-foreground outline-none">
        <span className="block text-caption font-normal text-muted-foreground">
          Step {index + 1} of {totalSteps}
        </span>
        {label}
      </h2>
      {children}
    </div>
  )
}

export { Stepper, StepperList, StepperStep, StepperContent }
export type { StepState }
