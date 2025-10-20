import { useEffect, useRef } from "react";

export default function Draw() {
  const webviewRef = useRef(null);

  useEffect(() => {
    const webview = webviewRef.current;

    if (webview) {
      webview.addEventListener("did-finish-load", () => {
        console.log(" ChatGPT carregado!");
      });
    }

    return () => {
      if (webview) webview.removeEventListener("did-finish-load", () => {});
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <webview
        ref={webviewRef}
        src="https://excalidraw.com/"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
