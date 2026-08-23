"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Inbox,
  Loader2,
  Layers,
  Search,
  GripVertical,
  Type,
  Lock,
  Mail,
  Hash,
  Radio,
  Calendar,
  UploadCloud,
  Check,
  Settings2,
  AlertCircle,
  Sparkles,
  Pencil,
  Copy,
  X,
} from "lucide-react";

import {
  useGetForm,
  useUpdateForm,
  useCreateField,
  useUpdateField,
  useDeleteField,
} from "~/hooks/api/form";
import { DashboardHamburgerToggle } from "~/components/dashboard-sidebar";

interface FormDetailsPageProps {
  params: Promise<{ id: string }>;
}

export interface FieldItem {
  id: string;
  label: string;
  labelKey: string;
  type: "TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD";
  description?: string | null;
  placeholder?: string | null;
  isRequired: boolean;
  index: string;
}

interface PaletteItem {
  id: string;
  type: "TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD";
  label: string;
  category: "text" | "inputs" | "advanced";
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultPlaceholder?: string;
  defaultDescription?: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // 1. Text Fields
  {
    id: "short_text",
    type: "TEXT",
    label: "Short Text",
    category: "text",
    description: "Single-line text input for names or titles",
    icon: Type,
    defaultPlaceholder: "Enter text...",
    defaultDescription: "Provide brief answer",
  },
  {
    id: "password",
    type: "PASSWORD",
    label: "Password",
    category: "text",
    description: "Masked input for secure password credentials",
    icon: Lock,
    defaultPlaceholder: "••••••••",
    defaultDescription: "Choose a secure password",
  },

  // 2. Inputs & Options
  {
    id: "email",
    type: "EMAIL",
    label: "Email Address",
    category: "inputs",
    description: "Validated email input format",
    icon: Mail,
    defaultPlaceholder: "alex@example.com",
    defaultDescription: "We'll never share your email",
  },
  {
    id: "number",
    type: "NUMBER",
    label: "Number Input",
    category: "inputs",
    description: "Numeric inputs, quantities, or ages",
    icon: Hash,
    defaultPlaceholder: "0",
    defaultDescription: "Enter a number value",
  },
  {
    id: "yes_no",
    type: "YES_NO",
    label: "Radio Choice (Yes/No)",
    category: "inputs",
    description: "Radio button selector for Yes/No decisions",
    icon: Radio,
    defaultDescription: "Select one option",
  },

  // 3. Advanced Fields
  {
    id: "date_picker",
    type: "TEXT",
    label: "Date Picker",
    category: "advanced",
    description: "Interactive calendar date selector",
    icon: Calendar,
    defaultPlaceholder: "YYYY-MM-DD",
    defaultDescription: "Select a date",
  },
  {
    id: "file_upload",
    type: "TEXT",
    label: "File Upload",
    category: "advanced",
    description: "Dropzone attachment area for document upload",
    icon: UploadCloud,
    defaultPlaceholder: "Upload file...",
    defaultDescription: "Attach documents or images (Max 10MB)",
  },
];

const getFieldIcon = (type: string, label: string = "") => {
  const lower = label.toLowerCase();
  if (lower.includes("date")) return Calendar;
  if (lower.includes("file") || lower.includes("upload")) return UploadCloud;
  switch (type) {
    case "EMAIL":
      return Mail;
    case "NUMBER":
      return Hash;
    case "YES_NO":
      return Radio;
    case "PASSWORD":
      return Lock;
    case "TEXT":
    default:
      return Type;
  }
};

export default function FormDetailsPage({ params }: FormDetailsPageProps) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;

  const { form, isLoading, error } = useGetForm(formId);
  const { updateFormAsync } = useUpdateForm();
  const { createFieldAsync, isPending: isCreatingField } = useCreateField();
  const { updateFieldAsync, isPending: isUpdatingField } = useUpdateField();
  const { deleteFieldAsync, isPending: isDeletingField } = useDeleteField();

  // Workspace Local State
  const [localFields, setLocalFields] = useState<FieldItem[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isEditingFormHeader, setIsEditingFormHeader] = useState(false);
  const [isSavingFormHeader, setIsSavingFormHeader] = useState(false);

  // Responsive Drawer Toggles for iPad/Mobile
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Inspector edit state
  const [editLabel, setEditLabel] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPlaceholder, setEditPlaceholder] = useState("");
  const [editIsRequired, setEditIsRequired] = useState(false);

  // Sync server data to local state
  useEffect(() => {
    if (form) {
      setFormTitle(form.title || "");
      setFormDescription(form.description || "");
      if (form.fields) {
        setLocalFields(form.fields as FieldItem[]);
      }
    }
  }, [form]);

  // Currently selected field object from localState (for live concurrent updates)
  const selectedField = localFields.find((f) => f.id === selectedFieldId);

  // Auto-select first field if none selected
  useEffect(() => {
    if (localFields.length > 0 && !selectedFieldId && localFields[0]?.id) {
      setSelectedFieldId(localFields[0].id);
    }
  }, [localFields, selectedFieldId]);

  // Sync inspector form inputs when selectedFieldId changes
  useEffect(() => {
    if (selectedField) {
      setEditLabel(selectedField.label || "");
      setEditDescription(selectedField.description || "");
      setEditPlaceholder(selectedField.placeholder || "");
      setEditIsRequired(selectedField.isRequired || false);
    }
  }, [selectedFieldId]);

  const handleSelectField = (fieldId: string) => {
    setSelectedFieldId(fieldId);
  };

  // Live concurrent input handlers for Field Inspector
  const handleInspectorLabelChange = (val: string) => {
    setEditLabel(val);
    setLocalFields((prev) =>
      prev.map((f) => (f.id === selectedFieldId ? { ...f, label: val } : f))
    );
  };

  const handleInspectorDescriptionChange = (val: string) => {
    setEditDescription(val);
    setLocalFields((prev) =>
      prev.map((f) => (f.id === selectedFieldId ? { ...f, description: val } : f))
    );
  };

  const handleInspectorPlaceholderChange = (val: string) => {
    setEditPlaceholder(val);
    setLocalFields((prev) =>
      prev.map((f) => (f.id === selectedFieldId ? { ...f, placeholder: val } : f))
    );
  };

  const handleInspectorRequiredChange = (val: boolean) => {
    setEditIsRequired(val);
    setLocalFields((prev) =>
      prev.map((f) => (f.id === selectedFieldId ? { ...f, isRequired: val } : f))
    );
  };

  // Form Title & Description Save Handler
  const handleSaveFormHeader = async () => {
    try {
      setIsSavingFormHeader(true);
      await updateFormAsync({
        formId,
        title: formTitle,
        description: formDescription || null,
      });
      setIsEditingFormHeader(false);
    } catch (err) {
      console.error("Failed to update form header:", err);
    } finally {
      setIsSavingFormHeader(false);
    }
  };

  // Create Field Action
  const handleAddField = async (item: PaletteItem) => {
    try {
      const res = await createFieldAsync({
        formId,
        label: item.label,
        type: item.type,
        description: item.defaultDescription || undefined,
        placeholder: item.defaultPlaceholder || undefined,
        isRequired: false,
      });
      if (res && res.id) {
        setSelectedFieldId(res.id);
        setMobilePaletteOpen(false);
      }
    } catch (err) {
      console.error("Failed to add field:", err);
    }
  };

  // Duplicate Field Action
  const handleDuplicateField = async (field: FieldItem) => {
    try {
      const res = await createFieldAsync({
        formId,
        label: `${field.label} (Copy)`,
        type: field.type,
        description: field.description || undefined,
        placeholder: field.placeholder || undefined,
        isRequired: field.isRequired,
      });
      if (res && res.id) {
        setSelectedFieldId(res.id);
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          setMobileInspectorOpen(true);
        }
      }
    } catch (err) {
      console.error("Failed to duplicate field:", err);
    }
  };

  // Update Field Action
  const handleSaveInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFieldId) return;

    try {
      await updateFieldAsync({
        fieldId: selectedFieldId,
        label: editLabel,
        description: editDescription || null,
        placeholder: editPlaceholder || null,
        isRequired: editIsRequired,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to update field:", err);
    }
  };

  // Delete Field Action
  const handleDeleteField = async (fieldId: string) => {
    try {
      await deleteFieldAsync({ fieldId });
      if (selectedFieldId === fieldId) {
        const remaining = localFields.filter((f) => f.id !== fieldId);
        setSelectedFieldId(remaining.length > 0 && remaining[0]?.id ? remaining[0].id : null);
      }
    } catch (err) {
      console.error("Failed to delete field:", err);
    }
  };

  // Drag and Drop Handlers
  const draggedItemRef = useRef<PaletteItem | null>(null);
  const draggedCanvasIndexRef = useRef<number | null>(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    draggedItemRef.current = item;
    try {
      e.dataTransfer.setData("text/plain", item.id);
      e.dataTransfer.setData("application/json", JSON.stringify(item));
    } catch {
      // Ignore fallback serialization error
    }
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (draggedItemRef.current) {
      handleAddField(draggedItemRef.current);
      draggedItemRef.current = null;
      return;
    }

    try {
      const json = e.dataTransfer.getData("application/json");
      if (json) {
        const item: PaletteItem = JSON.parse(json);
        handleAddField(item);
        return;
      }
    } catch {
      // Ignore
    }

    const itemId = e.dataTransfer.getData("text/plain");
    if (itemId) {
      const found = PALETTE_ITEMS.find((p) => p.id === itemId);
      if (found) {
        handleAddField(found);
      }
    }
  };

  // Canvas Card Reordering Handlers
  const handleCanvasCardDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    draggedCanvasIndexRef.current = index;
    e.dataTransfer.setData("text/canvas-card-index", String(index));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCanvasCardDragOver = (e: React.DragEvent, index: number) => {
    if (draggedCanvasIndexRef.current !== null) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      if (dragOverCardIndex !== index) {
        setDragOverCardIndex(index);
      }
    }
  };

  const handleCanvasCardDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCardIndex(null);

    const sourceIndex = draggedCanvasIndexRef.current;
    draggedCanvasIndexRef.current = null;

    if (sourceIndex === null || sourceIndex === targetIndex) return;

    const updated = [...localFields];
    const [moved] = updated.splice(sourceIndex, 1);
    if (!moved) return;

    updated.splice(targetIndex, 0, moved);

    // Update local state optimistically
    setLocalFields(updated);

    // Calculate non-colliding fractional index for DB
    let newIndexNum: number;
    if (targetIndex === 0) {
      const nextIdx = parseFloat(updated[1]?.index || "1.00");
      newIndexNum = Math.max(0.01, nextIdx / 2);
    } else if (targetIndex === updated.length - 1) {
      const prevIdx = parseFloat(updated[updated.length - 2]?.index || "0.00");
      newIndexNum = prevIdx + 1.00;
    } else {
      const prevIdx = parseFloat(updated[targetIndex - 1]?.index || "0.00");
      const nextIdx = parseFloat(updated[targetIndex + 1]?.index || (prevIdx + 2.0).toString());
      newIndexNum = (prevIdx + nextIdx) / 2;
    }

    const newIndexStr = newIndexNum.toFixed(2);

    try {
      await updateFieldAsync({
        fieldId: moved.id,
        index: newIndexStr,
      });
    } catch (err) {
      console.error("Failed to update field order index:", err);
    }
  };

  // Search filtering for Left Palette
  const filteredPalette = PALETTE_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const textCategoryItems = filteredPalette.filter((i) => i.category === "text");
  const inputCategoryItems = filteredPalette.filter((i) => i.category === "inputs");
  const advancedCategoryItems = filteredPalette.filter((i) => i.category === "advanced");

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-3 bg-background p-8 min-h-screen text-yellow-400">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="font-medium text-sm">Loading dark yellow neon form builder workspace...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="space-y-4 bg-background p-12 min-h-screen text-center">
        <AlertCircle className="mx-auto w-12 h-12 text-rose-400" />
        <h2 className="font-bold text-rose-400 text-xl">Form Not Found</h2>
        <p className="text-zinc-400 text-sm">
          The requested form does not exist or failed to load.
        </p>
        <Link
          href="/dashboard/forms"
          className="inline-flex items-center gap-2 hover:bg-yellow-500/10 px-4 py-2 border border-yellow-500/30 rounded-xl font-medium text-yellow-300 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forms
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background h-screen min-h-screen overflow-hidden text-foreground">
      {/* Top Navigation Bar - Dark Yellow Neon Header */}
      <header className="z-20 flex justify-between items-center gap-2 sm:gap-4 bg-zinc-900/95 backdrop-blur-md shadow-xl shadow-yellow-950/40 px-3 sm:px-6 py-2.5 sm:py-3 border-yellow-500/25 border-b shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <DashboardHamburgerToggle className="md:hidden shrink-0 border-yellow-500/35 text-yellow-400 hover:bg-yellow-500/10" />
          <Link
            href="/dashboard/forms"
            className="hover:bg-yellow-500/10 p-1.5 sm:p-2 border border-yellow-500/25 rounded-xl text-zinc-400 hover:text-yellow-300 transition-colors shrink-0"
            title="Back to Forms"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-black text-sm sm:text-base md:text-lg truncate max-w-[120px] sm:max-w-[200px] md:max-w-md text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-500">
                {formTitle}
              </h1>
              <span className="bg-yellow-500/10 border border-yellow-500/35 px-1.5 sm:px-2 py-0.5 rounded-full font-extrabold text-[10px] text-yellow-400 uppercase tracking-wider shrink-0 glow-yellow">
                Builder
              </span>
            </div>
            <p className="text-yellow-400/65 text-[10px] sm:text-xs truncate">
              {localFields.length} {localFields.length === 1 ? "field" : "fields"} configured
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Responsive Toggle Pills for Mobile / iPad (< lg) */}
          <div className="flex lg:hidden items-center gap-1 border border-yellow-500/35 p-0.5 rounded-xl bg-zinc-950/70">
            <button
              onClick={() => {
                setMobilePaletteOpen(!mobilePaletteOpen);
                setMobileInspectorOpen(false);
              }}
              className={`px-2 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                mobilePaletteOpen
                  ? "bg-yellow-400 text-zinc-950 font-black glow-yellow"
                  : "text-zinc-400 hover:text-yellow-300"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Palette</span>
            </button>
            <button
              onClick={() => {
                setMobileInspectorOpen(!mobileInspectorOpen);
                setMobilePaletteOpen(false);
              }}
              className={`px-2 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                mobileInspectorOpen
                  ? "bg-yellow-400 text-zinc-950 font-black glow-yellow"
                  : "text-zinc-400 hover:text-yellow-300"
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inspector</span>
            </button>
          </div>

          <Link
            href={`/dashboard/forms/${formId}/submissions`}
            className="flex items-center gap-1.5 hover:bg-amber-500/10 px-2.5 sm:px-3 py-1.5 border border-amber-500/35 rounded-xl font-bold text-xs text-amber-300 hover:border-amber-500/55 transition-all shrink-0"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Submissions</span>
          </Link>
          <Link
            href={`/forms/${formId}`}
            target="_blank"
            className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:brightness-110 shadow-lg shadow-yellow-500/25 glow-yellow px-2.5 sm:px-3.5 py-1.5 rounded-xl font-black text-zinc-950 text-xs transition-all shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Preview</span>
          </Link>
        </div>
      </header>

      {/* Responsive 3-Column Workspace across all breakpoints (sm, md, lg, xl) */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* ================= LEFT PALETTE (Field Library) ================= */}
        {/* Overlay Backdrop for Mobile / iPad */}
        {mobilePaletteOpen && (
          <div
            onClick={() => setMobilePaletteOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-30 transition-opacity"
          />
        )}

        <aside
          className={`flex flex-col bg-zinc-900/95 backdrop-blur-md border-yellow-500/25 border-r w-72 md:w-80 lg:w-64 xl:w-80 overflow-hidden shrink-0 transition-all duration-300 z-40 ${
            mobilePaletteOpen
              ? "fixed inset-y-0 left-0 shadow-2xl shadow-yellow-950"
              : "hidden lg:flex lg:relative"
          }`}
        >
          {/* Palette Search Header */}
          <div className="space-y-3 p-4 border-yellow-500/25 border-b">
            <div className="flex justify-between items-center">
              <h2 className="flex items-center gap-1.5 font-black text-yellow-400 text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                Field Palette
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="bg-yellow-500/10 border border-yellow-500/25 px-1.5 py-0.5 rounded text-[10px] text-yellow-300 font-semibold">
                  Drag / Click
                </span>
                <button
                  onClick={() => setMobilePaletteOpen(false)}
                  className="lg:hidden p-1 text-zinc-400 hover:text-zinc-200 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="top-2.5 left-3 absolute w-4 h-4 text-yellow-400/65" />
              <input
                type="text"
                placeholder="Search field types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-950/85 py-2 pr-3 pl-9 border border-yellow-500/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-400 w-full text-zinc-100 text-xs transition-all placeholder:text-zinc-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="top-2.5 right-2.5 absolute text-zinc-400 hover:text-yellow-300 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Palette Items Scroll Area */}
          <div className="flex-1 space-y-6 p-4 overflow-y-auto">
            {/* Category 1: Text Fields */}
            {textCategoryItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="px-1 font-bold text-yellow-400/85 text-xs uppercase tracking-wider">
                  Text Fields
                </h3>
                <div className="space-y-2">
                  {textCategoryItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onClick={() => handleAddField(item)}
                        className="group flex justify-between items-center bg-zinc-950/70 hover:bg-yellow-500/10 p-3 border border-yellow-500/20 hover:border-yellow-400/60 rounded-xl transition-all cursor-grab active:cursor-grabbing select-none hover:shadow-md hover:shadow-yellow-950"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-yellow-500/10 border border-yellow-500/30 group-hover:bg-yellow-400 p-2 rounded-lg text-yellow-400 group-hover:text-zinc-950 transition-colors shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-100 text-xs truncate group-hover:text-yellow-300">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <Plus className="opacity-0 group-hover:opacity-100 w-4 h-4 text-yellow-400 transition-opacity shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category 2: Inputs & Options */}
            {inputCategoryItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="px-1 font-bold text-yellow-400/85 text-xs uppercase tracking-wider">
                  Inputs & Options
                </h3>
                <div className="space-y-2">
                  {inputCategoryItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onClick={() => handleAddField(item)}
                        className="group flex justify-between items-center bg-zinc-950/70 hover:bg-yellow-500/10 p-3 border border-yellow-500/20 hover:border-yellow-400/60 rounded-xl transition-all cursor-grab active:cursor-grabbing select-none hover:shadow-md hover:shadow-yellow-950"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-yellow-500/10 border border-yellow-500/30 group-hover:bg-yellow-400 p-2 rounded-lg text-yellow-400 group-hover:text-zinc-950 transition-colors shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-100 text-xs truncate group-hover:text-yellow-300">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <Plus className="opacity-0 group-hover:opacity-100 w-4 h-4 text-yellow-400 transition-opacity shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category 3: Advanced Fields */}
            {advancedCategoryItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="px-1 font-bold text-yellow-400/85 text-xs uppercase tracking-wider">
                  Advanced Fields
                </h3>
                <div className="space-y-2">
                  {advancedCategoryItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onClick={() => handleAddField(item)}
                        className="group flex justify-between items-center bg-zinc-950/70 hover:bg-yellow-500/10 p-3 border border-yellow-500/20 hover:border-yellow-400/60 rounded-xl transition-all cursor-grab active:cursor-grabbing select-none hover:shadow-md hover:shadow-yellow-950"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-yellow-500/10 border border-yellow-500/30 group-hover:bg-yellow-400 p-2 rounded-lg text-yellow-400 group-hover:text-zinc-950 transition-colors shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-100 text-xs truncate group-hover:text-yellow-300">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <Plus className="opacity-0 group-hover:opacity-100 w-4 h-4 text-yellow-400 transition-opacity shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredPalette.length === 0 && (
              <div className="p-8 text-zinc-400 text-xs text-center">
                No field types matching "{searchQuery}"
              </div>
            )}
          </div>
        </aside>

        {/* ================= CENTER CANVAS (Form Preview & Dropzone) ================= */}
        <main
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 transition-colors min-w-0 w-full bg-[#09090b] ${
            isDragOver ? "bg-yellow-950/30 ring-2 ring-yellow-500 ring-inset" : ""
          }`}
        >
          <div className="space-y-4 sm:space-y-6 mx-auto max-w-2xl lg:max-w-3xl">
            {/* Form Title & Description Header Card (Editable) */}
            <div className="relative space-y-3 bg-zinc-900/95 shadow-xl shadow-yellow-950/50 p-4 sm:p-6 border border-yellow-500/30 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="top-0 right-0 left-0 absolute bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 h-1.5" />
              
              {isEditingFormHeader ? (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block mb-1 font-bold text-yellow-400/85 text-xs uppercase">
                      Form Title
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="bg-zinc-950 px-3 py-1.5 border border-yellow-500/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full font-bold text-base sm:text-lg text-zinc-100"
                      placeholder="Form Title..."
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-yellow-400/85 text-xs uppercase">
                      Form Description
                    </label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={2}
                      className="bg-zinc-950 px-3 py-1.5 border border-yellow-500/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full text-xs text-zinc-100"
                      placeholder="Form description..."
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleSaveFormHeader}
                      disabled={isSavingFormHeader}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 font-black text-zinc-950 px-3.5 py-1.5 rounded-lg text-xs shadow-md glow-yellow"
                    >
                      {isSavingFormHeader ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Save Header
                    </button>
                    <button
                      onClick={() => {
                        setFormTitle(form.title || "");
                        setFormDescription(form.description || "");
                        setIsEditingFormHeader(false);
                      }}
                      className="hover:bg-zinc-800 px-3 py-1.5 border border-yellow-500/20 rounded-lg text-zinc-300 font-medium text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group/header flex justify-between items-start gap-3 sm:gap-4">
                  <div className="space-y-1 min-w-0">
                    <h2 className="font-black text-xl sm:text-2xl tracking-tight truncate text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-500">
                      {formTitle}
                    </h2>
                    <p className="text-zinc-400 text-xs sm:text-sm">
                      {formDescription || "Click edit to add a description for this form."}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditingFormHeader(true)}
                    className="flex items-center gap-1.5 hover:bg-yellow-500/10 px-2.5 sm:px-3 py-1.5 border border-yellow-500/35 rounded-xl font-medium text-yellow-400 hover:text-yellow-300 text-xs transition-all shrink-0"
                    title="Edit Title & Description"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit Header</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dropzone / Fields List Container */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="font-bold text-yellow-400/85 text-xs uppercase tracking-wider">
                  Form Elements ({localFields.length})
                </span>
                {isCreatingField && (
                  <span className="flex items-center gap-1.5 text-yellow-400 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding field...
                  </span>
                )}
              </div>

              {localFields.length === 0 ? (
                /* Empty Canvas Dropzone Prompt */
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center space-y-3 transition-all select-none ${
                    isDragOver
                      ? "border-yellow-400 bg-yellow-950/40 text-yellow-300 scale-[1.01] glow-border-yellow"
                      : "border-yellow-500/35 bg-zinc-900/60 text-zinc-400"
                  }`}
                >
                  <div className="flex justify-center items-center bg-yellow-500/10 border border-yellow-500/30 mx-auto rounded-2xl w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 glow-yellow">
                    <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-200 text-xs sm:text-sm">Canvas is Empty</h3>
                    <p className="mx-auto mt-1 max-w-sm text-zinc-400 text-[11px] sm:text-xs">
                      Drag fields from the left panel or click any field category to start building your form schema.
                    </p>
                  </div>
                </div>
              ) : (
                /* Fields List Cards */
                <div className="space-y-3">
                  {localFields.map((field, index) => {
                    const FieldIcon = getFieldIcon(field.type, field.label);
                    const isSelected = selectedFieldId === field.id;

                    return (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={(e) => handleCanvasCardDragStart(e, index)}
                        onDragOver={(e) => handleCanvasCardDragOver(e, index)}
                        onDragLeave={() => setDragOverCardIndex(null)}
                        onDrop={(e) => handleCanvasCardDrop(e, index)}
                        onClick={() => handleSelectField(field.id)}
                        className={`group relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                          dragOverCardIndex === index
                            ? "border-amber-400 ring-2 ring-amber-500/40 bg-zinc-900 border-t-4 glow-border-amber"
                            : isSelected
                            ? "border-yellow-400 ring-2 ring-yellow-500/35 bg-zinc-900/95 shadow-xl shadow-yellow-950/60 glow-border-yellow"
                            : "border-zinc-800 bg-zinc-900/85 hover:border-yellow-500/35 hover:shadow-lg hover:shadow-yellow-950/40"
                        }`}
                      >
                        {/* Card Header & Controls */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <GripVertical className="w-4 h-4 text-zinc-600 group-hover:text-yellow-400 cursor-grab shrink-0 transition-colors" />
                            <div className="bg-yellow-500/10 border border-yellow-500/30 p-1.5 rounded-lg text-yellow-400 shrink-0">
                              <FieldIcon className="w-4 h-4 text-yellow-400" />
                            </div>
                            <div className="min-w-0">
                              <span className="flex items-center gap-1.5 font-extrabold text-zinc-100 text-xs sm:text-sm truncate">
                                {field.label}
                                {field.isRequired && (
                                  <span className="font-bold text-rose-400 text-xs" title="Required">
                                    *
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                            <span className="bg-zinc-950 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold text-[10px] text-yellow-400 uppercase">
                              {field.type}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectField(field.id);
                                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                                  setMobileInspectorOpen(true);
                                }
                              }}
                              title="Edit field properties"
                              className="hover:bg-yellow-500/20 p-1.5 rounded-lg text-zinc-400 hover:text-yellow-300 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateField(field);
                              }}
                              disabled={isCreatingField}
                              title="Duplicate field"
                              className="hover:bg-yellow-500/20 p-1.5 rounded-lg text-zinc-400 hover:text-yellow-300 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteField(field.id);
                              }}
                              disabled={isDeletingField}
                              title="Delete field"
                              className="hover:bg-rose-500/20 p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Interactive UI Preview Mockup */}
                        <div className="space-y-2 pl-6 sm:pl-7 pointer-events-none">
                          {field.description && (
                            <p className="text-zinc-400 text-[11px] sm:text-xs">{field.description}</p>
                          )}

                          {/* Render actual UI input widget preview based on field type */}
                          {field.type === "TEXT" && field.label.toLowerCase().includes("date") ? (
                            <div className="flex justify-between items-center bg-zinc-950 px-3 py-2 border border-yellow-500/25 rounded-xl w-full text-zinc-400 text-xs">
                              <span>{field.placeholder || "YYYY-MM-DD"}</span>
                              <Calendar className="w-4 h-4 text-yellow-400" />
                            </div>
                          ) : field.type === "TEXT" &&
                            (field.label.toLowerCase().includes("file") ||
                              field.label.toLowerCase().includes("upload")) ? (
                            <div className="space-y-1 bg-zinc-950/70 p-3 sm:p-4 border border-yellow-500/35 border-dashed rounded-xl w-full text-center">
                              <UploadCloud className="mx-auto w-5 h-5 text-yellow-400" />
                              <p className="text-zinc-400 text-xs">
                                {field.placeholder || "Click or drag file to attach"}
                              </p>
                            </div>
                          ) : field.type === "YES_NO" ? (
                            <div className="flex items-center gap-4 pt-1">
                              <label className="flex items-center gap-2 text-zinc-400 text-xs">
                                <input type="radio" disabled name={`preview_${field.id}`} className="text-yellow-400" /> Yes
                              </label>
                              <label className="flex items-center gap-2 text-zinc-400 text-xs">
                                <input type="radio" disabled name={`preview_${field.id}`} className="text-yellow-400" /> No
                              </label>
                            </div>
                          ) : (
                            <input
                              type={
                                field.type === "PASSWORD"
                                  ? "password"
                                  : field.type === "NUMBER"
                                  ? "number"
                                  : "text"
                              }
                              readOnly
                              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                              className="bg-zinc-950 px-3 py-2 border border-yellow-500/25 rounded-xl focus:outline-none w-full text-zinc-200 text-xs placeholder:text-zinc-500"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ================= RIGHT FIELD INSPECTOR (Property Editor) ================= */}
        {/* Overlay Backdrop for Mobile / iPad */}
        {mobileInspectorOpen && (
          <div
            onClick={() => setMobileInspectorOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-30 transition-opacity"
          />
        )}

        <aside
          className={`flex flex-col bg-zinc-900/95 backdrop-blur-md border-yellow-500/25 border-l w-80 lg:w-64 xl:w-80 overflow-hidden shrink-0 transition-all duration-300 z-40 ${
            mobileInspectorOpen
              ? "fixed inset-y-0 right-0 shadow-2xl shadow-yellow-950"
              : "hidden lg:flex lg:relative"
          }`}
        >
          <div className="flex justify-between items-center p-4 border-yellow-500/25 border-b min-h-[57px]">
            <h2 className="flex items-center gap-1.5 font-bold text-yellow-400 text-xs uppercase tracking-wider">
              <Settings2 className="w-3.5 h-3.5 text-yellow-400" />
              Field Inspector
            </h2>
            <div className="flex items-center gap-2">
              {selectedField && (
                <span className="bg-yellow-500/10 border border-yellow-500/35 px-2 py-0.5 rounded-full font-bold text-[10px] text-yellow-400 uppercase glow-yellow">
                  {selectedField.type}
                </span>
              )}
              <button
                onClick={() => setMobileInspectorOpen(false)}
                className="lg:hidden p-1 text-zinc-400 hover:text-zinc-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-5 overflow-y-auto">
            {selectedField ? (
              <form onSubmit={handleSaveInspector} className="space-y-5">
                {/* Field Header */}
                <div className="flex items-center gap-3 pb-3 border-yellow-500/25 border-b">
                  <div className="bg-yellow-500/10 border border-yellow-500/35 p-2 rounded-xl text-yellow-400 shrink-0 glow-yellow">
                    {(() => {
                      const IconComp = getFieldIcon(selectedField.type, selectedField.label);
                      return <IconComp className="w-5 h-5" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-100 text-xs truncate">
                      {selectedField.label}
                    </p>
                    <p className="font-mono text-[10px] text-yellow-400/65 truncate">
                      {selectedField.labelKey}
                    </p>
                  </div>
                </div>

                {/* Property: Field Label (Live Concurrent Binding) */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-zinc-300 text-xs">
                    Field Name / Label <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => handleInspectorLabelChange(e.target.value)}
                    required
                    placeholder="e.g. Work Email Address"
                    className="bg-zinc-950 px-3 py-2 border border-yellow-500/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-400 w-full text-zinc-100 text-xs transition-all placeholder:text-zinc-500"
                  />
                </div>

                {/* Property: Help Text / Description (Live Concurrent Binding) */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-zinc-300 text-xs">
                    Description / Help Text
                  </label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => handleInspectorDescriptionChange(e.target.value)}
                    placeholder="e.g. We will send confirmation here"
                    className="bg-zinc-950 px-3 py-2 border border-yellow-500/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-400 w-full text-zinc-100 text-xs transition-all placeholder:text-zinc-500"
                  />
                </div>

                {/* Property: Placeholder Text (Live Concurrent Binding) */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-zinc-300 text-xs">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={editPlaceholder}
                    onChange={(e) => handleInspectorPlaceholderChange(e.target.value)}
                    placeholder="e.g. john@company.com"
                    className="bg-zinc-950 px-3 py-2 border border-yellow-500/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-400 w-full text-zinc-100 text-xs transition-all placeholder:text-zinc-500"
                  />
                </div>

                {/* Property: Required Flag (Live Concurrent Binding) */}
                <div className="pt-2 border-yellow-500/25 border-t">
                  <label className="flex justify-between items-center bg-zinc-950/70 hover:bg-yellow-500/10 p-3 border border-yellow-500/25 rounded-xl transition-colors cursor-pointer">
                    <div>
                      <p className="font-semibold text-zinc-200 text-xs">Required Field</p>
                      <p className="text-[10px] text-zinc-400">Mandatory for submissions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editIsRequired}
                      onChange={(e) => handleInspectorRequiredChange(e.target.checked)}
                      className="border-yellow-500/40 rounded focus:ring-yellow-500 w-4 h-4 text-yellow-400 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Save Button */}
                <div className="space-y-2 pt-3">
                  <button
                    type="submit"
                    disabled={isUpdatingField}
                    className="flex justify-center items-center gap-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:brightness-110 shadow-lg shadow-yellow-500/25 glow-yellow px-4 py-2.5 rounded-xl w-full font-black text-zinc-950 text-xs transition-all"
                  >
                    {isUpdatingField ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-950" /> Saving...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-zinc-950" /> Saved Changes
                      </>
                    ) : (
                      "Save Field Properties"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteField(selectedField.id)}
                    disabled={isDeletingField}
                    className="flex justify-center items-center gap-2 hover:bg-rose-500/20 hover:border-rose-500/40 px-4 py-2 border border-rose-500/20 rounded-xl w-full font-semibold text-rose-400 text-xs transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Field
                  </button>
                </div>
              </form>
            ) : (
              /* Empty Inspector Message */
              <div className="flex flex-col justify-center items-center space-y-3 my-auto p-6 h-full text-zinc-400 text-center">
                <div className="flex justify-center items-center bg-yellow-500/10 border border-yellow-500/30 rounded-full w-10 h-10 text-yellow-400 glow-yellow">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-200 text-xs">No Field Selected</p>
                  <p className="mt-1 max-w-[200px] text-[11px] text-zinc-400">
                    Click any field card on the central canvas to inspect and edit its properties.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
