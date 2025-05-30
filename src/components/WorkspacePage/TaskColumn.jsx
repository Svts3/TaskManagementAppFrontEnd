import { useState } from 'react';
import PropTypes from 'prop-types';
import TaskOverviewModal from './TaskOverviewModal';
import './TaskOverviewModal.css';

export default function TaskColumn({ title, tasks, onEditTask, onDeleteTask, dropdownTaskId, toggleDropdown }) {
  const [selectedTask, setSelectedTask] = useState(null);

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

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
                  <h3>{truncateText(task.title, 50)}</h3>
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
                <p className="task-content">{truncateText(task.content, 150) || "No description"}</p>
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
