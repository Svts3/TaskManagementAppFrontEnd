import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Workspace from "../Workspace/Workspace";
import "./UserWorkspaces.css";
import { useState } from "react";

export default function UserWorkspaces() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [createError, setCreateError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const accessToken = localStorage.getItem("accessToken");

  const { data: workspaces = [], isLoading, error } = useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:8080/workspaces/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Ensure we always return an array
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!accessToken,
  });

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);
    try {
      await axios.post(
        "http://localhost:8080/workspaces/",
        { name: workspaceName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          withCredentials: true,
        }
      );
      setIsModalOpen(false);
      setWorkspaceName("");
      queryClient.invalidateQueries(["userWorkspaces"]);
    } catch (err) {
      setCreateError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create workspace"
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (!accessToken) {
    return (
      <div className="user-workspaces-error">
        You are not logged in. Please sign in to view your workspaces.
      </div>
    );
  }

  return (
    <div className="user-workspaces">
      <h1 className="title">Your Workspaces</h1>
      <button
        className="create-workspace-btn"
        onClick={() => setIsModalOpen(true)}
      >
        + Create Workspace
      </button>
      {error && <p className="error-message">Error: {error.message}</p>}
      {isLoading && <p className="loading-message">Loading...</p>}
      <div className="workspaces-list">
        {Array.isArray(workspaces) &&
          workspaces.map((workspace) => (
            <Workspace
              key={workspace.id}
              id={workspace.id}
              name={workspace.name}
              number_of_members={workspace.members?.length}
              creator={
                workspace?.creator?.firstName + " " + workspace?.creator?.lastName
              }
            />
          ))}
        {!isLoading &&
          Array.isArray(workspaces) &&
          workspaces.length === 0 && (
            <p className="no-workspaces">You don't have any workspaces yet.</p>
          )}
      </div>
      {isModalOpen && (
        <div className="modal" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Create Workspace</h2>
            <form onSubmit={handleCreateWorkspace}>
              <input
                type="text"
                placeholder="Workspace Name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
                className="input"
              />
              <div className="modal-actions">
                <button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
              {createError && (
                <div className="error-message">{createError}</div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
