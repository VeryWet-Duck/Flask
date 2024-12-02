$(document).ready(function () {
    let users = [];
    let roles = ['Admin', 'User', 'Manager', 'Guest']; // Example roles
    let sortState = { key: 'id', order: 'asc' }; // Default sort state

    function fetchUsers() {
        fetch('/api/users')
            .then(response => response.json())
            .then(data => {
                users = data;
                renderTable(users);
            })
            .catch(error => console.error('Error fetching users:', error));
    }

    function renderTable(data) {
        const tableBody = $('#user-table-body');
        tableBody.empty();
        data.forEach(user => {
            const row = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${user.id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${user.id}">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });

        // Attach event listeners
        $('.edit-btn').click(handleEdit);
        $('.delete-btn').click(handleDelete);
    }

    function populateRoleDropdown(selectedRole = '') {
        const roleDropdown = $('#user-role');
        roleDropdown.empty(); // Clear existing options
        roles.forEach(role => {
            const option = `<option value="${role}" ${role === selectedRole ? 'selected' : ''}>${role}</option>`;
            roleDropdown.append(option);
        });
    }

    function handleEdit(event) {
        const userId = $(event.target).data('id');
        const currentUser = users.find(user => user.id === userId);

        $('#user-modal-title').text('Edit User');
        $('#user-name').val(currentUser.name);
        $('#user-email').val(currentUser.email);
        $('#user-role').val(currentUser.role);
        $('#user-id').val(currentUser.id);

        populateRoleDropdown(currentUser.role); // Populate dropdown for editing
        $('#user-modal').modal('show');
    }

    $('#user-form').submit(function (event) {
        event.preventDefault();

        const userId = $('#user-id').val();
        const userData = {
            id: userId ? parseInt(userId) : users.length + 1,
            name: $('#user-name').val(),
            email: $('#user-email').val(),
            role: $('#user-role').val(),
        };

        if (userId) {
            // Update user
            fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            })
                .then(fetchUsers);
        } else {
            // Add new user
            fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            })
                .then(fetchUsers);
        }

        $('#user-modal').modal('hide');
    });

    $('#add-user-btn').click(function () {
        $('#user-modal-title').text('Add User');
        $('#user-form')[0].reset();
        $('#user-id').val('');

        populateRoleDropdown(); // Populate dropdown for new user
        $('#user-modal').modal('show');
    });

    function handleDelete(event) {
        const userId = $(event.target).data('id');
    
        if (!confirm('Are you sure you want to delete this user?')) return;
    
        fetch(`/api/users/${userId}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete user');
                return response.json();
            })
            .then(() => fetchUsers()) // Refresh the table with updated data
            .catch(error => console.error('Error deleting user:', error));
    }

    $('#search-bar').on('input', function () {
        const query = $(this).val().toLowerCase();
        const filteredUsers = users.filter(user =>
            user.name.toLowerCase().includes(query)
        );
        renderTable(filteredUsers);
    });

    function sortUsers() {
        users.sort((a, b) => {
            const key = sortState.key;
            const order = sortState.order === 'asc' ? 1 : -1;
            if (a[key] < b[key]) return -1 * order;
            if (a[key] > b[key]) return 1 * order;
            return 0;
        });
        renderTable(users);

        // Update sort indicators
        $('.sortable').removeClass('asc desc');
        $(`#sort-by-${sortState.key}`).addClass(sortState.order);
    }

    $('#sort-by-id').click(function () {
        sortState.key = 'id';
        sortState.order = sortState.order === 'asc' ? 'desc' : 'asc';
        sortUsers();
    });

    $('#sort-by-name').click(function () {
        sortState.key = 'name';
        sortState.order = sortState.order === 'asc' ? 'desc' : 'asc';
        sortUsers();
    });

    fetchUsers();
});