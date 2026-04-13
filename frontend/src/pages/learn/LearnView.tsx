import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import "github-markdown-css/github-markdown.css"

import { coursesApi } from "@/lib/courses"
import { lessonsApi } from "@/lib/lessons"
import { enrollmentsApi } from "@/lib/enrollments"
// import { useAuthStore } from "@/store/authStore"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { Lesson, Module } from "@/types"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  Check,
  FileText,
  CircleSmall,
} from "lucide-react"

export default function LearnView() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  // const { user } = useAuthStore()

  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Fetch full course (curriculum)
  const { data: course } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => coursesApi.getBySlug(slug!),
    enabled: !!slug,
  })

  // Fetch current lesson content
  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => lessonsApi.getById(lessonId!),
    enabled: !!lessonId && lessonId !== slug,
    retry: false,
  })

  // Fetch enrollments to get progress + enrollment_id
  const { data: enrollments } = useQuery({
    queryKey: ["enrollments"],
    queryFn: enrollmentsApi.mine,
  })

  const enrollment = enrollments?.find((e) => e.course.slug === slug)
  const isLessonComplete =
    enrollment?.completed_lesson_ids?.includes(lessonId ?? "") ?? false

  // Check if THIS lesson is already completed

  // Mark lesson complete
  const completeMutation = useMutation({
    mutationFn: () => lessonsApi.complete(lessonId!),
    onSuccess: () => {
      toast.success("Lesson marked as complete!")
      queryClient.invalidateQueries({ queryKey: ["enrollments"] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  useEffect(() => {
    completeMutation.reset()
  }, [lessonId])

  // Flat list of all lessons in order for prev/next navigation
  const allLessons: Lesson[] = course?.modules?.flatMap((m) => m.lessons) ?? []
  const currentIndex = allLessons.findIndex((l) => l.lesson_id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  function goToLesson(lesson: Lesson) {
    navigate(`/learn/${slug}/${lesson.lesson_id}`)
  }

  function getYouTubeEmbedUrl(url: string): string | null {
    try {
      const u = new URL(url)
      let videoId: string | null = null

      // https://www.youtube.com/watch?v=VIDEO_ID
      if (u.hostname.includes("youtube.com")) {
        videoId = u.searchParams.get("v")
      }
      // https://youtu.be/VIDEO_ID
      else if (u.hostname === "youtu.be") {
        videoId = u.pathname.slice(1)
      }

      return videoId
        ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
        : null
    } catch {
      return null
    }
  }

  if (!course)
    return (
      <div className="flex h-[calc(100dvh-65px)] items-center justify-center overflow-hidden">
        <div className="mx-auto my-0 size-16 animate-spin rounded-full border-6 border-border border-t-transparent"></div>
      </div>
    )

  return (
    <div className="flex h-[calc(100dvh-65px)] overflow-hidden">
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside
        className={`flex flex-col overflow-hidden border-r border-border bg-background transition-all duration-200 ease-in-out ${sidebarOpen ? "w-75 min-w-75" : "w-0 min-w-0"} `}
      >
        {/* Sidebar header */}
        <div className="pt-2 pb-4">
          <div className="px-4 pb-2">
            <Button className="p-0" variant={"link"} asChild>
              <Link
                to={`/courses/${slug}`}
                className="flex items-center gap-0 leading-none"
              >
                <ChevronLeft /> Back to course
              </Link>
            </Button>
          </div>
          <Separator />
          <h2 className="px-4 pt-4 pb-2 text-lg leading-snug font-bold">
            {course.title}
          </h2>

          {/* Overall progress */}
          {enrollment && (
            <div className="px-4">
              <Progress
                value={enrollment.progress.percent}
                className={`mb-1 h-1.5 ${
                  enrollment.progress.percent === 100
                    ? "[&>div]:bg-green-600/60"
                    : ""
                }`}
              />
              <p className="text-xs font-semibold">
                {enrollment.progress.completed_lessons}/
                {enrollment.progress.total_lessons} (
                {enrollment.progress.percent}%)
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Curriculum */}
        <div className="flex-1 overflow-auto">
          {course.modules?.map((module: Module) => (
            <div key={module.module_id}>
              {/* Module title */}
              <div className="border-b border-border bg-muted p-4 py-1 text-sm font-semibold uppercase">
                {module.title}
              </div>

              {/* Lessons */}
              {module.lessons.map((l: Lesson) => {
                const isActive = l.lesson_id === lessonId
                const isDone =
                  enrollment?.completed_lesson_ids?.includes(l.lesson_id) ??
                  false

                return (
                  <button
                    key={l.lesson_id}
                    onClick={() => goToLesson(l)}
                    className={`${isActive ? "bg-muted" : "bg-transparent"} flex w-full cursor-pointer items-start gap-1 border-b border-border px-4 py-2 text-left`}
                  >
                    {/* Icon: checkmark if done, play if active, circle if not started */}
                    <span
                      className={`mt-0.5 text-center text-xs ${
                        isDone
                          ? "text-green-600"
                          : isActive
                            ? "text-primary"
                            : "text-muted-foreground"
                      } `}
                    >
                      {isDone ? (
                        <Check size="18" />
                      ) : isActive ? (
                        <ChevronRight size="18" />
                      ) : (
                        <CircleSmall size="18" />
                      )}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        className={`text-sm leading-[1.4] ${isActive ? "font-semibold" : "font-normal"} ${
                          isDone
                            ? "text-muted-foreground"
                            : isActive
                              ? "text-primary"
                              : "text-foreground"
                        } ${isDone && !isActive ? "italic decoration-muted-foreground" : ""} `}
                      >
                        {l.title}
                      </p>
                      {l.duration_mins && (
                        <p className="text-xs text-muted-foreground">
                          {l.duration_mins} min
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-auto">
        {/* Top bar */}
        <div className="flex shrink-0 items-center gap-4 p-4">
          <Button
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
            variant={"outline"}
            size={"icon-lg"}
          >
            {sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
        </div>

        {/* Lesson content */}
        <div className="mx-auto my-0 w-full max-w-255 p-4">
          {lessonLoading ? (
            <div className="my-10">
              <div className="mx-auto my-0 size-16 animate-spin rounded-full border-6 border-border border-t-transparent"></div>
            </div>
          ) : lesson ? (
            <>
              {/* Title */}
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{lesson.title}</h1>

                {lesson.duration_mins && (
                  <Badge variant="secondary" className="text-muted-foreground">
                    <Clock /> {lesson.duration_mins} min
                  </Badge>
                )}
              </div>
              {/* Video */}
              {lesson.video_url &&
                (() => {
                  const embedUrl = getYouTubeEmbedUrl(lesson.video_url)
                  if (!embedUrl) return null
                  return (
                    <div className="relative my-4 aspect-video overflow-hidden rounded-lg">
                      <iframe
                        src={embedUrl}
                        title={lesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                        }}
                      />
                    </div>
                  )
                })()}

              {/* Markdown content */}
              {lesson.content && (
                <div className="text-base text-foreground">
                  <div className="markdown-body bg-red-500">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {lesson.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-border py-4">
                {/* Prev/Next */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={!prevLesson}
                    onClick={() => prevLesson && goToLesson(prevLesson)}
                  >
                    <ChevronLeft /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={!nextLesson}
                    onClick={() => nextLesson && goToLesson(nextLesson)}
                  >
                    Next <ChevronRight />
                  </Button>
                </div>

                {/* Mark complete */}
                <Button
                  size={"lg"}
                  onClick={() => completeMutation.mutate()}
                  disabled={
                    isLessonComplete ||
                    completeMutation.isPending ||
                    completeMutation.isSuccess
                  }
                  variant={
                    isLessonComplete || completeMutation.isSuccess
                      ? "secondary"
                      : "default"
                  }
                >
                  {isLessonComplete || completeMutation.isSuccess ? (
                    <>
                      <Check /> Completed
                    </>
                  ) : completeMutation.isPending ? (
                    "Saving…"
                  ) : (
                    "Mark as complete"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <FileText size="64" />
              <p>Select a lesson from the sidebar to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
