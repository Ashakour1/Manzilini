"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Bell, CalendarClock, CheckCircle2, ClipboardList, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  createTask,
  createTasksBulk,
  deleteTask,
  getAssignableActiveUsers,
  getMyTasks,
  getTaskDashboardSummary,
  getTasksAssignedToUser,
  updateTask,
  updateTaskStatus,
  type TaskDashboardSummary,
  type TaskItem,
  type TaskPriority,
  type TaskStatus,
  type TaskUser,
} from "@/services/tasks.service";

const PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high", "urgent"];
const STATUS_OPTIONS: TaskStatus[] = ["pending", "in_progress", "completed", "cancelled"];

const formatLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatDateTime = (value?: string | null, emptyLabel = "No due date") =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : emptyLabel;

const toDateTimeLocalInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const priorityTone = (priority: TaskPriority) => {
  if (priority === "urgent") return "bg-rose-50 text-rose-700 border border-rose-100";
  if (priority === "high") return "bg-amber-50 text-amber-700 border border-amber-100";
  if (priority === "medium") return "bg-blue-50 text-blue-700 border border-blue-100";
  return "bg-emerald-50 text-emerald-700 border border-emerald-100";
};

const statusTone = (status: TaskStatus) => {
  if (status === "completed") return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  if (status === "in_progress") return "bg-blue-50 text-blue-700 border border-blue-100";
  if (status === "cancelled") return "bg-slate-100 text-slate-700 border border-slate-200";
  return "bg-amber-50 text-amber-700 border border-amber-100";
};

type TaskFormState = {
  title: string;
  description: string;
  assigned_to: string;
  priority: TaskPriority;
  due_date: string;
  reminder_at: string;
};

type BulkTaskRow = TaskFormState & {
  id: string;
};

type EditTaskFormState = {
  title: string;
  description: string;
  assigned_to: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  reminder_at: string;
};

const initialTaskForm: TaskFormState = {
  title: "",
  description: "",
  assigned_to: "",
  priority: "medium",
  due_date: "",
  reminder_at: "",
};

const buildBulkTaskRow = (defaults: Partial<TaskFormState> = {}): BulkTaskRow => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  title: "",
  description: "",
  assigned_to: "",
  priority: "medium",
  due_date: "",
  reminder_at: "",
  ...defaults,
});

const initialEditForm: EditTaskFormState = {
  title: "",
  description: "",
  assigned_to: "",
  priority: "medium",
  status: "pending",
  due_date: "",
  reminder_at: "",
};

export function TasksPage() {
  const { toast } = useToast();

  const [assignableUsers, setAssignableUsers] = useState<TaskUser[]>([]);
  const [myTasks, setMyTasks] = useState<TaskItem[]>([]);
  const [selectedUserTasks, setSelectedUserTasks] = useState<TaskItem[]>([]);
  const [taskSummary, setTaskSummary] = useState<TaskDashboardSummary | null>(null);
  const [canManageTasks, setCanManageTasks] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [statusDrafts, setStatusDrafts] = useState<Record<string, TaskStatus>>({});

  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMyTasks, setIsLoadingMyTasks] = useState(false);
  const [isLoadingSelectedUserTasks, setIsLoadingSelectedUserTasks] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isCreatingBulkTasks, setIsCreatingBulkTasks] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [isSavingTaskEdit, setIsSavingTaskEdit] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);

  const [assignmentMode, setAssignmentMode] = useState<"single" | "bulk">("single");
  const [formData, setFormData] = useState<TaskFormState>(initialTaskForm);
  const [bulkTasks, setBulkTasks] = useState<BulkTaskRow[]>([buildBulkTaskRow()]);
  const [editForm, setEditForm] = useState<EditTaskFormState>(initialEditForm);

  const loadAssignableUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const users = await getAssignableActiveUsers();
      setCanManageTasks(true);
      setAssignableUsers(users);

      const firstUserId = users[0]?.id || "";
      setSelectedUserId((prev) => (users.some((user) => user.id === prev) ? prev : firstUserId));
      setFormData((prev) => ({
        ...prev,
        assigned_to: users.some((user) => user.id === prev.assigned_to) ? prev.assigned_to : firstUserId,
      }));
      setBulkTasks((prev) => {
        const rows = prev.length ? prev : [buildBulkTaskRow()];
        return rows.map((row) =>
          users.some((user) => user.id === row.assigned_to) ? row : { ...row, assigned_to: firstUserId }
        );
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load assignable users";
      if (message.toLowerCase().includes("access denied")) {
        setCanManageTasks(false);
        setAssignableUsers([]);
        setSelectedUserId("");
        setSelectedUserTasks([]);
        setBulkTasks([buildBulkTaskRow()]);
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadMyTasks = async () => {
    setIsLoadingMyTasks(true);
    try {
      const tasks = await getMyTasks();
      setMyTasks(tasks);
      setStatusDrafts(
        tasks.reduce<Record<string, TaskStatus>>((acc, task) => {
          acc[task.id] = task.status;
          return acc;
        }, {})
      );
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load your tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMyTasks(false);
    }
  };

  const loadSelectedUserTasks = async (userId: string) => {
    if (!userId) {
      setSelectedUserTasks([]);
      return;
    }

    setIsLoadingSelectedUserTasks(true);
    try {
      const tasks = await getTasksAssignedToUser(userId);
      setSelectedUserTasks(tasks);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load selected user tasks",
        variant: "destructive",
      });
      setSelectedUserTasks([]);
    } finally {
      setIsLoadingSelectedUserTasks(false);
    }
  };

  const loadSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const summary = await getTaskDashboardSummary();
      setTaskSummary(summary);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load task summary",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadAssignableUsers(), loadMyTasks(), loadSummary()]);
    if (selectedUserId) {
      await loadSelectedUserTasks(selectedUserId);
    }
  };

  const refreshAfterMutation = async () => {
    await Promise.all([
      loadMyTasks(),
      loadSummary(),
      selectedUserId ? loadSelectedUserTasks(selectedUserId) : Promise.resolve(),
    ]);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUserTasks([]);
      return;
    }
    loadSelectedUserTasks(selectedUserId);
  }, [selectedUserId]);

  const selectedUserName = useMemo(() => {
    const user = assignableUsers.find((item) => item.id === selectedUserId);
    return user?.name || "Selected User";
  }, [assignableUsers, selectedUserId]);

  const handleCreateTask = async () => {
    if (!formData.title.trim() || !formData.assigned_to || !formData.priority) {
      toast({
        title: "Validation Error",
        description: "Title, assigned user, and priority are required.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingTask(true);
    try {
      await createTask({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        assigned_to: formData.assigned_to,
        priority: formData.priority,
        due_date: formData.due_date ? formData.due_date : null,
        reminder_at: formData.reminder_at ? formData.reminder_at : null,
      });

      toast({
        title: "Task Created",
        description: "Task assigned successfully.",
      });

      setFormData((prev) => ({
        ...initialTaskForm,
        assigned_to: prev.assigned_to,
        priority: prev.priority,
      }));

      await refreshAfterMutation();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleBulkTaskChange = <K extends keyof TaskFormState>(
    rowId: string,
    field: K,
    value: TaskFormState[K]
  ) => {
    setBulkTasks((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const addBulkTaskRow = () => {
    const defaultAssignee = formData.assigned_to || assignableUsers[0]?.id || "";
    setBulkTasks((prev) => [...prev, buildBulkTaskRow({ assigned_to: defaultAssignee })]);
  };

  const removeBulkTaskRow = (rowId: string) => {
    setBulkTasks((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== rowId) : prev));
  };

  const handleCreateBulkTasks = async () => {
    const nonEmptyRows = bulkTasks.filter(
      (row) =>
        row.title.trim() ||
        row.description.trim() ||
        row.assigned_to ||
        row.due_date ||
        row.reminder_at
    );

    if (!nonEmptyRows.length) {
      toast({
        title: "Validation Error",
        description: "Add at least one task row before assigning.",
        variant: "destructive",
      });
      return;
    }

    for (let index = 0; index < nonEmptyRows.length; index += 1) {
      const row = nonEmptyRows[index];
      if (!row.title.trim()) {
        toast({
          title: "Validation Error",
          description: `Task ${index + 1}: Title is required.`,
          variant: "destructive",
        });
        return;
      }

      if (!row.assigned_to) {
        toast({
          title: "Validation Error",
          description: `Task ${index + 1}: Assigned user is required.`,
          variant: "destructive",
        });
        return;
      }

      if (!row.priority) {
        toast({
          title: "Validation Error",
          description: `Task ${index + 1}: Priority is required.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsCreatingBulkTasks(true);
    try {
      const response = await createTasksBulk({
        tasks: nonEmptyRows.map((row) => ({
          title: row.title.trim(),
          description: row.description.trim() || undefined,
          assigned_to: row.assigned_to,
          priority: row.priority,
          due_date: row.due_date ? row.due_date : null,
          reminder_at: row.reminder_at ? row.reminder_at : null,
        })),
      });

      toast({
        title: "Tasks Created",
        description: `${response.count || nonEmptyRows.length} tasks assigned successfully.`,
      });

      const defaultAssignee = formData.assigned_to || assignableUsers[0]?.id || "";
      setBulkTasks([buildBulkTaskRow({ assigned_to: defaultAssignee })]);

      await refreshAfterMutation();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tasks",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBulkTasks(false);
    }
  };

  const handleUpdateStatus = async (task: TaskItem) => {
    const nextStatus = statusDrafts[task.id] || task.status;

    if (nextStatus === task.status) {
      toast({
        title: "No Change",
        description: "Select a different status before updating.",
      });
      return;
    }

    setUpdatingTaskId(task.id);
    try {
      await updateTaskStatus(task.id, nextStatus);

      toast({
        title: "Status Updated",
        description: "Task status updated successfully.",
      });

      await refreshAfterMutation();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const openEditDialog = (task: TaskItem) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      assigned_to: task.assigned_to,
      priority: task.priority,
      status: task.status,
      due_date: toDateTimeLocalInput(task.due_date),
      reminder_at: toDateTimeLocalInput(task.reminder_at),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    if (!editForm.title.trim() || !editForm.assigned_to || !editForm.priority) {
      toast({
        title: "Validation Error",
        description: "Title, assigned user, and priority are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingTaskEdit(true);
    setUpdatingTaskId(editingTask.id);

    try {
      await updateTask(editingTask.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        assigned_to: editForm.assigned_to,
        priority: editForm.priority,
        status: editForm.status,
        due_date: editForm.due_date ? editForm.due_date : null,
        reminder_at: editForm.reminder_at ? editForm.reminder_at : null,
      });

      toast({
        title: "Task Updated",
        description: "Task details updated successfully.",
      });

      setIsEditDialogOpen(false);
      setEditingTask(null);
      await refreshAfterMutation();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
    } finally {
      setIsSavingTaskEdit(false);
      setUpdatingTaskId(null);
    }
  };

  const openDeleteDialog = (task: TaskItem) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    setDeletingTaskId(taskToDelete.id);
    try {
      await deleteTask(taskToDelete.id);

      toast({
        title: "Task Deleted",
        description: "Task deleted successfully.",
      });

      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
      await refreshAfterMutation();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete task",
        variant: "destructive",
      });
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-in fade-in-0 slide-in-from-top-1 duration-500">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="text-xs text-gray-600">Assign tasks, track progress, and manage work status.</p>
        </div>
        <Button variant="outline" onClick={refreshAll} disabled={isLoadingUsers || isLoadingMyTasks || isLoadingSummary}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border border-amber-100 bg-amber-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-700" />
              <p className="text-xs font-medium text-amber-700">Pending Tasks</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-amber-900">
              {isLoadingSummary ? "..." : taskSummary?.total_pending_tasks ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-blue-100 bg-blue-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-700" />
              <p className="text-xs font-medium text-blue-700">Unread Notifications</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-blue-900">
              {isLoadingSummary ? "..." : taskSummary?.unread_notification_count ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-emerald-100 bg-emerald-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <p className="text-xs font-medium text-emerald-700">My Tasks</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-900">
              {isLoadingMyTasks ? "..." : myTasks.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {canManageTasks ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card className="border border-gray-200 bg-white animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Assign New Task</CardTitle>
              <CardDescription className="text-xs text-gray-600">
                Use single mode or bulk mode to assign multiple tasks at once.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={assignmentMode === "single" ? "default" : "outline"}
                  onClick={() => setAssignmentMode("single")}
                >
                  Single Task
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={assignmentMode === "bulk" ? "default" : "outline"}
                  onClick={() => setAssignmentMode("bulk")}
                >
                  Bulk Tasks
                </Button>
              </div>

              {assignmentMode === "single" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Title</Label>
                    <Input
                      id="task-title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Prepare monthly landlord report"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Include occupancy trends and pending payments."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <Select
                        value={formData.assigned_to}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, assigned_to: value }))}
                        disabled={!assignableUsers.length || isLoadingUsers}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select user"} />
                        </SelectTrigger>
                        <SelectContent>
                          {assignableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value as TaskPriority }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {formatLabel(priority)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="task-due-date">Due Date (optional)</Label>
                      <Input
                        id="task-due-date"
                        type="datetime-local"
                        value={formData.due_date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, due_date: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="task-reminder-at">Reminder (optional)</Label>
                      <Input
                        id="task-reminder-at"
                        type="datetime-local"
                        value={formData.reminder_at}
                        onChange={(e) => setFormData((prev) => ({ ...prev, reminder_at: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleCreateTask}
                    disabled={isCreatingTask || isLoadingUsers || isCreatingBulkTasks}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreatingTask ? "Assigning..." : "Assign Task"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bulkTasks.map((taskRow, index) => (
                    <div key={taskRow.id} className="rounded-xl border border-gray-200 p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-700">Task {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeBulkTaskRow(taskRow.id)}
                          disabled={bulkTasks.length === 1 || isCreatingBulkTasks}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Remove task row</span>
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`bulk-title-${taskRow.id}`}>Title</Label>
                          <Input
                            id={`bulk-title-${taskRow.id}`}
                            value={taskRow.title}
                            onChange={(e) => handleBulkTaskChange(taskRow.id, "title", e.target.value)}
                            placeholder="Prepare monthly landlord report"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`bulk-description-${taskRow.id}`}>Description</Label>
                          <Textarea
                            id={`bulk-description-${taskRow.id}`}
                            rows={2}
                            value={taskRow.description}
                            onChange={(e) => handleBulkTaskChange(taskRow.id, "description", e.target.value)}
                            placeholder="Optional details"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Assign To</Label>
                            <Select
                              value={taskRow.assigned_to}
                              onValueChange={(value) => handleBulkTaskChange(taskRow.id, "assigned_to", value)}
                              disabled={!assignableUsers.length || isLoadingUsers}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select user"} />
                              </SelectTrigger>
                              <SelectContent>
                                {assignableUsers.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name} ({user.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                              value={taskRow.priority}
                              onValueChange={(value) =>
                                handleBulkTaskChange(taskRow.id, "priority", value as TaskPriority)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                {PRIORITY_OPTIONS.map((priority) => (
                                  <SelectItem key={priority} value={priority}>
                                    {formatLabel(priority)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`bulk-due-date-${taskRow.id}`}>Due Date (optional)</Label>
                            <Input
                              id={`bulk-due-date-${taskRow.id}`}
                              type="datetime-local"
                              value={taskRow.due_date}
                              onChange={(e) => handleBulkTaskChange(taskRow.id, "due_date", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`bulk-reminder-at-${taskRow.id}`}>Reminder (optional)</Label>
                            <Input
                              id={`bulk-reminder-at-${taskRow.id}`}
                              type="datetime-local"
                              value={taskRow.reminder_at}
                              onChange={(e) => handleBulkTaskChange(taskRow.id, "reminder_at", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addBulkTaskRow}
                      disabled={isCreatingBulkTasks || isLoadingUsers}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task Row
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreateBulkTasks}
                      disabled={isCreatingBulkTasks || isLoadingUsers}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {isCreatingBulkTasks ? "Assigning..." : `Assign ${bulkTasks.length} Tasks`}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">Tasks By User</CardTitle>
              <CardDescription className="text-xs text-gray-600">
                Edit or delete tasks assigned to a user (newest first).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={!assignableUsers.length || isLoadingUsers}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select user"} />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoadingSelectedUserTasks ? (
                <p className="text-sm text-gray-500">Loading tasks...</p>
              ) : selectedUserTasks.length ? (
                <div className="max-h-[340px] overflow-auto rounded-md border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Reminder</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[96px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedUserTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <p className="text-xs text-gray-500">{task.description || "No description"}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={priorityTone(task.priority)}>
                              {formatLabel(task.priority)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusTone(task.status)}>
                              {formatLabel(task.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">{formatDateTime(task.due_date)}</TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {formatDateTime(task.reminder_at, "No reminder")}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">{formatDateTime(task.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(task)}
                                disabled={isSavingTaskEdit || deletingTaskId === task.id}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit task</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-600 hover:text-rose-700"
                                onClick={() => openDeleteDialog(task)}
                                disabled={isSavingTaskEdit || deletingTaskId === task.id}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete task</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  {selectedUserId
                    ? `${selectedUserName} has no assigned tasks.`
                    : "Select a user to view tasks."}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border border-gray-200 bg-white animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <CardContent className="p-4 text-sm text-gray-600">
            You can view your task summary and update only your own task status.
          </CardContent>
        </Card>
      )}

      <Card className="mt-4 border border-gray-200 bg-white animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">My Tasks</CardTitle>
          <CardDescription className="text-xs text-gray-600">
            Update only your own task status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMyTasks ? (
            <p className="text-sm text-gray-500">Loading your tasks...</p>
          ) : myTasks.length ? (
            <div className="overflow-auto rounded-md border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Reminder</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[180px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myTasks.map((task) => {
                    const selectedStatus = statusDrafts[task.id] || task.status;
                    const hasChanged = selectedStatus !== task.status;

                    return (
                      <TableRow key={task.id}>
                        <TableCell>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.description || "No description"}</p>
                          <p className="mt-1 text-[11px] text-gray-500">
                            Assigned by: {task.assigned_by_user?.name || "System"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={priorityTone(task.priority)}>
                            {formatLabel(task.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5" />
                            {formatDateTime(task.due_date)}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Bell className="h-3.5 w-3.5" />
                            {formatDateTime(task.reminder_at, "No reminder")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={selectedStatus}
                            onValueChange={(value) =>
                              setStatusDrafts((prev) => ({ ...prev, [task.id]: value as TaskStatus }))
                            }
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {formatLabel(status)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(task)}
                            disabled={!hasChanged || updatingTaskId === task.id}
                          >
                            {updatingTaskId === task.id ? "Updating..." : "Update Status"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
              You have no assigned tasks yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details, assignee, priority, and status.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-title">Title</Label>
              <Input
                id="edit-task-title"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-task-description">Description</Label>
              <Textarea
                id="edit-task-description"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select
                  value={editForm.assigned_to}
                  onValueChange={(value) => setEditForm((prev) => ({ ...prev, assigned_to: value }))}
                  disabled={!assignableUsers.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(value) => setEditForm((prev) => ({ ...prev, priority: value as TaskPriority }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {formatLabel(priority)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value as TaskStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-task-due-date">Due Date</Label>
                <Input
                  id="edit-task-due-date"
                  type="datetime-local"
                  value={editForm.due_date}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, due_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-task-reminder-at">Reminder</Label>
                <Input
                  id="edit-task-reminder-at"
                  type="datetime-local"
                  value={editForm.reminder_at}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, reminder_at: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateTask} disabled={isSavingTaskEdit}>
              {isSavingTaskEdit ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{taskToDelete?.title || "this task"}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              disabled={deletingTaskId === taskToDelete?.id}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deletingTaskId === taskToDelete?.id ? "Deleting..." : "Delete Task"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
