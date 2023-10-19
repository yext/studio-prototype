import { useEffect } from "react";
import useStudioStore from "../store/useStudioStore";

export default function useInjectUserStyles(
  iframeDocument: Document | undefined
) {
  const [
    componentTree,
    getComponentMetadata,
    UUIDToFileMetadata,
    pageCss,
  ] = useStudioStore((store) => [
    store.actions.getComponentTree(),
    store.actions.getComponentMetadata,
    store.fileMetadatas.UUIDToFileMetadata,
    store.pages.getActivePageState()?.cssImports,
  ]);
  useEffect(() => {
    if (!iframeDocument) {
      return;
    }
    componentTree?.forEach((component) => {
      const cssImports = getComponentMetadata(component)?.cssImports;
      cssImports?.forEach((cssFilepath) => {
        injectStyleIntoIframe(iframeDocument, cssFilepath);
      });
    });
    pageCss?.forEach((cssFilepath) => {
      injectStyleIntoIframe(iframeDocument, cssFilepath);
    });

    return () => {
      clearStylingFromIframe(iframeDocument);
    };
  }, [
    componentTree,
    getComponentMetadata,
    iframeDocument,
    pageCss,
    UUIDToFileMetadata,
  ]);
}

function clearStylingFromIframe(iframeDocument: Document) {
  const styleElements = [...iframeDocument.head.getElementsByTagName("style")];
  styleElements.forEach((element) => {
    element.remove();
  });
}

function injectStyleIntoIframe(iframeDocument: Document, filepath: string) {
  const styletagIdAttribute = `[studio-style-filepath='${filepath}']`;
  const originalStyletag = document.querySelector(styletagIdAttribute);
  const oldIframeStyletag = iframeDocument.querySelector(styletagIdAttribute);

  if (originalStyletag && !oldIframeStyletag) {
    const iframeStyletag = originalStyletag.cloneNode(true);
    iframeDocument.head.appendChild(iframeStyletag);
  }
}
