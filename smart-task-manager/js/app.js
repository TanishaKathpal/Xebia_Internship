/* =========================================
   Smart Task Manager — Application Logic
   v2.0 — Premium Productivity Dashboard
   ========================================= */

(function () {
  'use strict';

  // ——— Constants ———
  const STORAGE_KEY = 'smart_task_manager_tasks';
  const THEME_KEY = 'smart_task_manager_theme';

  // ——— DOM References ———
  const taskTitleInput   = document.getElementById('task-title-input');
  const prioritySelect   = document.getElementById('priority-select');
  const dueDateInput     = document.getElementById('due-date-input');
  const addTaskBtn       = document.getElementById('add-task-btn');
  const searchInput      = document.getElementById('search-input');
  const searchArea       = document.getElementById('search-area');
  const pendingList      = document.getElementById('pending-list');
  const completedList    = document.getElementById('completed-list');
  const pendingCount     = document.getElementById('pending-count');
  const completedCount   = document.getElementById('completed-count');
  const statTotal        = document.getElementById('stat-total');
  const statPending      = document.getElementById('stat-pending');
  const statDone         = document.getElementById('stat-done');
  const statRate         = document.getElementById('stat-rate');
  const progressFill     = document.getElementById('progress-fill');
  const progressPercent  = document.getElementById('progress-percentage');
  const themeToggle      = document.getElementById('theme-toggle');

  // ——— State ———
  let tasks = [];

  // =========================================
  //  UTILITY FUNCTIONS
  // =========================================

  /** Generate a unique ID */
  function generateId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
  }

  /** Check if a date string is in the past */
  function isOverdue(dateStr) {
    if (!dateStr) return false;
    const due = new Date(dateStr + 'T23:59:59');
    return due < new Date();
  }

  /** Format a date string for display */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', options);
  }

  /** Sanitize text to prevent XSS — uses textContent internally */
  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /** Highlight search matches in text */
  function highlightText(text, query) {
    if (!query) return sanitize(text);
    const sanitized = sanitize(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return sanitized.replace(regex, '<mark>$1</mark>');
  }

  /** Priority display label */
  function priorityLabel(priority) {
    const labels = { high: 'High', medium: 'Medium', low: 'Low' };
    return labels[priority] || 'Medium';
  }

  /** Priority dot emoji */
  function priorityDot(priority) {
    const dots = { high: '🔴', medium: '🟡', low: '🟢' };
    return dots[priority] || '🟡';
  }

  // =========================================
  //  LOCAL STORAGE
  // =========================================

  /** Load tasks from localStorage */
  function loadTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      tasks = data ? JSON.parse(data) : [];
    } catch (err) {
      console.warn('Failed to load tasks from localStorage:', err);
      tasks = [];
    }
  }

  /** Save tasks to localStorage */
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.warn('Failed to save tasks to localStorage:', err);
    }
  }

  // =========================================
  //  THEME MANAGEMENT
  // =========================================

  /** Load saved theme preference */
  function loadTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (err) {
      // Silently ignore
    }
  }

  /** Toggle between light and dark themes */
  function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    try {
      localStorage.setItem(THEME_KEY, newTheme);
    } catch (err) {
      // Silently ignore
    }
  }

  // =========================================
  //  TASK CRUD OPERATIONS
  // =========================================

  /** Add a new task */
  function addTask(title, priority, dueDate) {
    const trimmed = title.trim();
    if (!trimmed) {
      // Show validation feedback
      taskTitleInput.classList.add('shake');
      taskTitleInput.focus();
      setTimeout(() => taskTitleInput.classList.remove('shake'), 500);
      return false;
    }

    const task = {
      id: generateId(),
      title: trimmed,
      priority: priority || 'medium',
      dueDate: dueDate || '',
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
    return true;
  }

  /** Delete a task by ID */
  function deleteTask(id) {
    // Animate the card out first
    const card = document.querySelector(`[data-task-id="${id}"]`);
    if (card) {
      card.classList.add('removing');
      card.addEventListener('animationend', () => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
      }, { once: true });
    } else {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderTasks();
    }
  }

  /** Toggle task completion */
  function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    }
  }

  // =========================================
  //  SEARCH
  // =========================================

  /** Get current search query */
  function getSearchQuery() {
    return searchInput.value.trim().toLowerCase();
  }

  /** Get filtered tasks based on search query */
  function getFilteredTasks() {
    const query = getSearchQuery();
    if (!query) return tasks;
    return tasks.filter(t => t.title.toLowerCase().includes(query));
  }

  // =========================================
  //  RENDERING
  // =========================================

  /** Create HTML for a single task card */
  function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card priority-${task.priority}${task.completed ? ' completed-card' : ''}`;
    card.setAttribute('data-task-id', task.id);

    // Overdue check
    const overdueClass = (!task.completed && isOverdue(task.dueDate)) ? ' overdue' : '';

    // Search query for highlighting
    const query = getSearchQuery();

    // Build due date HTML
    let dueDateHTML = '';
    if (task.dueDate) {
      dueDateHTML = `
        <span class="due-date-tag${overdueClass}">
          <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          ${sanitize(formatDate(task.dueDate))}${overdueClass ? ' · Overdue' : ''}
        </span>
      `;
    }

    card.innerHTML = `
      <button class="complete-btn${task.completed ? ' is-completed' : ''}" aria-label="${task.completed ? 'Mark as pending' : 'Mark as completed'}" data-action="toggle" data-id="${task.id}">
        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </button>
      <div class="task-info">
        <div class="task-title-text">${highlightText(task.title, query)}</div>
        <div class="task-meta">
          <span class="priority-badge ${task.priority}">${priorityDot(task.priority)} ${priorityLabel(task.priority)}</span>
          ${dueDateHTML}
        </div>
      </div>
      <div class="task-actions">
        <button class="delete-btn" aria-label="Delete task" data-action="delete" data-id="${task.id}">
          <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    `;

    return card;
  }

  /** Render empty state placeholder */
  function createEmptyState(icon, title, subtitle) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = `
      <span class="empty-icon">${icon}</span>
      <div class="empty-title">${sanitize(title)}</div>
      <div class="empty-subtitle">${sanitize(subtitle)}</div>
    `;
    return div;
  }

  /** Render all tasks into pending and completed lists */
  function renderTasks() {
    const filtered = getFilteredTasks();
    const pending = filtered.filter(t => !t.completed);
    const completed = filtered.filter(t => t.completed);

    // Clear lists
    pendingList.innerHTML = '';
    completedList.innerHTML = '';

    // Pending tasks
    if (pending.length === 0) {
      const query = getSearchQuery();
      if (query) {
        pendingList.appendChild(createEmptyState('🔍', 'No matching pending tasks', 'Try a different search term'));
      } else {
        pendingList.appendChild(createEmptyState('📋', 'No pending tasks', 'Add a task to get started'));
      }
    } else {
      pending.forEach(task => {
        pendingList.appendChild(createTaskCard(task));
      });
    }

    // Completed tasks
    if (completed.length === 0) {
      const query = getSearchQuery();
      if (query) {
        completedList.appendChild(createEmptyState('🔍', 'No matching completed tasks', 'Try a different search term'));
      } else {
        completedList.appendChild(createEmptyState('🎉', 'No completed tasks yet', 'Complete tasks to see them here'));
      }
    } else {
      completed.forEach(task => {
        completedList.appendChild(createTaskCard(task));
      });
    }

    // Update all counters and progress
    updateCounters();
    updateProgress();
    updateSearchState();
  }

  /** Update task counters in the header stats dashboard */
  function updateCounters() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const pend = total - done;
    const rate = total === 0 ? 0 : Math.round((done / total) * 100);

    // Animate counter values
    animateValue(statTotal, total);
    animateValue(statPending, pend);
    animateValue(statDone, done);
    statRate.textContent = rate + '%';

    // Section counters
    pendingCount.textContent = pend;
    completedCount.textContent = done;
  }

  /** Animate a numeric counter update */
  function animateValue(el, newVal) {
    const current = parseInt(el.textContent) || 0;
    if (current === newVal) return;
    el.textContent = newVal;
    el.style.transform = 'scale(1.15)';
    el.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    setTimeout(() => {
      el.style.transform = 'scale(1)';
    }, 200);
  }

  /** Update progress bar */
  function updateProgress() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    progressFill.style.width = percent + '%';
    progressPercent.textContent = percent + '%';
  }

  /** Update search area active state */
  function updateSearchState() {
    const query = getSearchQuery();
    if (query) {
      searchArea.classList.add('has-query');
    } else {
      searchArea.classList.remove('has-query');
    }
  }

  // =========================================
  //  EVENT DELEGATION
  // =========================================

  /** Handle clicks within task lists (complete/delete) */
  function handleTaskAction(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');

    if (action === 'toggle') {
      toggleComplete(id);
    } else if (action === 'delete') {
      deleteTask(id);
    }
  }

  // =========================================
  //  EVENT LISTENERS
  // =========================================

  function attachEventListeners() {
    // Add task — button click
    addTaskBtn.addEventListener('click', () => {
      const added = addTask(
        taskTitleInput.value,
        prioritySelect.value,
        dueDateInput.value
      );
      if (added) {
        taskTitleInput.value = '';
        dueDateInput.value = '';
        prioritySelect.value = 'medium';
        taskTitleInput.focus();
      }
    });

    // Add task — Enter key
    taskTitleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTaskBtn.click();
      }
    });

    // Search — real-time filtering
    searchInput.addEventListener('input', () => {
      renderTasks();
    });

    // Dark mode toggle
    themeToggle.addEventListener('click', toggleDarkMode);

    // Event delegation for task actions
    pendingList.addEventListener('click', handleTaskAction);
    completedList.addEventListener('click', handleTaskAction);
  }

  // =========================================
  //  INITIALISATION
  // =========================================

  function init() {
    loadTheme();
    loadTasks();
    attachEventListeners();
    renderTasks();
  }

  // Start the app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
