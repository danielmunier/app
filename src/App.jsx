import { useEffect, useState } from 'react'
import './App.css'
import StarryBackground from './components/Background'
import TitleBar from './components/TitleBar'

function App() {
  const [version, setVersion] = useState("")
   useEffect(() => {
    window.require("electron").ipcRenderer.invoke("get-app-version").then((v) => {
      setVersion(v);
    });
  }, []);
  return (
    <div style={{
      width: "100%",
      height: "100vh",
      position: "relative",
      overflow: "hidden"
    }}>
      <StarryBackground />
      <TitleBar />

      {/* Área de conteúdo que vai rolar */}
      <main
        className='main-app'
        style={{
          position: "absolute",
          top: "30px", // começa logo abaixo do titlebar
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          color: "white",
          textAlign: "center",
          padding: "20px",
          overflowY: "auto",   // habilita scroll apenas nesta área
        }}
      >
         <div style={{ position: "fixed", bottom: 10, right: 10, color: "#888", fontSize: 12 }}>
      v{version}
    </div>
        <div>
          <div>

          </div>

          <section 
          
          >

          </section>


        </div>
      </main>
    </div>
  )
}

export default App
