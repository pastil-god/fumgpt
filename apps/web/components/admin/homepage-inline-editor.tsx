"use client";

import Image from "next/image";
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
import { FontPicker } from "@/components/admin/font-picker";
import { CloudinaryImageField } from "@/components/admin/cloudinary-image-field";
import {
  DEFAULT_HOMEPAGE_LAYOUT_SETTINGS,
  DEFAULT_INLINE_THEME_VALUES,
  HOMEPAGE_FONT_REGISTRY,
  HOMEPAGE_LAYOUT_PRESETS,
  INLINE_THEME_BUTTON_RADIUS_OPTIONS,
  INLINE_THEME_BUTTON_STYLE_OPTIONS,
  INLINE_THEME_CARD_RADIUS_OPTIONS,
  INLINE_THEME_CARD_SHADOW_OPTIONS,
  INLINE_THEME_COLOR_PRESETS,
  INLINE_THEME_DENSITY_OPTIONS,
  buildInlineThemeStyleCss,
  getHomepageLayoutClassNames,
  getHomepageFieldStyleCss,
  getHomepageLayoutStyleCss,
  getHomepageFontOption,
  hasHomepageFieldStyle,
  isHexColor,
  normalizeInlineThemeValues,
  isSafeHomepageFontWeight,
  splitTrustPoints,
  type HomepageFieldStyle,
  type HomepageFieldStyles,
  type HomepageLayoutDensity,
  type HomepageLayoutSettings,
  type InlineHomepageHrefField,
  type InlineHomepageImageField,
  type InlineHomepageTextField,
  type InlineHomepageValues,
  type InlineHomepageVisibilityField,
  type InlineThemeValues
} from "@/lib/settings/inline-homepage";

type EditableElement = "span" | "p" | "strong" | "small" | "h2" | "div";
type InlineEditorPanel = "theme" | "sections" | "layout" | null;
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
  resolvedTheme: InlineThemeValues;
  fieldStyles: HomepageFieldStyles;
  layoutSettings: HomepageLayoutSettings;
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
  updateLayoutSettings: (next: HomepageLayoutSettings | ((current: HomepageLayoutSettings) => HomepageLayoutSettings)) => void;
  resetLayoutSettings: () => void;
  resetThemeToDefaults: () => void;
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
  left: {
    homepage: InlineHomepageValues;
    theme: InlineThemeValues;
    fieldStyles: HomepageFieldStyles;
    layoutSettings: HomepageLayoutSettings;
  },
  right: {
    homepage: InlineHomepageValues;
    theme: InlineThemeValues;
    fieldStyles: HomepageFieldStyles;
    layoutSettings: HomepageLayoutSettings;
  }
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
  initialFieldStyles,
  initialLayoutSettings
}: {
  children: ReactNode;
  initialHomepage: InlineHomepageValues;
  initialTheme: InlineThemeValues;
  initialFieldStyles: HomepageFieldStyles;
  initialLayoutSettings: HomepageLayoutSettings;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [homepage, setHomepage] = useState(initialHomepage);
  const [fieldStyles, setFieldStyles] = useState(initialFieldStyles);
  const [layoutSettings, setLayoutSettings] = useState(initialLayoutSettings);
  const [activeStyleField, setActiveStyleField] = useState<InlineHomepageTextField | null>(null);
  const [theme, setTheme] = useState(initialTheme);
  const [baseline, setBaseline] = useState({
    homepage: initialHomepage,
    fieldStyles: initialFieldStyles,
    layoutSettings: initialLayoutSettings,
    theme: initialTheme
  });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activePanel, setActivePanel] = useState<InlineEditorPanel>(null);
  const [toasts, setToasts] = useState<InlineEditorToast[]>([]);
  const [isPending, startTransition] = useTransition();
  const isSaving = saveState === "saving" || isPending;
  const hasUnsavedChanges = useMemo(
    () => !areEditorValuesEqual({ homepage, theme, fieldStyles, layoutSettings }, baseline),
    [baseline, fieldStyles, homepage, layoutSettings, theme]
  );
  const resolvedTheme = useMemo(() => normalizeInlineThemeValues(theme, baseline.theme), [baseline.theme, theme]);

  const showToast = useCallback((tone: InlineEditorToast["tone"], message: string) => {
    const id = Date.now();

    setToasts((current) => [...current.slice(-2), { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const previewStyle = useMemo(() => {
    return {
      ...buildInlineThemeStyleCss(resolvedTheme),
      ...getHomepageLayoutStyleCss(layoutSettings)
    } as CSSProperties;
  }, [layoutSettings, resolvedTheme]);

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
    setLayoutSettings(baseline.layoutSettings);
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
            fieldStyles,
            layoutSettings
          })
        });

        if (!response.ok) {
          setSaveState("error");
          showToast("error", "ذخیره انجام نشد. مقدار لینک، رنگ یا فونت را بررسی کن.");
          return;
        }

        setBaseline({ homepage, theme, fieldStyles, layoutSettings });
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
  }, [fieldStyles, hasUnsavedChanges, homepage, isEditing, isSaving, layoutSettings, router, showToast, theme]);

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
      resolvedTheme,
      fieldStyles,
      layoutSettings,
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
      updateLayoutSettings(next) {
        setLayoutSettings((current) => (typeof next === "function" ? next(current) : next));
        setSaveState("idle");
      },
      resetLayoutSettings() {
        setLayoutSettings(DEFAULT_HOMEPAGE_LAYOUT_SETTINGS);
        setSaveState("idle");
      },
      resetThemeToDefaults() {
        setTheme({ ...DEFAULT_INLINE_THEME_VALUES });
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
      layoutSettings,
      resolvedTheme,
      saveChanges,
      saveState,
      startEditing,
      theme
    ]
  );

  return (
    <InlineEditorContext.Provider value={value}>
      <div
        className={cx("inline-editor-root", getHomepageLayoutClassNames(layoutSettings), isEditing && "is-editing")}
        style={previewStyle}
      >
        {children}
        <EditModeToolbar />
        <ThemeQuickPanel />
        <LayoutQuickPanel />
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
      <span className="inline-edit-badge" aria-hidden="true">ویرایش</span>
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

export function EditableImageFrame({
  field,
  defaultSrc,
  alt,
  width,
  height,
  priority = false,
  sizes,
  className,
  imageClassName
}: {
  field: InlineHomepageImageField;
  defaultSrc: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
}) {
  const editor = useInlineEditor();
  const currentValue = editor.homepage[field]?.trim() || "";
  const imageSrc = currentValue || defaultSrc;
  const [isOpen, setIsOpen] = useState(false);
  const [draftValue, setDraftValue] = useState(imageSrc);
  const hasCustomImage = Boolean(currentValue);

  function openEditor() {
    setDraftValue(currentValue || defaultSrc);
    setIsOpen(true);
  }

  function closeEditor() {
    setDraftValue(imageSrc);
    setIsOpen(false);
  }

  function saveImage() {
    const nextValue = draftValue.trim();
    editor.updateHomepageField(field, nextValue === defaultSrc ? "" : nextValue);
    setIsOpen(false);
  }

  function resetImage() {
    setDraftValue(defaultSrc);
    editor.updateHomepageField(field, "");
    setIsOpen(false);
  }

  const image = (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={imageClassName}
    />
  );

  if (!editor.isEditing) {
    return image;
  }

  return (
    <>
      <div
        className={cx("inline-editable-image", isOpen && "is-selected", className)}
        role="button"
        tabIndex={0}
        aria-label="تغییر تصویر"
        onClick={openEditor}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openEditor();
          }
        }}
      >
        {image}
        <span className="inline-image-edit-badge">تغییر تصویر</span>
      </div>

      {isOpen ? (
        <div className="inline-image-modal-backdrop" role="presentation" onClick={closeEditor}>
          <section
            className="inline-image-modal"
            role="dialog"
            aria-modal="true"
            aria-label="ویرایش تصویر"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="inline-image-modal-header">
              <div>
                <span className="eyebrow">ویرایش تصویر</span>
                <strong>تصویر Hero صفحه اصلی</strong>
              </div>
              <button type="button" className="inline-image-close" onClick={closeEditor} aria-label="لغو">
                ×
              </button>
            </div>

            <CloudinaryImageField
              name={`${field}-draft`}
              label="آپلود تصویر"
              value={draftValue}
              usage="homepage"
              placeholder="https://res.cloudinary.com/..."
              previewAlt={alt}
              onChange={setDraftValue}
              className="inline-image-cloudinary-field"
            />

            <label className="inline-image-url-field">
              <span>وارد کردن لینک تصویر</span>
              <input
                dir="ltr"
                type="url"
                value={draftValue}
                placeholder="/illustrations/hero-ai-marketplace.svg"
                onChange={(event) => setDraftValue(event.target.value)}
              />
            </label>

            <div className="inline-image-preview">
              <span>پیش‌نمایش</span>
              <div>
                {draftValue.trim() ? (
                  <img src={draftValue.trim()} alt={alt} loading="lazy" />
                ) : (
                  <small>هنوز تصویری انتخاب نشده است.</small>
                )}
              </div>
            </div>

            <div className="inline-image-modal-actions">
              <button type="button" className="btn btn-primary" onClick={saveImage}>
                ذخیره
              </button>
              <button type="button" className="btn btn-secondary" onClick={closeEditor}>
                لغو
              </button>
              <button type="button" className="btn btn-ghost" onClick={resetImage} disabled={!hasCustomImage && draftValue === defaultSrc}>
                بازنشانی
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
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
        <FontPicker
          value={style.fontKey || ""}
          placeholder="پیش‌فرض سایت"
          ariaLabel="انتخاب فونت متن ویژه"
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
          className={cx("btn", editor.activePanel === "layout" ? "btn-primary" : "btn-secondary")}
          type="button"
          onClick={() => editor.setActivePanel(editor.activePanel === "layout" ? null : "layout")}
          aria-pressed={editor.activePanel === "layout"}
        >
          چیدمان
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

function LayoutQuickPanel() {
  const editor = useInlineEditor();

  if (!editor.isEditing || editor.activePanel !== "layout") {
    return null;
  }

  const layout = editor.layoutSettings;

  function setHeroPreset(density: HomepageLayoutDensity) {
    editor.updateLayoutSettings((current) => ({
      ...current,
      hero: { ...HOMEPAGE_LAYOUT_PRESETS.hero[density] }
    }));
  }

  function setSectionPreset(density: HomepageLayoutDensity) {
    editor.updateLayoutSettings((current) => ({
      ...current,
      sections: { ...HOMEPAGE_LAYOUT_PRESETS.sections[density] }
    }));
  }

  function setProductPreset(density: HomepageLayoutDensity) {
    editor.updateLayoutSettings((current) => ({
      ...current,
      products: { ...HOMEPAGE_LAYOUT_PRESETS.products[density] }
    }));
  }

  function setAnnouncementPreset(density: HomepageLayoutDensity) {
    editor.updateLayoutSettings((current) => ({
      ...current,
      announcement: { ...HOMEPAGE_LAYOUT_PRESETS.announcement[density] }
    }));
  }

  return (
    <aside className="inline-theme-panel inline-layout-panel" aria-label="تنظیمات چیدمان صفحه اصلی">
      <div className="inline-theme-panel-header">
        <strong>چیدمان صفحه</strong>
        <span>پیش‌نمایش زنده است؛ ذخیره یا لغو از نوار پایین انجام می‌شود.</span>
      </div>

      <LayoutFieldset title="کارت Hero">
        <PresetControl value={layout.hero.density} onChange={setHeroPreset} />
        <RangeControl
          label="ارتفاع کارت"
          value={layout.hero.minHeight}
          min={440}
          max={780}
          step={10}
          suffix="px"
          onChange={(minHeight) =>
            editor.updateLayoutSettings((current) => ({ ...current, hero: { ...current.hero, minHeight } }))
          }
        />
        <RangeControl
          label="ارتفاع تصویر"
          value={layout.hero.visualHeight}
          min={220}
          max={380}
          step={10}
          suffix="px"
          onChange={(visualHeight) =>
            editor.updateLayoutSettings((current) => ({ ...current, hero: { ...current.hero, visualHeight } }))
          }
        />
        <RangeControl
          label="فاصله محتوای Hero"
          value={layout.hero.contentGap}
          min={16}
          max={52}
          step={2}
          suffix="px"
          onChange={(contentGap) =>
            editor.updateLayoutSettings((current) => ({ ...current, hero: { ...current.hero, contentGap } }))
          }
        />
      </LayoutFieldset>

      <LayoutFieldset title="سکشن‌ها">
        <PresetControl value={layout.sections.density} onChange={setSectionPreset} />
        <RangeControl
          label="فاصله عمودی سکشن"
          value={layout.sections.paddingY}
          min={40}
          max={112}
          step={4}
          suffix="px"
          onChange={(paddingY) =>
            editor.updateLayoutSettings((current) => ({ ...current, sections: { ...current.sections, paddingY } }))
          }
        />
        <RangeControl
          label="عرض امن صفحه"
          value={layout.sections.maxWidth}
          min={1040}
          max={1320}
          step={20}
          suffix="px"
          onChange={(maxWidth) =>
            editor.updateLayoutSettings((current) => ({ ...current, sections: { ...current.sections, maxWidth } }))
          }
        />
      </LayoutFieldset>

      <LayoutFieldset title="کارت‌ها و محصولات">
        <PresetControl value={layout.products.density} onChange={setProductPreset} />
        <RangeControl
          label="گردی کارت‌ها"
          value={layout.cards.radius}
          min={18}
          max={40}
          step={1}
          suffix="px"
          onChange={(radius) =>
            editor.updateLayoutSettings((current) => ({ ...current, cards: { ...current.cards, radius } }))
          }
        />
      </LayoutFieldset>

      <LayoutFieldset title="نوار پایانی">
        <PresetControl value={layout.announcement.density} onChange={setAnnouncementPreset} />
        <RangeControl
          label="ارتفاع نوار"
          value={layout.announcement.minHeight}
          min={88}
          max={220}
          step={4}
          suffix="px"
          onChange={(minHeight) =>
            editor.updateLayoutSettings((current) => ({
              ...current,
              announcement: { ...current.announcement, minHeight }
            }))
          }
        />
      </LayoutFieldset>

      <button className="btn btn-secondary" type="button" onClick={editor.resetLayoutSettings}>
        بازنشانی چیدمان
      </button>
    </aside>
  );
}

function LayoutFieldset({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="inline-layout-fieldset">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

function PresetControl({
  value,
  onChange
}: {
  value: HomepageLayoutDensity;
  onChange: (value: HomepageLayoutDensity) => void;
}) {
  return (
    <div className="inline-preset-control" role="group" aria-label="پیش‌فرض فاصله و اندازه">
      <button type="button" className={value === "compact" ? "is-active" : ""} onClick={() => onChange("compact")}>
        فشرده
      </button>
      <button type="button" className={value === "normal" ? "is-active" : ""} onClick={() => onChange("normal")}>
        معمولی
      </button>
      <button type="button" className={value === "spacious" ? "is-active" : ""} onClick={() => onChange("spacious")}>
        باز
      </button>
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="inline-range-control">
      <span>
        {label}
        <strong dir="ltr">{value}{suffix}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ThemeColorField({
  label,
  value,
  fallback,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  fallback: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const hasInvalidValue = value.trim().length > 0 && !isHexColor(value);

  return (
    <label className="inline-theme-field">
      <span>{label}</span>
      <div className="inline-color-row">
        <input type="color" value={isHexColor(value) ? value : fallback} onChange={(event) => onChange(event.target.value)} />
        <input dir="ltr" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      </div>
      <small className={cx("inline-theme-helper", hasInvalidValue && "is-error")}>
        {hasInvalidValue ? "فقط رنگ هگز مثل #1a73e8 قابل ذخیره است." : "می‌توانی از پیکر یا کد هگز استفاده کنی."}
      </small>
    </label>
  );
}

function ThemeSegmentedField<TValue extends string>({
  label,
  hint,
  value,
  options,
  onChange
}: {
  label: string;
  hint: string;
  value: TValue;
  options: ReadonlyArray<{
    value: TValue;
    label: string;
  }>;
  onChange: (value: TValue) => void;
}) {
  return (
    <div className="inline-theme-field">
      <span>{label}</span>
      <div className="inline-preset-control" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={value === option.value ? "is-active" : ""}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <small className="inline-theme-helper">{hint}</small>
    </div>
  );
}

function ThemePreviewCard({ theme }: { theme: InlineThemeValues }) {
  const headingFont = getHomepageFontOption(theme.headingFontFamily);
  const bodyFont = getHomepageFontOption(theme.fontFamily);

  return (
    <div className="inline-theme-preview" style={buildInlineThemeStyleCss(theme)}>
      <div className="inline-theme-preview-card">
        <span className="inline-theme-preview-eyebrow">پیش‌نمایش زنده</span>
        <strong className="inline-theme-preview-title">{headingFont?.label || "فونت تیتر"} برای تیترها</strong>
        <p>
          {bodyFont?.label || "فونت اصلی"} برای متن بدنه، با کارت، فاصله و دکمه‌هایی که از تنظیمات فعلی پیروی
          می‌کنند.
        </p>
        <div className="inline-theme-preview-actions">
          <button type="button" className="btn btn-primary">
            دکمه اصلی
          </button>
          <button type="button" className="btn btn-secondary">
            دکمه فرعی
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemeQuickPanel() {
  const editor = useInlineEditor();

  if (!editor.isEditing || editor.activePanel !== "theme") {
    return null;
  }

  const normalizedTheme = editor.resolvedTheme;

  return (
    <aside className="inline-theme-panel inline-theme-appearance-panel" aria-label="تنظیمات ظاهر سایت">
      <div className="inline-theme-panel-header">
        <strong>کنترل ظاهر سایت</strong>
        <span>فقط برای super admin. تغییرات با ذخیره نهایی اعمال می‌شوند و CSS دلخواهی وارد سایت نمی‌شود.</span>
      </div>

      <div className="inline-theme-group">
        <div className="inline-theme-group-header">
          <strong>پالت پیشنهادی</strong>
          <span>برای شروع سریع، یکی از ترکیب‌های هماهنگ را انتخاب کن.</span>
        </div>
        <div className="inline-theme-preset-grid">
          {INLINE_THEME_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="inline-theme-preset-card"
              onClick={() => {
                editor.updateThemeField("primaryColor", preset.primaryColor);
                editor.updateThemeField("secondaryColor", preset.secondaryColor);
                editor.updateThemeField("backgroundTint", preset.backgroundTint);
              }}
            >
              <span
                className="inline-theme-preset-swatch"
                style={{
                  background: `linear-gradient(135deg, ${preset.primaryColor} 0%, ${preset.secondaryColor} 100%)`
                }}
                aria-hidden="true"
              />
              <span
                className="inline-theme-preset-swatch is-muted"
                style={{ backgroundColor: preset.backgroundTint }}
                aria-hidden="true"
              />
              <strong>{preset.label}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="inline-theme-group">
        <div className="inline-theme-group-header">
          <strong>رنگ‌ها</strong>
          <span>رنگ اصلی، مکمل و ته‌رنگ پس‌زمینه را جداگانه کنترل کن.</span>
        </div>
        <ThemeColorField
          label="رنگ اصلی"
          value={editor.theme.primaryColor}
          fallback={DEFAULT_INLINE_THEME_VALUES.primaryColor}
          placeholder="#1a73e8"
          onChange={(value) => editor.updateThemeField("primaryColor", value)}
        />
        <ThemeColorField
          label="رنگ مکمل"
          value={editor.theme.secondaryColor}
          fallback={DEFAULT_INLINE_THEME_VALUES.secondaryColor}
          placeholder="#8c6bff"
          onChange={(value) => editor.updateThemeField("secondaryColor", value)}
        />
        <ThemeColorField
          label="ته‌رنگ پس‌زمینه"
          value={editor.theme.backgroundTint}
          fallback={DEFAULT_INLINE_THEME_VALUES.backgroundTint}
          placeholder="#fafcff"
          onChange={(value) => editor.updateThemeField("backgroundTint", value)}
        />
      </div>

      <div className="inline-theme-group">
        <div className="inline-theme-group-header">
          <strong>فونت‌ها</strong>
          <span>فونت بدنه و تیترها از رجیستری امن سایت انتخاب می‌شوند.</span>
        </div>
        <label className="inline-theme-field">
          <span>فونت اصلی</span>
          <FontPicker
            value={normalizedTheme.fontFamily}
            placeholder="وزیرمتن"
            ariaLabel="انتخاب فونت اصلی سایت"
            defaultHint="پیش‌فرض پیشنهادی"
            onChange={(value) =>
              editor.updateThemeField(
                "fontFamily",
                (value || DEFAULT_INLINE_THEME_VALUES.fontFamily) as InlineThemeValues["fontFamily"]
              )
            }
          />
        </label>
        <label className="inline-theme-field">
          <span>فونت تیترها</span>
          <FontPicker
            value={normalizedTheme.headingFontFamily}
            placeholder="وزیرمتن"
            ariaLabel="انتخاب فونت تیترهای سایت"
            defaultHint="پیش‌فرض پیشنهادی"
            onChange={(value) =>
              editor.updateThemeField(
                "headingFontFamily",
                (value || DEFAULT_INLINE_THEME_VALUES.headingFontFamily) as InlineThemeValues["headingFontFamily"]
              )
            }
          />
        </label>
      </div>

      <div className="inline-theme-group">
        <div className="inline-theme-group-header">
          <strong>فرم و تراکم</strong>
          <span>بدون دستکاری دستی CSS، ظاهر کلی دکمه‌ها و کارت‌ها را تنظیم کن.</span>
        </div>
        <ThemeSegmentedField
          label="گردی دکمه"
          hint="روی دکمه‌های اصلی و فرعی اعمال می‌شود."
          value={normalizedTheme.buttonRadius}
          options={INLINE_THEME_BUTTON_RADIUS_OPTIONS}
          onChange={(value) => editor.updateThemeField("buttonRadius", value)}
        />
        <ThemeSegmentedField
          label="گردی کارت"
          hint="روی کارت‌های اصلی و سطوح برجسته تاثیر می‌گذارد."
          value={normalizedTheme.cardRadius}
          options={INLINE_THEME_CARD_RADIUS_OPTIONS}
          onChange={(value) => editor.updateThemeField("cardRadius", value)}
        />
        <ThemeSegmentedField
          label="سایه کارت"
          hint="شدت عمق کارت‌ها را کنترل می‌کند."
          value={normalizedTheme.cardShadow}
          options={INLINE_THEME_CARD_SHADOW_OPTIONS}
          onChange={(value) => editor.updateThemeField("cardShadow", value)}
        />
        <ThemeSegmentedField
          label="تراکم سکشن‌ها"
          hint="برای صفحات عمومی با سکشن‌های استاندارد استفاده می‌شود."
          value={normalizedTheme.sectionDensity}
          options={INLINE_THEME_DENSITY_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label
          }))}
          onChange={(value) => editor.updateThemeField("sectionDensity", value)}
        />
        <ThemeSegmentedField
          label="استایل دکمه اصلی"
          hint="حالت پر، ملایم یا خطی."
          value={normalizedTheme.buttonStyle}
          options={INLINE_THEME_BUTTON_STYLE_OPTIONS}
          onChange={(value) => editor.updateThemeField("buttonStyle", value)}
        />
      </div>

      <div className="inline-theme-group">
        <div className="inline-theme-group-header">
          <strong>پیش‌نمایش</strong>
          <span>نمونه پایین دقیقاً از همان CSS variableهای عمومی سایت استفاده می‌کند.</span>
        </div>
        <ThemePreviewCard theme={normalizedTheme} />
      </div>

      <div className="inline-theme-actions">
        <button className="btn btn-secondary" type="button" onClick={editor.resetThemeToDefaults}>
          بازنشانی به پیش‌فرض
        </button>
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
