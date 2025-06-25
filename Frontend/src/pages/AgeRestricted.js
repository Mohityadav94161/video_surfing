"use client"

import { Button } from "antd"
import { VideoCameraOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

const AgeRestricted = () => {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <VideoCameraOutlined style={{ fontSize: "80px", color: "#ff1493", marginBottom: "30px" }} />

      <h1 style={{ color: "#ff1493", fontSize: "32px", marginBottom: "20px", fontWeight: "bold" }}>XFansTube</h1>

      <p style={{ color: "white", fontSize: "18px", maxWidth: "500px", lineHeight: "1.6" }}>
        This website is only intended for users over the age of 18
      </p>

      <Button
        type="primary"
        onClick={() => window.close()}
        style={{
          backgroundColor: "#ff1493",
          borderColor: "#ff1493",
          marginTop: "30px",
          padding: "10px 30px",
          height: "auto",
          fontSize: "16px",
        }}
      >
        Close Window
      </Button>
    </div>
  )
}

export default AgeRestricted
