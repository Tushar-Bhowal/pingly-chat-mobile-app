import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";

// Default avatar URLs
const DEFAULT_AVATAR =
  "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
const DEFAULT_GROUP_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/166/166258.png";

export const getAvatarPath = (file: any, isGroup = false) => {
  if (file && typeof file == "string") return file;
  if (file && typeof file == "object") return file.uri;
  if (isGroup) return DEFAULT_GROUP_AVATAR;
  return DEFAULT_AVATAR;
};

// Cloudinary upload response type
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  url: string;
  format: string;
  width: number;
  height: number;
}

/**
 * Upload an image to Cloudinary
 * @param fileUri - Local file URI (from image picker)
 * @param folder - Optional folder name in Cloudinary (default: "avatars")
 * @returns Promise with the secure URL of the uploaded image
 */
export const uploadToCloudinary = async (
  fileUri: string,
  folder: string = "avatars"
): Promise<string> => {
  try {
    // Create form data
    const formData = new FormData();

    // Get file name and type from URI
    const fileName = fileUri.split("/").pop() || "image.jpg";
    const fileType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";

    // Append file to form data
    formData.append("file", {
      uri: fileUri,
      type: fileType,
      name: fileName,
    } as any);

    // Cloudinary upload preset (unsigned upload)
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folder);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary upload error:", errorData);
      throw new Error(errorData.error?.message || "Failed to upload image");
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
