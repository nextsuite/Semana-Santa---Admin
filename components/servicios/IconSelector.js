'use client';

import { useState } from 'react';
import * as MdIcons from 'react-icons/md';
import { Button } from '@/components/ui/Button';

// Pre-selected common material design icons for services
const COMMON_ICONS = [
    'MdInfo', 'MdPhone', 'MdLink', 'MdMap', 'MdDirectionsWalk', 'MdDirectionsBus',
    'MdLocalTaxi', 'MdLocalHospital', 'MdLocalPharmacy', 'MdRestaurant', 'MdLocalCafe',
    'MdHotel', 'MdStore', 'MdShoppingCart', 'MdAccountBalance', 'MdChurch',
    'MdLocalParking', 'MdWc', 'MdWifi', 'MdLocalPolice', 'MdWarning', 'MdEmergency',
    'MdMedicalServices', 'MdHealthAndSafety', 'MdLocalFireDepartment', 'MdMedicalInformation',
    'MdAccessible', 'MdMonitorHeart', 'MdFireExtinguisher', 'MdShield'
];

export default function IconSelector({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredIcons = COMMON_ICONS.filter(icon =>
        icon.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SelectedIcon = value && MdIcons[value] ? MdIcons[value] : MdIcons['MdInfo'];

    return (
        <div className="relative">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30">
                    <SelectedIcon className="h-5 w-5 text-foreground" />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full justify-between"
                >
                    {value || 'Seleccionar icono...'}
                </Button>
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none">
                    <div className="p-2 border-b border-border">
                        <input
                            type="text"
                            className="w-full rounded bg-muted/50 px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
                            placeholder="Buscar icono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2">
                        <div className="grid grid-cols-5 gap-2">
                            {filteredIcons.map((iconName) => {
                                const IconComponent = MdIcons[iconName];
                                if (!IconComponent) return null;
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => {
                                            onChange(iconName);
                                            setIsOpen(false);
                                        }}
                                        className={`flex aspect-square items-center justify-center rounded-md hover:bg-muted transition-colors ${value === iconName ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground'}`}
                                        title={iconName}
                                    >
                                        <IconComponent className="h-5 w-5" />
                                    </button>
                                );
                            })}
                        </div>
                        {filteredIcons.length === 0 && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No se encontraron iconos.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
