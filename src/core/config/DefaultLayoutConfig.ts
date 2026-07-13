import LayoutConfigTypes from "@/core/config/LayoutConfigTypes";

const config: LayoutConfigTypes = {
  themeName: "SWSDF Platform",
  themeVersion: "8.0.38",
  demo: "SWSDF Platform",
  main: {
    type: "default",
    primaryColor: "#009EF7",
    logo: {
      dark: "platform/media/logos/swsdf-logo-symbol-white.png",
      light: "platform/media/logos/swsdf-logo-symbol.png",
    },
  },
  illustrations: {
    set: "sketchy-1",
  },

  loader: {
    logo: "platform/media/logos/swsdf-logo-symbol.png",
    display: true,
    type: "spinner-logo", 
  },

  scrollTop: {
    display: true,
  },

  header: {
    display: true,
    menuIcon: "font",
    width: "fixed",
    fixed: {
      desktop: true,
      tabletAndMobile: true,
    },
  },
  toolbar: {
    display: true,
    width: "fixed",
    fixed: {
      desktop: true,
      tabletAndMobile: true,
    },
  },
  aside: {
    display: false,
    theme: "dark",
    fixed: true,
    menuIcon: "svg",
    minimized: false,
    minimize: true,
    hoverable: true,
  },
  content: {
    width: "fixed",
  },
  footer: {
    width: "fixed",
  },
};

export default config;
