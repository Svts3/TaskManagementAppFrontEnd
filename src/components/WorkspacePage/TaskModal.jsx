import PropTypes from 'prop-types';
import './TaskModal.css';

export default function TaskModal({ isOpen, onClose, onSubmit, taskForm, setTaskForm, taskFormError, members, editingTask, setEditingTask, setTaskFormError }) {
  if (!isOpen) return null;
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{editingTask ? "Edit Task" : "Create Task"}</h2>
        {taskFormError && (
          <div className="error-message" style={{ 
            color: '#dc3545', 
            backgroundColor: '#f8d7da',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            {taskFormError}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={taskForm.content}
              onChange={e => setTaskForm({ ...taskForm, content: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>
              Deadline Date:
              <input
                type="date"
                value={taskForm.deadlineDate ? taskForm.deadlineDate.split('T')[0] : ""}
                onChange={e => setTaskForm(form => ({
                  ...form,
                  deadlineDate: e.target.value
                    ? (form.deadlineTime
                        ? `${e.target.value}T${form.deadlineTime}`
                        : `${e.target.value}T23:59`)
                    : ""
                }))}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Deadline Time:
              <input
                type="time"
                value={taskForm.deadlineDate && taskForm.deadlineDate.includes('T')
                  ? taskForm.deadlineDate.split('T')[1].slice(0,5)
                  : (taskForm.deadlineTime || "")}
                onChange={e => setTaskForm(form => {
                  const date = form.deadlineDate
                    ? form.deadlineDate.split('T')[0]
                    : "";
                  return {
                    ...form,
                    deadlineTime: e.target.value,
                    deadlineDate: date
                      ? `${date}T${e.target.value}`
                      : ""
                  };
                })}
              />
            </label>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={taskForm.status}
              onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
            >
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div className="form-group">
            <label>Performers</label>
            {members?.length > 0 ? (              <select
                multiple
                value={taskForm.performers.map(p => String(p.id))}
                onChange={e => {
                  const selectedIds = Array.from(e.target.selectedOptions).map(opt => opt.value);
                  const selectedPerformers = members.filter(m => selectedIds.includes(String(m.id)));
                  setTaskForm({ ...taskForm, performers: selectedPerformers });
                  setTaskFormError("");
                }}
                style={{ marginBottom: '10px' }}
              >
                {members.map(member => (
                  <option key={member.id} value={String(member.id)}>
                    {member.firstName} {member.lastName} ({member.email})
                  </option>
                ))}
              </select>
            ) : (
              <p>No members available to assign.</p>
            )}
            <p className="selected-performers">
              <strong>Selected Performers:</strong> {taskForm.performers.length > 0 ? taskForm.performers.map((p) => `${p.firstName} ${p.lastName}`).join(", ") : "None"}
            </p>
          </div>
          <div className="modal-actions">
            <button type="submit">{editingTask ? "Update Task" : "Create Task"}</button>
            <button
              type="button"
              onClick={() => {
                onClose();
                setEditingTask(null);
                setTaskForm({ title: "", content: "", deadlineDate: "", status: "TO_DO", performers: [] });
                setTaskFormError("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

TaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  taskForm: PropTypes.shape({
    title: PropTypes.string,
    content: PropTypes.string,
    deadlineDate: PropTypes.string,
    status: PropTypes.string,
    performers: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired
    }))
  }).isRequired,
  setTaskForm: PropTypes.func.isRequired,
  taskFormError: PropTypes.string,
  members: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  })),
  editingTask: PropTypes.object,
  setEditingTask: PropTypes.func.isRequired,
  setTaskFormError: PropTypes.func.isRequired
};
