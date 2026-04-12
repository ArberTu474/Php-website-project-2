import type { Course } from "@/types"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Eye, FileText, Layers, SquarePen, Trash, Users } from "lucide-react"
import { Button } from "../ui/button"
import { Link } from "react-router-dom"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import { type UseMutationResult } from "@tanstack/react-query"

interface Props {
  course: Course
  deleteMutation: UseMutationResult<any, Error, string, unknown>
}

export default function TeacherCourseCard({ course, deleteMutation }: Props) {
  return (
    <Card className="p-4" key={course.course_id}>
      <CardContent className="flex h-full flex-col justify-between p-0">
        {/* Title and Description */}
        <div className="mb-4 flex h-full flex-col gap-1">
          <div className="flex flex-wrap items-start justify-between gap-1">
            <h3 className="line-clamp-2 overflow-hidden text-lg font-semibold text-card-foreground">
              {course.title}
            </h3>
            <Badge
              className="leading-none"
              variant={course.is_published ? "secondary" : "destructive"}
            >
              {course.is_published ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="line-clamp-2 max-w-prose text-muted-foreground">
            {course.description}
          </p>
        </div>

        <div className="flex items-end justify-between sm:items-center">
          {/* Course Information */}
          <div className="flex flex-col gap-2 text-sm leading-none text-muted-foreground sm:flex-row md:gap-4">
            <span className="flex items-center gap-1">
              <Layers size="18" />
              {/* @ts-ignore — extra fields from teacher query */}
              <p>{course.total_modules ?? 0} modules</p>
            </span>
            <span className="flex items-center gap-1">
              <FileText size="18" />
              {/* @ts-ignore */}
              <p>{course.total_lessons ?? 0} lessons</p>
            </span>
            <span className="flex items-center gap-1">
              <Users size="18" />
              {/* @ts-ignore */}
              <p>{course.total_students ?? 0} students</p>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" asChild>
              <Link to={`/courses/${course.slug}/edit`}>
                <SquarePen />
              </Link>
            </Button>
            <Button size="icon" variant="outline" asChild>
              <Link to={`/courses/${course.slug}`}>
                <Eye />
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="cursor-pointer"
                  size="icon"
                  variant="destructive"
                >
                  <Trash />
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete <span className="font-bold">{course.title}</span>?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the course and all its modules
                    and lessons. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate(course.course_id)}
                    className="text-destructive-foreground cursor-pointer bg-destructive hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending ? "Deleting…" : "Yes, delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
