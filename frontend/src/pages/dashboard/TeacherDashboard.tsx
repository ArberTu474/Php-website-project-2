import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { teacherApi } from "@/lib/teacher"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TeacherDashboard() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")

  const { data: courses, isLoading } = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: teacherApi.myCourses,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      teacherApi.createCourse({
        title: newTitle,
        description: newDesc,
        is_published: false,
      }),
    onSuccess: () => {
      toast.success("Course created!")
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] })
      setShowCreate(false)
      setNewTitle("")
      setNewDesc("")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teacherApi.deleteCourse(id),
    onSuccess: () => {
      toast.success("Course deleted.")
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div
      style={{
        maxWidth: "var(--content-wide, 1200px)",
        margin: "0 auto",
        padding: "var(--space-12) var(--space-6)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-10)",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>
            Your Courses
          </h1>
          <p
            style={{
              color: "var(--color-text-muted)",
              marginTop: "var(--space-1)",
            }}
          >
            Welcome back, {user?.first_name}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New course</Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 100,
                borderRadius: "var(--radius-lg)",
                background: "var(--color-surface-offset)",
              }}
              className="animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && courses?.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-16)",
            color: "var(--color-text-muted)",
          }}
        >
          <p style={{ fontSize: "2.5rem", marginBottom: "var(--space-4)" }}>
            📝
          </p>
          <h3
            style={{
              color: "var(--color-text)",
              marginBottom: "var(--space-2)",
              fontSize: "var(--text-lg)",
            }}
          >
            No courses yet
          </h3>
          <p style={{ marginBottom: "var(--space-6)" }}>
            Create your first course to start teaching.
          </p>
          <Button onClick={() => setShowCreate(true)}>Create a course</Button>
        </div>
      )}

      {/* Course list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        {courses?.map((course) => (
          <Card key={course.course_id}>
            <CardContent
              style={{
                padding: "var(--space-5)",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "var(--space-6)",
                alignItems: "center",
              }}
            >
              {/* Left */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    marginBottom: "var(--space-2)",
                    flexWrap: "wrap",
                  }}
                >
                  <h3 style={{ fontWeight: 600, fontSize: "var(--text-base)" }}>
                    {course.title}
                  </h3>
                  <Badge
                    variant={course.is_published ? "default" : "secondary"}
                    style={{
                      fontSize: "var(--text-xs)",
                      background: course.is_published
                        ? "var(--color-success)"
                        : undefined,
                      color: course.is_published ? "#fff" : undefined,
                    }}
                  >
                    {course.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-4)",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {/* @ts-ignore — extra fields from teacher query */}
                  <span>📦 {course.total_modules ?? 0} modules</span>
                  {/* @ts-ignore */}
                  <span>🎬 {course.total_lessons ?? 0} lessons</span>
                  {/* @ts-ignore */}
                  <span>👥 {course.total_students ?? 0} students</span>
                </div>
              </div>

              {/* Right: actions */}
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/courses/${course.slug}/edit`}>Edit</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/courses/${course.slug}`}>View</Link>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (
                      confirm(
                        `Delete "${course.title}"? This cannot be undone.`
                      )
                    ) {
                      deleteMutation.mutate(course.course_id)
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create course dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new course</DialogTitle>
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
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Introduction to Python"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ marginTop: "var(--space-2)" }}
              />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                placeholder="Short description of the course"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                style={{ marginTop: "var(--space-2)" }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newTitle.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating…" : "Create course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
