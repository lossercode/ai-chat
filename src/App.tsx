import { Button } from 'antd';
import './App.css'
import MainContent from './components/content';
import SiderComponent from './components/sider';

function App() {

  return (
    <div className='w-screen h-screen flex'>
      <div className='sm:w-0 md:w-xs lg:w-xs h-full bg-[#f3f4f6] border-r border-gray-200'>
        <SiderComponent /> 
      </div>
      <div className='h-full bg-white flex-1 pt-16'>
        <MainContent />
      </div>
    </div>
  )
}

export default App
