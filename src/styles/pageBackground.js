export const cinematicPageStyle = {
  minHeight: "100vh",
  backgroundImage: "url('/studio-bg.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "relative",
  color: "#fff",
  overflow: "hidden",
};

export const cinematicOverlayStyle = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.56) 100%)",
};

export const cinematicWrapStyle = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: 1280,
  margin: "0 auto",
  padding: "110px 24px 40px",
  boxSizing: "border-box",
};

export const cinematicCardStyle = {
  borderRadius: 28,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10,10,10,0.34)",
  boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
  backdropFilter: "blur(10px)",
  boxSizing: "border-box",
};