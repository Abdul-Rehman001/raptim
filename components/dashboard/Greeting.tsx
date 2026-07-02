"use client";

import { useEffect, useState } from "react";

export function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else if (hour < 21) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  return (
    <span className={!greeting ? "opacity-0" : ""}>
      {greeting || "Good morning"}, {name}
    </span>
  );
}
