"use client";



export function Greeting({ name }: { name: string }) {
  const hour = new Date().getHours();
  
  let greeting = "";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";
  else if (hour < 21) greeting = "Good evening";
  else greeting = "Good night";

  return (
    <span suppressHydrationWarning>
      {greeting}, {name}
    </span>
  );
}
