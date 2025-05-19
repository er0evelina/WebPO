
document.addEventListener('DOMContentLoaded', function() {
   
    const sidebarItems = document.querySelectorAll('.sidebar li[data-page]');
    const pages = document.querySelectorAll('.page');
    const overlay = document.getElementById('overlay');
    const taskDetails = document.getElementById('taskDetails');
    const closeBtn = document.getElementById('closeBtn');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeEditModal = document.getElementById('close-edit-modal');
    const profileForm = document.getElementById('profile-form');
    const taskTable = document.getElementById('task-table');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const sortTasksBtn = document.getElementById('sort-btn');
    const sortDropdown = document.getElementById('sort-dropdown');
    let currentSortMethod = null;


    let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
        name: "Elka",
        email: "elka@gmail.com",
        phone: "+1 (514) 123-4567",
        location: "Montreal, Canada"
    };

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [
        { 
            title: 'Finish project', 
            status: 'In progress', 
            dueDate: '2025-03-28', 
            completed: false, 
            important: true 
        },
        { 
            title: 'Buy groceries', 
            status: 'Completed', 
            dueDate: '2025-03-25', 
            completed: true, 
            important: false 
        }
    ];

    function init() {
        updateProfileDisplay();
        renderTasks();
        showPage('profile');
        setupSorting();

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sort-container')) {
                sortDropdown.classList.remove('show');
            }
        });
    }

    function saveData() {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function showPage(pageId) {
        pages.forEach(page => page.style.display = 'none');
        document.getElementById(`${pageId}-page`).style.display = 'block';
        
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
                <th>Done</th>
                <th>Task</th>
                <th>Important</th>
                <th>Status</th>
            </tr>
        `;
        
       
        
        // Сохраняем оригинальные индексы перед сортировкой
        const tasksWithIndex = tasks.map((task, index) => ({ ...task, originalIndex: index }));
        
        

        const sortedTasks = tasksWithIndex.sort((a, b) => {
            if (a.important !== b.important) return a.important ? -1 : 1;
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return a.title.localeCompare(b.title);
        });

        if (currentSortMethod) {
            sortTasks(currentSortMethod);
            return; // sortTasks сам вызовет renderTasks()
        }
    
        sortedTasks.forEach((task) => {
            const row = document.createElement('tr');


            if (task.completed) row.classList.add('completed-task');
            
            // Чекбокс выполнения
            const checkboxCell = document.createElement('td');
            const checkbox = document.createElement('span');
            checkbox.className = 'checkbox';
            checkbox.textContent = task.completed ? '☑' : '☐';
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleTaskCompletion(task.originalIndex); // Используем оригинальный индекс
            });
            
            // Звезда важности
            const starCell = document.createElement('td');
            const star = document.createElement('span');
            star.className = `star ${task.important ? 'important' : ''}`;
            star.innerHTML = '★';
            star.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleTaskImportance(task.originalIndex); // Используем оригинальный индекс
            });
            
            // Остальные ячейки
            const titleCell = document.createElement('td');
            titleCell.textContent = task.title;
            
            const statusCell = document.createElement('td');
            statusCell.textContent = task.status;
            
            // Собираем строку
            row.append(
                checkboxCell.appendChild(checkbox),
                titleCell,
                starCell.appendChild(star),
                statusCell
            );
            
            // Клик по строке - редактирование
            row.addEventListener('click', () => showTaskDetails(task.originalIndex)); // Оригинальный индекс
            
            taskTable.appendChild(row);

            
        });
    }

    function toggleTaskCompletion(index) {
        tasks[index].completed = !tasks[index].completed;
        if (tasks[index].completed) tasks[index].status = 'Completed';
        saveData();
        renderTasks();
    }

    function toggleTaskImportance(index) {
        tasks[index].important = !tasks[index].important;
        saveData();
        renderTasks();
    }

    function addTask(title) {
        if (!title.trim()) return;
        
        tasks.push({
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

    function showTaskDetails(index) {
        const task = tasks[index];
        
        // Создаем содержимое модального окна
        taskDetails.innerHTML = `
            <span class="close-btn" id="closeTaskDetails">×</span>
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
                <div class="form-actions">
                    <button type="submit">Save</button>
                    <button type="button" id="cancelEdit">Cancel</button>
                </div>
            </form>
        `;
    
        // Показываем модальное окно
        overlay.style.display = 'block';
        taskDetails.style.display = 'block';
    
        // Обработчик сохранения
        document.getElementById('editTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Обновляем задачу
            tasks[index] = {
                ...tasks[index],
                status: document.getElementById('edit-status').value,
                dueDate: document.getElementById('edit-due-date').value || 'No deadline'
            };
            
            saveData();
            renderTasks();
            closeModal(); // Закрываем модальное окно
        });
    
        // Обработчик отмены
        document.getElementById('cancelEdit').addEventListener('click', closeModal);
    
        // Обработчик закрытия по крестику
        document.getElementById('closeTaskDetails').addEventListener('click', closeModal);
    }
    
    function setupSorting() {
        const sortOptions = document.querySelectorAll('.sort-dropdown div');
        
        sortOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                const sortType = this.dataset.sort;
                currentSortMethod = sortType;
                sortTasks(sortType); // Вызываем функцию сортировки
                sortDropdown.classList.remove('show');
            });
        });
    }

    function sortTasks(sortType) {

        //console.log('Sorting by:', sortType);
        //console.log('Before sorting:', tasks);
        
        
        switch(sortType) {

            
            case 'alphabetical':
                tasks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'reverse-alphabetical':
                tasks.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'date':
                tasks.sort((a, b) => dateSortComparator(a, b, false));
                break;
            case 'reverse-date':
                tasks.sort((a, b) => dateSortComparator(a, b, true));
                break;
        }
        //console.log('After sorting:', tasks);
        
        saveData();
        renderTasks();
    }
    
    function dateSortComparator(a, b, reverse = false) {
        if (a.dueDate === 'No deadline' && b.dueDate === 'No deadline') return 0;
        if (a.dueDate === 'No deadline') return reverse ? -1 : 1;
        if (b.dueDate === 'No deadline') return reverse ? 1 : -1;
        
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return reverse ? dateB - dateA : dateA - dateB;
    }

    function toggleSortDropdown(e) {
        e.stopPropagation();
        sortDropdown.classList.toggle('show');
    }
    
    function closeSortDropdownOutside() {
        sortDropdown.classList.remove('show');
    }
    
   
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => showPage(item.dataset.page));
    });

    closeBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        taskDetails.style.display = 'none';
    });

    overlay.addEventListener('click', () => {
        overlay.style.display = 'none';
        taskDetails.style.display = 'none';
        editProfileModal.style.display = 'none';
    });

    editProfileBtn.addEventListener('click', () => {
        document.getElementById('edit-username').value = userProfile.name;
        document.getElementById('edit-email').value = userProfile.email;
        document.getElementById('edit-phone').value = userProfile.phone;
        document.getElementById('edit-location').value = userProfile.location;
        
        overlay.style.display = 'block';
        editProfileModal.style.display = 'block';
    });

    closeEditModal.addEventListener('click', function() {
        overlay.style.display = 'none';
        editProfileModal.style.display = 'none';
    });

    function closeModal() {
        overlay.style.display = 'none';
        taskDetails.style.display = 'none';
    }

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userProfile = {
            name: document.getElementById('edit-username').value,
            email: document.getElementById('edit-email').value,
            phone: document.getElementById('edit-phone').value,
            location: document.getElementById('edit-location').value
        };
        
        saveData();
        updateProfileDisplay();
        overlay.style.display = 'none';
    });

    addTaskBtn.addEventListener('click', () => addTask(newTaskInput.value));
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask(newTaskInput.value);
    });

    sortTasksBtn.addEventListener('click', toggleSortDropdown);
    document.addEventListener('click', closeSortDropdownOutside);

   

    sortTasksBtn.addEventListener('click', () => {
        tasks.sort((a, b) => a.title.localeCompare(b.title));
        saveData();
        renderTasks();
    });

    // Глобальные обработчики закрытия
    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal); // Если у вас есть статический closeBtn

   
    init();
});