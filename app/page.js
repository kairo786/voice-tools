// app/page.tsx
"use client"
import JarvisChat from "./components/jarvischat";

export default function Home() {
//  let a = window.confirm("hi");
  return (
    <main>
      <h1 className="text-xl font-bold text-center my-4">Jarvis Chat</h1>
      {/* <JarvisChat /> */}
      <div className="text-6xl md:text-4xl ">
  {/* <!-- छोटे स्क्रीन पर small text, medium पर बड़ा, large पर और बड़ा --> */}
  hello friends
       </div>
<div className="flex flex-col md:flex-row">
  <div className="w-full bg-red-300 md:w-1/2">Left</div>
  <div className="w-full bg-green-500 md:w-1/2">Right</div>
</div>
{/* <div className="hidden md:block">hi helolo {a}</div> */}
    </main>
  );
}