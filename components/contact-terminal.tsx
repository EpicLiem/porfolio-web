"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { sendContactMessage } from "@/app/actions"; // Adjust path if needed
import { toast } from "sonner";

type TerminalStage = 
  | "idle" 
  | "prompt_name" 
  | "prompt_email" 
  | "prompt_message" 
  | "confirm" 
  | "submitting" 
  | "submitted" 
  | "error";

interface Line {
  text: string;
  type: "output" | "input";
}

// Basic email validation regex
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const initialWelcomeMessage = "Welcome to the contact terminal. Type 'contact', 'clear', or 'exit'.";

const ContactTerminal: React.FC = () => {
  const [lines, setLines] = useState<Line[]>([{ text: initialWelcomeMessage, type: "output" }]);
  const [currentInput, setCurrentInput] = useState("");
  const [stage, setStage] = useState<TerminalStage>("idle");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [instruction, setInstruction] = useState<string | null>(null); // State for instructional text
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, instruction, scrollToBottom]); // Scroll when instruction or lines change

  useEffect(() => {
    if (inputRef.current && stage !== 'submitting') {
      inputRef.current.focus();
    }
  }, [stage]); // Refocus on stage change

  // getPrompt determines the *prefix* for the input line
  const getPrompt = useCallback((): string => {
    // Otherwise, return the prompt based on the stage
    switch (stage) {
      case "prompt_name": return "Name: ";
      case "prompt_email": return "Email: ";
      case "prompt_message": return "Message: ";
      case "confirm": return "Confirm (yes/no/restart): ";
      case "submitting": return "Submitting..."; 
      case "submitted":
      case "error":
      case "idle":
      default:
        return "contact@portfolio:~$ ";
    }
  }, [stage]); // Add instruction dependency

  const addLine = useCallback((text: string, type: Line["type"]) => {
     setLines((prevLines) => [...prevLines, { text, type }]);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(event.target.value);
  };

  const handleFormSubmit = async (dataToSubmit: { name: string; email: string; message: string }) => {
    setInstruction(null); // Clear previous instruction
    setStage("submitting");
    addLine("Submitting message...", "output");

    const formDataToSend = new FormData();
    formDataToSend.append("name", dataToSubmit.name);
    formDataToSend.append("email", dataToSubmit.email);
    formDataToSend.append("message", dataToSubmit.message);

    try {
      const result = await sendContactMessage({ message: "", success: false }, formDataToSend);
      
      if (result.success) {
        addLine(`Success: ${result.message}`, "output");
        setStage("submitted");
        addLine("Thank you!", "output");
        setInstruction("Type 'contact' again or 'exit'."); // Use instruction state
      } else {
        addLine(`Error: ${result.error || result.message || "Unknown error"}`, "output");
        if (result.error) {
          try {
            const errors = JSON.parse(result.error);
            Object.entries(errors).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                addLine(` - ${field}: ${messages.join(", ")}`, "output");
              }
            });
          } catch (e) {}
        }
        setStage("error");
        setInstruction("Submission failed. Type 'restart', 'contact', or 'exit'."); // Use instruction state
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected network error occurred.";
      addLine(`Critical Error: ${errorMessage}`, "output");
      setStage("error");
      setInstruction("Submission failed. Type 'restart', 'contact', or 'exit'."); // Use instruction state
    } finally {
       if (stage !== 'error') { 
            setFormData({ name: "", email: "", message: "" });
       }
    }
  };

  const processInput = useCallback((input: string) => {
    const trimmedInput = input.trim();
    const currentPrompt = getPrompt(); // Get prompt based on *current* stage
    
    // Add the user's previous full input line (e.g., "Name: John Doe" or "contact@portfolio:~$ contact")
    addLine(`${currentPrompt}${trimmedInput}`, "input");
    setCurrentInput(""); // Clear the actual input field
    // setInstruction(null); // Don't clear instruction immediately, clear it when setting next one

    const command = trimmedInput.toLowerCase();

    if (command === "clear") {
      setLines([]);
      setStage("idle");
      setFormData({ name: "", email: "", message: "" });
      setInstruction(null); // Clear instruction
      addLine(initialWelcomeMessage, "output"); 
      return;
    }
    
    if (command === "exit" && stage !== 'submitting') {
        addLine("Exiting contact application...", "output");
        setStage("idle");
        setInstruction(null);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => addLine(initialWelcomeMessage, "output"), 50); 
        return;
    }

    let nextInstruction: string | null = null;

    switch (stage) {
      case "idle":
        if (command === "contact") {
          setStage("prompt_name");
          addLine("Starting contact process...", "output"); // Add status line
          nextInstruction = "Please enter your name:"; // Set instruction for next render
        } else if (trimmedInput) { 
          addLine(`command not found: ${command}`, "output");
          nextInstruction = "Type 'contact', 'clear', or 'exit'.";
        }
        break;

      case "prompt_name":
        if (!trimmedInput) {
            addLine("Name cannot be empty.", "output");
            nextInstruction = "Please enter your name:";
        } else {
            setFormData((prev) => ({ ...prev, name: trimmedInput }));
            setStage("prompt_email");
            nextInstruction = "Please enter your email:";
        }
        break;

      case "prompt_email":
        if (!EMAIL_REGEX.test(trimmedInput)) {
          addLine("Invalid email format.", "output");
          nextInstruction = "Please enter a valid email address:";
        } else {
          setFormData((prev) => ({ ...prev, email: trimmedInput }));
          setStage("prompt_message");
          nextInstruction = "Please enter your message:";
        }
        break;

      case "prompt_message":
        if (!trimmedInput) {
            addLine("Message cannot be empty.", "output");
            nextInstruction = "Please enter your message:";
        } else {
            const currentMessage = trimmedInput;
            setFormData((prev) => ({ ...prev, message: currentMessage }));
            setStage("confirm");
            addLine("--- Review ---", "output");
            addLine(`  Name: ${formData.name}`, "output"); 
            addLine(`  Email: ${formData.email}`, "output");
            addLine(`  Message: ${currentMessage}`, "output"); 
            addLine("----------------", "output");
            nextInstruction = "Is this correct? (yes/no/restart)";
        }
        break;

      case "confirm":
        if (command === "yes" || command === "y") {
          const finalData = { name: formData.name, email: formData.email, message: formData.message };
          handleFormSubmit(finalData); // This sets stage and might set instruction
        } else if (command === "no" || command === "n" || command === "restart") {
          addLine("Restarting process...", "output");
          setFormData({ name: "", email: "", message: "" });
          setStage("prompt_name");
          nextInstruction = "Please enter your name:";
        } else {
          addLine("Invalid input.", "output");
          nextInstruction = "Please enter 'yes', 'no', or 'restart'.";
        }
        break;

      case "submitted":
      case "error":
         // Instructions are set by handleFormSubmit in these cases
         if (command === "contact") {
           setStage("prompt_name");
           addLine("Starting new contact process...", "output");
           nextInstruction = "Please enter your name:";
         } else if (command === 'restart' && stage === 'error') {
           addLine("Retrying submission...", "output");
           handleFormSubmit(formData); 
         } else if (trimmedInput) {
           addLine(`Command not found: ${command}`, "output");
           // Re-set the instruction based on the current state
           nextInstruction = stage === 'submitted' ? "Type 'contact' or 'exit'." : "Type 'restart', 'contact', or 'exit'.";
         }
        break;

      case "submitting":
        // Ignore input
        break;
    }

    // Update instruction state *after* processing logic
    // This ensures the instruction displayed corresponds to the *next* action
    setInstruction(nextInstruction);

  }, [stage, formData, addLine, handleFormSubmit, getPrompt]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && stage !== "submitting") {
       // Allow submitting blank input only if the command is meant to be blank (e.g., confirming yes)
       // Let processInput handle blank checks for name/message etc.
       processInput(currentInput);
    }
    // TODO: Implement command history (ArrowUp/ArrowDown)
  };

  return (
    <div 
      className="h-full flex flex-col font-mono text-sm cursor-text" 
      onClick={() => inputRef.current?.focus()} 
    >
      <div className="flex-grow overflow-y-auto pr-2"> {/* Main scrollable area */}
        {/* Render historical lines */}
        {lines.map((line, index) => (
          <div
            key={index}
            className="whitespace-pre-wrap text-amber-200"
          >
            {line.text}
          </div>
        ))}
        
        <div className="grid grid-cols-[auto_1fr] mt-0 items-center w-full gap-x-2"> {/* Use Grid, define columns, add gap */}
          {/* Column 1: Always show prompt prefix */}
          <span className="text-amber-500">{getPrompt()}</span>

          {/* Column 2: Input field */}
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={`bg-transparent text-amber-100 caret-amber-500 outline-none border-none p-0 ${
              stage === "submitting" ? "cursor-wait" : ""
            }`}
            disabled={stage === "submitting"}
            autoFocus
            spellCheck="false"
          />
        </div>

        <div ref={terminalEndRef} /> {/* Scroll target */}
      </div>
    </div>
  );
};

export default ContactTerminal; 