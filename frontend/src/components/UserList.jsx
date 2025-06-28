import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserForm from './UserForm';

function UserList() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5000/api/users');
    setUsers(res.data);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/users/${id}`);
    fetchUsers();
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleSaved = () => {
    fetchUsers();
    setEditingUser(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Liste des utilisateurs</h2>
      <UserForm user={editingUser} onSave={handleSaved} />

      <table>
        <thead>
          <tr>
            <th>Nom</th><th>Email</th><th>Rôle</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleEdit(u)}>Modifier</button>
                <button onClick={() => handleDelete(u.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;
