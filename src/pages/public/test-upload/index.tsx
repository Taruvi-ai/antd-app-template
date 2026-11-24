import { useState } from "react";
import { Alert, Button, Card, Col, Flex, Image, Input, Row, Typography } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import { uploadFile, getStorageUrl } from "../../../utils/storageHelpers";

const BUCKET = "test-uploads";

export const TestUploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const path = await uploadFile(BUCKET, selectedFile, { prefix: "test" });
      setUploadedPath(path);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const imageUrl = uploadedPath ? getStorageUrl(BUCKET, uploadedPath) : null;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 16px" }}>
      <Typography.Title level={1} style={{ textAlign: "center" }}>
        File Upload Test
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ textAlign: "center", marginBottom: 32 }}>
        Test the storage helper utilities
      </Typography.Paragraph>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Upload Image" style={{ height: "100%" }}>
            <Flex vertical gap={16}>
              <Input
                aria-label="Image title"
                placeholder="Image title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div>
                <Button
                  block
                  icon={<CloudUploadOutlined />}
                  onClick={() => document.getElementById("test-upload-input")?.click()}
                  style={{ borderStyle: "dashed", height: 48 }}
                >
                  {selectedFile ? selectedFile.name : "Choose File"}
                </Button>
                <input
                  id="test-upload-input"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Size: {(selectedFile.size / 1024).toFixed(2)} KB
                  </Typography.Text>
                )}
              </div>

              <Button
                type="primary"
                block
                onClick={handleUpload}
                disabled={!selectedFile}
                loading={uploading}
              >
                {uploading ? "Uploading..." : "Upload File"}
              </Button>

              {error && <Alert type="error" message={error} closable onClose={() => setError("")} />}
              {uploadedPath && !uploading && (
                <Alert
                  type="success"
                  message={
                    <>
                      Upload successful! Path: <code>{uploadedPath}</code>
                    </>
                  }
                />
              )}
            </Flex>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Preview" style={{ height: "100%" }}>
            {imageUrl ? (
              <Flex vertical gap={12}>
                <Image src={imageUrl} alt={title || "Uploaded image"} style={{ maxHeight: 400, objectFit: "contain" }} />
                <Typography.Text strong>File path</Typography.Text>
                <Typography.Text code copyable style={{ wordBreak: "break-all" }}>{uploadedPath}</Typography.Text>
                <Typography.Text strong>Storage URL</Typography.Text>
                <Typography.Text code copyable style={{ wordBreak: "break-all" }}>{imageUrl}</Typography.Text>
              </Flex>
            ) : (
              <Flex vertical align="center" gap={8} style={{ padding: 32 }}>
                <CloudUploadOutlined style={{ fontSize: 48, opacity: 0.4 }} />
                <Typography.Text type="secondary">No file uploaded yet</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Upload an image to see the preview
                </Typography.Text>
              </Flex>
            )}
          </Card>
        </Col>

        <Col span={24}>
          <Card title="How it works">
            <Typography.Paragraph type="secondary">
              This page demonstrates the helpers in <code>src/utils/storageHelpers.ts</code>:
            </Typography.Paragraph>
            <ol>
              <li>Select an image file</li>
              <li>Click "Upload File" — calls <code>uploadFile(bucket, file, options)</code></li>
              <li>The file is uploaded to the <code>{BUCKET}</code> bucket and its path is returned</li>
              <li>The URL is generated with <code>getStorageUrl(bucket, path)</code> and previewed</li>
            </ol>
            <Alert
              type="info"
              message={
                <>
                  Make sure the <code>{BUCKET}</code> bucket exists. Create it with:{" "}
                  <code>{`mcp__taruvi__create_bucket({name: "${BUCKET}", visibility: "public"})`}</code>
                </>
              }
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
