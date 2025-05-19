document.addEventListener('DOMContentLoaded', function() {
    // DOM элементы
    const sidebarItems = document.querySelectorAll('.sidebar li[data-page]');
    const pages = document.querySelectorAll('.page');
    const overlay = document.getElementById('overlay');
    const taskDetails = document.getElementById('taskDetails');
    //const closeBtn = document.getElementById('closeBtn');
    const taskTable = document.getElementById('task-table');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const sortBtn = document.getElementById('sort-btn');
    const sortDropdown = document.getElementById('sort-dropdown');
    const filterBtn = document.getElementById('filter-btn');
    const filterDropdown = document.getElementById('filter-dropdown');
    let currentFilter = 'all';
    
    // Данные
    let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
        name: "Elka",
        email: "elka@gmail.com",
        phone: "+1 (514) 123-4567",
        location: "Montreal, Canada"
    };

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (tasks.length > 0 && !tasks[0].id) {
        tasks = tasks.map((task, index) => ({ ...task, id: index }));
        saveData();
    }
    let currentSortMethod = null;

    // Инициализация
    function init() {
        updateProfileDisplay();
        renderTasks();
        // При загрузке данных добавляем ID если их нет
        if (tasks.length > 0 && !tasks[0].id) {
            tasks = tasks.map(task => ({ 
                ...task, 
                id: Date.now() + Math.floor(Math.random() * 1000) 
            }));
            saveData();
        }
        setupFiltering();
        setupSorting();
        showPage('important');
    }

    function saveData() {

        const dataToSave = tasks.map(task => {
            if (task.completed) {
                return { ...task, important: false };
            }
            return task;
        });
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('tasks', JSON.stringify(dataToSave));
    }

    function showPage(pageId) {
        pages.forEach(page => page.style.display = 'none');
        document.getElementById(`${pageId}-page`).style.display = 'block';
        //sidebarItems.forEach(item => item.classList.toggle('active', item.dataset.page === pageId));
        sidebarItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageId) item.classList.add('active');
        });
    }

    function updateProfileDisplay() {
        document.getElementById('username').textContent = userProfile.name;
        document.getElementById('user-email').textContent = userProfile.email;
        document.getElementById('user-phone').textContent = userProfile.phone;
        document.getElementById('user-location').textContent = userProfile.location;
    }

    function renderTasks() {
        taskTable.innerHTML = `
            <tr>
               
            </tr>
        `;
    
        let filteredTasks = [...tasks];
        switch(currentFilter) {
            case 'not-started':
                filteredTasks = tasks.filter(task => task.status === 'Not started');
                break;
            case 'in-progress':
                filteredTasks = tasks.filter(task => task.status === 'In progress');
                break;
            case 'completed':
                filteredTasks = tasks.filter(task => task.status === 'Completed' || task.completed);
                break;
        }

        const sortedTasks = [...filteredTasks].sort((a, b) => {
            
            if (a.important !== b.important) {
                return a.important ? -1 : 1;
            }
            
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            if (currentSortMethod) {
                switch(currentSortMethod) {
                    case 'alphabetical':
                        return a.title.localeCompare(b.title);
                    case 'reverse-alphabetical':
                        return b.title.localeCompare(a.title);
                    case 'date':
                        return dateSortComparator(a, b, false);
                    case 'reverse-date':
                        return dateSortComparator(a, b, true);
                }
            }
            return 0;
        });

        sortedTasks.forEach(task => {
            const row = document.createElement('tr');
            if (task.completed) {
                task.important = false;
            }
            if (task.completed || task.status === 'Completed') {
            row.classList.add('completed-task');
            task.completed = true;
        }
            
            row.innerHTML = `
                <td><span class="checkbox">${task.completed ? '☑' : '☐'}</span></td>
                <td>${task.title}</td>
                <td><span class="star ${task.important ? 'important' : ''}">★</span></td>
                <td>${task.status}</td>
                <td><span class="delete-btn">✕</span></td>
            `;
    
            row.querySelector('.checkbox').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleTaskCompletion(task.id || index);
            });
    
            row.querySelector('.star').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleTaskImportance(task.id || index);
            });

            row.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            });

            row.addEventListener('click', (e) => {
                // Проверяем, был ли клик по кнопке удаления или другим интерактивным элементам
                if (e.target.classList.contains('delete-btn') || 
                    e.target.classList.contains('checkbox') || 
                    e.target.classList.contains('star')) {
                    return;
                }
                showTaskDetails(task.id);
            });
            taskTable.appendChild(row);
        });
    }
    
    function setupFiltering() {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('show');
        });

        document.querySelectorAll('.filter-dropdown div').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                currentFilter = option.dataset.filter;
                renderTasks();
                filterDropdown.classList.remove('show');
            });
        });
    }

    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            saveData();
            renderTasks();
        }
    }

    function dateSortComparator(a, b, reverse) {
        if (a.dueDate === 'No deadline' && b.dueDate === 'No deadline') return 0;
        if (a.dueDate === 'No deadline') return reverse ? -1 : 1;
        if (b.dueDate === 'No deadline') return reverse ? 1 : -1;
        return reverse ? new Date(b.dueDate) - new Date(a.dueDate) : new Date(a.dueDate) - new Date(b.dueDate);
    }

    function toggleTaskCompletion(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        if (task.completed) {
            task.status = 'Completed';
            task.important = false;
        } else {
            task.status = 'Not started';
        }
        
        saveData();
        renderTasks();
    }

    function toggleTaskImportance(taskId) {
        const task = tasks.find(t => t.id === taskId) || tasks[taskId];
        task.important = !task.important;
        saveData();
        renderTasks();
    }

    function showTaskDetails(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            console.error('Task not found with ID:', taskId);
            return;
        }

        taskDetails.innerHTML = `
            <span class="close-btn" id="closeTaskDetails"></span>
            <h3>${task.title}</h3>
            <form class="edit-task-form" id="editTaskForm">
                <div class="form-group">
                    <label for="edit-status">Status:</label>
                    <select id="edit-status">
                        <option value="Not started" ${task.status === 'Not started' ? 'selected' : ''}>Not started</option>
                        <option value="In progress" ${task.status === 'In progress' ? 'selected' : ''}>In progress</option>
                        <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-due-date">Due Date:</label>
                    <input type="date" id="edit-due-date" value="${task.dueDate === 'No deadline' ? '' : task.dueDate}">
                </div>
                <button type="submit">Save</button>
            </form>
        `;

        document.getElementById('editTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const newStatus = document.getElementById('edit-status').value;
            const newDueDate = document.getElementById('edit-due-date').value || 'No deadline';
            Object.assign(task, {
                status: newStatus,
                dueDate: newDueDate,
                completed: newStatus === 'Completed'
            });
            saveData();
            closeModal();
            renderTasks();
        });

        overlay.style.display = 'block';
        taskDetails.style.display = 'block';
    }

    function closeModal() {
        overlay.style.display = 'none';
        taskDetails.style.display = 'none';
    }

    function setupSorting() {
        sortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sortDropdown.classList.toggle('show');
        });

        document.querySelectorAll('.sort-dropdown div').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                currentSortMethod = option.dataset.sort;
                renderTasks();
                sortDropdown.classList.remove('show');
            });
        });
    }

    function addTask(title) {
        if (!title.trim()) return;
        tasks.push({
            id: Date.now() + Math.floor(Math.random() * 1000), // Более надежный ID
            title: title,
            status: 'Not started',
            dueDate: 'No deadline',
            completed: false,
            important: false
        });
        saveData();
        renderTasks();
        newTaskInput.value = '';
    }

    // Обработчики событий
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sort-container')) {
            sortDropdown.classList.remove('show');
        }

        if (!e.target.closest('.filter-container')) {
            filterDropdown.classList.remove('show');
        }
    });

    addTaskBtn.addEventListener('click', () => addTask(newTaskInput.value));
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask(newTaskInput.value);
    });

    overlay.addEventListener('click', closeModal);
    document.getElementById('closeTaskDetails')?.addEventListener('click', closeModal);

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => showPage(item.dataset.page));
    });

    
    init();
});
