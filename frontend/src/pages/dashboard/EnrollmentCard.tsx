import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Course, Enrollment, EnrollmentProgress } from "@/types"
import { Check, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

type EnrollmentCardProps = {
  enrollment: Enrollment
  course: Pick<
    Course,
    "course_id" | "title" | "slug" | "thumbnail_url" | "description"
  > & { teacher_name: string }
  isComplete: boolean
  progress: EnrollmentProgress
}

export default function EnrollmentCard({
  enrollment,
  course,
  isComplete,
  progress,
}: EnrollmentCardProps) {
  return (
    <Card key={enrollment.enrollment_id} className="gap-0 p-4">
      <CardContent className="p-0">
        {/* Left: course info + progress */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="line-clamp-3 overflow-hidden text-lg leading-snug font-semibold text-card-foreground">
              {course.title}
            </h3>
            {isComplete && (
              <Badge
                variant={"outline"}
                className="border-primary/20 bg-primary/10 text-primary"
                asChild
              >
                <div className="text-ok flex items-center justify-center gap-0.5">
                  <Check />
                  <p className="leading-none">Completed</p>
                </div>
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground">{course.teacher_name}</p>
        </div>
        {/* Progress bar */}
        <div className="my-4">
          <Progress value={progress.percent} className="h-1.5" />
          <span className="text-sm font-semibold">
            {progress.completed_lessons}/{progress.total_lessons} (
            {progress.percent}%)
          </span>
        </div>

        {/* Right: action buttons */}
        <div className="flex justify-end gap-2">
          {progress.can_review && isComplete && (
            <Button variant="outline" asChild>
              <Link to={`/courses/${course.slug}`}>Leave review</Link>
            </Button>
          )}
          <Button asChild>
            <Link to={`/learn/${course.slug}/${course.slug}`}>
              <div className="flex items-center gap-1">
                <span>Continue</span>
                <ChevronRight />
              </div>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
