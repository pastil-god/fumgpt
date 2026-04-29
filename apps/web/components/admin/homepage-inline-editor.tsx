"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  HOMEPAGE_FONT_REGISTRY,
  INLINE_FONT_OPTIONS,
  getHomepageFieldStyleCss,
  getHomepageFontOption,
  getInlineFontFamilyFallback,
  hasHomepageFieldStyle,
  isHexColor,
  isSafeHomepageFontWeight,
  splitTrustPoints,
  type HomepageFieldStyle,
  type HomepageFieldStyles,
  type InlineHomepageHrefField,
  type InlineHomepageTextField,
  type InlineHomepageValues,
  type InlineHomepageVisibilityField,
  type InlineThemeValues
} from "@/lib/settings/inline-homepage";

type EditableElement = "span" | "p" | "strong" | "small" | "h2" | "div";
type InlineEditorPanel = "theme" | "sections" | null;
type InlineEditorToast = {
  id: number;
  tone: "success" | "error" | "info";
  message: string;
};

type InlineEditorContextValue = {
  isEditing: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  activePanel: InlineEditorPanel;
  statusMessage: string | null;
  errorMessage: string | null;
  homepage: InlineHomepageValues;
  theme: InlineThemeValues;
  fieldStyles: HomepageFieldStyles;
  activeStyleField: InlineHomepageTextField | null;
  startEditing: () => void;
  cancelEditing: () => void;
  saveChanges: () => void;
  setActivePanel: (panel: InlineEditorPanel) => void;
  selectStyleField: (field: InlineHomepageTextField) => void;
  updateHomepageField: <Field extends keyof InlineHomepageValues>(
    field: Field,
    value: InlineHomepageValues[Field]
  ) => void;
  updateHomepageFieldStyle: (field: InlineHomepageTextField, style: HomepageFieldStyle) => void;
  resetHomepageFieldStyle: (field: InlineHomepageTextField) => void;
  updateThemeField: <Field extends keyof InlineThemeValues>(field: Field, value: InlineThemeValues[Field]) => void;
};

const InlineEditorContext = createContext<InlineEditorContextValue | null>(null);

function cx(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function areEditorValuesEqual(
  left: { homepage: InlineHomepageValues; theme: InlineThemeValues; fieldStyles: HomepageFieldStyles },
  right: { homepage: InlineHomepageValues; theme: InlineThemeValues; fieldStyles: HomepageFieldStyles }
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function getAllowedWeightsForStyle(style: HomepageFieldStyle | undefined) {
  const font = getHomepageFontOption(style?.fontKey);
  return font?.allowedWeights || ["400", "700"];
}

function useInlineEditor() {
  const context = useContext(InlineEditorContext);

  if (!context) {
    throw new Error("Inline editor components must be used inside HomepageInlineEditor.");
  }

  return context;
}

export function HomepageInlineEditor({
  children,
  initialHomepage,
  initialTheme,
  initialFieldStyles
}: {
  children: ReactNode;
  initialHomepage: InlineHomepageValues;
  initialTheme: InlineThemeValues;
  initialFieldStyles: HomepageFieldStyles;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [homepage, setHomepage] = useState(initialHomepage);
  const [fieldStyles, setFieldStyles] = useState(initialFieldStyles);
  const [activeStyleField, setActiveStyleField] = useState<InlineHomepageTextField | null>(null);
  const [theme, setTheme] = useState({
    ...initialTheme,
    fontFamily: getInlineFontFamilyFallback(initialTheme.fontFamily)
  });
  const [baseline, setBaseline] = useState({
    homepage: initialHomepage,
    fieldStyles: initialFieldStyles,
    theme: {
      ...initialTheme,
      fontFamily: getInlineFontFamilyFallback(initialTheme.fontFamily)
    }
  });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activePanel, setActivePanel] = useState<InlineEditorPanel>(null);
  const [toasts, setToasts] = useState<InlineEditorToast[]>([]);
  const [isPending, startTransition] = useTransition();
  const isSaving = saveState === "saving" || isPending;
  const hasUnsavedChanges = useMemo(
    () => !areEditorValuesEqual({ homepage, theme, fieldStyles }, baseline),
    [baseline, fieldStyles, homepage, theme]
  );

  const showToast = useCallback((tone: InlineEditorToast["tone"], message: string) => {
    const id = Date.now();

    setToasts((current) => [...current.slice(-2), { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const previewStyle = useMemo(() => {
    const primaryColor = isHexColor(theme.primaryColor) ? theme.primaryColor : baseline.theme.primaryColor;
    const secondaryColor = isHexColor(theme.secondaryColor) ? theme.secondaryColor : baseline.theme.secondaryColor;

    return {
      "--color-accent": primaryColor,
      "--color-accent-hover": primaryColor,
      "--accent-purple": secondaryColor,
      "--primary": primaryColor,
      "--primary-strong": primaryColor,
      "--primary-gradient": `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      "--font-ui": getInlineFontFamilyFallback(theme.fontFamily)
    } as CSSProperties;
  }, [baseline.theme.primaryColor, baseline.theme.secondaryColor, theme]);

  const startEditing = useCallback(() => {
    setSaveState("idle");
    setActivePanel(null);
    setIsEditing(true);
    showToast("info", "حالت ویرایش فعال شد.");
  }, [showToast]);

  const cancelEditing = useCallback(() => {
    if (hasUnsavedChanges && !window.confirm("تغییرات ذخیره‌نشده حذف شوند؟")) {
      return;
    }

    setHomepage(baseline.homepage);
    setFieldStyles(baseline.fieldStyles);
    setTheme(baseline.theme);
    setSaveState("idle");
    setActivePanel(null);
    setActiveStyleField(null);
    setIsEditing(false);
    showToast("info", "تغییرات کنار گذاشته شد.");
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
        const response = await fetch("/api/admin/homepage-inline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            homepage,
            theme,
            fieldStyles
          })
        });

        if (!response.ok) {
          setSaveState("error");
          showToast("error", "ذخیره انجام نشد. مقدار لینک، رنگ یا فونت را بررسی کن.");
          return;
        }

        setBaseline({ homepage, theme, fieldStyles });
        setSaveState("saved");
        setActivePanel(null);
        setActiveStyleField(null);
        setIsEditing(false);
        showToast("success", "تغییرات صفحه ذخیره شد.");
        router.refresh();
      })().catch(() => {
        setSaveState("error");
        showToast("error", "ارتباط با سرور برقرار نشد. دوباره تلاش کن.");
      });
    });
  }, [fieldStyles, hasUnsavedChanges, homepage, isEditing, isSaving, router, showToast, theme]);

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

  const value = useMemo<InlineEditorContextValue>(
    () => ({
      isEditing,
      isSaving,
      hasUnsavedChanges,
      activePanel,
      statusMessage: saveState === "saved" ? "ذخیره شد" : null,
      errorMessage: saveState === "error" ? "ذخیره انجام نشد. مقدار لینک، رنگ یا فونت را بررسی کن." : null,
      homepage,
      theme,
      fieldStyles,
      activeStyleField,
      startEditing,
      cancelEditing,
      saveChanges,
      setActivePanel,
      selectStyleField(field) {
        setActiveStyleField(field);
      },
      updateHomepageField(field, nextValue) {
        setHomepage((current) => ({
          ...current,
          [field]: nextValue
        }));
        setSaveState("idle");
      },
      updateHomepageFieldStyle(field, nextStyle) {
        setFieldStyles((current) => {
          const mergedStyle = {
            ...(current[field] || {}),
            ...nextStyle
          };

          if (mergedStyle.fontWeight && !isSafeHomepageFontWeight(mergedStyle.fontKey, mergedStyle.fontWeight)) {
            delete mergedStyle.fontWeight;
          }

          if (!hasHomepageFieldStyle(mergedStyle)) {
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
      resetHomepageFieldStyle(field) {
        setFieldStyles((current) => {
          const { [field]: _removed, ...rest } = current;
          return rest;
        });
        setSaveState("idle");
      },
      updateThemeField(field, nextValue) {
        setTheme((current) => ({
          ...current,
          [field]: nextValue
        }));
        setSaveState("idle");
      }
    }),
    [
      activePanel,
      activeStyleField,
      cancelEditing,
      fieldStyles,
      hasUnsavedChanges,
      homepage,
      isEditing,
      isSaving,
      saveChanges,
      saveState,
      startEditing,
      theme
    ]
  );

  return (
    <InlineEditorContext.Provider value={value}>
      <div className={cx("inline-editor-root", isEditing && "is-editing")} style={previewStyle}>
        {children}
        <EditModeToolbar />
        <ThemeQuickPanel />
        <SectionsQuickPanel />
        <FieldStylePanel />
        <InlineEditorToasts toasts={toasts} />
      </div>
    </InlineEditorContext.Provider>
  );
}

export function EditableText({
  field,
  as = "span",
  className,
  label,
  placeholder,
  multiline = false
}: {
  field: InlineHomepageTextField;
  as?: EditableElement;
  className?: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const editor = useInlineEditor();
  const Tag = as;
  const value = editor.homepage[field];
  const resolvedPlaceholder = placeholder || label;
  const fieldStyle = editor.fieldStyles[field];
  const style = getHomepageFieldStyleCss(fieldStyle) as CSSProperties;
  const isSelected = editor.activeStyleField === field;

  if (!editor.isEditing) {
    return (
      <Tag className={cx(multiline && "inline-editable-public-multiline", className)} dir="auto" style={style}>
        {value}
      </Tag>
    );
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    editor.updateHomepageField(field, event.target.value);
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
        hasHomepageFieldStyle(fieldStyle) && "has-custom-style",
        className
      )}
      data-placeholder={resolvedPlaceholder}
      dir="auto"
      style={style}
      onClick={() => editor.selectStyleField(field)}
      onFocus={() => editor.selectStyleField(field)}
    >
      {multiline ? (
        <textarea
          className="inline-editable-control"
          dir="auto"
          value={value}
          rows={rowCount}
          placeholder={resolvedPlaceholder}
          aria-label={label}
          spellCheck={false}
          onFocus={() => editor.selectStyleField(field)}
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
          onFocus={() => editor.selectStyleField(field)}
          onChange={handleChange}
        />
      )}
    </Tag>
  );
}

export function EditableAction({
  labelField,
  hrefField,
  className,
  label,
  hrefLabel
}: {
  labelField: InlineHomepageTextField;
  hrefField: InlineHomepageHrefField;
  className: string;
  label: string;
  hrefLabel: string;
}) {
  const editor = useInlineEditor();
  const href = editor.homepage[hrefField] || "#";
  const buttonLabel = editor.homepage[labelField];
  const style = getHomepageFieldStyleCss(editor.fieldStyles[labelField]) as CSSProperties;

  if (!editor.isEditing) {
    if (isExternalHref(href)) {
      return (
        <a className={className} href={href} target="_blank" rel="noreferrer" style={style}>
          {buttonLabel}
        </a>
      );
    }

    return (
      <Link className={className} href={href} prefetch={false} style={style}>
        {buttonLabel}
      </Link>
    );
  }

  return (
    <div className="inline-edit-action-shell">
      <span className={cx(className, "inline-edit-action-button")}>
        <EditableText field={labelField} as="span" label={label} />
      </span>
      <label className="inline-link-editor">
        <span>{hrefLabel}</span>
        <input
          dir="ltr"
          value={href}
          onChange={(event) => editor.updateHomepageField(hrefField, event.target.value)}
          placeholder="/products یا https://..."
        />
      </label>
    </div>
  );
}

export function InlineActionPreview({
  labelField,
  hrefField,
  className
}: {
  labelField: InlineHomepageTextField;
  hrefField: InlineHomepageHrefField;
  className: string;
}) {
  const editor = useInlineEditor();
  const href = editor.homepage[hrefField] || "#";
  const buttonLabel = editor.homepage[labelField];
  const style = getHomepageFieldStyleCss(editor.fieldStyles[labelField]) as CSSProperties;

  if (isExternalHref(href)) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer" style={style}>
        {buttonLabel}
      </a>
    );
  }

  return (
    <Link className={className} href={href} prefetch={false} style={style}>
      {buttonLabel}
    </Link>
  );
}

export function EditableTrustPoints({ className }: { className: string }) {
  const editor = useInlineEditor();
  const points = splitTrustPoints(editor.homepage.trustPoints);
  const style = getHomepageFieldStyleCss(editor.fieldStyles.trustPoints) as CSSProperties;

  if (!editor.isEditing) {
    return (
      <ul className={className} style={style}>
        {points.map((point, index) => (
          <li key={`${point}-${index}`}>{point}</li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className={cx("inline-list-editor", editor.activeStyleField === "trustPoints" && "is-selected")}
      style={style}
      onClick={() => editor.selectStyleField("trustPoints")}
    >
      <label>
        <span>خط‌های اعتماد؛ هر خط یک مورد</span>
        <textarea
          dir="auto"
          value={editor.homepage.trustPoints}
          rows={6}
          onFocus={() => editor.selectStyleField("trustPoints")}
          onChange={(event) => editor.updateHomepageField("trustPoints", event.target.value)}
        />
      </label>
    </div>
  );
}

export function SectionEditControls({
  field,
  label
}: {
  field: InlineHomepageVisibilityField;
  label: string;
}) {
  const editor = useInlineEditor();

  if (!editor.isEditing) {
    return null;
  }

  const isVisible = editor.homepage[field];

  return (
    <div className="inline-section-controls">
      <span>{label}</span>
      <button type="button" onClick={() => editor.updateHomepageField(field, !isVisible)}>
        {isVisible ? "پنهان کردن" : "نمایش دادن"}
      </button>
    </div>
  );
}

export function EditableSectionFrame({
  field,
  label,
  hiddenFallback,
  children
}: {
  field: InlineHomepageVisibilityField;
  label: string;
  hiddenFallback?: ReactNode;
  children: ReactNode;
}) {
  const editor = useInlineEditor();
  const isVisible = editor.homepage[field];

  if (!isVisible && !editor.isEditing) {
    return hiddenFallback ? <>{hiddenFallback}</> : null;
  }

  if (!isVisible && editor.isEditing) {
    return (
      <>
        <section className="section inline-hidden-section">
          <div className="container">
            <div className="surface inline-hidden-section-card">
              <SectionEditControls field={field} label={label} />
              <strong>{label}</strong>
              <p>این سکشن برای بازدیدکنندگان غیرفعال است. می‌توانی از همین‌جا دوباره نمایشش بدهی.</p>
            </div>
          </div>
        </section>
        {hiddenFallback}
      </>
    );
  }

  return (
    <div className={cx("inline-section-frame", editor.isEditing && "is-editing")}>
      <SectionEditControls field={field} label={label} />
      {children}
    </div>
  );
}

export function EditableBlockFrame({
  field,
  label,
  children
}: {
  field: InlineHomepageVisibilityField;
  label: string;
  children: ReactNode;
}) {
  const editor = useInlineEditor();
  const isVisible = editor.homepage[field];

  if (!isVisible && !editor.isEditing) {
    return null;
  }

  if (!isVisible && editor.isEditing) {
    return (
      <div className="surface inline-hidden-block-card">
        <SectionEditControls field={field} label={label} />
        <strong>{label}</strong>
        <p>این بخش برای بازدیدکنندگان غیرفعال است.</p>
      </div>
    );
  }

  return (
    <div className={cx("inline-block-frame", editor.isEditing && "is-editing")}>
      <SectionEditControls field={field} label={label} />
      {children}
    </div>
  );
}

export function EditableSectionGroup({
  fields,
  children
}: {
  fields: InlineHomepageVisibilityField[];
  children: ReactNode;
}) {
  const editor = useInlineEditor();
  const hasVisibleSection = fields.some((field) => editor.homepage[field]);

  if (!hasVisibleSection && !editor.isEditing) {
    return null;
  }

  return <>{children}</>;
}

function FieldStylePanel() {
  const editor = useInlineEditor();
  const field = editor.activeStyleField;

  if (!editor.isEditing || !field) {
    return null;
  }

  const activeField = field;
  const style = editor.fieldStyles[activeField] || {};
  const allowedWeights = getAllowedWeightsForStyle(style);
  const value = editor.homepage[activeField];

  function updateStyle(nextStyle: HomepageFieldStyle) {
    editor.updateHomepageFieldStyle(activeField, nextStyle);
  }

  return (
    <aside className="inline-style-panel" aria-label="تنظیمات متن انتخاب‌شده">
      <div className="inline-theme-panel-header">
        <strong>استایل متن</strong>
        <span>فونت، رنگ و وزن همین بخش را تغییر بده.</span>
      </div>

      <label className="inline-theme-field">
        <span>متن</span>
        <textarea
          dir="auto"
          rows={Math.min(5, Math.max(2, value.split(/\r\n|\r|\n/).length))}
          value={value}
          onChange={(event) => editor.updateHomepageField(activeField, event.target.value)}
        />
      </label>

      <label className="inline-theme-field">
        <span>فونت عنوان/متن ویژه</span>
        <select
          value={style.fontKey || ""}
          onChange={(event) => {
            const nextFontKey = event.target.value || undefined;
            const nextFont = getHomepageFontOption(nextFontKey);
            const currentWeight = style.fontWeight;

            updateStyle({
              fontKey: nextFontKey as HomepageFieldStyle["fontKey"],
              fontWeight:
                currentWeight && nextFont?.allowedWeights.some((weight) => weight === currentWeight)
                  ? currentWeight
                  : undefined
            });
          }}
        >
          <option value="">پیش‌فرض سایت</option>
          {HOMEPAGE_FONT_REGISTRY.map((font) => (
            <option key={font.fontKey} value={font.fontKey}>
              {font.label}
            </option>
          ))}
        </select>
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
          onChange={(event) => updateStyle({ fontWeight: event.target.value as HomepageFieldStyle["fontWeight"] })}
        >
          <option value="">پیش‌فرض</option>
          {allowedWeights.map((weight) => (
            <option key={weight} value={weight}>
              {weight === "700" ? "ضخیم ۷۰۰" : "معمولی ۴۰۰"}
            </option>
          ))}
        </select>
      </label>

      <button className="btn btn-secondary" type="button" onClick={() => editor.resetHomepageFieldStyle(activeField)}>
        بازنشانی استایل این متن
      </button>
    </aside>
  );
}

function EditModeToolbar() {
  const editor = useInlineEditor();

  if (!editor.isEditing) {
    return (
      <div className="inline-edit-toolbar inline-edit-toolbar-collapsed" role="region" aria-label="ورود به ویرایش صفحه">
        <div className="inline-edit-toolbar-brand">
          <span className="inline-edit-mode-dot" aria-hidden="true" />
          <div>
            <strong>ویرایش دیداری</strong>
            <span>فقط برای مدیر کل</span>
          </div>
        </div>
        <div className="inline-edit-toolbar-actions">
          <button className="btn btn-primary" type="button" onClick={editor.startEditing}>
            ویرایش صفحه
          </button>
        </div>
        {editor.statusMessage ? <span className="inline-edit-status">{editor.statusMessage}</span> : null}
      </div>
    );
  }

  return (
    <div className="inline-edit-toolbar is-expanded" role="region" aria-label="ابزار ویرایش صفحه">
      <div className="inline-edit-toolbar-brand">
        <span className={cx("inline-edit-mode-dot", editor.hasUnsavedChanges && "has-changes")} aria-hidden="true" />
        <div>
          <strong>{editor.hasUnsavedChanges ? "تغییرات ذخیره‌نشده داری" : "حالت ویرایش فعال است"}</strong>
          <span>{editor.isSaving ? "در حال ذخیره..." : "Ctrl+S برای ذخیره سریع"}</span>
        </div>
      </div>
      <div className="inline-edit-toolbar-actions">
        <button
          className={cx("btn", editor.activePanel === "theme" ? "btn-primary" : "btn-secondary")}
          type="button"
          onClick={() => editor.setActivePanel(editor.activePanel === "theme" ? null : "theme")}
          aria-pressed={editor.activePanel === "theme"}
        >
          ظاهر
        </button>
        <button
          className={cx("btn", editor.activePanel === "sections" ? "btn-primary" : "btn-secondary")}
          type="button"
          onClick={() => editor.setActivePanel(editor.activePanel === "sections" ? null : "sections")}
          aria-pressed={editor.activePanel === "sections"}
        >
          سکشن‌ها
        </button>
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

function ThemeQuickPanel() {
  const editor = useInlineEditor();

  if (!editor.isEditing || editor.activePanel !== "theme") {
    return null;
  }

  return (
    <aside className="inline-theme-panel" aria-label="تنظیمات سریع ظاهر">
      <div className="inline-theme-panel-header">
        <strong>ظاهر سریع</strong>
        <span>پیش‌نمایش فوری</span>
      </div>

      <label className="inline-theme-field">
        <span>رنگ اصلی</span>
        <div className="inline-color-row">
          <input
            type="color"
            value={isHexColor(editor.theme.primaryColor) ? editor.theme.primaryColor : "#1a73e8"}
            onChange={(event) => editor.updateThemeField("primaryColor", event.target.value)}
          />
          <input
            dir="ltr"
            value={editor.theme.primaryColor}
            onChange={(event) => editor.updateThemeField("primaryColor", event.target.value)}
            placeholder="#1a73e8"
          />
        </div>
      </label>

      <label className="inline-theme-field">
        <span>رنگ مکمل</span>
        <div className="inline-color-row">
          <input
            type="color"
            value={isHexColor(editor.theme.secondaryColor) ? editor.theme.secondaryColor : "#8c6bff"}
            onChange={(event) => editor.updateThemeField("secondaryColor", event.target.value)}
          />
          <input
            dir="ltr"
            value={editor.theme.secondaryColor}
            onChange={(event) => editor.updateThemeField("secondaryColor", event.target.value)}
            placeholder="#8c6bff"
          />
        </div>
      </label>

      <label className="inline-theme-field">
        <span>فونت</span>
        <select
          value={editor.theme.fontFamily}
          onChange={(event) => editor.updateThemeField("fontFamily", event.target.value)}
        >
          {INLINE_FONT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="inline-theme-divider" />

      <div className="inline-image-note">
        <strong>تصویر Hero</strong>
        <p>
          مدل فعلی فیلد URL تصویر Hero ندارد. فعلا آپلود یا ذخیره تصویر اضافه نشده؛ بعدا می‌توانیم با یک migration کوچک، URL تصویر را هم قابل ویرایش کنیم.
        </p>
      </div>
    </aside>
  );
}

function SectionsQuickPanel() {
  const editor = useInlineEditor();

  if (!editor.isEditing || editor.activePanel !== "sections") {
    return null;
  }

  return (
    <aside className="inline-theme-panel inline-sections-panel" aria-label="کنترل سکشن‌های صفحه">
      <div className="inline-theme-panel-header">
        <strong>سکشن‌های صفحه</strong>
        <span>نمایش یا پنهان‌سازی سریع بخش‌ها</span>
      </div>

      <div className="inline-section-toggle-list">
        <SectionToggle
          label="دسته‌بندی‌ها"
          description="مسیرهای خرید و دسته‌های محصول"
          checked={editor.homepage.showCategorySection}
          onChange={(checked) => editor.updateHomepageField("showCategorySection", checked)}
        />
        <SectionToggle
          label="محصولات منتخب"
          description="کارت‌های محصول شاخص در صفحه اصلی"
          checked={editor.homepage.showFeaturedSection}
          onChange={(checked) => editor.updateHomepageField("showFeaturedSection", checked)}
        />
        <SectionToggle
          label="اخبار و راهنما"
          description="آخرین مطالب و بخش محتوایی"
          checked={editor.homepage.showNewsSection}
          onChange={(checked) => editor.updateHomepageField("showNewsSection", checked)}
        />
        <SectionToggle
          label="اعتماد"
          description="خط‌های اعتماد و دلایل انتخاب"
          checked={editor.homepage.showTrustSection}
          onChange={(checked) => editor.updateHomepageField("showTrustSection", checked)}
        />
        <SectionToggle
          label="مسیر توسعه"
          description="کارت roadmap و فازهای بعدی"
          checked={editor.homepage.showRoadmapSection}
          onChange={(checked) => editor.updateHomepageField("showRoadmapSection", checked)}
        />
        <SectionToggle
          label="نوار پایانی"
          description="CTA پشتیبانی یا شروع سفارش"
          checked={editor.homepage.showAnnouncement}
          onChange={(checked) => editor.updateHomepageField("showAnnouncement", checked)}
        />
      </div>
    </aside>
  );
}

function SectionToggle({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-section-toggle-card">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="inline-section-toggle-switch" aria-hidden="true" />
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
    </label>
  );
}

function InlineEditorToasts({ toasts }: { toasts: InlineEditorToast[] }) {
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
