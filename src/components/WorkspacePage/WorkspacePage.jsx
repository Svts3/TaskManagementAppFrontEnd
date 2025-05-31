import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axiosInstance";
import { useState, useEffect } from "react";
import "./WorkspacePage.css";
import TaskBoard from "./TaskBoard";
import TaskModal from "./TaskModal";
import InviteUserModal from "./InviteUserModal";
import AssignRoleModal from "./AssignRoleModal";
import WorkspaceInfo from "./WorkspaceInfo";
import MembersPanel from "./MembersPanel";
import TaskFilters from "./TaskFilters";
import RemovePermissionsModal from "./RemovePermissionsModal";
import { decodeJwt } from "../../utils/tokenUtils";

// Reusable polling query hook
function usePollingQuery({ queryKey, url, accessToken, interval = 30000 }) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    enabled: !!accessToken,
    refetchInterval: interval,
    refetchIntervalInBackground: true,
    staleTime: 1000,
  });
}

export default function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    content: "",
    deadlineDate: "",
    deadlineTime: "",
    status: "TO_DO",
    performers: [],
  });
  const [inviteForm, setInviteForm] = useState({ emails: [] });
  const [roleForm, setRoleForm] = useState({ permissions: [] });
  const [dropdownTaskId, setDropdownTaskId] = useState(null);
  const [taskFormError, setTaskFormError] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [isRemovePermissionsModalOpen, setIsRemovePermissionsModalOpen] = useState(false);
  const [isManageStatusesOpen, setIsManageStatusesOpen] = useState(false);
  const [newStatusInput, setNewStatusInput] = useState("");

  // Task filter and sort state
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');
  const [taskSort, setTaskSort] = useState('creationDateDesc');
  const [myTasksOnly, setMyTasksOnly] = useState(false); // new state
  // Custom statuses state (persisted per workspace in localStorage)
  const [customStatuses, setCustomStatuses] = useState(() => {
    const saved = localStorage.getItem(`customStatuses_${id}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Helper: get all statuses (default + custom)
  const getAllStatuses = () => {
    const defaults = ['TO_DO', 'IN_PROGRESS', 'DONE'];
    return [...defaults, ...customStatuses.filter(s => !defaults.includes(s))];
  };

  // Add a new custom status (from TaskModal)
  const handleAddCustomStatus = (status) => {
    if (status && !getAllStatuses().includes(status)) {
      setCustomStatuses(prev => {
        const updated = [...prev, status];
        localStorage.setItem(`customStatuses_${id}`, JSON.stringify(updated));
        return updated;
      });
    }
  };
  // Remove a custom status (from TaskModal)
  const handleRemoveCustomStatus = (status) => {
    setCustomStatuses(prev => {
      const updated = prev.filter(s => s !== status);
      localStorage.setItem(`customStatuses_${id}`, JSON.stringify(updated));
      // If the current filter is the removed status, reset to ALL
      if (taskStatusFilter === status) setTaskStatusFilter('ALL');
      return updated;
    });
  };

  const accessToken = localStorage.getItem("accessToken");

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
    const decodedToken = decodeJwt(accessToken);
    console.log("Decoded token on mount:", decodedToken);
  }, [accessToken]);

  // Fetch workspace data with polling
  const {
    data: workspaceData,
    isLoading: isWorkspaceLoading,
    error: workspaceError,
  } = usePollingQuery({
    queryKey: ["workspace", id],
    url: `http://localhost:8080/workspaces/${id}`,
    accessToken,
    interval: 30000,
  });

  // Fetch tasks with polling
  const {
    data: tasks,
    isLoading: isTasksLoading,
    error: tasksError,
  } = usePollingQuery({
    queryKey: ["tasks", id],
    url: `http://localhost:8080/tasks/workspace/${id}`,
    accessToken,
    interval: 30000,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (task) => {
      console.log("Creating task with data:", task);
      const response = await api.post(`http://localhost:8080/tasks/`, task, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      return response.data;
    },
    onSuccess: (newTask) => {
      // Optimistically update the cache
      queryClient.setQueryData(["tasks", id], old => {
        const updatedTasks = [...(old || []), newTask];
        return updatedTasks;
      });
      
      setIsTaskModalOpen(false);
      setTaskForm({ title: "", content: "", deadlineDate: "", deadlineTime: "", status: "TO_DO", performers: [] });
      setTaskFormError("");
    },
    onError: (error) => {
      console.error("Error creating task:", error.response?.data || error.message);
      setTaskFormError("Failed to create task. Please check the input and try again.");
      // Revert optimistic update on error
      queryClient.invalidateQueries(["tasks", id]);
    },
  });
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (task) => {
      const response = await api.patch(`http://localhost:8080/tasks/${task.id}`, task, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}` 
        },
      });
      return response.data;
    },
    onSuccess: (updatedTask) => {
      // Optimistically update the cache
      queryClient.setQueryData(["tasks", id], old => {
        const updatedTasks = old?.map(t => 
          t.id === updatedTask.id ? updatedTask : t
        ) || [];
        return updatedTasks;
      });
      
      setIsTaskModalOpen(false);
      setEditingTask(null);
      setTaskForm({ title: "", content: "", deadlineDate: "", deadlineTime: "", status: "TO_DO", performers: [] });
      setTaskFormError("");
    },
    onError: (error) => {
      console.error("Error updating task:", error.response?.data || error.message);
      setTaskFormError(error.response?.data?.message || "Failed to update task. Please check the input and try again.");
      // Revert optimistic update on error
      queryClient.invalidateQueries(["tasks", id]);
    },
  });
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      await api.delete(`http://localhost:8080/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
    },
    onMutate: async (deletedTaskId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["tasks", id]);

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(["tasks", id]);

      // Optimistically update the cache
      queryClient.setQueryData(["tasks", id], old => old.filter(task => task.id !== deletedTaskId));

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (err, deletedTaskId, context) => {
      // If the mutation fails, roll back to the previous value
      queryClient.setQueryData(["tasks", id], context.previousTasks);
      console.error("Error deleting task:", err);
      alert("Failed to delete task. Please try again.");
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is correct
      queryClient.invalidateQueries(["tasks", id]);
    }
  });

  // Invite users mutation
  const inviteUserMutation = useMutation({
    mutationFn: async ({ emails }) => {
      const emailList = emails.filter(email => email.trim() !== '');
      const response = await api.post(
        `http://localhost:8080/workspaces/${id}/users`,
        emailList,
        { 
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}` 
          } 
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workspace", id]);
      setIsInviteModalOpen(false);
      setInviteForm({ emails: [] });
      setInviteError("");
    },
    onError: (error) => {
      console.error("Error inviting users:", error.response?.data || error.message);
      setInviteError(error.response?.data?.message || "Failed to invite users. Please try again.");
    },
  });
  // Assign permissions mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ memberId, permissions }) => {
      const response = await api.post(
        `http://localhost:8080/workspaces/${id}/users/${memberId}/permissions`,
        permissions,
        { 
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}` 
          } 
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["workspace", id]);
      setIsRoleModalOpen(false);
      setRoleForm({ permissions: [] });
      setSelectedMember(null);
      // Show success message
      alert("Permissions updated successfully");
    },
    onError: (error) => {
      console.error("Error assigning permissions:", error.response?.data || error.message);
      setRoleForm(current => ({
        ...current,
        error: error.response?.data?.message || "Failed to update permissions. Please try again."
      }));
    },
  });
  const [memberRemovalStatus, setMemberRemovalStatus] = useState({ message: '', type: '' });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await api.patch(
        `http://localhost:8080/workspaces/${id}/users/${userId}`,
        { active: false },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workspace", id]);
      setMemberRemovalStatus({ message: 'Member removed successfully', type: 'success' });
      setTimeout(() => setMemberRemovalStatus({ message: '', type: '' }), 3000);
    },
    onError: (error) => {
      console.error("Error removing member:", error.response?.data || error.message);
      setMemberRemovalStatus({ 
        message: error.response?.data?.message || 'Failed to remove member. Please try again.', 
        type: 'error' 
      });
      setTimeout(() => setMemberRemovalStatus({ message: '', type: '' }), 3000);
    },
  });

  // Remove permissions mutation
  const removePermissionsMutation = useMutation({
    mutationFn: async ({ memberId, permissions }) => {
      const response = await api.delete(
        `http://localhost:8080/workspaces/${id}/users/${memberId}/permissions`,
        { 
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          },
          data: permissions
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workspace", id]);
      setIsRemovePermissionsModalOpen(false);
      setSelectedMember(null);
      alert("Permissions removed successfully");
    },
    onError: (error) => {
      console.error("Error removing permissions:", error);
      alert("Failed to remove permissions. Please try again.");
    },
  });

  const handleTaskSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!taskForm.title?.trim()) {
      setTaskFormError("Title is required");
      return;
    }

    // Validate performers
    if (taskForm.performers.length === 0) {
      setTaskFormError("Please select at least one performer");
      return;
    }

    // Compose deadlineDate with time if both are present
    let deadlineDate = taskForm.deadlineDate;
    if (taskForm.deadlineDate && taskForm.deadlineTime) {
      deadlineDate = `${taskForm.deadlineDate.split('T')[0]}T${taskForm.deadlineTime}`;
    }

    const token = localStorage.getItem("accessToken");
    const decodedToken = decodeJwt(token);
    const userId = Number(decodedToken?.id);
    
    if (!userId && !editingTask) {
      setTaskFormError("Unable to create task: User ID not found in token");
      return;
    }    const taskData = {
      ...taskForm,
      deadlineDate: deadlineDate || null,
      id: editingTask?.id, // Include ID for updates
      workspace: { id: Number(id) },
      performers: taskForm.performers, // Keep the full performer objects
      creator: editingTask ? editingTask.creator : { id: userId }, // Preserve original creator on edit
      status: taskForm.status || "TO_DO",
      deadlineDate: taskForm.deadlineDate || null,
      content: taskForm.content || ""
    };

    console.log("Task data being sent:", taskData);
    
    if (editingTask) {
      updateTaskMutation.mutate(taskData);
    } else {
      createTaskMutation.mutate(taskData);
    }
  };
  const handleEditTask = (task) => {
    setEditingTask(task);
    const token = localStorage.getItem("accessToken");
    const decodedToken = decodeJwt(token);
    const userId = Number(decodedToken?.id);

    // Preserve all existing task data including performers
    setTaskForm({
      title: task.title || "",
      content: task.content || "",
      deadlineDate: task.deadlineDate
        ? new Date(task.deadlineDate).toISOString().slice(0, 16)
        : "",
      deadlineTime: task.deadlineDate
        ? new Date(task.deadlineDate).toISOString().slice(11, 16)
        : "",
      status: task.status || "TO_DO",
      performers: Array.isArray(task.performers) ? task.performers : [],
      creator: task.creator || { id: userId },
    });
    setIsTaskModalOpen(true);
    setDropdownTaskId(null);
    setTaskFormError("");
  };
  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        deleteTaskMutation.mutate(taskId);
        setDropdownTaskId(null);
      } catch (error) {
        console.error("Error in handleDeleteTask:", error);
      }
    }
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteForm.emails?.length) {
      setInviteError("Please enter at least one email address");
      return;
    }
    inviteUserMutation.mutate(inviteForm);
  };
  const handleRoleSubmit = (e) => {
    e.preventDefault();
    
    if (!roleForm.permissions?.length) {
      setRoleForm(current => ({
        ...current,
        error: "Please select at least one permission"
      }));
      return;
    }

    assignRoleMutation.mutate({ 
      memberId: selectedMember.id, 
      permissions: roleForm.permissions 
    });
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this member from the workspace?')) {
      removeMemberMutation.mutate(memberId);
    }
  };

  const handleRemovePermissions = (member) => {
    setSelectedMember(member);
    setIsRemovePermissionsModalOpen(true);
  };

  const toggleDropdown = (taskId) => {
    setDropdownTaskId(dropdownTaskId === taskId ? null : taskId);
  };

  // Filter and sorting functions
  const getFilteredSortedTasks = () => {
    let filtered = tasks || [];
    const userId = decodeJwt(accessToken)?.id;

    // If 'My Tasks only' is checked, filter to only tasks where user is a performer
    if (myTasksOnly && userId) {
      filtered = filtered.filter(t => Array.isArray(t.performers) && t.performers.some(p => String(p.id) === String(userId)));
    }

    // Filter by status (but skip if status is 'ALL')
    if (taskStatusFilter && taskStatusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === taskStatusFilter);
    }

    // Sorting
    const priorityMap = { HIGH: 3, MEDIUM: 2, LOW: 1, '': 0 };
    return filtered.slice().sort((a, b) => {
      switch (taskSort) {
        case 'creationDateAsc':
          return new Date(a.creationDate) - new Date(b.creationDate);
        case 'creationDateDesc':
          return new Date(b.creationDate) - new Date(a.creationDate);
        case 'deadlineDateAsc': {
          const aDate = a.deadlineDate ? new Date(a.deadlineDate) : new Date('9999-12-31');
          const bDate = b.deadlineDate ? new Date(b.deadlineDate) : new Date('9999-12-31');
          return aDate - bDate;
        }
        case 'deadlineDateDesc': {
          const aDate = a.deadlineDate ? new Date(a.deadlineDate) : new Date('9999-12-31');
          const bDate = b.deadlineDate ? new Date(b.deadlineDate) : new Date('9999-12-31');
          return bDate - aDate;
        }
        case 'titleAsc':
          return (a.title || '').localeCompare(b.title || '');
        case 'titleDesc':
          return (b.title || '').localeCompare(a.title || '');
        case 'priorityDesc':
          return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
        case 'priorityAsc':
          return (priorityMap[a.priority] || 0) - (priorityMap[b.priority] || 0);
        default:
          return 0;
      }
    });
  };

  const getTaskColumns = () => {
    const filtered = getFilteredSortedTasks();
    if (taskStatusFilter === 'ALL') {
      const allStatuses = getAllStatuses();
      const columns = {};
      allStatuses.forEach(status => {
        columns[status] = filtered.filter(t => t.status === status);
      });
      return columns;
    } else {
      return {
        [taskStatusFilter]: filtered,
      };
    }
  };

  if (!accessToken) {
    return <div className="workspace-page-error">You are not logged in. Please sign in to view this workspace.</div>;
  }

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

  return (
    <div className="workspace-page">
      <div className="workspace-nav" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <a href="/workspaces">
          <button className="nav-button">Go to Workspaces</button>
        </a>
        <h1 className="workspace-title">{name}</h1>
        <TaskFilters 
          statusFilter={taskStatusFilter}
          setStatusFilter={setTaskStatusFilter}
          sortBy={taskSort}
          setSortBy={setTaskSort}
          customStatuses={customStatuses}
          myTasksOnly={myTasksOnly}
          setMyTasksOnly={setMyTasksOnly}
          renderAfterStatusFilter={() => (
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <button
                type="button"
                className="manage-status-btn"
                style={{ background: '#2563eb', border: 'none', borderRadius: '50%', padding: 4, margin: '0 4px', cursor: 'pointer', fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 1px 4px rgba(37,99,235,0.08)' }}
                onClick={e => {
                  e.stopPropagation();
                  setIsManageStatusesOpen(v => !v);
                }}
                tabIndex={0}
                id="manage-statuses-btn"
                aria-label="Manage statuses"
                title="Manage statuses"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="9" width="12" height="2" rx="1" fill="white"/>
                  <rect x="9" y="4" width="2" height="12" rx="1" fill="white"/>
                </svg>
              </button>
              {isManageStatusesOpen && (
                <div
                  className="custom-status-manager-modal"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 'calc(100% + 6px)',
                    zIndex: 20,
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    padding: 16,
                    minWidth: 260,
                    marginLeft: 0
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, marginBottom: 8 }}>
                    <span>Manage Statuses</span>
                    <button type="button" onClick={() => setIsManageStatusesOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer', lineHeight: 1, padding: 0 }} aria-label="Close">×</button>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <input
                      type="text"
                      placeholder="Add custom status"
                      value={newStatusInput}
                      onChange={e => setNewStatusInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newStatusInput.trim()) {
                          const val = newStatusInput.trim();
                          if (!getAllStatuses().includes(val)) {
                            handleAddCustomStatus(val);
                          }
                        }
                      }}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newStatusInput.trim();
                        if (val && !getAllStatuses().includes(val)) {
                          handleAddCustomStatus(val);
                        }
                      }}
                      style={{ padding: '6px 12px' }}
                      disabled={!newStatusInput.trim() || getAllStatuses().includes(newStatusInput.trim())}
                    >Add</button>
                  </div>
                  {customStatuses.length > 0 ? (
                    <div className="custom-status-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {customStatuses.map(status => (
                        <span key={status} style={{ display: 'flex', alignItems: 'center', background: '#f1f1f1', borderRadius: 12, padding: '4px 10px', fontSize: 13 }}>
                          {status}
                          <button
                            type="button"
                            title="Remove status"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete the status '${status}'?`)) {
                                handleRemoveCustomStatus(status);
                              }
                            }}
                            style={{ marginLeft: 6, background: 'none', border: 'none', color: '#dc3545', fontWeight: 'bold', cursor: 'pointer', fontSize: 15 }}
                            aria-label={`Remove status ${status}`}
                          >×</button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#888', fontSize: 13 }}>No custom statuses yet.</div>
                  )}
                </div>
              )}
            </span>
          )}
        />
        <button
          className={`nav-button${activeTab === 'workspace-info' ? ' active' : ''}`}
          onClick={() => setActiveTab(activeTab === 'workspace-info' ? null : 'workspace-info')}
        >
          Info
        </button>
        <button
          className={`nav-button${activeTab === 'members' ? ' active' : ''}`}
          onClick={() => setActiveTab(activeTab === 'members' ? null : 'members')}
        >
          Members
        </button>
      </div>

      <div className="workspace-content">
        <div className="workspace-overlays">
          {activeTab === 'workspace-info' && (
            <div className="dropdown-content overlay-dropdown">
              <WorkspaceInfo 
                creator={creator}
                creationDate={creationDate}
                lastModifiedDate={lastModifiedDate}
                workspaceId={id}
              />
            </div>
          )}
          {activeTab === 'members' && (
            <div className="dropdown-content overlay-dropdown">
              <MembersPanel
                members={members}
                onInvite={() => setIsInviteModalOpen(true)}
                onAssignRole={(member) => {
                  setSelectedMember(member);
                  setIsRoleModalOpen(true);
                }}
                onRemoveMember={handleRemoveMember}
                onRemovePermissions={handleRemovePermissions}
              />
            </div>
          )}
        </div>

        <div className="tasks-section">
          <div className="tasks-content">
            <div className="tasks-header-top">
              <h2>Tasks ({getFilteredSortedTasks()?.length || 0})</h2>
              <button
                className="create-task-button"
                onClick={() => {
                  setIsTaskModalOpen(true);
                  setEditingTask(null);
                  setTaskForm({ title: "", content: "", deadlineDate: "", deadlineTime: "", status: "TO_DO", performers: [] });
                }}
              >
                Create Task
              </button>
            </div>
            <div className="tasks-board-container">
              {Object.values(getTaskColumns()).some(col => col.length > 0) ? (
                <TaskBoard
                  tasksByStatus={getTaskColumns()}
                  members={members}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  dropdownTaskId={dropdownTaskId}
                  toggleDropdown={toggleDropdown}
                />
              ) : (
                <p className="no-tasks">No tasks available for this filter.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setTaskForm({ title: "", content: "", deadlineDate: "", deadlineTime: "", status: "TO_DO", performers: [] });
          setTaskFormError("");
        }}
        onSubmit={handleTaskSubmit}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        taskFormError={taskFormError}
        members={members}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
        setTaskFormError={setTaskFormError}
        customStatuses={customStatuses}
        addCustomStatus={handleAddCustomStatus}
        removeCustomStatus={handleRemoveCustomStatus}
        renderLogo={() => (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <svg width="40" height="40" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="9" width="12" height="2" rx="1" fill="#2563eb"/>
              <rect x="9" y="4" width="2" height="12" rx="1" fill="#2563eb"/>
            </svg>
          </div>
        )}
      />
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInviteSubmit}
        inviteForm={inviteForm}
        setInviteForm={setInviteForm}
        inviteError={inviteError}
      />
      <AssignRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSubmit={handleRoleSubmit}
        roleForm={roleForm}
        setRoleForm={setRoleForm}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
      />
      <RemovePermissionsModal
        isOpen={isRemovePermissionsModalOpen}
        onClose={() => setIsRemovePermissionsModalOpen(false)}
        onSubmit={removePermissionsMutation.mutate}
        member={selectedMember}
        workspaceId={id}
      />
    </div>
  );
}