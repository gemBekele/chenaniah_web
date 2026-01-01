import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ReadMoreTextProps {
  text: string | null
  limit?: number
  className?: string
}

export function ReadMoreText({ text, limit = 150, className }: ReadMoreTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text) return null

  if (text.length <= limit) {
    return <p className={cn("whitespace-pre-wrap", className)}>{text}</p>
  }

  return (
    <div className={className}>
      <p className="inline whitespace-pre-wrap">
        {isExpanded ? text : `${text.slice(0, limit).trim()}...`}
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="px-1 ml-1 h-auto font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 inline-flex items-center gap-0.5"
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
      >
        {isExpanded ? (
          <>
            See less <ChevronUp className="h-3 w-3" />
          </>
        ) : (
          <>
            See more <ChevronDown className="h-3 w-3" />
          </>
        )}
      </Button>
    </div>
  )
}
