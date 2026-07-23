import { Button } from "@better-t-stack-template/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@better-t-stack-template/ui/components/dialog"

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "确认删除",
  description = "此操作不可撤销，确定要删除吗？",
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{description}</DialogDescription>
        <DialogFooter className="bg-transparent py-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
