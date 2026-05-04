import { Toaster } from 'sonner';
import SearchBar from './components/SearchBar/SearchBar';
import SearchResults from './components/SearchResults/SearchResults';

import './index.css';

function App() {
  return (
    <>
      <Toaster position='top-right' />
      <main className='container'>
        <div className='content-wrapper'>
          <SearchBar />
          <SearchResults />
        </div>
      </main>
    </>
  );
}

export default App;
