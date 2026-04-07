import Game from "./Game.js";
import "./App.css";
import Preloader from "./Preloader.js";

function App() {
  return (
    <div className="App">
      <Preloader />
      <header className="App-header">{Game()}</header>
    </div>
  );
}

export default App;
