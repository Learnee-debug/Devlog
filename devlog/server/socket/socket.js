const initSocket = (io) => {
  io.on('connection', (socket) => {
    // Client joins a project room to receive live updates
    socket.on('join:project', (projectId) => {
      socket.join(projectId);
    });

    socket.on('leave:project', (projectId) => {
      socket.leave(projectId);
    });

    socket.on('disconnect', () => {});
  });
};

module.exports = { initSocket };
