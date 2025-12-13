"use client";

import * as React from 'react';
import { FolderIcon, FolderOpenIcon, FileIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as AccordionPrimitive from "@radix-ui/react-accordion"

// Using a simplified context or just simple state for folders
const FilesContext = React.createContext({});

interface FilesProps extends React.HTMLAttributes<HTMLDivElement> { }

function Files({ className, children, ...props }: FilesProps) {
    return (
        <div className={cn('w-full', className)} {...props}>
            <div className="flex flex-col gap-1">
                {children}
            </div>
        </div>
    );
}

// SubFiles is just a wrapper for consistency
function SubFiles({ children, ...props }: FilesProps) {
    return (
        <div className="flex flex-col gap-1" {...props}>
            {children}
        </div>
    );
}

interface FolderItemProps {
    value: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const FolderContext = React.createContext<{ open: boolean; setOpen: (o: boolean) => void }>({ open: false, setOpen: () => { } });

function FolderItem({ value, children, defaultOpen = false }: FolderItemProps) {
    const [open, setOpen] = React.useState(defaultOpen);

    return (
        <FolderContext.Provider value={{ open, setOpen }}>
            <div className="flex flex-col">
                {children}
            </div>
        </FolderContext.Provider>
    );
}

interface FolderTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
    forceOpen?: boolean;
}

function FolderTrigger({ children, className, forceOpen, ...props }: FolderTriggerProps) {
    const { open, setOpen } = React.useContext(FolderContext);

    const handleClick = () => {
        if (!forceOpen) {
            setOpen(!open);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'flex items-center gap-2 px-2 py-1.5 w-full text-left rounded-md hover:bg-white/5 transition-colors group',
                open ? 'text-white' : 'text-gray-400 hover:text-white',
                forceOpen ? 'cursor-default hover:bg-transparent' : '',
                className
            )}
            {...props}
        >
            {/* Icon logic removed from here to allow custom icons via children or simpler structure, 
                User wants specific icons so we will pass them as children usually. 
                But wait, the previous implementation rendered FolderIcon/FolderOpenIcon here.
                Let's make that optional or conditionally rendered.
            */}
            {!forceOpen && (
                open ? (
                    <FolderOpenIcon className="size-4 text-amber-500/80" />
                ) : (
                    <FolderIcon className="size-4 text-amber-500/80" />
                )
            )}
            <span className="text-sm font-medium">{children}</span>
        </button>
    );
}

interface FolderContentProps extends React.HTMLAttributes<HTMLDivElement> { }

function FolderContent({ children, className, ...props }: FolderContentProps) {
    const { open } = React.useContext(FolderContext);

    if (!open) return null;

    return (
        <div className={cn("ml-4 pl-2 border-l border-white/10 mt-1", className)} {...props}>
            {children}
        </div>
    );
}

interface FileItemProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: React.ElementType;
}

function FileItem({ icon: Icon = FileIcon, children, className, ...props }: FileItemProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer text-gray-400 hover:text-white',
                className
            )}
            {...props}
        >
            <Icon className="size-4 text-blue-500/80" />
            <span className="text-sm">{children}</span>
        </div>
    );
}

export {
    Files,
    SubFiles,
    FolderItem,
    FolderTrigger,
    FolderContent,
    FileItem,
};
