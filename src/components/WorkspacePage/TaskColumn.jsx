import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TaskOverviewModal from './TaskOverviewModal';
import './TaskOverviewModal.css';

export default function TaskColumn({ title, tasks, onEditTask, onDeleteTask, dropdownTaskId, toggleDropdown }) {
  const [selectedTask, setSelectedTask] = useState(null);

  // Ensure selectedTask is always up-to-date with the latest tasks data
  useEffect(() => {
    if (!selectedTask) return;
    const updated = tasks.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
  }, [tasks, selectedTask]);

  function truncateText(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

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

  return (
    <div className="task-column">
      <h3 className="column-title">{title}</h3>
      <ul className="tasks-list">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const isOverdue =
              task.deadlineDate &&
              new Date(task.deadlineDate) < new Date() &&
              task.status !== "DONE";
            return (
              <li key={task.id} className="task-card">
                <div className="task-header">
                  <h3 className="truncate-title">{truncateText(task.title, 20)}</h3>
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
                            onClick={() => onEditTask(task)}
                          >
                            Edit Task
                          </button>
                        </li>
                        <li>
                          <button
                            className="delete-task-button"
                            onClick={() => onDeleteTask(task.id)}
                          >
                            Delete Task
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
                <div className="task-content truncate-description" style={{ whiteSpace: "pre-line" }}>
                  {truncateText(task.content, 65) || "No description"}
                </div>
                <div className="task-performers" style={{ margin: "6px 0" }}>
                  <strong>Performers:</strong>{" "}
                  {task.performers && task.performers.length > 0
                    ? task.performers.map((p, idx) =>
                        <span key={p.id}>
                          {p.firstName} {p.lastName}{idx < task.performers.length - 1 ? ', ' : ''}
                        </span>
                      )
                    : <span>No performers</span>
                  }
                </div>
                <div className="task-deadline" style={{ margin: "6px 0" }}>
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
                </div>
                <p>
                  <strong>Created by:</strong> {task.creator?.firstName} {task.creator?.lastName}
                </p>
                <div className="task-preview-footer">
                  <button
                    className="overview-button"
                    onClick={() => setSelectedTask(task)}
                  >
                    View Details
                  </button>
                  {isOverdue && <span className="overdue">Overdue</span>}
                </div>
              </li>
            );
          })
        ) : (
          <p className="no-tasks">No tasks in this status.</p>
        )}
      </ul>
      <TaskOverviewModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onEditTask={onEditTask}
        onDeleteTask={id => {
          onDeleteTask(id);
          setSelectedTask(null); // Close modal after delete
        }}
      />
    </div>
  );
}

TaskColumn.propTypes = {
  title: PropTypes.string.isRequired,
  tasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    status: PropTypes.string.isRequired,
    creationDate: PropTypes.string.isRequired,
    deadlineDate: PropTypes.string,
    creator: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      id: PropTypes.number
    }),
    performers: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      firstName: PropTypes.string,
      lastName: PropTypes.string
    }))
  })).isRequired,
  onEditTask: PropTypes.func.isRequired,
  onDeleteTask: PropTypes.func.isRequired,
  dropdownTaskId: PropTypes.number,
  toggleDropdown: PropTypes.func.isRequired
};
