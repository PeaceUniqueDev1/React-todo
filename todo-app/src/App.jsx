
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("my-todo-tasks")) || [];
    } catch {
      return [];
    }
  });

  const [task, setTask] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(new Date());

  // Update the date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Save tasks in the browser
  useEffect(() => {
    localStorage.setItem("my-todo-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Check for reminder times
  useEffect(() => {
    const checkReminders = () => {
      const currentTime = new Date();

      setTasks((currentTasks) => {
        let changed = false;

        const updatedTasks = currentTasks.map((item) => {
          if (!item.date || !item.time || item.completed || item.reminded) {
            return item;
          }

          const reminderTime = new Date(
            `${item.date}T${item.time}`
          );

          const difference = currentTime - reminderTime;

          if (difference >= 0 && difference < 60000) {
            changed = true;

            setTimeout(() => {
              alert(`Reminder: ${item.text}`);
            }, 0);

            return { ...item, reminded: true };
          }

          return item;
        });

        return changed ? updatedTasks : currentTasks;
      });
    };

    const reminderTimer = setInterval(checkReminders, 10000);
    checkReminders();

    return () => clearInterval(reminderTimer);
  }, []);

  function addTask(e) {
    e.preventDefault();

    if (!task.trim()) {
      alert("Please enter a task.");
      return;
    }

    const newTask = {
      id: Date.now(),
      text: task.trim(),
      date: taskDate,
      time: taskTime,
      completed: false,
      reminded: false,
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);

    setTask("");
    setTaskDate("");
    setTaskTime("");
  }

  function toggleTask(id) {
    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  }

  function editTask(item) {
    const newText = prompt("Edit your task:", item.text);

    if (newText === null || !newText.trim()) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((taskItem) =>
        taskItem.id === item.id
          ? { ...taskItem, text: newText.trim() }
          : taskItem
      )
    );
  }

  function deleteTask(id) {
    if (window.confirm("Do you want to delete this task?")) {
      setTasks((currentTasks) =>
        currentTasks.filter((item) => item.id !== id)
      );
    }
  }

  const filteredTasks = tasks.filter((item) =>
    item.text.toLowerCase().includes(search.toLowerCase())
  );

  const completedCount = tasks.filter(
    (item) => item.completed
  ).length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="app">
      <header className="topbar">
        <a className="logo" href="#home">
          <span className="logo-icon">✓</span>
          Taskly
        </a>

        <span className="topbar-label">Make today count.</span>
      </header>

      <main className="dashboard" id="home">
        <section className="welcome">
          <p className="eyebrow">YOUR PERSONAL PLANNER</p>
          <h1>Make room for <span>what matters.</span></h1>
          <p>One simple list to help you organize your day.</p>
        </section>

        <section className="date-card">
          <div className="date-icon">▦</div>
          <div>
            <p className="date-label">TODAY</p>
            <h2>
              {now.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h2>
            <p className="live-time">
              ◷ {now.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>
        </section>

        <section className="add-section">
          <h2>Add a task</h2>

          <form onSubmit={addTask}>
            <label htmlFor="task">What do you need to do?</label>

            <div className="task-input-row">
              <input
                id="task"
                type="text"
                placeholder="e.g. Study React"
                value={task}
                onChange={(e) => setTask(e.target.value)}
              />

              <button className="add-button" type="submit">
                + Add Task
              </button>
            </div>

            <div className="schedule-row">
              <div className="schedule-field">
                <label htmlFor="task-date">Task date (optional)</label>
                <input
                  id="task-date"
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                />
              </div>

              <div className="schedule-field">
                <label htmlFor="task-time">Reminder time (optional)</label>
                <input
                  id="task-time"
                  type="time"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                />
              </div>
            </div>
          </form>
        </section>

        <section className="tasks-section">
          <div className="section-heading">
            <div>
              <h2>My tasks</h2>
              <p>
                {completedCount} of {tasks.length} completed
              </p>
            </div>

            <span className="task-count">{tasks.length} total</span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search your tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✓</div>
                <h3>
                  {search ? "No tasks found" : "Your day starts here"}
                </h3>
                <p>
                  {search
                    ? "Try searching for something else."
                    : "Add your first task above and get started."}
                </p>
              </div>
            ) : (
              filteredTasks.map((item) => (
                <article className="task-card" key={item.id}>
                  <button
                    className={
                      item.completed ? "check-button checked" : "check-button"
                    }
                    onClick={() => toggleTask(item.id)}
                    aria-label={
                      item.completed ? "Mark as incomplete" : "Complete task"
                    }
                  >
                    {item.completed ? "✓" : ""}
                  </button>

                  <div className="task-details">
                    <p className={item.completed ? "task-text completed" : "task-text"}>
                      {item.text}
                    </p>

                    {(item.date || item.time) && (
                      <p className="task-schedule">
                        {item.date && (
                          <span>
                            ▦ {new Date(`${item.date}T12:00:00`).toLocaleDateString(
                              "en-GB",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}
                          </span>
                        )}
                        {item.time && <span> ◷ {item.time}</span>}
                      </p>
                    )}
                  </div>

                  <div className="task-actions">
                    <button
                      className="icon-button"
                      onClick={() => editTask(item)}
                      aria-label="Edit task"
                      title="Edit"
                    >
                      ✎
                    </button>

                    <button
                      className="icon-button delete-button"
                      onClick={() => deleteTask(item.id)}
                      aria-label="Delete task"
                      title="Delete"
                    >
                      ♲
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <footer>
          <p>Small steps lead to big things. ♡</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
