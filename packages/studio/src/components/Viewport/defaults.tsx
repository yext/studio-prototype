export interface Viewport {
  name: string;
  styles: { height: number; width: number } | null;
  type: "desktop" | "mobile" | "tablet" | "other";
  css: string;
}

export interface ViewportStyles {
  name: string;
  height: number;
  width: number;
}

export interface ViewportMap {
  [key: string]: Viewport;
}

export const EXPANDED_VIEWPORTS: ViewportMap = {
  resetviewport: {
    name: "Reset Viewport",
    styles: null,
    type: "other",
    css: "h-full w-full",
  },
  iphonese: {
    name: "iPhone SE",
    styles: {
      height: 667,
      width: 375,
    },
    type: "mobile",
    css: "aspect-[375/667]",
  },
  iphone14: {
    name: "iPhone 14",
    styles: {
      height: 844,
      width: 390,
    },
    type: "mobile",
    css: "aspect-[390/844]",
  },
  galaxyzflip5folded: {
    name: "Galaxy Z Flip5 Folded",
    styles: {
      height: 748,
      width: 720,
    },
    type: "mobile",
    css: "aspect-[720/748]",
  },
  galaxyzflip5unfolded: {
    name: "Galaxy Z Flip5 Unfolded",
    styles: {
      height: 1760,
      width: 720,
    },
    type: "mobile",
    css: "aspect-[720/1760]",
  },
  pixel7: {
    name: "Pixel 7",
    styles: {
      height: 800,
      width: 360,
    },
    type: "mobile",
    css: "aspect-[360/800]",
  },
  pixelfoldfolded: {
    name: "Pixel Fold Folded",
    styles: {
      height: 720,
      width: 372,
    },
    type: "mobile",
    css: "aspect-[372/720]",
  },
  pixelfoldunfolded: {
    name: "Pixel Fold Unfolded",
    styles: {
      height: 720,
      width: 600,
    },
    type: "mobile",
    css: "aspect-[600/720]",
  },
};

export const MINIMAL_VIEWPORTS: ViewportMap = {
  resetviewport: {
    name: "Reset Viewport",
    styles: null,
    type: "other",
    css: "h-full w-full",
  },
  mobile1: {
    name: "Small Mobile",
    styles: {
      height: 568,
      width: 320,
    },
    type: "mobile",
    css: "aspect-[320/568]",
  },
  mobile2: {
    name: "Large Mobile",
    styles: {
      height: 896,
      width: 414,
    },
    type: "mobile",
    css: "aspect-[414/896]",
  },
  tablet: {
    name: "Tablet",
    styles: {
      height: 1112,
      width: 834,
    },
    type: "tablet",
    css: "aspect-[834/1112]",
  },
};
