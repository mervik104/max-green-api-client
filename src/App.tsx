import { useAppScreen } from './app/app-machine'
import { AuthPage } from './pages/AuthPage'
import { ChatPage } from './pages/ChatPage'
import { NewChatPage } from './pages/NewChatPage'

function App() {
  const screen = useAppScreen()

  switch (screen) {
    case 'auth':
      return <AuthPage />
    case 'contact':
      return <NewChatPage />
    case 'chat':
      return <ChatPage />
  }
}

export default App
