import { Toaster } from 'sonner';
import SearchBar from './components/SearchBar/SearchBar';

import './index.css';

function App() {
  return (
    <>
      <Toaster position='top-right' />
      <main className='container'>
        <div className='content-wrapper'>
          <SearchBar />
        </div>
      </main>
    </>
  );
}

export default App;
