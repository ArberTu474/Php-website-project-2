import { useQuery } from "@tanstack/react-query"
import { coursesApi } from "@/lib/courses"
import CourseCard from "@/components/courses/CourseCard"
import { Ghost, TriangleAlert } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function CoursesPage() {
  const {
    data: courses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: coursesApi.list,
  })

  return (
    <div className="container mx-auto my-0 px-6 py-3">
      {/* Header */}
      <div className="my-6">
        <h1 className="text-3xl font-bold">Explore Courses</h1>
        <p className="text-base text-muted-foreground">
          Learn something new today
        </p>
      </div>

      {/* Error */}
      {isError && (
        <div className="mt-12 flex flex-col items-center gap-2">
          <TriangleAlert
            size="64"
            className="fill-destructive/15 stroke-destructive"
          />
          <h3 className="text-xl text-destructive">Failed to load courses.</h3>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && courses?.length === 0 && (
        <div className="mt-12 flex flex-col items-center text-muted-foreground">
          <Ghost size="64" className="mb-2 stroke-muted-foreground" />
          <h3 className="text-xl">No courses yet</h3>
          <p>Check back soon — teachers are creating content.</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid w-full grid-cols-1 items-stretch gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton className="h-80" key={i} />
            ))
          : courses?.map((course) => (
              <CourseCard key={course.course_id} course={course} />
            ))}
      </div>
    </div>
  )
}
