import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#064e3b",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "#f7f5ef",
            borderRadius: 128,
            boxShadow: "0 28px 70px rgba(2, 44, 34, 0.28)",
            display: "flex",
            height: 372,
            justifyContent: "center",
            position: "relative",
            width: 372,
          }}
        >
          <div
            style={{
              color: "#064e3b",
              display: "flex",
              fontFamily: "Arial, sans-serif",
              fontSize: 222,
              fontWeight: 800,
              letterSpacing: -20,
              lineHeight: 1,
              marginLeft: -14,
            }}
          >
            FF
          </div>
          <div
            style={{
              background: "#f59e0b",
              borderRadius: 999,
              display: "flex",
              height: 42,
              position: "absolute",
              right: 62,
              top: 58,
              width: 42,
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
