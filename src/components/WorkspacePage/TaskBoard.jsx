import TaskColumn from "./TaskColumn";

// Accepts tasksByStatus instead of tasks (for filtered columns)
export default function TaskBoard({ tasksByStatus, members, onEditTask, onDeleteTask, dropdownTaskId, toggleDropdown }) {
  // Only render columns that exist in tasksByStatus and have tasks (never undefined)
  return (
    <div className="tasks-board" style={{ width: '100%', minWidth: 1200, maxWidth: '100%', overflowX: 'auto' }}>
      {Object.entries(tasksByStatus).map(([status, tasks]) =>
        Array.isArray(tasks) && tasks.length > 0 ? (
          <div
            key={status}
            style={{
              flex: 1,
              minWidth: 380,
              maxWidth: 520,
              margin: 8,
              overflowY: 'auto',
              maxHeight: '90vh',
              minHeight: 500,
              background: '#f8f9fa',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                background: "#f8f9fa",
                padding: "16px 0 8px 0",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                fontWeight: 600,
                fontSize: "1.15rem",
                textAlign: "center"
              }}
            >
              {status === 'TO_DO'
                ? 'To Do'
                : status === 'IN_PROGRESS'
                ? 'In Progress'
                : status === 'DONE'
                ? 'Done'
                : status}
            </div>
            <TaskColumn
              title=""
              tasks={tasks}
              members={members}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              dropdownTaskId={dropdownTaskId}
              toggleDropdown={toggleDropdown}
            />
          </div>
        ) : null
      )}
    </div>
  );
}
