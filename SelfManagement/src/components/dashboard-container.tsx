'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TaskTree } from './task-tree';
import { VerticalScheduler } from './vertical-scheduler';
import { GanttChart } from './gantt-chart';
import { Button } from '@/components/ui/button';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import dynamic from 'next/dynamic';

const ResponsiveGridLayout = dynamic(async () => {
    const mod = await import('react-grid-layout') as any;
    const Responsive = mod.Responsive || (mod.default ? mod.default.Responsive : null);
    const WidthProvider = mod.WidthProvider || (mod.default ? mod.default.WidthProvider : null);

    if (!WidthProvider || !Responsive) {
        return function Fallback() { return null; };
    }

    return WidthProvider(Responsive);
}, { ssr: false }) as any;

import {
    Layout,
    Plus,
    X,
    Settings2,
    Calendar,
    Kanban,
    Clock,
    Activity,
    Save,
    GripVertical
} from 'lucide-react';



type PanelType = 'board' | 'schedule' | 'gantt' | 'activity';

interface PanelConfig {
    i: string;
    type: PanelType;
    x: number;
    y: number;
    w: number;
    h: number;
}

const DEFAULT_LAYOUT: PanelConfig[] = [
    { i: '1', type: 'board', x: 0, y: 0, w: 6, h: 4 },
    { i: '2', type: 'schedule', x: 6, y: 0, w: 6, h: 4 },
];

export function DashboardContainer({ initialTasks }: { initialTasks: any[] }) {
    const [panels, setPanels] = useState<PanelConfig[]>(DEFAULT_LAYOUT);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Persistence
    useEffect(() => {
        const saved = localStorage.getItem('dashboard-layout-grid-v1');
        if (saved) {
            try {
                setPanels(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load layout", e);
            }
        }
        setIsLoaded(true);
    }, []);

    const saveLayout = (newPanels: PanelConfig[]) => {
        setPanels(newPanels);
        localStorage.setItem('dashboard-layout-grid-v1', JSON.stringify(newPanels));
    };

    const handleLayoutChange = (layout: any) => {
        // Sync layout changes (x, y, w, h) back to our panel state
        const updatedPanels = panels.map(panel => {
            const layoutItem = layout.find((l: any) => l.i === panel.i);
            if (layoutItem) {
                return {
                    ...panel,
                    x: layoutItem.x,
                    y: layoutItem.y,
                    w: layoutItem.w,
                    h: layoutItem.h
                };
            }
            return panel;
        });
        saveLayout(updatedPanels);
    };

    const addPanel = (type: PanelType) => {
        const newId = Math.random().toString(36).substr(2, 9);
        // Find first available spot is handled by RGL usually, but we'll just put it at bottom
        const newPanel: PanelConfig = {
            i: newId,
            type,
            x: 0,
            y: Infinity, // Put at bottom
            w: 6,
            h: 4,
        };
        saveLayout([...panels, newPanel]);
    };

    const removePanel = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const updated = panels.filter(p => p.i !== id);
        saveLayout(updated);
    };

    if (!isLoaded) return <div className="flex-1 bg-zinc-950" />;

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 overflow-hidden">
            {/* Dashboard Header / Toolbar */}
            <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 shrink-0 z-30 shadow-xl">
                <div className="flex items-center gap-2">
                    <Layout className="w-5 h-5 text-blue-500" />
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-100">Workspace Dashboard</h2>
                </div>

                <div className="flex items-center gap-3">
                    {isEditMode ? (
                        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 p-1 rounded-lg animate-in fade-in slide-in-from-right-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addPanel('board')}
                                className="h-8 text-[10px] font-bold text-blue-400 hover:bg-blue-500/20"
                            >
                                <Kanban className="w-3 h-3 mr-1.5" /> BOARD
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addPanel('schedule')}
                                className="h-8 text-[10px] font-bold text-blue-400 hover:bg-blue-500/20"
                            >
                                <Clock className="w-3 h-3 mr-1.5" /> SCHEDULER
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addPanel('gantt')}
                                className="h-8 text-[10px] font-bold text-blue-400 hover:bg-blue-500/20"
                            >
                                <Calendar className="w-3 h-3 mr-1.5" /> GANTT
                            </Button>
                            <div className="w-px h-4 bg-blue-500/30 mx-1" />
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setIsEditMode(false)}
                                className="h-8 text-[10px] font-bold bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                            >
                                <Save className="w-3 h-3 mr-1.5" /> DONE
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditMode(true)}
                            className="h-9 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-[10px] font-black tracking-widest uppercase transition-all"
                        >
                            <Settings2 className="w-4 h-4 mr-2 text-zinc-500" /> EDIT LAYOUT
                        </Button>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-zinc-950 p-4 custom-scrollbar">
                <ResponsiveGridLayout
                    className="layout"
                    layouts={{ lg: panels }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={60}
                    isDraggable={isEditMode}
                    isResizable={isEditMode}
                    onLayoutChange={handleLayoutChange}
                    draggableHandle=".drag-handle"
                    margin={[16, 16]}
                >
                    {panels.map((panel) => (
                        <div key={panel.i} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-2xl relative group/panel hover:border-zinc-700 transition-colors">
                            {/* Panel Header */}
                            <div className="h-9 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-3 shrink-0 drag-handle cursor-move select-none">
                                <div className="flex items-center gap-2">
                                    {panel.type === 'board' && <Kanban className="w-3.5 h-3.5 text-blue-400" />}
                                    {panel.type === 'schedule' && <Clock className="w-3.5 h-3.5 text-emerald-400" />}
                                    {panel.type === 'gantt' && <Calendar className="w-3.5 h-3.5 text-purple-400" />}
                                    {panel.type === 'activity' && <Activity className="w-3.5 h-3.5 text-orange-400" />}
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                        {panel.type === 'board' ? 'Task Board' :
                                            panel.type === 'schedule' ? 'Scheduler' :
                                                panel.type === 'gantt' ? 'Gantt Chart' : 'Activity'}
                                    </span>
                                </div>
                                {isEditMode && (
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="w-3 h-3 text-zinc-700 mr-2" />
                                        <button
                                            onMouseDown={(e) => removePanel(panel.i, e)}
                                            className="w-5 h-5 rounded hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-zinc-600 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Panel Content */}
                            <div className="flex-1 overflow-hidden relative">
                                {panel.type === 'board' && (
                                    <div className="h-full overflow-y-auto p-2 custom-scrollbar">
                                        <TaskTree tasks={initialTasks} />
                                    </div>
                                )}
                                {panel.type === 'schedule' && (
                                    <VerticalScheduler />
                                )}
                                {panel.type === 'gantt' && (
                                    <div className="h-full p-2 overflow-hidden">
                                        <GanttChart tasks={initialTasks} />
                                    </div>
                                )}
                                {panel.type === 'activity' && (
                                    <div className="h-full flex items-center justify-center text-zinc-600 italic text-xs">
                                        Activity Stream - Coming Soon
                                    </div>
                                )}

                                {/* Edit Mode Overlay */}
                                {isEditMode && (
                                    <div className="absolute inset-0 bg-blue-500/5 pointer-events-none border-2 border-dashed border-blue-500/20 z-10" />
                                )}
                            </div>
                        </div>
                    ))}
                </ResponsiveGridLayout>
            </div>
        </div>
    );
}

// Minimal Fix for DndContext collision with Grid Layout if needed
// function Wrapper({ children, ...props }: any) {
//     return <div {...props}>{children}</div>
// }
