import './App.css'
import StarryBackground from './components/Background'
import TitleBar from './components/TitleBar'

function App() {
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
