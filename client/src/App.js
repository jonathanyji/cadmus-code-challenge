import logo from './logo.svg';
import './App.css';
import NotesComponent from './components/notes-component';

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      App.js Start
      <NotesComponent/>
      App.js end
    </div>
  );
}

export default App;
