import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import "github-markdown-css/github-markdown.css"
// import "github-markdown-css/github-markdown-light.css"

import { coursesApi } from "@/lib/courses"
import { lessonsApi } from "@/lib/lessons"
import { enrollmentsApi } from "@/lib/enrollments"
import { useAuthStore } from "@/store/authStore"

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
} from "lucide-react"

export default function LearnView() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

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
    enabled: !!lessonId,
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100dvh - 64px)",
          color: "var(--color-text-muted)",
        }}
      >
        Loading course…
      </div>
    )

  return (
    <div
      // style={{
      //   display: "flex",
      //   height: "calc(100dvh - 64px)",
      //   overflow: "hidden",
      // }}
      className="flex h-[calc(100dvh-65px)] overflow-hidden"
    >
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: sidebarOpen ? 300 : 0,
          minWidth: sidebarOpen ? 300 : 0,
          overflow: "hidden",
          transition: "width 200ms ease, min-width 200ms ease",
          borderRight: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sidebar header */}
        <div style={{ padding: "var(--space-4) var(--space-5)" }}>
          <Link
            to={`/courses/${slug}`}
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-1)",
              marginBottom: "var(--space-3)",
            }}
          >
            ← Back to course
          </Link>
          <h2
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              marginBottom: "var(--space-3)",
              lineHeight: 1.3,
            }}
          >
            {course.title}
          </h2>

          {/* Overall progress */}
          {enrollment && (
            <div>
              <Progress
                value={enrollment.progress.percent}
                style={{ height: 4, marginBottom: "var(--space-1)" }}
              />
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-muted)",
                }}
              >
                {enrollment.progress.completed_lessons}/
                {enrollment.progress.total_lessons} lessons ·{" "}
                {enrollment.progress.percent}%
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Curriculum */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {course.modules?.map((module: Module) => (
            <div key={module.module_id}>
              {/* Module title */}
              <div
                style={{
                  padding: "var(--space-3) var(--space-5)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-text-muted)",
                  background: "var(--color-surface-offset)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
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
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "var(--space-3) var(--space-5)",
                      background: isActive
                        ? "var(--color-primary-highlight, #cedcd8)"
                        : "transparent",
                      borderBottom: "1px solid var(--color-border)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "var(--space-3)",
                      border: "none",
                      transition: "background var(--transition-interactive)",
                    }}
                  >
                    {/* Icon: checkmark if done, play if active, circle if not started */}
                    <span
                      style={{
                        fontSize: "0.75rem",
                        marginTop: 2,
                        flexShrink: 0,
                        width: 16,
                        textAlign: "center",
                        color: isDone
                          ? "var(--color-success)"
                          : isActive
                            ? "var(--color-primary)"
                            : "var(--color-text-faint)",
                      }}
                    >
                      {isDone ? "✓" : isActive ? "▶" : "○"}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: isActive ? 600 : 400,
                          color: isDone
                            ? "var(--color-text-muted)"
                            : isActive
                              ? "var(--color-primary)"
                              : "var(--color-text)",
                          lineHeight: 1.4,
                          textDecorationLine:
                            isDone && !isActive ? "line-through" : "none",
                          textDecorationColor: "var(--color-text-faint)",
                        }}
                      >
                        {l.title}
                      </p>
                      {l.duration_mins && (
                        <p
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--color-text-faint)",
                            marginTop: 2,
                          }}
                        >
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
                  {isLessonComplete || completeMutation.isSuccess
                    ? "Completed"
                    : completeMutation.isPending
                      ? "Saving…"
                      : "Mark as complete"}
                </Button>
              </div>
            </>
          ) : (
            <div
              style={{
                color: "var(--color-text-muted)",
                textAlign: "center",
                paddingTop: "var(--space-16)",
              }}
            >
              <p style={{ fontSize: "2rem", marginBottom: "var(--space-4)" }}>
                👈
              </p>
              <p>Select a lesson from the sidebar to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
