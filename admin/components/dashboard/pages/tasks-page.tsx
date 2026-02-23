"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Bell, CalendarClock, CheckCircle2, ClipboardList, Plus, RefreshCw } from "lucide-react";
import {
  createTask,
  getAssignableActiveUsers,
  getMyTasks,
  getTaskDashboardSummary,
  getTasksAssignedToUser,
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

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No due date";

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

export function TasksPage() {
  const { toast } = useToast();

  const [assignableUsers, setAssignableUsers] = useState<TaskUser[]>([]);
  const [myTasks, setMyTasks] = useState<TaskItem[]>([]);
  const [selectedUserTasks, setSelectedUserTasks] = useState<TaskItem[]>([]);
  const [taskSummary, setTaskSummary] = useState<TaskDashboardSummary | null>(null);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [statusDrafts, setStatusDrafts] = useState<Record<string, TaskStatus>>({});

  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMyTasks, setIsLoadingMyTasks] = useState(false);
  const [isLoadingSelectedUserTasks, setIsLoadingSelectedUserTasks] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "medium" as TaskPriority,
    due_date: "",
  });

  const loadAssignableUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const users = await getAssignableActiveUsers();
      setAssignableUsers(users);

      const firstUserId = users[0]?.id || "";
      setSelectedUserId((prev) => (users.some((user) => user.id === prev) ? prev : firstUserId));
      setFormData((prev) => ({
        ...prev,
        assigned_to: users.some((user) => user.id === prev.assigned_to) ? prev.assigned_to : firstUserId,
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load assignable users",
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

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
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
      });

      toast({
        title: "Task Created",
        description: "Task assigned successfully.",
      });

      setFormData((prev) => ({
        ...prev,
        title: "",
        description: "",
        due_date: "",
      }));

      await Promise.all([
        loadMyTasks(),
        loadSummary(),
        selectedUserId ? loadSelectedUserTasks(selectedUserId) : Promise.resolve(),
      ]);
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

      await Promise.all([
        loadMyTasks(),
        loadSummary(),
        selectedUserId ? loadSelectedUserTasks(selectedUserId) : Promise.resolve(),
      ]);
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

  return (
    <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        <Card className="border border-amber-100 bg-amber-50">
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

        <Card className="border border-blue-100 bg-blue-50">
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

        <Card className="border border-emerald-100 bg-emerald-50">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Assign New Task</CardTitle>
            <CardDescription className="text-xs text-gray-600">
              Title, assigned user, and priority are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due Date (optional)</Label>
              <Input
                id="task-due-date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, due_date: e.target.value }))}
              />
            </div>

            <Button onClick={handleCreateTask} disabled={isCreatingTask || isLoadingUsers}>
              <Plus className="mr-2 h-4 w-4" />
              {isCreatingTask ? "Assigning..." : "Assign Task"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Tasks By User</CardTitle>
            <CardDescription className="text-xs text-gray-600">
              View tasks assigned to a specific user (newest first).
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
                      <TableHead>Created</TableHead>
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
                        <TableCell className="text-xs text-gray-500">{formatDateTime(task.created_at)}</TableCell>
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

      <Card className="mt-4 border border-gray-200 bg-white">
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
    </main>
  );
}
