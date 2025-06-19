import Link from "next/link";
import { useState, useEffect } from "react";

import { Spinner } from "components";
import { Layout } from "components/users";
import { userService } from "services";

export default Index;

function Index() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    userService.getAll().then((x) => setUsers(x));
  }, []);

  function deleteUser(id) {
    setUsers(
      users.map((x) => {
        if (x.id === id) {
          x.isDeleting = true;
        }
        return x;
      })
    );
    userService.delete(id).then(() => {
      setUsers((users) => users.filter((x) => x.id !== id));
    });
  }

  return (
    <Layout>
      <Link href="/users/add" className="btn btn-sm btn-success mb-2">
        Add Agent
      </Link>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th style={{ width: "10%" }}>First Name</th>
              <th style={{ width: "10%" }}>Last Name</th>
              <th style={{ width: "10%" }}>Email</th>
              <th style={{ width: "10%" }}>Balance</th>
              <th style={{ width: "10%" }}>Level</th>
              <th style={{ width: "10%" }}>Code</th>
              <th style={{ width: "10%" }}></th>
            </tr>
          </thead>
          <tbody>
            {users &&
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>€ {user.balance}</td>
                  <td>{user.level}</td>
                  <td>{user.code}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <Link
                      href={`/users/edit/${user.id}`}
                      className="btn btn-sm btn-primary me-1"
                    >
                      <i className="fa fa-pencil"></i>
                    </Link>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="btn btn-sm btn-danger btn-delete-user"
                      style={{ width: "60px" }}
                      disabled={user.isDeleting}
                    >
                      {user.isDeleting ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <i className="fa fa-times"></i>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            {!users && (
              <tr>
                <td colSpan="7">
                  <Spinner />
                </td>
              </tr>
            )}
            {users && !users.length && (
              <tr>
                <td colSpan="7" className="text-center">
                  <div className="p-2">No Users To Display</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
