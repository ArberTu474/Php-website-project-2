import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { teacherApi } from "@/lib/teacher"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FilePen, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import TeacherCourseCard from "@/components/courses/TeacherCourseCard"

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
    <div className="container mx-auto my-0 px-6 py-3">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-2 py-6">
        <div>
          <h1 className="text-3xl font-bold">Your Courses</h1>
          <p className="text-base text-muted-foreground">
            Welcome back, {user?.first_name}
          </p>
        </div>
        <Button
          className="cursor-pointer"
          size={"lg"}
          asChild
          onClick={() => setShowCreate(true)}
        >
          <div className="flex items-center gap-2">
            <Plus />
            <p>New course</p>
          </div>
        </Button>
      </div>

      {/* Empty state */}
      {!isLoading && courses?.length === 0 && (
        <div className="mt-12 flex flex-col items-center text-muted-foreground">
          <FilePen size="64" className="stroke-muted-foreground" />
          <div className="my-4 flex flex-col items-center">
            <h3 className="text-xl">No courses yet</h3>
            <p>Create your first course to start teaching.</p>
          </div>
          <Button
            className="cursor-pointer"
            size={"lg"}
            onClick={() => setShowCreate(true)}
          >
            Create a course
          </Button>
        </div>
      )}

      {/* Course list */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Loading skeleton */}
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}

        {courses?.map((course) => {
          return (
            <TeacherCourseCard
              key={course.course_id}
              course={course}
              deleteMutation={deleteMutation}
            />
          )
        })}
      </div>

      {/* Create course dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Create a new course
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new course.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="font-semibold" htmlFor="title">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Title of the course"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="desc" className="font-semibold">
                Description
              </Label>
              <Input
                id="desc"
                placeholder="Short description of the course"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              size={"lg"}
              variant="outline"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button
              size={"lg"}
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
