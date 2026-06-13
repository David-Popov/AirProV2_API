import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { setTheme } = useTheme()

  const toggleTheme = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      const isDark = document.documentElement.classList.contains("dark")
      const nextTheme = isDark ? "light" : "dark"

      if (
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setTheme(nextTheme)
        return
      }

      const x = e.clientX
      const y = e.clientY
      const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y),
      )

      const transition = document.startViewTransition(() => {
        setTheme(nextTheme)
      })

      await transition.ready
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      )
    },
    [setTheme],
  )

  return (
    <Button variant="outline" size="icon-lg" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 ease-in-out dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 ease-in-out dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

declare global {
  interface Document {
    startViewTransition(callback: () => void): {
      ready: Promise<void>
      finished: Promise<void>
      updateCallbackDone: Promise<void>
    }
  }
}
