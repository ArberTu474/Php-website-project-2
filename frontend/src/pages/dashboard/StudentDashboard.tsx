import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { enrollmentsApi } from "@/lib/enrollments"
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import EnrollmentCard from "./EnrollmentCard"

export default function StudentDashboard() {
  const { user } = useAuthStore()

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["enrollments"],
    queryFn: enrollmentsApi.mine,
  })

  return (
    <div className="container mx-auto my-0 px-6 py-3">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-2 py-6">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.first_name}
          </h1>
          <p className="text-base text-muted-foreground">
            Continue where you left off
          </p>
        </div>
        <Button className="cursor-pointer" size={"lg"} asChild>
          <div className="flex items-center gap-2">
            <BookOpen />
            <Link to="/">Browse courses</Link>
          </div>
        </Button>
      </div>

      {/* Empty state */}
      {!isLoading && enrollments?.length === 0 && (
        <div className="mt-12 flex flex-col items-center text-muted-foreground">
          <GraduationCap size="64" className="stroke-muted-foreground" />
          <div className="my-4 flex flex-col items-center">
            <h3 className="text-xl">No courses yet</h3>
            <p>Enroll in a course to start learning.</p>
          </div>
        </div>
      )}

      {/* Enrollment cards */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Loading skeleton */}
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}

        {/* Enrolled courses */}
        {enrollments?.map((enrollment) => {
          const isComplete = enrollment.completed_at !== null

          return (
            <EnrollmentCard
              key={enrollment.enrollment_id}
              enrollment={enrollment}
              course={enrollment.course}
              isComplete={isComplete}
              progress={enrollment.progress}
            />
          )
        })}
      </div>
    </div>
  )
}
