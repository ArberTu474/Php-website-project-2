import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { enrollmentsApi } from "@/lib/enrollments"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Props {
  enrollmentId: string
  courseSlug: string
  existingRating?: number
  existingComment?: string
  onSuccess?: () => void
}

export default function ReviewForm({
  enrollmentId,
  existingRating = 0,
  existingComment = "",
  onSuccess,
}: Props) {
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(existingRating)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState(existingComment)

  const mutation = useMutation({
    mutationFn: () => enrollmentsApi.review(enrollmentId, { rating, comment }),
    onSuccess: () => {
      toast.success("Review submitted — thank you!")
      queryClient.invalidateQueries({ queryKey: ["enrollments"] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      onSuccess?.()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const display = hovered || rating

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      {/* Star rating */}
      <div>
        <Label style={{ display: "block", marginBottom: "var(--space-3)" }}>
          Your rating
        </Label>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`Rate ${star} out of 5`}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "2rem",
                lineHeight: 1,
                padding: "var(--space-1)",
                color: star <= display ? "#ca8a04" : "var(--color-border)",
                transition:
                  "color var(--transition-interactive), transform 120ms ease",
                transform: star <= display ? "scale(1.15)" : "scale(1)",
              }}
            >
              ★
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              marginTop: "var(--space-2)",
            }}
          >
            {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <Label
          htmlFor="review-comment"
          style={{ display: "block", marginBottom: "var(--space-2)" }}
        >
          Comment{" "}
          <span style={{ color: "var(--color-text-faint)", fontWeight: 400 }}>
            (optional)
          </span>
        </Label>
        <Textarea
          id="review-comment"
          placeholder="What did you think of the course?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={rating === 0 || mutation.isPending}
      >
        {mutation.isPending
          ? "Submitting…"
          : existingRating > 0
            ? "Update review"
            : "Submit review"}
      </Button>
    </div>
  )
}
