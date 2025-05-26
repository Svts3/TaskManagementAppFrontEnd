import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Workspace from "../Workspace/Workspace";
import "./UserWorkspaces.css";

export default function UserWorkspaces() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:8080/workspaces/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    },
  });

  return (
    <div className="user-workspaces">
      <h1 className="title">Your Workspaces</h1>

      {error && <p className="error-message">Error: {error.message}</p>}
      {isLoading && <p className="loading-message">Loading...</p>}

      <div className="workspaces-list">
        {data?.map((workspace) => (
          <Workspace
            key={workspace.id}
            id={workspace.id}
            name={workspace.name}
            number_of_members={workspace.members?.length}
            creator={workspace?.creator?.firstName +" "+ workspace?.creator?.lastName}
          />
        ))}
      </div>
    </div>
  );
}
