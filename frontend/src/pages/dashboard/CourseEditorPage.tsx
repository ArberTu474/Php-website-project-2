import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import MDEditor from "@uiw/react-md-editor"

import { coursesApi } from "@/lib/courses"
import { teacherApi } from "@/lib/teacher"
import { useAuthStore } from "@/store/authStore"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Module, Lesson } from "@/types"

// ── Types for local form state ────────────────────────────────────────────────
interface ModuleForm {
  title: string
  description: string
}

interface LessonForm {
  title: string
  content: string
  video_url: string
  duration_mins: string
}

const emptyModuleForm = (): ModuleForm => ({ title: "", description: "" })
const emptyLessonForm = (): LessonForm => ({
  title: "",
  content: "",
  video_url: "",
  duration_mins: "",
})

export default function CourseEditorPage() {
  const { slug } = useParams<{ slug: string }>()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [moduleDialog, setModuleDialog] = useState<"create" | "edit" | null>(
    null
  )
  const [lessonDialog, setLessonDialog] = useState<"create" | "edit" | null>(
    null
  )
  const [activeModule, setActiveModule] = useState<Module | null>(null)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)

  const [moduleForm, setModuleForm] = useState<ModuleForm>(emptyModuleForm())
  const [lessonForm, setLessonForm] = useState<LessonForm>(emptyLessonForm())

  // ── Fetch course ──────────────────────────────────────────────────────────
  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => coursesApi.getBySlug(slug!),
    enabled: !!slug,
    // refetchOnMount: 'always',
  })

  // ── Course mutations ──────────────────────────────────────────────────────
  const togglePublish = useMutation({
    mutationFn: () =>
      teacherApi.updateCourse(course!.course_id, {
        is_published: !course!.is_published,
      }),
    onSuccess: () => {
      toast.success(
        course?.is_published ? "Course unpublished." : "Course published!"
      )
      queryClient.invalidateQueries({ queryKey: ["course", slug] })
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // ── Module mutations ──────────────────────────────────────────────────────
  const createModule = useMutation({
    mutationFn: () =>
      teacherApi.createModule(course!.course_id, {
        title: moduleForm.title,
        description: moduleForm.description || undefined,
      }),
    onSuccess: () => {
      toast.success("Module added.")
      queryClient.invalidateQueries({ queryKey: ["course", slug] })
      setModuleDialog(null)
      setModuleForm(emptyModuleForm())
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateModule = useMutation({
    mutationFn: () =>
      teacherApi.updateModule(activeModule!.module_id, {
        title: moduleForm.title,
        description: moduleForm.description || undefined,
      }),
    onSuccess: () => {
      toast.success("Module updated.")
      queryClient.invalidateQueries({ queryKey: ["course", slug] })
      setModuleDialog(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteModule = useMutation({
    mutationFn: (moduleId: string) => teacherApi.deleteModule(moduleId),
    onSuccess: () => {
      toast.success("Module deleted.")
      queryClient.invalidateQueries({ queryKey: ["course", slug] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // ── Lesson mutations ──────────────────────────────────────────────────────
  const createLesson = useMutation({
    mutationFn: () =>
      teacherApi.createLesson(activeModule!.module_id, {
        title: lessonForm.title,
        content: lessonForm.content || undefined,
        video_url: lessonForm.video_url || undefined,
        duration_mins: lessonForm.duration_mins
          ? Number(lessonForm.duration_mins)
          : undefined,
      }),
    onSuccess: () => {
      toast.success("Lesson added.")
      queryClient.invalidateQueries({ queryKey: ["course", slug] })
      setLessonDialog(null)
      setLessonForm(emptyLessonForm())
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateLesson = useMutation({
    mutationFn: () =>
      teacherApi.updateLesson(activeLesson!.lesson_id, {
        title: lessonForm.title,
        content: lessonForm.content || undefined,
        video_url: lessonForm.video_url || undefined,
        duration_mins: lessonForm.duration_mins
          ? Number(lessonForm.duration_mins)
          : undefined,
      }),
    onSuccess: () => {
      toast.success("Lesson updated.")
      queryClient.invalidateQueries({ queryKey: ["course", slug] })
      setLessonDialog(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // ── Helpers ───────────────────────────────────────────────────────────────
  function openCreateModule() {
    setModuleForm(emptyModuleForm())
    setModuleDialog("create")
  }

  function openEditModule(module: Module) {
    setActiveModule(module)
    setModuleForm({
      title: module.title,
      description: module.description ?? "",
    })
    setModuleDialog("edit")
  }

  function openCreateLesson(module: Module) {
    setActiveModule(module)
    setLessonForm(emptyLessonForm())
    setLessonDialog("create")
  }

  function openEditLesson(lesson: Lesson) {
    setActiveLesson(lesson)
    setLessonForm({
      title: lesson.title,
      content: lesson.content ?? "",
      video_url: lesson.video_url ?? "",
      duration_mins: lesson.duration_mins ? String(lesson.duration_mins) : "",
    })
    setLessonDialog("edit")
  }

  // ── Guard: only the course owner can edit ─────────────────────────────────
  if (!isLoading && course && course.teacher_id !== user?.user_id) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "var(--space-16)",
          color: "var(--color-text-muted)",
        }}
      >
        <p>You don't have permission to edit this course.</p>
      </div>
    )
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading || !course)
    return (
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "var(--space-12) var(--space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 80,
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface-offset)",
            }}
            className="animate-pulse"
          />
        ))}
      </div>
    )

  return (
    <div
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "var(--space-12) var(--space-6)",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "var(--space-8)",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <Link
            to="/dashboard"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-1)",
              marginBottom: "var(--space-3)",
            }}
          >
            ← Dashboard
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>
              {course.title}
            </h1>
            <Badge
              style={{
                background: course.is_published
                  ? "var(--color-success)"
                  : undefined,
                color: course.is_published ? "#fff" : undefined,
                fontSize: "var(--text-xs)",
              }}
              variant={course.is_published ? "default" : "secondary"}
            >
              {course.is_published ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <Button
            variant="outline"
            onClick={() => togglePublish.mutate()}
            disabled={togglePublish.isPending}
          >
            {course.is_published ? "Unpublish" : "Publish"}
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/courses/${slug}`}>Preview</Link>
          </Button>
        </div>
      </div>

      <Separator style={{ marginBottom: "var(--space-8)" }} />

      {/* ── Modules ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-6)",
        }}
      >
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>
          Curriculum
        </h2>
        <Button size="sm" onClick={openCreateModule}>
          + Add module
        </Button>
      </div>

      {/* Empty curriculum state */}
      {course.modules?.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-12)",
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius-lg)",
            color: "var(--color-text-muted)",
          }}
        >
          <p style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>📦</p>
          <p style={{ marginBottom: "var(--space-4)" }}>
            No modules yet. Add your first module to get started.
          </p>
          <Button size="sm" onClick={openCreateModule}>
            Add module
          </Button>
        </div>
      )}

      {/* Module list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
        }}
      >
        {course.modules?.map((module: Module) => (
          <div
            key={module.module_id}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            {/* Module header */}
            <div
              style={{
                padding: "var(--space-4) var(--space-5)",
                background: "var(--color-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-4)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div>
                <h3 style={{ fontWeight: 600, fontSize: "var(--text-base)" }}>
                  {module.title}
                </h3>
                {module.description && (
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-muted)",
                      marginTop: "var(--space-1)",
                    }}
                  >
                    {module.description}
                  </p>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-2)",
                  flexShrink: 0,
                }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModule(module)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (
                      confirm(
                        `Delete module "${module.title}" and all its lessons?`
                      )
                    ) {
                      deleteModule.mutate(module.module_id)
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Lessons */}
            {module.lessons.map((lesson: Lesson, idx: number) => (
              <div
                key={lesson.lesson_id}
                style={{
                  padding: "var(--space-3) var(--space-5)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  background: "var(--color-surface-2)",
                  borderBottom:
                    idx < module.lessons.length - 1
                      ? "1px solid var(--color-border)"
                      : "none",
                }}
              >
                <span
                  style={{
                    color: "var(--color-text-faint)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  ▶
                </span>
                <span style={{ flex: 1, fontSize: "var(--text-sm)" }}>
                  {lesson.title}
                </span>
                {lesson.duration_mins && (
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {lesson.duration_mins} min
                  </span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEditLesson(lesson)}
                  style={{ fontSize: "var(--text-xs)" }}
                >
                  Edit
                </Button>
              </div>
            ))}

            {/* Add lesson row */}
            <button
              onClick={() => openCreateLesson(module)}
              style={{
                width: "100%",
                padding: "var(--space-3) var(--space-5)",
                background: "var(--color-surface-2)",
                border: "none",
                borderTop:
                  module.lessons.length > 0
                    ? "1px dashed var(--color-border)"
                    : "none",
                cursor: "pointer",
                fontSize: "var(--text-sm)",
                color: "var(--color-primary)",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              + Add lesson
            </button>
          </div>
        ))}
      </div>

      {/* ── Module Dialog ───────────────────────────────────────────────── */}
      <Dialog
        open={moduleDialog !== null}
        onOpenChange={(open) => !open && setModuleDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moduleDialog === "create" ? "Add module" : "Edit module"}
            </DialogTitle>
          </DialogHeader>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
              padding: "var(--space-2) 0",
            }}
          >
            <div>
              <Label htmlFor="module-title">Title</Label>
              <Input
                id="module-title"
                placeholder="e.g. Getting Started"
                value={moduleForm.title}
                onChange={(e) =>
                  setModuleForm((f) => ({ ...f, title: e.target.value }))
                }
                style={{ marginTop: "var(--space-2)" }}
              />
            </div>
            <div>
              <Label htmlFor="module-desc">Description (optional)</Label>
              <Input
                id="module-desc"
                placeholder="Short description"
                value={moduleForm.description}
                onChange={(e) =>
                  setModuleForm((f) => ({ ...f, description: e.target.value }))
                }
                style={{ marginTop: "var(--space-2)" }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                moduleDialog === "create"
                  ? createModule.mutate()
                  : updateModule.mutate()
              }
              disabled={
                !moduleForm.title.trim() ||
                createModule.isPending ||
                updateModule.isPending
              }
            >
              {createModule.isPending || updateModule.isPending
                ? "Saving…"
                : moduleDialog === "create"
                  ? "Add module"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Lesson Dialog ────────────────────────────────────────────────── */}
      <Dialog
        open={lessonDialog !== null}
        onOpenChange={(open) => !open && setLessonDialog(null)}
      >
        <DialogContent style={{ maxWidth: 860, width: "95vw" }}>
          <DialogHeader>
            <DialogTitle>
              {lessonDialog === "create" ? "Add lesson" : "Edit lesson"}
            </DialogTitle>
          </DialogHeader>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
              padding: "var(--space-2) 0",
            }}
          >
            {/* Title + duration row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 140px",
                gap: "var(--space-4)",
              }}
            >
              <div>
                <Label htmlFor="lesson-title">Title</Label>
                <Input
                  id="lesson-title"
                  placeholder="e.g. What is PHP?"
                  value={lessonForm.title}
                  onChange={(e) =>
                    setLessonForm((f) => ({ ...f, title: e.target.value }))
                  }
                  style={{ marginTop: "var(--space-2)" }}
                />
              </div>
              <div>
                <Label htmlFor="lesson-duration">Duration (mins)</Label>
                <Input
                  id="lesson-duration"
                  type="number"
                  placeholder="10"
                  value={lessonForm.duration_mins}
                  onChange={(e) =>
                    setLessonForm((f) => ({
                      ...f,
                      duration_mins: e.target.value,
                    }))
                  }
                  style={{ marginTop: "var(--space-2)" }}
                />
              </div>
            </div>

            {/* Video URL */}
            <div>
              <Label htmlFor="lesson-video">Video URL (optional)</Label>
              <Input
                id="lesson-video"
                placeholder="https://..."
                value={lessonForm.video_url}
                onChange={(e) =>
                  setLessonForm((f) => ({ ...f, video_url: e.target.value }))
                }
                style={{ marginTop: "var(--space-2)" }}
              />
            </div>

            {/* Markdown editor */}
            <div>
              <Label>Content (Markdown)</Label>
              <div
                style={{ marginTop: "var(--space-2)" }}
                data-color-mode="light"
              >
                <MDEditor
                  value={lessonForm.content}
                  onChange={(val) =>
                    setLessonForm((f) => ({ ...f, content: val ?? "" }))
                  }
                  height={340}
                  preview="live"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                lessonDialog === "create"
                  ? createLesson.mutate()
                  : updateLesson.mutate()
              }
              disabled={
                !lessonForm.title.trim() ||
                createLesson.isPending ||
                updateLesson.isPending
              }
            >
              {createLesson.isPending || updateLesson.isPending
                ? "Saving…"
                : lessonDialog === "create"
                  ? "Add lesson"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
