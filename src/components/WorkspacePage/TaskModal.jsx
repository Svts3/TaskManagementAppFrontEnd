import PropTypes from 'prop-types';
import { useState } from 'react';
import './TaskModal.css';

export default function TaskModal({ isOpen, onClose, onSubmit, taskForm, setTaskForm, taskFormError, members, editingTask, setEditingTask, setTaskFormError, customStatuses = [], addCustomStatus, removeCustomStatus }) {
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [customStatusInput, setCustomStatusInput] = useState("");
  // Combine default and custom statuses
  const allStatuses = [
    { value: "TO_DO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "DONE", label: "Done" },
    ...customStatuses.map(s => ({ value: s, label: s }))
  ];
  // If editing/creating a task with a status not in the list, show it
  if (taskForm.status && !allStatuses.some(s => s.value === taskForm.status)) {
    allStatuses.push({ value: taskForm.status, label: taskForm.status });
  }
  // UI for managing custom statuses (in a popover/modal style)
  const renderCustomStatusManager = () => (
    <div className="custom-status-manager-modal" style={{ position: 'absolute', top: 40, left: 0, zIndex: 10, background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 16, minWidth: 260 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, marginBottom: 8 }}>
        <span>Manage Statuses</span>
        <button type="button" onClick={() => setShowStatusManager(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer', lineHeight: 1, padding: 0 }} aria-label="Close">×</button>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Add custom status"
          value={customStatusInput}
          onChange={e => setCustomStatusInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && customStatusInput.trim()) {
              const val = customStatusInput.trim();
              if (!allStatuses.some(s => s.value === val)) {
                addCustomStatus && addCustomStatus(val);
                setTaskForm({ ...taskForm, status: val });
              }
              setCustomStatusInput("");
            }
          }}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={() => {
            const val = customStatusInput.trim();
            if (val && !allStatuses.some(s => s.value === val)) {
              addCustomStatus && addCustomStatus(val);
              setTaskForm({ ...taskForm, status: val });
            }
            setCustomStatusInput("");
          }}
          style={{ padding: '6px 12px' }}
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
                    removeCustomStatus && removeCustomStatus(status);
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
  );
  if (!isOpen) return null;
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
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
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Status</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select
                value={taskForm.status}
                onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
                style={{ flex: 1 }}
              >
                {allStatuses.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                type="button"
                className="manage-status-btn"
                style={{
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '50%',
                  padding: 4,
                  margin: '0 4px',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 1px 4px rgba(37,99,235,0.08)'
                }}
                onClick={e => {
                  e.stopPropagation();
                  setShowStatusManager(v => !v);
                }}
                tabIndex={0}
                aria-label="Manage statuses"
                title="Manage statuses"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="9" width="12" height="2" rx="1" fill="white"/>
                  <rect x="9" y="4" width="2" height="12" rx="1" fill="white"/>
                </svg>
              </button>
            </div>
            {showStatusManager && (
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
                  <button type="button" onClick={() => setShowStatusManager(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer', lineHeight: 1, padding: 0 }} aria-label="Close">×</button>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                  <input
                    type="text"
                    placeholder="Add custom status"
                    value={customStatusInput}
                    onChange={e => setCustomStatusInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && customStatusInput.trim()) {
                        const val = customStatusInput.trim();
                        if (!allStatuses.some(s => s.value === val)) {
                          addCustomStatus && addCustomStatus(val);
                          setTaskForm({ ...taskForm, status: val });
                        }
                        setCustomStatusInput("");
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = customStatusInput.trim();
                      if (val && !allStatuses.some(s => s.value === val)) {
                        addCustomStatus && addCustomStatus(val);
                        setTaskForm({ ...taskForm, status: val });
                      }
                      setCustomStatusInput("");
                    }}
                    style={{ padding: '6px 12px' }}
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
                              removeCustomStatus && removeCustomStatus(status);
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
  setTaskFormError: PropTypes.func.isRequired,
  customStatuses: PropTypes.arrayOf(PropTypes.string),
  addCustomStatus: PropTypes.func,
  removeCustomStatus: PropTypes.func,
};
