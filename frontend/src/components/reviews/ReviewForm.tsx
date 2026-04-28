import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { enrollmentsApi } from "@/lib/enrollments"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"

interface Props {
  enrollmentId: string
  courseSlug: string
  existingRating?: number
  existingComment?: string
  onSuccess?: () => void
}

export default function ReviewForm({
  enrollmentId,
  courseSlug,
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
      queryClient.invalidateQueries({ queryKey: ["course", courseSlug] })
      onSuccess?.()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const display = hovered || rating

  return (
    <div className="flex flex-col gap-4">
      {/* Star rating */}
      <div className="space-y-1">
        <Label className="font-semibold">Your rating</Label>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`Rate ${star} out of 5`}
                className={`cursor-pointer border-0 bg-transparent leading-none transition-all duration-150 ${
                  star <= display
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-none text-border"
                } `}
              >
                <Star />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-base leading-none font-semibold text-yellow-400/80">
              {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
            </p>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-1">
        <Label htmlFor="review-comment" className="font-semibold">
          Comment (optional)
        </Label>
        <Textarea
          className="min-h-30"
          id="review-comment"
          placeholder="What did you think of the course?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={20}
        />
      </div>

      <Button
        size={"lg"}
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
