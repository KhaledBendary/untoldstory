
const testImageUrl = "https://api.globaluntoldstory.com/api/public/storage/media/2026/07/1783361393_Apache_Corporate_Production_Egypt_Image_01.png";

console.log("Testing image URL:", testImageUrl);

fetch(testImageUrl)
  .then((res) => {
    console.log("Response status:", res.status, res.statusText);
    console.log("Response headers:", Object.fromEntries(res.headers.entries()));
    return res.arrayBuffer();
  })
  .then((buffer) => {
    console.log("Image loaded successfully! Size:", buffer.byteLength, "bytes");
  })
  .catch((err) => {
    console.error("Error loading image:", err);
  });
