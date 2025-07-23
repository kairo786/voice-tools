"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Roboto } from "next/font/google";
import Spline from '@splinetool/react-spline/next';
import { useButton } from "../context/buttoncontext";
import { useOffer } from "../context/offercontext";
import { useSocket } from "../context/SocketContext";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal"],
  display: "swap",
});

const ChatPage = () => {
  const { setCallState } = useButton();
  const {setIncomingOffer} = useOffer();
  const socket = useSocket();
  const { isLoaded, user } = useUser();
  const route = useRouter();
  const [users, setUsers] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  // Load lord-icon script
  useEffect(() => {
    const loadLordIconScript = async () => {
      const lottie = await import("lottie-web");
      const { defineElement } = await import("lord-icon-element");
      defineElement(lottie);
    };
    
    loadLordIconScript();
  }, []);

  // useEffect(() => {
  //   const handlePopState = () => {
  //     setSelectedUser(null);
  //   };
  //   window.addEventListener("popstate", handlePopState);
  //   return () => window.removeEventListener("popstate", handlePopState);
  // }, []);
  // Connect socket and listen for user list
useEffect(() => {
  if (!socket) return;
  const handleUserList = (userList) => {
    console.log("✅ user-list received", userList);
    setUsers(userList);
  };
  // 🔁 Request latest user list when listener is set up
  socket.on("user-list", handleUserList);
  socket.emit("request-user-list"); // ✅ explicitly request
  return () => {
    socket.off("user-list", handleUserList);
  };
}, [socket]);


// 🔔 incoming offer handler
useEffect(() => {
  if (!socket || !isLoaded || !user?.fullName || !user?.imageUrl) return;

  const offerHandler = ({ from, to, offer }) => {
    const confirmCall = window.confirm("📞 You are receiving a call. Accept?");
    if (confirmCall) {
      setIncomingOffer({ from, to, offer });
      route.push("/call");
    }
  };

  socket.on("offer", offerHandler);

  return () => {
    socket.off("offer", offerHandler); 
  };
}, [socket, isLoaded, user?.fullName, user?.imageUrl]);

 

  // Get self ID and other users
  const selfId = Object.entries(users).find(
    ([id, data]) => data.username === user?.fullName
  )?.[0];

  const otherUsers = Object.entries(users)
    .filter(([id, data]) => data.username !== user?.fullName)
    .map(([id, data]) => ({
      id,
      username: data.username,
      imgurl: data.imgurl,
    }));

  return (
    <div className="flex h-screen bg-[#0d1117] text-white">
      {/* LEFT USERS PANEL */}
      
      <div className={`md:min-w-86 p-4 border-r border-gray-700 overflow-y-auto w-full
    ${selectedUser ? "bg-[#161b22] hidden md:block" : "bg-[#161b22]"}`}>
      <h2 className="text-2xl font-bold mb-4">Chats</h2>

        {/* SELF USER DISPLAY */}
        {selfId && (
          <div className="flex items-center mb-4 pl-4 gap-6 h-16 p-2 rounded-md bg-green-800/20">
            <div className="w-12 h-12 rounded-full object-cover bg-gray-500 flex items-center text-center justify-center">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: {
                      width: "45px",
                      height: "45px",
                    },
                  },
                }}
              /></div>
            {/* w-12 h-12 rounded-full object-cover bg-gray-600 */}
            <div className={roboto.className}>
              <span className="font-semibold">{users[selfId].username}</span>
            </div>
            <span className="text-xs text-green-300">(You)</span>
          </div>
        )}

        {/* OTHER USERS */}
        {otherUsers.length === 0 ? (
          <div className="text-gray-400">No users online</div>
        ) : (
          otherUsers.map((user) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={user.id}
              className={`cursor-pointer flex items-center justify-between px-4 py-3 mb-3 rounded-lg bg-gray-800/60 hover:bg-gray-700 transition ${selectedUser?.id === user.id ? "ring-2 ring-green-500" : ""
                }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={user.imgurl}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover bg-gray-600"
                />
                <div>
                  <div className="font-semibold">{user.username}</div>
                  <div className="text-xs text-gray-400">Online</div>
                </div>
              </div>

              {/* ICONS */}
              <div className="flex gap-2">
                <lord-icon
                onClick ={()=>{
                  setSelectedUser(user.id)
                  // history.pushState({ modalOpen: true }, "");
                }}
                  src="https://cdn.lordicon.com/aryhqlzy.json"
                  trigger="hover"
                  colors="primary:#00ff9f"
                  style={{
                    width: "28px",
                    height: "28px",
                    padding: "2px",
                    background: "#1f2937",
                    borderRadius: "6px",
                  }}
                />
                <lord-icon

                  <lord-icon
                  onClick={() => {
                    setSelectedUser(user.id);
                    setRole("caller");
                    setCallState({ clicked: true, from: selfId, to: user.id });
                    socket.emit("calling",{"from":selfId ,"to" :user.id});
                    // route.push("/call");
                  }}

                  src="https://cdn.lordicon.com/ljmewfwu.json"
                  trigger="hover"
                  colors="primary:#00ff9f"
                  style={{
                    width: "28px",
                    height: "28px",
                    padding: "2px",
                    background: "#1f2937",
                    borderRadius: "6px",
                  }}
                />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* RIGHT CHAT PANEL */}
      <div className="flex-1 bg-cover bg-center relative md:min-w-3/4">
        {selectedUser ? (
          <div className="h-full flex flex-col justify-center items-center text-center">
            <h1 className="text-3xl font-bold mb-3">{users[selectedUser].username}</h1>
            <p className="text-gray-300 text-sm">Chat will appear here.</p>
          </div>
        ) : (
          <div className="h-full flex justify-center items-center relative overflow-hidden ml-0">
            {/* IFRAME WRAPPER */}
            <div className="h-screen relative overflow-hidden hidden md:block">
              <iframe
                src="https://my.spline.design/cutecomputerfollowcursor-CJSVMphXRTYr7F3TdIlLm8Wa/"
                frameBorder="0"
                width="1200"
                height="1200"
                style={{
                  transform: "scale(0.6)",
                  transformOrigin: "top center",
                  pointerEvents: "auto",
                }}
              />

              {/* ✅ TEXT OVERLAY ON TOP OF IFRAME (POSITIONED LOWER) */}
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20 text-center">
                <h2 className="text-2xl text-gray-300">No chat selected</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Click on a user to start chatting
                </p>
              </div>
            </div>
          </div>


        )}
      </div>
    </div>
  );
};

export default ChatPage;




//app/call
// "use client";
// import { useRef, useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import CallControls from "@/components/CallControls";
// import TopBar from "@/components/Topbar";
// import { useButton } from "@/app/context/buttoncontext";
// import { useSocket } from "../context/SocketContext";
// import { useOffer } from "../context/offercontext";

// // Peer Connection Factory with scoped instances
// const PeerConnection = (() => {
//   const peerConnectionMap = new Map();

//   const createPeerConnection = (key, localStream, remoteRef, socket, callState, incomingOffer) => {
//     const config = {
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     };
//     const pc = new RTCPeerConnection(config);

//     if (localStream) {
//       localStream.getTracks().forEach((track) => {
//         pc.addTrack(track, localStream);
//       });
//     }

//     pc.ontrack = (event) => {
//       if (remoteRef?.current) {
//         remoteRef.current.srcObject = event.streams[0];
//         console.log("📺 Remote stream set:", event.streams[0]);
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         const to = key === "incoming" ? incomingOffer?.from : callState.to;
//         const from = key === "incoming" ? incomingOffer?.to : callState.from;
//         socket.emit("icecandidate", { from, to, candidate: event.candidate });
//       }
//     };

//     peerConnectionMap.set(key, pc);
//     return pc;
//   };

//   return {
//     getInstance: (key, localStream, remoteRef, socket, callState, incomingOffer) => {
//       if (!peerConnectionMap.has(key)) {
//         return createPeerConnection(key, localStream, remoteRef, socket, callState, incomingOffer);
//       }
//       return peerConnectionMap.get(key);
//     },
//   };
// })();

// export default function Callpage() {
//   const { callState } = useButton();
//   const { incomingOffer } = useOffer();
//   const socket = useSocket();
//   const localRef = useRef();
//   const remoteRef = useRef();
//   const [tempofer, setTempofer] = useState(false);
//   const [localStream, setLocalStream] = useState(null);
//   const offerHandledRef = useRef(false);

//   useEffect(() => {
//     console.log("socket id is : ", socket?.id);
//   }, [socket?.id]);

//   useEffect(() => {
//     if (!socket) return;
//     socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
//     socket.on("disconnect", () => console.log("❌ Socket disconnected", socket.id));
//     return () => {
//       socket.off("connect");
//       socket.off("disconnect");
//     };
//   }, []);

//   useEffect(() => {
//     async function getStream() {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         if (localRef.current) {
//           localRef.current.srcObject = stream;
//           setLocalStream(stream);
//           if (callState.clicked) setTempofer(true);
//         }
//       } catch (err) {
//         console.error("🎥 Media access error:", err);
//       }
//     }
//     getStream();
//   }, []);

//   useEffect(() => {
//     if (!socket || !localStream || !callState.clicked) return;

//     const startCall = async () => {
//       const pc = PeerConnection.getInstance("outgoing", localStream, remoteRef, socket, callState, incomingOffer);
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
//       socket.emit("offer", {
//         from: callState.from,
//         to: callState.to,
//         offer: pc.localDescription,
//       });
//     };

//     startCall();
//   }, [tempofer]);

//   useEffect(() => {
//     if (!incomingOffer || !localStream || offerHandledRef.current) return;

//     offerHandledRef.current = true;

//     const pc = PeerConnection.getInstance("incoming", localStream, remoteRef, socket, callState, incomingOffer);

//     const handleIncomingOffer = async () => {
//       const { from, to, offer } = incomingOffer;
//       await pc.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
//       socket.emit("answer", { from: to, to: from, answer: pc.localDescription });
//     };

//     handleIncomingOffer();
//   }, [incomingOffer, localStream]);

// useEffect(() => {
//   if (!socket || !localStream || !remoteRef?.current || !callState.clicked) return;

//   const pc = PeerConnection.getInstance("outgoing", localStream, remoteRef, socket, callState, incomingOffer);
//   let pendingCandidates = [];

//   // ⬇️ Answer received from receiver
//   socket.on("answer", async ({ answer }) => {
//     if (pc.signalingState !== "stable") {
//       await pc.setRemoteDescription(new RTCSessionDescription(answer));
//       console.log("✅ Answer applied (caller)");

//       // 🧊 Apply buffered ICE
//       for (const candidate of pendingCandidates) {
//         try {
//           await pc.addIceCandidate(new RTCIceCandidate(candidate));
//           console.log("📦 Buffered ICE added (caller)");
//         } catch (err) {
//           console.error("❌ ICE error (caller):", err);
//         }
//       }
//       pendingCandidates = [];
//     } else {
//       console.warn("⚠️ Ignored answer: already stable (caller)");
//     }
//   });

//   // ⬇️ ICE candidates from receiver
//   socket.on("icecandidate", async ({ candidate }) => {
//     if (pc.remoteDescription && pc.remoteDescription.type) {
//       try {
//         await pc.addIceCandidate(new RTCIceCandidate(candidate));
//         console.log("❄️ ICE added (caller)");
//       } catch (err) {
//         console.error("❌ ICE add failed (caller):", err);
//       }
//     } else {
//       pendingCandidates.push(candidate);
//       console.log("📦 ICE buffered (caller)");
//     }
//   });

//   return () => {
//     socket.off("answer");
//     socket.off("icecandidate");
//   };
// }, [localStream, callState.clicked]);

// useEffect(() => {
//   if (!socket || !localStream || !remoteRef?.current || !incomingOffer) return;

//   const pc = PeerConnection.getInstance("incoming", localStream, remoteRef, socket, callState, incomingOffer);
//   let pendingCandidates = [];

//   // Receiver requests buffered ICE from backend
//   socket.emit("request-icecandidates");

//   // ⬇️ ICE candidates from caller
//   socket.on("icecandidate", async ({ candidate }) => {
//     if (pc.remoteDescription && pc.remoteDescription.type) {
//       try {
//         await pc.addIceCandidate(new RTCIceCandidate(candidate));
//         console.log("❄️ ICE added (receiver)");
//       } catch (err) {
//         console.error("❌ ICE add failed (receiver):", err);
//       }
//     } else {
//       pendingCandidates.push(candidate);
//       console.log("📦 ICE buffered (receiver)");
//     }
//   });

//   return () => {
//     socket.off("icecandidate");
//   };
// }, [incomingOffer, localStream]);


//   const [isSwapped, setIsSwapped] = useState(false);
//   const [size, setSize] = useState({ width: 220, height: 150 });
//   const [resizingEdge, setResizingEdge] = useState(null);

//   const startResize = (edge, e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setResizingEdge(edge);

//     const startX = e.clientX;
//     const startY = e.clientY;
//     const startWidth = size.width;
//     const startHeight = size.height;

//     const doDrag = (e) => {
//       if (edge === "right") setSize({ ...size, width: Math.max(150, startWidth + (e.clientX - startX)) });
//       if (edge === "bottom") setSize({ ...size, height: Math.max(100, startHeight + (e.clientY - startY)) });
//       if (edge === "left") setSize({ ...size, width: Math.max(150, startWidth - (e.clientX - startX)) });
//       if (edge === "top") setSize({ ...size, height: Math.max(100, startHeight - (e.clientY - startY)) });
//     };

//     const stopDrag = () => {
//       setResizingEdge(null);
//       window.removeEventListener("mousemove", doDrag);
//       window.removeEventListener("mouseup", stopDrag);
//     };

//     window.addEventListener("mousemove", doDrag);
//     window.addEventListener("mouseup", stopDrag);
//   };

//   const handleSwap = () => {
//     if (!resizingEdge) setIsSwapped((prev) => !prev);
//   };

//   return (
//     <div className="relative w-full h-screen bg-black overflow-hidden">
//       <div className="absolute top-0 w-full z-10">
//         <TopBar />
//       </div>

//       <motion.video
//         ref={localRef}
//         autoPlay
//         muted
//         playsInline
//         onClick={handleSwap}
//         style={{ borderRadius: 10, border: "2px solid #333" }}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.3 }}
//         className="absolute inset-0 w-full h-max-auto object-cover cursor-pointer z-0"
//       />

//       <motion.div
//         className="absolute top-16 right-4 z-10 rounded-lg border-2 border-white overflow-hidden group"
//         style={{ width: size.width, height: size.height }}
//         onClick={handleSwap}
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.3 }}
//       >
//         <video
//           ref={remoteRef}
//           autoPlay
//           muted
//           playsInline
//           className="w-full h-full object-cover"
//           style={{ borderRadius: 10, border: "2px solid #333" }}
//         />
//         <div onMouseDown={(e) => startResize("right", e)} className="absolute top-0 right-0 w-2 h-full cursor-ew-resize z-20" />
//         <div onMouseDown={(e) => startResize("left", e)} className="absolute top-0 left-0 w-2 h-full cursor-ew-resize z-20" />
//         <div onMouseDown={(e) => startResize("bottom", e)} className="absolute bottom-0 left-0 h-2 w-full cursor-ns-resize z-20" />
//         <div onMouseDown={(e) => startResize("top", e)} className="absolute top-0 left-0 h-2 w-full cursor-ns-resize z-20" />
//       </motion.div>

//       <div className="absolute bottom-2 w-full z-10">
//         <CallControls />
//       </div>
//     </div>
//   );
// }
