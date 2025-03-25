document.addEventListener('DOMContentLoaded', function() {
    const taskRows = document.querySelectorAll('tr');
    const overlay = document.getElementById('overlay');
    const taskDetails = document.getElementById('taskDetails');
    const closeBtn = document.getElementById('closeBtn');
    const sidebarItems = document.querySelectorAll('.sidebar li');

    
    const tasks = [
        { title: 'Complete project 1', status: 'In progress', dueDate: '2025-03-28' },
        { title: 'Complete project 2', status: 'Not started', dueDate: '2025-03-25' },
        { title: 'Retrieve document', status: 'Completed', dueDate: '2025-03-30' },
        { title: 'Stuff', status: 'Not started', dueDate: 'No deadline' },
        { title: 'Idk', status: 'In progress', dueDate: '2025-04-01' },
        { title: 'Idk2', status: 'Not started', dueDate: 'No deadline' },
        { title: 'Idk3', status: 'Completed', dueDate: '2025-03-24' }
    ];

    
    taskRows.forEach((row, index) => {
        if (index > 0) { 
            row.addEventListener('click', function() {
                const taskIndex = index - 1;
                document.getElementById('taskTitle').textContent = tasks[taskIndex].title;
                document.getElementById('taskStatus').textContent = tasks[taskIndex].status;
                document.getElementById('taskDueDate').textContent = tasks[taskIndex].dueDate;
                
                overlay.style.display = 'block';
                taskDetails.style.display = 'block';
            });
        }
    });

    
    closeBtn.addEventListener('click', function() {
        overlay.style.display = 'none';
        taskDetails.style.display = 'none';
    });

    overlay.addEventListener('click', function() {
        overlay.style.display = 'none';
        taskDetails.style.display = 'none';
    });

    
    const checkboxes = document.querySelectorAll('.checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function(e) {
            e.stopPropagation();
            if (this.textContent === '☐') {
                this.textContent = '☑';
            } else {
                this.textContent = '☐';
            }
        });
    });

    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
});