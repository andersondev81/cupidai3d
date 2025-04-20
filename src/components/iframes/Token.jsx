import React from "react"

const TokenPage = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "130px",
        backgroundColor: "#d60073",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Open Sans', sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          backgroundColor: "#d60073",
          padding: "15px 30px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#d60073",
            textAlign: "center",
            margin: 0,
          }}
        >
          Cupid Token
        </h1>
      </div>

      {/* Bottom "Receipt" and "Card" sections */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          height: "50px",
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: "#d60073",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        ></div>
        <div
          style={{
            flex: 1,
            backgroundColor: "#d60073",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        ></div>
      </div>
    </div>
  )
}

export default TokenPage
