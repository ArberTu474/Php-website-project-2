import { useState, useEffect, memo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import MDEditor from "@uiw/react-md-editor"

export interface LessonFormData {
  title: string
  duration_mins: string
  video_url: string
  content: string
}

interface LessonDialogProps {
  mode: "create" | "edit" | null
  initialValues: LessonFormData
  isPending: boolean
  onSave: (form: LessonFormData) => void
  onClose: () => void
}

export const LessonDialog = memo(function LessonDialog({
  mode,
  initialValues,
  isPending,
  onSave,
  onClose,
}: LessonDialogProps) {
  const [form, setForm] = useState<LessonFormData>(initialValues)

  // Sync initial values when dialog opens for editing
  useEffect(() => {
    if (mode !== null) setForm(initialValues)
  }, [mode])

  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {mode === "create" ? "Add lesson" : "Edit lesson"}
          </DialogTitle>
          <DialogDescription>Edit the content of the lesson.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title + duration row */}
          <div className="grid grid-cols-[1fr_140px] gap-4">
            <div className="space-y-1">
              <Label htmlFor="lesson-title" className="font-semibold">
                Title
              </Label>
              <Input
                id="lesson-title"
                placeholder="Lesson title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lesson-duration" className="font-semibold">
                Duration (mins)
              </Label>
              <Input
                id="lesson-duration"
                type="number"
                placeholder="0"
                value={form.duration_mins}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration_mins: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Video URL */}
          <div className="space-y-1">
            <Label htmlFor="lesson-video" className="font-semibold">
              Video URL (optional)
            </Label>
            <Input
              id="lesson-video"
              placeholder="https://..."
              value={form.video_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, video_url: e.target.value }))
              }
            />
          </div>

          {/* Markdown editor */}
          <div className="space-y-1">
            <Label className="font-semibold">Content (Markdown)</Label>
            <div
              style={{ marginTop: "var(--space-2)" }}
              data-color-mode="light"
            >
              <MDEditor
                value={form.content}
                onChange={(val) =>
                  setForm((f) => ({ ...f, content: val ?? "" }))
                }
                height={440}
                preview="live"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button size="lg" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={() => onSave(form)}
            disabled={!form.title.trim() || isPending}
          >
            {isPending
              ? "Saving…"
              : mode === "create"
                ? "Add lesson"
                : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
