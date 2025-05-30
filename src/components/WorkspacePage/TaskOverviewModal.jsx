import PropTypes from 'prop-types';

export default function TaskOverviewModal({ task, isOpen, onClose, isLoading = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content task-overview" onClick={e => e.stopPropagation()}>
        {isLoading ? (
          <div className="task-overview-loading">
            <div className="loading-spinner"></div>
            <p>Loading task details...</p>
          </div>
        ) : (
          <>
            <div className="task-overview-header">
              <h2>{task.title}</h2>
              <button type="button" className="close-button" onClick={onClose}>×</button>
            </div>
            
            <div className="task-overview-content">
              <div className="task-overview-section">
                <h3>Description</h3>
                <p>{task.content || "No description provided."}</p>
              </div>

              <div className="task-overview-section">
                <h3>Status</h3>
                <span className={`task-status ${task.status.toLowerCase()}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <div className="task-overview-section">
                <h3>Dates</h3>
                <p><strong>Created:</strong> {new Date(task.creationDate).toLocaleDateString()}</p>
                <p>
                  <strong>Deadline:</strong> {task.deadlineDate ? (
                    <span className={new Date(task.deadlineDate) < new Date() && task.status !== "DONE" ? "overdue" : ""}>
                      {new Date(task.deadlineDate).toLocaleDateString()}
                      {new Date(task.deadlineDate) < new Date() && task.status !== "DONE" && " (Overdue)"}
                    </span>
                  ) : "No deadline"}
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
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};
