import type { Review } from "@/types"

interface Props {
  reviews: Review[]
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{ color: s <= rating ? "#ca8a04" : "var(--color-border)" }}
        >
          ★
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      {reviews.map((review) => (
        <div
          key={review.review_id}
          style={{
            padding: "var(--space-5)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-3)",
              flexWrap: "wrap",
              gap: "var(--space-2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {review.student_name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>
                  {review.student_name}
                </p>
                <StarDisplay rating={review.rating} />
              </div>
            </div>
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-faint)",
              }}
            >
              {new Date(review.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          {review.comment && (
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
              }}
            >
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
