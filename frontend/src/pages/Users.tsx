import { useEffect, useState } from "react";
import { getUsuarios } from "../services/api";

const Users = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    getUsuarios().then(data => setUsuarios(data));
  }, []);

  return (
    <div>
      <h2>Lista de usuarios</h2>
      <ul>
        {usuarios.map((u) => (
          <li key={u.id_usuario}>
            {u.nombre} - {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;