import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "sonner"
import {
  Check,
  ChevronRight,
  Clock,
  FileText,
  PackageOpen,
  Star,
  TriangleAlert,
  User,
} from "lucide-react"

import { coursesApi } from "lib/courses"
import { enrollmentsApi } from "lib/enrollments"
import { useAuthStore } from "store/authStore"

import Button from "components/ui/button"
import Badge from "components/ui/badge"
import Skeleton from "components/ui/skeleton"
import ReviewForm from "components/reviews/ReviewForm"
import ReviewList from "components/reviews/ReviewList"

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => coursesApi.getBySlug(slug!),
    enabled: !!slug,
  })

  const { data: myEnrollments } = useQuery({
    queryKey: ["enrollments"],
    queryFn: enrollmentsApi.mine,
    enabled: isAuthenticated && user?.role === "student",
  })

  const isEnrolled =
    myEnrollments?.some((e) => e.course.courseid === course?.courseid) ?? false

  const enrollment = myEnrollments?.find(
    (e) => e.course.courseid === course?.courseid
  )

  const existingReview = course?.reviews?.find(
    (r) => r.studentid === user?.userid
  )

  const canReview =
    isAuthenticated &&
    user?.role === "student" &&
    isEnrolled &&
    !!enrollment?.progress.canreview

  const enrollMutation = useMutation({
    mutationFn: () => enrollmentsApi.enroll(course!.courseid),
    onSuccess: () => {
      toast.success("Enrolled successfully! Head to your dashboard to start learning.")
      queryClient.invalidateQueries({ queryKey: ["enrollments"] })
      navigate("/dashboard")
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  function handleEnroll() {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    enrollMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="mt-12 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-42" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !course) {
    return (
      <div className="page-container">
        <div className="state-box">
          <TriangleAlert size={64} className="icon-danger" />
          <h3 className="text-xl text-destructive">Course not found</h3>
        </div>
      </div>
    )
  }

  const totalLessons =
    course.modules?.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0
  const totalModules = course.modules?.length ?? 0

  function renderEnrollButton() {
    if (user?.role === "teacher") return null

    if (isEnrolled) {
      return (
        <Button size="lg" variant="secondary" disabled className="min-w-45 cursor-default">
          <Check />
          Already enrolled
        </Button>
      )
    }

    return (
      <Button
        size="lg"
        onClick={handleEnroll}
        disabled={enrollMutation.isPending}
        className="min-w-45"
      >
        {enrollMutation.isPending
          ? "Enrolling..."
          : isAuthenticated
          ? "Enroll for free"
          : "Sign up to enroll"}
      </Button>
    )
  }

  return (
    <div className="page-container">
      <section className="course-hero">
        {course.category ? <Badge variant="secondary">{course.category}</Badge> : null}

        <h1 className="course-hero-title">{course.title}</h1>

        <p className="course-hero-description">{course.description}</p>

        <div className="course-hero-meta">
          <div className="course-hero-meta-list">
            <span className="course-meta-item">
              <User size={18} />
              <p>{course.teachername}</p>
            </span>

            <span className="course-meta-item">
              <FileText size={18} />
              <p>{totalModules} modules</p>
            </span>

            <span className="course-meta-item">
              <FileText size={18} />
              <p>{totalLessons} lessons</p>
            </span>

            {course.avgrating ? (
              <span className="course-meta-rating">
                <Star className="size-4 fill-yellow-400/80 stroke-0" />
                {course.avgrating}
                <span>{course.totalreviews}</span>
              </span>
            ) : null}
          </div>

          {renderEnrollButton()}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading-row">
          <h2 className="section-heading">Course curriculum</h2>
        </div>

        {course.modules?.length === 0 ? (
          <div className="state-box state-box-compact">
            <PackageOpen size={64} className="icon-muted" />
            <p className="text-center">No content yet.</p>
          </div>
        ) : (
          <div className="course-curriculum-list">
            {course.modules?.map((module) => (
              <div key={module.moduleid} className="curriculum-module-card">
                <div className="curriculum-module-header">
                  <h3 className="curriculum-module-title">{module.title}</h3>
                  {module.description ? (
                    <p className="curriculum-module-description">
                      {module.description}
                    </p>
                  ) : null}
                </div>

                <div className="curriculum-lesson-list">
                  {module.lessons.map((lesson, idx) => (
                    <div key={lesson.lessonid} className="curriculum-lesson-row">
                      <span className="curriculum-lesson-chevron">
                        <ChevronRight size={16} />
                      </span>

                      <span className="curriculum-lesson-title">
                        <span className="font-semibold">{idx + 1}</span>. {lesson.title}
                      </span>

                      {lesson.durationmins ? (
                        <span className="curriculum-lesson-duration">
                          <Clock size={16} />
                          <p>{lesson.durationmins} min</p>
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="content-section">
        <div className="section-heading-row">
          <h2 className="section-heading">Student reviews</h2>

          {course.avgrating ? (
            <span className="course-meta-rating text-base">
              <Star className="size-5 fill-yellow-400/80 stroke-0" />
              {course.avgrating}
              <span className="font-normal">{course.totalreviews}</span>
            </span>
          ) : null}
        </div>

        {canReview && enrollment ? (
          <div className="review-form-shell">
            <h3 className="mb-4 text-base font-semibold">
              {existingReview ? "Edit your review" : "Leave a review"}
            </h3>

            <ReviewForm
              enrollmentId={enrollment.enrollmentid}
              courseSlug={slug!}
              existingRating={existingReview?.rating}
              existingComment={existingReview?.comment ?? undefined}
            />
          </div>
        ) : null}

        <ReviewList reviews={course.reviews ?? []} />
      </section>
    </div>
  )
}