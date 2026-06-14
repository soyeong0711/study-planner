import Image from "next/image";

export default function Home() {
  return (
    <main
      style={{
        margin: 0,
        height: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        src="/woolini.gif"
        alt="Woolini"
        width={300}
        height={276}
        unoptimized
        priority
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          height: "auto",
          width: "auto",
        }}
      />
    </main>
  );
}
