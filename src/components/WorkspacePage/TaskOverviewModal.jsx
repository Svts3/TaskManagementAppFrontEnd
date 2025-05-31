import PropTypes from 'prop-types';

function getTimeLeftString(deadlineDate, status) {
  if (!deadlineDate) return "";
  if (status === "DONE") return "";
  const now = new Date();
  const deadline = new Date(deadlineDate);
  let diff = deadline - now;
  if (diff <= 0) return "Time's up";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diff / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export default function TaskOverviewModal({ task, isOpen, onClose, isLoading = false, onEditTask, onDeleteTask }) {
  if (!isOpen || !task) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="task-overview-modal-content"
        onClick={e => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="task-overview-loading">
            <div className="loading-spinner"></div>
            <p>Loading task details...</p>
          </div>
        ) : (
          <>
            <div className="task-overview-header">
              <h2 style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>{task.title}</h2>
              <button type="button" className="close-button" onClick={onClose}>×</button>
            </div>
            <div className="task-overview-content">
              <div className="task-overview-section">
                <h3>Description</h3>
                <p style={{ whiteSpace: "pre-line", wordBreak: "break-word", overflowWrap: "break-word" }}>
                  {task.content || "No description provided."}
                </p>
              </div>

              <div className="task-overview-section">
                <h3>Status</h3>
                <span
                  className={`task-status ${
                    ["TO_DO", "IN_PROGRESS", "DONE"].includes(task.status)
                      ? task.status.toLowerCase()
                      : "custom-status"
                  }`}
                  style={
                    ["TO_DO", "IN_PROGRESS", "DONE"].includes(task.status)
                      ? {}
                      : { background: '#888', color: '#fff', fontWeight: 500 }
                  }
                >
                  {task.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="task-overview-section">
                <h3>Dates</h3>
                <p><strong>Created:</strong> {new Date(task.creationDate).toLocaleDateString()}</p>
                <p style={{ marginTop: "12px" }}>
                  <strong>Deadline:</strong>{" "}
                  {task.deadlineDate
                    ? (
                        <>
                          <span className={new Date(task.deadlineDate) < new Date() && task.status !== "DONE" ? "overdue" : ""}>
                            {new Date(task.deadlineDate).toLocaleString()}
                            {new Date(task.deadlineDate) < new Date() && task.status !== "DONE" && " (Overdue)"}
                          </span>
                          <span style={{ marginLeft: 8, color: "#888", fontSize: "0.95em" }}>
                            {getTimeLeftString(task.deadlineDate, task.status)}
                          </span>
                        </>
                      )
                    : "No deadline"}
                </p>
              </div>

              <div className="task-overview-section">
                <h3>People</h3>
                <p><strong>Creator:</strong> {task.creator?.firstName} {task.creator?.lastName}</p>
                <p><strong>Performers:</strong></p>
                {task.performers?.length > 0 ? (
                  <ul className="performers-list">
                    {task.performers.map(performer => (
                      <li key={performer.id}>{performer.firstName} {performer.lastName}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No performers assigned</p>
                )}
              </div>
            </div>
            <div className="task-overview-actions" style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
              <button
                className="edit-task-button"
                onClick={() => onEditTask && onEditTask(task)}
                style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer" }}
              >
                Edit Task
              </button>
              <button
                className="delete-task-button"
                onClick={() => onDeleteTask && onDeleteTask(task.id)}
                style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer" }}
              >
                Delete Task
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

TaskOverviewModal.propTypes = {
  task: PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    status: PropTypes.string.isRequired,
    creationDate: PropTypes.string.isRequired,
    deadlineDate: PropTypes.string,
    creator: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
    performers: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
    })),
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  onEditTask: PropTypes.func,
  onDeleteTask: PropTypes.func,
};
