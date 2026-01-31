import { useState, useEffect } from 'react';
import moment from 'moment';
import type { DomainEvent } from '../../types';

interface SidePanelProps {
    event: DomainEvent | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: DomainEvent) => void;
    onDelete: (id: number) => void;
}

export const SidePanel = ({
    event,
    isOpen,
    onClose,
    onSave,
    onDelete
}: SidePanelProps) => {
    const [formData, setFormData] = useState<DomainEvent | null>(null);

    useEffect(() => {
        if (event) {
            setFormData({ ...event });
        }
    }, [event]);

    if (!isOpen || !formData) return null;

    const handleChange = (field: keyof DomainEvent, value: any) => {
        setFormData(prev => prev ? { ...prev, [field]: value } : null);
    };

    const formatTime = (d: Date) => moment(d).format('HH:mm');
    const handleTimeChange = (type: 'start' | 'end', timeStr: string) => {
        if (!formData) return;
        const [h, m] = timeStr.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return;

        // realDateを基準に時間をセットする（内部的にはrealDateが正）
        const newDate = new Date(formData.realDate);
        newDate.setHours(h, m);

        // start/endフィールドも更新する
        if (type === 'start') {
            setFormData({ ...formData, start: newDate });
        } else {
            setFormData({ ...formData, end: newDate });
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, right: 0, height: '100%', width: '400px',
            backgroundColor: '#18181b', borderLeft: '1px solid #27272a',
            zIndex: 100, boxShadow: '-5px 0 15px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', color: '#f4f4f5'
        }}>
            {/* Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>Event Details</span>
                <div>
                    <button onClick={() => onDelete(formData.id)} style={{ marginRight: '8px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>✖</button>
                </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                {/* Title */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', marginBottom: '4px' }}>TITLE</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={e => handleChange('title', e.target.value)}
                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #27272a', color: '#f4f4f5', fontSize: '18px', fontWeight: 'bold', padding: '4px 0' }}
                    />
                </div>

                {/* Date/Time info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', marginBottom: '4px' }}>DATE</label>
                        <div style={{ fontSize: '14px' }}>{moment(formData.realDate).format('YYYY/MM/DD')}</div>
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', marginBottom: '4px' }}>TYPE</label>
                        <div style={{ fontSize: '14px', color: formData.type === 'plan' ? '#60a5fa' : '#4ade80', fontWeight: 'bold' }}>
                            {formData.type.toUpperCase()}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', marginBottom: '4px' }}>START</label>
                        <input type="time" value={formatTime(formData.start)} onChange={e => handleTimeChange('start', e.target.value)}
                            style={{ background: '#27272a', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', marginBottom: '4px' }}>END</label>
                        <input type="time" value={formatTime(formData.end)} onChange={e => handleTimeChange('end', e.target.value)}
                            style={{ background: '#27272a', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px' }} />
                    </div>
                </div>

                {/* Markdown Note */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>NOTE (Markdown)</label>
                    <textarea
                        value={formData.description || ''}
                        onChange={e => handleChange('description', e.target.value)}
                        style={{ flex: 1, width: '100%', background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#d4d4d8', padding: '12px', fontFamily: 'monospace', resize: 'none', minHeight: '200px' }}
                        placeholder="# Details..."
                    />
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px', borderTop: '1px solid #27272a', background: '#09090b' }}>
                <button
                    onClick={() => onSave(formData)}
                    style={{ width: '100%', padding: '12px', background: '#f4f4f5', color: '#09090b', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};
