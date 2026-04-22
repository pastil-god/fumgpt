export type ContentModelFieldDefinition = {
  id: string;
  name: string;
  type: "shortText" | "longText" | "number" | "boolean" | "dateTime" | "media" | "list";
  required?: boolean;
  itemsType?: "shortText" | "media";
  description: string;
};

export type ContentModelDefinition = {
  id: string;
  name: string;
  purpose: string;
  phase: "now" | "next";
  fields: ContentModelFieldDefinition[];
};

export const storefrontContentModelDefinitions: ContentModelDefinition[] = [
  {
    id: "siteSettings",
    name: "Site Settings",
    purpose: "Global brand, support, footer, topbar, and navigation-adjacent marketing content.",
    phase: "now",
    fields: [
      { id: "brandName", name: "Brand name", type: "shortText", required: true, description: "Main brand name shown across the site." },
      { id: "siteTitle", name: "Site title", type: "shortText", required: true, description: "Default SEO title for the storefront." },
      { id: "siteDescription", name: "Site description", type: "longText", required: true, description: "Default SEO description and general site summary." },
      { id: "brandTagline", name: "Brand tagline", type: "shortText", description: "Short line under the brand name in header/footer." },
      { id: "logo", name: "Logo", type: "media", description: "Primary logo image." },
      { id: "topBarText", name: "Top bar text", type: "shortText", description: "Main helper message in the top utility bar." },
      { id: "topBarHighlights", name: "Top bar highlights", type: "list", itemsType: "shortText", description: "Short supporting trust/highlight items." },
      { id: "supportPhone", name: "Support phone", type: "shortText", description: "Support phone number." },
      { id: "supportEmail", name: "Support email", type: "shortText", description: "Support email address." },
      { id: "supportAddress", name: "Support address", type: "longText", description: "Address or support guidance text." },
      { id: "supportCtaLabel", name: "Support CTA label", type: "shortText", description: "Text for the main support/help CTA." },
      { id: "supportCtaHref", name: "Support CTA link", type: "shortText", description: "Link for the main support/help CTA." },
      { id: "telegramUrl", name: "Telegram URL", type: "shortText", description: "Telegram contact URL." },
      { id: "instagramUrl", name: "Instagram URL", type: "shortText", description: "Instagram profile URL." },
      { id: "whatsappUrl", name: "WhatsApp URL", type: "shortText", description: "WhatsApp contact URL." },
      { id: "footerText", name: "Footer text", type: "longText", description: "Main footer description." },
      { id: "copyrightText", name: "Copyright text", type: "shortText", description: "Footer copyright line." },
      { id: "trustBadges", name: "Trust badges", type: "list", itemsType: "shortText", description: "Short trust items used in hero/footer/support areas." }
    ]
  },
  {
    id: "homepageSettings",
    name: "Homepage",
    purpose: "Manage hero, section intros, homepage marketing blocks, and homepage CTA content.",
    phase: "now",
    fields: [
      { id: "heroEyebrow", name: "Hero eyebrow", type: "shortText", description: "Small label above the hero title." },
      { id: "heroStatusLabel", name: "Hero status label", type: "shortText", description: "Small supporting status badge inside the hero." },
      { id: "heroTitleLead", name: "Hero title lead", type: "shortText", description: "First part of the hero heading." },
      { id: "heroTitleHighlight", name: "Hero title highlight", type: "shortText", description: "Highlighted part of the hero heading." },
      { id: "heroTitleTail", name: "Hero title tail", type: "shortText", description: "Final part of the hero heading." },
      { id: "heroDescription", name: "Hero description", type: "longText", description: "Main supporting hero text." },
      { id: "heroPrimaryCtaLabel", name: "Hero primary CTA label", type: "shortText", description: "Text for the main hero button." },
      { id: "heroPrimaryCtaHref", name: "Hero primary CTA link", type: "shortText", description: "Link for the main hero button." },
      { id: "heroSecondaryCtaLabel", name: "Hero secondary CTA label", type: "shortText", description: "Text for the secondary hero button." },
      { id: "heroSecondaryCtaHref", name: "Hero secondary CTA link", type: "shortText", description: "Link for the secondary hero button." },
      { id: "heroProofTitle", name: "Hero proof title", type: "shortText", description: "Trust/support title in the hero." },
      { id: "heroProofText", name: "Hero proof text", type: "shortText", description: "Trust/support supporting text in the hero." },
      { id: "heroQuickStartTitle", name: "Hero quick start title", type: "shortText", description: "Quick-start block title." },
      { id: "heroQuickStartText", name: "Hero quick start text", type: "longText", description: "Quick-start helper text." },
      { id: "heroMarketLabel", name: "Hero market label", type: "shortText", description: "Small label for the hero side panel." },
      { id: "heroMarketTitle", name: "Hero market title", type: "shortText", description: "Title for the hero side panel." },
      { id: "heroMarketDescription", name: "Hero market description", type: "longText", description: "Supporting text for the hero side panel." },
      { id: "heroMarketBadge", name: "Hero market badge", type: "shortText", description: "Short badge text for the hero side panel." },
      { id: "showCategorySection", name: "Show category section", type: "boolean", description: "Toggle the homepage category section." },
      { id: "categoriesEyebrow", name: "Category section eyebrow", type: "shortText", description: "Small label for the homepage category section." },
      { id: "categoriesTitle", name: "Category section title", type: "shortText", description: "Title for the homepage category section." },
      { id: "categoriesDescription", name: "Category section description", type: "longText", description: "Description for the homepage category section." },
      { id: "categoriesCtaLabel", name: "Category section CTA label", type: "shortText", description: "Button text for the homepage category section." },
      { id: "categoriesCtaHref", name: "Category section CTA link", type: "shortText", description: "Button link for the homepage category section." },
      { id: "showFeaturedSection", name: "Show featured products section", type: "boolean", description: "Toggle the homepage featured products section." },
      { id: "featuredEyebrow", name: "Featured section eyebrow", type: "shortText", description: "Small label for featured products." },
      { id: "featuredTitle", name: "Featured section title", type: "shortText", description: "Title for featured products." },
      { id: "featuredDescription", name: "Featured section description", type: "longText", description: "Description for featured products." },
      { id: "featuredCtaLabel", name: "Featured section CTA label", type: "shortText", description: "Button text for featured products." },
      { id: "featuredCtaHref", name: "Featured section CTA link", type: "shortText", description: "Button link for featured products." },
      { id: "showNewsSection", name: "Show news section", type: "boolean", description: "Toggle the homepage news section." },
      { id: "newsEyebrow", name: "News section eyebrow", type: "shortText", description: "Small label for the news section." },
      { id: "newsTitle", name: "News section title", type: "shortText", description: "Title for the news section." },
      { id: "newsDescription", name: "News section description", type: "longText", description: "Description for the news section." },
      { id: "newsCtaLabel", name: "News section CTA label", type: "shortText", description: "Button text for the news section." },
      { id: "newsCtaHref", name: "News section CTA link", type: "shortText", description: "Button link for the news section." },
      { id: "newsAdminCalloutLabel", name: "News callout label", type: "shortText", description: "Admin-callout label for the news block." },
      { id: "newsAdminCalloutTitle", name: "News callout title", type: "shortText", description: "Admin-callout title for the news block." },
      { id: "newsAdminCalloutDescription", name: "News callout description", type: "longText", description: "Admin-callout description for the news block." },
      { id: "showSupportBanner", name: "Show support banner", type: "boolean", description: "Toggle the bottom homepage support banner." },
      { id: "announcementLabel", name: "Announcement label", type: "shortText", description: "Small label for the homepage support banner." },
      { id: "announcementTitle", name: "Announcement title", type: "shortText", description: "Title for the homepage support banner." },
      { id: "announcementDescription", name: "Announcement description", type: "longText", description: "Description for the homepage support banner." },
      { id: "announcementCtaLabel", name: "Announcement CTA label", type: "shortText", description: "Button text for the homepage support banner." },
      { id: "announcementCtaHref", name: "Announcement CTA link", type: "shortText", description: "Button link for the homepage support banner." }
    ]
  },
  {
    id: "categoryContent",
    name: "Category",
    purpose: "Manage storefront category presentation copy such as label and description without touching commerce logic.",
    phase: "now",
    fields: [
      { id: "key", name: "Category key", type: "shortText", required: true, description: "One of: ai-access, creative, coding, professional." },
      { id: "label", name: "Category label", type: "shortText", description: "Public label shown in tabs, hero, and listing pages." },
      { id: "description", name: "Category description", type: "longText", description: "Short marketing description for the category." },
      { id: "status", name: "Status", type: "shortText", description: "Use active or draft to control visibility." },
      { id: "priority", name: "Priority", type: "number", description: "Optional ordering value if category content is listed later." }
    ]
  },
  {
    id: "product",
    name: "Product Display Content",
    purpose: "Manage product presentation fields for the storefront while keeping inventory, checkout, orders, and payment logic out of the CMS.",
    phase: "now",
    fields: [
      { id: "title", name: "Title", type: "shortText", required: true, description: "Public product title." },
      { id: "slug", name: "Slug", type: "shortText", required: true, description: "Unique product slug." },
      { id: "shortDescription", name: "Short description", type: "longText", required: true, description: "Card and listing summary text." },
      { id: "description", name: "Long description", type: "longText", description: "Main product description page content." },
      { id: "category", name: "Category key", type: "shortText", required: true, description: "Category key for display grouping." },
      { id: "brand", name: "Brand", type: "shortText", description: "Brand or service provider name." },
      { id: "price", name: "Display price", type: "number", required: true, description: "Simple display price for phase 1 storefront." },
      { id: "comparePrice", name: "Display compare price", type: "number", description: "Optional compare price for discounts." },
      { id: "badge", name: "Badge text", type: "shortText", description: "Optional badge text such as a sale note." },
      { id: "coverLabel", name: "Cover label", type: "shortText", description: "Short text inside the product visual area." },
      { id: "accent", name: "Accent", type: "shortText", description: "One of: emerald, cyan, violet, amber." },
      { id: "delivery", name: "Delivery text", type: "shortText", description: "Short delivery/presentation text." },
      { id: "deliveryNote", name: "Delivery note", type: "longText", description: "Optional supporting delivery note." },
      { id: "features", name: "Features", type: "list", itemsType: "shortText", description: "Feature list for the detail page." },
      { id: "notes", name: "Notes", type: "list", itemsType: "shortText", description: "Extra notes for the detail page." },
      { id: "image", name: "Main image", type: "media", description: "Main product image." },
      { id: "galleryImages", name: "Gallery images", type: "list", itemsType: "media", description: "Optional product gallery." },
      { id: "videoFile", name: "Video file", type: "media", description: "Optional product video file." },
      { id: "videoUrl", name: "Video URL", type: "shortText", description: "Optional external video link." },
      { id: "trustNote", name: "Trust note", type: "longText", description: "Optional reassurance text." },
      { id: "supportNote", name: "Support note", type: "longText", description: "Optional support/help text." },
      { id: "isFeatured", name: "Featured", type: "boolean", description: "Show this product in homepage featured sections." },
      { id: "status", name: "Status", type: "shortText", description: "Use active, draft, or archived." },
      { id: "priority", name: "Priority", type: "number", description: "Optional ordering value." }
    ]
  },
  {
    id: "academyArticle",
    name: "Academy Article",
    purpose: "Future phase educational content for academy pages, guides, and learning paths.",
    phase: "next",
    fields: [
      { id: "title", name: "Title", type: "shortText", required: true, description: "Article title." },
      { id: "slug", name: "Slug", type: "shortText", required: true, description: "Unique article slug." },
      { id: "summary", name: "Summary", type: "longText", description: "Short article summary for cards and SEO." },
      { id: "body", name: "Body", type: "longText", required: true, description: "Main article body." },
      { id: "coverImage", name: "Cover image", type: "media", description: "Optional article cover image." },
      { id: "publishedAt", name: "Published at", type: "dateTime", description: "Article publish date." },
      { id: "status", name: "Status", type: "shortText", description: "Use active or draft." },
      { id: "topic", name: "Topic", type: "shortText", description: "Optional article topic label." }
    ]
  },
  {
    id: "faqItem",
    name: "FAQ Item",
    purpose: "Simple editable FAQs for landing pages, product reassurance blocks, and support sections.",
    phase: "next",
    fields: [
      { id: "question", name: "Question", type: "shortText", required: true, description: "FAQ question text." },
      { id: "answer", name: "Answer", type: "longText", required: true, description: "FAQ answer text." },
      { id: "group", name: "Group", type: "shortText", description: "Optional grouping such as homepage, product, or academy." },
      { id: "status", name: "Status", type: "shortText", description: "Use active or draft." },
      { id: "priority", name: "Priority", type: "number", description: "Optional ordering value." }
    ]
  },
  {
    id: "announcementBanner",
    name: "Announcement / Banner",
    purpose: "Simple marketing banners, promos, launch notices, and support banners.",
    phase: "next",
    fields: [
      { id: "label", name: "Label", type: "shortText", description: "Small banner label." },
      { id: "title", name: "Title", type: "shortText", required: true, description: "Banner title." },
      { id: "description", name: "Description", type: "longText", description: "Banner supporting text." },
      { id: "ctaLabel", name: "CTA label", type: "shortText", description: "Optional banner button text." },
      { id: "ctaHref", name: "CTA link", type: "shortText", description: "Optional banner button link." },
      { id: "placement", name: "Placement", type: "shortText", description: "Optional location like homepage, category, academy." },
      { id: "status", name: "Status", type: "shortText", description: "Use active or draft." },
      { id: "priority", name: "Priority", type: "number", description: "Optional ordering value." }
    ]
  }
];

export function getContentModelDefinitionById(id: string) {
  return storefrontContentModelDefinitions.find((model) => model.id === id);
}
