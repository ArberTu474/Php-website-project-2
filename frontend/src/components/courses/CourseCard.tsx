import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Course } from "@/types"
import { BookMarked, BookOpen, Star } from "lucide-react"

interface Props {
  course: Course
}

export default function CourseCard({ course }: Props) {
  return (
    <Link to={`/courses/${course.slug}`}>
      <Card className="flex h-full cursor-pointer flex-col gap-0 overflow-hidden bg-card p-0 shadow-sm hover:shadow-md">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-secondary">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookMarked className="size-16 stroke-muted-foreground" />
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Category */}
          {course.category && (
            <Badge variant="outline">{course.category}</Badge>
          )}

          <div className="my-2">
            {/* Title */}
            <h3 className="line-clamp-3 overflow-hidden text-lg font-semibold text-card-foreground">
              {course.title}
            </h3>

            {/* Teacher */}
            <p>{course.teacher_name}</p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-sm leading-none font-semibold text-muted-foreground">
              <BookOpen className="size-4 stroke-muted-foreground" />
              {course.total_lessons} lessons
            </span>
            {course.avg_rating && (
              <span className="flex items-center gap-0.5 text-sm leading-none font-semibold text-yellow-400">
                <Star className="size-4 fill-yellow-400 stroke-0" />{" "}
                {course.avg_rating}
                <span>({course.total_reviews})</span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
