"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSpring } from "@react-spring/web";
import { addOptimisticDocument } from "@/features/documents/hooks/use-documents";
import { UploadOrbitRing } from "./upload-zone/upload-orbit-ring";
import { UploadBackgroundOrb } from "./upload-zone/upload-background-orb";
import { UploadCoreContent, UploadState } from "./upload-zone/upload-core-content";

export function AtmosphericUploadZone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Pointer-reactive tilt offset
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [pillOffset, setPillOffset] = useState({ x: 0, y: 0 });
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  // Monitor prefers-reduced-motion
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mql.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      if (e.matches) {
        setMousePos({ x: 0, y: 0 });
        setPillOffset({ x: 0, y: 0 });
      }
    };
    mql.addEventListener("change", handler);
    return () => {
      mql.removeEventListener("change", handler);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  // Spring scale for 3D orb
  const { orbScale } = useSpring({
    orbScale: uploadState === "dragging" ? 1.25 : isHovered ? 1.16 : 1.08,
    config: {
      tension: 50,
      friction: 10,
      precision: 0.001,
    },
  });

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (reducedMotionRef.current) return;
    if (containerRef.current) {
      rectRef.current = containerRef.current.getBoundingClientRect();
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current) return;
    if (!rectRef.current && containerRef.current) {
      rectRef.current = containerRef.current.getBoundingClientRect();
    }
    const rect = rectRef.current;
    if (!rect) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      // Normalized delta: -0.5 to +0.5
      const nx = (clientX - rect.left) / rect.width - 0.5;
      const ny = (clientY - rect.top) / rect.height - 0.5;

      // Dropzone button tilt (subtle 5px max)
      setMousePos({ x: nx * 5, y: ny * 5 });

      // Raw viewport coords for per-pill repulsion
      setPillOffset({ x: clientX, y: clientY });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    rectRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setMousePos({ x: 0, y: 0 });
    setPillOffset({ x: 0, y: 0 });
  }, []);

  const resetState = () => {
    setUploadState("idle");
    setProgress(0);
    setErrorMessage(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF documents are supported.");
      setUploadState("error");
      return;
    }

    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage("File exceeds 10 MB limit.");
      setUploadState("error");
      return;
    }

    setFileName(file.name);
    setUploadState("uploading");
    setProgress(5);
    setErrorMessage(null);

    try {
      const urlRes = await fetch("/api/documents/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          fileSize: file.size,
        }),
      });

      if (!urlRes.ok) {
        let errDetail = "Failed to prepare upload";
        try {
          const errData = await urlRes.json();
          if (errData.error) errDetail = errData.error;
        } catch {
          // ignore
        }
        throw new Error(errDetail);
      }

      const { documentId: docId, signedUrl } = await urlRes.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgress(Math.min(percent, 98));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Storage error (${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.ontimeout = () => reject(new Error("Upload timed out"));

        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", "application/pdf");
        xhr.send(file);
      });

      setProgress(100);
      setUploadState("success");

      const now = new Date().toISOString();
      addOptimisticDocument({
        id: docId,
        userId: "",
        filename: "",
        originalName: file.name,
        fileUrl: "",
        fileSize: file.size,
        pageCount: 0,
        chunkCount: 0,
        status: "UPLOADING",
        processingProgress: 0,
        error: null,
        createdAt: now,
        updatedAt: now,
      });

      setTimeout(() => {
        router.push(`/conversation?doc=${docId}`);
      }, 1200);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Upload failed");
      setUploadState("error");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (uploadState !== "uploading" && uploadState !== "success") {
      setUploadState("dragging");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (uploadState === "dragging") {
      setUploadState("idle");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (uploadState === "uploading" || uploadState === "success") return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    } else {
      setUploadState("idle");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const triggerUploadClick = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    if (uploadState === "uploading" || uploadState === "success") return;
    fileInputRef.current?.click();
  };

  const isDragging = uploadState === "dragging";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[500px] aspect-[500/440] mx-auto select-none flex items-center justify-center"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* 1. Subtle Dotted Orbit Ring & Secondary Badges */}
      <UploadOrbitRing
        onTriggerUpload={triggerUploadClick}
        mousePos={mousePos}
        pillOffset={pillOffset}
        isHovered={isHovered}
      />

      {/* 2. Layer 1: Atmospheric Outer Bloom + 3D GLSL Gradient Orb */}
      <UploadBackgroundOrb mousePos={mousePos} isHovered={isHovered} orbScale={orbScale} />

      {/* 3. Layer 2: Main Dropzone Container & Centered Core Content */}
      <div
        role="button"
        tabIndex={0}
        onClick={triggerUploadClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerUploadClick(e);
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          transform: reducedMotionRef.current
            ? "none"
            : `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) scale(${isDragging ? 1.025 : isHovered ? 1.01 : 1})`,
          transition: reducedMotionRef.current ? "none" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: (isHovered || isDragging) && !reducedMotionRef.current ? "transform" : "auto",
        }}
        className={`relative z-10 w-[92%] sm:w-[94%] aspect-[460/390] flex items-center justify-center cursor-pointer transition-shadow duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 rounded-[42px] ${
          isDragging ? "cursor-copy" : ""
        }`}
      >
        <UploadCoreContent
          uploadState={uploadState}
          isHovered={isHovered}
          isDragging={isDragging}
          fileName={fileName}
          progress={progress}
          errorMessage={errorMessage}
          onTriggerUpload={triggerUploadClick}
          onReset={resetState}
        />
      </div>
    </div>
  );
}
