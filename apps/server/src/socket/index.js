/**
 * Socket.io server init.
 * Rooms: user:{userId} | hackathon:{hackathonId} | team:{teamId}
 *
 * Events emitted by server (see Doc 5 §7 for full table):
 *   registration:created   → hackathon:{id}   (organizer dashboard counter)
 *   registration:updated   → user:{id}         (participant status badge)
 *   team:memberJoined      → team:{id}
 *   team:memberRemoved     → team:{id}
 *   team:ownershipTransferred → team:{id}
 *   submission:locked      → hackathon:{id}
 *   review:submitted       → hackathon:{id}
 *   leaderboard:updated    → hackathon:{id}
 *   results:published      → hackathon:{id}
 *   notification:new       → user:{id}
 *   message:new            → team:{id}
 */
export function initSocket(io) {
  io.on('connection', (socket) => {
    const { userId } = socket.handshake.auth;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Client joins hackathon room (e.g. when viewing a hackathon page)
    socket.on('join:hackathon', (hackathonId) => {
      socket.join(`hackathon:${hackathonId}`);
    });

    socket.on('leave:hackathon', (hackathonId) => {
      socket.leave(`hackathon:${hackathonId}`);
    });

    // Client joins team room (team workspace page)
    socket.on('join:team', (teamId) => {
      socket.join(`team:${teamId}`);
    });

    socket.on('leave:team', (teamId) => {
      socket.leave(`team:${teamId}`);
    });

    socket.on('disconnect', () => {
      // Socket.io automatically removes the socket from all rooms on disconnect
    });
  });
}

/**
 * Emit a socket event to a specific room.
 * Always called AFTER the corresponding DB write completes (never optimistic).
 * @param {import('socket.io').Server} io
 * @param {string} room
 * @param {string} event
 * @param {object} payload
 */
export function emitToRoom(io, room, event, payload) {
  io.to(room).emit(event, payload);
}

/**
 * Emit a notification to a specific user's private room.
 */
export function emitToUser(io, userId, event, payload) {
  io.to(`user:${userId}`).emit(event, payload);
}
