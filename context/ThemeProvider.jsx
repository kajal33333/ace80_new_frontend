"use client"
import React, { useState, useEffect } from "react";
import ThemeContext from "./ThemeContext";
import { ThemeProvider as ShadcnProvider } from "next-themes"; // if using ShadCN's dark mode

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  // Load theme from localStorage (optional)
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ShadcnProvider attribute="class" defaultTheme="light">
        {children}
      </ShadcnProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
