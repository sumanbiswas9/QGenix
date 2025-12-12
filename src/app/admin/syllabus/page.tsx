"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/clientApi";

type Subject = { id: string; name: string };
type SyllabusItem = { id: string; module: number; unit: number; topic: string; details?: string };

export default function AdminSyllabusPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [items, setItems] = useState<SyllabusItem[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [mode, setMode] = useState<"single" | "bulk">("bulk");
  const [module, setModule] = useState(1);
  const [unit, setUnit] = useState(1);
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [parsedItems, setParsedItems] = useState<SyllabusItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSubjects = async () => {
    try {
      const res = await apiFetch<{ subjects: Subject[] }>("/api/subjects");
      setSubjects(res.subjects);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadItems = async (id: string) => {
    try {
      const res = await apiFetch<{ syllabus: SyllabusItem[] }>(`/api/syllabus?subjectId=${id}`);
      setItems(res.syllabus);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    void loadSubjects();
  }, []);

  useEffect(() => {
    if (subjectId) void loadItems(subjectId);
  }, [subjectId]);

  // Parse bulk syllabus text
  const parseBulkSyllabus = (text: string): SyllabusItem[] => {
    if (!subjectId) return [];
    
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const parsed: SyllabusItem[] = [];
    let currentModule = 1;
    let currentUnit = 1;

    for (const line of lines) {
      // Pattern 1: Module X, Unit Y: Topic
      const moduleUnitMatch = line.match(/^Module\s+(\d+)[,\s]+Unit\s+(\d+)[:\-]\s*(.+)$/i);
      if (moduleUnitMatch) {
        parsed.push({
          id: "",
          module: parseInt(moduleUnitMatch[1], 10),
          unit: parseInt(moduleUnitMatch[2], 10),
          topic: moduleUnitMatch[3].trim(),
        });
        currentModule = parseInt(moduleUnitMatch[1], 10);
        currentUnit = parseInt(moduleUnitMatch[2], 10);
        continue;
      }

      // Pattern 2: M1 U2: Topic or M1-U2: Topic
      const mUMatch = line.match(/^M\s*(\d+)[\s\-]U\s*(\d+)[:\-]\s*(.+)$/i);
      if (mUMatch) {
        parsed.push({
          id: "",
          module: parseInt(mUMatch[1], 10),
          unit: parseInt(mUMatch[2], 10),
          topic: mUMatch[3].trim(),
        });
        currentModule = parseInt(mUMatch[1], 10);
        currentUnit = parseInt(mUMatch[2], 10);
        continue;
      }

      // Pattern 3: Module X: Topic (assumes unit 1)
      const moduleMatch = line.match(/^Module\s+(\d+)[:\-]\s*(.+)$/i);
      if (moduleMatch) {
        parsed.push({
          id: "",
          module: parseInt(moduleMatch[1], 10),
          unit: 1,
          topic: moduleMatch[2].trim(),
        });
        currentModule = parseInt(moduleMatch[1], 10);
        currentUnit = 1;
        continue;
      }

      // Pattern 4: Unit X: Topic (uses current module)
      const unitMatch = line.match(/^Unit\s+(\d+)[:\-]\s*(.+)$/i);
      if (unitMatch) {
        parsed.push({
          id: "",
          module: currentModule,
          unit: parseInt(unitMatch[1], 10),
          topic: unitMatch[2].trim(),
        });
        currentUnit = parseInt(unitMatch[1], 10);
        continue;
      }

      // Pattern 5: Numbered list (1. Topic, 2. Topic) - increments unit
      const numberedMatch = line.match(/^\d+[\.\)]\s*(.+)$/);
      if (numberedMatch) {
        parsed.push({
          id: "",
          module: currentModule,
          unit: currentUnit,
          topic: numberedMatch[1].trim(),
        });
        currentUnit++;
        continue;
      }

      // Pattern 6: Bullet points (- Topic, * Topic) - increments unit
      const bulletMatch = line.match(/^[\-\*\+]\s*(.+)$/);
      if (bulletMatch) {
        parsed.push({
          id: "",
          module: currentModule,
          unit: currentUnit,
          topic: bulletMatch[1].trim(),
        });
        currentUnit++;
        continue;
      }

      // Pattern 7: Plain text line - use as topic with current module/unit
      if (line.length > 0) {
        parsed.push({
          id: "",
          module: currentModule,
          unit: currentUnit,
          topic: line,
        });
        currentUnit++;
      }
    }

    return parsed;
  };

  const handleParseBulk = () => {
    if (!subjectId) {
      setError("Please select a subject first");
      return;
    }
    if (!bulkText.trim()) {
      setError("Please paste syllabus content");
      return;
    }

    const parsed = parseBulkSyllabus(bulkText);
    if (parsed.length === 0) {
      setError("Could not parse any syllabus items. Please check the format.");
      return;
    }

    setParsedItems(parsed);
    setError(null);
    setMessage(`Parsed ${parsed.length} syllabus items. Review and import below.`);
  };

  const handleBulkImport = async () => {
    if (parsedItems.length === 0) {
      setError("No items to import. Please parse first.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await apiFetch("/api/syllabus", {
        method: "POST",
        body: JSON.stringify(parsedItems),
      });
      setMessage(`Successfully imported ${parsedItems.length} syllabus items!`);
      setBulkText("");
      setParsedItems([]);
      if (subjectId) await loadItems(subjectId);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to import syllabus items";
      setError(errorMsg);
      console.error("Bulk import error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addSyllabus = async () => {
    setMessage(null);
    setError(null);
    
    if (!subjectId) {
      setError("Please select a subject");
      return;
    }
    if (!topic.trim()) {
      setError("Topic is required");
      return;
    }
    if (module < 1 || unit < 1) {
      setError("Module and Unit must be at least 1");
      return;
    }
    
    try {
      await apiFetch("/api/syllabus", {
        method: "POST",
        body: JSON.stringify([{ subjectId, module, unit, topic, details: details || undefined }]),
      });
      setMessage("Syllabus item added");
      setTopic("");
      setDetails("");
      if (subjectId) await loadItems(subjectId);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to add syllabus item";
      setError(errorMsg);
      console.error("Add syllabus error:", err);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this syllabus item?")) return;
    setMessage(null);
    setError(null);
    try {
      await apiFetch("/api/syllabus", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      setMessage("Syllabus item deleted");
      if (subjectId) await loadItems(subjectId);
    } catch (err: any) {
      setError(err.message || "Failed to delete item");
    }
  };

  const clearAll = async () => {
    if (!subjectId) return;
    if (!confirm(`Delete ALL syllabus items for this subject? This cannot be undone.`)) return;
    
    setLoading(true);
    try {
      const itemsToDelete = items.map(item => item.id);
      await Promise.all(
        itemsToDelete.map(id =>
          apiFetch("/api/syllabus", {
            method: "DELETE",
            body: JSON.stringify({ id }),
          })
        )
      );
      setMessage(`Deleted ${itemsToDelete.length} syllabus items`);
      await loadItems(subjectId);
    } catch (err: any) {
      setError(err.message || "Failed to delete items");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Syllabus Management</h1>
          <p className="text-sm text-gray-600 mt-1">Add syllabus topics to enable question generation</p>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Subject Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Select Subject</label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setParsedItems([]);
            setBulkText("");
          }}
        >
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {subjectId && (
        <>
          {/* Mode Toggle */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode("bulk")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  mode === "bulk"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Bulk Import
              </button>
              <button
                onClick={() => setMode("single")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  mode === "single"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Single Item
              </button>
            </div>

            {/* Bulk Import Mode */}
            {mode === "bulk" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Paste Syllabus Content
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Supports multiple formats:
                    <br />• Module X, Unit Y: Topic
                    <br />• M1 U2: Topic
                    <br />• Module X: Topic
                    <br />• Unit X: Topic
                    <br />• Numbered or bulleted lists
                    <br />• Plain text (one topic per line)
                  </p>
                  <textarea
                    className="w-full min-h-[300px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
                    placeholder={`Example formats:
Module 1, Unit 1: Introduction to Programming
Module 1, Unit 2: Variables and Data Types
M1 U3: Control Structures
Module 2: Object-Oriented Programming
Unit 1: Classes and Objects
1. Functions
2. Arrays
- Pointers
* File Handling`}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleParseBulk}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Parse Syllabus
                  </button>
                  {parsedItems.length > 0 && (
                    <button
                      onClick={handleBulkImport}
                      disabled={loading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                    >
                      {loading ? "Importing..." : `Import ${parsedItems.length} Items`}
                    </button>
                  )}
                </div>

                {/* Preview Parsed Items */}
                {parsedItems.length > 0 && (
                  <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Preview ({parsedItems.length} items)
                    </h3>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {parsedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-white rounded p-2 border border-gray-200"
                        >
                          <span className="font-medium text-blue-600">
                            M{item.module} U{item.unit}:
                          </span>{" "}
                          <span className="text-gray-700">{item.topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Single Item Mode */}
            {mode === "single" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Module</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={module}
                      onChange={(e) => setModule(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Unit</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={unit}
                      onChange={(e) => setUnit(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Topic</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter topic name"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Details (optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Additional details..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={2}
                  />
                </div>
                <button
                  onClick={addSyllabus}
                  className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Add Syllabus Item
                </button>
              </div>
            )}
          </div>

          {/* Existing Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Syllabus Items ({items.length})
              </h3>
              {items.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-8">
                No syllabus items yet. Use bulk import or single item mode to add topics.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          M{item.module} U{item.unit}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{item.topic}</span>
                      </div>
                      {item.details && (
                        <p className="text-xs text-gray-600 mt-1">{item.details}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
