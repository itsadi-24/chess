const socket = io();
// this connects the frontend with backend automatically
// whenever we send something from frontend to backend we use socket.emit and we receive tahat on backend

socket.emit('chessboard');
// this is sending the chessboard event to the backend
// this is the event that is being listened on the backend
