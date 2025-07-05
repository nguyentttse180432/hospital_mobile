// React Native compatible SignalR-like connection
const signalRConnect = async (checkupRecordDetail) => {
  try {
    // Create WebSocket connection
    const ws = new WebSocket("wss://hair-salon-fpt.io.vn/hubs/medicalservices");

    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        console.log("WebSocket Connected");

        // Send SignalR handshake
        const handshake =
          JSON.stringify({ protocol: "json", version: 1 }) + "\x1e";
        ws.send(handshake);

        // Wait a bit then send join group message
        setTimeout(() => {
          const joinMessage =
            JSON.stringify({
              type: 1,
              target: "JoinCheckupGroup",
              arguments: [checkupRecordDetail.code],
            }) + "\x1e";

          ws.send(joinMessage);
          console.log(`Joined group: ${checkupRecordDetail.code}`);
        }, 100);

        resolve({
          connection: ws,
          on: (eventName, callback) => {
            ws.onmessage = (event) => {
              try {
                // SignalR messages can end with ASCII 30 (record separator)
                const cleanMessage = event.data.replace(/\x1e$/, "");

                // Skip handshake response and ping messages
                if (
                  cleanMessage === "{}" ||
                  cleanMessage === "" ||
                  cleanMessage.startsWith('{"type":6}')
                ) {
                  return;
                }

                const data = JSON.parse(cleanMessage);
                console.log("Parsed WebSocket data:", data);

                // Check for SignalR invocation message format
                if (data.type === 1 && data.target === eventName) {
                  callback(data.arguments[0]);
                }
              } catch (error) {
                console.error("Error parsing WebSocket message:", error);
                console.error("Raw message was:", event.data);
              }
            };
          },
          invoke: (methodName, ...args) => {
            const message =
              JSON.stringify({
                type: 1,
                target: methodName,
                arguments: args,
              }) + "\x1e";
            ws.send(message);
          },
          stop: () => {
            ws.close();
          },
        });
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        reject(error);
      };

      ws.onclose = () => {
        console.log("WebSocket Disconnected");
      };
    });
  } catch (error) {
    console.error("SignalR Connection Error:", error);
    throw error;
  }
};

// React Native compatible SignalR-like connection for appointment updates
export const signalRConnectForAppointments = async () => {
  try {
    // Create WebSocket connection
    const ws = new WebSocket("wss://hair-salon-fpt.io.vn/hubs/medicalservices");

    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        console.log("WebSocket Connected for Appointments");

        // Send SignalR handshake
        const handshake =
          JSON.stringify({ protocol: "json", version: 1 }) + "\x1e";
        ws.send(handshake);

        // Wait a bit then send join group message
        setTimeout(() => {
          const joinMessage =
            JSON.stringify({
              type: 1,
              target: "JoinAppointmentUpdatesGroup",
              arguments: ["AllAppointments"], // Join a general group for all appointments
            }) + "\x1e";

          ws.send(joinMessage);
          console.log("Joined appointments update group");
        }, 100);

        resolve({
          connection: ws,
          on: (eventName, callback) => {
            ws.onmessage = (event) => {
              try {
                // SignalR messages can end with ASCII 30 (record separator)
                const cleanMessage = event.data.replace(/\x1e$/, "");

                // Skip handshake response and ping messages
                if (
                  cleanMessage === "{}" ||
                  cleanMessage === "" ||
                  cleanMessage.startsWith('{"type":6}')
                ) {
                  return;
                }

                const data = JSON.parse(cleanMessage);
                console.log("Parsed WebSocket data:", data);

                // Check for SignalR invocation message format
                if (data.type === 1 && data.target === eventName) {
                  callback(data.arguments[0]);
                }
              } catch (error) {
                console.error("Error parsing WebSocket message:", error);
                console.error("Raw message was:", event.data);
              }
            };
          },
          invoke: (methodName, ...args) => {
            const message =
              JSON.stringify({
                type: 1,
                target: methodName,
                arguments: args,
              }) + "\x1e";
            ws.send(message);
          },
          stop: () => {
            ws.close();
          },
        });
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        reject(error);
      };

      ws.onclose = () => {
        console.log("WebSocket Disconnected");
      };
    });
  } catch (error) {
    console.error("SignalR Connection Error:", error);
    throw error;
  }
};

export default signalRConnect;
