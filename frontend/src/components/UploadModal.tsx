import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Fantasy",
  "Biography",
  "Horror",
  "Education",
  "Self-Help",
];

const UploadModal = ({ isOpen, onClose, onSuccess }: UploadModalProps) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    categories: [] as string[],
    cover: null as File | null,
    ebook: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
    details?: string;
  } | null>(null);
  const [showAnonymityChoice, setShowAnonymityChoice] = useState(false);
  const [uploadAsAnonymous, setUploadAsAnonymous] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "cover" | "ebook"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === "cover") {
        if (!file.type.startsWith("image/")) {
          setMessage({
            type: "error",
            text: "Cover must be an image file (JPG, PNG, etc.)",
          });
          return;
        }
      } else if (fileType === "ebook") {
        const validMimeTypes = ["application/epub+zip", "application/x-mobipocket-ebook", "application/vnd.amazon.ebook"];
        const fileName = file.name.toLowerCase();
        const validExtensions = [".epub", ".mobi", ".azw3"];
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
        
        if (!validMimeTypes.includes(file.type) && !hasValidExtension) {
          setMessage({
            type: "error",
            text: "eBook must be EPUB, MOBI, or AZW3 format",
          });
          return;
        }
      }

      setFormData((prev) => ({
        ...prev,
        [fileType]: file,
      }));
      setMessage(null);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setMessage({ type: "error", text: "Title is required" });
      return false;
    }
    if (!formData.author.trim()) {
      setMessage({ type: "error", text: "Author is required" });
      return false;
    }
    if (!formData.description.trim()) {
      setMessage({ type: "error", text: "Description is required" });
      return false;
    }
    if (formData.categories.length === 0) {
      setMessage({ type: "error", text: "Select at least one category" });
      return false;
    }
    if (!formData.cover) {
      setMessage({ type: "error", text: "Cover image is required" });
      return false;
    }
    if (!formData.ebook) {
      setMessage({ type: "error", text: "eBook file is required" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // If user is logged in, ask about anonymity
    if (user) {
      setShowAnonymityChoice(true);
      return;
    }

    // If not logged in, submit directly (as anonymous)
    await submitContribution(false);
  };

  const submitContribution = async (asAnonymous: boolean) => {
    setIsLoading(true);
    setShowAnonymityChoice(false);

    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title);
      submitFormData.append("author", formData.author);
      submitFormData.append("description", formData.description);
      // Flag to indicate whether to track this as a contribution
      submitFormData.append("trackAsContribution", String(!asAnonymous));

      // Add categories as array
      formData.categories.forEach((cat) => {
        submitFormData.append("categories", cat);
      });

      if (formData.cover) {
        submitFormData.append("cover", formData.cover);
      }
      if (formData.ebook) {
        submitFormData.append("ebook", formData.ebook);
      }

      const headers: any = {};
      // Only send token if user is logged in AND chose not to be anonymous
      if (!asAnonymous && user) {
        const token = localStorage.getItem("koodoreader_token");
        if (token) {
          headers["x-auth-token"] = token;
        }
      }

      const response = await fetch("http://localhost:8080/api/contributions", {
        method: "POST",
        body: submitFormData,
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        const chaptersMsg = data.chaptersExtracted 
          ? ` ${data.chaptersExtracted} chapters were automatically extracted.`
          : '';
        setMessage({
          type: "success",
          text: data.message || "Thank you for your contribution!",
          details: chaptersMsg
        });
        setFormData({
          title: "",
          author: "",
          description: "",
          categories: [],
          cover: null,
          ebook: null,
        });

        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text:
            errorData.error || "Failed to submit contribution. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again later.",
      });
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isDark = theme === "dark";
  const bgColor = isDark ? "#1a1a1a" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const inputBg = isDark ? "#2a2a2a" : "#f5f5f5";
  const inputBorder = isDark ? "#404040" : "#d0d0d0";
  const accentColor = "#0078ff";

  const modalOverlayStyles: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  };

  const modalContentStyles: React.CSSProperties = {
    backgroundColor: bgColor,
    borderRadius: "12px",
    padding: "32px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  };

  const titleStyles: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: "600",
    color: textColor,
    marginBottom: "24px",
    margin: 0,
  };

  const formGroupStyles: React.CSSProperties = {
    marginBottom: "20px",
  };

  const labelStyles: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: textColor,
    marginBottom: "8px",
  };

  const inputStyles: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${inputBorder}`,
    borderRadius: "6px",
    backgroundColor: inputBg,
    color: textColor,
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const textareaStyles: React.CSSProperties = {
    ...inputStyles,
    minHeight: "100px",
    resize: "vertical",
  };

  const categoriesContainerStyles: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "8px",
    marginTop: "8px",
  };

  const categoryButtonStyles = (isSelected: boolean): React.CSSProperties => ({
    padding: "8px 12px",
    border: `2px solid ${isSelected ? accentColor : inputBorder}`,
    borderRadius: "6px",
    backgroundColor: isSelected ? accentColor + "20" : "transparent",
    color: isSelected ? accentColor : textColor,
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  });

  const fileInputLabel: React.CSSProperties = {
    display: "inline-block",
    padding: "10px 16px",
    backgroundColor: accentColor,
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
  };

  const uploadAreaStyles = (isDragActive: boolean): React.CSSProperties => ({
    border: `2px dashed ${isDragActive ? accentColor : inputBorder}`,
    borderRadius: "6px",
    padding: "16px",
    textAlign: "center",
    backgroundColor: isDragActive ? accentColor + "10" : "transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
  });

  const messageStyles: React.CSSProperties = {
    padding: "12px 16px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "14px",
    backgroundColor:
      message?.type === "success"
        ? "#d4edda"
        : "#f8d7da",
    color:
      message?.type === "success"
        ? "#155724"
        : "#721c24",
    border: `1px solid ${
      message?.type === "success" ? "#c3e6cb" : "#f5c6cb"
    }`,
  };

  const buttonsContainerStyles: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  };

  const buttonStyles = (variant: "primary" | "secondary"): React.CSSProperties => ({
    flex: 1,
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor:
      variant === "primary" ? accentColor : "transparent",
    color: variant === "primary" ? "white" : textColor,
    borderColor: variant === "primary" ? "transparent" : inputBorder,
    borderWidth: variant === "primary" ? "0" : "1px",
  });

  return (
    <div style={modalOverlayStyles} onClick={onClose}>
      <div
        style={modalContentStyles}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={titleStyles}>Contribute a Book</h2>

        {message && (
          <div style={messageStyles}>
            <div>{message.text}</div>
            {message.details && (
              <div style={{ marginTop: "8px", fontSize: "13px", opacity: 0.9 }}>
                ✨ {message.details}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={formGroupStyles}>
            <label style={labelStyles}>Title *</label>
            <input
              style={inputStyles}
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter book title"
              disabled={isLoading}
            />
          </div>

          {/* Author */}
          <div style={formGroupStyles}>
            <label style={labelStyles}>Author *</label>
            <input
              style={inputStyles}
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Enter author name"
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div style={formGroupStyles}>
            <label style={labelStyles}>Description *</label>
            <textarea
              style={textareaStyles}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter book description"
              disabled={isLoading}
            />
          </div>

          {/* Categories */}
          <div style={formGroupStyles}>
            <label style={labelStyles}>Categories *</label>
            <div style={categoriesContainerStyles}>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  style={categoryButtonStyles(
                    formData.categories.includes(category)
                  )}
                  onClick={() => handleCategoryToggle(category)}
                  disabled={isLoading}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Image */}
          <div style={formGroupStyles}>
            <label style={labelStyles}>Cover Image *</label>
            <div style={uploadAreaStyles(false)}>
              <input
                type="file"
                id="cover-input"
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) => handleFileChange(e, "cover")}
                disabled={isLoading}
              />
              <label htmlFor="cover-input" style={fileInputLabel}>
                {formData.cover ? "✓ Cover Selected" : "Choose Cover Image"}
              </label>
              {formData.cover && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: isDark ? "#aaa" : "#666",
                  }}
                >
                  {formData.cover.name}
                </div>
              )}
            </div>
          </div>

          {/* eBook File */}
          <div style={formGroupStyles}>
            <label style={labelStyles}>eBook File (EPUB, MOBI, or AZW3) *</label>
            <div style={uploadAreaStyles(false)}>
              <input
                type="file"
                id="ebook-input"
                style={{ display: "none" }}
                accept=".epub,.mobi,.azw3"
                onChange={(e) => handleFileChange(e, "ebook")}
                disabled={isLoading}
              />
              <label htmlFor="ebook-input" style={fileInputLabel}>
                {formData.ebook ? "✓ File Selected" : "Choose eBook File"}
              </label>
              {formData.ebook && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: isDark ? "#aaa" : "#666",
                  }}
                >
                  {formData.ebook.name}
                </div>
              )}
            </div>
          </div>

          {/* Info Message */}
          <div
            style={{
              padding: "12px",
              backgroundColor: isDark ? "#2a2a2a" : "#f0f8ff",
              borderLeft: `3px solid ${accentColor}`,
              borderRadius: "4px",
              marginBottom: "20px",
              fontSize: "13px",
              color: isDark ? "#aaa" : "#333",
            }}
          >
            {user
              ? "📝 You can choose to contribute anonymously or with your account."
              : "📝 Login to get credit for your contributions!"}
          </div>

          {/* Buttons */}
          <div style={buttonsContainerStyles}>
            <button
              type="button"
              style={buttonStyles("secondary")}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...buttonStyles("primary"),
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Contribution"}
            </button>
          </div>
        </form>
      </div>

      {/* Anonymity Choice Dialog */}
      {showAnonymityChoice && user && (
        <div style={modalOverlayStyles} onClick={() => setShowAnonymityChoice(false)}>
          <div
            style={modalContentStyles}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={titleStyles}>Upload Method</h2>
            <p
              style={{
                fontSize: "16px",
                color: textColor,
                marginBottom: "24px",
                lineHeight: "1.5",
              }}
            >
              How would you like to contribute this book?
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              {/* Anonymous Option */}
              <button
                onClick={() => submitContribution(true)}
                style={{
                  padding: "16px",
                  border: `2px solid ${inputBorder}`,
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  color: textColor,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = accentColor;
                  e.currentTarget.style.backgroundColor = isDark ? "#2a2a2a" : "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = inputBorder;
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ fontWeight: "600", marginBottom: "4px" }}>📝 Upload Anonymously</div>
                <div
                  style={{
                    fontSize: "12px",
                    color: isDark ? "#888" : "#666",
                  }}
                >
                  Your contribution won't be linked to your account
                </div>
              </button>

              {/* With Account Option */}
              <button
                onClick={() => submitContribution(false)}
                style={{
                  padding: "16px",
                  border: `2px solid ${accentColor}`,
                  borderRadius: "8px",
                  backgroundColor: accentColor + "10",
                  color: textColor,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = accentColor + "20";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = accentColor + "10";
                }}
              >
                <div style={{ fontWeight: "600", marginBottom: "4px", color: accentColor }}>✓ Upload as {user.name}</div>
                <div
                  style={{
                    fontSize: "12px",
                    color: isDark ? "#888" : "#666",
                  }}
                >
                  Your contribution will be linked to your account
                </div>
              </button>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setShowAnonymityChoice(false)}
              style={buttonStyles("secondary")}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadModal;
