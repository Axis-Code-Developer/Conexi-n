"use client";

import { useState } from "react";
import { Files, FolderItem, FolderTrigger, FolderContent, FileItem, SubFiles } from "@/components/ui/files";
import { AddResourceDialog } from "@/components/domain/AddResourceDialog";
import { FileIcon, Video, Link as LinkIcon, Download, Trash2, ExternalLink, FileText, Image as ImageIcon, BookOpen, Music as MusicIcon, Mic, Folder, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteResource } from "@/app/resources/actions";

interface ResourcesViewProps {
    resources: any[];
}

export function ResourcesView({ resources }: ResourcesViewProps) {
    const [selectedResource, setSelectedResource] = useState<any | null>(null);

    const resourcesByCategory = resources.reduce((acc: any, resource: any) => {
        const cat = resource.category || "Otros";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(resource);
        return acc;
    }, {});

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de eliminar este recurso?")) {
            await deleteResource(id);
            setSelectedResource(null);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "VIDEO": return Video;
            case "LINK": return LinkIcon;
            case "TEXT": return FileText;
            default: return FileIcon;
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Multimedia": return MusicIcon;
            case "Guías": return BookOpen;
            case "Reuniones": return Mic;
            case "Documentos": return Folder;
            default: return Folder;
        }
    }

    const CategoryIcon = ({ category }: { category: string }) => {
        const Icon = getCategoryIcon(category);
        return <Icon className="w-5 h-5 text-gray-400" />
    }

    // Helper to render content preview
    const renderPreview = (resource: any) => {
        if (resource.type === 'TEXT') {
            return (
                <div
                    className="rich-text-content prose prose-invert prose-sm max-w-none p-4 text-gray-300"
                    dangerouslySetInnerHTML={{ __html: resource.description || "" }}
                />
            );
        }

        if (resource.type === 'VIDEO') {
            // Simple embed check for YouTube
            const isYouTube = resource.fileUrl?.includes('youtube.com') || resource.fileUrl?.includes('youtu.be');
            if (isYouTube) {
                let embedUrl = resource.fileUrl;
                if (resource.fileUrl.includes('watch?v=')) {
                    embedUrl = resource.fileUrl.replace('watch?v=', 'embed/');
                } else if (resource.fileUrl.includes('youtu.be/')) {
                    embedUrl = resource.fileUrl.replace('youtu.be/', 'youtube.com/embed/');
                }

                return (
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black max-h-[600px] mx-auto">
                        <iframe
                            src={embedUrl}
                            title={resource.title}
                            className="w-full h-full"
                            allowFullScreen
                        />
                    </div>
                );
            }
            return (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                    <Video className="w-16 h-16 text-gray-600 mb-4" />
                    <Button onClick={() => window.open(resource.fileUrl, '_blank')} variant="outline" className="border-white/10 hover:bg-white/5">
                        Ver Video Externo <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            )
        }

        if (resource.type === 'DOCUMENT') {
            const isImage = resource.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
            const isPdf = resource.fileUrl?.match(/\.pdf$/i);

            if (isImage) {
                return (
                    <div className="flex items-center justify-center bg-transparent rounded-xl p-2">
                        <img src={resource.fileUrl} alt={resource.title} className="max-h-[700px] object-contain rounded-lg" />
                    </div>
                )
            }

            if (isPdf) {
                return (
                    <div className="w-full h-[800px] rounded-xl overflow-hidden bg-[#202020]">
                        <iframe src={resource.fileUrl} className="w-full h-full border-none" />
                    </div>
                )
            }

            return (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                    <FileIcon className="w-16 h-16 text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-4">Vista previa no disponible para este tipo de archivo.</p>
                    <a href={resource.fileUrl} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-white/10 rounded-md hover:bg-white/5 text-white text-sm transition-colors">
                        Descargar Archivo <Download className="w-4 h-4" />
                    </a>
                </div>
            )
        }

        if (resource.type === 'LINK') {
            return (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                    <LinkIcon className="w-16 h-16 text-gray-600 mb-4" />
                    <Button onClick={() => window.open(resource.fileUrl, '_blank')} variant="outline" className="border-white/10 hover:bg-white/5">
                        Visitar Enlace <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            )
        }

        return null;
    }

    return (
        <div className="flex flex-col min-h-screen pb-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Recursos</h1>
                    <p className="text-gray-400">Documentos y material de apoyo</p>
                </div>
                <AddResourceDialog />
            </div>

            <div className="flex flex-1 gap-12 items-start">

                {/* Left Column: File Tree */}
                <div className="w-1/4 flex flex-col sticky top-8">
                    <h3 className="text-base font-medium text-gray-400 mb-6 px-1">Explorador</h3>

                    {Object.keys(resourcesByCategory).length === 0 ? (
                        <div className="text-left py-4 text-gray-500 text-sm pl-2">
                            No hay recursos.
                        </div>
                    ) : (
                        <Files className="flex-1 space-y-4">
                            {Object.entries(resourcesByCategory).map(([category, items]: [string, any]) => (
                                <FolderItem key={category} value={category} defaultOpen={true}>
                                    <FolderTrigger className="hover:bg-transparent px-0 py-2 mb-2" forceOpen={true}>
                                        <div className="flex items-center gap-2 text-lg font-medium text-white/90">
                                            <CategoryIcon category={category} />
                                            {category}
                                        </div>
                                    </FolderTrigger>
                                    <FolderContent className="ml-2.5 pl-4 border-l-2 border-white/5 mt-0 pt-0">
                                        <SubFiles>
                                            {items.map((item: any) => (
                                                <div key={item.id} onClick={() => setSelectedResource(item)}>
                                                    <FileItem
                                                        icon={getIcon(item.type)}
                                                        className={cn(
                                                            "mb-1 rounded-lg px-0 py-2 transition-all duration-200 border border-transparent pl-3 text-base text-gray-400 hover:text-white bg-transparent hover:bg-transparent",
                                                            selectedResource?.id === item.id
                                                                ? "text-blue-400 font-medium"
                                                                : ""
                                                        )}
                                                    >
                                                        {item.title}
                                                    </FileItem>
                                                </div>
                                            ))}
                                        </SubFiles>
                                    </FolderContent>
                                </FolderItem>
                            ))}
                        </Files>
                    )}
                </div>

                {/* Right Column: Preview/Details */}
                <div className="flex-1 flex flex-col min-w-0">
                    {selectedResource ? (
                        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Actions Floating */}
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-gray-300 border border-white/5">
                                            <CategoryIcon category={selectedResource.category} />
                                            {selectedResource.category}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(selectedResource.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl font-display font-bold text-white mb-2 leading-tight tracking-tight">{selectedResource.title}</h2>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-11 w-11 rounded-xl bg-[#252525] text-white shadow-xl shadow-black/20 border-[0.6px] border-white/10 hover:bg-[#303030] hover:scale-105 transition-all"
                                        onClick={() => handleDelete(selectedResource.id)}
                                    >
                                        <Trash2 className="w-5 h-5 text-red-400" />
                                    </Button>

                                    {selectedResource.fileUrl && (
                                        <a
                                            href={selectedResource.fileUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="h-11 w-11 rounded-xl bg-[#252525] text-white shadow-xl shadow-black/20 border-[0.6px] border-white/10 hover:bg-[#303030] hover:scale-105 transition-all flex items-center justify-center"
                                        >
                                            {selectedResource.type === 'LINK' ? <ExternalLink className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Preview Section */}
                            <div className="w-full bg-[#1a1a1a] border border-white/5 rounded-3xl p-6 shadow-2xl shadow-black/40 min-h-[500px]">
                                {renderPreview(selectedResource)}
                            </div>

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 opacity-40 py-40">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 shadow-xl shadow-black/20">
                                <img src="/icons/Files/folder.svg" alt="No resource" className="w-8 h-8 opacity-60 invert" />
                            </div>
                            <p className="text-lg font-display font-medium mb-1">Selecciona un recurso</p>
                            <p className="text-sm text-gray-500">Explora las categorías disponibles</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
