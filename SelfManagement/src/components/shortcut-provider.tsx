
"use client"

import React, { createContext, useContext, useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useRouter } from "next/navigation";

type ShortcutConfig = {
    id: string;
    keys: string;
    description: string;
    action: () => void;
};

type ShortcutContextType = {
    shortcuts: ShortcutConfig[];
    registerShortcut: (config: ShortcutConfig) => void;
    updateKeys: (id: string, newKeys: string) => void;
};

const ShortcutContext = createContext<ShortcutContextType | undefined>(undefined);

export const ShortcutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();

    const defaultConfigs: Record<string, ShortcutConfig> = {
        "go-dashboard": { id: "go-dashboard", keys: "g d", description: "Go to Dashboard", action: () => router.push("/") },
        "go-board": { id: "go-board", keys: "g b", description: "Go to Project Board", action: () => router.push("/board") },
        "go-gantt": { id: "go-gantt", keys: "g t", description: "Go to Timeline", action: () => router.push("/gantt") },
        "go-schedule": { id: "go-schedule", keys: "g s", description: "Go to Schedule", action: () => router.push("/schedule") },
        "go-tasks": { id: "go-tasks", keys: "g l", description: "Go to Task List", action: () => router.push("/tasks") },
        "new-task": { id: "new-task", keys: "n", description: "New Task", action: () => console.log("New Task Shortcut Triggered") },
        "search": { id: "search", keys: "/", description: "Search", action: () => console.log("Search Shortcut Triggered") },
    };

    const [configs, setConfigs] = useState<Record<string, ShortcutConfig>>(defaultConfigs);
    const [isLoaded, setIsLoaded] = useState(false);

    // Persistence
    useEffect(() => {
        const saved = localStorage.getItem("app-shortcuts");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge with default actions
                const merged = { ...defaultConfigs };
                Object.keys(parsed).forEach(id => {
                    if (merged[id]) {
                        merged[id].keys = parsed[id].keys;
                    }
                });
                setConfigs(merged);
            } catch (e) {
                console.error("Failed to parse shortcuts", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            const stripped = Object.fromEntries(
                Object.entries(configs).map(([id, cfg]) => [id, { keys: cfg.keys }])
            );
            localStorage.setItem("app-shortcuts", JSON.stringify(stripped));
        }
    }, [configs, isLoaded]);

    // We use useHotkeys for each config
    Object.values(configs).forEach(config => {
        useHotkeys(config.keys, (e) => {
            e.preventDefault();
            config.action();
        }, {
            enableOnFormTags: false,
        });
    });

    const registerShortcut = (config: ShortcutConfig) => {
        setConfigs(prev => ({ ...prev, [config.id]: config }));
    };

    const updateKeys = (id: string, newKeys: string) => {
        setConfigs(prev => {
            if (!prev[id]) return prev;
            return { ...prev, [id]: { ...prev[id], keys: newKeys } };
        });
    };

    return (
        <ShortcutContext.Provider value={{ shortcuts: Object.values(configs), registerShortcut, updateKeys }}>
            {children}
        </ShortcutContext.Provider>
    );
};

export const useShortcuts = () => {
    const context = useContext(ShortcutContext);
    if (!context) throw new Error("useShortcuts must be used within a ShortcutProvider");
    return context;
};
