"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type CSSProperties,
  type ChangeEvent,
  type ReactNode
} from "react";
import { FontPicker } from "@/components/admin/font-picker";
import {
  HOMEPAGE_FONT_REGISTRY,
  getHomepageFontOption,
  getInlineTextStyleCss,
  hasInlineTextStyle,
  isHexColor,
  isSafeHomepageFontWeight,
  type InlineTextStyle,
  type InlineTextStyles
} from "@/lib/settings/inline-homepage";

type EditableElement = "span" | "p" | "strong" | "small" | "h1" | "h2" | "div";
type EditorToast = {
  id: number;
  tone: "success" | "error" | "info";
  message: string;
};

type PageInlineEditorContextValue = {
  pageTitle: string;
  isEditing: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  statusMessage: string | null;
  errorMessage: string | null;
  values: Record<string, string>;
  fieldLabels: Record<string, string>;
  fieldStyles: InlineTextStyles<string>;
  activeField: string | null;
  startEditing: () => void;
  cancelEditing: () => void;
  saveChanges: () => void;
  selectField: (field: string) => void;
  updateValue: (field: string, value: string) => void;
  updateFieldStyle: (field: string, style: InlineTextStyle) => void;
  resetFieldStyle: (field: string) => void;
};

const PageInlineEditorContext = createContext<PageInlineEditorContextValue | null>(null);

function cx(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

function areEqual(
  left: {
    values: Record<string, string>;
    fieldStyles: InlineTextStyles<string>;
  },
  right: {
    values: Record<string, string>;
    fieldStyles: InlineTextStyles<string>;
  }
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function getAllowedWeightsForStyle(style: InlineTextStyle | undefined) {
  const font = getHomepageFontOption(style?.fontKey);
  return font?.allowedWeights || ["400", "700"];
}

function usePageInlineEditor() {
  const context = useContext(PageInlineEditorContext);

  if (!context) {
    throw new Error("Page inline editor components must be used inside PageInlineEditor.");
  }

  return context;
}

export function PageInlineEditor({
  children,
  pageTitle,
  savePath,
  initialValues,
  initialFieldStyles,
  fieldLabels
}: {
  children: ReactNode;
  pageTitle: string;
  savePath: string;
  initialValues: Record<string, string>;
  initialFieldStyles: InlineTextStyles<string>;
  fieldLabels: Record<string, string>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [fieldStyles, setFieldStyles] = useState(initialFieldStyles);
  const [baseline, setBaseline] = useState({
    values: initialValues,
    fieldStyles: initialFieldStyles
  });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [toasts, setToasts] = useState<EditorToast[]>([]);
  const [isPending, startTransition] = useTransition();
  const isSaving = saveState === "saving" || isPending;
  const hasUnsavedChanges = useMemo(
    () => !areEqual({ values, fieldStyles }, baseline),
    [baseline, fieldStyles, values]
  );

  const showToast = useCallback((tone: EditorToast["tone"], message: string) => {
    const id = Date.now();

    setToasts((current) => [...current.slice(-2), { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const startEditing = useCallback(() => {
    setSaveState("idle");
    setIsEditing(true);
    showToast("info", "حالت ویرایش صفحه فعال شد.");
  }, [showToast]);

  const cancelEditing = useCallback(() => {
    if (hasUnsavedChanges && !window.confirm("تغییرات ذخیره‌نشده حذف شوند؟")) {
      return;
    }

    setValues(baseline.values);
    setFieldStyles(baseline.fieldStyles);
    setActiveField(null);
    setSaveState("idle");
    setIsEditing(false);
    showToast("info", "تغییرات این صفحه کنار گذاشته شد.");
  }, [baseline, hasUnsavedChanges, showToast]);

  const saveChanges = useCallback(() => {
    if (isSaving || !isEditing) {
      return;
    }

    if (!hasUnsavedChanges) {
      showToast("info", "تغییری برای ذخیره وجود ندارد.");
      return;
    }

    setSaveState("saving");
    startTransition(() => {
      void (async () => {
        const response = await fetch(savePath, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            content: values,
            fieldStyles
          })
        });

        if (!response.ok) {
          setSaveState("error");
          showToast("error", "ذخیره انجام نشد. متن یا استایل انتخاب‌شده را بررسی کن.");
          return;
        }

        setBaseline({ values, fieldStyles });
        setActiveField(null);
        setSaveState("saved");
        setIsEditing(false);
        showToast("success", "تغییرات صفحه ذخیره شد.");
        window.location.reload();
      })().catch(() => {
        setSaveState("error");
        showToast("error", "ارتباط با سرور برقرار نشد. دوباره تلاش کن.");
      });
    });
  }, [fieldStyles, hasUnsavedChanges, isEditing, isSaving, savePath, showToast, values]);

  useEffect(() => {
    if (!isEditing || !hasUnsavedChanges) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, isEditing]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";

      if (!isSaveShortcut || !isEditing) {
        return;
      }

      event.preventDefault();
      saveChanges();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, saveChanges]);

  const value = useMemo<PageInlineEditorContextValue>(
    () => ({
      pageTitle,
      isEditing,
      isSaving,
      hasUnsavedChanges,
      statusMessage: saveState === "saved" ? "ذخیره شد" : null,
      errorMessage: saveState === "error" ? "ذخیره انجام نشد. متن یا استایل انتخاب‌شده را بررسی کن." : null,
      values,
      fieldLabels,
      fieldStyles,
      activeField,
      startEditing,
      cancelEditing,
      saveChanges,
      selectField(field) {
        setActiveField(field);
      },
      updateValue(field, nextValue) {
        setValues((current) => ({
          ...current,
          [field]: nextValue
        }));
        setSaveState("idle");
      },
      updateFieldStyle(field, nextStyle) {
        setFieldStyles((current) => {
          const mergedStyle = {
            ...(current[field] || {}),
            ...nextStyle
          };

          if (mergedStyle.fontWeight && !isSafeHomepageFontWeight(mergedStyle.fontKey, mergedStyle.fontWeight)) {
            delete mergedStyle.fontWeight;
          }

          if (!hasInlineTextStyle(mergedStyle)) {
            const { [field]: _removed, ...rest } = current;
            return rest;
          }

          return {
            ...current,
            [field]: mergedStyle
          };
        });
        setSaveState("idle");
      },
      resetFieldStyle(field) {
        setFieldStyles((current) => {
          const { [field]: _removed, ...rest } = current;
          return rest;
        });
        setSaveState("idle");
      }
    }),
    [
      activeField,
      cancelEditing,
      fieldLabels,
      fieldStyles,
      hasUnsavedChanges,
      isEditing,
      isSaving,
      pageTitle,
      saveChanges,
      saveState,
      startEditing,
      values
    ]
  );

  return (
    <PageInlineEditorContext.Provider value={value}>
      <div className={cx("inline-editor-root", isEditing && "is-editing")}>
        {children}
        <InlinePageToolbar />
        <InlineTextStyleToolbar />
        <InlineEditorToasts toasts={toasts} />
      </div>
    </PageInlineEditorContext.Provider>
  );
}

export function EditablePageText({
  field,
  as = "span",
  className,
  label,
  placeholder,
  multiline = false
}: {
  field: string;
  as?: EditableElement;
  className?: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const editor = usePageInlineEditor();
  const Tag = as;
  const value = editor.values[field] || "";
  const resolvedPlaceholder = placeholder || label;
  const fieldStyle = editor.fieldStyles[field];
  const style = getInlineTextStyleCss(fieldStyle) as CSSProperties;
  const isSelected = editor.activeField === field;

  if (!editor.isEditing) {
    return (
      <Tag className={cx(multiline && "inline-editable-public-multiline", className)} dir="auto" style={style}>
        {value}
      </Tag>
    );
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    editor.updateValue(field, event.target.value);
  }

  const textLength = Array.from(value || resolvedPlaceholder).length;
  const inputSize = Math.min(64, Math.max(4, textLength + 1));
  const rowCount = Math.min(8, Math.max(2, value.split(/\r\n|\r|\n/).length));

  return (
    <Tag
      className={cx(
        "inline-editable-text",
        multiline && "is-multiline",
        isSelected && "is-selected",
        hasInlineTextStyle(fieldStyle) && "has-custom-style",
        className
      )}
      dir="auto"
      style={style}
      onClick={() => editor.selectField(field)}
      onFocus={() => editor.selectField(field)}
    >
      <span className="inline-edit-badge" aria-hidden="true">
        ویرایش
      </span>
      {multiline ? (
        <textarea
          className="inline-editable-control"
          dir="auto"
          value={value}
          rows={rowCount}
          placeholder={resolvedPlaceholder}
          aria-label={label}
          spellCheck={false}
          onFocus={() => editor.selectField(field)}
          onChange={handleChange}
        />
      ) : (
        <input
          className="inline-editable-control"
          dir="auto"
          type="text"
          value={value}
          size={inputSize}
          placeholder={resolvedPlaceholder}
          aria-label={label}
          spellCheck={false}
          onFocus={() => editor.selectField(field)}
          onChange={handleChange}
        />
      )}
    </Tag>
  );
}

function InlinePageToolbar() {
  const editor = usePageInlineEditor();

  if (!editor.isEditing) {
    return (
      <div className="inline-edit-toolbar inline-edit-toolbar-collapsed" role="region" aria-label={`ورود به ویرایش ${editor.pageTitle}`}>
        <div className="inline-edit-toolbar-brand">
          <span className="inline-edit-mode-dot" aria-hidden="true" />
          <div>
            <strong>ویرایش دیداری صفحه</strong>
            <span>فقط برای مدیر کل</span>
          </div>
        </div>
        <div className="inline-edit-toolbar-actions">
          <button className="btn btn-primary" type="button" onClick={editor.startEditing}>
            ویرایش {editor.pageTitle}
          </button>
        </div>
        {editor.statusMessage ? <span className="inline-edit-status">{editor.statusMessage}</span> : null}
      </div>
    );
  }

  return (
    <div className="inline-edit-toolbar is-expanded" role="region" aria-label={`ابزار ویرایش ${editor.pageTitle}`}>
      <div className="inline-edit-toolbar-brand">
        <span className={cx("inline-edit-mode-dot", editor.hasUnsavedChanges && "has-changes")} aria-hidden="true" />
        <div>
          <strong>{editor.hasUnsavedChanges ? "تغییرات ذخیره‌نشده داری" : "حالت ویرایش فعال است"}</strong>
          <span>{editor.isSaving ? "در حال ذخیره..." : "برای استایل متن، روی همان متن کلیک کن."}</span>
        </div>
      </div>
      <div className="inline-edit-toolbar-actions">
        <button className="btn btn-primary" type="button" onClick={editor.saveChanges} disabled={editor.isSaving}>
          {editor.isSaving ? "در حال ذخیره..." : "ذخیره"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={editor.cancelEditing} disabled={editor.isSaving}>
          کنار گذاشتن
        </button>
      </div>
      <div className="inline-edit-toolbar-status" aria-live="polite">
        {editor.errorMessage ? (
          <span className="inline-edit-error">{editor.errorMessage}</span>
        ) : editor.hasUnsavedChanges ? (
          <span className="inline-edit-unsaved">ذخیره نشده</span>
        ) : (
          <span className="inline-edit-status">همه چیز ذخیره است</span>
        )}
      </div>
    </div>
  );
}

function InlineTextStyleToolbar() {
  const editor = usePageInlineEditor();
  const field = editor.activeField;

  if (!editor.isEditing || !field) {
    return null;
  }

  const activeField = field;
  const style = editor.fieldStyles[activeField] || {};
  const allowedWeights = getAllowedWeightsForStyle(style);
  const value = editor.values[activeField] || "";

  function updateStyle(nextStyle: InlineTextStyle) {
    editor.updateFieldStyle(activeField, nextStyle);
  }

  return (
    <aside className="inline-style-panel" aria-label="تنظیمات متن انتخاب‌شده">
      <div className="inline-theme-panel-header">
        <strong>استایل متن</strong>
        <span>{editor.fieldLabels[field] || "رنگ، فونت و وزن همین متن را تغییر بده."}</span>
      </div>

      <label className="inline-theme-field">
        <span>متن</span>
        <textarea
          dir="auto"
          rows={Math.min(5, Math.max(2, value.split(/\r\n|\r|\n/).length))}
          value={value}
          onChange={(event) => editor.updateValue(activeField, event.target.value)}
        />
      </label>

      <label className="inline-theme-field">
        <span>فونت</span>
        <FontPicker
          value={style.fontKey || ""}
          placeholder="پیش‌فرض صفحه"
          ariaLabel="انتخاب فونت متن"
          onChange={(nextFontKey) => {
            const nextFont = getHomepageFontOption(nextFontKey);
            const currentWeight = style.fontWeight;

            updateStyle({
              fontKey: nextFontKey,
              fontWeight:
                currentWeight && nextFont?.allowedWeights.some((weight) => weight === currentWeight)
                  ? currentWeight
                  : undefined
            });
          }}
        />
      </label>

      <label className="inline-theme-field">
        <span>رنگ متن</span>
        <div className="inline-color-row">
          <input
            type="color"
            value={isHexColor(style.color) ? style.color : "#1a73e8"}
            onChange={(event) => updateStyle({ color: event.target.value })}
          />
          <input
            dir="ltr"
            value={style.color || ""}
            onChange={(event) => updateStyle({ color: event.target.value })}
            placeholder="#1a73e8"
          />
        </div>
      </label>

      <label className="inline-theme-field">
        <span>وزن فونت</span>
        <select
          value={style.fontWeight || ""}
          onChange={(event) => updateStyle({ fontWeight: event.target.value as InlineTextStyle["fontWeight"] })}
        >
          <option value="">پیش‌فرض</option>
          {allowedWeights.map((weight) => (
            <option key={weight} value={weight}>
              {weight === "700" ? "ضخیم ۷۰۰" : "معمولی ۴۰۰"}
            </option>
          ))}
        </select>
      </label>

      <button className="btn btn-secondary" type="button" onClick={() => editor.resetFieldStyle(activeField)}>
        بازنشانی استایل این متن
      </button>
    </aside>
  );
}

function InlineEditorToasts({ toasts }: { toasts: EditorToast[] }) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="inline-toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div className={cx("inline-toast", `is-${toast.tone}`)} key={toast.id}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
