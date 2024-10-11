export const handleSocketConnection = (io) => {
  const rooms = {}; // Keeps track of active rooms
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle room creation using the roomId from the frontend
    socket.on("create-room", (roomId, callback) => {
      if (!roomId) {
        callback({ success: false, message: "Invalid roomId received" });
        return;
      }

      // If room doesn't exist, create it and add the user
      if (!rooms[roomId]) {
        rooms[roomId] = [socket.id]; // Add the current user to the room
        socket.join(roomId); // Join the room
        callback({
          success: true,
          message: `Room ${roomId} created and joined`,
        });
        console.log(`Room ${roomId} created by user ${socket.id}`);
      } else {
        // If room exists, return an error (can customize behavior here)
        callback({ success: false, message: `Room ${roomId} already exists` });
      }
    });

    // Any user can join the room via the generated link
    socket.on("join-room", (roomId, callback) => {
      if (rooms[roomId] && rooms[roomId].length < 2) {
        rooms[roomId].push(socket.id); // Add User 2 (the joiner) to the room
        socket.join(roomId); // Socket joins the room
        callback({ joined: true, message: `Joined room ${roomId}` });

        // Notify both users that the room is full
        io.to(roomId).emit("room-full", true);
        console.log(`\nRoom ${roomId} joined by user ${socket.id} `);
      } else {
        callback({
          joined: false,
          message: `Room ${roomId} is full or doesn't exist`,
        });
      }
    });

    socket.on("send-location", (location) => {
      // Identify the room the user (socket) is in
      const roomId = Object.keys(rooms).find((room) =>
        rooms[room].includes(socket.id)
      );

      // If the user is part of a room
      if (roomId) {
        // Broadcast the location to the other user in the room
        socket.to(roomId).emit("receive-location", { id: socket.id, location });
        console.log(
          `Location ${location} sent from ${socket.id} to other user in room ${roomId}`
        );
      }
    });

    // Handle disconnects
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      const roomId = Object.keys(rooms).find((room) =>
        rooms[room].includes(socket.id)
      );
      if (roomId) {
        rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
        if (rooms[roomId].length === 0) {
          delete rooms[roomId]; // Delete room if empty
        }
      }
    });
  });
};
