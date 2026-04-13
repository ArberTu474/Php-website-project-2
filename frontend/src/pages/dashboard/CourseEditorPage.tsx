import { useCallback, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { coursesApi } from "@/lib/courses"
import { teacherApi } from "@/lib/teacher"
import { useAuthStore } from "@/store/authStore"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Module, Lesson } from "@/types"
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Eye,
  PackageOpen,
  Plus,
  SquarePen,
  Trash,
  X,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  LessonDialog,
  type LessonFormData,
} from "@/components/lessons/LessonDialog"

// ── Types for local form state ────────────────────────────────────────────────
interface ModuleForm {
  title: string
  description: string
}

const emptyModuleForm = (): ModuleForm => ({ title: "", description: "" })
const emptyLessonForm = (): LessonFormData => ({
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
  const [lessonForm, setLessonForm] =
    useState<LessonFormData>(emptyLessonForm())

  // ── Fetch course ──────────────────────────────────────────────────────────
  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => coursesApi.getBySlug(slug!),
    enabled: !!slug,
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
    mutationFn: (form: LessonFormData) =>
      teacherApi.createLesson(activeModule!.module_id, {
        title: form.title,
        content: form.content || undefined,
        video_url: form.video_url || undefined,
        duration_mins: form.duration_mins
          ? Number(form.duration_mins)
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
    mutationFn: (form: LessonFormData) =>
      teacherApi.updateLesson(activeLesson!.lesson_id, {
        title: form.title,
        content: form.content || undefined,
        video_url: form.video_url || undefined,
        duration_mins: form.duration_mins
          ? Number(form.duration_mins)
          : undefined,
      }),
    onSuccess: () => {
      toast.success("Lesson updated.")
      queryClient.invalidateQueries({ queryKey: ["course", slug] })
      setLessonDialog(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const { mutate: createLessonMutate } = createLesson
  const { mutate: updateLessonMutate } = updateLesson

  const handleLessonSave = useCallback(
    (form: LessonFormData) => {
      lessonDialog === "create"
        ? createLesson.mutate(form)
        : updateLesson.mutate(form)
    },
    [lessonDialog, createLessonMutate, updateLessonMutate]
  )

  const handleLessonClose = useCallback(() => {
    setLessonDialog(null)
  }, [])

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
      <div className="container mx-auto my-0 mt-40 px-6 py-3">
        <div className="space-y-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-60" />
            ))}
        </div>
      </div>
    )

  return (
    <div className="container mx-auto my-0 px-6 py-3">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center gap-2">
          <Button variant={"ghost"} size={"icon-lg"} asChild>
            <Link to="/dashboard">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="mr-2 text-xl font-bold md:text-2xl">{course.title}</h1>
          <Badge
            className="leading-none"
            variant={course.is_published ? "secondary" : "destructive"}
          >
            {course.is_published ? "Published" : "Draft"}
          </Badge>
        </div>

        <div className="gap items flex gap-2">
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" asChild>
              <Link to={`/courses/${slug}`}>
                <Eye />
                Preview
              </Link>
            </Button>
            <Button
              variant={course.is_published ? "destructive" : "default"}
              onClick={() => togglePublish.mutate()}
              disabled={togglePublish.isPending}
            >
              {course.is_published ? (
                <>
                  <X /> Unpublish
                </>
              ) : (
                <>
                  <Check /> Publish
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Modules ────────────────────────────────────────────────────── */}
      <div className="my-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Curriculum</h2>
        <Button size="lg" onClick={openCreateModule}>
          <Plus />
          Add module
        </Button>
      </div>

      {/* Empty curriculum state */}
      {course.modules?.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-muted-foreground">
          <PackageOpen size="64" />
          <p className="text-center">
            No modules yet. <br /> Add your first module to get started.
          </p>
        </div>
      )}

      {/* Module list */}
      <div className="mb-10 space-y-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}

        {course.modules?.map((module: Module) => (
          <div
            key={module.module_id}
            className="overflow-hidden rounded-lg border border-border"
          >
            {/* Module header */}
            <div className="flex items-start justify-between gap-2 border-t border-border bg-muted/50 px-4 py-3">
              <div>
                <h3 className="text-base font-semibold">{module.title}</h3>
                {module.description && (
                  <p className="line-clamp-2 max-w-prose text-sm text-muted-foreground">
                    {module.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size={"icon-lg"}
                  variant="outline"
                  onClick={() => openEditModule(module)}
                >
                  <SquarePen />
                </Button>
                <Button
                  size={"icon-lg"}
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
                  <Trash />
                </Button>
              </div>
            </div>

            {/* Lessons */}
            {module.lessons.map((lesson: Lesson, idx: number) => (
              <div
                key={lesson.lesson_id}
                className="flex items-center gap-2 border-t border-border px-4 py-2"
              >
                <span>
                  <ChevronRight size="16" />
                </span>
                <p className="flex-1 text-sm">
                  <span className="font-semibold">{idx + 1}</span>
                  {". "}
                  {lesson.title}
                </p>
                {lesson.duration_mins && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock size="16" />
                    <p>{lesson.duration_mins} min</p>
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
              className="flex w-full cursor-pointer items-center justify-center gap-2 border-t border-dashed border-border px-4 py-2 hover:bg-muted/50"
            >
              <Plus size="20" />
              <p className="text-base font-semibold">Add lesson</p>
            </button>
          </div>
        ))}
      </div>

      {/* ── Module Dialog ───────────────────────────────────────────────── */}
      <Dialog
        open={moduleDialog !== null}
        onOpenChange={(open) => !open && setModuleDialog(null)}
      >
        <DialogContent className="sm:max-w-175">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {moduleDialog === "create" ? "Add module" : "Edit module"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new module.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="module-title" className="font-semibold">
                Title
              </Label>
              <Input
                id="module-title"
                placeholder=""
                value={moduleForm.title}
                onChange={(e) =>
                  setModuleForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="module-desc" className="font-semibold">
                Description (optional)
              </Label>
              <Textarea
                id="module-desc"
                placeholder="Short description"
                value={moduleForm.description}
                className="min-h-60 resize-none overflow-y-scroll"
                rows={10}
                onChange={(e) =>
                  setModuleForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              size={"lg"}
              variant="outline"
              onClick={() => setModuleDialog(null)}
            >
              Cancel
            </Button>
            <Button
              size={"lg"}
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
      <LessonDialog
        mode={lessonDialog}
        initialValues={lessonForm}
        isPending={createLesson.isPending || updateLesson.isPending}
        onSave={handleLessonSave}
        onClose={handleLessonClose}
      />
    </div>
  )
}
