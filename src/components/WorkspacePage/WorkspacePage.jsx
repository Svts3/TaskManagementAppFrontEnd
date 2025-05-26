import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import "./WorkspacePage.css";

export default function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    content: "",
    deadlineDate: "",
    status: "TO_DO",
    performers: [],
  });
  const [inviteForm, setInviteForm] = useState({ email: "" });
  const [roleForm, setRoleForm] = useState({ role: "MEMBER" });
  const [dropdownTaskId, setDropdownTaskId] = useState(null);
  const [taskFormError, setTaskFormError] = useState("");

  // Log navigation changes for debugging
  useEffect(() => {
    console.log("Current URL:", window.location.pathname);
    return () => {
      console.log("Navigating away from WorkspacePage");
    };
  }, [navigate]);

  // Log modal state changes
  useEffect(() => {
    console.log("Task modal open:", isTaskModalOpen);
  }, [isTaskModalOpen]);

  // Log decoded token on component mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const decodedToken = decodeJwt(token);
    console.log("Decoded token on mount:", decodedToken);
  }, []);

  // Fetch workspace data
  const {
    data: workspaceData,
    isLoading: isWorkspaceLoading,
    error: workspaceError,
  } = useQuery({
    queryKey: ["workspace", id],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:8080/workspaces/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      console.log("Workspace data:", response.data);
      return response.data;
    },
  });

  // Fetch tasks
  const {
    data: tasks,
    isLoading: isTasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:8080/tasks/workspace/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      return response.data;
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (task) => {
      console.log("Creating task with data:", task);
      const response = await axios.post(`http://localhost:8080/tasks/`, task, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks", id]);
      setIsTaskModalOpen(false);
      setTaskForm({ title: "", content: "", deadlineDate: "", status: "TO_DO", performers: [] });
      setTaskFormError("");
    },
    onError: (error) => {
      console.error("Error creating task:", error.response?.data || error.message);
      setTaskFormError("Failed to create task. Please check the input and try again.");
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (task) => {
      const response = await axios.put(`http://localhost:8080/tasks/${task.id}`, task, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks", id]);
      setIsTaskModalOpen(false);
      setEditingTask(null);
      setTaskForm({ title: "", content: "", deadlineDate: "", status: "TO_DO", performers: [] });
      setTaskFormError("");
    },
    onError: (error) => {
      console.error("Error updating task:", error.response?.data || error.message);
      setTaskFormError("Failed to update task. Please check the input and try again.");
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      await axios.delete(`http://localhost:8080/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks", id]);
    },
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: async ({ email }) => {
      const response = await axios.post(
        `http://localhost:8080/workspaces/${id}/invite`,
        { email },
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workspace", id]);
      setIsInviteModalOpen(false);
      setInviteForm({ email: "" });
    },
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }) => {
      const response = await axios.put(
        `http://localhost:8080/workspaces/${id}/users/${memberId}/permissions`,
        [role],
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workspace", id]);
      setIsRoleModalOpen(false);
      setRoleForm({ role: "MEMBER" });
      setSelectedMember(null);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId) => {
      await axios.delete(`http://localhost:8080/workspaces/${id}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workspace", id]);
    },
  });

  const decodeJwt = (token) => {
    try {
      if (!token) {
        console.log("No token found in localStorage");
        return null;
      }
      console.log("Raw token:", token); // Log raw token
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      const parsed = JSON.parse(decoded);
      console.log("Parsed token payload:", parsed); // Log parsed payload
      return parsed;
    } catch (e) {
      console.error("Error decoding JWT:", e.message);
      return null;
    }
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    // Optional: Require at least one performer for new tasks
    if (taskForm.performers.length === 0 && !editingTask) {
      setTaskFormError("Please select at least one performer.");
      return;
    }
    const token = localStorage.getItem("accessToken");
    const decodedToken = decodeJwt(token);
    const userId = Number(decodedToken?.id);
    
    if (!userId && !editingTask) {
      setTaskFormError("Unable to create task: User ID not found in token.");
      return;
    }

    const taskData = {
      ...taskForm,
      workspace: {id: Number(id)},
      performers: taskForm.performers.map((p) => ({"id":p.id})), // Ensure IDs are strings
      creator: editingTask ? taskForm.creator : { id: userId }, // Use existing creator for edit, new creator for create
    };
    console.log("Task data being sent:", taskData);
    if (editingTask) {
      updateTaskMutation.mutate({ ...taskData, id: editingTask.id });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    const token = localStorage.getItem("accessToken");
    const decodedToken = decodeJwt(token);
    console.log("DEcoded", decodedToken);
    const userId = Number(decodedToken?.id);

    setTaskForm({
      title: task.title,
      content: task.content,
      deadlineDate: task.deadlineDate || null,
      status: task.status,
      performers: task?.performers?.map((i) => ({ id: i.id })) || [],
      creator: { id: userId },
    });
    setIsTaskModalOpen(true);
    setDropdownTaskId(null);
    setTaskFormError("");
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
      setDropdownTaskId(null);
    }
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    inviteUserMutation.mutate(inviteForm);
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    assignRoleMutation.mutate({ memberId: selectedMember.id, role: roleForm.role });
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm("Are you sure you want to remove this member from the workspace?")) {
      removeMemberMutation.mutate(memberId);
    }
  };

  const toggleDropdown = (taskId) => {
    setDropdownTaskId(dropdownTaskId === taskId ? null : taskId);
  };

  if (isWorkspaceLoading || isTasksLoading) {
    return <div className="loading-message">Loading...</div>;
  }

  if (workspaceError || tasksError) {
    return (
      <div className="error-message">
        Error: {workspaceError?.message || tasksError?.message}
      </div>
    );
  }

  const { name, creationDate, lastModifiedDate, creator, members } = workspaceData;

  // Log members for debugging
  console.log("Members available:", members);

  return (
    <div className="workspace-page">
      <div className="workspace-header">
        <a href="/workspaces">
          <button className="back-button">Go to Workspaces</button>
        </a>
        <h1 className="workspace-title">{name}</h1>
      </div>
      <div className="workspace-content">
        <div className="tasks-section">
  <div className="tasks-header">
    <h2>Tasks ({tasks?.length || 0})</h2>
    <button
      className="create-task-button"
      onClick={() => setIsTaskModalOpen(true)}
    >
      Create Task
    </button>
  </div>
  {tasks?.length > 0 ? (
    <div className="tasks-board">
      {/* To Do Column */}
      <div className="task-column">
        <h3 className="column-title">To Do</h3>
        <ul className="tasks-list">
          {tasks
            .filter((task) => task.status === "TO_DO")
            .map((task) => {
              const isOverdue =
                task.deadlineDate &&
                new Date(task.deadlineDate) < new Date() &&
                task.status !== "DONE";
              return (
                <li key={task.id} className="task-card">
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <div className="task-actions">
                      <button
                        className="actions-button"
                        onClick={() => toggleDropdown(task.id)}
                      >
                        Actions
                      </button>
                      {dropdownTaskId === task.id && (
                        <ul className="actions-dropdown">
                          <li>
                            <button
                              className="edit-task-button"
                              onClick={() => handleEditTask(task)}
                            >
                              Edit Task
                            </button>
                          </li>
                          <li>
                            <button
                              className="delete-task-button"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              Delete Task
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                  <p className="task-content">{task.content || "No description"}</p>
                  <p>
                    <strong>Created by:</strong> {task.creator?.firstName}{" "}
                    {task.creator?.lastName}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(task.creationDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Deadline:</strong>{" "}
                    {task.deadlineDate
                      ? new Date(task.deadlineDate).toLocaleDateString()
                      : "No deadline"}
                    {isOverdue && <span className="overdue"> (Overdue)</span>}
                  </p>
                  <p>
                    <strong>Performers:</strong>{" "}
                    {task.performers?.length > 0
                      ? task.performers
                          .map((p) => `${p.firstName} ${p.lastName}`)
                          .join(", ")
                      : "None"}
                  </p>
                </li>
              );
            })}
          {tasks.filter((task) => task.status === "TO_DO").length === 0 && (
            <p className="no-tasks">No tasks in this status.</p>
          )}
        </ul>
      </div>

      {/* In Progress Column */}
      <div className="task-column">
        <h3 className="column-title">In Progress</h3>
        <ul className="tasks-list">
          {tasks
            .filter((task) => task.status === "IN_PROGRESS")
            .map((task) => {
              const isOverdue =
                task.deadlineDate &&
                new Date(task.deadlineDate) < new Date() &&
                task.status !== "DONE";
              return (
                <li key={task.id} className="task-card">
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <div className="task-actions">
                      <button
                        className="actions-button"
                        onClick={() => toggleDropdown(task.id)}
                      >
                        Actions
                      </button>
                      {dropdownTaskId === task.id && (
                        <ul className="actions-dropdown">
                          <li>
                            <button
                              className="edit-task-button"
                              onClick={() => handleEditTask(task)}
                            >
                              Edit Task
                            </button>
                          </li>
                          <li>
                            <button
                              className="delete-task-button"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              Delete Task
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                  <p className="task-content">{task.content || "No description"}</p>
                  <p>
                    <strong>Created by:</strong> {task.creator?.firstName}{" "}
                    {task.creator?.lastName}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(task.creationDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Deadline:</strong>{" "}
                    {task.deadlineDate
                      ? new Date(task.deadlineDate).toLocaleDateString()
                      : "No deadline"}
                    {isOverdue && <span className="overdue"> (Overdue)</span>}
                  </p>
                  <p>
                    <strong>Performers:</strong>{" "}
                    {task.performers?.length > 0
                      ? task.performers
                          .map((p) => `${p.firstName} ${p.lastName}`)
                          .join(", ")
                      : "None"}
                  </p>
                </li>
              );
            })}
          {tasks.filter((task) => task.status === "IN_PROGRESS").length === 0 && (
            <p className="no-tasks">No tasks in this status.</p>
          )}
        </ul>
      </div>

      {/* Done Column */}
      <div className="task-column">
        <h3 className="column-title">Done</h3>
        <ul className="tasks-list">
          {tasks
            .filter((task) => task.status === "DONE")
            .map((task) => {
              const isOverdue =
                task.deadlineDate &&
                new Date(task.deadlineDate) < new Date() &&
                task.status !== "DONE";
              return (
                <li key={task.id} className="task-card">
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <div className="task-actions">
                      <button
                        className="actions-button"
                        onClick={() => toggleDropdown(task.id)}
                      >
                        Actions
                      </button>
                      {dropdownTaskId === task.id && (
                        <ul className="actions-dropdown">
                          <li>
                            <button
                              className="edit-task-button"
                              onClick={() => handleEditTask(task)}
                            >
                              Edit Task
                            </button>
                          </li>
                          <li>
                            <button
                              className="delete-task-button"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              Delete Task
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                  <p className="task-content">{task.content || "No description"}</p>
                  <p>
                    <strong>Created by:</strong> {task.creator?.firstName}{" "}
                    {task.creator?.lastName}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(task.creationDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Deadline:</strong>{" "}
                    {task.deadlineDate
                      ? new Date(task.deadlineDate).toLocaleDateString()
                      : "No deadline"}
                    {isOverdue && <span className="overdue"> (Overdue)</span>}
                  </p>
                  <p>
                    <strong>Performers:</strong>{" "}
                    {task.performers?.length > 0
                      ? task.performers
                          .map((p) => `${p.firstName} ${p.lastName}`)
                          .join(", ")
                      : "None"}
                  </p>
                </li>
              );
            })}
          {tasks.filter((task) => task.status === "DONE").length === 0 && (
            <p className="no-tasks">No tasks in this status.</p>
          )}
        </ul>
      </div>
    </div>
  ) : (
    <p className="no-tasks">No tasks available.</p>
  )}
</div>
        <div className="sidebar">
          <div className="workspace-info">
            <h3>Workspace Info</h3>
            <p>
              <strong>Created by:</strong> {creator?.firstName}{" "}
              {creator?.lastName}
            </p>
            <p>
              <strong>Creation Date:</strong>{" "}
              {new Date(creationDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Last Modified:</strong>{" "}
              {new Date(lastModifiedDate).toLocaleDateString()}
            </p>
          </div>
          <div className="members-section">
            <div className="members-header">
              <h3>Members ({members?.length || 0})</h3>
              <button
                className="invite-user-button"
                onClick={() => setIsInviteModalOpen(true)}
              >
                Invite User
              </button>
            </div>
            <ul className="members-list">
              {members?.map((member) => (
                <li key={member.id} className="member-item">
                  {member.firstName} {member.lastName} ({member.email})
                  <div className="member-actions">
                    <button
                      className="assign-role-button"
                      onClick={() => {
                        setSelectedMember(member);
                        setIsRoleModalOpen(true);
                      }}
                    >
                      Assign Role
                    </button>
                    <button
                      className="remove-member-button"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div
          className="modal"
          onClick={(e) => {
            console.log("Modal overlay clicked");
            setIsTaskModalOpen(false);
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Modal content clicked");
            }}
          >
            <h2>{editingTask ? "Edit Task" : "Create Task"}</h2>
            {taskFormError && <p className="error-message">{taskFormError}</p>}
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={taskForm.content}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, content: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={taskForm.deadlineDate}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, deadlineDate: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, status: e.target.value })
                  }
                >
                  <option value="TO_DO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label>Performers</label>
                {members?.length > 0 ? (
                  <select
                    multiple
                    value={taskForm.performers.map((p) => String(p.id))} // Ensure string IDs
                    onChange={(e) => {
                      const selectedIds = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                      const selectedPerformers = members.filter((m) => selectedIds.includes(String(m.id)));
                      console.log("Selected performers:", selectedPerformers);
                      setTaskForm({ ...taskForm, performers: selectedPerformers });
                      setTaskFormError("");
                    }}
                  >
                    {members.map((member) => (
                      <option key={member.id} value={String(member.id)}>
                        {member.firstName} {member.lastName} ({member.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p>No members available to assign.</p>
                )}
                <p className="selected-performers">
                  <strong>Selected Performers:</strong>{" "}
                  {taskForm.performers.length > 0
                    ? taskForm.performers
                        .map((p) => `${p.firstName} ${p.lastName}`)
                        .join(", ")
                    : "None"}
                </p>
              </div>
              <div className="modal-actions">
                <button type="submit">
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTaskModalOpen(false);
                    setEditingTask(null);
                    setTaskForm({
                      title: "",
                      content: "",
                      deadlineDate: "",
                      status: "TO_DO",
                      performers: [],
                    });
                    setTaskFormError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <div
          className="modal"
          onClick={() => setIsInviteModalOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Invite User</h2>
            <form onSubmit={handleInviteSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Send Invite</button>
                <button
                  type="button"
                  onClick={() => {
                    setIsInviteModalOpen(false);
                    setInviteForm({ email: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {isRoleModalOpen && (
        <div
          className="modal"
          onClick={() => setIsRoleModalOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Assign Role to {selectedMember?.firstName} {selectedMember?.lastName}</h2>
            <form onSubmit={handleRoleSubmit}>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={roleForm.role}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, role: e.target.value })
                  }
                >
                  <option value="READ">Read</option>
                  <option value="CREATE">Create</option>
                  <option value="WRITE">Write</option>
                  <option value="DELETE">Delete</option>
                  <option value="ADMIN">Admin</option>

                  
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit">Assign Role</button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRoleModalOpen(false);
                    setSelectedMember(null);
                    setRoleForm({ role: "MEMBER" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}