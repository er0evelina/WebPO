document.addEventListener('DOMContentLoaded', function() {
    //define elements:

    //navigation elements
    const sidebarItems = document.querySelectorAll('.sidebar li[data-page]');
    const pages = document.querySelectorAll('.page');
    //modal elements
    const overlay = document.getElementById('overlay');
    const taskDetails = document.getElementById('taskDetails');
    const closeBtn = document.getElementById('closeBtn');
    
    //profile elements
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeEditModal = document.getElementById('close-edit-modal');
    const profileForm = document.getElementById('profile-form');
    
    //task elements
    const taskTable = document.getElementById('task-table');
    const completedTable = document.getElementById('completed-table');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const sortTasksBtn = document.getElementById('sort-tasks-btn');
    const showCompletedBtn = document.getElementById('show-completed-btn');
    
    //initialize data:

    //load data from localStorage or use defaults
    let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
        name: "Elka",
        email: "elka@gmail.com",
        phone: "+1 (514) 123-4567",
        location: "Montreal, Canada"
    };
    //avtive tasks
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [
        { title: 'Work', status: 'In progress', dueDate: '2025-03-28', completed: false },
        { title: 'Groceries', status: 'Not started', dueDate: '2025-03-25', completed: false },
        { title: 'Personal', status: 'Completed', dueDate: '2025-03-30', completed: false }
    ];
    //complete tasks
    let completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
    
    //main app fuctions:

    //initialize the app
    function init() {
        updateProfileDisplay();
        renderTasks();
        renderCompletedTasks();
        showPage('profile');
    }
    
    //save data to localStorage
    function saveData() {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    }
    
    //switch between pages
    function showPage(pageId) {
        pages.forEach(page => {
            page.style.display = 'none';//hide all
        });

        //show page
        document.getElementById(`${pageId}-page`).style.display = 'block';
        //refresh active element in sidebar
        sidebarItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageId) {
                item.classList.add('active');
            }
        });
    }
    
    //profile functions:

    //refresh info on the profile page
    function updateProfileDisplay() {
        document.getElementById('username').textContent = userProfile.name;
        document.getElementById('user-email').textContent = userProfile.email;
        document.getElementById('user-phone').textContent = userProfile.phone;
        document.getElementById('user-location').textContent = userProfile.location;
    }
    
    //task functions:

    //active task list
    function renderTasks() {
        taskTable.innerHTML = '';//clear table before refresh
        //only show active tasks
        tasks.filter(task => !task.completed).forEach((task, index) => {
            const row = document.createElement('tr');//add row in table
            row.dataset.index = index;
            //cell with task name
            const titleCell = document.createElement('td');
            titleCell.textContent = task.title;
            if (task.completed) {
                titleCell.classList.add('completed-task');
            }
            //cell with checkbox
            const checkboxCell = document.createElement('td');
            checkboxCell.className = 'checkbox';
            checkboxCell.textContent = task.completed ? '☑' : '☐';
            //adding cells to row
            row.appendChild(titleCell);
            row.appendChild(checkboxCell);
            taskTable.appendChild(row);//add row to table
            
            //add click event to show task details
            row.addEventListener('click', function(e) {
                //to ignore clicks on checkbox
                if (e.target.classList.contains('checkbox')) return;
                showTaskDetails(index, false);
            });
            
            //checkbox click event
            checkboxCell.addEventListener('click', function() {
                toggleTaskCompletion(index);
            });
        });
    }
    
    //completed tasks list
    function renderCompletedTasks() {
        completedTable.innerHTML = '';
        //add together tasks that are already completed and tasks that have been marked as completed
        const allCompletedTasks = [...completedTasks, ...tasks.filter(task => task.completed)];
        //same steps as active tasks
        allCompletedTasks.forEach((task, index) => {
            const row = document.createElement('tr');
            row.dataset.index = index;
            
            const titleCell = document.createElement('td');
            titleCell.textContent = task.title;
            titleCell.classList.add('completed-task');
            
            const checkboxCell = document.createElement('td');
            checkboxCell.className = 'checkbox';
            checkboxCell.textContent = '☑';
            
            row.appendChild(titleCell);
            row.appendChild(checkboxCell);
            completedTable.appendChild(row);
            
            //add click event to show task details
            row.addEventListener('click', function(e) {
                if (e.target.classList.contains('checkbox')) return;
                showTaskDetails(index, true);
            });
            
            //checkbox click event
            checkboxCell.addEventListener('click', function() {
                uncompleteTask(index);
            });
        });
    }
    
    //open modal with task details
    function showTaskDetails(index, isCompleted) {
        const taskList = isCompleted ? [...completedTasks, ...tasks.filter(t => t.completed)] : tasks;
        const task = taskList[index];
        
        document.getElementById('taskTitle').textContent = task.title;
        
        //create form for editing
        const detailsContent = `
            <h3>${task.title}</h3>
            <form class="edit-task-form" id="edit-task-form">
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
                <button type="button" class="cancel" id="cancel-edit">Cancel</button>
            </form>
        `;
        //add form to modal
        taskDetails.innerHTML = detailsContent;
        //get links to form elements
        const editForm = document.getElementById('edit-task-form');
        const cancelBtn = document.getElementById('cancel-edit');
        //submit button
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            //get new values
            const newStatus = document.getElementById('edit-status').value;
            const newDueDate = document.getElementById('edit-due-date').value || 'No deadline';
            
            if (isCompleted) {
                completedTasks[index].status = newStatus;
                completedTasks[index].dueDate = newDueDate;
            } else {
                tasks[index].status = newStatus;
                tasks[index].dueDate = newDueDate;
                //if task is maked as completed then refresh status
                if (newStatus === 'Completed') {
                    tasks[index].completed = true;
                }
            }
            //save and refresh
            saveData();
            renderTasks();
            renderCompletedTasks();
            overlay.style.display = 'none';
            taskDetails.style.display = 'none';
        });
        //cancel button
        cancelBtn.addEventListener('click', function() {
            overlay.style.display = 'none';
            taskDetails.style.display = 'none';
        });
        //show modal
        overlay.style.display = 'block';
        taskDetails.style.display = 'block';
    }
    
    //switch task status
    function toggleTaskCompletion(index) {
        tasks[index].completed = !tasks[index].completed;//inverts completion status
        //if completed
        if (tasks[index].completed) {
            tasks[index].status = 'Completed';
            completedTasks.push(tasks[index]);//add into completed list
            tasks.splice(index, 1);//remove from active
        }
        //save and refresh
        saveData();
        renderTasks();
        renderCompletedTasks();
    }
    //return task into active list
    function uncompleteTask(index) {
        const task = completedTasks[index];
        task.completed = false;
        tasks.push(task);//return to active
        completedTasks.splice(index, 1);//remove from completed list
        
        saveData();
        renderTasks();
        renderCompletedTasks();
    }
    //add new task
    function addTask(title) {
        if (title.trim() === '') return;//ignore empty name
        //adding
        tasks.push({
            title: title,
            status: 'Not started',
            dueDate: 'No deadline',
            completed: false
        });
        //save refresh
        saveData();
        renderTasks();
        newTaskInput.value = '';
    }
    //sort button (only a to z for now)
    function sortTasks() {
        tasks.sort((a, b) => a.title.localeCompare(b.title));
        saveData();
        renderTasks();
    }
    
    //sidebar navigation
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            showPage(this.dataset.page);
        });
    });
    //to close modal windows
    closeBtn.addEventListener('click', function() {
        overlay.style.display = 'none';
        taskDetails.style.display = 'none';
    });
    
    overlay.addEventListener('click', function() {
        overlay.style.display = 'none';
        taskDetails.style.display = 'none';
        editProfileModal.style.display = 'none';
    });
    
    //profile modal
    editProfileBtn.addEventListener('click', function() {
        //fill form with current values
        document.getElementById('edit-username').value = userProfile.name;
        document.getElementById('edit-email').value = userProfile.email;
        document.getElementById('edit-phone').value = userProfile.phone;
        document.getElementById('edit-location').value = userProfile.location;
        //show modal
        overlay.style.display = 'block';
        editProfileModal.style.display = 'block';
    });
    
    closeEditModal.addEventListener('click', function() {
        overlay.style.display = 'none';
        editProfileModal.style.display = 'none';
    });
    
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        //refresh profile info
        userProfile = {
            name: document.getElementById('edit-username').value,
            email: document.getElementById('edit-email').value,
            phone: document.getElementById('edit-phone').value,
            location: document.getElementById('edit-location').value
        };
        
        saveData();
        updateProfileDisplay();
        overlay.style.display = 'none';
        editProfileModal.style.display = 'none';
    });
    
    //task controls
    addTaskBtn.addEventListener('click', function() {
        addTask(newTaskInput.value);
    });
    //adding tasks by pressing enter
    newTaskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask(newTaskInput.value);
        }
    });
    //sort
    sortTasksBtn.addEventListener('click', sortTasks);
    //to show sompleted tasks
    showCompletedBtn.addEventListener('click', function() {
        showPage('completed');
    });
    
    //initialize the app
    init();
});