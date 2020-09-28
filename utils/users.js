const users = [];

const getJoinedUser = (id, username, room) => {
  const user = { id, username, room };

  users.push(user);

  return user;
};

const getCurrentUser = id => users.find(user => user.id === id);

// remove the user who leaves room from the array
const getDisconnectedUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    const deletedUser = users.splice(index, 1)[0];

    return deletedUser;
  }
};

const getUsersInARoom = room => users.filter(user => user.room === room);

module.exports = {
  getJoinedUser,
  getCurrentUser,
  getDisconnectedUser,
  getUsersInARoom
};
