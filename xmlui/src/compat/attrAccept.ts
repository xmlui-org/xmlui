export default function attrAccept(file: File, acceptedFiles?: string | string[]): boolean {
  if (!file || !acceptedFiles) {
    return true;
  }

  const acceptedFilesArray = Array.isArray(acceptedFiles)
    ? acceptedFiles
    : acceptedFiles.split(",");

  if (acceptedFilesArray.length === 0) {
    return true;
  }

  const fileName = file.name || "";
  const mimeType = (file.type || "").toLowerCase();
  const baseMimeType = mimeType.replace(/\/.*$/, "");

  return acceptedFilesArray.some((type) => {
    const validType = type.trim().toLowerCase();

    if (validType.charAt(0) === ".") {
      return fileName.toLowerCase().endsWith(validType);
    }
    if (validType.endsWith("/*")) {
      return baseMimeType === validType.replace(/\/.*$/, "");
    }

    return mimeType === validType;
  });
}
