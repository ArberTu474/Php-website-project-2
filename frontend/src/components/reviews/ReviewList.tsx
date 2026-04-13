import type { Review } from "@/types"
import { Calendar, Star } from "lucide-react"
import { Avatar, AvatarFallback } from "../ui/avatar"

interface Props {
  reviews: Review[]
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span
      className="flex items-center gap-1"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={s <= rating ? "text-yellow-400/80" : "text-border"}
        >
          <Star size="19" />
        </span>
      ))}
    </span>
  )
}

export default function ReviewList({ reviews }: Props) {
  if (reviews.length === 0)
    return (
      <p
        style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}
      >
        No reviews yet. Be the first!
      </p>
    )

  return (
    <div className="flex gap-4">
      {reviews.map((review) => (
        <div
          key={review.review_id}
          className="w-full space-y-2 rounded-lg border border-border p-4"
        >
          <div>
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <Avatar size="lg">
                <AvatarFallback>
                  {review.student_name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="w-full space-y-0.5">
                <div className="flex w-full items-center justify-between">
                  <p className="text-base font-bold">{review.student_name}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar size="18" />
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <StarDisplay rating={review.rating} />
              </div>
            </div>
          </div>

          {review.comment && (
            <p className="text-base text-muted-foreground">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}
